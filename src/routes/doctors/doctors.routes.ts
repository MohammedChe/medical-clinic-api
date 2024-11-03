import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

// This file is home to the openapi zod schemas for the tasks routes
// Not the actual implementation of the routes
import { insertDoctorsSchema, selectDoctorsSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

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

export const getOne = createRoute({
  tags,
  path: "/doctors/{id}",
  method: "get",
  request: {
    // This can be done manually, ensuring ID is passed etc
    // But it's repetitive, so stoker provides a helper to create this schema for us
    // This also uses zod.coerce to ensure the ID is a number
    params: IdParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectDoctorsSchema,
      "The requested doctor",
    ),
    // Also document a possible 404
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Doctor not found",
    ),
    // We again add the possibility of receiving a 422 on this endpoint
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      // We can use this schema from the stoker helper again
      // No need to define it manually
      createErrorSchema(IdParamsSchema),
      "Invalid ID error",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
