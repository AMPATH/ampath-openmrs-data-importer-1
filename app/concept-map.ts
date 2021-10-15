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
    const lab = await readCsv("metadata/forms/lab_results.csv");
    const triage = await readCsv("metadata/forms/triage.csv");
    const art_prep = await readCsv("metadata/forms/art_prep.csv");
    const clinical = await readCsv("metadata/forms/clinical_encounter.csv");
    const defaulter = await readCsv("metadata/forms/defaulter_tracing.csv");
    const adherence = await readCsv("metadata/forms/enhanced_adherence_counselling.csv");
    const family_history = await readCsv("metadata/forms/family_history.csv");
    const gbv = await readCsv("metadata/forms/gbv.csv");
    const moh257 = await readCsv("metadata/forms/moh_257_visit_summary.csv");
    const tb_enrollment = await readCsv("metadata/forms/tb_enrollment.csv");
    const tb_followup = await readCsv("metadata/forms/tb_followup.csv");
    const tb_screening = await readCsv("metadata/forms/tb_screening.csv");
    const tb_discontinuation = await readCsv("metadata/forms/tb_discontinuation.csv");
    const tb_gene_xpert = await readCsv("metadata/forms/tb_gene_xpert.csv");
    const progress_note = await readCsv("metadata/forms/progress_note.csv");
    const obstetric_history = await readCsv("metadata/forms/obstetric_history.csv");
    const MCHMS_postnatal = await readCsv("metadata/forms/MCHMS_postnatal.csv");
    const MCHMS_preventive_services = await readCsv("metadata/forms/MCHMS_preventive_services.csv");
    const ovc_enrollment = await readCsv("metadata/forms/ovc_enrollment.csv");
    const ovc_discontinuation = await readCsv("metadata/forms/ovc_discontinuation.csv");
    const ipt_initiation = await readCsv("metadata/forms/ipt_initiation.csv");
    const ipt_outcome = await readCsv("metadata/forms/ipt_outcome.csv");
    const ipt_follow_up = await readCsv("metadata/forms/ipt_follow_up.csv");
    const enrollment = await readCsv("metadata/forms/enrollment.csv");
    const adultreturn = await readCsv(
      "metadata/forms/amrs/amrs-mappings.csv"
    );

    let map: any = {};
    let amrsMap: any = {};
    
    adultreturn.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.amrs_concept_id) {
          amrsMap[element.amrs_concept_id] = [element.emr_concept_id];
        }
      }
    );
    ipt_outcome.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "bb77c683-2144-48a5-a011-66d904d776c9",
            "38",
            "25",
          ];
        }
      }
    );
    ipt_follow_up.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "aadeafbe-a3b1-4c57-bc76-8461b778ebd6",
            "39",
            "26",
          ];
        }
      }
    );
    ipt_initiation.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "de5cacd4-7d15-4ad0-a1be-d81c77b6c37d",
            "37",
            "24",
          ];
        }
      }
    );
    clinical.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "465a92f2-baf8-42e9-9612-53064be868e8",
            "1",
            "3",
          ];
        }
      }
    );
    ovc_discontinuation.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "5cf00d9e-09da-11ea-8d71-362b9e155667",
            "74",
            "48",
          ];
        }
      }
    );
    ovc_enrollment.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "5cf0124e-09da-11ea-8d71-362b9e155667",
            "73",
            "47",
          ];
        }
      }
    );
    MCHMS_postnatal.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "c6d09e05-1f25-4164-8860-9f32c5a02df0",
            "22",
            "15",
          ];
        }
      }
    );
    MCHMS_preventive_services.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "c6d09e05-1f25-4164-8860-9f32c5a02df0",
            "25",
            "15",
          ];
        }
      }
    );
    obstetric_history.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "de1f9d67-b73e-4e1b-90d0-036166fc6995",
            "3",
            "5",
          ];
        }
      }
    );
    discontinuation.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "2bdada65-4c72-4a48-8730-859890e25cee",
            "14",
            "2",
          ];
        }
      }
    );
    tb_discontinuation.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "d3e3d723-7458-4b4e-8998-408e8a551a84",
            "29",
            "18",
          ];
        }
      }
    );
    tb_followup.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "fbf0bfce-e9f4-45bb-935a-59195d8a0e35",
            "30",
            "19",
          ];
        }
      }
    );
    tb_enrollment.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "9d8498a4-372d-4dc4-a809-513a2434621e",
            "28",
            "17",
          ];
        }
      }
    );
    tb_screening.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "ed6dacc9-0827-4c82-86be-53c0d8c449be",
            "27",
            "1",
          ];
        }
      }
    );
    tb_gene_xpert.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "ed6dacc9-0827-4c82-86be-53c0d8c449be",
            "41",
            "1",
          ];
        }
      }
    );
    defaulter.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "1495edf8-2df2-11e9-b210-d663bd873d93",
            "53",
            "31",
          ];
        }
      }
    );
    adherence.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "a0034eee-1940-4e35-847f-97537a35d05e",
            "52",
            "8",
          ];
        }
      }
    );
    lab.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "17a381d1-7e29-406a-b782-aa903b963c28",
            "2",
            "4",
          ];
        }
      }
    );
    moh257.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "a0034eee-1940-4e35-847f-97537a35d05e",
            "13",
            "8",
          ];
        }
      }
    );
    gbv.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "a0034eee-1940-4e35-847f-97537a35d05e",
            "50",
            "8",
          ];
        }
      }
    );
    progress_note.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "a0034eee-1940-4e35-847f-97537a35d05e",
            "5",
            "8",
          ];
        }
      }
    );
    
    greenCard.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "a0034eee-1940-4e35-847f-97537a35d05e",
            "34",
            "8",
          ];
        }
      }
    );
    art_prep.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "a0034eee-1940-4e35-847f-97537a35d05e",
            "49",
            "8",
          ];
        }
      }
    );
    triage.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "d1059fb9-a079-4feb-a749-eedd709ae542",
            "7",
            "6",
          ];
        }
      }
    );
    
    family_history.array.forEach(
      (element: { amrs_concept_id: any; emr_concept_id: any }) => {
        if (element.emr_concept_id) {
          map[element.emr_concept_id] = [
            element.emr_concept_id,
            "de1f9d67-b73e-4e1b-90d0-036166fc6995",
            "10",
            "5",
          ];
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
