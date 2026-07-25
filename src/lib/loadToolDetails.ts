// Dynamic import for toolDetails data to enable code-splitting
import type { ToolDetail } from '../types/tool';

let toolDetailsCache: Partial<ToolDetail>[] | null = null;

export async function loadToolDetails(): Promise<Partial<ToolDetail>[]> {
  if (toolDetailsCache) return toolDetailsCache;

  const { TOOL_DETAILS } = await import('../data/toolDetails.ts');
  toolDetailsCache = TOOL_DETAILS as unknown as Partial<ToolDetail>[];
  return toolDetailsCache;
}

export function getToolDetailsSync(): Partial<ToolDetail>[] | null {
  return toolDetailsCache;
}