import { z } from "zod";
import KPICard from "@/components/dashboard/KPICard";
import LineChart from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";
import PieChart from "@/components/dashboard/PieChart";
import DataTable from "@/components/dashboard/DataTable";
import ScatterPlot from "@/components/dashboard/ScatterPlot";
import StatCard from "@/components/dashboard/StatCard";
import TextBlock from "@/components/dashboard/TextBlock";
import Dashboard from "@/components/dashboard/Dashboard";

/**
 * Tambo Component Registry
 * Registers all dashboard components that Tambo AI can render
 */

const ChartValueSchema = z.union([z.string(), z.number(), z.null()]);
const TableValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

// Simple schemas without describe on complex types
export const KPICardSchema = z.object({
  title: z.string(),
  value: z.union([z.string(), z.number()]),
  trend: z.string().optional(),
  icon: z.enum(["DollarSign", "Users", "TrendingUp", "Star"]).optional(),
  color: z.enum(["blue", "green", "purple", "orange", "red"]).optional(),
  isPositive: z.boolean().optional(),
});

export const LineChartSchema = z.object({
  title: z.string(),
  data: z.array(z.record(z.string(), ChartValueSchema)).optional(),
  xAxis: z
    .string()
    .optional()
    .describe("Key in `data` rows to use for the X-axis"),
  yAxis: z
    .string()
    .optional()
    .describe("Key in `data` rows to use for the Y-axis (numeric values)"),
  color: z.string().optional(),
  height: z.number().optional(),
});

export const BarChartSchema = z.object({
  title: z.string(),
  data: z.array(z.record(z.string(), ChartValueSchema)).optional(),
  xAxis: z
    .string()
    .optional()
    .describe("Key in `data` rows to use for the X-axis"),
  yAxis: z
    .string()
    .optional()
    .describe("Key in `data` rows to use for the Y-axis (numeric values)"),
  color: z.string().optional(),
  height: z.number().optional(),
});

export const PieChartSchema = z.object({
  title: z.string(),
  data: z
    .array(z.object({ name: z.string(), value: z.number() }))
    .optional(),
  height: z.number().optional(),
});

export const DataTableSchema = z.object({
  title: z.string(),
  columns: z
    .array(z.string())
    .optional()
    .describe(
      "Optional column labels. When provided, they should ideally correspond (case-insensitive) to keys in the `data` rows; unmatched columns will render as empty cells."
    ),
  data: z.array(z.record(z.string(), TableValueSchema)).optional(),
  sortable: z.boolean().optional(),
});

export const ScatterPlotSchema = z.object({
  title: z.string(),
  data: z
    .array(z.object({ x: z.number(), y: z.number() }).catchall(ChartValueSchema))
    .optional(),
  xLabel: z.string().optional(),
  yLabel: z.string().optional(),
  color: z.string().optional(),
  height: z.number().optional(),
});

export const StatCardSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  change: z.string().optional(),
  isPositive: z.boolean().optional(),
});

export const TextBlockSchema = z.object({
  title: z.string(),
  content: z.string(),
});

export const DashboardWidgetSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("KPICard") }).merge(KPICardSchema),
  z.object({ type: z.literal("LineChart") }).merge(LineChartSchema),
  z.object({ type: z.literal("BarChart") }).merge(BarChartSchema),
  z.object({ type: z.literal("PieChart") }).merge(PieChartSchema),
  z.object({ type: z.literal("DataTable") }).merge(DataTableSchema),
  z.object({ type: z.literal("ScatterPlot") }).merge(ScatterPlotSchema),
  z.object({ type: z.literal("StatCard") }).merge(StatCardSchema),
  z.object({ type: z.literal("TextBlock") }).merge(TextBlockSchema),
]);

export const DashboardSchema = z
  .object({
    title: z.string().optional(),
    widgets: z.array(DashboardWidgetSchema).min(1).max(8),
  })
  .describe(
    "A dashboard is a grid of widgets. Prefer 1–4 KPIs, then 1–3 main charts, and optionally a table or insights text block. Aim for 4–8 widgets total."
  );

/**
 * Component Registry
 * Maps component names to their React components and schemas
 */
export const componentRegistry = {
  Dashboard: {
    component: Dashboard,
    schema: DashboardSchema,
    description:
      "Render a full dashboard grid with multiple widgets. Prefer 1–4 KPIs, then 1–3 main charts, and optionally a table or insights text block. Keep dashboards concise (about 4–8 widgets).",
  },
  KPICard: {
    component: KPICard,
    schema: KPICardSchema,
    description: "Display a key performance indicator with value and trend",
  },
  LineChart: {
    component: LineChart,
    schema: LineChartSchema,
    description: "Display time-series data with a line chart",
  },
  BarChart: {
    component: BarChart,
    schema: BarChartSchema,
    description: "Display categorical data comparison with bars",
  },
  PieChart: {
    component: PieChart,
    schema: PieChartSchema,
    description: "Display proportional data with a pie chart",
  },
  DataTable: {
    component: DataTable,
    schema: DataTableSchema,
    description: "Display tabular data with sorting capabilities",
  },
  ScatterPlot: {
    component: ScatterPlot,
    schema: ScatterPlotSchema,
    description: "Display correlation between two variables",
  },
  StatCard: {
    component: StatCard,
    schema: StatCardSchema,
    description: "Display a simple statistic with optional change indicator",
  },
  TextBlock: {
    component: TextBlock,
    schema: TextBlockSchema,
    description: "Display informational text and insights",
  },
};

/**
 * Get all component schemas for Tambo
 */
export const getAllComponentSchemas = () => {
  return Object.entries(componentRegistry).map(([name, { schema, description }]) => ({
    name,
    schema,
    description,
  }));
};

/**
 * Get a component by name
 */
export const getComponent = (name: string) => {
  return componentRegistry[name as keyof typeof componentRegistry];
};
