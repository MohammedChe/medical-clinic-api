import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

// This file is home to the openapi zod schemas for the tasks routes
// Not the actual implementation of the routes
import { selectDoctorsSchema } from "@/db/schema";

const tags = ["doctors"];

export const list = createRoute({
  tags,
  path: "/doctors",
  method: "get",
  responses: {
    // drizzle-zod can create a zod schema for the select query automatically
    // we can use it here to make sure our response object definition matches what we've defined in the database
    [HTTPStatusCodes.OK]: jsonContent(
      z.array(selectDoctorsSchema),
      "List of doctors",
    ),
  },
});

export type ListRoute = typeof list;
