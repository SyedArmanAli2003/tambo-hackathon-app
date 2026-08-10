import { z } from "zod/v4";

export const primitiveValueSchema = z
  .union([z.string(), z.number(), z.boolean(), z.null()])
  .describe("A JSON primitive value from an uploaded dataset.");

export const dataRowSchema = z
  .record(z.string(), primitiveValueSchema)
  .describe(
    "A dataset row keyed by column name. Values must be JSON primitives."
  );

export const pieDatumSchema = z.object({
  name: z.string().min(1).describe("Category label shown in the pie chart."),
  value: z
    .number()
    .finite()
    .nonnegative()
    .describe("Numeric value for the category."),
});

export const scatterDatumSchema = z.object({
  x: z.number().finite().describe("Numeric horizontal-axis value."),
  y: z.number().finite().describe("Numeric vertical-axis value."),
});

export const KPICardSchema = z.object({
  title: z.string().min(1).describe("Short label for the metric."),
  value: z.union([z.string(), z.number()]).describe("Computed metric value."),
  trend: z
    .string()
    .optional()
    .describe("Optional formatted change, such as +12.5%."),
  icon: z
    .enum(["DollarSign", "Users", "TrendingUp", "Star"])
    .optional()
    .describe("Icon that best represents the metric."),
  color: z
    .enum(["blue", "green", "purple", "orange", "red"])
    .optional()
    .describe("Visual accent color."),
  isPositive: z
    .boolean()
    .optional()
    .describe("Whether the trend is favorable."),
});

const cartesianChartFields = {
  title: z.string().min(1).describe("Descriptive chart title."),
  data: z
    .array(dataRowSchema)
    .min(1)
    .describe("Aggregated rows containing the named xAxis and yAxis fields."),
  xAxis: z
    .string()
    .min(1)
    .describe("Exact column key used for horizontal-axis labels."),
  yAxis: z
    .string()
    .min(1)
    .describe("Exact column key containing numeric values."),
  color: z
    .string()
    .optional()
    .describe("Optional CSS color for the data series."),
  height: z
    .number()
    .int()
    .min(180)
    .max(800)
    .optional()
    .describe("Chart height in pixels."),
};

export const LineChartSchema = z.object(cartesianChartFields);
export const BarChartSchema = z.object(cartesianChartFields);

export const PieChartSchema = z.object({
  title: z.string().min(1).describe("Descriptive chart title."),
  data: z
    .array(pieDatumSchema)
    .min(1)
    .describe("Category and value pairs to visualize."),
  height: z
    .number()
    .int()
    .min(180)
    .max(800)
    .optional()
    .describe("Chart height in pixels."),
});

export const DataTableSchema = z.object({
  title: z.string().min(1).describe("Descriptive table title."),
  columns: z
    .array(z.string().min(1))
    .min(1)
    .optional()
    .describe(
      "Ordered column keys. When omitted, keys are inferred from the first row."
    ),
  data: z.array(dataRowSchema).min(1).describe("Rows to display in the table."),
  sortable: z
    .boolean()
    .optional()
    .describe("Whether users can sort by a column."),
});

export const ScatterPlotSchema = z.object({
  title: z.string().min(1).describe("Descriptive chart title."),
  data: z
    .array(scatterDatumSchema)
    .min(1)
    .describe("Numeric x/y points to visualize."),
  xLabel: z.string().min(1).optional().describe("Horizontal-axis label."),
  yLabel: z.string().min(1).optional().describe("Vertical-axis label."),
  color: z.string().optional().describe("Optional CSS color for the points."),
  height: z
    .number()
    .int()
    .min(180)
    .max(800)
    .optional()
    .describe("Chart height in pixels."),
});

export const StatCardSchema = z.object({
  label: z.string().min(1).describe("Short statistic label."),
  value: z
    .union([z.string(), z.number()])
    .describe("Computed statistic value."),
  change: z.string().optional().describe("Optional formatted change."),
  isPositive: z
    .boolean()
    .optional()
    .describe("Whether the change is favorable."),
});

export const TextBlockSchema = z.object({
  title: z.string().min(1).describe("Short heading for the insight."),
  content: z.string().min(1).describe("Data-grounded analysis or explanation."),
});

export const componentSchemas = {
  KPICard: KPICardSchema,
  LineChart: LineChartSchema,
  BarChart: BarChartSchema,
  PieChart: PieChartSchema,
  DataTable: DataTableSchema,
  ScatterPlot: ScatterPlotSchema,
  StatCard: StatCardSchema,
  TextBlock: TextBlockSchema,
} as const;

export type DataRow = z.infer<typeof dataRowSchema>;
export type LineChartProps = z.infer<typeof LineChartSchema>;
export type BarChartProps = z.infer<typeof BarChartSchema>;
export type PieChartProps = z.infer<typeof PieChartSchema>;
export type DataTableProps = z.infer<typeof DataTableSchema>;
export type ScatterPlotProps = z.infer<typeof ScatterPlotSchema>;
