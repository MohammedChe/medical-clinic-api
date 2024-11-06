import { createRoute, z } from "@hono/zod-openapi";
import { jwt } from "hono/jwt";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentOneOf, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdParamsSchema } from "stoker/openapi/schemas";
import { ZodUnion } from "zod";

import { insertDoctorsSchema, insertPatientsSchema, selectPatientsSchema } from "@/db/schema";

const tags = ["authentication"];

// Registering as either a patient or a doctor

const LoginSchema = z.object({});

export const login = createRoute({
  tags,
  path: "/login",
  method: "post",
  request: {
    body: jsonContentRequired(
      LoginSchema,
      "The login details",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectPatientsSchema,
      "JSON Web Token",
    ),

    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "The validation error(s)",
    ),
  },
});

// we need a register schema which will accept the properties of a doctor or a patient
// this endpoint should accept a body that can be validated against either of these schemas
const RegisterSchema = z.union([insertDoctorsSchema, insertPatientsSchema]);

export const register = createRoute({
  tags,
  path: "/register",
  method: "post",
  request: {
    body: jsonContentRequired(
      RegisterSchema,
      "The registration details",
    ),
  },
  responses: {
    [HTTPStatusCodes.OK]: jsonContent(
      selectPatientsSchema,
      "The registered user",
    ),

    [HTTPStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      "The validation error(s)",
    ),
  },
});

export type LoginRoute = typeof login;
export type RegisterRoute = typeof register;
