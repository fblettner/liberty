# Use Python 3.12 slim image
FROM python:3.12-slim

# Install system dependencies (PostgreSQL client + others)
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

VOLUME /app/liberty-framework
ENV PIP_TARGET=/app/liberty-framework
ENV PYTHONPATH=$PIP_TARGET
ENV PATH="/app/liberty-framework/bin:$PATH"

# Copy and install the Python package
COPY ./backend/dist/*.tar.gz /app/liberty-framework-latest.tar.gz
RUN pip install --target=$PIP_TARGET --no-cache-dir /app/liberty-framework-latest.tar.gz

# Expose FastAPI's default port
EXPOSE 8000

# Start the application
CMD ["liberty-start"]