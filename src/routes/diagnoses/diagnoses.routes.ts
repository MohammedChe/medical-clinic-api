import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentOneOf, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertDiagnosisSchema, patchDiagnosisSchema, selectDiagnosisSchema } from "@/db/schema";
import { notFoundSchema, conflictSchema } from "@/lib/constants";

const tags = ["diagnoses"];

export const list = createRoute({
  tags,
  path: "/diagnoses",
  method: "get",
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.array(selectDiagnosisSchema),
      "List of diagnoses",
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/diagnoses",
  method: "post",
  request: {
    body: jsonContentRequired(insertDiagnosisSchema, "The diagnosis to create"),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      insertDiagnosisSchema,
      "The created diagnosis",
    ),
    // bad request such as in the case of non-existent patient_id (won't need a doctor id, since may have been diagnosed outside of the clinic)
    [HTTPStatusCodes.BAD_REQUEST]: {
      description: "Patient not found",
    },
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertDiagnosisSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/diagnoses/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectDiagnosisSchema,
      "The requested diagnosis",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Appointment not found",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID error",
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/diagnoses/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      patchDiagnosisSchema,
      "The diagnosis updates to apply",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectDiagnosisSchema,
      "The updated appointment",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf([
      createErrorSchema(patchDiagnosisSchema),
      createErrorSchema(IdParamsSchema),
    ], "The validation error(s)"),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Doctor or patient not found",
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/diagnoses/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.NO_CONTENT]: {
      description: "Diagnosis deleted",
    },
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID error",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Diagnosis not found",
    ),
    [HTTPStatusCodes.CONFLICT]: jsonContent(
      conflictSchema,
      "Diagnosis has dependencies, cannot delete a diagnosis which references existing prescriptions.",
    )
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
