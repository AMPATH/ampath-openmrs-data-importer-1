import { Connection } from "mysql";
import { Person, Patient, PatientProgram } from "../tables.types";
import { PatientData } from "./patient-data";
import ConnectionManager from "../connection-manager";
import UserMapper from "../users/user-map";
import toInsertSql from "../prepare-insert-sql";
import { InsertedMap } from "../inserted-map";
import transferLocationToEmr from "../location/location";

const CM = ConnectionManager.getInstance();

export const KenyaEMR_HIV_Program = 1;
export const KenyaEMR_MCH_Program = 2;
export const AMR_HIV_Program = 1;
export const AMR_OVC_Program = 2;
export const AMR_PMTCT_Program = 4;
export const AMR_DC_Program = 9;
export const AMR_VIREMIA_Program = 27;

export async function saveProgramEnrolments(
  enrollmentsToInsert: PatientProgram[],
  patient: PatientData,
  insertMap: InsertedMap,
  connection: Connection
) {
  await saveHivEnrolments(enrollmentsToInsert, insertMap, connection);
}

export async function saveHivEnrolments(
  enrollmentsToInsert: PatientProgram[],
  insertMap: InsertedMap,
  connection: Connection
) {
  for (const p of enrollmentsToInsert) {
    //TODO: Determine if we should create other AMRS programs a patient was enrolled in on EMR
    if (
      p.program_id === AMR_HIV_Program ||
      p.program_id === AMR_OVC_Program ||
      p.program_id === AMR_VIREMIA_Program ||
      p.program_id === AMR_DC_Program
    ) {
      await saveProgramEnrolment(
        p,
        KenyaEMR_HIV_Program,
        insertMap,
        connection
      );
    } else if (p.program_id === AMR_PMTCT_Program) {
      await saveProgramEnrolment(
        p,
        KenyaEMR_MCH_Program,
        insertMap,
        connection
      );
    }
  }
}

export async function saveProgramEnrolment(
  enrolment: PatientProgram,
  programId: number,
  insertMap: InsertedMap,
  connection: Connection
) {
  // console.log("user person id", personId);
  const userMap = UserMapper.instance.userMap;
  let replaceColumns = {};
  if (userMap) {
    replaceColumns = {
      creator: userMap[enrolment.creator],
      changed_by: userMap[enrolment.changed_by],
      voided_by: userMap[enrolment.voided_by],
      location_id: await transferLocationToEmr(enrolment.location_id), //TODO replace with actual location
      patient_id: insertMap.patient,
      program_id: programId,
    };
  }
  const results = await CM.query(
    toEnrolmentInsertStatement(enrolment, replaceColumns),
    connection
  );
  insertMap.patientPrograms[enrolment.patient_program_id] = results.insertId;
}

export function toEnrolmentInsertStatement(
  enrolment: PatientProgram,
  replaceColumns?: any
) {
  return toInsertSql(
    enrolment,
    ["patient_program_id"],
    "patient_program",
    replaceColumns
  );
}
