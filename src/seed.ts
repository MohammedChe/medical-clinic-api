import { fakerEN_IE as faker } from "@faker-js/faker";

import { commonDiseasesWithMedications } from "@/lib/constants";

import db from "./db";
import { appointments, diagnoses, doctors, patients, prescriptions, users } from "./db/schema";

declare module "@faker-js/faker" {
  interface Faker {
    medical: {
      condition: () => string;
      medication: (condition: string) => string;
    };
  }
}

// Extend Faker to return a random medical condition
faker.medical = {
  condition: () => faker.helpers.arrayElement(commonDiseasesWithMedications).condition,
  // Receive a condition and return the corresponding medication
  medication: (condition: string) => faker.helpers.arrayElement(commonDiseasesWithMedications.filter(d => d.condition === condition)).medication,
};

async function seed() {
  // Clear all tables in the correct order
  await db.delete(prescriptions).execute();
  await db.delete(diagnoses).execute();
  await db.delete(appointments).execute();
  await db.delete(users).execute();
  await db.delete(patients).execute();
  await db.delete(doctors).execute();

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

  // Generate patient diagnoses - one for each patient (they can have multiple)
  const patientDiagnosesData = insertedPatients.map(patient => ({
    patient_id: patient.id,
    condition: faker.medical.condition(),
    diagnosis_date: Math.floor(faker.date.past().getTime() / 1000),
  }));

  // Insert patient diagnoses and retrieve their IDs
  const insertedDiagnoses = await db.insert(diagnoses).values(patientDiagnosesData).returning();

  // Generate prescriptions for each diagnosis
  // (Using a random doctor and patient, not every patient necessarily has a prescription, and for each who does, we'll say it was prescribed by a random doctor)
  const prescriptionsData = insertedDiagnoses.map(diagnosis => ({
    doctor_id: faker.helpers.arrayElement(insertedDoctors).id,
    patient_id: faker.helpers.arrayElement(insertedPatients).id,
    diagnosis_id: diagnosis.id,
    medication: faker.medical.medication(diagnosis.condition),
    dosage: `${faker.number.int({ min: 1, max: 100 }) * 10}mg ${faker.helpers.arrayElement(["daily", "twice daily", "as needed"])}`,
    start_date: Math.floor(faker.date.past().getTime() / 1000), // the prescription was issued in the past
    end_date: Math.floor(faker.date.future().getTime() / 1000), // the prescrption will need to be renewed at some point in the future
  }));

  // Insert prescriptions
  await db.insert(prescriptions).values(prescriptionsData);

  console.log("Seeding completed.");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
});
