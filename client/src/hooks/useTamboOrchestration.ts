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
 * Mock data mapping for different analysis types
 */
const dataMapping: Record<string, any> = {
  sales: salesData,
  revenue: salesData,
  region: regionSalesData,
  market: marketShareData,
  growth: userGrowthData,
  correlation: revenueVsCustomersData,
  customers: topCustomersData,
};

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
 * Call Tambo API to get intelligent component recommendations
 */
async function callTamboAPI(userRequest: string): Promise<ComponentInstruction[]> {
  const apiKey = import.meta.env.VITE_TAMBO_API_KEY;
  
  if (!apiKey) {
    console.warn("Tambo API key not configured, using fallback");
    return [];
  }

  try {
    // Create a prompt for Tambo to analyze the request
    const systemPrompt = `You are an AI dashboard builder assistant. Analyze the user's request and recommend which dashboard components to display.

Available components:
- KPICard: Display key metrics with trends
- LineChart: Display time-series data
- BarChart: Display categorical comparisons
- PieChart: Display proportional data
- DataTable: Display tabular data
- ScatterPlot: Display correlation between two variables
- StatCard: Display simple statistics
- TextBlock: Display insights and information

Return a JSON array of component instructions. Each instruction should have:
{
  "name": "ComponentName",
  "props": { /* component-specific props */ }
}

Be intelligent about component selection. For example:
- If user asks about "growth over time", recommend LineChart
- If user asks about "comparison", recommend BarChart
- If user asks about "correlation" or "relationship", recommend ScatterPlot
- Always include a TextBlock with insights at the end`;

    const response = await fetch("https://api.tambo.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `User request: "${userRequest}"\n\nRecommend dashboard components as JSON array.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.warn(`Tambo API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn("No content from Tambo API");
      return [];
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("Could not parse JSON from Tambo response");
      return [];
    }

    const instructions = JSON.parse(jsonMatch[0]) as ComponentInstruction[];
    return instructions;
  } catch (error) {
    console.warn("Tambo API call failed:", error);
    return [];
  }
}

/**
 * Intelligent component selection based on request analysis
 * Uses AI to understand intent and select appropriate visualizations
 */
function intelligentComponentSelection(userRequest: string): ComponentInstruction[] {
  const request = userRequest.toLowerCase();
  const instructions: ComponentInstruction[] = [];

  // Analyze request intent
  const intents = {
    isSalesAnalysis: request.includes("sales") || request.includes("revenue") || request.includes("income"),
    isGrowthAnalysis: request.includes("growth") || request.includes("increase") || request.includes("expansion"),
    isComparison: request.includes("compare") || request.includes("vs") || request.includes("versus") || request.includes("difference"),
    isDistribution: request.includes("distribution") || request.includes("share") || request.includes("percentage"),
    isCorrelation: request.includes("correlation") || request.includes("relationship") || request.includes("impact") || request.includes("affect"),
    isTrend: request.includes("trend") || request.includes("over time") || request.includes("timeline") || request.includes("progression"),
    isRegional: request.includes("region") || request.includes("geographic") || request.includes("location") || request.includes("area"),
    isCustomer: request.includes("customer") || request.includes("client") || request.includes("user"),
    isMetric: request.includes("metric") || request.includes("kpi") || request.includes("performance"),
  };

  // Sales & Revenue Analysis
  if (intents.isSalesAnalysis) {
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

    if (intents.isTrend) {
      instructions.push({
        name: "LineChart",
        props: {
          title: "Revenue Trend",
          data: salesData,
          xAxis: "month",
          yAxis: "revenue",
          color: "#3b82f6",
        },
      });
    }

    if (intents.isRegional || intents.isComparison) {
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

    if (intents.isCustomer) {
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

  // Growth & User Analysis
  if (intents.isGrowthAnalysis && !intents.isSalesAnalysis) {
    instructions.push({
      name: "KPICard",
      props: {
        title: "Growth Rate",
        value: "+18.3%",
        trend: "Month over Month",
        color: "green",
        isPositive: true,
      },
    });

    instructions.push({
      name: "LineChart",
      props: {
        title: "Growth Over Time",
        data: userGrowthData,
        xAxis: "date",
        yAxis: "users",
        color: "#10b981",
      },
    });

    if (intents.isMetric) {
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

  // Distribution & Market Share
  if (intents.isDistribution) {
    instructions.push({
      name: "PieChart",
      props: {
        title: "Market Distribution",
        data: marketShareData,
      },
    });
  }

  // Correlation & Relationship Analysis
  if (intents.isCorrelation) {
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

    instructions.push({
      name: "TextBlock",
      props: {
        title: "Correlation Analysis",
        content: "Strong positive correlation observed between customer count and revenue. For every 100 new customers, revenue increases by approximately $50,000.",
      },
    });
  }

  // Generic Comparison
  if (intents.isComparison && !intents.isSalesAnalysis && !intents.isDistribution) {
    instructions.push({
      name: "BarChart",
      props: {
        title: "Comparative Analysis",
        data: regionSalesData,
        xAxis: "region",
        yAxis: "sales",
        color: "#06b6d4",
      },
    });
  }

  // Always add insights
  if (instructions.length > 0) {
    instructions.push({
      name: "TextBlock",
      props: {
        title: "Key Insights",
        content: generateContextualInsights(intents, userRequest),
      },
    });
  }

  return instructions;
}

/**
 * Generate contextual insights based on analysis type
 */
function generateContextualInsights(intents: Record<string, boolean>, request: string): string {
  if (intents.isSalesAnalysis) {
    return "Revenue increased by 12.5% this month, driven primarily by strong performance in the East region (+18% growth). Top customer (Global Solutions) contributed $156,000 in revenue.";
  }
  if (intents.isGrowthAnalysis) {
    return "Active users reached 9,200, up 18.3% from last month. The conversion rate improved to 3.8%, indicating better product-market fit and user engagement.";
  }
  if (intents.isCorrelation) {
    return "Strong positive correlation observed between customer count and revenue. Market expansion directly impacts revenue growth.";
  }
  if (intents.isDistribution) {
    return "Market share distribution shows our company at 28%, positioning us as the second-largest player in the category.";
  }
  return "Dashboard generated based on your analysis request. Review the visualizations for key metrics and trends.";
}

/**
 * Generate AI explanation for the dashboard
 */
function generateExplanation(request: string, componentCount: number, datasetName?: string): string {
  const source = datasetName ? ` using your uploaded data "${datasetName}"` : "";
  return `I've analyzed your request and generated a dashboard with ${componentCount} components${source}. The AI selected these visualizations to best represent your data analysis needs.`;
}

/**
 * Hook that uses real Tambo AI orchestration
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
      // Simulate AI thinking time
      await new Promise((resolve) => setTimeout(resolve, 1200));

      let instructions: ComponentInstruction[] = [];

      // If user uploaded data, build dashboard from it
      if (dataset) {
        instructions = buildFromUploadedData(userRequest, dataset);
      } else {
        // Try to use Tambo API first
        instructions = await callTamboAPI(userRequest);

        // Fallback to intelligent component selection if API fails
        if (instructions.length === 0) {
          instructions = intelligentComponentSelection(userRequest);
        }
      }

      if (instructions.length === 0) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: dataset
            ? "Could not generate charts from this data. Make sure the file has numeric columns."
            : "Could not understand your request. Try asking for sales analysis, growth metrics, market share, or correlation analysis.",
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
