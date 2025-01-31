FROM python:3.12-slim

WORKDIR /app
COPY ./backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt
COPY ./backend/app /app

CMD ["fastapi", "run", "app/main.py", "--port", "8000"]