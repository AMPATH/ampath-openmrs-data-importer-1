import { Connection } from "mysql";
import ConceptMapper from "../concept-map";
import { Obs } from "../tables.types";
import loadPatientObs from "./load-patient-obs";
let path = require("path");

export default class EncounterObsMapper {
  public constructor() {}

  async retrieveobs(patientId: number, connection: Connection) {
    await ConceptMapper.instance.initialize();
    let obss = await loadPatientObs(patientId, connection);
    let mappedObs: any = [];
    for (let i = 0; i < obss.length; i++) {
      const element = obss[i];
      let mapper = await this.mapencounter(element, ConceptMapper.instance);
      if (mapper.encounterTypeUuid) {
        mappedObs.push(mapper);
      }
    }
    const groups = mappedObs.reduce(
      (
        groups: { [x: string]: any },
        item: { encounterTypeUuid: string | number }
      ) => ({
        ...groups,
        [item.encounterTypeUuid]: [
          ...(groups[item.encounterTypeUuid] || []),
          item,
        ],
      }),
      {}
    );
    console.log("aye", obss.length, mappedObs.length, groups);
  }
  async mapencounter(ob: Obs, d: ConceptMapper) {
    // prepare dictionaries
    let encounterObs: EncounterObs = {};
    // map amrs to kenya emr
    let mappedEmrConcept = d.amrsConceptMap[ob.concept_id];

    if (mappedEmrConcept) {
      let map = d.conceptMap[parseInt(mappedEmrConcept.toString(), 0)];
      if (map) {
        // allocate the obs to the right kenyaemr encounter
        ob.concept_id = parseInt(map[0]);
        encounterObs.encounterTypeUuid = map[1];
        encounterObs.formId = map[2];
        encounterObs.obs = ob;
      }
    }
    return encounterObs;
  }
}
export type EncounterObs = {
  encounterTypeUuid?: string;
  formId?: string;
  obs?: {};
};
