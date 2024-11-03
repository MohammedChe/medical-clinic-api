import { createRoute, z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

import { createRouter } from "@/lib/create-app";

// Every route in our app will have both a definition and an implementation
const router = createRouter()
  .openapi(createRoute({
    tags: ["Index"], // can use this to group routes in the swagger UI
    method: "get",
    path: "/",
    responses: {
      // we don't want to write this over and over again for every route
      // stoker provides the jsonContent helper to make this easier

      // 200: {
      //   content: {
      //     "application/json": {
      //       schema: z.object({
      //         message: z.string(),
      //       }),
      //     },
      //   },
      //   description: "Test",
      // },

      // stoker alternative:
      // Also using http status code as computed property
      // stoker also has a utility for creating a zod response with an object and a message
      // seems kind of unnecessary, but it's a nice helper
      [HTTPStatusCodes.OK]: jsonContent(
        createMessageObjectSchema("Test"),
        "Medical Clinic API Index",
      ),
    },
  }),
  // plain hodo handler typed to respond as defined above
  (c) => {
    return c.json({
      // Notice that if we run ctrl + space here, we get the type completion
      // It knows we need to return an object with a 'message' key
      message: "Medical clinic API",
    }, HTTPStatusCodes.OK); // so now we have cool type completion for status codes
    // if we tried to use e.g http 401 here, we'd get a type error because we told it to expect 200
  });

export default router;
