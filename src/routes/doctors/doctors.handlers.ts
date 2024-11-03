import type { AppRouteHandler } from "@/lib/types";

import type { DoctorRoute } from "./doctors.routes";

export const doctors: AppRouteHandler<DoctorRoute> = (c) => {
  return c.json([
    {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    },
  ]);
};
