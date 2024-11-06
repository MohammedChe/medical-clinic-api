import { bearerAuth } from "hono/bearer-auth";
import { except } from "hono/combine";
import { jwt } from "hono/jwt";

import env from "@/env";
import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import appointments from "@/routes/appointments/appointments.index";
import doctors from "@/routes/doctors/doctors.index";
import index from "@/routes/index.route"; // using our nice aliased path
import patients from "@/routes/patients/patients.index";
import users from "@/routes/users/users.index";

// App gets instantiated, adds middlewares
const app = createApp();

// All routes are protected except for GET /doctors and GET /patients
// We obviously can't restrict access to the login and registration routes either
const authExceptions = [
  { path: "/login", method: "POST" },
  { path: "/register", method: "POST" },
  { path: "/doctors", method: "GET" },
  { path: "/patients", method: "GET" },
  { path: "/reference", method: "GET" },
  { path: "/doc", method: "GET" },
  { path: "/", method: "GET" },
];

// `except` can accept strings or a function returning a boolean.
// if true, middleware will be skipped
app.use("/*", except((c) => {
  const { path, method } = c.req;
  // array.some works where array.includes would not
  // because we're comparing objects, not strings
  return (authExceptions.some(e => e.path === path && e.method === method));
}, jwt({ secret: env.JWT_SECRET })));

// An array defining all of the routes in our app
const routes = [
  index,
  doctors,
  patients,
  appointments,
  users,
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
