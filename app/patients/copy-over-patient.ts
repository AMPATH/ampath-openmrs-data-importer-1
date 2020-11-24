import ConnectionManager from "../connection-manager";
import savePatientData, {
  savePatient,
  savePersonAddress,
  savePersonName,
} from "./save-new-patient";
import loadPatientData, { loadPatientDataByUuid } from "./load-patient-data";
import saveVisitData from "../visits/save-visit-data";
import { InsertedMap } from "../inserted-map";
import savePatientObs from "../encounters/save-obs";
import saveProviderData from "../providers/save-provider-data";
import saveEncounterData from "../encounters/save-encounters";
import savePatientOrders from "../encounters/save-orders";
import { saveProgramEnrolments } from "./save-program-enrolment";
import { savePatientIdentifiers } from "./save-identifiers";
import { savePersonAttributes } from "./save-person-attribute";
const CM = ConnectionManager.getInstance();

export default async function transferPatientToAmrs(personId: number) {
  const kenyaEmrCon = await CM.getConnectionKenyaemr();
  const patient = await loadPatientData(personId, kenyaEmrCon);
  await CM.commitTransaction(kenyaEmrCon);
  console.log("patient", patient.identifiers);
  let amrsCon = await CM.getConnectionAmrs();
  amrsCon = await CM.startTransaction(amrsCon);
  try {
    let saved = { person: patient.person };
    let existingPerson = await loadPatientDataByUuid(
      patient.person.uuid,
      amrsCon
    );
    if (existingPerson.person?.person_id && !patient.patient) {
      saved = existingPerson;
    } else if (patient.patient && !existingPerson.person?.person_id) {
      await savePatientData(patient, amrsCon);
      saved = await loadPatientDataByUuid(patient.person.uuid, amrsCon);
      await savePatient(patient, saved.person.person_id, amrsCon);
    } else if (
      existingPerson.person?.person_id &&
      patient.patient?.patient_id
    ) {
      saved = await loadPatientDataByUuid(patient.person.uuid, amrsCon);
      await savePatient(patient, saved.person.person_id, amrsCon);
    }

    let insertMap: InsertedMap = {
      patient: saved.person.person_id,
      visits: {},
      encounters: {},
      patientPrograms: {},
      patientIdentifier: {},
      obs: {},
      orders: {},
    };
    await savePersonAddress(patient, insertMap, amrsCon);
    await savePersonName(patient, insertMap, amrsCon);
    await savePatientIdentifiers(
      patient.identifiers,
      patient,
      insertMap,
      amrsCon
    );
    await savePersonAttributes(patient, insertMap, amrsCon);
    await saveProgramEnrolments(
      patient.patientPrograms,
      patient,
      insertMap,
      amrsCon
    );
    await saveVisitData(patient, insertMap, kenyaEmrCon, amrsCon);
    await saveEncounterData(patient.encounter, insertMap, amrsCon, kenyaEmrCon);
    await saveProviderData(
      patient.provider,
      patient,
      insertMap,
      kenyaEmrCon,
      amrsCon
    );
    await savePatientOrders(patient.orders, patient, insertMap, amrsCon);
    await savePatientObs(patient.obs, patient, insertMap, amrsCon);
    saved = await loadPatientDataByUuid(patient.person.uuid, amrsCon);
    // console.log('saved patient', saved, insertMap);
    // console.log('saved patient', saved.obs.find((obs)=> obs.obs_id === insertMap.obs[649729]));
    await CM.rollbackTransaction(amrsCon);
    await CM.releaseConnections(amrsCon, kenyaEmrCon);
    return { synced: true, message: null };
  } catch (er) {
    console.error("Error saving patient: " + patient.person.person_id, er);
    await CM.rollbackTransaction(amrsCon);
    await CM.releaseConnections(amrsCon, kenyaEmrCon);
    return { synced: false, message: er.message };
  }
}
