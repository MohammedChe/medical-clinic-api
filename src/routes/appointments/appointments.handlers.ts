import { eq } from "drizzle-orm";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import * as HTTPStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { appointments } from "@/db/schema";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./appointments.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const doctors = await db.query.appointments.findMany();

  return c.json(doctors);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const appointment = c.req.valid("json");

  const doctor_id = appointment.doctor_id;
  const patient_id = appointment.patient_id;

  const doctor = await db.query.doctors.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, doctor_id);
    },
  });

  if (!doctor) {
    return c.json({ message: `Doctor not found for id: ${doctor_id}` }, HTTPStatusCodes.BAD_REQUEST);
  }

  const patient = await db.query.patients.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, patient_id);
    },
  });

  if (!patient) {
    return c.json({ message: `Patient not found for id: ${patient_id}` }, HTTPStatusCodes.BAD_REQUEST);
  }

  const [inserted] = await db.insert(appointments).values(appointment).returning();

  return c.json(inserted, HTTPStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const appointment = await db.query.appointments.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!appointment) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.json(appointment, HTTPStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  const [appointment] = await db.update(appointments)
    .set(updates)
    .where(eq(appointments.id, id))
    .returning();

  if (!appointment) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.json(appointment, HTTPStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  // Not using returning here, because there will be no rows to return
  const result = await db.delete(appointments)
    .where(eq(appointments.id, id));

  if (result.rowsAffected === 0) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.body(null, HTTPStatusCodes.NO_CONTENT);
};
