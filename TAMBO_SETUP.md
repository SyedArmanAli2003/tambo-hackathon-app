# Tambo React SDK setup

This project uses `@tambo-ai/react` 1.3.0 with React 19, Zod 4, and the current content-block/thread API.

## Configure Tambo Cloud

1. Create or select a project at [dashboard.tambo.co](https://dashboard.tambo.co/).
2. Copy the project API key intended for the browser SDK.
3. Copy `.env.example` to `.env.local`.
4. Set the key and restart Vite.

```env
VITE_TAMBO_API_KEY=your_tambo_project_api_key
```

An optional Tambo environment can be selected with:

```env
VITE_TAMBO_ENVIRONMENT=production
```

Vite exposes every `VITE_` value to browser code. The Tambo project API key is public client configuration under the official browser SDK model; it is not a safe location for OpenAI, Anthropic, database, OAuth client-secret, or other private provider credentials. Never commit a real `.env` file or print the key.

## Provider and identity

`client/src/components/providers/TamboAppProvider.tsx` is the only provider configuration. It supplies:

- The browser project API key.
- The optional environment.
- The component registry from `client/src/lib/componentRegistry.ts`.
- A stable anonymous `userKey`.

The anonymous key has the form `dashboard-builder-anonymous-<uuid>` and is stored at `dashboard-builder.anonymous-user-key` in `localStorage`. Each browser profile gets its own identifier and reuses it after refresh. It is an ownership key, not a secret. Replace the isolated identity utility with an authenticated application user ID when real authentication is introduced.

## Threads and input

`DashboardBuilder` uses the 1.x SDK APIs:

- `useTambo()` for messages, `currentThreadId`, streaming state, errors, and `startNewThread()`.
- `useTamboThreadInput()` for shared input state and `submit()`.
- `useTamboContextHelpers()` for the current dataset and deterministic analysis context.

The old `useTamboThread()` orchestration path, manual `api.tambo.co` request, response JSON parsing, fake intent routing, artificial delay, and mock analytics have been removed. Starting a new conversation calls the SDK's `startNewThread()` and clears the input.

## Message rendering

Tambo 1.x returns an array of content blocks on every message. The focused components under `client/src/components/chat/` handle:

- `text` blocks as role-styled message bubbles.
- `component` blocks through the official `ComponentRenderer` with `threadId` and `messageId`.
- `tool_use` status blocks.
- `tool_result` errors without dumping successful internal output into the conversation.
- `resource` labels.
- Unknown future block types with a safe fallback.
- Component streaming labels and render-time error isolation.

The app does not read the removed message-level `renderedComponent` field.

## Components and schemas

Add a dashboard component in three places:

1. Create the React component under `client/src/components/dashboard/`.
2. Add a strict schema and inferred prop type to `client/src/lib/componentSchemas.ts`.
3. Add exactly one registration entry to `client/src/lib/componentRegistry.ts`.

Schemas are passed directly as Zod 4 Standard Schemas. `dataRowSchema` uses `z.record(z.string(), primitiveValueSchema)`, which is covered by tests against the installed SDK-compatible schema model. Known chart shapes are explicit, non-empty data is required, and components still validate runtime input so incomplete or malformed streamed props show a useful state rather than a crash or demo chart.

## Commands

```bash
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

Node.js 20+ and pnpm 10.x are required.

## Troubleshooting

- Setup page instead of the app: verify `VITE_TAMBO_API_KEY` and restart Vite.
- Authentication/thread error: clear only the `dashboard-builder.anonymous-user-key` local-storage entry to obtain a new anonymous identity, then retry.
- Unknown component: confirm its name matches the single registry entry.
- Invalid component data: inspect the schema and prompt context; the app deliberately refuses to display unrelated fallback data.
- Type/schema regression: run `pnpm check && pnpm test`.

## Not implemented in Phase 1

Typed deterministic data tools, a persistent dashboard canvas, interactable widgets, dashboard save/restore, layouts, filters, and undo/redo are Phase 2 work. The existing deterministic analysis functions remain local context-building utilities until they are exposed as tools in that phase.
