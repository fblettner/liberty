# Airflow Installation and Setup

This guide explains how to install and run Apache Airflow using `pip` with a virtual environment.

## Prerequisites
- Python **3.12**
- PostgreSQL database (optional, required for production use)
- Virtual environment support (`venv`)

---

## 🚀 Installation Steps

### 1️⃣ Clone or Prepare Your Project Directory
```sh
mkdir airflow_project && cd airflow_project
```

### 2️⃣ Create an `.env` File for Database Connection
Before installing Airflow, create an `.env` file to store your database connection string:
```sh
echo "AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://`airflow`:`password`@localhost/airflow" > .env
```

Ensure this file is **not committed to Git** by adding it to `.gitignore`:
```sh
echo ".env" >> .gitignore
```

### 3️⃣ Run the Installation Script
```sh
chmod +x install.sh
./install.sh
```

This script will:
- Create a Python virtual environment (`.venv`).
- Activate the virtual environment.
- Install Apache Airflow **2.10.2** and additional providers for PostgreSQL, Spark, and Oracle.

---

## 🎯 Running Airflow

### 1️⃣ Start Airflow Services
Run the `start.sh` script:
```sh
chmod +x start.sh
./start.sh
```
This will:
- Load environment variables from `.env` (if present)
- Set Airflow home directory (`AIRFLOW_HOME`)
- Start **Airflow Scheduler** and **Airflow Webserver**
- Log output to `./logs/`


📌 **Airflow UI:** Open [http://localhost:8081/airflow](http://localhost:8081/airflow)

📌 **Logs:**
- Scheduler logs → `./logs/scheduler.log`
- Webserver logs → `./logs/webserver.log`

---

## ❌ Stopping Airflow Services
Run the `stop.sh` script:
```sh
chmod +x stop.sh
./stop.sh
```
This will:
- Load environment variables
- Stop all running Airflow processes

---

## 📌 Additional Commands

### 1️⃣ Initialize the Database (Only needed for first-time setup)
```sh
airflow db init
```

### 2️⃣ Create an Admin User (Only needed for first-time setup)
```sh
airflow users create \
    --username admin \
    --password admin \
    --firstname Admin \
    --lastname User \
    --role Admin \
    --email admin@example.com
```

### 3️⃣ List Running Airflow Processes
```sh
ps aux | grep airflow
```

### 4️⃣ View Logs
```sh
tail -f logs/scheduler.log  # Scheduler logs
tail -f logs/webserver.log  # Webserver logs
```

---

## 🔥 Troubleshooting
### **Airflow Webserver Not Starting?**
- Check if ports are in use:
  ```sh
  netstat -tulnp | grep 8081
  ```
  If occupied, change the port in `start.sh`.

### **Database Connection Issues?**
- Check if `sql_alchemy_conn` is set properly:
  ```sh
  airflow config get-value database sql_alchemy_conn
  ```

---

## 🎉 You're Ready to Use Airflow!
Now, you have a fully working Airflow setup running with `pip` in a **virtual environ