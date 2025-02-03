# Use Python 3.12 slim image
FROM python:3.12-slim

# Install system dependencies (PostgreSQL client + others)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
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