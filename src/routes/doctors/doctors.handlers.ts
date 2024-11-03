import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";

import type { ListRoute } from "./doctors.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const doctors = await db.query.doctors.findMany();

  return c.json(doctors);
};
