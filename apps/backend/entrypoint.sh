#!/bin/sh
set -e

export PYTHONPATH=/app:$PYTHONPATH

echo "Running database migrations..."
alembic upgrade head || echo "No migrations to apply (or migration failed — check logs)"

echo "Starting application..."
exec "$@"
