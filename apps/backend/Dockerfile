FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only what the production image needs. Explicit list keeps tests/,
# dev-only scripts, and requirements-dev.txt out of the final image regardless
# of .dockerignore rules.
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini ./
COPY main.py ./
COPY entrypoint.sh ./
COPY wait_for_db.py ./

RUN chmod +x entrypoint.sh && \
    addgroup --system app && adduser --system --ingroup app app
USER app

ENTRYPOINT ["/app/entrypoint.sh"]

EXPOSE 8000

CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--timeout", "120"]
