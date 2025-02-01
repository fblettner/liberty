import logging

from backend.app.config import get_db_properties_path
from backend.app.controllers.api_controller import ApiController
logger = logging.getLogger(__name__)

from collections import defaultdict, deque
import os
import re
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.automap import automap_base
from backend.app.setup.models.models import get_models_path
   
    
class Models:
    def __init__(self, apiController: ApiController, database):
        db_properties_path = get_db_properties_path()
        config = apiController.queryRest.load_db_properties(db_properties_path)
        self.database = database
        # Database configuration
        DATABASE_URL = f"postgresql+psycopg2://{database}:{config["password"]}@{config["host"]}:{config["port"]}/{database}"

        try:
            self.engine = create_engine(DATABASE_URL, echo=False)
            self.Base = automap_base()
        except Exception as e:
            logging.error(f"Error connecting to database: {str(e)}")
            raise e

    def fetch_materialized_views(self):
        """Retrieve materialized views from PostgreSQL."""
        with self.engine.connect() as conn:
            result = conn.execute(text("SELECT matviewname FROM pg_matviews"))
            return [row[0] for row in result.scalars().all()]

    def fetch_stored_procedures(self):
        """Retrieve stored procedures from PostgreSQL."""
        with self.engine.connect() as conn:
            result = conn.execute(
                text(
                    """
                    SELECT nspname, proname 
                    FROM pg_proc 
                    JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
                    WHERE nspname NOT IN ('pg_catalog', 'information_schema')
                    """
                )
            )
            return [(row[0], row[1]) for row in result.fetchall()]  # Return schema + procedure name
        
    def to_valid_class_name(self, table_name):
        """Convert table name to a valid class name."""
        table_name = re.sub(r'[^a-zA-Z0-9]', '_', table_name)  # Replace invalid characters
        return ''.join(word.capitalize() for word in table_name.split('_'))  # PascalCase

    def get_table_dependencies(self, inspector):
        """Build a dependency map where each table lists the tables it depends on (foreign keys)."""
        dependencies = defaultdict(set)

        for table_name in inspector.get_table_names():
            fks = inspector.get_foreign_keys(table_name)
            for fk in fks:
                dependencies[table_name].add(fk["referred_table"])

        return dependencies

    def topological_sort_tables(self, dependencies, tables):
        """
        Sort tables in an order where parent tables (referenced) are defined before child tables.
        Uses **Kahn's Algorithm** (topological sorting).
        """
        sorted_tables = {}
        remaining_tables = set(tables.keys())
        in_degree = {table: 0 for table in remaining_tables}

        # Calculate in-degrees (how many tables reference this table)
        for table, refs in dependencies.items():
            for ref in refs:
                if ref in in_degree:
                    in_degree[ref] += 1

        # Start with tables that have no incoming references
        queue = deque([table for table in remaining_tables if in_degree[table] == 0])

        while queue:
            table = queue.popleft()
            sorted_tables[table] = tables[table]
            remaining_tables.remove(table)

            # Reduce the in-degree of dependent tables
            for ref in dependencies[table]:
                if ref in in_degree:
                    in_degree[ref] -= 1
                    if in_degree[ref] == 0:
                        queue.append(ref)

        # Append any remaining base tables that have no references
        for table in remaining_tables:
            sorted_tables[table] = tables[table]

        return sorted_tables
       

    def create_model(self):
        """Reflect DB schema, extract metadata, and generate ORM models in the correct order."""

        # Reflect schema synchronously
        self.Base.prepare(autoload_with=self.engine)
        inspector = inspect(self.engine)

        # Extract table names and dependencies
        tables = {table_name: table_class for table_name, table_class in self.Base.classes.items()}
        dependencies = self.get_table_dependencies(inspector)

        # Sort tables properly (ensuring referenced tables appear before dependent tables)
        sorted_table_objects = self.topological_sort_tables(dependencies, tables)

        # Fetch Materialized Views & Stored Procedures
        materialized_views = self.fetch_materialized_views()
        stored_procedures = self.fetch_stored_procedures()

        # Start writing to `models.py`
        model_content = """\"\"\"Auto-generated SQLAlchemy models.\"\"\"\n
from sqlalchemy import BOOLEAN, INTEGER, TEXT, TIMESTAMP, VARCHAR, BIGINT, DATE, REAL, Column, Integer, String, ForeignKey, Boolean, DateTime, Float, Text, ForeignKeyConstraint
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()\n\n"""

        # Ensure referenced tables are written first
        table_definitions = {}

        for table_name, table in sorted_table_objects.items():
            class_name = self.to_valid_class_name(table_name)
            table_definitions[class_name] = f"class {class_name}(Base):\n"
            table_definitions[class_name] += f"    __tablename__ = '{table_name}'\n"

            column_definitions = []
            foreign_key_constraints = []
            relationships = []

            # Extract and define columns
            for column in table.__table__.columns:
                column_name = column.name
                column_type = column.type
                nullable = column.nullable
                primary_key = column.primary_key

                # Check for Foreign Keys
                foreign_keys = list(column.foreign_keys)
                if foreign_keys:
                    referenced_table = foreign_keys[0].column.table.name
                    referenced_class = self.to_valid_class_name(referenced_table)
                    referenced_column = foreign_keys[0].column.name

                    # Store composite foreign key references
                    foreign_key_constraints.append((column_name, referenced_table, referenced_column))

                # Generate column definition
                column_definitions.append(
                    f"    {column_name} = Column({column_type}, primary_key={primary_key}, nullable={nullable})"
                )

            # Add Columns
            table_definitions[class_name] += "\n".join(column_definitions) + "\n"

            # Handle Composite Foreign Keys Correctly
            if foreign_key_constraints:
                composite_fk_def = "    __table_args__ = (\n"
                fk_groups = defaultdict(list)
                for col_name, ref_table, ref_col in foreign_key_constraints:
                    fk_groups[ref_table].append((col_name, ref_col))

                for ref_table, fk_columns in fk_groups.items():
                    col_names = ", ".join(f'"{col}"' for col, _ in fk_columns)
                    ref_cols = ", ".join(f'"{ref_table}.{ref_col}"' for _, ref_col in fk_columns)
                    composite_fk_def += f"        ForeignKeyConstraint([{col_names}], [{ref_cols}]),\n"

                composite_fk_def += "    )\n"
                table_definitions[class_name] += composite_fk_def

            # Add Relationships
            for fk in inspector.get_foreign_keys(table_name):
                parent_table = fk["referred_table"]
                parent_class = self.to_valid_class_name(parent_table)
                relationships.append(f"    {parent_class.lower()}_rel = relationship('{parent_table}')")

            if relationships:
                table_definitions[class_name] += "\n".join(relationships) + "\n"

            table_definitions[class_name] += "\n\n"

        # Ensure tables are written in correct order
        for class_name in sorted(table_definitions.keys()):
            model_content += table_definitions[class_name]

        # Write to models.py
        models_file = os.path.join(os.path.dirname(__file__), f"{get_models_path()}/{self.database}.py")
        with open(models_file, "w", encoding="utf-8") as file:
            file.write(model_content)

        logging.warning(f"Models have been successfully written to {models_file}")

