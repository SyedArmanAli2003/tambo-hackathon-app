import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Users, Star } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: string;
  icon?: "DollarSign" | "Users" | "TrendingUp" | "Star";
  color?: "blue" | "green" | "purple" | "orange" | "red";
  isPositive?: boolean;
}

/**
 * KPICard Component
 * Displays a single key performance indicator with value, trend, and icon
 * Design: Modern card with gradient background and smooth animations
 */
export default function KPICard({
  title,
  value,
  trend,
  icon = "DollarSign",
  color = "blue",
  isPositive = true,
}: KPICardProps) {
  const iconMap = {
    DollarSign: DollarSign,
    Users: Users,
    TrendingUp: TrendingUp,
    Star: Star,
  };

  const colorMap = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      icon: "text-blue-600",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      icon: "text-green-600",
      border: "border-green-200",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      icon: "text-purple-600",
      border: "border-purple-200",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      icon: "text-orange-600",
      border: "border-orange-200",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      icon: "text-red-600",
      border: "border-red-200",
    },
  };

  const IconComponent = iconMap[icon];
  const colors = colorMap[color];
  const trendIsPositive = trend?.startsWith("+") || isPositive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`${colors.bg} ${colors.border} border-2 p-6 hover:shadow-lg transition-shadow`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 mb-2">{value}</h3>
            {trend && (
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  trendIsPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trendIsPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div className={`${colors.icon} p-3 bg-white rounded-lg`}>
            <IconComponent className="w-6 h-6" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
