import React from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { salesData } from "@/lib/mockData";

interface LineChartProps {
  title: string;
  data?: Array<Record<string, any>>;
  xAxis?: string;
  yAxis?: string;
  color?: string;
  height?: number;
}

/**
 * LineChart Component
 * Displays time-series data with smooth line visualization
 * Design: Clean chart with grid, tooltip, and legend
 */
export default function LineChart({
  title,
  data,
  xAxis,
  yAxis,
  color = "#4F46E5",
  height = 300,
}: LineChartProps) {
  const finalData = data ?? salesData;
  const finalXAxis = xAxis ?? "month";
  const finalYAxis = yAxis ?? "revenue";
  const isDemoFallback = typeof data === "undefined";

  const cleanedData = finalData.filter(
    (row) => typeof row?.[finalYAxis] === "number"
  );

  if (import.meta.env.DEV && isDemoFallback) {
    console.warn("LineChart: using default salesData; no data prop provided", {
      title,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="p-6 border-2 border-slate-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {isDemoFallback ? (
            <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Demo data
            </span>
          ) : null}
        </div>
        {cleanedData.length === 0 ? (
          <div
            className="flex items-center justify-center text-xs text-slate-500"
            style={{ height }}
          >
            No numeric data available for <span className="font-mono ml-1">{finalYAxis}</span>.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={cleanedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey={finalXAxis}
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #64748b",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
                cursor={{ stroke: color, strokeWidth: 2 }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={finalYAxis}
                stroke={color}
                strokeWidth={3}
                dot={{ fill: color, r: 5 }}
                activeDot={{ r: 7 }}
                isAnimationActive={true}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </motion.div>
  );
}
