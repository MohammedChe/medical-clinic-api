import { eq } from "drizzle-orm";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";

import bcrypt from 'bcrypt';

import type { LoginRoute, RegisterRoute} from "./users.routes";

import db from "@/db";
import { sign } from "hono/jwt";

import env from '@/env'

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const { email, password } = c.req.valid('json');
  
  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({
      msg: 'Invalid email or password',
    }, HTTPStatusCodes.UNAUTHORIZED)
  }

  const token = await sign({ id: user.id, email }, env.JWT_SECRET);

  return c.json({
    token
  }, HTTPStatusCodes.OK)
};


export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const {
      username,
      password,
  } = await c.req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  // create user

  return c.json({ data: user });

}

