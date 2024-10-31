// In here, we'll keep everything directly related to defining the app
// Index.ts is for 'node-server' specific code, like setting up the server
import { OpenAPIHono } from "@hono/zod-openapi";

// OpenAPIHono is just a wrapper around Hono that adds OpenAPI support
const app = new OpenAPIHono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
