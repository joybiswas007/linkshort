# ==============================================================================
# Project Configuration
# ==============================================================================
BINARY_NAME = linkshort
API_ENTRY = cmd/api/main.go

# ==============================================================================
# Build Versioning
#
# These variables are evaluated once and used to inject build-time information
# into the Go binaries. This is useful for tracking versions and builds.
# ==============================================================================
GIT_COMMIT := $(shell git rev-parse --short HEAD)
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
#Current UTC time in milliseconds.
BUILD_TIME := $(shell date -u +%s%3N)

# Go linker flags to inject the build-time variables.
# The `-s -w` flags strip debugging information, reducing the binary size.
LDFLAGS := -ldflags="-s -w \
	-X 'main.BuildCommit=$(GIT_COMMIT)' \
	-X 'main.BuildBranch=$(GIT_BRANCH)' \
	-X 'main.BuildTime=$(BUILD_TIME)'"

# ------------------------------------------------------------------------------
# Build Targets
# ------------------------------------------------------------------------------
# Build the main API binary.
build:
	@echo "==> Building API binary: $(BINARY_NAME)"
	@CGO_ENABLED=1 go build $(LDFLAGS) -o $(BINARY_NAME) $(API_ENTRY)

# Run the API application directly.
run:
	@echo "==> Running API from $(API_ENTRY)..."
	@go run $(API_ENTRY)


# ------------------------------------------------------------------------------
# Docker Targets
#
# The common setup logic has been moved to a `docker-setup` prerequisite to
# avoid repetition between `build-docker` and `re-build-docker`.
# ------------------------------------------------------------------------------
# Build and run the docker containers.
build-docker: docker-setup
	@echo "==> Starting Docker containers..."
	@docker compose up -d

# Rebuild and run the docker containers.
re-build-docker: docker-setup
	@echo "==> Rebuilding and starting Docker containers..."
	@docker compose up --build -d

# Shut down and remove the docker containers.
docker-down:
	@echo "==> Shutting down Docker containers..."
	@docker compose down

# Prerequisite target for Docker commands to ensure the environment is ready.
docker-setup:
	@echo "==> Preparing Docker environment..."
	@command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is not installed. Aborting."; exit 1; }
	@command -v docker compose >/dev/null 2>&1 || { echo >&2 "Docker Compose ($(COMPOSE_CMD)) could not be found. Aborting."; exit 1; }
	@touch links.db
	@chmod 666 links.db

# ------------------------------------------------------------------------------
# Development & QA
# ------------------------------------------------------------------------------
# Run all tests in the project.
test:
	@echo "==> Running tests..."
	@go test ./...

# Lint the codebase using golangci-lint.
lint:
	@command -v golangci-lint >/dev/null 2>&1 || { echo >&2 "golangci-lint is not installed. Please run: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest"; exit 1; }
	@echo "==> Linting code..."
	@golangci-lint run ./...

# Live reload using Air.
# Removed interactive install. It's better practice to fail with a clear
# message instructing the user how to install the missing dependency.
watch:
	@if ! command -v air >/dev/null 2>&1; then \
		echo "ERROR: Air is not installed. It is required for live reloading."; \
		echo "Please run: go install github.com/air-verse/air@latest"; \
		exit 1; \
	fi
	@echo "==> Starting Air for live reload...";
	@air
