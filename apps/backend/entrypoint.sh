#!/bin/sh
set -e

export PYTHONPATH=/app:$PYTHONPATH

echo "Waiting for database..."
python wait_for_db.py

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
exec "$@"
