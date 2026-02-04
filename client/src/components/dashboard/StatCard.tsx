import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

/**
 * StatCard Component
 * Displays a simple statistic with optional change indicator
 * Design: Minimal card with clean typography
 */
export default function StatCard({
  label,
  value,
  change,
  isPositive = true,
}: StatCardProps) {
  const changeIsPositive = change?.startsWith("+") || isPositive;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4 border-2 border-slate-200 bg-white hover:shadow-md transition-shadow">
        <p className="text-xs font-medium text-slate-600 mb-2 uppercase tracking-wider">
          {label}
        </p>
        <div className="flex items-end justify-between">
          <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
          {change && (
            <div
              className={`flex items-center gap-1 text-xs font-semibold ${
                changeIsPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {changeIsPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
