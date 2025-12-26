# Docker / Postgres setup (local)

This project defaults to SQLite for local development. To run a local Postgres instance using Docker and switch Prisma to Postgres, follow these steps:

1. Start Postgres with Docker Compose:

```bash
docker compose up -d
```

2. Copy the example env and set `DATABASE_URL` to point at the Docker Postgres:

```bash
cp .env.example .env
# (edit .env if you need different credentials)
```

3. Update Prisma schema to use Postgres (manual step):

- Open `prisma/schema.prisma` and change the datasource to:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

4. Generate client and run migrations:

```bash
# generate client
npx prisma generate

# create a migration (first time)
npx prisma migrate dev --name init
```

5. Run the app:

```bash
npm run dev
```

Notes:
- If you want Docker to also build/run the Next app, I can add a `Dockerfile` and extend `docker-compose.yml` with an `app` service. Tell me if you'd like that.
- If you prefer to keep using SQLite locally, you do not need to change anything.
