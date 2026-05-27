# Warehouse Management

Warehouse Management is a full-stack inventory management project with a React frontend, a Spring Boot backend, and a MySQL database. The Docker setup in this repo starts the full application and seeds demo data for all main business tables.

## Tech Stack

- Frontend: React, Create React App, Axios
- Backend: Spring Boot 3, Java 17, Maven, Spring Security, JWT, JPA/Hibernate
- Database: MySQL 8.4
- Runtime: Docker Compose

## Project Structure

```text
.
|-- frontend/              # React app
|-- Warehouse_managment/   # Spring Boot backend
|-- product-images/        # Uploaded/demo product images
|-- docker/
|   `-- seed.sql           # Demo data loaded by Docker Compose
|-- docker-compose.yml     # Full local stack
`-- .env.example           # Example Docker environment variables
```

## Run With Docker

Make sure Docker Desktop is running first.

### 1. Create `.env`

```powershell
Copy-Item .env.example .env
```

Default ports:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- MySQL from host machine: `localhost:3307`

### 2. Start The App

```powershell
docker compose up --build
```

Docker Compose will start:

- `db`: MySQL database
- `db-seed`: inserts demo data from `docker/seed.sql`
- `backend`: Spring Boot API
- `frontend`: React build served by Nginx

## Demo Accounts

All demo accounts use the same password:

```text
Admin@123
```

| Email | Role |
| --- | --- |
| `admin@warehouse.local` | `ADMIN` |
| `manager@warehouse.local` | `MANAGER` |
| `purchase@warehouse.local` | `PURCHASE_STAFF` |
| `sales@warehouse.local` | `SALE_STAFF` |
| `warehouse@warehouse.local` | `WAREHOUSE_STAFF` |

## Demo Data

The Docker seed file includes data for the main application flows:

- Users and roles
- Categories
- Suppliers
- Warehouses
- Products
- Inventory
- Customers
- Purchase requests
- Purchase orders
- Stock inward records
- Sales orders
- Stock takes
- Tasks
- Inventory movements
- Activity logs

The SQL file in `docker/seed.sql` is the file used by Docker. If you have another schema-only SQL file, it will not add data unless it contains `INSERT INTO` statements.

## Useful Docker Commands

Stop containers:

```powershell
docker compose down
```

Stop containers and delete the MySQL volume:

```powershell
docker compose down -v
```

Reset the database and load demo data again:

```powershell
docker compose down -v
docker compose up --build
```

Run only the seed service again on the current database:

```powershell
docker compose up db-seed --force-recreate
```

Check running containers:

```powershell
docker compose ps
```

View backend logs:

```powershell
docker compose logs backend --tail 100
```

## Local Development Without Docker

Backend:

```powershell
cd Warehouse_managment
.\mvnw.cmd spring-boot:run
```

Frontend:

```powershell
cd frontend
npm install
npm start
```

When running locally without Docker, the backend expects MySQL at `localhost:3306` by default. With Docker, the backend uses the internal service name `db`.

## Environment Variables

The backend reads database and JWT configuration from environment variables when running in Docker:

| Variable | Default |
| --- | --- |
| `MYSQL_DATABASE` | `inventory_db` |
| `MYSQL_ROOT_PASSWORD` | `root123` |
| `MYSQL_HOST_PORT` | `3307` |
| `BACKEND_HOST_PORT` | `8081` |
| `FRONTEND_HOST_PORT` | `3000` |
| `SECRET_JWT_STRING` | `change-this-jwt-secret` |

## Notes

- Frontend Nginx proxies `/api`, `/assets`, and `/images` to the backend container.
- Product images are persisted through the host `product-images` folder.
- MySQL data is stored in a Docker volume named `warehouse_management_mysql_data`.
- If port `3000`, `8081`, or `3307` is already used, change the matching value in `.env`.
