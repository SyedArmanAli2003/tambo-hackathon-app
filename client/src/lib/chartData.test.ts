import { describe, expect, it } from "vitest";
import {
  prepareCartesianChartData,
  preparePieData,
  prepareScatterData,
  prepareTableData,
} from "./chartData";

describe("dashboard data preparation", () => {
  it("returns explicit invalid results instead of substitute demo data", () => {
    expect(prepareCartesianChartData([], "month", "revenue")).toBeNull();
    expect(preparePieData(undefined)).toEqual([]);
    expect(prepareScatterData([])).toEqual([]);
    expect(prepareTableData(undefined, undefined)).toBeNull();
  });

  it("requires named cartesian columns and keeps only numeric values", () => {
    const prepared = prepareCartesianChartData(
      [
        { Month: "Jan", Revenue: "12" },
        { Month: "Feb", Revenue: "invalid" },
      ],
      "month",
      "revenue"
    );

    expect(prepared).toEqual({
      xKey: "Month",
      yKey: "Revenue",
      data: [{ Month: "Jan", Revenue: 12 }],
    });
    expect(
      prepareCartesianChartData(
        [{ label: "Jan", amount: 12 }],
        "month",
        "revenue"
      )
    ).toBeNull();
  });

  it("rejects requested table columns that are absent", () => {
    expect(
      prepareTableData([{ region: "North", revenue: 10 }], ["missing"])
    ).toBeNull();
  });
});
