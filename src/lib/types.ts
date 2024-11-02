// Without this interface, if we tried to access c.logger.info() or whatever other method, we'd get a type error
// Because hono doesn't know about the logger
// So now, when we access the app's 'logger' it will be of type PinoLogger
// We just pass this type into our App instance

import type { OpenAPIHono } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";

// Means we get type completions when we try to access the logger
export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

// Now, anywhere we need this type
// We can use this type which also refers to AppBindings
// So now we pass an app wherever we need, and give it the type of AppOpenAPI
// Then it'll also be aware of the logger
export type AppOpenAPI = OpenAPIHono<AppBindings>;
