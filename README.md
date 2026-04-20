# Project Management Monorepo

NPM workspaces monorepo containing a reusable Project Management component and demo application.

---

## Packages

### packages/core

The reusable Project Management component for Node.js/Express applications.

- **Package name**: `@project-management`
- **Purpose**: Create, list, view, and delete construction projects with RBAC

See [packages/core/README.md](packages/core/README.md) for details.

### packages/demo-app

Example application demonstrating how to consume `@project-management`.

- **Purpose**: Shows one-line integration pattern

---

## Quick Start

```bash
# Install dependencies
npm install

# Run core tests
npm test

# Run core dev server
npm run dev:core

# Run demo app
npm run dev:demo
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all workspace dependencies |
| `npm test` | Run tests in core package |
| `npm run dev:core` | Start core dev server |
| `npm run dev:demo` | Start demo app |

---

## Structure

```
packages/
  core/           # Reusable component
    src/          # Source code
    tests/        # Test files
    prisma/       # Database schema
  demo-app/      # Example consumer
    src/          # Server entry point
```