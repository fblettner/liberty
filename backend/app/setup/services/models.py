import logging
logger = logging.getLogger(__name__)

from collections import defaultdict, deque
import os
import re
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.automap import automap_base
from app.setup.models import get_models_path
from app.config import get_db_properties_path
from app.controllers.api_controller import ApiController   
    
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
       
    def to_valid_class_name(self, table_name):
        """Convert table name to a valid class name."""
        # Handle special characters explicitly
        table_name = table_name.replace("$", "_Dollar")  # Replace `$` uniquely
        # Replace remaining invalid characters
        table_name = re.sub(r'[^a-zA-Z0-9]', '_', table_name)
        # Convert to PascalCase (CamelCase with first letter capitalized)
        class_name = ''.join(word.capitalize() for word in table_name.split('_'))

        return class_name

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

        # Start writing to `models.py`
        model_content = """\"\"\"Auto-generated SQLAlchemy models.\"\"\"\n
from sqlalchemy import BOOLEAN, INTEGER, TEXT, TIMESTAMP, VARCHAR, BIGINT, DATE, REAL, Column, Integer, String, ForeignKey, Boolean, DateTime, Float, Text, ForeignKeyConstraint, Index, UniqueConstraint
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
            existing_fks = inspector.get_foreign_keys(table_name)
            index_definitions = []

            # Extract and define columns
            for column in table.__table__.columns:
                column_name = column.name
                column_type = column.type
                nullable = column.nullable
                primary_key = column.primary_key

                # Check for Foreign Keys
                foreign_keys = list(column.foreign_keys)

                on_delete_action = None
                if foreign_keys:
                    referenced_table = foreign_keys[0].column.table.name
                    referenced_column = foreign_keys[0].column.name

                    fk_name = None
                    for fk in existing_fks:
                        if column_name in fk["constrained_columns"] and referenced_column in fk["referred_columns"]:
                            fk_name = fk["name"]
                            on_delete_action = fk.get("options", {}).get("ondelete", None)
                            
                            break  # Stop searching once FK is found

                    # Store composite foreign key references
                    foreign_key_constraints.append((column_name, referenced_table, referenced_column, fk_name, on_delete_action))
                
                # Generate column definition
                column_def = f"    {column_name} = Column({column_type}, primary_key={primary_key}, nullable={nullable}"
                column_def += ")"
                
                column_definitions.append(column_def)

            # Add Columns
            table_definitions[class_name] += "\n".join(column_definitions) + "\n"

            # Extract Indexes for the Table
            table_indexes = inspector.get_indexes(table_name)
            if table_indexes:
                index_def = "    __table_args__ = (\n"
                for idx in table_indexes:
                    index_name = idx["name"]
                    index_columns = ", ".join(f'"{col}"' for col in idx["column_names"])
                    is_unique = idx.get("unique", False)  # Detect if index is unique

                    # If index is unique, use UniqueConstraint, otherwise use Index()
                    if is_unique:
                        index_def += f'        UniqueConstraint({index_columns}, name="{index_name}"),\n'
                    else:
                        index_def += f'        Index("{index_name}", {index_columns}),\n'
                
                index_def += "    )\n"
                index_definitions.append(index_def)

            # Add Index Definitions (after Columns but before Relationships)
            if index_definitions:
                table_definitions[class_name] += "\n".join(index_definitions) + "\n"

            # Handle Composite Foreign Keys Correctly
            if foreign_key_constraints:
                composite_fk_def = "    __table_args__ = (\n"
                fk_groups = defaultdict(list)

                for col_name, ref_table, ref_col, fk_name, on_delete_action in foreign_key_constraints:
                    fk_groups[ref_table].append((col_name, ref_col, fk_name, on_delete_action))

                for ref_table, fk_columns in fk_groups.items():
                    # Match the exact order from the database
                    db_fk = next(fk for fk in existing_fks if fk["referred_table"] == ref_table)
                    ordered_columns = list(zip(db_fk["constrained_columns"], db_fk["referred_columns"]))

                    col_names = ", ".join(f'"{col}"' for col, _ in ordered_columns)
                    ref_cols = ", ".join(f'"{ref_table}.{ref_col}"' for _, ref_col in ordered_columns)
                    fk_name = fk_columns[0][2]  # Use existing FK name from database
                    fk_on_delete = fk_columns[0][3]  # Extract on_delete behavior

                    fk_on_delete_clause = f', ondelete="{fk_on_delete}"' if fk_on_delete else ""
                    composite_fk_def += f'        ForeignKeyConstraint([{col_names}], [{ref_cols}], name="{fk_name}"{fk_on_delete_clause}),\n'

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
        models_file = get_models_path(self.database)
        with open(models_file, "w", encoding="utf-8") as file:
            file.write(model_content)

        logging.debug(f"Models have been successfully written to {models_file}")

