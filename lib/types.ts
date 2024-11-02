// Without this interface, if we tried to access c.logger.info() or whatever other method, we'd get a type error
// Because hono doesn't know about the logger
// So now, when we access the app's 'logger' it will be of type PinoLogger
// We just pass this type into our App instance

import type { PinoLogger } from "hono-pino";

// Means we get type completions when we try to access the logger
export interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}
