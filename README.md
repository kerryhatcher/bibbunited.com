# BIBB United

Civic advocacy website for the BIBB community -- informing and activating residents on local school system issues.

## Tech Stack

- **Next.js 16** + React 19 + TypeScript
- **Payload CMS 3.x** (runs inside Next.js)
- **Tailwind CSS 4** (CSS-first config)
- **PostgreSQL 16** via `@payloadcms/db-postgres`

## Local Development

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js 20+](https://nodejs.org/) and [pnpm](https://pnpm.io/)

### Start with Docker Compose (recommended)

Docker Compose starts both the PostgreSQL database and the Next.js dev server:

```bash
docker compose up
```

The app will be available at **http://localhost:3000** and the Payload admin at **http://localhost:3000/admin**.

To run in the background:

```bash
docker compose up -d
docker compose logs -f app   # follow app logs
```

To stop:

```bash
docker compose down           # stop containers (preserves data)
docker compose down -v        # stop and delete database volume
```

### Seed Data

To seed the database with sample content:

```bash
docker compose exec app pnpm seed
```

### Running Outside Docker

If you prefer running Next.js locally (e.g., for faster HMR), you still need Docker for the database:

```bash
# Start only the database
docker compose up -d db

# Create .env from example (update if needed)
cp .env.example .env

# Install dependencies and start dev server
pnpm install
pnpm dev
```

Note: The `.env.example` default `DATABASE_URI` uses port `5499` which maps to the dockerized PostgreSQL.

## Project Structure

```
src/
  app/(frontend)/     # Public-facing pages (App Router)
  app/(payload)/      # Payload admin UI
  collections/        # Payload CMS collection configs
  components/         # React components (layout, ui, shared, homepage)
  lib/                # Utility functions
```
