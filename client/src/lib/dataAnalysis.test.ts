import { describe, expect, it } from "vitest";
import { analyzeDataset, findRelevantAggregation } from "./dataAnalysis";

describe("dataset analysis", () => {
  const rows = [
    { region: "North", revenue: 10, customers: 1 },
    { region: "North", revenue: 20, customers: 2 },
    { region: "South", revenue: 30, customers: 3 },
  ];

  it("computes numeric statistics, grouped aggregations, and correlations", () => {
    const summary = analyzeDataset(rows, ["region", "revenue", "customers"], {
      region: "string",
      revenue: "number",
      customers: "number",
    });

    expect(
      summary.columnStats.find(stat => stat.column === "revenue")
    ).toMatchObject({
      min: 10,
      max: 30,
      mean: 20,
      sum: 60,
    });
    expect(
      findRelevantAggregation(summary, "total revenue by region")?.data
    ).toEqual([
      { region: "North", revenue: 30 },
      { region: "South", revenue: 30 },
    ]);
    expect(summary.correlations[0]).toMatchObject({ correlation: 1 });
  });
});
