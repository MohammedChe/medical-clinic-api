import { eq } from "drizzle-orm";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import * as HTTPStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { prescriptions } from "@/db/schema";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./prescriptions.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const prescriptions = await db.query.prescriptions.findMany();

  return c.json(prescriptions);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const prescription = c.req.valid("json");

  const doctor_id = prescription.doctor_id;
  const patient_id = prescription.patient_id;

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

  const [inserted] = await db.insert(prescriptions).values(prescription).returning();

  return c.json(inserted, HTTPStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const prescription = await db.query.prescriptions.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!prescription) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.json(prescription, HTTPStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  const [prescription] = await db.update(prescriptions)
    .set(updates)
    .where(eq(prescriptions.id, id))
    .returning();

  if (!prescription) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.json(prescription, HTTPStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  // Not using returning here, because there will be no rows to return
  const result = await db.delete(prescriptions)
    .where(eq(prescriptions.id, id));

  if (result.rowsAffected === 0) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.body(null, HTTPStatusCodes.NO_CONTENT);
};
