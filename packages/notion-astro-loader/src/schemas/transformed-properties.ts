import * as propertyType from "./raw-properties.js";
import { dateToDateObjects, richTextToPlainText } from "../format.js";

export const number = propertyType.number.transform(
  (property) => property.number,
);
export const url = propertyType.url.transform((property) => property.url);
export const email = propertyType.email.transform((property) => property.email);
export const phone_number = propertyType.phone_number.transform(
  (property) => property.phone_number,
);
export const checkbox = propertyType.checkbox.transform(
  (property) => property.checkbox,
);

export const select = propertyType.select.transform(
  (property) => property.select?.name ?? null,
);
export const multi_select = propertyType.multi_select.transform(
  (property) => property.multi_select.map((option) => option.name) ?? [],
);
export const status = propertyType.status.transform(
  (property) => property.status?.name ?? null,
);

export const title = propertyType.title.transform((property) =>
  richTextToPlainText(property.title),
);
export const rich_text = propertyType.rich_text.transform((property) =>
  richTextToPlainText(property.rich_text),
);

export const date = propertyType.date.transform((property) =>
  dateToDateObjects(property.date),
);
export const created_time = propertyType.created_time.transform(
  (property) => new Date(property.created_time),
);
