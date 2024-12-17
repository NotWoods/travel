import { expect, test } from "vitest";
import * as schemas from "../src/schemas/";
import * as rawPropertySchema from "../src/schemas/raw-properties";
import * as transformedPropertySchema from "../src/schemas/transformed-properties";

test("./schemas matches ./schemas/raw-properties export", () => {
  expect(schemas.propertySchema).toEqual(rawPropertySchema);
});

test("./schemas matches ./schemas/transformed-properties export", () => {
  expect(schemas.transformedPropertySchema).toEqual(transformedPropertySchema);
});
