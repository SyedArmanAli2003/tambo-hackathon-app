import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

interface DataTableProps {
  title: string;
  columns: string[];
  data: Array<Record<string, any>>;
  sortable?: boolean;
}

/**
 * DataTable Component
 * Displays tabular data with sorting and filtering capabilities
 * Design: Clean table with hover effects and responsive layout
 */
export default function DataTable({
  title,
  columns,
  data,
  sortable = true,
}: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (column: string) => {
    if (!sortable) return;

    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === column && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: column, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (sortConfig.direction === "asc") {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
    >
      <Card className="p-6 border-2 border-slate-200 hover:shadow-lg transition-shadow overflow-hidden">
        <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                {columns.map((column) => (
                  <th
                    key={column}
                    onClick={() => handleSort(column)}
                    className={`px-4 py-3 text-left text-sm font-semibold text-slate-900 ${
                      sortable ? "cursor-pointer hover:bg-slate-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {column}
                      {sortable && (
                        <ArrowUpDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  {columns.map((column) => {
                    // Get the key from the data row that matches the column name
                    const columnKey = Object.keys(row).find(
                      (key) => key.toLowerCase() === column.toLowerCase()
                    );
                    return (
                      <td
                        key={`${rowIndex}-${column}`}
                        className="px-4 py-3 text-sm text-slate-700"
                      >
                        {formatTableValue(
                          columnKey ? row[columnKey] : row[column]
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-slate-500">
          Showing {sortedData.length} records
        </div>
      </Card>
    </motion.div>
  );
}

// Helper function to format table values
function formatTableValue(value: any): string {
  if (typeof value === "number") {
    if (value > 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}
