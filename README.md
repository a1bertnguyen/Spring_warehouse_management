# Warehouse Management

## Run with Docker

This repo has:

- `frontend`: React app
- `Warehouse_managment`: Spring Boot backend
- `db`: MySQL via Docker Compose

### 1. Prepare environment variables

Copy `.env.example` to `.env` and adjust values if needed:

```powershell
Copy-Item .env.example .env
```

Important defaults:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8081`
- MySQL on host: `localhost:3307`

### 2. Start the full stack

```powershell
docker compose up --build
```

### 3. Open the app

- Frontend: `http://localhost:3000`
- Swagger UI: `http://localhost:8081/swagger-ui.html`

### Notes

- Frontend proxies `/api`, `/assets`, and `/images` to the backend through Nginx, so the browser does not need a hard-coded backend URL.
- Uploaded product images are persisted on the host in `product-images` through a bind mount.
- MySQL host port is `3307` by default to reduce conflicts with an existing local MySQL instance.

### Stop containers

```powershell
docker compose down
```

To also remove the MySQL volume:

```powershell
docker compose down -v
```
