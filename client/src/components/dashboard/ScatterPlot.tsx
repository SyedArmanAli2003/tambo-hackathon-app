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
import { revenueVsCustomersData } from "@/lib/mockData";

interface ScatterPlotProps {
  title: string;
  data?: ScatterPlotPoint[];
  xLabel?: string;
  yLabel?: string;
  color?: string;
  height?: number;
}

type ScatterPlotPoint = { x: number; y: number } & Record<
  string,
  string | number | null
>;

/**
 * ScatterPlot Component
 * Displays correlation between two variables
 * Design: Clean scatter plot with grid and tooltip
 */
/**
 * Normalize scatter data: accepts [{x,y}] or any [{col1, col2}] format.
 */
function normalizeScatterData(data: any[]): ScatterPlotPoint[] {
  if (!data || !Array.isArray(data) || data.length === 0) return [];

  try {
    // Filter out null/undefined entries
    const validData = data.filter(row => row != null && typeof row === "object");
    if (validData.length === 0) return [];

    const keys = Object.keys(validData[0] ?? {});

    // Already has x and y
    if (keys.includes("x") && keys.includes("y")) {
      return validData.map(row => ({
        x: typeof row.x === "number" ? row.x : Number(row.x) || 0,
        y: typeof row.y === "number" ? row.y : Number(row.y) || 0,
      }));
    }

    // Find two numeric columns
    const numericKeys = keys.filter(k => {
      const v = validData[0]?.[k];
      return typeof v === "number" || (typeof v === "string" && !isNaN(Number(v)) && v !== "");
    });

    if (numericKeys.length >= 2) {
      return validData.map(row => ({
        x: Number(row[numericKeys[0]]) || 0,
        y: Number(row[numericKeys[1]]) || 0,
      }));
    }
  } catch {
    // Fall through to return empty
  }

  return [];
}

export default function ScatterPlot({
  title,
  data,
  xLabel = "X Axis",
  yLabel = "Y Axis",
  color = "#8B5CF6",
  height = 300,
}: ScatterPlotProps) {
  const hasProvidedData = data && Array.isArray(data) && data.length > 0;
  const providedFiltered = hasProvidedData
    ? data.filter(row => row != null && typeof row === "object")
    : [];

  // Try to normalize provided data first; if it fails, fall back to demo
  const demoData = revenueVsCustomersData.map((d) => ({ x: d.customers, y: d.revenue }));
  let isDemoFallback = !hasProvidedData || providedFiltered.length === 0;
  let finalData: ScatterPlotPoint[];

  if (!isDemoFallback) {
    const normalized = normalizeScatterData(providedFiltered);
    if (normalized.length === 0) {
      isDemoFallback = true;
      finalData = normalizeScatterData(demoData);
    } else {
      finalData = normalized;
    }
  } else {
    finalData = normalizeScatterData(demoData);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="p-6 border-2 border-slate-200 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {isDemoFallback ? (
            <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Demo data
            </span>
          ) : null}
        </div>
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
              data={finalData}
              fill={color}
              isAnimationActive={true}
            />
          </RechartsScatterChart>
        </ResponsiveContainer>
      </Card>
    </motion.div>
  );
}
