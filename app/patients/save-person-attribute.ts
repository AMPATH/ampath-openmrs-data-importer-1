import { Connection } from "mysql";
import ConnectionManager from "../connection-manager";
import { InsertedMap } from "../inserted-map";
import toInsertSql, { toUpdateSql } from "../prepare-insert-sql";
import { PersonAttribute } from "../tables.types";
import UserMapper from "../users/user-map";
import PatientAttributeTypeMapper from "./patient-attribute-map";
import { PatientData } from "./patient-data";

const CM = ConnectionManager.getInstance();
export async function savePersonAttributes(
  patient: PatientData,
  insertMap: InsertedMap,
  AmrsConnection: Connection
) {
  // console.log("user person id", personId);
  const userMap = UserMapper.instance.userMap;
  const attributeTypeMap =
    PatientAttributeTypeMapper.instance.patientAttributeTypeMap;
  for (const attribute of patient.attributes) {
    let replaceColumns = {};
    if (userMap) {
      replaceColumns = {
        creator: userMap[attribute.creator],
        changed_by: userMap[attribute.changed_by],
        voided_by: userMap[attribute.voided_by],
        location_id: 5381, //TODO replace with actual location
        person_id: insertMap.patient,
        person_attribute_type_id:
          attributeTypeMap[attribute.person_attribute_type_id],
      };
    }
    if (
      insertMap.personAttributes &&
      insertMap.personAttributes[attribute.person_attribute_id]
    ) {
      replaceColumns = {
        ...replaceColumns,
        person_attribute_id:
          insertMap.personAttributes[attribute.person_attribute_id] ||
          attribute.person_attribute_id,
      };
      await CM.query(
        toPatientAttributeUpdateStatement(attribute, replaceColumns),
        AmrsConnection
      );
    } else {
      await CM.query(
        toPatientAttributeInsertStatement(attribute, replaceColumns),
        AmrsConnection
      );
    }
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
