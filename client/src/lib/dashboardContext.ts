import type { Dataset } from "@/contexts/DataContext";
import {
  buildAnalysisSummaryText,
  findRelevantAggregation,
  type DataSummary,
} from "@/lib/dataAnalysis";

const ANALYST_INSTRUCTIONS = `You are an expert data analyst and dashboard builder.
- Answer the user's exact question using only the supplied dataset context.
- Use precomputed statistics and aggregations whenever they answer the question.
- Never invent values, substitute sample data, or present an estimate as measured data.
- Choose BarChart for categorical comparisons, LineChart for trends, PieChart for proportions, ScatterPlot for correlations, DataTable for records, and KPI/Stat cards for computed summaries.
- Component props must match their registered schemas and contain non-empty, dataset-derived data.
- If the available context cannot support the request, explain what is missing instead of fabricating an answer.`;

export function buildDashboardContext(
  dataset: Dataset | null,
  summary: DataSummary | null,
  query: string
) {
  if (!dataset || !summary) {
    return {
      instructions: ANALYST_INSTRUCTIONS,
      dataset: null,
      guidance:
        "No dataset is active. Ask the user to upload a CSV or JSON file before producing analytics or visualization components.",
    };
  }

  const relevantAggregation = findRelevantAggregation(summary, query);
  const correlations = [...summary.correlations]
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
    .slice(0, 5)
    .map(correlation => ({
      x: correlation.xColumn,
      y: correlation.yColumn,
      coefficient: correlation.correlation,
      points: correlation.scatterData.slice(0, 50),
    }));

  return {
    instructions: ANALYST_INSTRUCTIONS,
    dataset: {
      name: dataset.name,
      rowCount: dataset.rowCount,
      columns: dataset.columns,
      columnTypes: dataset.columnTypes,
      rows: dataset.data.slice(0, 200),
    },
    analysisSummary: buildAnalysisSummaryText(summary),
    columnStats: summary.columnStats,
    relevantAggregation: relevantAggregation
      ? {
          description: relevantAggregation.description,
          groupBy: relevantAggregation.groupBy,
          metric: relevantAggregation.metric,
          operation: relevantAggregation.operation,
          data: relevantAggregation.data,
        }
      : null,
    correlations,
    availableAggregations: summary.precomputedAggregations
      .slice(0, 30)
      .map(aggregation => ({
        description: aggregation.description,
        groupBy: aggregation.groupBy,
        metric: aggregation.metric,
        operation: aggregation.operation,
        data: aggregation.data,
      })),
  };
}
