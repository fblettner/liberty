python3 -m venv .venv
source .venv/bin/activate

export AIRFLOW_VERSION=2.10.2
export PYTHON_VERSION=3.12
export CONSTRAINT_URL="https://raw.githubusercontent.com/apache/airflow/constraints-${AIRFLOW_VERSION}/constraints-${PYTHON_VERSION}.txt"

# Install the correct version
pip install "apache-airflow[postgres]==${AIRFLOW_VERSION}" --constraint "${CONSTRAINT_URL}"

# Install additional providers separately
pip install apache-airflow-providers-apache-spark pyspark apache-airflow-providers-oracle apache-airflow-providers-postgres