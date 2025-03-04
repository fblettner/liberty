#!/bin/bash
source .venv/bin/activate

# Load the environment variables from the .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

export AIRFLOW_HOME=./

pkill -f "airflow scheduler"
pkill -f "airflow webserver"
