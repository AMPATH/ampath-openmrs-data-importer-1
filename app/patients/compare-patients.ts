import { InsertedMap } from "../inserted-map";
import { PatientData } from "./patient-data";

export type PatientDifference = {
    wasTransferredFromKenyaEmr: boolean; // the patient was originally transferred from KenyaEMR
    newRecords: PatientData;
};

export function comparePatients(source: PatientData, destination: PatientData, insertMap: InsertedMap) {
    console.log('comparing patients');
    const difference:PatientDifference = {
        wasTransferredFromKenyaEmr: false,
        newRecords: {
            person: source.person,
            patient: source.patient,
            address: source.address,
            names: [],
            attributes: source.attributes,
            identifiers: [],
            patientPrograms: [],
            obs: [],
            orders: [],
            visits: [],
            provider: source.provider,
            encounter: [],
        }
    };

    if(source.person.uuid === destination.person.uuid) {
        difference.wasTransferredFromKenyaEmr = true;
    }

    console.log('comparing visits');
    for(let v of source.visits) {
        const foundVisit = destination.visits.find((d)=> d.uuid === v.uuid);
        if(!foundVisit) {
            difference.newRecords.visits.push(v);
        } else {
            insertMap.visits[v.visit_id] = foundVisit.visit_id;
        }
    }

    console.log('comparing encounters');
    for(let v of source.encounter) {
        const foundEncounter = destination.encounter.find((d)=> d.uuid === v.uuid);
        if(!foundEncounter) {
            difference.newRecords.encounter.push(v);
        } else {
            insertMap.encounters[v.encounter_id] = foundEncounter.encounter_id;
        }
    }

    console.log('comparing obs');
    for(let v of source.obs) {
        const foundObs = destination.obs.find((d)=> d.uuid === v.uuid);

        if(!foundObs) {
            console.log('foundObs', foundObs, v);
            difference.newRecords.obs.push(v);
        } else {
            insertMap.obs[v.obs_id] = foundObs.obs_id;
        }
    }

    console.log('comparing orders');
    for(let v of source.orders) {
        const foundOrders = destination.orders.find((d)=> d.uuid === v.uuid);
        if(!foundOrders) {
            difference.newRecords.orders.push(v);
        } else {
            insertMap.orders[v.order_id] = foundOrders.order_id;
        }
    }

    console.log('comparing programs');
    for(let v of source.patientPrograms) {
        const foundProgram = destination.patientPrograms.find((d)=> d.uuid === v.uuid);
        if(!foundProgram) {
            difference.newRecords.patientPrograms.push(v);
        } else {
            insertMap.patientPrograms[v.program_id] = foundProgram.program_id;
        }
    }

    console.log('comparing attributes');
    // for(let v of source.attributes) {
    //     const foundAttributes = destination.attributes.find((d)=> d.uuid === v.uuid);
    //     if(!foundAttributes) {
    //         difference.newRecords.attributes.push(v);
    //     } else {
    //         // insertMap.[v.person_attribute_id] = foundProgram.program_id;
    //     }
    // }
    console.log('done comparing');
    return difference;
}
