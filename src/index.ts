// Makes sense to keep this node-server in index.ts, as it's the entry point
// Means if we decide to change the server from nodejs to whatever else, we only need to change this file
// And import the same app from src/app.ts
import { serve } from "@hono/node-server";

import app from "./app";

const port = 3000;

// eslint-disable-next-line no-console
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
