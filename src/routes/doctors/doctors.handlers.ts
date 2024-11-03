import { eq } from "drizzle-orm";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import * as HTTPStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { doctors } from "@/db/schema";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./doctors.routes";

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

  // Need to explicitly set the response code to 200
  // The schema expects it
  return c.json(inserted, HTTPStatusCodes.OK);
};

// So this handles 422, 404, and 200 responses
export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  // Just as before, the code will not make it here if the params include a valid id, which is a number
  // We're both receiving and validating the id in one go
  const { id } = c.req.valid("param");

  // findFirst is a SQLite method provided by Drizzle (drizzle is just an ORM for SQLite, among other DBs)
  const doctor = await db.query.doctors.findFirst({
    // fields and operators are just things like:
    // fields: { id: "id", name: "name" }
    // operators: { eq: (a, b) => `${a} = ${b}` }
    where(fields, operators) {
      // so check that id field equals the id we passed in
      // it'll be converted into SELECT * FROM doctors WHERE id = ${id} LIMIT 1
      // and it'll return the first match
      return operators.eq(fields.id, id);
    },
  });

  if (!doctor) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.json(doctor, HTTPStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  const [doctor] = await db.update(doctors)
    .set(updates)
    .where(eq(doctors.id, id))
    .returning();

  if (!doctor) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.json(doctor, HTTPStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  // Not using returning here, because there will be no rows to return
  const result = await db.delete(doctors)
    .where(eq(doctors.id, id));

  if (result.rowsAffected === 0) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.body(null, HTTPStatusCodes.NO_CONTENT);
};
