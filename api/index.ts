import { handle } from "hono/vercel";

// linter complains, but vercel edge would not support our ts files directly
// have no choice but to import the dist file
// @ts-expect-error types are not expected to be available here
// eslint-disable-next-line antfu/no-import-dist
import app from "../dist/src/app.js";

// vercel has edge and node runtimes, specify the runtime
export const runtime = "edge";

// Sort of like converting all our code into a single serverless function
// We're telling vercel edge where to find our endpoints
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
export const HEAD = handle(app);
