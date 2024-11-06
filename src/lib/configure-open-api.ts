import { apiReference } from "@scalar/hono-api-reference";

// The type of app is to be the same type we use to instantitate the app in create-app.ts.
// This was originally only in create-app
import type { AppOpenAPI } from "./types";

// https://stackoverflow.com/questions/70106880/err-import-assertion-type-missing-for-import-of-json-file
// Added to resolve ERR_IMPORT_ASSERTION_TYPE_MISSING error when trying to run built app
import packageJSON from "../../package.json" with {type: "json"};

// We want to reuse it, so we've moved it to types.ts
export default function configureOpenAPI(app: AppOpenAPI) {
  // So this is just a JSON form of documentation
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: packageJSON.version, // Nice - we can use the version from package.json instead of hardcoding it
      description: "Medical Clinic API",
    },
  });

  // This one is visual documentation
  app.get("/reference", apiReference({
    theme: "kepler",
    layout: "classic",
    // Tell the API reference to use axios/js for the client, examples will follow axios/js
    defaultHttpClient: {
      targetKey: "javascript",
      clientKey: "axios",
    },
    spec: {
      url: "/doc", // this just needs to point to where your documentation lives
    },
  }));
}
