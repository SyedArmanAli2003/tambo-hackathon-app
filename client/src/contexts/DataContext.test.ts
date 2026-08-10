import { describe, expect, it } from "vitest";
import { detectColumnTypes } from "./DataContext";

describe("dataset column detection", () => {
  it("detects numeric, date, and categorical columns", () => {
    expect(
      detectColumnTypes([
        { revenue: "10", date: "2026-01-01", region: "North" },
        { revenue: "20", date: "2026-01-02", region: "South" },
      ])
    ).toEqual({ revenue: "number", date: "date", region: "string" });
  });
});
