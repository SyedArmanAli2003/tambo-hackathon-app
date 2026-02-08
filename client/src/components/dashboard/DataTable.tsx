import React, { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { topCustomersData } from "@/lib/mockData";

interface DataTableProps {
  title: string;
  columns?: string[];
  data?: Array<Record<string, any>>;
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
  const demoColumns = ["Name", "Revenue", "Status", "Growth"];
  const finalData = (data ?? topCustomersData) as Array<Record<string, any>>;
  const inferredColumns =
    finalData.length > 0 ? Object.keys(finalData[0] ?? {}) : [];
  const finalColumns = columns ?? (inferredColumns.length ? inferredColumns : demoColumns);
  const isDemoFallback = typeof data === "undefined";

  if (import.meta.env.DEV && isDemoFallback) {
    console.warn("DataTable: using default demo dataset", {
      title,
      columnsMissing: typeof columns === "undefined",
      dataMissing: typeof data === "undefined",
    });
  }

  if (import.meta.env.DEV && finalData.length > 0) {
    const sampleKeys = Object.keys(finalData[0] ?? {});
    const sampleKeysLower = new Set(sampleKeys.map(k => k.toLowerCase()));
    const missingColumns = finalColumns.filter(
      c => !sampleKeysLower.has(c.toLowerCase())
    );

    if (missingColumns.length > 0) {
      console.warn("DataTable: some columns do not match row keys", {
        title,
        missingColumns,
        sampleKeys,
      });
    }
  }

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const resolveColumnKey = (row: Record<string, any>, column: string) => {
    const match = Object.keys(row).find(
      key => key.toLowerCase() === column.toLowerCase()
    );
    if (match) return match;
    if (column in row) return column;
    return null;
  };

  const handleSort = (column: string) => {
    if (!sortable) return;

    if (finalData.length === 0) return;
    const resolvedKey = resolveColumnKey(finalData[0] ?? {}, column);
    if (!resolvedKey) return;

    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === resolvedKey && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: resolvedKey, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig) return finalData;

    return [...finalData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortConfig.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [finalData, sortable, sortConfig]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
    >
      <Card className="p-6 border-2 border-slate-200 hover:shadow-lg transition-shadow overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {isDemoFallback ? (
            <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Demo data
            </span>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200">
                {finalColumns.map((column) => (
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
                  {finalColumns.map((column) => {
                    // Get the key from the data row that matches the column name
                    const columnKey = resolveColumnKey(row, column);
                    return (
                      <td
                        key={`${rowIndex}-${column}`}
                        className="px-4 py-3 text-sm text-slate-700"
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
        <div className="mt-4 text-xs text-slate-500">
          Showing {sortedData.length} records
        </div>
      </Card>
    </motion.div>
  );
}

// Helper function to format table values
function formatTableValue(value: any): string {
  if (value == null) return "";
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return String(value);
}
