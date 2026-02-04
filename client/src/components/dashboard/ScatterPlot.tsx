import React from "react";
import { Card } from "@/components/ui/card";
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface ScatterPlotProps {
  title: string;
  data: Array<{ x: number; y: number; [key: string]: any }>;
  xLabel?: string;
  yLabel?: string;
  color?: string;
  height?: number;
}

/**
 * ScatterPlot Component
 * Displays correlation between two variables
 * Design: Clean scatter plot with grid and tooltip
 */
export default function ScatterPlot({
  title,
  data,
  xLabel = "X Axis",
  yLabel = "Y Axis",
  color = "#8B5CF6",
  height = 300,
}: ScatterPlotProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="p-6 border-2 border-slate-200 hover:shadow-lg transition-shadow">
        <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="x"
              name={xLabel}
              stroke="#94a3b8"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yLabel}
              stroke="#94a3b8"
              style={{ fontSize: "12px" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #64748b",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Legend />
            <Scatter
              name={`${xLabel} vs ${yLabel}`}
              data={data}
              fill={color}
              isAnimationActive={true}
            />
          </RechartsScatterChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
