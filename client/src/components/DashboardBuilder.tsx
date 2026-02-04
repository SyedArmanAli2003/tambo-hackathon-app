import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KPICard,
  LineChart,
  BarChart,
  PieChart,
  DataTable,
  ScatterPlot,
  StatCard,
  TextBlock,
} from "@/components/dashboard";
import {
  salesData,
  regionSalesData,
  marketShareData,
  userGrowthData,
  revenueVsCustomersData,
  topCustomersData,
  kpiMetrics,
  insights,
} from "@/lib/mockData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  components?: React.ReactNode[];
}

/**
 * DashboardBuilder Component
 * Main interface for AI-powered dashboard generation
 * Users describe dashboards in natural language, Tambo renders components
 */
export default function DashboardBuilder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardComponents, setDashboardComponents] = useState<
    React.ReactNode[]
  >([]);

  // Example dashboard templates for demo
  const dashboardTemplates = {
    sales: [
      <KPICard
        key="kpi-1"
        title="Total Revenue"
        value="$487,000"
        trend="+12.5%"
        icon="DollarSign"
        color="blue"
      />,
      <KPICard
        key="kpi-2"
        title="Active Users"
        value="9,200"
        trend="+18.3%"
        icon="Users"
        color="green"
      />,
      <LineChart
        key="chart-1"
        title="Monthly Revenue Trend"
        data={salesData}
        xAxis="month"
        yAxis="revenue"
        color="#4F46E5"
      />,
      <BarChart
        key="chart-2"
        title="Sales by Region"
        data={regionSalesData}
        xAxis="region"
        yAxis="sales"
        color="#06B6D4"
      />,
      <PieChart
        key="chart-3"
        title="Market Share"
        data={marketShareData}
      />,
      <DataTable
        key="table-1"
        title="Top Customers"
        columns={["Name", "Revenue", "Status", "Growth"]}
        data={topCustomersData}
      />,
    ],
    growth: [
      <StatCard
        key="stat-1"
        label="User Growth"
        value="9,200"
        change="+18.3%"
      />,
      <StatCard
        key="stat-2"
        label="Conversion Rate"
        value="3.8%"
        change="+0.5%"
      />,
      <LineChart
        key="chart-1"
        title="User Growth Over Time"
        data={userGrowthData}
        xAxis="date"
        yAxis="users"
        color="#10B981"
      />,
      <TextBlock
        key="text-1"
        title="Key Insights"
        content={insights.content}
      />,
    ],
    correlation: [
      <ScatterPlot
        key="scatter-1"
        title="Revenue vs Customer Count"
        data={revenueVsCustomersData.map(d => ({ x: d.customers, y: d.revenue }))}
        xLabel="Customers"
        yLabel="Revenue"
        color="#8B5CF6"
      />,
      <BarChart
        key="chart-1"
        title="Regional Performance"
        data={regionSalesData}
        xAxis="region"
        yAxis="sales"
        color="#F59E0B"
      />,
    ],
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI processing and component selection
    setTimeout(() => {
      // Determine which dashboard to show based on keywords
      let selectedDashboard: React.ReactNode[] = [];
      const lowerInput = input.toLowerCase();

      if (
        lowerInput.includes("sales") ||
        lowerInput.includes("revenue") ||
        lowerInput.includes("region")
      ) {
        selectedDashboard = dashboardTemplates.sales;
      } else if (
        lowerInput.includes("growth") ||
        lowerInput.includes("user") ||
        lowerInput.includes("trend")
      ) {
        selectedDashboard = dashboardTemplates.growth;
      } else if (
        lowerInput.includes("correlation") ||
        lowerInput.includes("scatter") ||
        lowerInput.includes("relationship")
      ) {
        selectedDashboard = dashboardTemplates.correlation;
      } else {
        // Default to sales dashboard
        selectedDashboard = dashboardTemplates.sales;
      }

      setDashboardComponents(selectedDashboard);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I've generated a dashboard with ${selectedDashboard.length} components based on your request. The dashboard includes charts, metrics, and data tables to help you visualize your data.`,
        timestamp: new Date(),
        components: selectedDashboard,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleRefresh = () => {
    setDashboardComponents([]);
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Dashboard Builder
              </h1>
              <p className="text-sm text-slate-600">
                Powered by Tambo Generative UI
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-block p-6 bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-lg border-2 border-indigo-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Welcome to Dashboard Builder
                </h2>
                <p className="text-slate-600 max-w-md mb-6">
                  Describe the dashboard you want to create in natural language.
                  Tambo will automatically generate the right components for you.
                </p>
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="font-semibold">Try asking for:</p>
                  <ul className="space-y-1">
                    <li>
                      📊 "Show me sales by region with revenue trends"
                    </li>
                    <li>📈 "Create a user growth dashboard"</li>
                    <li>
                      🔗 "Analyze revenue vs customer correlation"
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Messages */}
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {message.role === "user" ? (
                      <div className="flex justify-end mb-4">
                        <div className="bg-indigo-600 text-white rounded-lg rounded-br-none px-4 py-3 max-w-md">
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs text-indigo-100 mt-2 block">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-white border-2 border-slate-200 rounded-lg rounded-bl-none px-4 py-3 max-w-2xl">
                          <p className="text-sm text-slate-700">
                            {message.content}
                          </p>
                          <span className="text-xs text-slate-500 mt-2 block">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Rendered Components */}
                        {message.components && message.components.length > 0 && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {message.components.map((component, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                              >
                                {component}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border-2 border-slate-200 rounded-lg rounded-bl-none px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                      <span className="text-sm text-slate-600">
                        Generating dashboard...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white shadow-lg sticky bottom-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your dashboard (e.g., 'Show me sales by region with revenue trends')..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Generate</span>
            </Button>
          </form>
          <p className="text-xs text-slate-500 mt-2">
            💡 Tip: Describe what data you want to see, and the AI will render
            the right components
          </p>
        </div>
      </div>
    </div>
  );
}
