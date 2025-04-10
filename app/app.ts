import { saveEncounter } from "./encounters/save-encounters";
import transferPatientToAmrs from "./patients/copy-over-patient";
import updatePatientInAmrs from "./patients/update-patient";
import writeCsv from "./write-csv";

const readCSV = require("./read-csv");
const patientIdsPath = "metadata/patient_ids.csv";
const existingPatientIdsPath = "metadata/possible-existing-patients-copy.csv";
const pathtoError = "metadata/enc prov errors.csv";

console.log("Starting application..");

async function start(action: string) {
  console.log("ACtion", action);
  const patientIds = await readCSV(patientIdsPath);
  const patients = patientIds.array.map((p: any) => p.patient_id);
  const existingPatientsIds = await readCSV(existingPatientIdsPath);
  const existingPatients = existingPatientsIds.array.map(
    (existing: any) => existing
  );
  let synced = 0;
  let failed = 0;
  let encProvErrors = [];
  if (action && action === "create") {
    for (const patient of patients) {
      console.log("=======start===========");
      let status = await transferPatientToAmrs(patient);
      if (status.synced) {
        synced++;
      } else {
        failed++;
        let msg = status.message as string;
        if (msg.includes("for key 'uuid'") && msg.includes("Duplicate entry")) {
          let err = {
            patientId: patient,
            encProvUuid: msg.substr(31, 36),
          };
          encProvErrors.push(err);
        } else {
          break;
        }
      }
      console.log("========end==========");
    }
  } else {
    for (const ePatient of existingPatients) {
      console.log("=======start===========");
      let status = await updatePatientInAmrs(
        ePatient["KenyaEMR personID"],
        ePatient["AMRS person uuid"]
      );
      console.log(status, ePatient["KenyaEMR personID"]);
      console.log("========end==========");
    }
  }

  let header = [
    {
      id: "patientId",
      title: "patientId",
    },
    {
      id: "encProvUuid",
      title: "encProvUuid",
    },
  ];
  await writeCsv(pathtoError, header, encProvErrors);
  console.log(
    `Total Patients: ${patients.length} Synced: ${synced} Failed: ${failed}`
  );
  // await updatePatientInAmrs(22, '977396f7-e645-41e2-9257-196b45366859');
  // await transferPatientToAmrs(3634);
  // await transferPatientToAmrs(3066);
  // await transferPatientToAmrs(22);
}

start(process.argv[2]);
