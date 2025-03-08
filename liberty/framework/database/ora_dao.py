import logging
logger = logging.getLogger(__name__)
import re
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession
from liberty.framework.database.base_dao import BaseDAO
from liberty.framework.utils.common import PoolConfig
from liberty.framework.business.oracle import OracleQuery
from sqlalchemy.orm import sessionmaker
from typing import Dict, List

class OracleDAO(BaseDAO):
    def __init__(self, debug_mode: bool, config: PoolConfig):
        self.config=config
        self.debug_mode = debug_mode
        # self.create_engine()
        # self.init_session()

    async def create_engine(self):
        """
        Create a SQLAlchemy engine for Oracle.
        """
        database_url = (
            f"oracle+oracledb://{self.config['user']}:{self.config['password']}@"
            f"{self.config['host']}:{self.config['port']}/?service_name={self.config['database']}"
        )
        # Create the SQLAlchemy engine
        self.engine = create_async_engine(
            database_url,
            echo=False,  # Debug mode, can be set to False in production
            pool_size=self.config["poolMax"],
            max_overflow=0,
            pool_recycle=300,  # Optional: Recycle connections after 300 seconds
            pool_pre_ping=True,  # Optional: Validate connections before use
        )
        self.async_session = sessionmaker(self.engine, class_=AsyncSession, expire_on_commit=False)
        try:
            async with self.async_session() as session:
                await session.execute(text("SELECT 1 FROM DUAL"))
                
        except Exception as e:
            raise RuntimeError(f"Error creating pool: {str(e)}")
        
        logger.debug(f"Oracle engine created for {self.config['database']}.")

    def convert_coalesce_and_sysdate(self, query: str) -> str:
        """
        Convert database-specific functions for PostgreSQL.
        """
        query = re.sub(r"\bCOALESCE\b", "NVL", query, flags=re.IGNORECASE)
        query = re.sub(r"\bCURRENT_DATE\b", "SYSDATE", query, flags=re.IGNORECASE)
        return query
    
    async def get_column_type(self, column_name: str) -> str:
        async with self.get_session() as session:
            statement = text(OracleQuery.get_column_type(column_name))
            result = await session.execute(statement)
            column_type = result.fetchall()      

        return column_type
            
    def construct_query(self, target_query, columns: bool):
        query = ""
        if columns:
            query = f"SELECT ROW_NUMBER() OVER (ORDER BY 1) as ROW_ID, ALL_ROWS.* FROM ({target_query[0][0]}) ALL_ROWS WHERE 1 = 0 "
        else:
            if target_query[0][1] is None:
                query = f"SELECT ROW_NUMBER()  OVER (ORDER BY 1) as ROW_ID, ALL_ROWS.* FROM ({target_query[0][0]}) ALL_ROWS WHERE 1 = 1 ";  
            else:
                query =  f"SELECT ROW_NUMBER()  OVER (ORDER BY {target_query[0][1]}) as ROW_ID, ALL_ROWS.* FROM ({target_query[0][0]}) ALL_ROWS WHERE 1 = 1 "
        
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
                elif "DATE" in query_column or "TIMESTAMP" in query_column:
                    query += f"\nAND TO_CHAR({name}, 'yyyy-MM-dd'){eq}'{value}'"
                elif column_type == "number":
                    query += f"\nAND {name}{eq}{int(value.replace('%', ''))}"
                else:
                    query += f"\nAND {name}{eq}'{value}'"
        return query
    
    def construct_offset(self, query, context: Dict[str, str]):
        query += f" offset {str(context["row_offset"])} rows"
        query += f" fetch next {str(context["row_limit"])}  rows only"

        return query    
    

    async def check_audit_table(self, table_id: str) -> str:
        async with self.get_session() as session:
            statement = text(OracleQuery.check_audit_table(table_id))
            result = await session.execute(statement)
            table_exist = result.fetchall()      

        return table_exist    
    
    async def create_audit_table(self, table_id: str) -> str:
        # Open a session
        async with self.get_session() as session:
            try:
                async with session.begin():  # Start a transaction
                    await session.execute(text(OracleQuery.create_audit_table(table_id)))

            except Exception as e:
                logger.exception(f"Error executing statement: {e}")
                import traceback
                traceback.print_exc()  
                raise RuntimeError(f"Query execution failed: {str(e)}")  


    async def insert_audit_table(self, table_id: str, user_id: str) -> str:
        return OracleQuery.insert_audit_table(table_id, user_id)    
    

    async def get_primary_key(self, table_id: str) -> str:
        async with self.get_session() as session:
            statement = text(OracleQuery.get_primary_key(table_id))
            result = await session.execute(statement)
            primary_key = result.fetchall()      

        return primary_key 
    
    def check_connection(self) -> str:
        return "SELECT SYSDATE AS current_date from dual"
