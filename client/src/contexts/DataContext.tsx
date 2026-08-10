import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface Dataset {
  id: string;
  name: string;
  data: Record<string, unknown>[];
  columns: string[];
  columnTypes: Record<string, "string" | "number" | "date">;
  rowCount: number;
  uploadedAt: Date;
}

interface DataContextValue {
  datasets: Dataset[];
  activeDataset: Dataset | null;
  activeDatasetId: string | null;
  addDataset: (name: string, data: Record<string, unknown>[]) => string;
  removeDataset: (id: string) => void;
  setActiveDataset: (id: string | null) => void;
  clearAll: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function detectColumnTypes(
  data: Record<string, unknown>[]
): Record<string, "string" | "number" | "date"> {
  if (data.length === 0) return {};

  const types: Record<string, "string" | "number" | "date"> = {};
  const columns = Object.keys(data[0]);

  for (const col of columns) {
    // Sample first 10 non-null values
    const samples = data
      .slice(0, 10)
      .map(row => row[col])
      .filter(v => v != null && v !== "");

    if (samples.length === 0) {
      types[col] = "string";
      continue;
    }

    // Check if all samples are numbers (or can be parsed as numbers)
    const allNumbers = samples.every(v => {
      if (typeof v === "number") return true;
      const parsed = Number(v);
      return !isNaN(parsed) && String(parsed) === String(v).trim();
    });

    if (allNumbers) {
      types[col] = "number";
      continue;
    }

    // Check if values look like dates
    const allDates = samples.every(v => {
      const d = new Date(String(v));
      return !isNaN(d.getTime());
    });

    if (allDates) {
      types[col] = "date";
      continue;
    }

    types[col] = "string";
  }

  return types;
}

function coerceData(
  data: Record<string, unknown>[],
  types: Record<string, "string" | "number" | "date">
): Record<string, unknown>[] {
  return data.map(row => {
    const newRow: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (types[key] === "number" && typeof value === "string") {
        newRow[key] = Number(value);
      } else {
        newRow[key] = value;
      }
    }
    return newRow;
  });
}

let nextId = 1;

export function DataProvider({ children }: { children: ReactNode }) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);

  const addDataset = useCallback(
    (name: string, rawData: Record<string, unknown>[]): string => {
      const id = `dataset-${nextId++}`;
      const columns = rawData.length > 0 ? Object.keys(rawData[0]) : [];
      const columnTypes = detectColumnTypes(rawData);
      const data = coerceData(rawData, columnTypes);

      const dataset: Dataset = {
        id,
        name,
        data,
        columns,
        columnTypes,
        rowCount: data.length,
        uploadedAt: new Date(),
      };

      setDatasets(prev => [...prev, dataset]);
      setActiveDatasetId(id);
      return id;
    },
    []
  );

  const removeDataset = useCallback((id: string) => {
    setDatasets(prev => prev.filter(d => d.id !== id));
    setActiveDatasetId(prev => (prev === id ? null : prev));
  }, []);

  const setActiveDataset = useCallback((id: string | null) => {
    setActiveDatasetId(id);
  }, []);

  const clearAll = useCallback(() => {
    setDatasets([]);
    setActiveDatasetId(null);
  }, []);

  const activeDataset = datasets.find(d => d.id === activeDatasetId) ?? null;

  return (
    <DataContext.Provider
      value={{
        datasets,
        activeDataset,
        activeDatasetId,
        addDataset,
        removeDataset,
        setActiveDataset,
        clearAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}
