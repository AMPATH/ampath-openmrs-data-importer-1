import ConnectionManager from "../connection-manager";
import { Connection } from "mysql";
import { Encounter, Obs } from "../tables.types";

const CM = ConnectionManager.getInstance();

export default async function loadPatientObs(
  personId: number,
  connection: Connection
) {
  const sql = `select * from obs where person_id = ${personId} order by obs_group_id asc`;
  let results: Obs[] = await CM.query(sql, connection);
  return results;
}
export async function fetchEncounterVisitFromObs(
  obsId: number,
  connection: Connection
) {
  const sql = `select * from encounter where encounter_id = ${obsId} `;
  let results: Encounter[] = await CM.query(sql, connection);
  return results[0];
}
export async function insertMissingConcepts(
  obsId: number,
  conceptType:string,
  connection: Connection
) {
  const sql = `insert into missing_concepts set concept_id = ${obsId}, type="${conceptType}"`;
  let results: any = await CM.query(sql, connection);
  return results[0];
}
