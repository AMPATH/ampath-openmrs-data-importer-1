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
import { comparePatients } from "./compare-patients";
const CM = ConnectionManager.getInstance();

export default async function updatePatientInAmrs(kenyaemrPersonId: number, amrsPersonUuid: string) {
  const kenyaEmrCon = await CM.getConnectionKenyaemr();
  const kenyaEmrPatient = await loadPatientData(kenyaemrPersonId, kenyaEmrCon);
  await CM.commitTransaction(kenyaEmrCon);


  let amrsCon = await CM.getConnectionAmrs();
  amrsCon = await CM.startTransaction(amrsCon);

  try {
    const amrsPatient = await loadPatientDataByUuid(amrsPersonUuid, amrsCon);
    console.log("patient", amrsPatient.obs.length);
    let insertMap: InsertedMap = {
        patient: amrsPatient.person.person_id,
        visits: {},
        encounters: {},
        patientPrograms: {},
        patientIdentifier: {},
        obs: {},
        orders: {},
    };
    const difference = comparePatients(kenyaEmrPatient, amrsPatient, insertMap);
    console.log('difference',difference.newRecords.obs.length);
    // await savePersonAddress(kenyaEmrPatient, insertMap, amrsCon);
    // await savePersonName(kenyaEmrPatient, insertMap, amrsCon);
    // await savePatientIdentifiers(
    //   kenyaEmrPatient.identifiers,
    //   kenyaEmrPatient,
    //   insertMap,
    //   amrsCon
    // );
    // await savePersonAttributes(difference.newRecords, insertMap, amrsCon);
    await saveProgramEnrolments(
      difference.newRecords.patientPrograms,
      kenyaEmrPatient,
      insertMap,
      amrsCon
    );
    await saveVisitData(difference.newRecords, insertMap, kenyaEmrCon, amrsCon);
    await saveEncounterData(difference.newRecords.encounter, insertMap, amrsCon, kenyaEmrCon);
    await savePatientOrders(difference.newRecords.orders, kenyaEmrPatient, insertMap, amrsCon);
    await savePatientObs(difference.newRecords.obs, kenyaEmrPatient, insertMap, amrsCon);
    await saveProviderData(difference.newRecords.provider, insertMap, kenyaEmrCon, amrsCon);
    const saved = await loadPatientDataByUuid(kenyaEmrPatient.person.uuid, amrsCon);
    console.log('saved patient', saved, insertMap);
    // console.log('saved patient', saved.obs.find((obs)=> obs.obs_id === insertMap.obs[649729]));
    // await CM.commitTransaction(amrsCon);
    await CM.rollbackTransaction(amrsCon);
  } catch (er) {
    console.error("Error saving patient:", er);
    await CM.rollbackTransaction(amrsCon);
  }
}
