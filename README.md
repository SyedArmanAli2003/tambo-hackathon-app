# Dashboard Builder

Dashboard Builder is a React application that turns natural-language requests into data-grounded dashboard components. Users upload CSV or JSON data, the browser computes statistics and common aggregations, and Tambo selects and streams registered React components into the conversation.

Phase 1 uses one Tambo React SDK architecture. It does not yet provide a persistent dashboard canvas, saved dashboards, deterministic Tambo tools, layout editing, or global filters.

## Requirements

- Node.js 20 or newer
- pnpm 10.x (the repository pins pnpm 10.4.1 through Corepack)
- A Tambo Cloud project API key

## Setup

```bash
corepack enable
pnpm install
```

Copy `.env.example` to `.env.local` and add the browser project key from the Tambo dashboard:

```env
VITE_TAMBO_API_KEY=your_tambo_project_api_key
```

Then start Vite:

```bash
pnpm dev
```

The development server uses port 3000 when it is available. If `VITE_TAMBO_API_KEY` is absent, the app renders a clear setup state and does not mount the Tambo client.

## Key handling

`VITE_TAMBO_API_KEY` is intentionally read by the browser client. Vite replaces `VITE_` variables in the public bundle, and the official Tambo Vite setup passes this project API key directly to `TamboProvider`. Treat it as public client configuration, scope and rotate it in the Tambo dashboard, and never place private model-provider credentials or server secrets in a `VITE_` variable.

Local environment files are ignored by Git. `.env.example` contains placeholders only.

## Architecture

The active path is:

```text
client/src/main.tsx
  App.tsx
    TamboAppProvider
      DataProvider
        Home
          DashboardBuilder
            MessageList → MessageItem → MessageContentRenderer
```

- `client/src/components/providers/TamboAppProvider.tsx` centralizes `TamboProvider`, the registered component list, environment selection, and anonymous `userKey`.
- `client/src/lib/anonymousUser.ts` creates `dashboard-builder-anonymous-<uuid>` once and keeps it in `localStorage`, so Tambo thread ownership remains stable across refreshes. This utility is isolated so authentication can replace it later.
- `client/src/lib/componentRegistry.ts` is the only Tambo component registry.
- `client/src/lib/componentSchemas.ts` contains strict Zod 4 schemas. Generic dataset rows allow JSON primitive values only; pie and scatter data have explicit shapes.
- `client/src/components/chat/` renders text, component, tool-use, tool-result, resource, unknown, and streaming content states. Generated components use Tambo's official `ComponentRenderer` inside an error boundary.
- `client/src/lib/dataAnalysis.ts` deterministically computes numeric statistics, categorical summaries, grouped/date aggregations, Pearson correlations, and query-to-aggregation matching.
- `client/src/lib/dashboardContext.ts` exposes the active dataset analysis through a current-SDK context helper. Component schemas and UI error states prohibit silent demo-data substitution.

## Workflow

1. Upload a CSV, TSV, or JSON array of records.
2. The data context detects column types and coerces numeric CSV values.
3. The deterministic analysis layer computes reusable summaries and aggregations.
4. `DashboardBuilder` submits the prompt through `useTamboThreadInput()`.
5. Tambo returns rich content blocks through `useTambo()`.
6. Text and generated components render in the message history; PDF, PNG, and JPG export remains available from the navbar.

Registered components are KPI Card, Line Chart, Bar Chart, Pie Chart, Data Table, Scatter Plot, Stat Card, and Text Block. Invalid or missing chart data produces an explicit error state instead of unrelated sample analytics.

## Verification

```bash
pnpm check
pnpm test
pnpm build
```

- `pnpm check` runs strict TypeScript checking.
- `pnpm test` runs focused Vitest coverage for identity, upload row/type handling, schemas, registry integrity, message utilities, chart safety, and dataset analysis.
- `pnpm build` creates the Vite client and bundled Node server in `dist/`.

Other commands:

```bash
pnpm preview
pnpm start
pnpm format
```

## Phase 2 boundary

The chat history is still the generated dashboard surface. A persistent dashboard domain model, a separate canvas, widget layout/selection, typed Tambo tools for deterministic data operations, interactable widgets, persistence, filters, and undo/redo belong to Phase 2 and are not represented as complete here.

See [TAMBO_SETUP.md](TAMBO_SETUP.md) for SDK-specific setup and extension notes.
