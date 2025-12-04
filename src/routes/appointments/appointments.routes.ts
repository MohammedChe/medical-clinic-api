import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentOneOf, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertAppointmentsSchema, patchAppointmentsSchema, selectAppointmentsSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["appointments"];

export const list = createRoute({
  tags,
  path: "/appointments",
  method: "get",
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.array(selectAppointmentsSchema),
      "List of appointments",
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/appointments",
  method: "post",
  request: {
    body: jsonContentRequired(insertAppointmentsSchema, "The appointment to create"),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      insertAppointmentsSchema,
      "The created appointment",
    ),
    // bad request such as in the case of non-existent doctor_id or patient_id
    [HTTPStatusCodes.BAD_REQUEST]: {
      description: "Doctor or patient not found",
    },
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertAppointmentsSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/appointments/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectAppointmentsSchema,
      "The requested appointment",
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
  path: "/appointments/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      patchAppointmentsSchema,
      "The appointment updates to apply",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectAppointmentsSchema,
      "The updated appointment",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf([
      createErrorSchema(patchAppointmentsSchema),
      createErrorSchema(IdParamsSchema),
    ], "The validation error(s)"),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Doctor not found",
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/appointments/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.NO_CONTENT]: {
      description: "Appointment deleted",
    },
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID error",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Appointment not found",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
