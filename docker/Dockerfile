# Use Python 3.12 slim image
FROM python:3.12-slim

# Install system dependencies (PostgreSQL client + others)
RUN apt-get update && apt-get install -y wget gnupg ca-certificates && \
    mkdir -p /etc/apt/keyrings && \
    wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc \
      | gpg --dearmor -o /etc/apt/keyrings/postgresql.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" \
      > /etc/apt/sources.list.d/pgdg.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client-16 && \
    rm -rf /var/lib/apt/lists/*    

ENV PIP_TARGET=liberty-framework
ENV PYTHONPATH=$PIP_TARGET
ENV PATH="/liberty-framework/bin:$PATH"

# Copy and install the Python package
RUN pip install --target=$PIP_TARGET --no-cache-dir liberty-framework
VOLUME /liberty-framework/app/config/files
VOLUME /liberty-framework/app/logs/files

# Expose FastAPI's default port
EXPOSE 8000

# Start the application
CMD ["liberty-start"]