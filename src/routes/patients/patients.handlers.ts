import { eq } from "drizzle-orm";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import * as HTTPStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { patients } from "@/db/schema";

import type { CreateRoute, GetOneRoute, ListAppointmentsRoute, ListRoute, PatchRoute, RemoveRoute } from "./patients.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const patients = await db.query.patients.findMany({
    with: {
      appointments: true,
    }
  });

  return c.json(patients);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const patient = c.req.valid("json");

  const [inserted] = await db.insert(patients).values(patient).returning();

  return c.json(inserted, HTTPStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const patient = await db.query.patients.findFirst({

    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!patient) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.json(patient, HTTPStatusCodes.OK);
};

// Type here will actually be the GetOneRoute type for *appointments*
// We expect an array of appointments to be returned
export const listAppointments: AppRouteHandler<ListAppointmentsRoute> = async (c) => {
  const { id } = c.req.valid("param");

  // TODO: Should we check if the patient exists first?

  const appointments = await db.query.appointments.findMany({
    where(fields, operators) {
      return operators.eq(fields.patient_id, id);
    },
  });

  // Return ok even if it's empty. That's not an error, just no appointments.
  return c.json(appointments, HTTPStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  const [patient] = await db.update(patients)
    .set(updates)
    .where(eq(patients.id, id))
    .returning();

  if (!patient) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.json(patient, HTTPStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const result = await db.delete(patients)
    .where(eq(patients.id, id));

  if (result.rowsAffected === 0) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.body(null, HTTPStatusCodes.NO_CONTENT);
};
