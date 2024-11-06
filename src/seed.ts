import { fakerEN_IE as faker } from "@faker-js/faker";

import db from "./db";
import { appointments, doctors, patients, users } from "./db/schema";

async function seed() {
  const doctorData = Array.from({ length: 10 }).map(() => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    specialisation: faker.helpers.arrayElement([
      "Podiatrist",
      "Dermatologist",
      "Pediatrician",
      "Psychiatrist",
      "General Practitioner",
    ]),
  }));

  const patientData = Array.from({ length: 20 }).map(() => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    date_of_birth: Math.floor(faker.date.past({ years: 20, refDate: new Date() }).getTime() / 1000),
    address: faker.location.streetAddress(),
  }));

  const userData = Array.from({ length: 5 }).map(() => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email({ provider: "fakerjs.dev" }), // we'll probably want unique emails, so just ensuring there's no overlap with fake users and real users
    password: faker.internet.password({ length: 10 }),
  }));

  // Insert doctors and patients first
  const insertedDoctors = await db.insert(doctors).values(doctorData).returning();
  const insertedPatients = await db.insert(patients).values(patientData).returning();
  await db.insert(users).values(userData);

  // Generate appointments data using the inserted doctors and patients IDs
  const appointmentData = Array.from({ length: 30 }).map(() => ({
    appointment_date: Math.floor(faker.date.future().getTime() / 1000),
    doctor_id: faker.helpers.arrayElement(insertedDoctors).id,
    patient_id: faker.helpers.arrayElement(insertedPatients).id,
  }));

  // Insert appointments
  await db.insert(appointments).values(appointmentData);

  console.log("Seeding completed.");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
});
