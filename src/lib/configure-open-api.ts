import { apiReference } from "@scalar/hono-api-reference";

// The type of app is to be the same type we use to instantitate the app in create-app.ts.
// This was originally only in create-app
import type { AppOpenAPI } from "./types";

import packageJSON from "../../package.json";

// We want to reuse it, so we've moved it to types.ts
export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: packageJSON.version, // Nice - we can use the version from package.json instead of hardcoding it
      description: "Medical Clinic API",
    },
  });

  app.get("/reference", apiReference({
    theme: "kepler",
    layout: "classic",
    defaultHttpClient: {
      targetKey: "javascript",
      clientKey: "axios",
    },
    spec: {
      url: "/doc", // this just needs to point to where your documentation lives
    },
  }));
}
