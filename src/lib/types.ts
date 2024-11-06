// Without this interface, if we tried to access c.logger.info() or whatever other method, we'd get a type error
// Because hono doesn't know about the logger
// So now, when we access the app's 'logger' it will be of type PinoLogger
// We just pass this type into our App instance

import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";
import type { JwtVariables } from "hono/jwt";

type Variables = JwtVariables;

// Means we get type completions when we try to access the logger
export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    jwt: Variables;
  };
}

// Now, anywhere we need this type
// We can use this type which also refers to AppBindings
// So now we pass an app wherever we need, and give it the type of AppOpenAPI
// Then it'll also be aware of the logger
export type AppOpenAPI = OpenAPIHono<AppBindings>;

// RouteHandler is a generic type which asks for a specific type as an argument
// Very nice, it tells us if we're missing any required fields
// Means it'll tell us if we're missing any required fields in the route schema definition
// We've used a custom type with a generic R accepting a RouteConfig type
// Then we also pass in the AppBindings type so we don't need to import it in every handler
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppBindings>;
