import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { dateStringSchema } from "@/lib/date-string-schema";

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
  // dates are weird in sqlite https://orm.drizzle.team/docs/guides/timestamp-default-value
  date_of_birth: integer("date_of_birth").notNull(),
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
  date_of_birth: () => dateStringSchema,
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

  // e.g. 2022-09-27 18:00:00.000
  appointment_date: integer("date_of_birth").notNull(),
  doctor_id: integer("doctor_id", { mode: "number" }).references(() => doctors.id).notNull(),
  patient_id: integer("patient_id", { mode: "number" }).references(() => patients.id).notNull(),

  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});

export const selectAppointmentsSchema = createSelectSchema(appointments);

// We need to validate that the doctor_id and patient_id exist in the database, but I don't think that can be done purely with zod
// Think that's a job for the handler to do
// So type safety alone won't be enough to ensure that the data is correct in this case.
export const insertAppointmentsSchema = createInsertSchema(appointments, {
  appointment_date: () => dateStringSchema,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchAppointmentsSchema = insertAppointmentsSchema.partial();

/// ///////////////////// USERS //////////////////////

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  first_name: text("name").notNull(),
  last_name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text('password').notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});


export const insertUsersSchema = createInsertSchema(users, {
  first_name: schema => schema.first_name.min(2).max(255),
  last_name: schema => schema.last_name.min(2).max(255),
  email: schema => schema.email.email(),
  password: schema => schema.password.min(8).max(255)
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUsersSchema = createSelectSchema(users);


/// /////////// Setup relations //////////////

// one patient as many appointments
export const patientAppointments = relations(patients, ({ many }) => ({
  appointments: many(appointments),
}));

// but each appointment has only one patient
export const appointmentPatient = relations(appointments, ({ one }) => ({
  patient: one(patients, {
    fields: [appointments.patient_id],
    references: [patients.id],
  }),
}));

// one doctor as many appointments
export const doctorAppointments = relations(doctors, ({ many }) => ({
  appointments: many(appointments),
}));

// but each appointment has only one doctor
export const appointmentDoctor = relations(appointments, ({ one }) => ({
  doctor: one(doctors, {
    fields: [appointments.doctor_id],
    references: [doctors.id],
  }),
}));
