#
# Copyright (c) 2022 NOMANA-IT and/or its affiliates.
# All rights reserved. Use is subject to license terms.
##

class OracleQuery:

  @staticmethod
  def get_sql_query():
    sql_query = """
      SELECT 
        NVL(B.QUERY_SQLQUERY, A.QUERY_SQLQUERY) SQLQUERY,
        NVL(B.QUERY_ORDERBY, A.QUERY_ORDERBY) QUERY_ORDERBY ,
        NVL(B.QUERY_POOL, A.QUERY_POOL) QUERY_POOL
      FROM 
        LY_QRY_SQL A
      LEFT JOIN 
        LY_QRY_SQL B ON A.QUERY_ID = B.QUERY_ID AND A.QUERY_CRUD = B.QUERY_CRUD AND B.QUERY_DBTYPE = :db_type
      WHERE
        A.QUERY_ID = :query_id
        AND A.QUERY_CRUD = :crud
        AND A.QUERY_DBTYPE = NVL(B.QUERY_DBTYPE, 'generic' )
    """
    return sql_query
  
  @staticmethod
  def get_schema_list():
    sql_query = """
        SELECT 
          SCH_ID, 
          SCH_NAME, 
          SCH_TARGET
      FROM 
          LY_DB_SCHEMA
      WHERE
          SCH_POOL = :pool
    """
    return sql_query
  

  @staticmethod
  def get_column_type(column_name):
    sql_query = f"""
        SELECT
          DATA_TYPE 
        FROM
          USER_TAB_COLUMNS
        WHERE
          COLUMN_NAME = '{column_name}'
          AND ROWNUM = 1          
    """
    return sql_query


      
  @staticmethod
  def get_primary_key(table_id):
    sql_query = f"""
      SELECT 
        upper(LISTAGG(cols.column_name || ' = :' || cols.column_name, ' AND ') WITHIN GROUP (ORDER BY cols.column_name)) AS PK
      FROM 
        all_constraints cons 
      INNER JOIN 
        all_cons_columns cols ON cons.constraint_name = cols.constraint_name AND cons.owner = cols.owner
      WHERE 
        cons.constraint_type = 'P' AND cols.table_name = UPPER('{table_id.toUpperCase()}')
    """
    return sql_query
  

      
  @staticmethod
  def create_audit_table(table_id):
    sql_query = f"""
        CREATE TABLE 
          aud$_{table_id.toUpperCase()} AS 
        SELECT
        {table_id.toUpperCase()}.*, 
          CAST ('' as VARCHAR(30)) as AUD$_USER, 
          LOCALTIMESTAMP as AUD$_DATE
        FROM 
          {table_id.toUpperCase()}
        WHERE
          1 = 0
    """
    return sql_query

  def check_audit_table(table_id):
    sql_query = f"""
        SELECT 
          count(*) AS TABLE_EXIST
        FROM 
          user_tables 
        WHERE
          table_name='AUD$_{table_id.toUpperCase()}'
    """
    return sql_query 

  @staticmethod
  def insert_audit_table(table_id, user_id):
    sql_query = f"""
        INSERT INTO AUD$_{table_id.toUpperCase()}
        SELECT
          {table_id.toUpperCase()}.*,
          '{user_id}' AUD$_USER,
          SYSDATE AUS$_DATE
        FROM 
          {table_id.toUpperCase()}
    """
    return sql_query 

