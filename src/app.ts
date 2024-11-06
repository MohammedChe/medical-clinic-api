import { bearerAuth } from "hono/bearer-auth";
import { except } from "hono/combine";

import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import appointments from "@/routes/appointments/appointments.index";
import doctors from "@/routes/doctors/doctors.index";
import index from "@/routes/index.route"; // using our nice aliased path
import patients from "@/routes/patients/patients.index";

// App gets instantiated, adds middlewares
const app = createApp();

const token = "secret";

// All routes are protected except for GET /doctors and GET /patients

// `except` can accept strings or a function returning a boolean.
// if true, middleware will be skipped
app.use("/*", except((c) => {
  return (c.req.method === "GET" && (c.req.path === "/doctors" || c.req.path === "/patients"));
}, bearerAuth({ token })));

// An array defining all of the routes in our app
const routes = [
  index,
  doctors,
  patients,
  appointments,
];

// App gets configured with OpenAPI
configureOpenAPI(app);

// Now configuring OpenAPI with our base application
// We can mount each of our individual sub-routers by iterating over them
routes.forEach((route) => {
  app.route("/", route); // provide a route at the index and provide documentation
  // so our docs will show up at /doc telling us we have a route at '/'
  // (so, if we go to localhost:9999/doc, we'll see the route at '/' and its properties)
});

export default app;
