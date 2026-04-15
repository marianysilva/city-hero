import os

from slowapi import Limiter
from slowapi.util import get_remote_address

# Disabled in tests: slowapi state persists across requests in-process,
# so shared-IP test suites would trip the 5/min cap on /auth/register
# after a handful of tests. Production/dev runs leave it enabled.
_ENABLED = os.environ.get("RATE_LIMIT_ENABLED", "true").lower() != "false"

limiter = Limiter(key_func=get_remote_address, enabled=_ENABLED)
