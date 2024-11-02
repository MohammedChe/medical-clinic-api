import { createRoute, z } from "@hono/zod-openapi";

import { createRouter } from "@/lib/create-app";

// Every route in our app will have both a definition and an implementation
const router = createRouter()
  .openapi(createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: "Test",
      },
    },
  }),
  // plain hodo handler typed to respond as defined above
  (c) => {
    return c.json({
      // Notice that if we run ctrl + space here, we get the type completion
      // It knows we need to return an object with a 'message' key
      message: "Hello, world!",
    });
  });

export default router;
