export type DatasetRow = Record<string, unknown>;

function isPrimitive(value: unknown): boolean {
  return (
    value === null || ["string", "number", "boolean"].includes(typeof value)
  );
}

export function isDatasetRow(value: unknown): value is DatasetRow {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(isPrimitive)
  );
}

export function extractJsonDatasetRows(value: unknown): DatasetRow[] | null {
  let candidate: unknown;

  if (Array.isArray(value)) {
    candidate = value;
  } else if (typeof value === "object" && value !== null && "data" in value) {
    candidate = (value as { data: unknown }).data;
  } else {
    candidate = [value];
  }

  if (
    !Array.isArray(candidate) ||
    candidate.length === 0 ||
    !candidate.every(isDatasetRow)
  ) {
    return null;
  }

  return candidate;
}
