import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import InvalidWidgetState from "./InvalidWidgetState";
import { prepareTableData } from "@/lib/chartData";
import type { DataRow, DataTableProps } from "@/lib/componentSchemas";

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
  const prepared = prepareTableData(data, columns);

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const resolveColumnKey = (row: DataRow, column: string) => {
    const match = Object.keys(row).find(
      key => key.toLowerCase() === column.toLowerCase()
    );
    if (match) return match;
    if (column in row) return column;
    return null;
  };

  const handleSort = (column: string) => {
    if (!sortable) return;
    if (!prepared) return;
    const resolvedKey = resolveColumnKey(prepared.data[0], column);
    if (!resolvedKey) return;

    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === resolvedKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: resolvedKey, direction });
  };

  const sortedData = useMemo(() => {
    if (!prepared) return [];
    if (!sortable || !sortConfig) return prepared.data;

    return [...prepared.data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortConfig.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [prepared, sortable, sortConfig]);

  if (!prepared) {
    return (
      <InvalidWidgetState
        title={title || "Data table unavailable"}
        message="No valid rows were supplied, or the requested columns do not exist in the data."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
    >
      <Card className="p-6 border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                {prepared.columns.map(column => (
                  <th
                    key={column}
                    onClick={() => handleSort(column)}
                    className={`px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                      sortable
                        ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                        : ""
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
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {prepared.columns.map(column => {
                    // Get the key from the data row that matches the column name
                    const columnKey = resolveColumnKey(row, column);
                    return (
                      <td
                        key={`${rowIndex}-${column}`}
                        className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
                      >
                        {columnKey ? formatTableValue(row[columnKey]) : "—"}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-500">
          Showing {sortedData.length} records
        </div>
      </Card>
    </motion.div>
  );
}

// Helper function to format table values
function formatTableValue(value: DataRow[string]): string {
  if (value == null) return "";
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}
