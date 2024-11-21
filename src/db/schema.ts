import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { dateStringSchema } from "@/lib/date-string-schema";

/// ///////////////////// DOCTORS //////////////////////

export const doctors = sqliteTable("doctors", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
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
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
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
  doctor_id: integer("doctor_id", { mode: "number" }).references(() => doctors.id, {onDelete: 'cascade'}).notNull(),
  patient_id: integer("patient_id", { mode: "number" }).references(() => patients.id, {onDelete: 'cascade'}).notNull(),

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
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
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
  password: schema => schema.password.min(8).max(255),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUsersSchema = createSelectSchema(users);

/// ///////////////////// MEDICAL HISTORY //////////////////////

// By this we mean medical conditions a patient has been diagnosed with
// I don't think this necessarily needs to relate to a doctor. A patient could have been diagnosed by a different clinic.
export const diagnoses = sqliteTable("diagnoses", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  patient_id: integer("patient_id", { mode: "number" }).references(() => patients.id).notNull(),
  condition: text("condition").notNull(), // Name of the medical condition (students may use an additonal API to details of the condition)
  diagnosis_date: integer("diagnosis_date").notNull(), // Date of diagnosis
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const selectDiagnosisSchema = createSelectSchema(diagnoses);

export const insertDiagnosisSchema = createInsertSchema(diagnoses, {
  diagnosis_date: () => dateStringSchema,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchDiagnosisSchema = insertDiagnosisSchema.partial();

/// ///////////////////// PRESCRIPTIONS //////////////////////

// A medical conditon will relate to a prescription (patient has been prescribed medication for a condition)
export const prescriptions = sqliteTable("prescriptions", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  patient_id: integer("patient_id", { mode: "number" }).references(() => patients.id).notNull(),
  doctor_id: integer("doctor_id", { mode: "number" }).references(() => doctors.id).notNull(), // Prescription given by doctor
  diagnosis_id: integer("diagnosis_id", { mode: "number" }).references(() => diagnoses.id).notNull(), // Link to diagnosis
  medication: text("medication").notNull(), // Name of the medication
  dosage: text("dosage").notNull(), // Dosage instructions e.g take after meals
  start_date: integer("start_date").notNull(), // Start date of the prescription
  end_date: integer("end_date").notNull(), // End date of the prescription
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const selectPrescriptionsSchema = createSelectSchema(prescriptions);

export const insertPrescriptionsSchema = createInsertSchema(prescriptions, {
  start_date: () => dateStringSchema,
  end_date: () => dateStringSchema,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchPrescriptionsSchema = insertPrescriptionsSchema.partial();

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

// one doctor has many appointments
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

/// /////////////// Diagnosis - Patient relations //////////////////

// one patient has many diagnoses
export const patientDiagnosis = relations(patients, ({ many }) => ({
  diagnosis: many(diagnoses),
}));

// but each diagnosis has only one patient
export const diagnosisPatient = relations(diagnoses, ({ one }) => ({
  patient: one(patients, {
    fields: [diagnoses.patient_id],
    references: [patients.id],
  }),
}));

/// /////////////// Prescription - Doctor/Patient relations //////////////////

// one patient has many prescriptions
export const patientPrescriptions = relations(patients, ({ many }) => ({
  prescriptions: many(prescriptions),
}));

// but each prescription has only one patient
export const prescriptionPatient = relations(prescriptions, ({ one }) => ({
  patient: one(patients, {
    fields: [prescriptions.patient_id],
    references: [patients.id],
  }),
}));

// one doctor has many prescriptions
export const doctorPrescriptions = relations(doctors, ({ many }) => ({
  prescriptions: many(prescriptions),
}));

// but each prescription has only one doctor
export const prescriptionDoctor = relations(prescriptions, ({ one }) => ({
  doctor: one(doctors, {
    fields: [prescriptions.doctor_id],
    references: [doctors.id],
  }),
}));
