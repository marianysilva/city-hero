#!/bin/bash
# Creates a second database for tests alongside the main one.
# Runs only on first container init (when pgdata volume is empty).
set -e

if [ -z "$POSTGRES_DB_TEST" ]; then
  echo "POSTGRES_DB_TEST not set, skipping test DB creation"
  exit 0
fi

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE "$POSTGRES_DB_TEST";
  \connect "$POSTGRES_DB_TEST"
  CREATE EXTENSION IF NOT EXISTS postgis;
EOSQL
