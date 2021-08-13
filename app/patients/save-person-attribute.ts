import { Connection } from "mysql";
import ConnectionManager from "../connection-manager";
import { InsertedMap } from "../inserted-map";
import toInsertSql, { toUpdateSql } from "../prepare-insert-sql";
import { PersonAttribute } from "../tables.types";
import { fetchorCreatePersonAttributeTypes } from "./load-patient-data";
import { PatientData } from "./patient-data";

const CM = ConnectionManager.getInstance();
export async function savePersonAttributes(
  patient: PatientData,
  insertMap: InsertedMap,
  AmrsConnection: Connection,
  EmrConnection: Connection
) {
  for (const attribute of patient.attributes) {
    let replaceColumns = {};
    //Create attribute type if missing
    let attributeID = await fetchorCreatePersonAttributeTypes(
      AmrsConnection,
      EmrConnection,
      attribute.person_attribute_type_id
    );
    console.log(
      "Attribute ID",
      attributeID,
      attribute.person_attribute_type_id
    );
    replaceColumns = {
      location_id: 5381, //TODO replace with actual location
      person_id: insertMap.patient,
      person_attribute_type_id: attributeID,
    };
    await CM.query(
      toPatientAttributeInsertStatement(attribute, replaceColumns),
      EmrConnection
    );
  }
}

export function toPatientAttributeInsertStatement(
  attribute: PersonAttribute,
  replaceColumns?: any
) {
  return toInsertSql(
    attribute,
    ["person_attribute_id"],
    "person_attribute",
    replaceColumns
  );
}

export function toPatientAttributeUpdateStatement(
  attribute: PersonAttribute,
  replaceColumns?: any
) {
  return toUpdateSql(
    attribute,
    ["person_attribute_id"],
    "person_attribute",
    "person_attribute_id",
    replaceColumns
  );
}
