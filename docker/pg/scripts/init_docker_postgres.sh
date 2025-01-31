#!/bin/bash

DB_DUMP_LOCATION="/tmp/psql_data/liberty-all.sql"
echo "*** CREATING DATABASE ***"
psql -U liberty < "$DB_DUMP_LOCATION";
echo "*** DATABASE CREATED! ***"