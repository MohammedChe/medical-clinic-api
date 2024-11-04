// SQLite doesn't have dates, so you can either use an integer or string and store a timestamp
// I'll use a number and ensure it can be parsed into a real date
import { z } from "zod";

export const dateStringSchema = z.string().refine((val) => {
  const date = new Date(val);
  return !Number.isNaN(date.getTime());
}, {
  message: "Invalid date format",
  // Converts to unix timestamp
}).transform(val => Math.floor(new Date(val).getTime() / 1000));
