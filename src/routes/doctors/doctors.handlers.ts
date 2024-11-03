import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { doctors } from "@/db/schema";

import type { CreateRoute, ListRoute } from "./doctors.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const doctors = await db.query.doctors.findMany();

  return c.json(doctors);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  // Cool thing here is that the request body is already validated by the zod schema
  // It will not make it here if it doesn't match the schema
  // Unless the body received already matches the one defined in CreateRoute
  // Additionally, any extra properties in the request body will be stripped out
  const doctor = c.req.valid("json");

  // If you hover over `inserted`, you'll see it is of type list, because it is possible to insert multiple rows at once
  // Wrap in an array to pull out the first element (we'd get a type error if we didn't, because the CreateRoute schema promises to return a single object)
  // The returning method will return the inserted row with the id, createdAt and updatedAt
  const [inserted] = await db.insert(doctors).values(doctor).returning();

  return c.json(inserted);
};
