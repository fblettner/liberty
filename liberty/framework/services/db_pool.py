import logging
logger = logging.getLogger(__name__)
from liberty.framework.database.pg_dao import PostgresDAO
from liberty.framework.database.ora_dao import OracleDAO
from liberty.framework.utils.common import PoolConfig

class DBType:
    ORACLE = "oracle"
    POSTGRES = "postgres"

class PoolInterface:
    def __init__(self):
        # A dictionary to store DBPool instances by alias
        self.pools = {}

    def add_pool(self, alias: str, db_pool: "DBPool"):
        """Add a new DBPool instance to the interface."""
        self.pools[alias] = db_pool

    def remove_pool(self, alias: str):
        """Remove pool instance."""
        if alias in self.pools:
            self.pools.pop(alias)

    def get_pool(self, alias: str) -> "DBPool":
        """Retrieve a DBPool instance by alias."""
        if alias not in self.pools:
            raise ValueError(f"Pool with alias '{alias}' not found.")
        return self.pools[alias]

    def close_all_pools(self):
        """Close all pools in the interface."""
        for alias, db_pool in self.pools.items():
            db_pool.close_pool()

    def is_pool_open(self, alias: str) -> bool:
        """Check if a pool is open (exists in the interface)."""
        return alias in self.pools

class DBPool:
    def __init__(self, debug_mode: bool = False):
        self.debug_mode = debug_mode
        self.db_dao = None
        self.db_type = None

    async def create_pool(self, db_type: str, config: PoolConfig):
        self.db_type = db_type
        
        try:
            if db_type == DBType.POSTGRES:
                self.db_dao = PostgresDAO(self.debug_mode, config)
            elif db_type == DBType.ORACLE:
                self.db_dao = OracleDAO(self.debug_mode, config)
            else:
                raise ValueError(f"Unsupported database type: {db_type}")
            await self.db_dao.create_engine()

        except Exception as e:
            raise RuntimeError(f"Error creating pool: {str(e)}")

    async def close_pool(self):
        if self.db_dao:
            await self.db_dao.close_pool()