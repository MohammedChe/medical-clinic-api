import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import index from "@/routes/index.route"; // using our nice aliased path

// App gets instantiated, adds middlewares
const app = createApp();

// An array defining all of the routes in our app
const routes = [
  index,
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
