// Dynamic import for tools data to enable code-splitting
import type { Tool } from '../types/tool';

let toolsCache: Tool[] | null = null;

export async function loadTools(): Promise<Tool[]> {
  if (toolsCache) return toolsCache;

  const { default: tools } = await import('../data/json/tools.json');
  toolsCache = tools as Tool[];
  return toolsCache;
}

export function getToolsSync(): Tool[] | null {
  return toolsCache;
}

// For backward compatibility - keeps synchronous access working after initial load
export function useTools(): Tool[] {
  // This is a synchronous fallback - only works after async load completes
  // Components should use loadTools() in useEffect for async loading
  return toolsCache ?? [];
}