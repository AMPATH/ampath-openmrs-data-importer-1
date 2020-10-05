import transferPatientToAmrs from "./patients/copy-over-patient";
import updatePatientInAmrs from "./patients/update-patient";

const readCSV = require('./read-csv');
const patientIdsPath = 'metadata/patient_ids.csv'

console.log("Starting application..");

async function start() {
  const patientIds = await readCSV(patientIdsPath);
  const patients = patientIds.array.map((p: any) => p.patient_id);
 
  for (const patient of patients) {
    console.log("=======start===========");
    await transferPatientToAmrs(patient);
    console.log("========end==========");
  }
  // await updatePatientInAmrs(22, '977396f7-e645-41e2-9257-196b45366859');
  // await transferPatientToAmrs(3634);
  // await transferPatientToAmrs(3066);
  // await transferPatientToAmrs(22);
}

start();
