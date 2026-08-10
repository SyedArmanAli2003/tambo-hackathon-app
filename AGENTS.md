# Phase 1 — Deep Repository Audit, Cleanup, and Tambo SDK Migration Foundation

You are working as a senior full-stack engineer, AI application architect, and repository maintainer.

Use high reasoning throughout this task. Think carefully about the existing architecture before modifying anything. Do not rush into implementation, do not create parallel systems, and do not rewrite the application unnecessarily.

Repository:

https://github.com/SyedArmanAli2003/Dashboard-builder

The project is an AI-powered dashboard builder built using React, TypeScript, Vite, Tailwind CSS, Recharts, Zod, and `@tambo-ai/react`.

The application currently allows users to:

* Upload CSV and JSON datasets.
* Detect dataset column types.
* Precompute statistics, aggregations, and correlations.
* Ask questions about the uploaded dataset.
* Use Tambo to select and render React dashboard components.
* Render KPI cards, line charts, bar charts, pie charts, scatter plots, data tables, stat cards, and text insights.
* Export generated dashboard content as PDF, PNG, or JPG.
* Switch between light, dark, and system themes.
* Display Tambo-generated components inside a chat-like message history.

The project has useful functionality, but the architecture has accumulated old and conflicting approaches.

Important known issues include:

1. The project depends on an older pre-1.0 Tambo SDK version.
2. The application appears to use an older thread and message-rendering API.
3. `useTamboOrchestration.ts` contains legacy logic, including:

   * Direct API requests.
   * Manual JSON parsing.
   * Keyword-based intent detection.
   * Hardcoded metrics.
   * Mock datasets.
   * Artificial loading delays.
   * A fallback orchestration system.
4. The active application now appears to use Tambo thread hooks directly, which means the old orchestration code may be unused.
5. Many schemas are too permissive, using patterns such as:

   * `z.array(z.any())`
   * `props: z.any()`
6. Chart components contain defensive fallback logic because malformed AI-generated props previously caused blank charts or crashes.
7. Some chart components may silently display demo data when generated data is missing or malformed. This is dangerous for an analytics application because the UI can appear valid while showing unrelated data.
8. The project treats chat messages as the dashboard. A proper persistent dashboard canvas will be introduced later, but that is not the goal of this phase.
9. Dataset and dashboard persistence will be addressed in later phases.
10. This phase must preserve existing behavior while creating a clean and reliable foundation.

## Primary objective

Clean and stabilize the repository, remove obsolete architecture, and migrate the application to the current stable Tambo React SDK architecture without yet redesigning the product into the final persistent dashboard workspace.

The application should still work after this phase as an upload-data-and-generate-components experience.

The purpose of this phase is to create a trustworthy technical foundation for later work involving:

* A persistent dashboard canvas.
* Tambo tools for deterministic data operations.
* Interactable dashboard widgets.
* Dashboard persistence.
* Natural-language editing.
* Layout controls.
* Filters.
* Undo and redo.

Do not implement those major product features yet unless a tiny compatibility abstraction is necessary for the migration.

## Working rules

Follow these rules strictly.

### 1. Inspect before editing

Before making changes, inspect:

* `package.json`
* `client/src/App.tsx`
* `client/src/components/DashboardBuilder.tsx`
* `client/src/components/ChatInterface.tsx`
* `client/src/hooks/useTamboOrchestration.ts`
* `client/src/lib/tamboComponents.ts`
* `client/src/lib/componentRegistry.ts`
* `client/src/lib/dataAnalysis.ts`
* `client/src/contexts/DataContext.tsx`
* All files under `client/src/components/dashboard/`
* The Tambo setup documentation in the repository.
* The current repository import graph for all Tambo-related files.
* Build and TypeScript configuration.
* Any existing tests.

Search the complete codebase for:

* `@tambo-ai/react`
* `useTamboThread`
* `useTambo`
* `useTamboThreadInput`
* `renderedComponent`
* `generationStage`
* `generationStatusMessage`
* `useTamboOrchestration`
* `componentRegistry`
* `tamboComponents`
* `z.any`
* `mockData`
* Direct requests to `api.tambo.co`
* Hardcoded analytics values.
* Demo chart fallback data.

Determine which paths are actively used and which are dead code.

Do not assume a file is unused merely because its name looks old. Confirm through imports and runtime paths.

### 2. Use the current official Tambo React SDK

Upgrade the project from the old `@tambo-ai/react` version to the latest compatible stable version available in the package registry.

Inspect the current SDK API and migration requirements.

The newer SDK may use concepts such as:

* `TamboProvider`
* `useTambo`
* `useTamboThreadInput`
* Explicit thread creation and switching.
* Rich message content blocks.
* `ComponentRenderer`
* Explicit component rendering.
* Streaming state.
* `userKey`
* Registered components and tools.

Use the API that actually exists in the installed version. Do not guess API signatures.

Update related dependencies as required, including compatible versions of:

* `@modelcontextprotocol/sdk`
* `zod`
* `zod-to-json-schema`
* React peer dependencies.

Do not unnecessarily upgrade unrelated packages.

### 3. Preserve application behavior

After migration, users must still be able to:

* Open the application.
* Upload a CSV or JSON file.
* Select or use the active dataset.
* Enter a natural-language request.
* Submit the request to Tambo.
* Receive assistant text.
* Receive one or more generated dashboard components.
* See loading and error states.
* Clear or start a new conversation.
* Export generated content.
* Use light, dark, and system themes.

Do not remove working functionality merely to make migration easier.

### 4. Add a stable user identity

The current provider may not supply a stable `userKey`.

Create an appropriate development-safe identity mechanism.

For this phase:

* Generate a local anonymous user identifier.
* Persist it in `localStorage`.
* Reuse the same identifier across page refreshes.
* Do not use a single hardcoded identity shared by every user.
* Encapsulate this logic in a small reusable utility or hook.
* Keep the implementation easy to replace with real authentication later.

A suitable format could resemble:

`dashboard-builder-anonymous-<uuid>`

Do not expose secrets through the user identity.

### 5. Migrate message rendering correctly

Do not continue relying on an old `msg.renderedComponent` field if the new SDK uses message content blocks.

Implement a dedicated message renderer.

The renderer should safely handle at least:

* Text blocks.
* Component blocks.
* Tool-use blocks if the SDK exposes them.
* Tool-result blocks if relevant.
* Unknown block types.
* Component-rendering errors.
* Streaming component states.

Use the official `ComponentRenderer` or current equivalent from the installed SDK.

Preserve the existing visual distinction between user messages and assistant messages.

Do not mix message parsing logic throughout `DashboardBuilder.tsx`. Extract it into focused components where appropriate.

Possible structure:

```text
client/src/components/chat/
  MessageList.tsx
  MessageItem.tsx
  MessageContentRenderer.tsx
  GeneratedComponentBoundary.tsx
```

You may choose a better structure, but keep responsibilities clean.

### 6. Remove or isolate obsolete orchestration

Investigate `client/src/hooks/useTamboOrchestration.ts`.

If it is confirmed unused:

* Remove it.
* Remove unused imports and supporting dead code.
* Remove legacy mock orchestration assets only when nothing else depends on them.
* Document the removal in the final report.

If portions are still used:

* Separate reusable deterministic data functions from obsolete Tambo orchestration.
* Move useful logic to clearly named files.
* Remove direct Tambo API requests and manual response JSON parsing.
* Remove keyword-based fake AI behavior from the active product path.
* Remove hardcoded statistics from production behavior.
* Remove artificial delays.

There must be only one active Tambo orchestration architecture after this phase.

### 7. Do not send the Tambo API key unsafely

Inspect how `VITE_TAMBO_API_KEY` is currently used.

A Vite-prefixed environment variable is included in the browser bundle.

Determine whether the current Tambo SDK officially expects a public client-side project key or whether the key must be protected behind a server.

Follow the current Tambo SDK’s official security model.

Do not casually move secrets around.

At minimum:

* Clearly distinguish public client configuration from private provider credentials.
* Do not log the key.
* Do not display the key.
* Do not include real secrets in committed files.
* Keep `.env` files ignored.
* Add or update `.env.example` with placeholder values only.
* Update setup documentation to explain the correct security model.

If the SDK requires a browser-safe project key, name and document it correctly.

If a private credential is required, introduce a minimal server proxy architecture, but do not overengineer the backend.

### 8. Improve schemas without redesigning every chart

Strengthen the component schemas enough to prevent obvious malformed props.

Do not leave all chart data as unrestricted `z.any()`.

Create reusable schemas for common values.

Example direction:

```ts
const primitiveValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

const dataRowSchema = z.record(z.string(), primitiveValueSchema);
```

However, verify compatibility with the installed Tambo SDK and JSON Schema conversion. The existing project documentation mentions previous limitations around `z.record`, so test the chosen schema rather than assuming it works.

For strongly shaped components, use explicit structures.

Examples:

```ts
const pieDatumSchema = z.object({
  name: z.string(),
  value: z.number(),
});

const scatterDatumSchema = z.object({
  x: z.number(),
  y: z.number(),
});
```

For line and bar charts, create an intentional generic row schema or redesign the props to use stable keys such as:

```ts
{
  label: string;
  value: number;
}
```

Do not perform a massive data-model redesign in this phase unless it is necessary to make the Tambo migration reliable.

At minimum:

* Eliminate `props: z.any()` in active paths.
* Eliminate unrestricted `z.array(z.any())` where a strict shape is known.
* Add meaningful `.describe()` information to important schema fields where supported.
* Validate component registration at startup or in tests.

### 9. Remove misleading production fallback data

Inspect all dashboard chart components.

Some previous commits indicate that charts may fall back to sample data when generated props are missing.

For an analytics application, do not silently show unrelated sample data after the user uploads real data.

Replace production fallback behavior with an explicit empty or error state such as:

* “No valid data was supplied for this chart.”
* “The selected columns could not be rendered.”
* “Try regenerating this widget.”

Demo data may remain only in explicit demo mode or sample previews.

It must never be silently substituted for failed AI output.

Preserve null safety and error boundaries.

### 10. Keep the existing data-analysis utility working

Do not remove `dataAnalysis.ts`.

It currently provides valuable functions such as:

* Numeric statistics.
* Categorical summaries.
* Grouped aggregations.
* Date aggregations.
* Pearson correlations.
* Query-to-aggregation matching.

For now, preserve this behavior because later phases will convert these functions into typed Tambo tools.

You may refactor obvious duplication or add tests, but do not replace the system with model-generated calculations.

### 11. Improve code organization

Refactor only where it reduces migration risk and future confusion.

Target outcomes:

* Tambo provider configuration is centralized.
* Tambo components are registered in one clear registry.
* Message rendering is separated from page layout.
* Dataset analysis is separate from Tambo UI concerns.
* Dead orchestration code is removed.
* Environment handling is centralized.
* Anonymous user identity is isolated.
* Error boundaries are reusable.
* Types are explicit.

Avoid unnecessary abstraction layers.

Do not introduce Redux, Zustand, a database, or a new framework in this phase.

### 12. Add verification and tests

The repository must have reliable verification commands.

At minimum ensure the following commands exist and pass:

```bash
pnpm install
pnpm check
pnpm build
```

Add a test command if it does not exist.

Use Vitest where appropriate because the dependency already appears to exist.

Add focused tests for high-risk logic, such as:

* Anonymous user identity creation and persistence.
* Component registry validation.
* Data schema validation.
* Message content rendering utilities where practical.
* Dataset analysis functions.
* No demo fallback when invalid data is supplied.

Do not spend this phase creating a huge test suite. Add enough tests to protect the migration foundation.

### 13. Update documentation

Update the repository documentation so it reflects the real architecture after migration.

Update at least:

* `README.md`
* `TAMBO_SETUP.md`
* `.env.example`
* Any outdated setup instructions.

Documentation must explain:

* Required Node and pnpm versions.
* Installation.
* Environment setup.
* Whether the Tambo key is browser-safe or private.
* How anonymous user identity works.
* How registered components work.
* How generated message content is rendered.
* How to run type checking, tests, and production builds.
* The fact that deterministic data tools and persistent dashboard editing will be implemented in later phases.

Remove claims that are no longer accurate.

Do not describe unfinished future functionality as already implemented.

## Important implementation constraints

Do not:

* Rebuild the project using Next.js.
* Replace Vite.
* Replace Recharts.
* Replace Tailwind.
* Introduce a database.
* Introduce authentication services.
* Add dashboard persistence.
* Add drag-and-drop layouts.
* Add Tambo interactables yet.
* Add MCP integrations yet.
* Build the final AI workspace yet.
* Add fake analytics values.
* Keep two separate Tambo orchestration paths.
* Hide migration failures with `any`.
* Disable TypeScript checks.
* Use `@ts-ignore` unless an unavoidable third-party issue is documented.
* Use broad `eslint-disable` comments to suppress real problems.
* Commit environment secrets.
* Silently display demo data on malformed production props.
* Modify unrelated parts of the application without justification.

## Execution sequence

Perform the work in this order.

### Step 1 — Repository diagnosis

Inspect the repository and produce an internal implementation map covering:

* Active application entry path.
* Tambo provider location.
* Active Tambo hooks.
* Message data shape.
* Component registration flow.
* Dataset context flow.
* Legacy orchestration flow.
* Dead files.
* Risky schemas.
* Chart fallback behavior.
* Environment variable handling.
* Existing test and build configuration.

Do not stop after the diagnosis. Continue into implementation.

### Step 2 — Dependency and SDK migration

* Upgrade the Tambo React SDK.
* Resolve peer dependency compatibility.
* Update imports.
* Add stable `userKey`.
* Update provider setup.
* Update thread submission.
* Update streaming state handling.
* Update message rendering.
* Handle explicit component content blocks.
* Preserve clear/new-thread behavior.

### Step 3 — Architecture cleanup

* Remove obsolete Tambo orchestration.
* Remove unused mock paths.
* Centralize provider configuration.
* Extract message-rendering components.
* Clean unused imports and types.
* Ensure only one active AI execution path exists.

### Step 4 — Schema reliability

* Strengthen active component schemas.
* Remove active `props: z.any()`.
* Replace known `z.array(z.any())` cases.
* Keep schemas compatible with Tambo.
* Add clear component descriptions.
* Add validation tests.

### Step 5 — Analytics safety

* Remove silent demo-data fallbacks.
* Add explicit invalid-data states.
* Keep error boundaries.
* Ensure malformed props do not crash the app.
* Ensure uploaded data is never replaced by unrelated sample data.

### Step 6 — Verification

Run:

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

Also manually inspect the application behavior where possible.

Test at least these scenarios:

1. Application loads without a dataset.
2. Missing Tambo configuration shows a clear setup state.
3. A CSV file uploads successfully.
4. A JSON file uploads successfully.
5. Dataset metadata appears correctly.
6. A prompt can be submitted.
7. Assistant text renders.
8. A generated component renders.
9. Invalid component data shows an explicit error or empty state.
10. New conversation or clear action works.
11. Theme switching still works.
12. Export controls still compile and remain available.
13. Page refresh preserves anonymous user identity.
14. Page refresh does not crash on existing thread content.

## Acceptance criteria

This phase is complete only when all of the following are true:

* The project uses the current stable Tambo React SDK.
* There is one active Tambo orchestration path.
* Legacy direct API orchestration is removed from active code.
* The provider uses a stable user identity.
* Message content is rendered using the current SDK’s official model.
* Generated components are rendered explicitly and safely.
* TypeScript passes without disabling important checks.
* Production build passes.
* Tests pass.
* Known component schemas are stricter.
* Active paths no longer depend on `props: z.any()`.
* Charts do not silently substitute unrelated demo data.
* Uploaded dataset analysis still works.
* Theme support still works.
* Export functionality still compiles.
* Documentation reflects the migrated architecture.
* No secrets are committed.
* No major final-product features are prematurely implemented.

## Expected final response

After completing the changes, provide a structured final report containing:

### 1. Repository diagnosis

Explain:

* What architecture was active before.
* Which legacy systems were discovered.
* Which files were removed or retained.
* Which risks were identified.

### 2. Migration summary

Explain:

* Previous Tambo SDK version.
* New Tambo SDK version.
* Important API changes handled.
* Provider changes.
* Thread changes.
* Message-rendering changes.
* User identity changes.

### 3. Files changed

List every important file changed, created, or removed and explain why.

### 4. Safety improvements

Explain:

* Schema improvements.
* Removal of fake or fallback analytics.
* Error-handling improvements.
* Environment-variable handling.
* Secret-handling decisions.

### 5. Verification results

Report the exact results of:

```bash
pnpm check
pnpm test
pnpm build
```

Do not claim success unless the commands actually pass.

If anything fails, report:

* The exact command.
* The relevant error.
* Whether it was fixed.
* What remains unresolved.

### 6. Remaining technical debt

List only real remaining issues, especially those that should be handled in Phase 2.

Expected Phase 2 topics include:

* Persistent dashboard domain model.
* Dashboard canvas separated from chat.
* Widget layout and selection.
* Tambo tools for deterministic aggregations.
* Tambo interactable widgets.
* Dashboard save and restore.
* Filters and global dashboard state.

### 7. Suggested commit message

Provide one clean conventional commit message covering this phase.

## Final quality bar

Treat this as a production migration, not a visual prototype.

The final code must be understandable by another engineer.

Prefer deleting obsolete code over commenting it out.

Prefer explicit types over `any`.

Prefer deterministic error states over misleading demo fallbacks.

Prefer one clean architecture over preserving historical experiments.

Preserve working features, but do not preserve architectural confusion.
