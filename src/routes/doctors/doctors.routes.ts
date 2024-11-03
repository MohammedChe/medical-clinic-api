// This file is home to the openapi zod schemas for the tasks routes
// Not the actual implementation of the routes
import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const tags = ["doctors"];

export const doctors = createRoute({
  tags,
  path: "/doctors",
  method: "get",
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.array(z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
        phone: z.string(),
        specialisation: z.string(),
      })),
      "List of doctors",
    ),
  },
});

export type DoctorRoute = typeof doctors;
