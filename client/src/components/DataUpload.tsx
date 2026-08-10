import { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  X,
  Check,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { extractJsonDatasetRows } from "@/lib/datasetRows";

export default function DataUpload() {
  const {
    datasets,
    activeDatasetId,
    addDataset,
    removeDataset,
    setActiveDataset,
  } = useData();
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setParseError(null);
      setParsing(true);

      const fileName = file.name.replace(/\.[^.]+$/, "");

      if (file.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const raw: unknown = JSON.parse(e.target?.result as string);
            const data = extractJsonDatasetRows(raw);

            if (!data) {
              setParseError(
                "JSON must contain a non-empty array of flat records or a 'data' array of flat records."
              );
              setParsing(false);
              return;
            }

            addDataset(fileName, data);
            setParsing(false);
            setShowPanel(true);
          } catch {
            setParseError("Invalid JSON file.");
            setParsing(false);
          }
        };
        reader.readAsText(file);
      } else if (file.name.endsWith(".csv") || file.name.endsWith(".tsv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: results => {
            if (results.errors.length > 0 && results.data.length === 0) {
              setParseError(`CSV parse error: ${results.errors[0].message}`);
              setParsing(false);
              return;
            }
            addDataset(fileName, results.data as Record<string, unknown>[]);
            setParsing(false);
            setShowPanel(true);
          },
          error: err => {
            setParseError(`CSV parse error: ${err.message}`);
            setParsing(false);
          },
        });
      } else {
        setParseError(
          "Unsupported file type. Please upload a .csv or .json file."
        );
        setParsing(false);
      }
    },
    [addDataset]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so re-uploading same file triggers onChange
    e.target.value = "";
  };

  return (
    <div className="relative">
      {/* Upload Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {datasets.length > 0 ? `Data (${datasets.length})` : "Upload Data"}
      </Button>

      {/* Upload Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Your Data
                </h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-900/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.tsv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {parsing ? (
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Parsing file...</span>
                  </div>
                ) : (
                  <>
                    <FileSpreadsheet className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Drop a <strong>.csv</strong> or <strong>.json</strong>{" "}
                      file here
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      or click to browse
                    </p>
                  </>
                )}
              </div>

              {/* Parse Error */}
              {parseError && (
                <div className="mt-2 flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Dataset List */}
              {datasets.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wide">
                    Datasets
                  </p>
                  {datasets.map(ds => (
                    <div
                      key={ds.id}
                      onClick={() => setActiveDataset(ds.id)}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-colors ${
                        ds.id === activeDatasetId
                          ? "bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30"
                          : "bg-slate-50 dark:bg-slate-900/40 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {ds.id === activeDatasetId && (
                          <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {ds.name}
                          </p>
                          <p className="text-slate-500 dark:text-slate-500">
                            {ds.rowCount} rows · {ds.columns.length} cols
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          removeDataset(ds.id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Hint */}
              {datasets.length > 0 && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                  Active dataset will be used when generating dashboards.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
