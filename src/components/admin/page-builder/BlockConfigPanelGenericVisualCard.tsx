import type { ReactNode } from "react";
import type { BlockConfigPanelSurfaceVisualProps } from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";
import {
  BlockConfigPanelGenericBackgroundVisualSection,
  BlockConfigPanelGenericExcerptVisualSection,
  BlockConfigPanelGenericMetaVisualSection,
  BlockConfigPanelGenericThumbnailVisualSection,
  BlockConfigPanelGenericTitleVisualSection,
} from "./BlockConfigPanelGenericVisualSections";

type BlockConfigPanelGenericVisualCardProps = BlockConfigPanelSurfaceVisualProps & {
  className?: string;
  canShowBackground: boolean;
  canShowThumbnail: boolean;
  canShowTitle: boolean;
  canShowMeta: boolean;
  canShowExcerpt: boolean;
  canRenderBottomContainerSettings: boolean;
  renderMainContainerSettings: () => ReactNode;
};

export function BlockConfigPanelGenericVisualCard({
  className,
  canShowBackground,
  canShowThumbnail,
  canShowTitle,
  canShowMeta,
  canShowExcerpt,
  canRenderBottomContainerSettings,
  renderMainContainerSettings,
  ...visualProps
}: BlockConfigPanelGenericVisualCardProps) {
  return (
    <BlockConfigPanelCollapseCard title="Pengaturan Gaya" className={className}>
      {canShowBackground && <BlockConfigPanelGenericBackgroundVisualSection {...visualProps} />}
      {canShowThumbnail && <BlockConfigPanelGenericThumbnailVisualSection {...visualProps} />}
      {canShowTitle && <BlockConfigPanelGenericTitleVisualSection {...visualProps} />}
      {canShowMeta && <BlockConfigPanelGenericMetaVisualSection {...visualProps} />}
      {canShowExcerpt && <BlockConfigPanelGenericExcerptVisualSection {...visualProps} />}
      {canRenderBottomContainerSettings && renderMainContainerSettings()}
    </BlockConfigPanelCollapseCard>
  );
}
