import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertUsersSchema, selectUsersSchema } from "@/db/schema";

const tags = ["authentication"];

// Registering as either a patient or a doctor

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const login = createRoute({
  tags,
  path: "/login",
  method: "post",
  request: {
    // Not using the schema generated from drizzle/zod this time. Only email/pw needed.
    body: jsonContentRequired(
      LoginSchema,
      "The login details",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.object({
        token: z.string(),
        first_name: z.string(),
        last_name: z.string(),
        email: z.string().email(),      
      }),
      "JSON Web Token and user data",
    ),
    [HTTPStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({
        msg: z.string(),
      }),
      "Unauthorised",
    ),
  },
});

export const register = createRoute({
  tags,
  path: "/register",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertUsersSchema,
      "The registration details",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectUsersSchema,
      "The registered user",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "The validation error(s)",
    ),
    [HTTPStatusCodes.CONFLICT]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "Conflict",
    ),
    [HTTPStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string(),
      }),
      "Internal Server Error",
    ),
  },
});

export type LoginRoute = typeof login;
export type RegisterRoute = typeof register;
