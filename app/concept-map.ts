const readCsv = require("./read-csv");

export default class ConceptMapper {
  private static _instance: ConceptMapper;
  private _conceptMap?: ConceptMap;
  private _amrsConceptMap?: AmrsConceptMap;

  private constructor() {}
  static get instance(): ConceptMapper {
    if (!ConceptMapper._instance) {
      ConceptMapper._instance = new ConceptMapper();
    }
    return ConceptMapper._instance;
  }

  async initialize() {
    if (this._conceptMap) {
      return;
    }

    if (this._amrsConceptMap) {
      return;
    }
    const greenCard = await readCsv("metadata/forms/green_card.csv");
    const discontinuation = await readCsv("metadata/forms/discontinuation.csv");
    const triage = await readCsv("metadata/forms/triage.csv");
    const enrollment = await readCsv("metadata/forms/enrollment.csv");
    const adultreturn = await readCsv(
      "metadata/forms/amrs/adult_initial_v4.1.csv"
    );

    let map: any = {};
    let amrsMap: any = {};
    greenCard.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.amrs_concept_id) {
          map[element.amrs_concept_id] = [
            element.emr_concept_id,
            "a0034eee-1940-4e35-847f-97537a35d05e",
            "34",
            "8",
          ];
        }
      }
    );
    discontinuation.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.amrs_concept_id) {
          map[element.amrs_concept_id] = [
            element.emr_concept_id,
            "2bdada65-4c72-4a48-8730-859890e25cee",
            "8",
            "2",
          ];
        }
      }
    );
    triage.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.amrs_concept_id) {
          map[element.amrs_concept_id] = [
            element.emr_concept_id,
            "d1059fb9-a079-4feb-a749-eedd709ae542",
            "7",
            "6",
          ];
        }
      }
    );
    enrollment.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.amrs_concept_id) {
          map[element.amrs_concept_id] = [
            element.emr_concept_id,
            "de78a6be-bfc5-4634-adc3-5f1a280455cc",
            "14",
            "7",
          ];
        }
      }
    );
    adultreturn.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.amrs_concept_id) {
          amrsMap[element.amrs_concept_id] = [element.emr_concept_id];
        }
      }
    );
    this._conceptMap = map;
    this._amrsConceptMap = amrsMap;
  }

  get conceptMap(): ConceptMap {
    return this._conceptMap || {};
  }
  get amrsConceptMap(): AmrsConceptMap {
    return this._amrsConceptMap || {};
  }
}
export type ConceptMap = {
  [source_concept_id: number]: [string, string, string, string];
};
export type AmrsConceptMap = {
  [source_concept_id: number]: number;
};
