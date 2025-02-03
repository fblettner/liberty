# Use Python 3.12 slim image
FROM python:3.12-slim

# Install system dependencies (PostgreSQL client + others)
RUN apt-get update && apt-get install -y wget gnupg2 && \
    echo "deb http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list && \
    wget -qO - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client-16 \
    && rm -rf /var/lib/apt/lists/*

ENV PIP_TARGET=liberty-framework
ENV PYTHONPATH=$PIP_TARGET
ENV PATH="/liberty-framework/bin:$PATH"

# Copy and install the Python package
COPY ./backend/dist/*.tar.gz liberty-framework-latest.tar.gz
RUN pip install --target=$PIP_TARGET --no-cache-dir liberty-framework-latest.tar.gz
VOLUME /liberty-framework/app/config/files
VOLUME /liberty-framework/app/logs/files

# Expose FastAPI's default port
EXPOSE 8000

# Start the application
CMD ["liberty-start"]