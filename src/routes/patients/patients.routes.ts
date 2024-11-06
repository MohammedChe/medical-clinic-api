import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentOneOf, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";

import { insertPatientsSchema, patchPatientsSchema, selectAppointmentsSchema, selectPatientsSchema } from "@/db/schema";
import { notFoundSchema } from "@/lib/constants";

const tags = ["patients"];

export const list = createRoute({
  tags,
  path: "/patients",
  method: "get",
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      z.array(selectPatientsSchema),
      "List of patients",
    ),
  },
});

export const create = createRoute({
  tags,
  path: "/patients",
  method: "post",
  request: {
    body: jsonContentRequired(insertPatientsSchema, "The patient to create"),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectPatientsSchema,
      "The created patient",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertPatientsSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  tags,
  path: "/patients/{id}",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectPatientsSchema,
      "The requested patient",
    ),

    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Patient not found",
    ),

    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID error",
    ),
  },
});

export const patch = createRoute({
  tags,
  path: "/patients/{id}",
  method: "patch",
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(
      patchPatientsSchema,
      "The patient updates to apply",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectPatientsSchema,
      "The updated patient",
    ),
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf([
      createErrorSchema(patchPatientsSchema),
      createErrorSchema(IdParamsSchema),
    ], "The validation error(s)"),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Patient not found",
    ),
  },
});

export const remove = createRoute({
  tags,
  path: "/patients/{id}",
  method: "delete",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.NO_CONTENT]: {
      description: "Patient deleted",
    },
    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID error",
    ),
    [HTTPStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Patient not found",
    ),
  },
});

export const listAppointments = createRoute({
  tags,
  path: "/patients/{id}/appointments",
  method: "get",
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(z.array(selectAppointmentsSchema), "The requested appointments"),

    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "Invalid ID error",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type ListAppointmentsRoute = typeof listAppointments;
