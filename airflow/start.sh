#!/bin/bash
source .venv/bin/activate

# Load the environment variables from the .env file
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

export AIRFLOW_HOME=./
export AIRFLOW__CORE__LOAD_EXAMPLES="False"
export AIRFLOW__WEBSERVER__EXPOSE_CONFIG="true"
export AIRFLOW__CORE__EXECUTOR="SequentialExecutor"
export AIRFLOW__WEBSERVER__WEB_SERVER_PORT=8081
export AIRFLOW__WEBSERVER__BASE_URL="http://localhost:8081/airflow"
export PYTHONWARNINGS="ignore::SyntaxWarning"

# Start Airflow Scheduler in the background (ignores terminal close)
echo "Starting Airflow Scheduler..."
nohup airflow scheduler > ./logs/scheduler.log 2>&1 &

# Start Airflow Webserver in the background
echo "Starting Airflow Webserver..."
nohup airflow webserver > ./logs/webserver.log 2>&1 &

echo "Airflow services started successfully."