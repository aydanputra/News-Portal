/**
 * Shared helpers for the page-builder block tree.
 *
 * Block `config` is arbitrary JSON produced by the builder, so it stays
 * loosely typed; the surrounding block structure is typed.
 */

export interface BuilderBlock {
  id?: string;
  type?: string;
  title?: string;
  order?: number;
  isVisible?: boolean;
  placement?: string;
  config?: Record<string, any> | null;
  [key: string]: unknown;
}

export function isVisible(block: BuilderBlock | null | undefined): boolean {
  return block?.isVisible !== false;
}

export function getOrder(block: BuilderBlock | null | undefined): number {
  return typeof block?.order === "number" ? block.order : 0;
}

export function getChildren(block: BuilderBlock | null | undefined): BuilderBlock[] {
  const children = block?.config?.children;
  if (!Array.isArray(children)) return [];
  return [...children].filter(isVisible);
}

export function collectWidgetsRecursive(blocks: BuilderBlock[]): BuilderBlock[] {
  const result: BuilderBlock[] = [];
  for (const block of blocks) {
    if (!isVisible(block)) continue;
    if (block?.type === "section") {
      result.push(...collectWidgetsRecursive(getChildren(block)));
      continue;
    }
    result.push(block);
  }
  return result;
}

export function hasId(block: BuilderBlock | null | undefined): block is BuilderBlock & { id: string } {
  return typeof block?.id === "string";
}
