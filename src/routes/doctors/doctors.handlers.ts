import type { AppRouteHandler } from "@/lib/types";

import db from "@/db";

import type { DoctorRoute } from "./doctors.routes";

export const doctors: AppRouteHandler<DoctorRoute> = async (c) => {
  const doctors = await db.query.doctors.findMany();

  return c.json(doctors);
};
