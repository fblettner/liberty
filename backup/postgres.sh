#!/bin/bash
export TAG=latest

# Define variables
DB_CONTAINER="liberty-framework-pg-1"   # PostgreSQL container name
DB_USER="liberty"                   # Database user
DUMP_DIR="../backend/app/postgres/dump"

# Step 1: Create the dump directory if it doesn't exist
echo "Creating dump directory..."
mkdir -p $DUMP_DIR

# Step 2: Get a list of databases (excluding system databases like 'postgres')
DATABASES=$(docker exec $DB_CONTAINER psql -U $DB_USER -t -c "SELECT datname FROM pg_database WHERE datistemplate = false AND datname not in ('postgres','rundeck');")

# Step 3: Loop through each database and create schema and data dumps
for DB in $DATABASES; do
  # Trim any leading/trailing whitespace from the database name
  DB=$(echo $DB | xargs)
  
  echo "Processing database: $DB"
  
  # Step 3a: Dump the schema-only from the PostgreSQL database inside the Docker container
  # echo "Dumping schema-only for $DB..."
  # docker exec $DB_CONTAINER pg_dump -U $DB_USER --schema-only $DB > $DUMP_DIR/${DB}_schema.sql
  
  # Step 3b: Dump the data-only from the PostgreSQL database inside the Docker container
  # echo "Dumping data-only for $DB..."
  # docker exec $DB_CONTAINER pg_dump -U $DB_USER --data-only $DB > $DUMP_DIR/${DB}_data.sql
  
    # Step 3b: Dump schema and data from the PostgreSQL database inside the Docker container
  echo "Dumping schema and data for $DB..."
  docker exec $DB_CONTAINER pg_dump -Fc -U $DB_USER $DB > $DUMP_DIR/${DB}.dump
  
done

