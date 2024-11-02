import { config } from "dotenv";
import configureOpenAPI from "lib/configure-open-api";
import { createApp } from "lib/create-app";

// App gets instantiated, adds middlewares
const app = createApp();

// App gets configured with OpenAPI
configureOpenAPI(app);

export default app;
