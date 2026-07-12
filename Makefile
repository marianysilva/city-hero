.PHONY: start stop restart status \
        colima db backend web mobile design-system design \
        stop-colima stop-db stop-backend stop-web stop-mobile stop-design-system stop-design \
        logs-web logs-mobile logs-design-system logs-docker \
        destroy-environment setup

# ── Colors ────────────────────────────────────────────────────────────────────
BOLD  := \033[1m
RESET := \033[0m
GREEN := \033[32m
CYAN  := \033[36m
RED   := \033[31m
YELLOW := \033[33m

# ── Paths / files (absolute so they survive any cd) ───────────────────────────
WEB_LOG           := $(CURDIR)/.logs/web.log
MOBILE_LOG        := $(CURDIR)/.logs/mobile.log
DESIGN_SYSTEM_LOG := $(CURDIR)/.logs/design-system.log
DESIGN_LOG        := $(CURDIR)/.logs/design.log
WEB_PID           := $(CURDIR)/.pids/web.pid
MOBILE_PID        := $(CURDIR)/.pids/mobile.pid
DESIGN_SYSTEM_PID := $(CURDIR)/.pids/design-system.pid
DESIGN_PID        := $(CURDIR)/.pids/design.pid

# ── Dependency chain: colima → db → backend → web + mobile + design-system + design ──
start: colima db backend web mobile design-system design
	@echo ""
	@echo "$(GREEN)$(BOLD)✓ CityHero is running$(RESET)"
	@echo ""
	@echo "  Backend        → http://localhost:8000/docs"
	@echo "  Web            → http://localhost:3000"
	@echo "  Mobile         → http://localhost:8081"
	@echo "  Design System  → http://localhost:6006"
	@echo "  Prototype      → http://localhost:5173"
	@echo ""
	@echo "  Logs: make logs-web | make logs-mobile | make logs-design-system | make logs-docker"

# ── Colima ────────────────────────────────────────────────────────────────────
colima:
	@echo "$(CYAN)$(BOLD)→ Starting Colima...$(RESET)"
	@if colima status 2>/dev/null | grep -q "Running"; then \
		echo "  already running, skipping."; \
	else \
		colima start --cpu 8 --memory 16 --disk 10; \
	fi

# ── Database ──────────────────────────────────────────────────────────────────
db:
	@echo "$(CYAN)$(BOLD)→ Starting database...$(RESET)"
	@docker-compose up -d db
	@printf "  Waiting for PostgreSQL"
	@n=0; \
	until docker-compose exec -T db pg_isready -U cityhero > /dev/null 2>&1; do \
		n=$$((n + 1)); \
		if [ $$n -ge 30 ]; then \
			echo ""; \
			echo "$(RED)  ✗ Database did not become ready after 30s — aborting$(RESET)"; \
			exit 1; \
		fi; \
		printf "."; sleep 1; \
	done
	@echo " $(GREEN)ready$(RESET)"

# ── Backend (migrate + API) ───────────────────────────────────────────────────
backend:
	@echo "$(CYAN)$(BOLD)→ Starting backend (migrate + API)...$(RESET)"
	@docker-compose up -d migrate backend
	@printf "  Waiting for API"
	@n=0; \
	until curl -sf http://localhost:8000/docs > /dev/null 2>&1 || \
	      curl -sf http://localhost:8000/health > /dev/null 2>&1; do \
		n=$$((n + 1)); \
		if [ $$n -ge 60 ]; then \
			echo ""; \
			echo "$(RED)  ✗ Backend did not become ready after 60s — aborting$(RESET)"; \
			echo "$(YELLOW)  Tip: run 'make logs-docker' to see what went wrong$(RESET)"; \
			exit 1; \
		fi; \
		printf "."; sleep 1; \
	done
	@echo " $(GREEN)ready$(RESET)"

# ── Apps (local, not Docker) ──────────────────────────────────────────────────
web:
	@mkdir -p $(CURDIR)/.logs $(CURDIR)/.pids
	@echo "$(CYAN)$(BOLD)→ Starting Web (Next.js)...$(RESET)"
	@cd apps/web && npm run dev > $(WEB_LOG) 2>&1 & echo $$! > $(WEB_PID)
	@echo "  Logging to $(WEB_LOG)  (PID $$(cat $(WEB_PID)))"

mobile:
	@mkdir -p $(CURDIR)/.logs $(CURDIR)/.pids
	@echo "$(CYAN)$(BOLD)→ Starting Mobile (Expo web)...$(RESET)"
	@cd apps/city-hero && npx expo start --web > $(MOBILE_LOG) 2>&1 & echo $$! > $(MOBILE_PID)
	@echo "  Logging to $(MOBILE_LOG)  (PID $$(cat $(MOBILE_PID)))"

design-system:
	@mkdir -p $(CURDIR)/.logs $(CURDIR)/.pids
	@echo "$(CYAN)$(BOLD)→ Starting Design System (Storybook)...$(RESET)"
	@cd packages/design_system && npm run storybook > $(DESIGN_SYSTEM_LOG) 2>&1 & echo $$! > $(DESIGN_SYSTEM_PID)
	@echo "  Logging to $(DESIGN_SYSTEM_LOG)  (PID $$(cat $(DESIGN_SYSTEM_PID)))"

design:
	@mkdir -p $(CURDIR)/.logs $(CURDIR)/.pids
	@echo "$(CYAN)$(BOLD)→ Starting Prototype (design/)...$(RESET)"
	@cd design && python3 -m http.server 5173 > $(DESIGN_LOG) 2>&1 & echo $$! > $(DESIGN_PID)
	@echo "  Logging to $(DESIGN_LOG)  (PID $$(cat $(DESIGN_PID)))"

# ── Logs ──────────────────────────────────────────────────────────────────────
logs-web:
	@tail -f $(WEB_LOG)

logs-mobile:
	@tail -f $(MOBILE_LOG)

logs-design-system:
	@tail -f $(DESIGN_SYSTEM_LOG)

logs-docker:
	@docker-compose logs -f

# ── Stop ──────────────────────────────────────────────────────────────────────
stop: stop-web stop-mobile stop-design-system stop-design stop-backend stop-db
	@echo "$(GREEN)$(BOLD)✓ All services stopped$(RESET)"

stop-web:
	@if [ -f $(WEB_PID) ]; then \
		echo "$(RED)→ Stopping Web...$(RESET)"; \
		kill_tree() { for c in $$(pgrep -P "$$1" 2>/dev/null); do kill_tree "$$c"; done; kill "$$1" 2>/dev/null || true; }; \
		kill_tree $$(cat $(WEB_PID)); \
		rm -f $(WEB_PID); \
	fi

stop-mobile:
	@if [ -f $(MOBILE_PID) ]; then \
		echo "$(RED)→ Stopping Mobile...$(RESET)"; \
		kill_tree() { for c in $$(pgrep -P "$$1" 2>/dev/null); do kill_tree "$$c"; done; kill "$$1" 2>/dev/null || true; }; \
		kill_tree $$(cat $(MOBILE_PID)); \
		rm -f $(MOBILE_PID); \
	fi

stop-design-system:
	@if [ -f $(DESIGN_SYSTEM_PID) ]; then \
		echo "$(RED)→ Stopping Design System...$(RESET)"; \
		kill_tree() { for c in $$(pgrep -P "$$1" 2>/dev/null); do kill_tree "$$c"; done; kill "$$1" 2>/dev/null || true; }; \
		kill_tree $$(cat $(DESIGN_SYSTEM_PID)); \
		rm -f $(DESIGN_SYSTEM_PID); \
	fi

stop-design:
	@if [ -f $(DESIGN_PID) ]; then \
		echo "$(RED)→ Stopping Prototype...$(RESET)"; \
		kill_tree() { for c in $$(pgrep -P "$$1" 2>/dev/null); do kill_tree "$$c"; done; kill "$$1" 2>/dev/null || true; }; \
		kill_tree $$(cat $(DESIGN_PID)); \
		rm -f $(DESIGN_PID); \
	fi

stop-backend:
	@echo "$(RED)→ Stopping backend + migrate...$(RESET)"
	@docker-compose stop backend migrate 2>/dev/null || true

stop-db:
	@echo "$(RED)→ Stopping database...$(RESET)"
	@docker-compose stop db 2>/dev/null || true

stop-colima:
	@echo "$(RED)→ Stopping Colima...$(RESET)"
	@colima stop

# ── Helpers ───────────────────────────────────────────────────────────────────
status:
	@echo "$(BOLD)── Colima ───────────────────────────$(RESET)"
	@colima status 2>/dev/null || echo "  stopped"
	@echo "$(BOLD)── Docker ───────────────────────────$(RESET)"
	@docker-compose ps 2>/dev/null || echo "  stopped"
	@echo "$(BOLD)── Web ──────────────────────────────$(RESET)"
	@if [ -f $(WEB_PID) ] && kill -0 $$(cat $(WEB_PID)) 2>/dev/null; then \
		echo "  running (PID $$(cat $(WEB_PID)))"; \
	else echo "  stopped"; fi
	@echo "$(BOLD)── Mobile ───────────────────────────$(RESET)"
	@if [ -f $(MOBILE_PID) ] && kill -0 $$(cat $(MOBILE_PID)) 2>/dev/null; then \
		echo "  running (PID $$(cat $(MOBILE_PID)))"; \
	else echo "  stopped"; fi
	@echo "$(BOLD)── Design System ────────────────────$(RESET)"
	@if [ -f $(DESIGN_SYSTEM_PID) ] && kill -0 $$(cat $(DESIGN_SYSTEM_PID)) 2>/dev/null; then \
		echo "  running (PID $$(cat $(DESIGN_SYSTEM_PID)))"; \
	else echo "  stopped"; fi
	@echo "$(BOLD)── Prototype ────────────────────────$(RESET)"
	@if [ -f $(DESIGN_PID) ] && kill -0 $$(cat $(DESIGN_PID)) 2>/dev/null; then \
		echo "  running (PID $$(cat $(DESIGN_PID)))"; \
	else echo "  stopped"; fi

restart: stop start

# ── Full teardown / rebuild ────────────────────────────────────────────────────
# destroy-environment deletes the Colima VM, which wipes ALL Docker data on this
# machine (not just CityHero's containers/volumes/images) — not scoped to this
# project. setup is the inverse: it recreates .env files with freshly
# generated secrets (only if missing), installs JS deps, and starts everything.
destroy-environment:
	@echo "$(RED)$(BOLD)⚠ This will delete the Colima VM (ALL Docker data on this machine, not just CityHero), stop all local services, and remove every gitignored file (node_modules, .env, .venv, build caches, logs, pids, etc).$(RESET)"
	@read -p "Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ] || (echo "Aborted."; exit 1)
	@$(MAKE) stop-web stop-mobile 2>/dev/null || true
	@echo "$(RED)→ Deleting Colima VM (also removes all Docker containers/images/volumes)...$(RESET)"
	@colima delete --data -f 2>/dev/null || true
	@echo "$(RED)→ Removing gitignored files (node_modules, .env, .venv, build caches, logs, pids)...$(RESET)"
	@git clean -fdx -e .claude/
	@echo "$(GREEN)$(BOLD)✓ Environment destroyed.$(RESET) Run 'make setup' to rebuild from scratch."

setup:
	@echo "$(CYAN)$(BOLD)→ Setting up environment files...$(RESET)"
	@if [ ! -f .env ]; then cp .env.sample .env; fi
	@if grep -q "SECRET_KEY=your-secret-key-here" .env || grep -q "POSTGRES_PASSWORD=your-password-here" .env; then \
		PG_PASS=$$(openssl rand -hex 16); \
		SECRET=$$(openssl rand -hex 32); \
		ADMIN_PASS=$$(openssl rand -hex 8); \
		USERS_PASS=$$(openssl rand -hex 8); \
		sed -i '' \
			-e "s#POSTGRES_PASSWORD=your-password-here#POSTGRES_PASSWORD=$$PG_PASS#" \
			-e "s#DATABASE_URL=postgresql+asyncpg://cityhero:your-password-here@db:5432/cityhero#DATABASE_URL=postgresql+asyncpg://cityhero:$$PG_PASS@db:5432/cityhero#" \
			-e "s#SECRET_KEY=your-secret-key-here#SECRET_KEY=$$SECRET#" \
			-e "s#APP_ADMIN=admin#APP_ADMIN=admin@cityhero.com#" \
			-e "s#APP_ADMIN_PASSWORD=admin_password#APP_ADMIN_PASSWORD=$$ADMIN_PASS#" \
			-e "s#APP_USERS_PASSWORD=user_password#APP_USERS_PASSWORD=$$USERS_PASS#" \
			.env; \
		echo "$(GREEN)  filled in generated secrets in .env$(RESET)"; \
		echo "$(YELLOW)  admin login:      admin@cityhero.com / $$ADMIN_PASS$(RESET)"; \
		echo "$(YELLOW)  other seed users: <role>@cityhero.com / $$USERS_PASS$(RESET)"; \
	else \
		echo "  .env already has real values, skipping."; \
	fi
	@if [ ! -f apps/web/.env.local ]; then \
		cp apps/web/.env.sample apps/web/.env.local; \
		echo "$(GREEN)  created apps/web/.env.local$(RESET)"; \
	else \
		echo "  apps/web/.env.local already exists, skipping."; \
	fi
	@echo "$(CYAN)$(BOLD)→ Installing JS dependencies...$(RESET)"
	@npm install
	@$(MAKE) start
