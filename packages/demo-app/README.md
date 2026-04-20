# Demo App

Demonstrates how to consume `@project-management` in an Express application.

## Usage

```javascript
import express from "express";
import { createProjectRouter, errorHandler } from "@project-management";

const app = express();
app.use(express.json());

// Single line to mount full project management functionality
app.use("/projects", createProjectRouter());

app.use(errorHandler);
app.listen(3001);
```

## Hooks

Customize behavior with hooks:

```javascript
createProjectRouter({
  hooks: {
    afterCreate: (project, req) => {
      console.log(`Project created: ${project.projectName}`);
    },
    beforeDelete: (project, req) => {
      console.log(`Deleting: ${project.projectName}`);
    },
  },
});
```

## Running

```bash
npm run dev
```

Open http://localhost:3001/health to verify the app is running.