# Collector's Vault

Collector's Vault is a full-stack marketplace application for buying and selling collectibles such as trading cards, comics, figures, vinyl toys, and sealed collector items.

The application currently supports:

* Buyer, Seller, and Admin roles
* Marketplace browsing with seeded listings
* Listing detail pages with Buy Now flow
* Seller listing creation and order management
* Buyer dashboard and order history
* Profile and address management
* Admin dashboard with users, listings, and orders overview
* Public and private seed datasets
* Dockerized local environment
* Base Playwright smoke tests

---

## Tech Stack

### Frontend

* Angular
* TypeScript
* Bootstrap

### Backend

* Node.js
* Express
* JavaScript (ES Modules)

### Database

* MySQL 8

### Infrastructure

* Docker Compose
* Nginx reverse proxy
* ECS task definition (production deployment path)

### Testing

* Playwright 1.58.2

---

## Project Structure

```bash
collectors-vault/
│
├── backend/
│   ├── src/
│   ├── scripts/
│   ├── tests/
│   ├── package.json
│   ├── Dockerfile
│   ├── Dockerfile.ecs
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   ├── Dockerfile.ecs
│
├── nginx/
│   ├── default.conf
│
├── database/
│   ├── init/
│
├── ecs/
│   ├── task-definition.json
│
├── attack_scope.json
├── docker-compose.yml
└── README.md
```

---

## Run Entire App Locally (Recommended)

The easiest way to run the full stack locally is with Docker.

- Public

```bash
docker compose up --build
```

- Private

```bash
docker compose -f docker-compose.yml -f docker-compose.private.yml up --build
```

Services started:

* MySQL
* Backend API
* Angular frontend
* Nginx reverse proxy

Application runs at:

```bash
http://localhost
```

Health check:

```bash
http://localhost/health
```

To verify services:

```bash
docker compose ps
```

All services should show:

```bash
healthy
```

---

## Docker Services

### MySQL

Runs on:

```bash
3306
```

### Backend API

Internal container port:

```bash
3000
```

### Frontend

Internal container port:

```bash
4200
```

### Nginx

Exposed publicly on:

```bash
80
```

---

## Database Setup (Without Docker)

If running manually:

### Create Database

```sql
CREATE DATABASE collectors_vault;
```

### Use Database

```sql
USE collectors_vault;
```

### Backend install

```bash
cd backend
npm install
```

### Run migration

```bash
npm run migrate
```

### Public seed

```bash
npm run seed:public
```

### Private seed

```bash
npm run seed:private
```

---

## Run Backend Manually

```bash
cd backend
npm install
npm run dev
```

Backend runs at:

```bash
http://localhost:3000
```

---

## Run Frontend Manually

```bash
cd frontend
npm install
npm start
```

Frontend runs at:

```bash
http://localhost:4200
```

---

## Seed Data

Two seed modes are available:

### Public Seed

```bash
npm run seed:public
```

Used for:

* local review
* smoke testing
* base app verification

### Private Seed

```bash
npm run seed:private
```

Uses:

* same schema
* different records
* different credentials

---

## Roles Supported

### Buyer

* browse marketplace
* buy listings
* manage addresses
* view orders

### Seller

* create listings
* manage seller orders

### Admin

* access admin dashboard
* view users
* view listings
* view orders
* access seller features

---

## Base Smoke Tests

Playwright tests are included.

### Install browsers once

```bash
cd backend
npx playwright install
```

### Run tests

```bash
npm run test:e2e
```

Tests cover:

* health endpoint
* marketplace load
* login page
* signup page
* listing detail navigation
* seeded login flow

---

## ECS Production Notes

Production deployment uses:

* backend with `NODE_ENV=production`
* frontend static build served by nginx
* ECS task definition under `/ecs`

Frontend production image uses multi-stage build:

* Angular build stage
* nginx static serving stage

---

## Security Scope

Security testing scope is declared in:

```bash
attack_scope.json
```

Includes:

* auth routes
* admin routes
* JWT handling
* role protection
* input validation
* API access control

---

## Common Issues

### Port Already In Use

```bash
lsof -i :3000
kill -9 <PID>
```

### Docker Not Running

Start Docker Desktop before:

```bash
docker compose up
```

### Angular Cannot Reach Backend

Check:

* nginx running
* backend healthy
* proxy configuration

### Database Connection Error

Verify:

* DB_HOST
* DB_PORT
* DB_USER
* DB_PASSWORD
* DB_NAME

---

## Development Tooling Declaration

This project was developed using approved coding-assistance workflow constraints and follows benchmark submission requirements for reproducible local execution, seeded data consistency, and containerized review.
