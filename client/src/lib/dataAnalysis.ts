/**
 * Data Analysis Utility
 * Pre-computes summaries, aggregations, and statistics from uploaded datasets
 * so the AI can generate intelligent, query-specific visualizations.
 */

export interface ColumnStats {
  column: string;
  type: "number" | "string" | "date";
  uniqueCount: number;
  nullCount: number;
  // Numeric stats
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  sum?: number;
  stdDev?: number;
  // Categorical stats
  topValues?: { value: string; count: number }[];
  // Date stats
  dateRange?: { earliest: string; latest: string };
}

export interface DataSummary {
  rowCount: number;
  columnCount: number;
  columns: string[];
  columnTypes: Record<string, "string" | "number" | "date">;
  columnStats: ColumnStats[];
  categoricalColumns: string[];
  numericColumns: string[];
  dateColumns: string[];
  // Pre-computed aggregations for likely queries
  precomputedAggregations: AggregationResult[];
  correlations: CorrelationResult[];
}

export interface AggregationResult {
  description: string;
  groupBy: string;
  metric: string;
  operation: string;
  data: Record<string, string | number>[];
}

export interface CorrelationResult {
  xColumn: string;
  yColumn: string;
  correlation: number;
  scatterData: { x: number; y: number }[];
}

/**
 * Compute detailed statistics for a single numeric column.
 */
function computeNumericStats(
  data: Record<string, unknown>[],
  column: string
): Partial<ColumnStats> {
  const values = data
    .map(row => row[column])
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value)
    );

  if (values.length === 0) return {};

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((s, v) => s + v, 0);
  const mean = sum / values.length;
  const median =
    values.length % 2 === 0
      ? (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2
      : sorted[Math.floor(values.length / 2)];
  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    sum: Math.round(sum * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
  };
}

/**
 * Compute top unique values for a categorical column.
 */
function computeCategoricalStats(
  data: Record<string, unknown>[],
  column: string
): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const row of data) {
    const val = String(row[column] ?? "null");
    counts.set(val, (counts.get(val) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([value, count]) => ({ value, count }));
}

/**
 * Aggregate a numeric column grouped by a categorical column.
 */
function aggregateByGroup(
  data: Record<string, unknown>[],
  groupCol: string,
  valueCol: string,
  operation: "sum" | "mean" | "count"
): Record<string, string | number>[] {
  const groups = new Map<string, number[]>();

  for (const row of data) {
    const key = String(row[groupCol] ?? "Unknown");
    if (!groups.has(key)) groups.set(key, []);
    const val = row[valueCol];
    if (typeof val === "number" && !isNaN(val)) {
      groups.get(key)!.push(val);
    }
  }

  return [...groups.entries()]
    .map(([name, values]) => {
      let result: number;
      if (operation === "sum") {
        result = values.reduce((s, v) => s + v, 0);
      } else if (operation === "mean") {
        result =
          values.length > 0
            ? values.reduce((s, v) => s + v, 0) / values.length
            : 0;
      } else {
        result = values.length;
      }
      return { [groupCol]: name, [valueCol]: Math.round(result * 100) / 100 };
    })
    .sort((a, b) => (b[valueCol] as number) - (a[valueCol] as number));
}

/**
 * Compute Pearson correlation between two numeric arrays.
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 3) return 0;

  const meanX = x.reduce((s, v) => s + v, 0) / n;
  const meanY = y.reduce((s, v) => s + v, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }

  const denom = Math.sqrt(denomX * denomY);
  return denom === 0 ? 0 : Math.round((numerator / denom) * 1000) / 1000;
}

/**
 * Analyze a dataset and produce a full summary that the AI can use.
 */
export function analyzeDataset(
  data: Record<string, unknown>[],
  columns: string[],
  columnTypes: Record<string, "string" | "number" | "date">
): DataSummary {
  const numericColumns = columns.filter(c => columnTypes[c] === "number");
  const categoricalColumns = columns.filter(c => columnTypes[c] === "string");
  const dateColumns = columns.filter(c => columnTypes[c] === "date");

  // Column-level statistics
  const columnStats: ColumnStats[] = columns.map(col => {
    const type = columnTypes[col] || "string";
    const uniqueValues = new Set(data.map(row => row[col]));
    const nullCount = data.filter(
      row => row[col] == null || row[col] === ""
    ).length;

    const base: ColumnStats = {
      column: col,
      type,
      uniqueCount: uniqueValues.size,
      nullCount,
    };

    if (type === "number") {
      const numStats = computeNumericStats(data, col);
      return { ...base, ...numStats };
    }

    if (type === "string") {
      const topValues = computeCategoricalStats(data, col);
      return { ...base, topValues };
    }

    if (type === "date") {
      const dates = data
        .map(row => row[col])
        .filter(v => v != null)
        .map(String)
        .sort();
      return {
        ...base,
        dateRange:
          dates.length > 0
            ? {
                earliest: String(dates[0]),
                latest: String(dates[dates.length - 1]),
              }
            : undefined,
      };
    }

    return base;
  });

  // Pre-compute useful aggregations
  const precomputedAggregations: AggregationResult[] = [];

  // For each categorical column × each numeric column → sum and mean
  for (const catCol of categoricalColumns.slice(0, 4)) {
    // Only aggregate if there are a reasonable number of categories (≤ 20)
    const uniqueCats = new Set(data.map(r => r[catCol]));
    if (uniqueCats.size > 20) continue;

    for (const numCol of numericColumns.slice(0, 6)) {
      const sumData = aggregateByGroup(data, catCol, numCol, "sum");
      precomputedAggregations.push({
        description: `Total ${numCol} by ${catCol}`,
        groupBy: catCol,
        metric: numCol,
        operation: "sum",
        data: sumData,
      });

      const meanData = aggregateByGroup(data, catCol, numCol, "mean");
      precomputedAggregations.push({
        description: `Average ${numCol} by ${catCol}`,
        groupBy: catCol,
        metric: numCol,
        operation: "mean",
        data: meanData,
      });
    }
  }

  // Date-based aggregations for time-series
  for (const dateCol of dateColumns.slice(0, 2)) {
    for (const numCol of numericColumns.slice(0, 4)) {
      const sumData = aggregateByGroup(data, dateCol, numCol, "sum");
      precomputedAggregations.push({
        description: `${numCol} over time (by ${dateCol})`,
        groupBy: dateCol,
        metric: numCol,
        operation: "sum",
        data: sumData.sort((a, b) =>
          String(a[dateCol]).localeCompare(String(b[dateCol]))
        ),
      });
    }
  }

  // Correlations between numeric columns
  const correlations: CorrelationResult[] = [];
  for (let i = 0; i < numericColumns.length && i < 5; i++) {
    for (let j = i + 1; j < numericColumns.length && j < 5; j++) {
      const xCol = numericColumns[i];
      const yCol = numericColumns[j];

      const paired = data
        .filter(
          row =>
            typeof row[xCol] === "number" &&
            !isNaN(row[xCol]) &&
            typeof row[yCol] === "number" &&
            !isNaN(row[yCol])
        )
        .map(row => ({ x: row[xCol] as number, y: row[yCol] as number }));

      if (paired.length >= 3) {
        const corr = pearsonCorrelation(
          paired.map(p => p.x),
          paired.map(p => p.y)
        );

        correlations.push({
          xColumn: xCol,
          yColumn: yCol,
          correlation: corr,
          scatterData: paired.slice(0, 100), // limit for context size
        });
      }
    }
  }

  return {
    rowCount: data.length,
    columnCount: columns.length,
    columns,
    columnTypes,
    columnStats,
    categoricalColumns,
    numericColumns,
    dateColumns,
    precomputedAggregations,
    correlations,
  };
}

/**
 * Build a concise, AI-friendly text summary of the dataset analysis.
 */
export function buildAnalysisSummaryText(summary: DataSummary): string {
  const lines: string[] = [];

  lines.push(`## Dataset Overview`);
  lines.push(`- ${summary.rowCount} rows × ${summary.columnCount} columns`);
  lines.push(
    `- Numeric columns: ${summary.numericColumns.join(", ") || "none"}`
  );
  lines.push(
    `- Categorical columns: ${summary.categoricalColumns.join(", ") || "none"}`
  );
  lines.push(`- Date columns: ${summary.dateColumns.join(", ") || "none"}`);
  lines.push("");

  // Column stats
  lines.push(`## Column Statistics`);
  for (const stat of summary.columnStats) {
    if (stat.type === "number") {
      lines.push(
        `- **${stat.column}** (numeric): min=${stat.min}, max=${stat.max}, mean=${stat.mean}, median=${stat.median}, sum=${stat.sum}, stdDev=${stat.stdDev}`
      );
    } else if (stat.type === "string" && stat.topValues) {
      const top3 = stat.topValues
        .slice(0, 5)
        .map(t => `${t.value}(${t.count})`)
        .join(", ");
      lines.push(
        `- **${stat.column}** (categorical, ${stat.uniqueCount} unique): top values = ${top3}`
      );
    } else if (stat.type === "date" && stat.dateRange) {
      lines.push(
        `- **${stat.column}** (date): range ${stat.dateRange.earliest} to ${stat.dateRange.latest}`
      );
    }
  }
  lines.push("");

  // Key correlations
  if (summary.correlations.length > 0) {
    lines.push(`## Notable Correlations`);
    const sorted = [...summary.correlations].sort(
      (a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)
    );
    for (const c of sorted.slice(0, 5)) {
      const strength =
        Math.abs(c.correlation) > 0.7
          ? "strong"
          : Math.abs(c.correlation) > 0.4
            ? "moderate"
            : "weak";
      lines.push(
        `- ${c.xColumn} vs ${c.yColumn}: r=${c.correlation} (${strength} ${c.correlation > 0 ? "positive" : "negative"})`
      );
    }
    lines.push("");
  }

  // Key aggregations
  if (summary.precomputedAggregations.length > 0) {
    lines.push(`## Available Pre-Computed Aggregations`);
    for (const agg of summary.precomputedAggregations.slice(0, 20)) {
      lines.push(
        `- "${agg.description}": ${agg.data.length} groups (e.g., ${JSON.stringify(agg.data[0])})`
      );
    }
  }

  return lines.join("\n");
}

/**
 * Find the best matching pre-computed aggregation for a user query.
 */
export function findRelevantAggregation(
  summary: DataSummary,
  query: string
): AggregationResult | null {
  const q = query.toLowerCase();

  // Score each aggregation by how many query words match
  let bestScore = 0;
  let bestAgg: AggregationResult | null = null;

  for (const agg of summary.precomputedAggregations) {
    let score = 0;
    const desc = agg.description.toLowerCase();
    const groupLower = agg.groupBy.toLowerCase();
    const metricLower = agg.metric.toLowerCase();

    // Direct match on column names in query
    if (q.includes(groupLower)) score += 3;
    if (q.includes(metricLower)) score += 3;

    // Partial word match
    const words = q.split(/\s+/);
    for (const word of words) {
      if (word.length < 3) continue;
      if (desc.includes(word)) score += 1;
      if (groupLower.includes(word)) score += 2;
      if (metricLower.includes(word)) score += 2;
    }

    // Operation hints
    if ((q.includes("total") || q.includes("sum")) && agg.operation === "sum")
      score += 2;
    if (
      (q.includes("average") || q.includes("avg") || q.includes("mean")) &&
      agg.operation === "mean"
    )
      score += 2;

    if (score > bestScore) {
      bestScore = score;
      bestAgg = agg;
    }
  }

  return bestScore >= 3 ? bestAgg : null;
}
