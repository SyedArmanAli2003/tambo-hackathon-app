import { describe, expect, it } from "vitest";
import { componentSchemas, dataRowSchema } from "./componentSchemas";
import { tamboComponents } from "./componentRegistry";

describe("Tambo component registration", () => {
  it("registers every schema exactly once with Standard Schema support", () => {
    const names = tamboComponents.map(component => component.name);

    expect(new Set(names).size).toBe(names.length);
    expect(names.sort()).toEqual(Object.keys(componentSchemas).sort());
    for (const schema of Object.values(componentSchemas)) {
      expect(schema["~standard"]).toBeDefined();
    }
  });

  it("accepts primitive dataset rows and rejects nested arbitrary objects", () => {
    expect(
      dataRowSchema.safeParse({ region: "North", revenue: 42, active: true })
        .success
    ).toBe(true);
    expect(dataRowSchema.safeParse({ region: { name: "North" } }).success).toBe(
      false
    );
  });

  it("rejects missing chart data and malformed strongly-shaped points", () => {
    expect(
      componentSchemas.BarChart.safeParse({
        title: "Revenue",
        data: [],
        xAxis: "region",
        yAxis: "revenue",
      }).success
    ).toBe(false);
    expect(
      componentSchemas.PieChart.safeParse({
        title: "Share",
        data: [{ label: "North", amount: 10 }],
      }).success
    ).toBe(false);
    expect(
      componentSchemas.ScatterPlot.safeParse({
        title: "Correlation",
        data: [{ x: 1, y: 2 }],
      }).success
    ).toBe(true);
  });
});
