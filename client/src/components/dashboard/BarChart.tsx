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
import { regionSalesData } from "@/lib/mockData";

interface BarChartProps {
  title: string;
  data?: Array<Record<string, any>>;
  xAxis?: string;
  yAxis?: string;
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
  // Determine if provided data is usable
  const hasProvidedData = data && Array.isArray(data) && data.length > 0;
  const filteredProvided = hasProvidedData
    ? data.filter(row => row != null && typeof row === "object" && Object.keys(row).length > 0)
    : [];

  // Helper to auto-detect keys from a dataset
  const detectKeys = (rows: Record<string, any>[]) => {
    const keys = Object.keys(rows[0] ?? {});
    const findKey = (preferred: string, fallbackType: "string" | "number"): string => {
      const exactMatch = keys.find(k => k.toLowerCase() === preferred.toLowerCase());
      if (exactMatch) return exactMatch;
      const sample = rows[0];
      if (sample) {
        const found = keys.find(k => {
          const v = sample[k];
          if (fallbackType === "number") return typeof v === "number" || (v != null && v !== "" && !isNaN(Number(v)));
          return typeof v === "string" && isNaN(Number(v));
        });
        if (found) return found;
      }
      return preferred;
    };
    return { keys, findKey };
  };

  // Try to clean provided data first
  let rawData: Record<string, any>[] = filteredProvided;
  let isDemoFallback = !hasProvidedData || filteredProvided.length === 0;

  if (!isDemoFallback) {
    const { findKey } = detectKeys(filteredProvided);
    const testYAxis = findKey(yAxis ?? "sales", "number");
    const cleaned = filteredProvided.filter(row => {
      try {
        const val = row?.[testYAxis];
        const numVal = typeof val === "number" ? val : Number(val);
        return !isNaN(numVal);
      } catch { return false; }
    });
    if (cleaned.length === 0) {
      // Provided data has no valid numeric rows — fall back to demo
      isDemoFallback = true;
      rawData = regionSalesData;
    }
  } else {
    rawData = regionSalesData;
  }

  // Auto-detect keys from whichever data we're using
  const { keys: dataKeys, findKey } = detectKeys(rawData);

  const finalXAxis = findKey(xAxis ?? "region", "string");
  const finalYAxis = findKey(yAxis ?? "sales", "number");

  // Coerce string numbers to actual numbers and filter valid rows
  const cleanedData = rawData
    .map((row) => {
      try {
        const val = row?.[finalYAxis];
        const numVal = typeof val === "number" ? val : Number(val);
        if (isNaN(numVal)) return null;
        return { ...row, [finalYAxis]: numVal };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Record<string, any>[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
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
        {cleanedData.length === 0 ? null : (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart data={cleanedData}>
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
              />
              <Legend />
              <Bar
                dataKey={finalYAxis}
                fill={color}
                radius={[8, 8, 0, 0]}
                isAnimationActive={true}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </motion.div>
  );
}
