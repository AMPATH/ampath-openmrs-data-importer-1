import { Connection } from "mysql";
import readCsv from "../read-csv";
import { Encounter, Obs } from "../tables.types";
import loadPatientObs from "./load-patient-obs";

export default class EncounterObsMapper {
  private constructor() {}
  async retrieveobs(patientId: number, connection: Connection) {
    let obs = await loadPatientObs(patientId, connection);
    for (let index = 0; index < obs.length; index++) {
      const element = obs[index];
      this.mapencounter(element);
      break;
    }
  }
  async mapencounter(obs: Obs) {
    // prepare dictionaries
    let greenCard = await readCsv("../../metadata/forms/green_card.csv");
    let discontinuation = await readCsv(
      "../../metadata/forms/discontinuation.csv"
    );
    let triage = await readCsv("../../metadata/forms/triage.csv");
    let enrollment = await readCsv("../../metadata/forms/enrollment.csv");
    console.log(discontinuation);
  }
}
export type EncounterObs = {
  greenCard: {
    encDetails: EncounterDetails;
  };
  triage: {
    encDetails: EncounterDetails;
  };
  discontinuation: {
    encDetails: EncounterDetails;
  };
  enrollment: {
    encDetails: EncounterDetails;
  };
};

export type EncounterDetails = {
  encounterTypeUuid: string;
  formUuid: string;
  obs: [];
};
