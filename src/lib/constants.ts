import * as HTTPStatusPhrases from "stoker/http-status-phrases";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

// So any endpoint which needs to respond with 404 not found can reuse this validator
export const notFoundSchema = createMessageObjectSchema(
  HTTPStatusPhrases.NOT_FOUND,
);
