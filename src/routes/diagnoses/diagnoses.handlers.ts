import { eq } from "drizzle-orm";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import * as HTTPStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { diagnoses } from "@/db/schema";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./diagnoses.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const diagnoses = await db.query.diagnoses.findMany();

  return c.json(diagnoses);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const diagnosis = c.req.valid("json");

  const patient_id = diagnosis.patient_id;

  const patient = await db.query.patients.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, patient_id);
    },
  });

  if (!patient) {
    return c.json({ message: `Patient not found for id: ${patient_id}` }, HTTPStatusCodes.BAD_REQUEST);
  }

  const [inserted] = await db.insert(diagnoses).values(diagnosis).returning();

  return c.json(inserted, HTTPStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid("param");

  const diagnosis = await db.query.diagnoses.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!diagnosis) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.json(diagnosis, HTTPStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  const [diagnosis] = await db.update(diagnoses)
    .set(updates)
    .where(eq(diagnoses.id, id))
    .returning();

  if (!diagnosis) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.json(diagnosis, HTTPStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid("param");

  // Not using returning here, because there will be no rows to return
  const result = await db.delete(diagnoses)
    .where(eq(diagnoses.id, id));

  if (result.rowsAffected === 0) {
    return c.json({ message: HTTPStatusPhrases.NOT_FOUND }, HTTPStatusCodes.NOT_FOUND);
  }

  return c.body(null, HTTPStatusCodes.NO_CONTENT);
};
