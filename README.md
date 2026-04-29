# Dashboard Builder

An AI-powered dashboard generator built for the Tambo hackathon. Describe the dashboard you want in natural language, upload a CSV or JSON dataset, and Tambo renders the right React components for the job.

## What this project does

Dashboard Builder turns conversational requests into visual analytics. Instead of manually assembling charts and cards, you can ask for things like:

- "Show me sales by region with revenue trends"
- "Create a user growth dashboard"
- "Analyze revenue vs customer correlation"

The app uses Tambo's generative UI workflow to choose and render components such as KPI cards, bar charts, line charts, pie charts, scatter plots, tables, stat cards, and text summaries.

## Key features

- Natural language dashboard generation with Tambo
- Support for uploaded CSV and JSON datasets
- Precomputed dataset analysis for better AI responses
- Multiple dashboard component types for different kinds of questions
- Responsive chat-style interface with modern UI treatments
- Theme support with light, dark, and system preference handling
- Production-ready TypeScript app with a Vite frontend and Node-based build output

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Tambo AI (`@tambo-ai/react`)
- Recharts
- Framer Motion
- Zod
- Express
- shadcn/ui and Radix UI primitives

## Project structure

```text
client/
  src/
    App.tsx                # App shell, routing, providers, and Tambo setup
    main.tsx               # React entry point
    index.css              # Global styles and theme tokens
    components/            # UI, dashboard, and app-specific components
    contexts/              # Theme, data, and dashboard navigation state
    hooks/                 # Shared React hooks
    lib/                   # Data analysis helpers and component registry
    pages/                 # Routed pages
server/
  index.ts                 # Production server entry point
shared/
  const.ts                 # Shared constants
test-data/                 # Example CSV and JSON datasets
README_HACKATHON.md        # Hackathon-oriented overview
TAMBO_SETUP.md             # Tambo configuration notes
DASHBOARD_BUILDER_DESIGN.md # Product and UI design notes
```

## Prerequisites

- Node.js 20 or newer is recommended
- pnpm 10.x
- A Tambo API key

## Getting started

1. Install dependencies.

```bash
pnpm install
```

2. Create a local environment file in the project root.

```env
VITE_TAMBO_API_KEY=your_api_key_here
```

3. Start the development server.

```bash
pnpm dev
```

4. Open the app in your browser. Vite typically serves the app at `http://localhost:5173`.

If the API key is missing, the app will show a setup message instead of the AI experience.

## Available scripts

- `pnpm dev` - start the Vite development server
- `pnpm build` - build the frontend and bundle the Node server into `dist/`
- `pnpm start` - run the production server from the built output
- `pnpm preview` - preview the production build with Vite
- `pnpm check` - run the TypeScript compiler without emitting files
- `pnpm format` - format the codebase with Prettier

## Environment variables

The app currently expects the following variable:

- `VITE_TAMBO_API_KEY` - required for AI-powered dashboard generation

Example:

```env
VITE_TAMBO_API_KEY=tbm_your_key_here
```

## How it works

1. The user uploads a dataset or starts from example data.
2. The app analyzes the dataset to derive column stats, correlations, and useful aggregations.
3. The prompt, dataset context, and precomputed analysis are sent to Tambo.
4. Tambo picks the right registered component and fills it with computed props.
5. The dashboard renders dynamically inside the chat experience.

The component registry in `client/src/lib/componentRegistry.ts` is the bridge between Tambo and the dashboard UI. It defines schemas and descriptions for the components Tambo is allowed to render.

## Available dashboard components

The registry currently includes:

- KPI cards for headline metrics
- Line charts for trends over time
- Bar charts for category comparisons
- Pie charts for proportions and share
- Data tables for detailed records
- Scatter plots for correlation analysis
- Stat cards for compact metrics
- Text blocks for written analysis and insights

## Example prompts

Try prompts like these after uploading data:

- Show revenue by region and include a trend line
- Build a sales summary with total revenue, top customers, and a pie chart of market share
- Compare monthly user growth across segments
- Find the relationship between ad spend and conversions
- Summarize the most important insights from this dataset

## Data files included for demoing

The `test-data/` folder includes sample datasets you can use right away:

- `sales_data.csv`
- `revenue_customers.csv`
- `employee_performance.csv`
- `user_analytics.json`

These are useful for testing the data upload flow and for trying different dashboard scenarios.

## Build and deploy

The production build produces a bundled frontend and a Node server entry point in `dist/`.

Typical deployment flow:

```bash
pnpm install
pnpm build
pnpm start
```

This repository also includes `vercel.json`, so it can be adapted to serverless-style deployment if needed.

## Troubleshooting

If the app does not enter the AI flow:

- Check that `VITE_TAMBO_API_KEY` is set correctly
- Restart the dev server after changing environment variables
- Verify the uploaded file is a supported CSV or JSON dataset
- Run `pnpm check` if TypeScript errors are blocking development

If charts render unexpectedly:

- Inspect the dataset shape and column names
- Confirm the prompt matches the available columns
- Try a smaller, simpler prompt first to validate the data pipeline

## Further reading

- [README_HACKATHON.md](README_HACKATHON.md)
- [TAMBO_SETUP.md](TAMBO_SETUP.md)
- [DASHBOARD_BUILDER_DESIGN.md](DASHBOARD_BUILDER_DESIGN.md)

## License

MIT
