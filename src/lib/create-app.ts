import { OpenAPIHono } from "@hono/zod-openapi";
import { pinoLogger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

import env from "@/env";

// Stoker provides some useful middlewares, like notFound
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import defaultHook from "stoker/openapi/default-hook";

import type { AppBindings } from "./types";

export default function createApp() {
  // OpenAPIHono is just a wrapper around Hono that adds OpenAPI support
  // The app still works in exactly the same way as using Hono directly
  const app = new OpenAPIHono<AppBindings>({ strict: false }); // disabling this to avoid differentiating between, e.g. '/user' and '/user/'
  // This is a small middleware offered by stoker to prevent 404s when the browser requests a favicon
  app.use(serveEmojiFavicon("🏥")); // hospital emoji

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

  // Replace the default 404 with JSON response, by default it's just a text response
  // Stoker also handles the HTTP codes for us
  app.notFound(notFound);

  // If node env is not set to production, this middleware will show the stack trace
  // If we forget to do our own error handling, this will catch it
  app.onError(onError);

  return app;
}

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    // this handles validation errors for every endpoint
    // stoker just returns an object like:
    // {success: false, error: <error message>, code: 422}
    defaultHook,
  });
}
