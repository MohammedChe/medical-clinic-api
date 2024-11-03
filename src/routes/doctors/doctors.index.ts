import { createRouter } from "@/lib/create-app";

import * as handlers from "./doctors.handlers";
import * as routes from "./doctors.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne);

export default router;
