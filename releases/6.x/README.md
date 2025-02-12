# Liberty Framework Docker-Compose Setup

## Overview
The Liberty Framework is a comprehensive enterprise solution that utilizes Docker to orchestrate various services. This guide explains the `docker-compose.yml` file and provides steps to install and set up the Liberty Framework environment.

## Services in Docker-Compose

### 1. **Traefik**
Traefik is a reverse proxy and load balancer that manages service routing and security.
- **Image**: `ghcr.io/fblettner/liberty-enterprise-traefik:latest`
- **Ports**:
  - `80` (Web UI HTTP)
  - `443` (Web UI HTTPS)
  - `8080` (Dashboard)
  - `5432` (Database connection)
- **Volumes**:
  - `./letsencrypt:/letsencrypt` (For Let's Encrypt certificates)
  - `/var/run/docker.sock:/var/run/docker.sock` (For container discovery)
  - `traefik-certs:/etc/certs` (TLS certificates)
  - `traefik-config:/usr/share/traefik/config` (Dynamic configuration)
- **Labels**:
  - Enables dashboard and authentication
  - Enables middlewares like `compress-middleware` for optimization
- **Let's Encrypt Configuration**:
  - Uses ACME for automatic certificate issuance
  - Email for ACME registration: `franck.blettner@nomana-it.fr`
  - ACME storage file: `/letsencrypt/acme.json`


### 2. **Portainer**
Portainer provides a web UI for managing Docker containers.
- **Image**: `ghcr.io/fblettner/liberty-enterprise-portainer:latest`
- **Ports**: Managed by Traefik
- **Volumes**:
  - `/var/run/docker.sock:/var/run/docker.sock` (Container management)
  - `portainer-data:/data` (Persistent data storage)
- **Labels**:
  - Traefik routes requests to `/portainer`

### 3. **Error Pages Service**
Handles custom error pages for unavailable services.
- **Image**: `ghcr.io/fblettner/liberty-enterprise-busybox:latest`
- **Middleware**: Handles HTTP errors (404, 502-504)
- **Priority**: Lower priority than registered services
- **Labels**:
  - Handles errors with `/offline.html` page

### 4. **Liberty Framework Backend**
Core backend service of the Liberty Framework.
- **Image**: `ghcr.io/fblettner/liberty-framework:latest`
- **Command**: `liberty-start`
- **Volumes**:
  - `liberty-config:/liberty-framework/app/config/files`
  - `liberty-logs:/liberty-framework/app/logs/files`
  - `liberty-versions:/liberty-framework/app/alembic/versions`
- **Labels**:
  - Routes traffic via Traefik (`liberty.nomana-it.fr`)

### 5. **PostgreSQL (pg)**
Database server used for Liberty Framework.
- **Image**: `postgres:16`
- **Command**: Custom PostgreSQL configurations for performance tuning
- **Volumes**:
  - `pg-data:/var/lib/postgresql/data`
  - `pg-logs:/var/log/postgresql`
- **Environment**:
  - `POSTGRES_USER=liberty`
  - `POSTGRES_PASSWORD=change_on_install`
- **Labels**:
  - Traefik TCP routing enabled

### 6. **Enterprise Features (Liberty Enterprise)**
#### a) **Airflow Webserver & Scheduler**
Manages workflows for data processing.
- **Image**: `ghcr.io/fblettner/liberty-enterprise-airflow:latest`
- **Command**: Webserver and scheduler setup
- **Labels**:
  - Airflow dashboard accessible via `/airflow`

#### b) **OIDC Authentication (Keycloak)**
Handles authentication and authorization.
- **Image**: `ghcr.io/fblettner/liberty-enterprise-keycloak:latest`
- **Labels**:
  - Keycloak available at `/oidc`
  - Configured with CORS support

#### c) **Gitea (Git Repository Management)**
Provides self-hosted Git repositories.
- **Image**: `ghcr.io/fblettner/liberty-enterprise-gitea:latest`
- **Healthcheck**: Ensures Gitea service availability
- **Labels**:
  - Accessible via `/gitea`

#### d) **pgAdmin**
Web-based database management tool for PostgreSQL.
- **Image**: `ghcr.io/fblettner/liberty-enterprise-pgadmin:latest`
- **Volumes**:
  - `pgadmin-data:/var/lib/pgadmin`
- **Labels**:
  - Accessible via `/pgadmin`

## Installation Steps

### **Step 1: Install Docker and Docker Compose**
Ensure that Docker and Docker Compose are installed on your system:
For CentOS, you can follow this link for the installation : [https://docs.nomana-it.fr/liberty/technical/installation/](https://docs.nomana-it.fr/liberty/technical/installation/)

### **Step 2: Clone the Repository**
```sh
git clone https://github.com/fblettner/liberty.git
cd liberty-framework
```

### **Step 3: Modify Configuration (If Needed)**
Edit `docker-compose.yml` to adjust hostnames, passwords, or other configurations.

### **Step 4: Start the Services**
Run the following command to start the Liberty Framework environment:
```sh
docker-compose up -d
```
This will pull the necessary images and start all services in detached mode.

### **Step 5: Verify Running Containers**
Check if all containers are running:
```sh
docker ps
```

### **Step 6: Access Services**
- **Traefik Dashboard**: `http://localhost:8080`
- **Portainer**: `http://localhost:3000/portainer`
- **Airflow**: `http://localhost:3000/airflow`
- **Keycloak (OIDC)**: `http://localhost:3000/oidc`
- **Gitea**: `http://localhost:3000/gitea`
- **pgAdmin**: `http://localhost:3000/pgadmin`

### **Step 7: Stop Services**
To stop all running containers:
```sh
docker-compose down
```

## Conclusion
This setup provides a scalable and well-integrated containerized environment for the Liberty Framework. By using Docker Compose, you can easily manage, deploy, and scale your enterprise services.

