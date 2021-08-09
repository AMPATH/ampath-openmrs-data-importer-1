// import moment from "moment";
// import { InsertedMap } from "../inserted-map";
// import PatientAttributeTypeMapper from "./patient-attribute-map";
// import { PatientData } from "./patient-data";

// export type PatientDifference = {
//   wasTransferredFromKenyaEmr: boolean; // the patient was originally transferred from KenyaEMR
//   newRecords: PatientData;
// };

// export async function comparePatients(
//   source: PatientData,
//   destination: PatientData,
//   insertMap: InsertedMap
// ) {
//   await PatientAttributeTypeMapper.instance.initialize();
//   const attributeTypeMap =
//     PatientAttributeTypeMapper.instance.patientAttributeTypeMap;

//   console.log("comparing patients");
//   const difference: PatientDifference = {
//     wasTransferredFromKenyaEmr: false,
//     newRecords: {
//       person: source.person,
//       patient: source.patient,
//       address: source.address,
//       names: [],
//       attributes: [],
//       identifiers: [],
//       patientPrograms: [],
//       obs: [],
//       orders: [],
//       visits: [],
//       provider: source.provider,
//       encounter: [],
//     },
//   };

//   if (source.person.uuid === destination.person.uuid) {
//     difference.wasTransferredFromKenyaEmr = true;
//   }

//   console.log("comparing address"); // determine which is latest
//   if (!insertMap.personAddress) {
//     insertMap.personAddress = {};
//   }
//   insertMap.personAddress[source.address.person_address_id] =
//     destination.address?.person_address_id;
//   if (isMoreRecent(source.address, destination.address)) {
//     difference.newRecords.address = source.address;
//   } else {
//     (difference.newRecords as any).address = null;
//   }

//   console.log("comparing visits");
//   for (let v of source.visits) {
//     const foundVisit = destination.visits.find((d) => d.uuid === v.uuid);
//     if (!foundVisit) {
//       difference.newRecords.visits.push(v);
//     } else {
//       insertMap.visits[v.visit_id] = foundVisit.visit_id;
//     }
//   }

//   console.log("comparing encounters");
//   for (let v of source.encounter) {
//     const foundEncounter = destination.encounter.find((d) => d.uuid === v.uuid);
//     if (!foundEncounter) {
//       difference.newRecords.encounter.push(v);
//     } else {
//       insertMap.encounters[v.encounter_id] = foundEncounter.encounter_id;
//     }
//   }

//   console.log("comparing obs");
//   for (let v of source.obs) {
//     const foundObs = destination.obs.find((d) => d.uuid === v.uuid);

//     if (!foundObs) {
//       // console.log('foundObs', foundObs, v);
//       difference.newRecords.obs.push(v);
//     } else {
//       insertMap.obs[v.obs_id] = foundObs.obs_id;
//     }
//   }

//   console.log("comparing orders");
//   for (let v of source.orders) {
//     const foundOrders = destination.orders.find((d) => d.uuid === v.uuid);
//     if (!foundOrders) {
//       difference.newRecords.orders.push(v);
//     } else {
//       insertMap.orders[v.order_id] = foundOrders.order_id;
//     }
//   }

//   console.log("comparing attributes");
//   for (let v of source.attributes) {
//     if (v.voided === 1) continue;
//     const destAttrbType =
//       attributeTypeMap[v.person_attribute_type_id] ||
//       v.person_attribute_type_id;
//     const foundAttributes = destination.attributes.find(
//       (d) => d.person_attribute_type_id === destAttrbType && d.voided !== 1
//     );
//     if (!foundAttributes) {
//       difference.newRecords.attributes.push(v);
//     } else {
//       if (!insertMap.personAttributes) {
//         insertMap.personAttributes = {};
//       }
//       insertMap.personAttributes[v.person_attribute_id] =
//         foundAttributes.person_attribute_id;
//       if (isMoreRecent(v, foundAttributes)) {
//         difference.newRecords.attributes.push(v);
//       }
//     }
//   }

//   console.log(
//     "done comparing",
//     source.attributes,
//     difference.newRecords.attributes,
//     insertMap.personAttributes
//   );
//   return difference;
// }

// export function isMoreRecent(source: any, destination: any): boolean {
//   const dates = [
//     {
//       type: "source",
//       date: source.date_created,
//     },
//     {
//       type: "source",
//       date: source.date_changed,
//     },
//     {
//       type: "source",
//       date: source.date_voided,
//     },
//     {
//       type: "destination",
//       date: destination?.date_created,
//     },
//     {
//       type: "destination",
//       date: destination?.date_changed,
//     },
//     {
//       type: "destination",
//       date: destination?.date_voided,
//     },
//   ];
//   const sorted = dates
//     .filter((d) => d.date !== null && d.date !== undefined)
//     .sort((a, b) => (moment(a.date).isAfter(moment(b.date)) ? -1 : 1));
//   return sorted[0].type === "source";
// }
