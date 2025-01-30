#
# Copyright (c) 2022 NOMANA-IT and/or its affiliates.
# All rights reserved. Use is subject to license terms.
##

class PostgresQuery:

  @staticmethod
  def get_sql_query():
    sql_query = """
      SELECT 
        COALESCE(B.QUERY_SQLQUERY, A.QUERY_SQLQUERY) SQLQUERY,
        COALESCE(B.QUERY_ORDERBY, A.QUERY_ORDERBY) QUERY_ORDERBY,
        COALESCE(B.QUERY_POOL, A.QUERY_POOL) QUERY_POOL
      FROM 
        LY_QRY_SQL A
      LEFT JOIN 
        LY_QRY_SQL B ON A.QUERY_ID = B.QUERY_ID AND A.QUERY_CRUD = B.QUERY_CRUD AND B.QUERY_DBTYPE = :db_type
      WHERE
        A.QUERY_ID = :query_id
        AND A.QUERY_CRUD = :crud
        AND A.QUERY_DBTYPE = COALESCE(B.QUERY_DBTYPE, 'generic')
    """
    return sql_query

  @staticmethod
  def get_schema_list():
    sql_query = """
      SELECT 
        sch_id, 
        sch_name, 
        sch_target
      FROM 
        ly_db_schema
      WHERE
        sch_pool = :pool
    """
    return sql_query

  @staticmethod
  def get_framework_query():
    sql_query = """
      SELECT 
        COALESCE(B.FMW_SQLQUERY, A.FMW_SQLQUERY) SQLQUERY,
        COALESCE(B.FMW_ORDERBY, A.FMW_ORDERBY) QUERY_ORDERBY,
        COALESCE(B.FMW_POOL, A.FMW_POOL) QUERY_POOL
      FROM 
        LY_QRY_FMW A
      LEFT JOIN 
        LY_QRY_FMW B ON A.FMW_ID = B.FMW_ID AND A.FMW_CRUD = B.FMW_CRUD AND B.FMW_DBTYPE = :db_type
      WHERE
        A.FMW_ID = :query_id
        AND A.FMW_CRUD = :crud
        AND A.FMW_DBTYPE = COALESCE(B.FMW_DBTYPE, 'generic')
    """
    return sql_query

  @staticmethod
  def get_column_type(column_name):
    sql_query = f"""
      SELECT
        data_type
      FROM
        information_schema.columns
      WHERE 
        UPPER(column_name) = '{column_name.upper()}'
      LIMIT 1
    """
    return sql_query

  @staticmethod
  def get_primary_key(table_id):
    sql_query = f"""
      SELECT  upper(STRING_AGG(a.attname || ' = :' || a.attname, ' AND ' ORDER BY a.attname) )
      FROM   pg_index i
      JOIN   pg_attribute a ON a.attrelid = i.indrelid
                 AND a.attnum = ANY(i.indkey)
      WHERE  i.indrelid = '{table_id.upper()}'::regclass
      AND    i.indisprimary;
    """
    return sql_query

  @staticmethod
  def check_audit_table(table_id):
      sql_query = f"""
          SELECT 
              COUNT(*) AS table_exist
          FROM 
              information_schema.tables
          WHERE 
              table_name = 'aud$_{table_id.lower()}'
      """
      return sql_query

  @staticmethod
  def create_audit_table(table_id):
    sql_query = f"""
      CREATE TABLE IF NOT EXISTS 
        aud$_{table_id.upper()} AS SELECT
        *, 
        CAST ('' as VARCHAR(30)) as AUD$_USER, 
        LOCALTIMESTAMP as AUD$_DATE
      FROM 
        {table_id.upper()}
      WHERE
        1 = 0
    """
    return sql_query

  @staticmethod
  def insert_audit_table(table_id, user_id):
    sql_query = f"""
      INSERT INTO AUD$_{table_id.upper()}
      SELECT
        *,
        '{user_id}' AUD$_USER,
        CURRENT_TIMESTAMP AUD$_DATE
      FROM 
        {table_id.upper()}
    """
    return sql_query

  @staticmethod
  def create_database(db_name, user):
    sql_query = f"""
      CREATE DATABASE {db_name.upper()}
      OWNER = {user.upper()}
      lc_collate = 'en_US.utf8' 
      lc_ctype = 'en_US.utf8'
    """
    return sql_query

  @staticmethod
  def drop_database(db_name):
    sql_query = f"DROP DATABASE {db_name.upper()}"
    return sql_query

  @staticmethod
  def drop_role(user):
    sql_query = f"DROP ROLE {user.upper()}"
    return sql_query

  @staticmethod
  def create_role(user, passwd):
    sql_query = f"""
      CREATE ROLE {user.upper()}
      WITH LOGIN PASSWORD '{passwd}'
    """
    return sql_query

  @staticmethod
  def create_schema(schema):
    sql_query = f"""
      CREATE SCHEMA {schema.upper()}
      AUTHORIZATION {schema.upper()}
    """
    return sql_query

  @staticmethod
  def get_tables_schema(schema):
    sql_query = f"""
      SELECT table_name
      FROM information_schema.tables
      WHERE upper(table_schema) = '{schema.upper()}'
    """
    return sql_query

  @staticmethod
  def generate_create_scripts(source, target, table_name):
    sql_query = f"""
      WITH column_defs AS (
        SELECT table_schema, table_name, ordinal_position,
          column_name || ' ' || data_type ||
          COALESCE('(' || character_maximum_length || ')', '') ||
          CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END AS column_def
        FROM information_schema.columns
        WHERE upper(table_schema) = '{source.upper()}' AND upper(table_name) = '{table_name.upper()}'
      ),
      primary_keys AS (
        SELECT kcu.table_schema, kcu.table_name,
          'PRIMARY KEY (' || string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) || ')' AS pk_def
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
          AND tc.table_name = kcu.table_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND upper(kcu.table_schema) = '{source.upper()}'
          AND upper(kcu.table_name) = '{table_name.upper()}'
        GROUP BY kcu.table_schema, kcu.table_name
      )
      SELECT 'CREATE TABLE {target.upper()}.{table_name.upper()} (' ||
      string_agg(column_def, ', ' ORDER BY ordinal_position) || 
      COALESCE(', ' || (SELECT pk_def FROM primary_keys), '') ||
      ')' AS create_statement
      FROM column_defs
      LEFT JOIN primary_keys ON column_defs.table_schema = primary_keys.table_schema AND column_defs.table_name = primary_keys.table_name
      GROUP BY column_defs.table_schema, column_defs.table_name
    """
    return sql_query

  @staticmethod
  def generate_foreign_key_scripts(source, target, table_name):
    sql_query = f"""
      SELECT 'ALTER TABLE {target.upper()}.{table_name.upper()}
      ADD CONSTRAINT ' || conname || ' ' || pg_catalog.pg_get_constraintdef(r.oid, true) AS alter_statement
      FROM pg_catalog.pg_constraint r
      WHERE r.conrelid = '{table_name.upper()}'::regclass AND r.contype = 'f' ORDER BY 1
    """
    return sql_query

  @staticmethod
  def get_api():
    sql_query = """
      SELECT 
        API_SOURCE,
        API_METHOD,
        API_URL,
        API_USER,
        API_PASSWORD,
        API_BODY
      FROM 
        LY_API 
      WHERE
        API_ID = %s
    """
    return sql_query