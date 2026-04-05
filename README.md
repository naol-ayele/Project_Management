# Project Management Component

A reusable, standalone Project Management module for Node.js/Express applications.
Built as part of the ConWise Construction Collaboration System — Component Based Software Integration course.

---

## What It Does

- Create, list, view, and delete construction projects
- Automatic progress tracking initialization on project creation
- Role-Based Access Control (RBAC) at route and service level
- Zod validation with cross-field date ordering checks
- Prisma ORM with PostgreSQL
- Plug into any Express app in one line

---

## Folder Structure

```
src/
  core/
    project.service.js     ← Business logic + DB operations
    project.controller.js  ← HTTP request/response handling
  middleware/
    authenticate.js        ← Auth middleware (swap with your JWT)
    authorize.js           ← RBAC middleware factory
  routes/
    project.routes.js      ← Express router
  validation/
    project.validation.js  ← Zod schemas + validateBody middleware
  utils/
    prisma.js              ← Shared PrismaClient singleton
    roles.js               ← Role constants
    errors.js              ← createError + handleError utilities
  index.js                 ← Public component API
  server.js                ← Standalone demo server
prisma/
  schema.prisma            ← Database schema
tests/                     ← Test files
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Run database migrations
npm run db:migrate

# 4. Start the server
npm run dev
```

---

## API Endpoints

| Method | Endpoint      | Description          | Roles Allowed                          |
| ------ | ------------- | -------------------- | -------------------------------------- |
| POST   | /projects     | Create a new project | COMPANY_ADMIN, PROJECT_MANAGER         |
| GET    | /projects     | List all projects    | All roles (filtered by assignment)     |
| GET    | /projects/:id | Get project detail   | All roles (filtered by assignment)     |
| DELETE | /projects/:id | Delete a project     | COMPANY_ADMIN, PROJECT_MANAGER (owner) |

---

## Testing with Headers

Since this is a standalone component, authentication uses headers:

```
x-user-id: 1
x-user-role: COMPANY_ADMIN
x-company-id: 1
```

---

## RBAC Matrix

| Role            | Create | List          | View Detail   | Delete      |
| --------------- | ------ | ------------- | ------------- | ----------- |
| COMPANY_ADMIN   | can    | All projects  | Any project   | Any project |
| PROJECT_MANAGER | can    | All projects  | Any project   | Own only    |
| SITE_ENGINEER   | can't  | Assigned only | Assigned only | can't       |
| SITE_SUPERVISOR | can't  | Assigned only | Assigned only | can't       |

---

## Integrating Into Another App

```js
import express from "express";
import { projectRouter } from "project-management-component";

const app = express();
app.use(express.json());
app.use("/projects", projectRouter);
```

---

## Built With

- Node.js + Express
- Prisma ORM
- PostgreSQL
- Zod validation
