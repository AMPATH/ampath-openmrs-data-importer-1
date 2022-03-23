import ConnectionManager from "../connection-manager";
import { Connection } from "mysql";
import { Encounter, Obs } from "../tables.types";

const CM = ConnectionManager.getInstance();

export default async function loadPatientObs(
  personId: number,
  connection: Connection
) {
  const sql = `select * from obs where person_id = ${personId} and voided=0 order by obs_group_id asc`;
  let results: Obs[] = await CM.query(sql, connection);
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
