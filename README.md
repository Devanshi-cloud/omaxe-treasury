# Omaxe Treasury — Invoice Processing Platform

A full-stack Next.js application for corporate treasury invoice management.

## Stack

- **Frontend**: Next.js 16 (App Router) + React 19 — no external UI library
- **Backend**: Next.js API Routes (App Router)
- **ORM**: Prisma 7 + PostgreSQL
- **Auth**: JWT (httpOnly cookies) + bcrypt

## Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE omaxe_treasury;
```

### 2. Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/omaxe_treasury"
JWT_SECRET="your-secret-key-here"
```

### 3. Install & Migrate

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate
# When prompted, name the migration: init

# Seed with initial data (users + sample invoices)
npm run db:seed
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

## Default Login Credentials

All users have password: `password`

| Username | Role | Access |
|---|---|---|
| sanket.mhapankar | Admin | Full access |
| priya.nair | Team A | Invoice entry |
| daleep.kumar | Team B | ERP processing |
| naveen.garg | Team C | Payments |

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login → sets httpOnly JWT cookie |
| GET | `/api/auth/me` | Get current session user |
| POST | `/api/auth/logout` | Clear session cookie |
| GET | `/api/invoices` | List invoices (filters: tab, status, search, billType) |
| POST | `/api/invoices` | Create new invoice |
| GET | `/api/invoices/[id]` | Get single invoice |
| PATCH | `/api/invoices/[id]` | Update status / hold reason / assignee |
| DELETE | `/api/invoices/[id]` | Delete invoice (Admin only) |
| GET | `/api/dashboard/summary` | Dashboard KPIs, aging, employee stats |
| GET | `/api/admin/users` | List all users (Admin only) |
| POST | `/api/admin/users` | Create user (Admin only) |
| GET | `/api/master/departments` | List departments |
| GET | `/api/master/companies` | List companies |
| GET | `/api/master/projects` | List projects |

## Migration Commands

```bash
# Create and apply a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database and re-seed
npx prisma migrate reset
```

## Project Structure

```
app/
  api/
    auth/         login, me, logout
    invoices/     list, create, [id] update/delete
    dashboard/    summary (KPIs, aging, employee stats)
    admin/users   user management
    master/       departments, companies, projects
  components/
    LoginScreen, AppShell, DashboardPage,
    InvoicesPage, EntryPage, AnalyticsPage,
    AdminPage, Toast
  globals.css     All styles (CSS variables, no Tailwind)
  layout.js
  page.js
lib/
  prisma.js       Prisma client singleton
  auth.js         JWT sign/verify, getSession helper
prisma/
  schema.prisma   Data models
  seed.js         Initial seed data
```
