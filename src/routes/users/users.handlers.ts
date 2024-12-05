import bcrypt from "bcrypt";
import { sign } from "hono/jwt";
import * as HTTPStatusCodes from "stoker/http-status-codes";

import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";
import { users } from "@/db/schema";
import env from "@/env";

import type { LoginRoute, RegisterRoute } from "./users.routes";

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({
      msg: "Invalid email or password",
    }, HTTPStatusCodes.UNAUTHORIZED);
  }

  const token = await sign({ id: user.id, email }, env.JWT_SECRET);

  return c.json({
    token,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
  }, HTTPStatusCodes.OK);
};

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const user = c.req.valid("json");

  const hashedPassword = await bcrypt.hash(user.password, 10);

  const [inserted] = await db.insert(users).values({
    ...user,
    password: hashedPassword,
  }).returning();

  return c.json(inserted, HTTPStatusCodes.OK);
};
