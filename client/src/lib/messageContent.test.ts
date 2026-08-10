import type { ToolResultContent } from "@tambo-ai/react";
import { describe, expect, it } from "vitest";
import { getToolResultText } from "./messageContent";

describe("message content utilities", () => {
  it("extracts text and resource labels from tool results safely", () => {
    const result: ToolResultContent = {
      type: "tool_result",
      toolUseId: "tool-1",
      content: [
        { type: "text", text: "Completed" },
        {
          type: "resource",
          resource: { name: "dataset.csv", uri: "file:///dataset.csv" },
        },
      ],
    };

    expect(getToolResultText(result)).toBe("Completed\ndataset.csv");
  });
});
