#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# dev.sh — CityHero dev helper for Windows (Git Bash / MINGW64)
#
# Mirrors the macOS Makefile with Podman-compatible commands.
#
# Usage:
#   ./scripts/dev.sh start          # db -> backend -> web -> mobile
#   ./scripts/dev.sh stop           # stop everything
#   ./scripts/dev.sh restart        # stop + start
#   ./scripts/dev.sh status         # show running state
#   ./scripts/dev.sh db             # start only database
#   ./scripts/dev.sh backend        # start only backend (needs db)
#   ./scripts/dev.sh web            # start only web
#   ./scripts/dev.sh mobile         # start only mobile
#   ./scripts/dev.sh design-system  # start only design system (Storybook)
#   ./scripts/dev.sh design         # start only prototype (design/)
#   ./scripts/dev.sh stop-web       # stop only web
#   ./scripts/dev.sh stop-mobile    # stop only mobile
#   ./scripts/dev.sh stop-design-system  # stop only design system
#   ./scripts/dev.sh stop-design    # stop only prototype
#   ./scripts/dev.sh stop-backend   # stop only backend
#   ./scripts/dev.sh stop-db        # stop only database
#   ./scripts/dev.sh logs-web       # tail web logs
#   ./scripts/dev.sh logs-mobile    # tail mobile logs
#   ./scripts/dev.sh logs-design-system  # tail design system logs
#   ./scripts/dev.sh logs-docker    # tail container logs
#   ./scripts/dev.sh setup          # first-time setup + start
#   ./scripts/dev.sh destroy        # remove containers, volumes, gitignored files
# ---------------------------------------------------------------------------
set -euo pipefail

# ── Resolve project root (parent of scripts/) ────────────────────────────────
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ── Colors ────────────────────────────────────────────────────────────────────
BOLD='\033[1m'
RESET='\033[0m'
GREEN='\033[32m'
CYAN='\033[36m'
RED='\033[31m'
YELLOW='\033[33m'

# ── Paths ─────────────────────────────────────────────────────────────────────
LOG_DIR="$ROOT/.logs"
PID_DIR="$ROOT/.pids"
WEB_LOG="$LOG_DIR/web.log"
MOBILE_LOG="$LOG_DIR/mobile.log"
DESIGN_SYSTEM_LOG="$LOG_DIR/design-system.log"
DESIGN_LOG="$LOG_DIR/design.log"
WEB_PID="$PID_DIR/web.pid"
MOBILE_PID="$PID_DIR/mobile.pid"
DESIGN_SYSTEM_PID="$PID_DIR/design-system.pid"
DESIGN_PID="$PID_DIR/design.pid"

# ── Helpers ───────────────────────────────────────────────────────────────────
ensure_dirs() { mkdir -p "$LOG_DIR" "$PID_DIR"; }

wait_for_url() {
  local url="$1" label="$2" timeout="${3:-60}"
  printf "  Waiting for %s" "$label"
  local n=0
  until curl -sf "$url" > /dev/null 2>&1; do
    n=$((n + 1))
    if [ "$n" -ge "$timeout" ]; then
      echo ""
      echo -e "${RED}  x $label did not become ready after ${timeout}s — aborting${RESET}"
      return 1
    fi
    printf "."
    sleep 1
  done
  echo -e " ${GREEN}ready${RESET}"
}

kill_tree() {
  # Recursively kill a PID and its children (Linux/macOS fallback when
  # taskkill is unavailable). pgrep -P lists direct children.
  local pid="$1" child
  for child in $(pgrep -P "$pid" 2>/dev/null); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

kill_pid_file() {
  local pid_file="$1" label="$2"
  if [ -f "$pid_file" ]; then
    local pid
    pid=$(cat "$pid_file")
    echo -e "${RED}-> Stopping $label (PID $pid)...${RESET}"
    if command -v taskkill > /dev/null 2>&1; then
      # Windows (Git Bash): $! (stored here) is the MSYS PID, but taskkill only
      # understands native Windows PIDs. Translate MSYS PID -> WINPID via
      # `ps -W`, then kill the whole tree (//T) so spawned node children die too.
      local winpid
      winpid=$(ps -W 2>/dev/null | awk -v p="$pid" '$1 == p { print $4 }')
      if [ -n "$winpid" ]; then
        taskkill //F //T //PID "$winpid" > /dev/null 2>&1 || true
      fi
    else
      # Linux/macOS: walk the process tree and kill each PID
      kill_tree "$pid"
    fi
    rm -f "$pid_file"
  fi
}

# ── Service: Database ─────────────────────────────────────────────────────────
start_db() {
  echo -e "${CYAN}${BOLD}-> Starting database...${RESET}"
  docker-compose up -d db
  printf "  Waiting for PostgreSQL"
  local n=0
  until docker-compose exec -T db pg_isready -U cityhero > /dev/null 2>&1; do
    n=$((n + 1))
    if [ "$n" -ge 30 ]; then
      echo ""
      echo -e "${RED}  x Database did not become ready after 30s — aborting${RESET}"
      return 1
    fi
    printf "."
    sleep 1
  done
  echo -e " ${GREEN}ready${RESET}"
}

stop_db() {
  echo -e "${RED}-> Stopping database...${RESET}"
  docker-compose stop db 2>/dev/null || true
}

# ── Service: Backend ──────────────────────────────────────────────────────────
start_backend() {
  echo -e "${CYAN}${BOLD}-> Starting backend (migrate + API)...${RESET}"
  # Build and start one at a time to avoid WSL2 TAR errors
  docker-compose up -d migrate
  docker-compose up -d backend
  wait_for_url "http://localhost:8000/docs" "API" 60
}

stop_backend() {
  echo -e "${RED}-> Stopping backend + migrate...${RESET}"
  docker-compose stop backend migrate 2>/dev/null || true
}

# ── Service: Web (Next.js) ────────────────────────────────────────────────────
start_web() {
  ensure_dirs
  echo -e "${CYAN}${BOLD}-> Starting Web (Next.js)...${RESET}"

  # On Windows/Git Bash, npm run scripts delegate to cmd.exe which can't find
  # hoisted binaries. Run next directly via node.
  cd "$ROOT/apps/web"
  node "$ROOT/node_modules/next/dist/bin/next" dev > "$WEB_LOG" 2>&1 &
  echo $! > "$WEB_PID"
  cd "$ROOT"

  echo "  Logging to $WEB_LOG  (PID $(cat "$WEB_PID"))"
  wait_for_url "http://localhost:3000" "Web" 30
}

stop_web() {
  kill_pid_file "$WEB_PID" "Web"
}

# ── Service: Mobile (Expo) ────────────────────────────────────────────────────
start_mobile() {
  ensure_dirs
  echo -e "${CYAN}${BOLD}-> Starting Mobile (Expo web)...${RESET}"

  cd "$ROOT/apps/city-hero"
  node "$ROOT/node_modules/expo/bin/cli" start --web --port 8081 > "$MOBILE_LOG" 2>&1 &
  echo $! > "$MOBILE_PID"
  cd "$ROOT"

  echo "  Logging to $MOBILE_LOG  (PID $(cat "$MOBILE_PID"))"
  wait_for_url "http://localhost:8081" "Mobile" 60
}

stop_mobile() {
  kill_pid_file "$MOBILE_PID" "Mobile"
}

# ── Service: Design System (Storybook) ────────────────────────────────────────
start_design_system() {
  ensure_dirs
  echo -e "${CYAN}${BOLD}-> Starting Design System (Storybook)...${RESET}"

  cd "$ROOT/packages/design_system"
  node "$ROOT/node_modules/storybook/dist/bin/dispatcher.js" dev -p 6006 > "$DESIGN_SYSTEM_LOG" 2>&1 &
  echo $! > "$DESIGN_SYSTEM_PID"
  cd "$ROOT"

  echo "  Logging to $DESIGN_SYSTEM_LOG  (PID $(cat "$DESIGN_SYSTEM_PID"))"
  wait_for_url "http://localhost:6006" "Design System" 20
}

stop_design_system() {
  kill_pid_file "$DESIGN_SYSTEM_PID" "Design System"
}

# ── Service: Prototype (design/ static HTML) ──────────────────────────────────
start_design() {
  ensure_dirs
  echo -e "${CYAN}${BOLD}-> Starting Prototype (design/)...${RESET}"

  cd "$ROOT/design"
  python3 -m http.server 5173 > "$DESIGN_LOG" 2>&1 &
  echo $! > "$DESIGN_PID"
  cd "$ROOT"

  echo "  Logging to $DESIGN_LOG  (PID $(cat "$DESIGN_PID"))"
  wait_for_url "http://localhost:5173" "Prototype" 10
}

stop_design() {
  kill_pid_file "$DESIGN_PID" "Prototype"
}

# ── Logs ──────────────────────────────────────────────────────────────────────
logs_web()           { tail -f "$WEB_LOG"; }
logs_mobile()        { tail -f "$MOBILE_LOG"; }
logs_design_system() { tail -f "$DESIGN_SYSTEM_LOG"; }
logs_docker()        { docker-compose logs -f; }

# ── Composite commands ────────────────────────────────────────────────────────
start_all() {
  start_db
  start_backend
  start_web
  start_mobile
  start_design_system
  start_design
  echo ""
  echo -e "${GREEN}${BOLD}CityHero is running${RESET}"
  echo ""
  echo "  Backend        -> http://localhost:8000/docs"
  echo "  Web            -> http://localhost:3000"
  echo "  Mobile         -> http://localhost:8081"
  echo "  Design System  -> http://localhost:6006"
  echo "  Prototype      -> http://localhost:5173"
  echo ""
  echo "  Logs: ./scripts/dev.sh logs-web | logs-mobile | logs-design-system | logs-docker"
}

stop_all() {
  stop_web
  stop_mobile
  stop_design_system
  stop_design
  stop_backend
  stop_db
  echo -e "${GREEN}${BOLD}All services stopped${RESET}"
}

# ── Status ────────────────────────────────────────────────────────────────────
show_status() {
  echo -e "${BOLD}-- Docker containers ----------------${RESET}"
  docker-compose ps 2>/dev/null || echo "  stopped"

  echo -e "${BOLD}-- Web ------------------------------${RESET}"
  if [ -f "$WEB_PID" ] && kill -0 "$(cat "$WEB_PID")" 2>/dev/null; then
    echo "  running (PID $(cat "$WEB_PID"))"
  else
    echo "  stopped"
  fi

  echo -e "${BOLD}-- Mobile ---------------------------${RESET}"
  if [ -f "$MOBILE_PID" ] && kill -0 "$(cat "$MOBILE_PID")" 2>/dev/null; then
    echo "  running (PID $(cat "$MOBILE_PID"))"
  else
    echo "  stopped"
  fi

  echo -e "${BOLD}-- Design System ---------------------${RESET}"
  if [ -f "$DESIGN_SYSTEM_PID" ] && kill -0 "$(cat "$DESIGN_SYSTEM_PID")" 2>/dev/null; then
    echo "  running (PID $(cat "$DESIGN_SYSTEM_PID"))"
  else
    echo "  stopped"
  fi

  echo -e "${BOLD}-- Prototype ------------------------${RESET}"
  if [ -f "$DESIGN_PID" ] && kill -0 "$(cat "$DESIGN_PID")" 2>/dev/null; then
    echo "  running (PID $(cat "$DESIGN_PID"))"
  else
    echo "  stopped"
  fi
}

# ── First-time setup ─────────────────────────────────────────────────────────
setup() {
  echo -e "${CYAN}${BOLD}-> Setting up environment files...${RESET}"

  if [ ! -f .env ]; then
    cp .env.sample .env
  fi

  if grep -q "SECRET_KEY=your-secret-key-here" .env || grep -q "POSTGRES_PASSWORD=your-password-here" .env; then
    local PG_PASS SECRET ADMIN_PASS USERS_PASS
    PG_PASS=$(openssl rand -hex 16)
    SECRET=$(openssl rand -hex 32)
    ADMIN_PASS=$(openssl rand -hex 8)
    USERS_PASS=$(openssl rand -hex 8)

    # sed -i on Git Bash/MINGW works without the '' argument (unlike macOS)
    sed -i \
      -e "s#POSTGRES_PASSWORD=your-password-here#POSTGRES_PASSWORD=$PG_PASS#" \
      -e "s#DATABASE_URL=postgresql+asyncpg://cityhero:your-password-here@db:5432/cityhero#DATABASE_URL=postgresql+asyncpg://cityhero:$PG_PASS@db:5432/cityhero#" \
      -e "s#SECRET_KEY=your-secret-key-here#SECRET_KEY=$SECRET#" \
      -e "s#APP_ADMIN=admin#APP_ADMIN=admin@cityhero.com#" \
      -e "s#APP_ADMIN_PASSWORD=admin_password#APP_ADMIN_PASSWORD=$ADMIN_PASS#" \
      -e "s#APP_USERS_PASSWORD=user_password#APP_USERS_PASSWORD=$USERS_PASS#" \
      .env

    echo -e "${GREEN}  filled in generated secrets in .env${RESET}"
    echo -e "${YELLOW}  admin login:      admin@cityhero.com / $ADMIN_PASS${RESET}"
    echo -e "${YELLOW}  other seed users: <role>@cityhero.com / $USERS_PASS${RESET}"
  else
    echo "  .env already has real values, skipping."
  fi

  if [ ! -f apps/web/.env.local ]; then
    cp apps/web/.env.sample apps/web/.env.local
    echo -e "${GREEN}  created apps/web/.env.local${RESET}"
  else
    echo "  apps/web/.env.local already exists, skipping."
  fi

  echo -e "${CYAN}${BOLD}-> Installing JS dependencies...${RESET}"
  npm install

  start_all
}

# ── Destroy environment ───────────────────────────────────────────────────────
destroy() {
  echo -e "${RED}${BOLD}WARNING: This will stop all services, remove Docker containers/volumes, and delete every gitignored file (node_modules, .env, .venv, build caches, logs, pids, etc).${RESET}"
  read -rp "Type 'yes' to continue: " confirm
  if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 1
  fi

  stop_web 2>/dev/null || true
  stop_mobile 2>/dev/null || true
  stop_design_system 2>/dev/null || true
  stop_design 2>/dev/null || true

  echo -e "${RED}-> Removing Docker containers and volumes...${RESET}"
  docker-compose down -v 2>/dev/null || true

  echo -e "${RED}-> Removing gitignored files (node_modules, .env, .venv, build caches, logs, pids)...${RESET}"
  git clean -fdx -e .claude/

  echo -e "${GREEN}${BOLD}Environment destroyed.${RESET} Run './scripts/dev.sh setup' to rebuild from scratch."
}

# ── Command router ────────────────────────────────────────────────────────────
case "${1:-help}" in
  start)        start_all ;;
  stop)         stop_all ;;
  restart)      stop_all; start_all ;;
  status)       show_status ;;
  db)                start_db ;;
  backend)           start_backend ;;
  web)               start_web ;;
  mobile)            start_mobile ;;
  design-system)     start_design_system ;;
  design)            start_design ;;
  stop-db)           stop_db ;;
  stop-backend)      stop_backend ;;
  stop-web)          stop_web ;;
  stop-mobile)       stop_mobile ;;
  stop-design-system) stop_design_system ;;
  stop-design)       stop_design ;;
  logs-web)          logs_web ;;
  logs-mobile)       logs_mobile ;;
  logs-design-system) logs_design_system ;;
  logs-docker)       logs_docker ;;
  setup)             setup ;;
  destroy)           destroy ;;
  *)
    echo "CityHero dev helper (Windows / Git Bash)"
    echo ""
    echo "Usage: ./scripts/dev.sh <command>"
    echo ""
    echo "Commands:"
    echo "  start          Start all services (db -> backend -> web -> mobile)"
    echo "  stop           Stop all services"
    echo "  restart        Stop + start"
    echo "  status         Show running state of each service"
    echo ""
    echo "  db             Start only database"
    echo "  backend        Start only backend (needs db)"
    echo "  web            Start only web"
    echo "  mobile         Start only mobile"
    echo "  design-system  Start only design system (Storybook)"
    echo "  design         Start only prototype (design/)"
    echo ""
    echo "  stop-db             Stop only database"
    echo "  stop-backend        Stop only backend"
    echo "  stop-web            Stop only web"
    echo "  stop-mobile         Stop only mobile"
    echo "  stop-design-system  Stop only design system"
    echo "  stop-design         Stop only prototype"
    echo ""
    echo "  logs-web             Tail web logs"
    echo "  logs-mobile          Tail mobile logs"
    echo "  logs-design-system   Tail design system logs"
    echo "  logs-docker          Tail container logs"
    echo ""
    echo "  setup          First-time setup (generate .env, install deps, start)"
    echo "  destroy        Remove containers, volumes, and gitignored files"
    ;;
esac
