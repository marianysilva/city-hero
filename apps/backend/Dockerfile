FROM python:3.11-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# One-shot job: runs alembic upgrade head and exits.
# Used by docker-compose migrate service before the app starts.
FROM base AS migrate
CMD ["alembic", "upgrade", "head"]

# Application server.
FROM base AS app
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
