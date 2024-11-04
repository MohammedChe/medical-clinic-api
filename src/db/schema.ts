import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/// ///////////////////// DOCTORS //////////////////////

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

/// ///////////////////// PATIENTS //////////////////////

export const patients = sqliteTable("patients", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  first_name: text("name").notNull(),
  last_name: text("name").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone").unique().notNull(),
  date_of_birth: integer("date_of_birth", { mode: "timestamp" }).notNull(), // sqlite does not have a date type. this is as close as we can get.
  address: text("address").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const selectPatientsSchema = createSelectSchema(patients);

export const insertPatientsSchema = createInsertSchema(patients, {
  first_name: schema => schema.first_name.min(2).max(255),
  last_name: schema => schema.last_name.min(2).max(255),
  email: schema => schema.email.email(),
  phone: schema => schema.phone.min(10).max(10),
  date_of_birth: schema => schema.date_of_birth,
  address: schema => schema.address,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchPatientsSchema = insertPatientsSchema.partial();

/// ///////////////////// APPOINTMENTS //////////////////////

export const appointments = sqliteTable("appointments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),

  appointment_date: integer("date_of_birth", { mode: "timestamp" }).notNull(), // sqlite does not have a date type. this is as close as we can get.
  doctor_id: integer("doctor_id", { mode: "number" }).references(() => doctors.id).notNull(),
  patient_id: integer("patient_id", { mode: "number" }).references(() => patients.id).notNull(),

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const selectAppointmentsSchema = createSelectSchema(appointments);

// I don't think this one needs any additional validation, just omit the id, createdAt and updatedAt, all others are required
export const insertAppointmentsSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchAppointmentsSchema = insertAppointmentsSchema.partial();
