import { describe, expect, it } from "vitest";
import { extractJsonDatasetRows } from "./datasetRows";

describe("JSON dataset rows", () => {
  it("accepts arrays and data wrappers containing flat records", () => {
    expect(extractJsonDatasetRows([{ name: "A", value: 1 }])).toEqual([
      { name: "A", value: 1 },
    ]);
    expect(
      extractJsonDatasetRows({ data: [{ name: "B", active: true }] })
    ).toEqual([{ name: "B", active: true }]);
  });

  it("rejects empty, null, array, and nested-object rows", () => {
    expect(extractJsonDatasetRows([])).toBeNull();
    expect(extractJsonDatasetRows([null])).toBeNull();
    expect(extractJsonDatasetRows([["not", "a", "record"]])).toBeNull();
    expect(extractJsonDatasetRows([{ name: { nested: true } }])).toBeNull();
  });
});
