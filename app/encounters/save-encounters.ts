import { Connection } from "mysql";
import { Encounter, EncounterProvider, Obs } from "../tables.types";
import ConnectionManager from "../connection-manager";
import UserMapper from "../users/user-map";
import toInsertSql from "../prepare-insert-sql";
import { InsertedMap } from "../inserted-map";
import {
  fetchAmrsEncounterType,
  fetchEncounter,
  fetchEncounterProviders,
  fetchEncounterType,
  fetchKemrEncounterById,
} from "./load-encounters";
import ProviderMapper from "../providers/provider-map";
import FormMapper from "./form-map";
import EncounterObsMapper from "./amrs-emr-encounter-map";
import savePatientObs, { saveObs } from "./save-obs";

const CM = ConnectionManager.getInstance();

export default async function saveEncounterData(
  encounters: Encounter[],
  insertMap: InsertedMap,
  amrsconnection: Connection,
  kemrConnection: Connection,
  personId: number
) {
  //Todo add form mapper
  await UserMapper.instance.initialize();
  await FormMapper.instance.initialize();
  return saveEncounter(
    encounters,
    kemrConnection,
    amrsconnection,
    insertMap,
    personId,
    UserMapper.instance.userMap
  );
}
export async function saveEncounter(
  _encounter: Encounter[],
  kemrsConnection: Connection,
  amrsConnection: Connection,
  insertMap: InsertedMap,
  personId: number,
  userMap?: any
) {
  let replaceColumns = {};
  // Map encounter to respective kenyaemr encounters and forms
  let encounterObsMapper = new EncounterObsMapper();
  let encounter: any = await encounterObsMapper.retrieveobs(
    personId,
    amrsConnection
  );
  for (const enc of Object.keys(encounter)) {
    let visitId = null;
    if (encounter[enc][0].visitId) {
      visitId = encounter[enc][0].visitId;
    }
    if (enc !== "0") {
      let enc2 = await fetchKemrEncounterById(parseInt(enc, 0), amrsConnection);
      if (userMap) {
        replaceColumns = {
          creator: userMap[encounter[parseInt(enc, 0)][0].obs.creator],
          changed_by: userMap[encounter[parseInt(enc, 0)][0].obs.changed_by],
          voided_by: userMap[encounter[parseInt(enc, 0)][0].obs.voided_by],
          encounter_type: encounter[parseInt(enc, 0)][0].encounterTypId,
          form_id: parseInt(encounter[enc][0].formId, 0),
          visit_id: insertMap.visits[visitId],
          location_id: 5381,
          patient_id: insertMap.patient,
        };
      }
      const savedEncounter = await CM.query(
        toEncounterInsertStatement(enc2[0], replaceColumns),
        kemrsConnection
      );
      let obsToInsert: Obs[] = [];
      encounter[parseInt(enc, 0)].map((a: any) => {
        obsToInsert.push(a.obs);
      });
      insertMap.encounters[encounter[parseInt(enc, 0)][0].obs.encounter_id] =
        savedEncounter.insertId;

      const savedObs = await savePatientObs(
        obsToInsert,
        insertMap,
        kemrsConnection,
        savedEncounter.insertId
      );
      await saveEncounterProviderData(
        enc2,
        savedEncounter.insertId,
        amrsConnection,
        userMap
      );
    } else {
      //save obs without encounters
      let obsToInsert: Obs[] = [];
      encounter[parseInt(enc, 0)].map((a: any) => {
        obsToInsert.push(a.obs);
      });

      const savedObsWithoutEncounter = await savePatientObs(
        obsToInsert,
        insertMap,
        kemrsConnection,
        null
      );
    }
  }
}
export async function saveEncounterProviderData(
  enc: Encounter,
  encounterId: number,
  connection: Connection,
  emrCON: Connection,
  userMap?: any
) {
  const EncounterProviders = await fetchEncounterProviders(
    connection,
    enc.encounter_id
  );
  await ProviderMapper.instance.initialize();
  // console.log("Inserting encounter providers", EncounterProviders);
  let replaceColumns = {};
  for (const enc_provider of EncounterProviders) {
    const providerId = 1;
    //ProviderMapper.instance.providerMap[enc_provider.provider_id];
    if (enc_provider) {
      replaceColumns = {
        encounter_id: encounterId,
        provider_id: providerId + "-Migrated",
      };
    }
    let encounterProviderExist = await fetchEncounterProviders(
      connection,
      enc_provider.encounter_id
    );
    if (encounterProviderExist.length === 0) {
      await CM.query(
        toEncounterProviderInsertStatement(enc_provider, replaceColumns),
        emrCON
      );
    }
  }
}
export function toEncounterInsertStatement(
  encounter: Encounter,
  replaceColumns?: any
) {
  return toInsertSql(encounter, ["encounter_id"], "encounter", replaceColumns);
}
export function toEncounterProviderInsertStatement(
  encounterProvider: EncounterProvider,
  replaceColumns?: any
) {
  return toInsertSql(
    encounterProvider,
    ["encounter_provider_id"],
    "encounter_provider",
    replaceColumns
  );
}
