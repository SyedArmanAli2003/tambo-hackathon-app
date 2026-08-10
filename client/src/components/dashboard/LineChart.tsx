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
import InvalidWidgetState from "./InvalidWidgetState";
import { prepareCartesianChartData } from "@/lib/chartData";
import type { LineChartProps } from "@/lib/componentSchemas";

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
  const prepared = prepareCartesianChartData(data, xAxis, yAxis);

  if (!prepared) {
    return (
      <InvalidWidgetState
        title={title || "Line chart unavailable"}
        message="No valid data was supplied for this chart, or the selected columns could not be rendered."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="p-6 border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsLineChart data={prepared.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={prepared.xKey}
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
              dataKey={prepared.yKey}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 5 }}
              activeDot={{ r: 7 }}
              isAnimationActive={true}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
