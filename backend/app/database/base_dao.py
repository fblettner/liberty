import logging
logger = logging.getLogger(__name__)

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from datetime import datetime, date
from typing import Any, Dict, List, Optional
from sqlalchemy import text
import re
from abc import abstractmethod
import json
from app.business.postgres import PostgresQuery

class BaseDAO:
    def __init__(self, config: dict):
        self.config = config
        self.engine = None
        self.async_session = None

    
    @abstractmethod
    async def create_engine(self):
        """
        Create a database engine. Must be implemented by subclasses.
        """
        pass

    def init_session(self):
        """
        Initialize the async session maker using the engine.
        """
        if not self.engine:
            raise ValueError("Engine must be created before initializing the session.")
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

    def get_session(self) -> AsyncSession:
        """
        Get an AsyncSession instance.
        """
        return self.async_session()

    def construct_query(self, target_query, columns: bool):
        """
        Build SQL Query. Must be implemented by subclasses.
        """
        pass


    async def get_column_type(self, column_name: str) -> str:
        """
        Return column type. Must be implemented by subclasses.
        """
        pass    

    def replace_schema_placeholders(self, query: str, schemas: List[Dict[str, str]]) -> str:
        """
        Replace placeholders (e.g., #SCHEMA.PLACEHOLDER#) in the query with actual values.

        Args:
            query (str): The SQL query containing placeholders.
            replacements (List[Tuple[int, str, str]]): A list of tuples where each tuple contains:
                - id (int): An identifier (not used in this implementation).
                - placeholder (str): The placeholder in the query to replace.
                - value (str): The value to replace the placeholder with.

        Returns:
            str: The updated query with placeholders replaced by actual values.
        """
        for _, placeholder, value in schemas:
            regex = re.compile(rf"#SCHEMA\.{re.escape(placeholder)}#", re.IGNORECASE)
            query = regex.sub(value, query)
        return query

    async def construct_query_where(self, query: str, where: List[Dict[str, str]]) -> str:
        """
        Construct where clause with column type. Must be implemented by subclasses.
        """
        pass          
     
    def construct_offset(self, query, context: Dict[str, str]):
        """
        Construct offset and limit for the query. Must be implemented by subclasses.
        """
        pass
    
    async def check_audit_table(self, table_id: str) -> str:
        """
        Check if audit table exists. Must be implemented by subclasses.
        """
        pass

    async def create_audit_table(self, table_id: str) -> str:
        """
        Check if audit table exists. Must be implemented by subclasses.
        """
        pass    
    def insert_audit_table(self, table_id: str, user_id: str) -> str:
        """
        Insert data into audit table. Must be implemented by subclasses.
        """
        pass
    async def get_primary_key(self, table_id: str) -> str:
        """
        Get primary key of the table. Must be implemented by subclasses.
        """
        pass
    async def check_connection(self) -> str:
        """
        Get the current date from database. Must be implemented by subclasses.
        """
        pass

    def get_pool_info(self):
        return {
            "alias": self.config["pool_alias"],                # Alias of the pool
            "status": self.engine.pool.status(),               # Status of the pool
            "active": self.engine.pool.checkedout(),            # Total connections in the pool
            "idle": self.engine.pool.checkedin(),              # Idle connections
            "waiting": self.engine.pool.overflow(),            # Number of waiting connections
            "max": self.engine.pool.size()   # Max allowed connections
        }     

    async def close_pool(self):
        """
        Close all connections in the connection pool and dispose of the engine.
        """
        if self.engine:
            logger.debug("Disposing SQLAlchemy engine and closing connection pool.")
            await self.engine.dispose()  # Dispose of the engine and close all connections
            self.engine = None  # Reset the engine to None
            self.async_session = None  # Reset the sessionmaker to None
                   
    def replace_variables_placeholders(self, query: str, variables: List[Dict[str, str]]) -> str:
        for name, value in variables.items():
            if name != "\r":
                if isinstance(value, (int, float)) or value is not None:
                    # Handle dollar signs and escape single quotes in strings
                    if isinstance(value, str):
                        value = value.replace("$$", "$$$$")
                        value = value.replace("'", "''")

                    # Replace #:VARIABLE# with VALUE
                    regex_string = re.compile(rf"#\:{name}#", re.IGNORECASE)
                    query = regex_string.sub(str(value), query)

                    # Replace :VARIABLE with 'VALUE' or VALUE (based on type)
                    if isinstance(value, str):
                        value = f"'{value}'"
                    regex_string = re.compile(rf"\:{name}\b", re.IGNORECASE)
                    query = regex_string.sub(str(value), query)

        return query



    async def build_query (self, target_query, context, columns: bool):
            try:
                # Query[0][0] : SQL Query 
                # Query[0][1] : Order by clause 
                # Query[0][2] : Pool in case of overriding inside the definition of the query 
                # Add SELECT AND WHERE around the query for filtering 
                query = self.construct_query(target_query, columns)

                if "q" in context:
                    # Create the where clause of the query with the context 
                    where = json.loads(context["q"])
                    query = await self.construct_query_where(query, where)

                if "where" in context:
                    query = self.replace_variables_placeholders(query, context["where"])

                # Add ORDER BY Clause 
                if target_query[0][1] is not None:
                    query += '\nORDER BY ' + target_query[0][1]

                # Offset
                query = self.construct_offset(query, context)
                # Return the query 
                return text(query)
            
            except Exception as err:
                logger.exception(f"Error executing query: {err}")
                import traceback
                traceback.print_exc()  
                raise RuntimeError(f"Query execution failed: {str(err)}")


    async def get_framework_query(self, request: dict, db_type: str = "generic"):
        """
        Get Framework Query from LY_QRY_FMW.
        
        Args:
            request (dict): A dictionary containing 'QUERY' (int) and 'CRUD' (string).
            db_type (str): The database type, default is 'generic'.
        
        Returns:
            list: The result rows from the executed query.
        """
        try:
            query = text(PostgresQuery.get_framework_query())

            # Open a session
            async with self.get_session() as session:
                result = await session.execute(query,
                    {"query_id": int(request.get('QUERY')), "crud": request.get('CRUD'), "db_type": db_type})
            rows = result.fetchall()    
            return rows
        
        except Exception as e:
            logger.exception(f"Error in getFrameworkQuery: {e}")
            import traceback
            traceback.print_exc()  
            raise RuntimeError(f"Query execution failed: {str(e)}")            
                

    async def get_query(self, request: dict, db_type: str = "generic"):
        """
        Fetches a query from LY_QRY_SQL based on the provided request and database type.

        Args:
            request (dict): A dictionary containing the query ID and CRUD operation.
            db_type (str): The database type (default: "generic").

        Returns:
            list: Rows of the query result.
        """
        try:
            query = text(PostgresQuery.get_sql_query())

            # Open a session
            async with self.get_session() as session:
                result = await session.execute(query,
                    {"query_id": int(request.get('QUERY')), "crud": request.get('CRUD'), "db_type": db_type})

            rows = result.fetchall()
            if not rows:
                return []

            # Fetch schema information
            schema_query = text(PostgresQuery.get_schema_list())
            pool = self.config["pool_alias"] if rows[0][2] == "SESSION" else rows[0][2]
            
            # Open a session
            async with self.get_session() as session:
                schema_result = await session.execute(schema_query, {"pool": pool})
                schema_list = schema_result.fetchall()    

            
            # Replace schema placeholders
            updated_query = self.replace_schema_placeholders(
                rows[0][0], schema_list
            )

            updated_rows = []
            for idx, row in enumerate(rows):
                row_list = list(row)  # Convert the row to a list
                if idx == 0:  # Update only the first row
                    row_list[0] = updated_query  # Update the first column
                updated_rows.append(tuple(row_list))  # Convert back to a tuple and append

            return updated_rows

        except Exception as err:
            logger.exception(f"Error executing query: {err}")
            import traceback
            traceback.print_exc()  
            raise RuntimeError(f"Query execution failed: {str(err)}")


    async def get(self, query: str, context, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Executes a query and returns the result along with metadata.

        Args:
            query (str): The SQL query to execute.
            params (Optional[Dict[str, Any]]): Query parameters.

        Returns:
            Dict[str, Any]: A dictionary containing rows, column metadata, and row count.
        """
        try:
            # Use SQLAlchemy's `text` to prepare the query
            statement = await self.build_query(query, context, False)
            if params:
                self.replace_variables_placeholders(query, params)

            # Open a session
            async with self.get_session() as session:
                result = await session.execute(statement)
   
            # Fetch all rows
            rows = result.fetchall()
            processed_rows = []

            if rows:
                # Convert rows to a list of dictionaries with proper types
                processed_rows = [
                    {key.upper(): (value.isoformat() if isinstance(value, (datetime, date)) else value)
                    for key, value in row._mapping.items()}
                    for row in rows
                ]

                # Extract metadata from the first row
                meta_data = [
                    {"name": key.upper(), "type": type(value).__name__ if value is not None else "UNKNOWN"}
                    for key, value in rows[0]._mapping.items()
                ]
            else:
                # No rows: fallback to column names only
                meta_data = [{"name": key.upper(), "type": "UNKNOWN"} for key in result.keys()]

            return {"status": "success", "pool": self.config["pool_alias"], "rows": processed_rows, "rowCount": result.rowcount, "meta_data": meta_data}

        except Exception as e:
            logger.exception(f"Error executing query: {e}")
            import traceback
            traceback.print_exc()  
            raise RuntimeError(f"Query execution failed: {str(e)}")  


    async def post(self, query: str, context) -> int:
        """
        Execute a query for POST (INSERT), PUT (UPDATE), or DELETE operations.

        Args:
            target_query (list): The target query details, where target_query[0][0] contains the SQL string.
            context (dict): The context containing parameters like `body`.

        Returns:
            list: Rows of the query result.
        """
        try:
            # Use SQLAlchemy's `text` to prepare the query
            statement = query[0][0]
            where = context.get("body", {})
            
            for name, value in where.items():
                if name != "\r":
                    # Process value based on its type
                    if isinstance(value, list):
                        # Helper to escape SQL values
                        def escape_sql_value(val):
                            if val is None:
                                return "NULL" if self.config.get("replace_null") != "Y" else "' '"
                            if isinstance(val, str):
                                return f"'{val.replace('\'', '\'\'')}'"
                            return str(val)

                        # Format the array of records
                        def format_values(data):
                            return ", ".join(
                                f"({', '.join(escape_sql_value(record[k]) for k in record if k != 'ROW_ID')})"
                                for record in data
                            )

                        value = format_values(value)

                    elif isinstance(value, (int, float)):
                        pass  # Use the numeric value as-is

                    elif value is None:
                        value = "NULL" if self.config.get("replace_null") != "Y" else "' '" 

                    elif isinstance(value, str):
                        if value == "" and self.config.get("replace_null") == "Y":
                            value = "' '"  # Replace empty string with ' ' if enabled
                        else:
                            value = value.replace("$$", "$$$$")  # Escape dollar signs
                            value = value.replace("'", "''")  # Escape single quotes
                            value = f"'{value}'"  # Wrap in single quotes

                    # Replace #:VARIABLE# with VALUE or 'VALUE'
                    regex_string_hash = re.compile(rf"#\:{name}#", re.IGNORECASE)
                    statement = regex_string_hash.sub(str(value), statement)

                    # Replace :VARIABLE with VALUE or 'VALUE'
                    regex_string_colon = re.compile(rf"\:{name}\b", re.IGNORECASE)
                    statement = regex_string_colon.sub(str(value), statement)


            # Open a session
            async with self.get_session() as session:
                try:
                    async with session.begin():  # Start a transaction
                        result = await session.execute(text(statement))
                        # Commit is implicit in session.begin() if no exception is raised
                        return result.rowcount
                except Exception as e:
                    logger.exception(f"Error executing statement: {e}")
                    import traceback
                    traceback.print_exc()  
                    raise RuntimeError(f"Query execution failed: {str(e)}")  
   
            return result.rowcount

        except Exception as e:
            logger.exception(f"Error executing query: {e}")
            import traceback
            traceback.print_exc()  
            raise RuntimeError(f"Query execution failed: {str(e)}")  


    async def get_metadata(self, query: str, context) -> List[Dict[str, Any]]:
        """
        Executes a query and returns the result metadata (column names and types).

        Args:
            query (str): The SQL query to execute.

        Returns:
            List[Dict[str, Any]]: A list of dictionaries containing column metadata.
        """
        try:
            async with self.get_session() as session:
                # Prepare and execute the query

                statement = await self.build_query(query, context, True)
                if "params" in context and context["params"]:
                    params = json.loads(context["params"])
                    self.replace_variables_placeholders(query, params)

                result = await session.execute(statement)

            meta_data = [{"name": col.upper(), "type": "UNKNOWN"} for col in result.keys()]
            return {"rows": [], "meta_data": meta_data}

        except Exception as e:
            logger.exception(f"Error fetching metadata: {e}")
            import traceback
            traceback.print_exc()  
            raise RuntimeError(f"Query execution failed: {str(e)}")  


    async def audit(self, table_id: str, user_id: str, context: dict):
        """
        Perform an audit by creating an audit table and inserting data.

        Args:
            table_name (str): The name of the table to audit.
            user_id (str): The ID of the user performing the audit.
            context (dict): The context containing the `body` for constructing the query.

        Returns:
            list: Rows of the result from the audit insertion query.
        """

        try:
            check_audit = await self.check_audit_table(table_id)

            if (check_audit[0][0] == 0):
                await self.create_audit_table(table_id)

            statement = await self.insert_audit_table(table_id, user_id)
            if "body" in context and context["body"]:
                where = context.get("body", {})

                # Get primary key to construct WHERE clause
                result_pk =  await self.get_primary_key(table_id)

                statement += f" WHERE {result_pk[0][0]}"

                # Replace placeholders in the query with actual values
                for name, value in where.items():
                    if name != "\r":
                        if isinstance(value, str):
                            if value == "" and self.config.get("replace_null") == "Y":
                                value = "' '"  # Replace empty string with ' ' if enabled
                            else:
                                value = value.replace("$$", "$$$$")  # Escape dollar signs
                                value = value.replace("'", "''")  # Escape single quotes
                                value = f"'{value}'"  # Wrap in single quotes
                        elif value is None:
                            value = "NULL" if self.config.get("replace_null") != "Y" else "' '" 

                        # Replace #:VARIABLE# with VALUE
                        regex_string_hash = re.compile(rf"#\:{name}#", re.IGNORECASE)
                        statement = regex_string_hash.sub(str(value), statement)

                        # Replace :VARIABLE with 'VALUE' or VALUE
                        regex_string_colon = re.compile(rf"\:{name}\b", re.IGNORECASE)
                        statement = regex_string_colon.sub(str(value), statement)

            async with self.get_session() as session:
                    try:
                        async with session.begin():  # Start a transaction
                            result = await session.execute(text(statement))
                    except Exception as e:
                        logger.exception(f"Error executing statement: {e}")
                        import traceback
                        traceback.print_exc()  
                        raise RuntimeError(f"Query execution failed: {str(e)}")  

        except Exception as err:
            logger.exception(f"Error in audit method: {err}")
            import traceback
            traceback.print_exc()  
            raise RuntimeError(f"Query execution failed: {str(e)}")      


