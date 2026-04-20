# AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (nodemon)
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client to generated/prisma/
npm run test         # Run tests (Jest)
npm run test:watch   # Run tests in watch mode
```

## Testing Auth Headers

Since this is a standalone component without real auth, pass user context via headers:

```
x-user-id: 1
x-user-role: COMPANY_ADMIN | PROJECT_MANAGER | SITE_ENGINEER | SITE_SUPERVISOR
x-company-id: 1
```

## Tech Stack Quirks

- **ES Modules**: `"type": "module"` in package.json — use `.js` extensions in imports
- **Express 5.x**: Different from Express 4 (e.g., `next('route')` removed, async errors work differently)
- **Zod 4.x**: Uses `z.string().date()` for date validation, not `z.date()` for strings
- **Prisma client**: Generated to `generated/prisma/` (not `node_modules`), must import from there
- **Prisma singleton**: Use `src/utils/prisma.js` singleton, not `new PrismaClient()` in each file

## Architecture

- **Public API**: `src/index.js` — import from here for integration
- **Demo server**: `src/server.js` — standalone Express app for testing
- **Service layer**: `src/core/project.service.js` — all business logic
- **Entry point**: `src/routes/project.routes.js` — routes to `projectController`

## RBAC Rules

| Role             | Create | List       | View        | Delete           |
| ---------------- | ------ | ---------- | ----------- | ---------------- |
| COMPANY_ADMIN    | ✓      | All        | Any         | Any              |
| PROJECT_MANAGER  | ✓      | All        | Any         | Own projects     |
| SITE_ENGINEER    | ✗      | Assigned   | Assigned    | ✗                |
| SITE_SUPERVISOR  | ✗      | Assigned   | Assigned    | ✗                |

## Current State

- **No lint/typecheck tooling** configured
- **Tests directory**: Setup complete, tests in progress (Week 2)
