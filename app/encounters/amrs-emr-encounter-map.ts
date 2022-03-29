import { Connection } from "mysql";
import ConceptMapper from "../concept-map";
import transferDrugToEmr from "../drugs/drugs";
import { InsertedMap } from "../inserted-map";
import mysql from "mysql";
import { Encounter, Obs } from "../tables.types";
import userMap from "../users/user-map";
import loadPatientObs, {
  checkConceptDrugsaved,
  fetchEncounterVisitFromObs,
  insertMissingConcepts,
  loadEnrolementPatientObs,
  loadPatientARVPlan,
} from "./load-patient-obs";
import ConnectionManager from "../connection-manager";
import savePatientObs from "./save-obs";
import transferLocationToEmr from "../location/location";
import UserMapper from "../users/user-map";
const CM = ConnectionManager.getInstance();
export default class EncounterObsMapper {
  public constructor() {}

  async retrieveobs(
    patientId: number,
    connection: Connection,
    emrConn: Connection,
    insertMap: InsertedMap,
    encounterType:number
  ) {
    await ConceptMapper.instance.initialize();
    let obss:Obs[] = []
    if(encounterType == 1){
      obss = await loadEnrolementPatientObs(patientId, connection);
    }else{
      obss = await loadPatientObs(patientId, connection);
    }
    
    let mappedObs: any = [];
    for (let i = 0; i < obss.length; i++) {
      const element = obss[i];
      let mapper = await this.mapencounter(
        element,
        ConceptMapper.instance,
        connection,
        emrConn,
        insertMap
      );
      if (mapper?.encounterTypeUuid && mapper.obs?.value_coded !== NaN) {
        mappedObs.push(mapper);
      }
    }
    const groups = mappedObs.reduce(
      (
        groups: { [x: string]: any },
        item: { obs: { encounter_id: string | number } }
      ) => ({
        ...groups,
        [item.obs.encounter_id]: [
          ...(groups[item.obs.encounter_id] || []),
          item,
        ],
      }),
      {}
    );
    return groups;
  }
  async mapencounter(
    ob: Obs,
    d: ConceptMapper,
    con: Connection,
    emrConn: Connection,
    insertmap: InsertedMap
  ) {
    // prepare dictionaries
    let encounterObs: EncounterObs = {};
    // map amrs to kenya emr

    let mappedEmrConcept: any = d.amrsConceptMap[ob.concept_id];
    //fetch visit for ob
    let encounter = await fetchEncounterVisitFromObs(ob.encounter_id, con);

    if (
      mappedEmrConcept &&
      mappedEmrConcept.length > 0 &&
      mappedEmrConcept[0] !== "" &&
      mappedEmrConcept[0] !== "-"
    ) {
      let map = d.conceptMap[parseInt(mappedEmrConcept[0], 0)];
      if (map) {
        if (ob.concept_id === 1255 || ob.concept_id === 1772) {
          return {};
        }
        if (ob.encounter_id === null) {
          ob.encounter_id = 0;
          encounterObs.obs = ob;
          encounterObs.encounterTypeUuid = "unknown";
          return encounterObs;
        }
        encounterObs.encounterTypeUuid = map[1];
        encounterObs.encounterTypId = map[3];
        encounterObs.formId = map[2];
        encounterObs.visitId = encounter.visit_id;
        encounterObs.locationId = encounter.location_id;
        ob.concept_id = mappedEmrConcept[0];
        //Enrollment  encounter types
        let enrollment: number[] = [1, 32, 3, 73, 105];
        if (enrollment.includes(encounter.encounter_type)) {
          encounterObs.encounterTypeUuid =
            "de78a6be-bfc5-4634-adc3-5f1a280455cc";
          encounterObs.encounterTypId = "7";
          encounterObs.formId = "8";
        }
        if (ob.value_coded > 0) {
          let a: any = d.amrsConceptMap[ob.value_coded];

          if (a && a.length > 0) {
            if (a[0] > 0) {
              ob.value_coded = a[0];
            } else {
              ob.value_coded = ob.value_coded;
            }
          }
        }
        //If started on ART Create enrollment encounter

        if (ob.value_drug || ob.concept_id == 1088) {
          //ob.value_drug = 1;
          let a: any = await transferDrugToEmr(ob.value_drug);
          if ((a && a > 0) || ob.concept_id == 1088) {
            let ARVObs = await loadPatientARVPlan(ob.encounter_id, con);
            const userMap = UserMapper.instance.userMap;
            let drugRegimenEncounter: Encounter = encounter;
            let replaceColumns = {
              creator: userMap[encounter.creator],
              changed_by: userMap[encounter.changed_by],
              voided_by: userMap[encounter.voided_by],
              encounter_type: 29,
              form_id: 49,
              location_id: await transferLocationToEmr(encounter.location_id),
              patient_id: insertmap.patient,
              visit_id: null,
              uuid: uuidv4(),
            };

            //Add Regimen Plan observation
            let regEditor: Obs[] = [];
            let checkConceptDrug = await checkConceptDrugsaved(
              ob.obs_datetime,
              insertmap.patient,
              emrConn
            );
            if (!insertmap.regimen.includes(ob.encounter_id)) {
              //regEditor.push(ob);
              console.log(
                "Encounter",
                ob.encounter_id,
                insertmap.regimen.includes(ob.encounter_id),
                insertmap.regimen
              );
              const savedEncounter = await createDrugRegimenEncounter(
                replaceColumns,
                drugRegimenEncounter,
                emrConn
              );

              ARVObs.forEach(async (element) => {
                element.encounter_id = savedEncounter.insertId;
                console.log(
                  "Regimen Editor",
                  element,
                  d.amrsConceptMap[element.value_coded]
                );
                let drugMap = await transferDrugToEmr(element.value_drug);
                let conceptDrug: any = d.amrsConceptMap[element.value_coded];
                if (element.concept_id !== 1255) {
                  insertmap.regimen.push(ob.encounter_id);
                  element.concept_id = mappedEmrConcept[0];
                  element.value_coded =
                    drugMap !== null ? drugMap : conceptDrug[0];
                  element.value_drug = null;
                }

                regEditor.push(element);
              });

              await savePatientObs(
                regEditor,
                insertmap,
                emrConn,
                savedEncounter.insertId
              );
            } else {
              console.log(
                "Encounter",
                checkConceptDrug.length,
                checkConceptDrug
              );
              return;
            }

            return {};
          } else {
            ob.value_drug = null;
            await this.insertMissingConcepts(ob.value_drug, "Drug", con);
          }
        }
        encounterObs.obs = ob;
      } else {
        encounterObs.visitId = null;
        encounterObs.locationId = null;
        let enrollment: number[] = [1, 32, 3, 73, 105];
        if (encounter && enrollment.includes(encounter.encounter_type)) {
          encounterObs.encounterTypeUuid =
            "de78a6be-bfc5-4634-adc3-5f1a280455cc";
          encounterObs.encounterTypId = "7";
          encounterObs.formId = "8";
        } else {
          encounterObs.encounterTypeUuid =
            "a0034eee-1940-4e35-847f-97537a35d05e";
          encounterObs.encounterTypId = "8";
          encounterObs.formId = "34";
          ob.encounter_id = 0;
        }

        ob.concept_id = mappedEmrConcept[0];
        encounterObs.obs = ob;
      }
    } else {
      await this.insertMissingConcepts(ob.concept_id, "unMapped", con);
      console.log("Unmapped", ob);
    }
    return encounterObs;
  }
  async insertMissingConcepts(
    ob: number,
    conceptType: string,
    con: Connection
  ) {
   //(ob, conceptType, con);
  }
}
export async function createDrugRegimenEncounter(
  replaceColumns: any,
  encounter: Encounter,
  con: Connection
) {
  // /await CM.query("SET FOREIGN_KEY_CHECKS = 0 ", con);
  const savedEncounter = await CM.query(
    toEncounterInsertStatement(encounter, replaceColumns),
    con
  );
  console.log(savedEncounter);
  return savedEncounter;
}
export function toEncounterInsertStatement(
  encounter: Encounter,
  replaceColumns?: any
) {
  return toInsertSql(
    encounter,
    ["encounter_id", "visit_id", "value_drug"],
    "encounter",
    replaceColumns
  );
}
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export function toInsertSql(
  obj: any,
  excludeColumns: string[],
  table: string,
  replaceColumns?: any
) {
  let set: any = {};
  for (let o in obj) {
    if (excludeColumns.includes(o)) {
      continue;
    }
    if (replaceColumns[o]) {
      set[o] = replaceColumns[o];
    } else {
      set[o] = obj[o];
    }
  }
  const sql = mysql.format(`insert INTO ${table} SET ?`, [set]);
  console.log("SQL::: ", sql);
  return sql;
}
export type EncounterObs = {
  encounterTypeUuid?: string;
  locationId?: any;
  encounterTypId?: string;
  formId?: string;
  encounterId?: number;
  visitId?: any;
  creator?: string;
  changed_by?: string;
  voided_by?: string;
  obs?: any;
};
