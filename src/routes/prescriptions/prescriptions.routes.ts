import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentOneOf, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertPrescriptionsSchema, patchAppointmentsSchema, selectPrescriptionsSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["prescriptions"];

export const list = createRoute({
  tags,
  path: "/prescriptions",
  method: "get",
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.array(selectPrescriptionsSchema),
      "List of prescriptions",
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/prescriptions",
  method: "post",
  request: {
    body: jsonContentRequired(insertPrescriptionsSchema, "The prescription to create"),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      insertPrescriptionsSchema,
      "The created prescription",
    ),
    // bad request such as in the case of non-existent doctor_id or patient_id (a prescription requires both, so invalid either might cause a bad request)
    [HTTPStatusCodes.BAD_REQUEST]: {
      description: "Doctor or patient not found",
    },
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertPrescriptionsSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/prescriptions/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectPrescriptionsSchema,
      "The requested prescription",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Prescription not found",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID error",
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/prescriptions/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      patchAppointmentsSchema,
      "The prescription updates to apply",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectPrescriptionsSchema,
      "The updated prescription",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf([
      createErrorSchema(patchAppointmentsSchema),
      createErrorSchema(IdParamsSchema),
    ], "The validation error(s)"),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Doctor or patient not found", // again, this is the only known reason it may throw a 404, any other unhandled error will be a 500
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/prescriptions/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.NO_CONTENT]: {
      description: "Prescriptions deleted",
    },
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID error",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Prescriptions not found",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
