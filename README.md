# LinkShort

A no-nonsense URL shortener built with Go & React.

## Getting Started

Follow these steps to set up the project for development or production.

### Database

**LinkShort uses SQLite**: No manual database installation required. The SQLite database file is created automatically on first run, and migrations are applied at startup.

---

## Installation

You can run LinkShort with Docker or manually.

### Docker (Recommended)

#### Prerequisites
- Docker & Docker Compose

#### Steps

1. **Copy Docker configuration files**
   
   The `scripts` directory contains ready-to-use Docker configurations:
   ```bash
   cp scripts/Dockerfile .
   cp scripts/compose.yaml .
   ```

2. **Prepare environment variables**
   
   Copy and edit the configuration files:
   ```bash
   # Backend config
   cp example.linkshort.yaml .linkshort.yaml
   # Edit .linkshort.yaml as needed
   
   # Frontend config
   cp web/env.example web/.env
   # Edit web/.env to match your environment
   ```

3. **Build and start**
   ```bash
   make build-docker
   ```

4. **Rebuild (if needed)**
   ```bash
   make re-build-docker
   ```

5. **Stop**
   ```bash
   make down-docker
   ```

**Notes:**
- Ensure `.linkshort.yaml` is in your working directory and mounted into the container
- Database migrations run automatically on container startup[2]
- Access the app at [http://localhost:8000](http://localhost:8000)

***

### Manual Setup

#### Frontend

1. **Install dependencies**
   
   Requires Node.js and npm.
   ```bash
   cd web
   npm install
   ```

2. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env as needed
   ```

3. **Development mode**
   ```bash
   npm run dev
   ```
   Access at [http://localhost:3001](http://localhost:3001)

4. **Production build**
   ```bash
   npm run build
   ```

#### Backend

1. **Prerequisites**
   
   Install Go 1.21+ and ensure it's in your PATH.

2. **Configure**
   ```bash
   cp example.linkshort.yaml .linkshort.yaml
   # Edit .linkshort.yaml as needed
   ```

3. **Build**
   ```bash
   make build
   ```

4. **Run**
   ```bash
   ./linkshort --conf .linkshort.yaml
   ```
---

## Makefile

View all available commands:

```bash
make help
```

***

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
