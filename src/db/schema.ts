import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const doctors = sqliteTable("doctors", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  first_name: text("name").notNull(),
  last_name: text("name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").unique().notNull(),
  specialisation: text({
    enum: [
      "Podiatrist",
      "Dermatologist",
      "Pediatrician",
      "Psychiatrist",
      "General Practitioner",
    ],
  }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

// Drizzle-zod can create a zod type schema for the select query
// Means we can use this in our route definition and be sure that the query is correct
export const selectDoctorsSchema = createSelectSchema(doctors);

// We can further refine this using the omit method from zod to specify not to include id, createdAt and updatedAt
export const insertDoctorsSchema = createInsertSchema(doctors, {
  first_name: schema => schema.first_name.min(2).max(255),
  last_name: schema => schema.last_name.min(2).max(255),
  email: schema => schema.email.email(),
  phone: schema => schema.phone.min(10).max(10),
  specialisation: schema => schema.specialisation,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// So this schema is the same as insert, except all fields are optional
export const patchDoctorsSchema = insertDoctorsSchema.partial();
