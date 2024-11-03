import type { ZodError } from "zod";

import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

expand(config());

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  DATABASE_URL: z.string().url(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
}).superRefine((input, ctx) => {
  // can use refine/superRefine to add additional validation not covered by zod
  // superRefine is just a more powerful version of refine
  if (input.NODE_ENV === "production" && !input.DATABASE_AUTH_TOKEN) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_type,
      expected: "string",
      received: "undefined",
      path: ["DATABASE_AUTH_TOKEN"],
      message: "Must be set when NODE_ENV is 'production'",
    });
  }
  return input;
});

// z.infer pulls out the type from the schema. Built-in method from zod.
export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line import/no-mutable-exports, ts/no-redeclare
let env: env;

try {
  // This is the only place in the app we'll need to directly access process.env
  // (Hence disabling eslint rule)

  // this can throw an error. If it doesn't throw, it means the env is valid
  // eslint-disable-next-line node/no-process-env
  env = EnvSchema.parse(process.env);
}
catch (e) {
  // If this throws because of invalid env, we'll log the error nicely, then exit
  const error = e as ZodError;
  console.error("❌ Invalid env:");
  // flatten() is a method from zod that makes the error message more readable
  console.error(error.flatten().fieldErrors); // tell us explicitly what's missing
  process.exit(1); // 1 = error
}

// Overall, if there's an invalid env, it will throw, the app won't run
// And we'll get a nice error message saying what's wrong with the env
// Makes it easy to debug. If we're missing a var, the app will literally tell you and simply not run.

export default env;
