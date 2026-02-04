import { z } from "zod";
import KPICard from "@/components/dashboard/KPICard";
import LineChart from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";
import PieChart from "@/components/dashboard/PieChart";
import DataTable from "@/components/dashboard/DataTable";
import ScatterPlot from "@/components/dashboard/ScatterPlot";
import StatCard from "@/components/dashboard/StatCard";
import TextBlock from "@/components/dashboard/TextBlock";

/**
 * Tambo Component Registry
 * Registers all dashboard components that Tambo AI can render
 */

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
  data: z.any().optional(),
  xAxis: z.string(),
  yAxis: z.string(),
  color: z.string().optional(),
  height: z.number().optional(),
});

export const BarChartSchema = z.object({
  title: z.string(),
  data: z.any().optional(),
  xAxis: z.string(),
  yAxis: z.string(),
  color: z.string().optional(),
  height: z.number().optional(),
});

export const PieChartSchema = z.object({
  title: z.string(),
  data: z.any().optional(),
  height: z.number().optional(),
});

export const DataTableSchema = z.object({
  title: z.string(),
  columns: z.any().optional(),
  data: z.any().optional(),
  sortable: z.boolean().optional(),
});

export const ScatterPlotSchema = z.object({
  title: z.string(),
  data: z.any().optional(),
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

/**
 * Component Registry
 * Maps component names to their React components and schemas
 */
export const componentRegistry = {
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
