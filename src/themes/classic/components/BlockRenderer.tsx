import React from "react";
import { CLASSIC_BLOCKS } from "../blocks/registry";

type RenderBlock = {
  id?: string;
  type?: string;
} & Record<string, unknown>;

export default function BlockRenderer({ block, allBlockData }: { block: RenderBlock; allBlockData?: Record<string, unknown[]> }) {
  const def = block?.type ? CLASSIC_BLOCKS[block.type] : undefined;
  if (!def) return null;
  const Component = def.component as React.ComponentType<Record<string, unknown>>;
  const posts = allBlockData && block?.id && allBlockData[block.id] ? allBlockData[block.id] : [];
  return <Component block={block} posts={posts} />;
}
