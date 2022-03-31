import ConnectionManager from "../connection-manager";
import { Connection } from "mysql";
import { Encounter, Obs } from "../tables.types";
import moment from "moment";

const CM = ConnectionManager.getInstance();

export async function loadEnrolementPatientObs(
  personId: number,
  connection: Connection
) {
  const sql = `SELECT o.* FROM obs o JOIN encounter e ON e.encounter_id = o.encounter_id WHERE o.person_id = ${personId} AND o.voided = 0 AND e.encounter_type IN (1 , 32, 3, 73, 105) ORDER BY o.obs_group_id ASC`;
  let results: Obs[] = await CM.query(sql, connection);
  return results;
}
export default async function loadPatientObs(
  personId: number,
  connection: Connection
) {
  const maxDate = `select max(encounter_datetime) as date from encounter where patient_id=${personId}`;

  let date: any = await CM.query(maxDate, connection);
  console.log("aye", date);
  const sql = `SELECT o.* FROM     obs o         JOIN     encounter e ON e.encounter_id = o.encounter_id WHERE     o.person_id = ${personId} AND o.voided = 0         AND e.encounter_type  not IN (1 , 32, 3, 73, 105,208,69) AND (e.encounter_datetime >= "${moment(
    date[0].date
  ).format("YYYY-MM-DD")}" - INTERVAL 2 year)  ORDER BY o.obs_group_id ASC`;
  let results: Obs[] = await CM.query(sql, connection);
  console.log("Obs for 2 yrs", sql, results);
  return results;
}
export async function loadPatientARVPlan(
  encounterId: number,
  connection: Connection
) {
  const sql = `select * from obs where encounter_id = ${encounterId} and (concept_id=1255 or concept_id=1088) and voided=0`;
  let results: Obs[] = await CM.query(sql, connection);
  return results;
}
export async function checkConceptDrugsaved(
  ObDate: Date,
  person_id: number,
  connection: Connection
) {
  const sql = `select * from obs where person_id=${person_id} and date_created = STR_TO_DATE('${ObDate}','yyyy-dd-mm hh:mm:ss') and (concept_id=1088 or concept_id=1255)`;
  let results: Obs[] = await CM.query(sql, connection);
  return results;
}
export async function fetchEncounterVisitFromObs(
  obsId: number,
  connection: Connection
) {
  const sql = `select * from encounter where encounter_id = ${obsId} and voided=0 `;
  let results: Encounter[] = await CM.query(sql, connection);
  return results[0];
}
export async function insertMissingConcepts(
  obsId: number,
  conceptType: string,
  connection: Connection
) {
  const sql = `replace into missing_concepts set concept_id = ${obsId}, type="${conceptType}"`;
  let results: any = await CM.query(sql, connection);
  return results[0];
}
