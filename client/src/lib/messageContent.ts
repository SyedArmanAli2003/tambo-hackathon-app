import type { ResourceContent, ToolResultContent } from "@tambo-ai/react";

function resourceLabel(block: ResourceContent): string {
  return (
    block.resource.name ??
    block.resource.uri ??
    block.resource.description ??
    "Attached resource"
  );
}

export function getToolResultText(block: ToolResultContent): string {
  return block.content
    .map(item => (item.type === "text" ? item.text : resourceLabel(item)))
    .filter(Boolean)
    .join("\n");
}

export function getResourceLabel(block: ResourceContent): string {
  return resourceLabel(block);
}
