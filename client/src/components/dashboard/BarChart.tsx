import React from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface BarChartProps {
  title: string;
  data: Array<Record<string, any>>;
  xAxis: string;
  yAxis: string;
  color?: string;
  height?: number;
}

/**
 * BarChart Component
 * Displays categorical data comparison with bar visualization
 * Design: Clean chart with grid, tooltip, and legend
 */
export default function BarChart({
  title,
  data,
  xAxis,
  yAxis,
  color = "#06B6D4",
  height = 300,
}: BarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <Card className="p-6 border-2 border-slate-200 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={xAxis}
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
            />
            <Legend />
            <Bar
              dataKey={yAxis}
              fill={color}
              radius={[8, 8, 0, 0]}
              isAnimationActive={true}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
