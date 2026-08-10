import type { TamboComponent } from "@tambo-ai/react";
import BarChart from "@/components/dashboard/BarChart";
import DataTable from "@/components/dashboard/DataTable";
import KPICard from "@/components/dashboard/KPICard";
import LineChart from "@/components/dashboard/LineChart";
import PieChart from "@/components/dashboard/PieChart";
import ScatterPlot from "@/components/dashboard/ScatterPlot";
import StatCard from "@/components/dashboard/StatCard";
import TextBlock from "@/components/dashboard/TextBlock";
import {
  BarChartSchema,
  DataTableSchema,
  KPICardSchema,
  LineChartSchema,
  PieChartSchema,
  ScatterPlotSchema,
  StatCardSchema,
  TextBlockSchema,
} from "@/lib/componentSchemas";

/** The single source of truth for components exposed to Tambo. */
export const tamboComponents = [
  {
    name: "KPICard",
    component: KPICard,
    propsSchema: KPICardSchema,
    description:
      "Display one computed key performance indicator. Use for a headline sum, average, count, rate, or other dataset-derived metric. Never invent a value; calculate it from the supplied dataset context.",
  },
  {
    name: "LineChart",
    component: LineChart,
    propsSchema: LineChartSchema,
    description:
      "Display an aggregated trend over time. Supply non-empty data rows plus exact xAxis and numeric yAxis keys present in every row. Use only values derived from the supplied dataset context.",
  },
  {
    name: "BarChart",
    component: BarChart,
    propsSchema: BarChartSchema,
    description:
      "Compare aggregated numeric values across categories. Supply non-empty data rows plus exact xAxis and numeric yAxis keys present in every row. Use only values derived from the supplied dataset context.",
  },
  {
    name: "PieChart",
    component: PieChart,
    propsSchema: PieChartSchema,
    description:
      "Show a proportional breakdown using non-empty {name, value} pairs. Values must be non-negative and derived from the supplied dataset context.",
  },
  {
    name: "DataTable",
    component: DataTable,
    propsSchema: DataTableSchema,
    description:
      "Show dataset records or a computed top-N list. Supply non-empty rows containing primitive values; columns may specify their display order.",
  },
  {
    name: "ScatterPlot",
    component: ScatterPlot,
    propsSchema: ScatterPlotSchema,
    description:
      "Show the relationship between two numeric variables using non-empty {x, y} points derived from the supplied dataset context.",
  },
  {
    name: "StatCard",
    component: StatCard,
    propsSchema: StatCardSchema,
    description:
      "Display a compact computed statistic alongside other components. Never invent the value or change.",
  },
  {
    name: "TextBlock",
    component: TextBlock,
    propsSchema: TextBlockSchema,
    description:
      "Present a concise, data-grounded explanation or answer. Reference only facts available in the supplied dataset context.",
  },
] satisfies TamboComponent[];

export type ComponentName = (typeof tamboComponents)[number]["name"];
