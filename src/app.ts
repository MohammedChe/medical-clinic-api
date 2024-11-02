import type { PinoLogger } from "hono-pino";

// In here, we'll keep everything directly related to defining the app
// Index.ts is for 'node-server' specific code, like setting up the server
import { OpenAPIHono } from "@hono/zod-openapi";
import { pinoLogger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import env from "../env";

// Stoker provides some useful middlewares, like notFound
import { notFound, onError } from "stoker/middlewares";

// Without this interface, if we tried to access c.logger.info() or whatever other method, we'd get a type error
// Because hono doesn't know about the logger
// So now, when we access the app's 'logger' it will be of type PinoLogger
// We just pass this type into our App instance
// Means we get type completions when we try to access the logger
interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

// OpenAPIHono is just a wrapper around Hono that adds OpenAPI support
// The app still works in exactly the same way as using Hono directly
const app = new OpenAPIHono<AppBindings>();

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
  pino: pino({
    // If the environment variable LOG_LEVEL is set, use that, otherwise default to info
    // Means in prod we won't have huge logs
    level: env.LOG_LEVEL || "info",
  }, env.NODE_ENV === "production" ? undefined : pretty()),
  http: {
    // give every request a random UUID
    // default would be simply to count upwards
    // UUID would be useful in a serverless environment, where if the server were to be restarted, the counter would reset    reqId: () => crypto.randomUUID(),
    reqId: () => crypto.randomUUID(),
  },
}));
// ^^ Also, since we're using this as a middleware, we have access to the logger in our request object
// So we can log stuff like request.log.info("Some info")

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

export default app;
