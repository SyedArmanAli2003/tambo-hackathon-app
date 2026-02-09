import { useState, useCallback } from "react";
import { z } from "zod";
import { componentRegistry } from "@/lib/componentRegistry";
import type { Dataset } from "@/contexts/DataContext";
import {
  salesData,
  regionSalesData,
  marketShareData,
  userGrowthData,
  revenueVsCustomersData,
  topCustomersData,
} from "@/lib/mockData";

/**
 * Component instruction schema - what Tambo AI returns
 */
const ComponentInstructionSchema = z.object({
  name: z.string(),
  props: z.any(),
});

type ComponentInstruction = z.infer<typeof ComponentInstructionSchema>;

interface DashboardComponent {
  id: string;
  instruction: ComponentInstruction;
  component: any;
}

interface TamboOrchestrationState {
  components: DashboardComponent[];
  loading: boolean;
  error: string | null;
  explanation: string;
}

/**
 * Build dashboard components from uploaded data
 */
function buildFromUploadedData(request: string, dataset: Dataset): ComponentInstruction[] {
  const instructions: ComponentInstruction[] = [];
  const { data, columns, columnTypes, name } = dataset;

  if (!data || data.length === 0) return instructions;

  const numericCols = columns.filter((c) => columnTypes[c] === "number");
  const stringCols = columns.filter((c) => columnTypes[c] === "string");
  const dateCols = columns.filter((c) => columnTypes[c] === "date");

  // Determine a good label axis (string or date column)
  const labelCol = dateCols[0] || stringCols[0] || columns[0];

  // Add KPI cards for numeric columns (first 3)
  for (const col of numericCols.slice(0, 3)) {
    const values = data.map((r) => r[col]).filter((v) => typeof v === "number");
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = values.length > 0 ? sum / values.length : 0;

    instructions.push({
      name: "KPICard",
      props: {
        title: `Total ${col}`,
        value: sum >= 1000 ? `${(sum / 1000).toFixed(1)}K` : sum.toFixed(0),
        trend: `Avg: ${avg.toFixed(1)}`,
        color: ["blue", "green", "purple"][instructions.length % 3],
        isPositive: true,
      },
    });
  }

  // Line chart if there's a date/label + numeric column
  if (labelCol && numericCols.length > 0) {
    const wantsLine = request.includes("trend") || request.includes("line") || request.includes("over time") || dateCols.length > 0;
    if (wantsLine || !request.includes("bar")) {
      instructions.push({
        name: "LineChart",
        props: {
          title: `${numericCols[0]} over ${labelCol}`,
          data: data,
          xAxis: labelCol,
          yAxis: numericCols[0],
          color: "#3b82f6",
        },
      });
    }
  }

  // Bar chart if there's a category + numeric column
  if (stringCols.length > 0 && numericCols.length > 0) {
    instructions.push({
      name: "BarChart",
      props: {
        title: `${numericCols[0]} by ${stringCols[0]}`,
        data: data,
        xAxis: stringCols[0],
        yAxis: numericCols[0],
        color: "#06b6d4",
      },
    });
  }

  // Pie chart if there's a label + value column
  if (stringCols.length > 0 && numericCols.length > 0) {
    const wantsPie = request.includes("pie") || request.includes("share") || request.includes("distribution");
    if (wantsPie || instructions.length < 4) {
      const pieData = data.slice(0, 8).map((r) => ({
        name: String(r[stringCols[0]]),
        value: Number(r[numericCols[0]]) || 0,
      }));
      instructions.push({
        name: "PieChart",
        props: {
          title: `${numericCols[0]} Distribution`,
          data: pieData,
        },
      });
    }
  }

  // Scatter plot if there are 2+ numeric columns
  if (numericCols.length >= 2) {
    const wantsScatter = request.includes("scatter") || request.includes("correlation") || request.includes("vs");
    if (wantsScatter || instructions.length < 5) {
      const scatterData = data.map((r) => ({
        x: Number(r[numericCols[0]]) || 0,
        y: Number(r[numericCols[1]]) || 0,
      }));
      instructions.push({
        name: "ScatterPlot",
        props: {
          title: `${numericCols[0]} vs ${numericCols[1]}`,
          data: scatterData,
          xLabel: numericCols[0],
          yLabel: numericCols[1],
          color: "#f59e0b",
        },
      });
    }
  }

  // Data table
  instructions.push({
    name: "DataTable",
    props: {
      title: `${name} Data`,
      columns: columns.slice(0, 6),
      data: data,
    },
  });

  // Insights
  instructions.push({
    name: "TextBlock",
    props: {
      title: "Data Summary",
      content: `Dataset "${name}" has ${data.length} rows and ${columns.length} columns. Numeric columns: ${numericCols.join(", ") || "none"}. Category columns: ${stringCols.join(", ") || "none"}.`,
    },
  });

  return instructions;
}

/**
 * Generate AI explanation for the dashboard
 */
function generateExplanation(request: string, componentCount: number, datasetName?: string): string {
  const source = datasetName ? ` using your uploaded data "${datasetName}"` : "";
  return `I've generated a dashboard with ${componentCount} components based on your request${source}. The dashboard includes charts, metrics, and data tables to help you visualize your data.`;
}

/**
 * Generate insights text based on request
 */
function generateInsights(request: string): string {
  const insights = [
    "Revenue increased by 12.5% this month, driven primarily by strong performance in the East region (+18% growth).",
    "Active users reached 9,200, up 18.3% from last month. The conversion rate improved to 3.8%, indicating better product-market fit.",
    "Top customer (Global Solutions) contributed $156,000 in revenue. Consider expanding services for this segment.",
    "Market share grew to 28%, positioning us as the second-largest player in our category.",
  ];
  return insights.join(" ");
}

/**
 * Analyze user request and generate component instructions
 * Uses uploaded data when available, falls back to mock data
 */
function analyzeRequest(userRequest: string, dataset?: Dataset): ComponentInstruction[] {
  const request = userRequest.toLowerCase();

  // If user uploaded data, always build dashboard from it
  if (dataset) {
    return buildFromUploadedData(request, dataset);
  }

  // No uploaded data — use keyword-based component selection with mock data
  const instructions: ComponentInstruction[] = [];

  // Sales/Revenue related
  if (request.includes("sales") || request.includes("revenue")) {
    instructions.push({
      name: "KPICard",
      props: {
        title: "Total Revenue",
        value: "$487,000",
        trend: "+12.5%",
        color: "blue",
        isPositive: true,
      },
    });

    instructions.push({
      name: "LineChart",
      props: {
        title: "Monthly Revenue Trend",
        data: salesData,
        xAxis: "month",
        yAxis: "revenue",
        color: "#3b82f6",
      },
    });

    if (request.includes("region")) {
      instructions.push({
        name: "BarChart",
        props: {
          title: "Sales by Region",
          data: regionSalesData,
          xAxis: "region",
          yAxis: "sales",
          color: "#06b6d4",
        },
      });
    }

    if (request.includes("customer")) {
      instructions.push({
        name: "DataTable",
        props: {
          title: "Top Customers",
          columns: ["name", "revenue", "status", "growth"],
          data: topCustomersData,
        },
      });
    }
  }

  // User/Growth related
  if (request.includes("user") || request.includes("growth")) {
    instructions.push({
      name: "KPICard",
      props: {
        title: "User Growth",
        value: "9,200",
        trend: "+18.3%",
        color: "green",
        isPositive: true,
      },
    });

    instructions.push({
      name: "LineChart",
      props: {
        title: "User Growth Over Time",
        data: userGrowthData,
        xAxis: "date",
        yAxis: "users",
        color: "#10b981",
      },
    });

    if (request.includes("conversion")) {
      instructions.push({
        name: "KPICard",
        props: {
          title: "Conversion Rate",
          value: "3.8%",
          trend: "+0.5%",
          color: "purple",
          isPositive: true,
        },
      });
    }
  }

  // Market/Competition related
  if (request.includes("market") || request.includes("share")) {
    instructions.push({
      name: "PieChart",
      props: {
        title: "Market Share",
        data: marketShareData,
      },
    });
  }

  // Correlation/Analysis related
  if (request.includes("correlation") || request.includes("analyze")) {
    instructions.push({
      name: "ScatterPlot",
      props: {
        title: "Revenue vs Customer Count",
        data: revenueVsCustomersData,
        xLabel: "Customers",
        yLabel: "Revenue ($)",
        color: "#f59e0b",
      },
    });
  }

  // Insights/Summary
  if (instructions.length > 0) {
    instructions.push({
      name: "TextBlock",
      props: {
        title: "Key Insights",
        content: generateInsights(request),
      },
    });
  }

  return instructions;
}

/**
 * Hook that simulates Tambo AI orchestration
 * In production, this would call actual Tambo API
 */
export const useTamboOrchestration = () => {
  const [state, setState] = useState<TamboOrchestrationState>({
    components: [],
    loading: false,
    error: null,
    explanation: "",
  });

  /**
   * Process user request and orchestrate component rendering
   */
  const orchestrateDashboard = useCallback(async (userRequest: string, dataset?: Dataset) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Analyze request and get component instructions
      const instructions = analyzeRequest(userRequest, dataset);

      if (instructions.length === 0) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: dataset
            ? "Could not generate charts from this data. Make sure the file has numeric columns."
            : "Could not understand your request. Try asking for sales, users, market share, or correlation analysis.",
          explanation: "",
          components: [],
        }));
        return;
      }

      // Convert instructions to renderable components
      const components: DashboardComponent[] = instructions.map((instruction, index) => {
        const registry = componentRegistry[instruction.name as keyof typeof componentRegistry];

        if (!registry) {
          console.warn(`Component ${instruction.name} not found in registry`);
          return null;
        }

        return {
          id: `${instruction.name}-${index}`,
          instruction,
          component: registry.component as any,
        };
      }).filter((c): c is DashboardComponent => c !== null);

      const explanation = generateExplanation(userRequest, components.length, dataset?.name);

      setState((prev) => ({
        ...prev,
        loading: false,
        components,
        explanation,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "An error occurred",
      }));
    }
  }, []);

  /**
   * Clear dashboard
   */
  const clearDashboard = useCallback(() => {
    setState({
      components: [],
      loading: false,
      error: null,
      explanation: "",
    });
  }, []);

  return {
    ...state,
    orchestrateDashboard,
    clearDashboard,
  };
};
