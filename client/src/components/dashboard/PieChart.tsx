import React from "react";
import { Card } from "@/components/ui/card";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import InvalidWidgetState from "./InvalidWidgetState";
import { preparePieData } from "@/lib/chartData";
import type { PieChartProps } from "@/lib/componentSchemas";

/**
 * PieChart Component
 * Displays proportional data with pie visualization
 * Design: Clean pie chart with custom colors and legend
 */
export default function PieChart({ title, data, height = 300 }: PieChartProps) {
  const finalData = preparePieData(data);
  if (!finalData.length) {
    return (
      <InvalidWidgetState
        title={title || "Pie chart unavailable"}
        message="No valid name/value data was supplied for this chart."
      />
    );
  }

  const COLORS = [
    "#4F46E5", // indigo
    "#06B6D4", // cyan
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#F59E0B", // amber
    "#10B981", // emerald
    "#EF4444", // red
    "#6366F1", // indigo-500
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="p-6 border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={finalData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => {
                const total = finalData.reduce((s, d) => s + d.value, 0);
                const pct =
                  total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                return `${name}: ${pct}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              isAnimationActive={true}
            >
              {finalData.map((entry, index) => (
                <Cell
                  key={`${entry.name}-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #64748b",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
            />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
