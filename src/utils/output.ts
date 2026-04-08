// Output mode utilities for stdio vs HTTP transport
// In stdio mode: write full data to temp files, return filepath reference
// In HTTP mode: return data inline (no filesystem access in Lambda)

import { writeReport } from "./files.js";

export type OutputMode = "stdio" | "http";

let currentOutputMode: OutputMode = "stdio";

export function setOutputMode(mode: OutputMode): void {
  currentOutputMode = mode;
}

export function isHttpMode(): boolean {
  return currentOutputMode === "http";
}

type ToolResult = { content: Array<{ type: string; text: string }> };

/**
 * Return report data in the appropriate format for the current transport.
 * - stdio: writes to temp file, appends filepath to summary
 * - http: returns summary + inline JSON data
 */
export function outputReport(reportType: string, data: unknown, summary: string): ToolResult {
  // Always return full data inline — works for both HTTP and stdio clients.
  // In stdio mode, also write the report to a temp file as a side effect
  // for debugging / manual inspection, but the primary response carries the data.
  if (!isHttpMode()) {
    try {
      writeReport(reportType, data);
    } catch {
      // Non-fatal: if the temp file write fails, we still return the data inline
    }
  }

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: JSON.stringify(data) },
    ],
  };
}