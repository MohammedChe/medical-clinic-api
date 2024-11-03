import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

// This file is home to the openapi zod schemas for the tasks routes
// Not the actual implementation of the routes
import { insertDoctorsSchema, selectDoctorsSchema } from "@/db/schema";

const tags = ["doctors"];

export const list = createRoute({
  tags,
  path: "/doctors",
  method: "get",
  responses: {
    // drizzle-zod can create a zod schema for the select query automatically
    // we can use it here to make sure our response object definition matches what we've defined in the database
    // means our API docs are completely in sync with our database schema!
    [HTTPStatusCodes.OK]: jsonContent(
      z.array(selectDoctorsSchema),
      "List of doctors",
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/doctors",
  method: "post",
  request: {
    body: jsonContentRequired(insertDoctorsSchema, "The doctor to create"),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectDoctorsSchema,
      "The created doctor",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      // Stoker has a helper to create all possible error responses for a schema
      // Saves us having to do every possible 422 for every missing field
      createErrorSchema(insertDoctorsSchema),
      "The validation error(s)",
    ),
  },
});

export type ListRoute = typeof list;

export type CreateRoute = typeof create;
