import type { DataRow } from "@/lib/componentSchemas";

export interface CartesianChartData {
  data: DataRow[];
  xKey: string;
  yKey: string;
}

function resolveKey(row: DataRow, requestedKey: string): string | null {
  const normalized = requestedKey.trim().toLowerCase();
  return Object.keys(row).find(key => key.toLowerCase() === normalized) ?? null;
}

export function prepareCartesianChartData(
  rows: readonly DataRow[] | null | undefined,
  xAxis: string | null | undefined,
  yAxis: string | null | undefined
): CartesianChartData | null {
  if (!rows?.length || !xAxis?.trim() || !yAxis?.trim()) return null;

  const firstRow = rows.find(row => row && Object.keys(row).length > 0);
  if (!firstRow) return null;

  const xKey = resolveKey(firstRow, xAxis);
  const yKey = resolveKey(firstRow, yAxis);
  if (!xKey || !yKey || xKey === yKey) return null;

  const data = rows.flatMap(row => {
    if (!row || !(xKey in row) || !(yKey in row)) return [];
    const xValue = row[xKey];
    const rawYValue = row[yKey];
    const yValue =
      typeof rawYValue === "number" ? rawYValue : Number(rawYValue);

    if (xValue == null || !Number.isFinite(yValue)) return [];
    return [{ ...row, [yKey]: yValue }];
  });

  return data.length ? { data, xKey, yKey } : null;
}

export interface PieDatum {
  name: string;
  value: number;
}

export function preparePieData(
  rows: readonly PieDatum[] | null | undefined
): PieDatum[] {
  if (!rows?.length) return [];
  return rows.filter(
    row =>
      typeof row?.name === "string" &&
      row.name.trim().length > 0 &&
      typeof row.value === "number" &&
      Number.isFinite(row.value) &&
      row.value >= 0
  );
}

export interface ScatterDatum {
  x: number;
  y: number;
}

export function prepareScatterData(
  rows: readonly ScatterDatum[] | null | undefined
): ScatterDatum[] {
  if (!rows?.length) return [];
  return rows.filter(
    row =>
      typeof row?.x === "number" &&
      Number.isFinite(row.x) &&
      typeof row.y === "number" &&
      Number.isFinite(row.y)
  );
}

export interface TableData {
  data: DataRow[];
  columns: string[];
}

export function prepareTableData(
  rows: readonly DataRow[] | null | undefined,
  requestedColumns: readonly string[] | null | undefined
): TableData | null {
  if (!rows?.length) return null;
  const firstRow = rows.find(row => row && Object.keys(row).length > 0);
  if (!firstRow) return null;

  const columns = requestedColumns?.length
    ? requestedColumns.map(column => resolveKey(firstRow, column))
    : Object.keys(firstRow);

  if (!columns.length || columns.some(column => column === null)) return null;
  return { data: [...rows], columns: columns as string[] };
}
