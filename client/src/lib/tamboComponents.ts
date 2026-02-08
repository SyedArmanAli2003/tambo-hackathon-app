import type { TamboComponent } from "@tambo-ai/react";
import { componentRegistry } from "@/lib/componentRegistry";

export const tamboComponents: TamboComponent[] = Object.entries(
  componentRegistry
).map(([name, { component, schema, description }]) => ({
  name,
  description,
  component,
  propsSchema: schema,
}));
