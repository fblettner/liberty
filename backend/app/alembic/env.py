import configparser
import logging
from logging.config import fileConfig
import os
import re

from sqlalchemy import create_engine, engine_from_config
from sqlalchemy import pool

from alembic import context
from app.config import get_db_properties_path
from app.setup.models import liberty, nomasx1
from app.utils.encrypt import Encryption
from app.utils.jwt import JWT

USE_TWOPHASE = False

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
logger = logging.getLogger("alembic.env")

# gather section names referring to different
# databases.  These are named "engine1", "engine2"
# in the sample .ini file.

db_names = config.get_main_option("databases", "")

# add your model's MetaData objects here
# for 'autogenerate' support.  These must be set
# up to hold just those tables targeting a
# particular database. table.tometadata() may be
# helpful here in case a "copy" of
# a MetaData is needed.
# from myapp import mymodel
# target_metadata = {
#       'engine1':mymodel.metadata1,
#       'engine2':mymodel.metadata2
# }
target_metadata = {
    "liberty": liberty.Base.metadata,
    "libnsx1": liberty.Base.metadata,
    "libnjde": liberty.Base.metadata,
    "libnetl": liberty.Base.metadata,
    "nomasx1": nomasx1.Base.metadata,
}

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

db_properties_path = get_db_properties_path()
config_parser = configparser.ConfigParser()
config_parser.read(db_properties_path)

# Extract database configuration
db_config = config_parser["framework"] 
jwt = JWT()
encryption = Encryption(jwt)
# Return as a dictionary

database_url ={
    "liberty": f"postgresql+psycopg2://liberty:{encryption.decrypt_text(db_config.get('password'))}@{db_config.get('host')}:{db_config.get('port')}/liberty",
    "libnsx1": f"postgresql+psycopg2://libnsx1:{encryption.decrypt_text(db_config.get('password'))}@{db_config.get('host')}:{db_config.get('port')}/libnsx1",
    "libnjde": f"postgresql+psycopg2://libnjde:{encryption.decrypt_text(db_config.get('password'))}@{db_config.get('host')}:{db_config.get('port')}/libnjde",
    "libnetl": f"postgresql+psycopg2://libnetl:{encryption.decrypt_text(db_config.get('password'))}@{db_config.get('host')}:{db_config.get('port')}/libnetl",
    "nomasx1": f"postgresql+psycopg2://nomasx1:{encryption.decrypt_text(db_config.get('password'))}@{db_config.get('host')}:{db_config.get('port')}/nomasx1",
}


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    # for the --sql use case, run migrations for each URL into
    # individual files.

    engines = {}
    for name in re.split(r",\s*", db_names):
        engines[name] = rec = {}
        rec["url"] = database_url[name]

    for name, rec in engines.items():
        logger.info("Migrating database %s" % name)
        file_ = "%s.sql" % name
        logger.info("Writing output to %s" % file_)
        with open(file_, "w") as buffer:
            context.configure(
                url=rec["url"],
                output_buffer=buffer,
                target_metadata=target_metadata.get(name),
                literal_binds=True,
                dialect_opts={"paramstyle": "named"},
            )
            with context.begin_transaction():
                context.run_migrations(engine_name=name)

def include_object(object, name, type_, reflected, compare_to):
    """
    Prevent Alembic from dropping tables that exist in the database
    but are not in the SQLAlchemy models.
    """
    if type_ == "table" and reflected and compare_to is None:
        logger.warning(f"Skipping table {name} (exists in DB but not in models)")
        return False  # Do NOT drop the table
    return True  # Allow other objects to be processed

def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """

    # for the direct-to-DB use case, start a transaction on all
    # engines, then run all migrations, then commit all transactions.

    engines = {}
    for name in re.split(r",\s*", db_names):
        engines[name] = rec = {}
        rec["engine"] = create_engine(database_url[name], poolclass=pool.NullPool)
    
    for name, rec in engines.items():
        engine = rec["engine"]
        rec["connection"] = conn = engine.connect()

        if USE_TWOPHASE:
            rec["transaction"] = conn.begin_twophase()
        else:
            rec["transaction"] = conn.begin()

    try:
        for name, rec in engines.items():
            logger.info("Migrating database %s" % name)
            context.configure(
                connection=rec["connection"],
                upgrade_token="%s_upgrades" % name,
                downgrade_token="%s_downgrades" % name,
                target_metadata=target_metadata.get(name),
                include_object=include_object
            )
            context.run_migrations(engine_name=name)

        if USE_TWOPHASE:
            for rec in engines.values():
                rec["transaction"].prepare()

        for rec in engines.values():
            rec["transaction"].commit()
    except:
        for rec in engines.values():
            rec["transaction"].rollback()
        raise
    finally:
        for rec in engines.values():
            rec["connection"].close()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
