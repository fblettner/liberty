# Use Python 3.12 slim image
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Install system dependencies (PostgreSQL client + others)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy and install the Python package
COPY ./backend/dist/liberty_framework-1.0.0.tar.gz /app
RUN pip install --no-cache-dir /app/liberty_framework-1.0.0.tar.gz

# Expose FastAPI's default port
EXPOSE 8000

# Start the application
CMD ["liberty-start"]