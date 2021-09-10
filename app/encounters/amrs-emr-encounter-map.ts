import { Connection } from "mysql";
import ConceptMapper from "../concept-map";
import { Obs } from "../tables.types";
import loadPatientObs, {
  fetchEncounterVisitFromObs,
  insertMissingConcepts,
} from "./load-patient-obs";

export default class EncounterObsMapper {
  public constructor() {}

  async retrieveobs(patientId: number, connection: Connection) {
    await ConceptMapper.instance.initialize();
    let obss = await loadPatientObs(patientId, connection);
    let mappedObs: any = [];
    for (let i = 0; i < obss.length; i++) {
      const element = obss[i];
      let mapper = await this.mapencounter(
        element,
        ConceptMapper.instance,
        connection
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
  async mapencounter(ob: Obs, d: ConceptMapper, con: Connection) {
    // prepare dictionaries
    let encounterObs: EncounterObs = {};
    // map amrs to kenya emr
    let mappedEmrConcept: any = d.amrsConceptMap[ob.concept_id];
    //fetch visit for ob
    let encounter = await fetchEncounterVisitFromObs(ob.encounter_id, con);

    if (
      mappedEmrConcept &&
      mappedEmrConcept.length > 0 &&
      mappedEmrConcept[0] !== ""
    ) {
      let map = d.conceptMap[parseInt(mappedEmrConcept[0], 0)];
      if (map) {
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
        ob.concept_id = mappedEmrConcept[0];

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
        if (ob.value_drug) {
          // TODO: Fix drug mappings
          ob.value_drug = 1;
          let a: any = d.amrsConceptMap[ob.value_drug];

          if (a && a.length > 0) {
            ob.value_drug = 1;
          }
        }
        encounterObs.obs = ob;
      } else {
        await this.insertMissingConcepts(ob.concept_id, "Unknown", con);
        console.log("Unknown", ob);
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
    await insertMissingConcepts(ob, conceptType, con);
  }
}

export type EncounterObs = {
  encounterTypeUuid?: string;
  encounterTypId?: string;
  formId?: string;
  encounterId?: number;
  visitId?: number;
  creator?: string;
  changed_by?: string;
  voided_by?: string;
  obs?: any;
};
