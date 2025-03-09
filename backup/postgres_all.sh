#!/bin/bash
export TAG=latest

# Define variables
DB_CONTAINER="liberty-framework-pg-1"   # PostgreSQL container name
DB_USER="liberty"                   # Database user
DUMP_DIR="../backend/liberty/framework/postgres/dump"

# Step 1: Create the dump directory if it doesn't exist
echo "Creating dump directory..."
mkdir -p $DUMP_DIR


echo "Processing database"
docker exec $DB_CONTAINER pg_dumpall -U $DB_USER > $DUMP_DIR/liberty-all.dump
echo "done"


