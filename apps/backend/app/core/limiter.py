import os

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    enabled=os.getenv("TESTING") != "1",
)

# Overridable via .env so local/e2e dev doesn't have to wait out the full
# production window between test runs (e.g. LOGIN_RATE_LIMIT="5/10 second" —
# see docker-compose.override.yml). Defaults match production. Read once at
# import time, same as graphql_rate_limit.py's _RATE — restart the backend
# process to pick up a changed value.
LOGIN_RATE_LIMIT = os.getenv("LOGIN_RATE_LIMIT", "5/minute")
REGISTER_RATE_LIMIT = os.getenv("REGISTER_RATE_LIMIT", "3/minute")
