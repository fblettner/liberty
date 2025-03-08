import logging
logger = logging.getLogger(__name__)
import re
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from liberty.framework.database.base_dao import BaseDAO
from liberty.framework.business.postgres import PostgresQuery
from typing import Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

class PostgresDAO(BaseDAO):
    def __init__(self, debug_mode: bool, config: dict):
        self.config=config
        self.debug_mode = debug_mode
        # self.create_engine()
        # self.init_session()

    async def create_engine(self):
        """
        Create a SQLAlchemy engine for PostgreSQL.
        """

        try:
            database_url = f"postgresql+asyncpg://{self.config['user']}:{self.config['password']}@{self.config['host']}:{self.config['port']}/{self.config['database']}"
            self.engine = create_async_engine(
                database_url,
                echo=False,  # Debug mode, can be set to False in production
                pool_size=self.config["poolMax"],  # Max connections in the pool
                max_overflow=0,  # No additional connections beyond pool_size
                pool_recycle=30,  # Recycle idle connections (seconds)
                pool_pre_ping=True,  # Check connection liveness
            )
            self.async_session = sessionmaker(self.engine, class_=AsyncSession, expire_on_commit=False)

            async with self.async_session() as session:
                await session.execute(text("SELECT 1"))
                
        except Exception as e:
            raise RuntimeError(f"Error creating pool: {str(e)}")

        logger.debug(f"PostgreSQL engine created for {self.config['database']}.")


    def convert_coalesce_and_sysdate(self, query: str) -> str:
        """
        Convert database-specific functions for PostgreSQL.
        """
        query = re.sub(r"\bNVL\b", "COALESCE", query, flags=re.IGNORECASE)
        query = re.sub(r"\bSYSDATE\b", "CURRENT_DATE", query, flags=re.IGNORECASE)
        return query
    
    async def get_column_type(self, column_name: str) -> str:
        async with self.get_session() as session:
            statement = text(PostgresQuery.get_column_type(column_name))
            result = await session.execute(statement)
            column_type = result.fetchall()

        return column_type


    def construct_query(self, target_query, columns: bool):
        query = ""
        if columns:
            query = f"SELECT row_number() over() as ROW_ID, * FROM ({target_query[0][0]}) PGSQL WHERE 1 = 0 "
        else:
            if target_query[0][1] is None:
                query = f"SELECT row_number() over() as ROW_ID, * FROM ({target_query[0][0]}) PGSQL WHERE 1 = 1 "
            else:
                query = f"SELECT row_number() over(ORDER BY {target_query[0][1]}) as ROW_ID, * FROM ({target_query[0][0]}) PGSQL WHERE 1 = 1 "
        
        self.convert_coalesce_and_sysdate(query)        
        return query


    async def construct_query_where(self, query: str, where: List[Dict[str, str]]) -> str:
        for name, where_value in where.items():
            # Get type of the column if column name exist inside the database 
            # Used to convert number without quote and DATE or TIMESTAMP 
            # This is needed for filtering 
            query_column_type = await self.get_column_type(name)

            query_column = ""
            if query_column_type and len(query_column_type) > 0:
                query_column = query_column_type[0][0]

            if query_column == "integer":
                column_type = "integer"
            else:
                column_type = "string"


            # Construct the WHERE clause
            # Convert numbers, dates, and timestamps
            for op, value in where_value.items():
                eq = " = " if op == "eq" else f" {op} "

                if value is None:
                    query += f"\nAND {name} IS NULL"
                elif "date" in query_column or "timestamp" in query_column:
                    query += f"\nAND TO_CHAR({name}, 'yyyy-MM-dd'){eq}'{value}'"
                elif column_type == "integer":
                    query += f"\nAND {name}{eq}{int(value.replace('%', ''))}"
                else:
                    query += f"\nAND {name}{eq}'{value}'"
        return query
    

    def construct_offset(self, query, context: Dict[str, str]):
        query += f" offset {str(context["row_offset"])}"
        query += f" limit {str(context["row_limit"])}"
        return query    
    

    async def check_audit_table(self, table_id: str) -> str:
        async with self.get_session() as session:
            statement = text(PostgresQuery.check_audit_table(table_id))
            result = await session.execute(statement)
            table_exist = result.fetchall()      

        return table_exist        
    
    async def create_audit_table(self, table_id: str) -> str:
        # Open a session
        async with self.get_session() as session:
            try:
                async with session.begin():  # Start a transaction
                    await session.execute(text(PostgresQuery.create_audit_table(table_id)))

            except Exception as e:
                # Rollback is automatic if an exception is raised within session.begin()
                logger.exception(f"Error executing statement: {e}")
                import traceback
                traceback.print_exc()  
                raise RuntimeError(f"Query execution failed: {str(e)}")  
            

    async def insert_audit_table(self, table_id: str, user_id: str) -> str:
        return PostgresQuery.insert_audit_table(table_id, user_id)    
    
    async def get_primary_key(self, table_id: str) -> str:
        async with self.get_session() as session:
            statement = text(PostgresQuery.get_primary_key(table_id))
            result = await session.execute(statement)
            primary_key = result.fetchall()      

        return primary_key 
    

    def check_connection(self) -> str:
        return "SELECT NOW() AS current_date"

    

    