// In here, we'll keep everything directly related to defining the app
// Index.ts is for 'node-server' specific code, like setting up the server
import { OpenAPIHono } from "@hono/zod-openapi";
import { pinoLogger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

// Stoker provides some useful middlewares, like notFound
import { notFound, onError } from "stoker/middlewares";

// OpenAPIHono is just a wrapper around Hono that adds OpenAPI support
// The app still works in exactly the same way as using Hono directly
const app = new OpenAPIHono();

// Replace the default 404 with JSON response, by default it's just a text response
// Stoker also handles the HTTP codes for us
app.notFound(notFound);

// If node env is not set to production, this middleware will show the stack trace
// If we forget to do our own error handling, this will catch it
app.onError(onError);

// Receives the instance of pino, which is a logger
// We then provide it with a pretty formatter
// Means the console will log info on our request in JSON format, prettified
app.use(pinoLogger({
  pino: pino(pretty()),
}));

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
