import type { ReactNode } from "react";
import type { WidgetPanelSectionKey } from "@/lib/widget-config-registry";

type RenderCallback = () => ReactNode;

type BlockConfigPanelVisualFamilySectionsProps = {
  sectionKey: WidgetPanelSectionKey;
  renderHeroLayoutSettings: RenderCallback;
  renderHeroTextSettings: RenderCallback;
  renderBulletListContentSettings: RenderCallback;
  renderNewsFeedStyleSettings: RenderCallback;
  renderHeadlineBigStyleSettings: RenderCallback;
  renderSidebarWidgetStyleSettings: RenderCallback;
  renderTagCloudStyleSettings: RenderCallback;
  renderAdBannerStyleSettings: RenderCallback;
  renderHeroSplit4StyleSettings: RenderCallback;
  renderHeroSliderStyleSettings: RenderCallback;
};

export function BlockConfigPanelVisualFamilySections({
  sectionKey,
  renderHeroLayoutSettings,
  renderHeroTextSettings,
  renderBulletListContentSettings,
  renderNewsFeedStyleSettings,
  renderHeadlineBigStyleSettings,
  renderSidebarWidgetStyleSettings,
  renderTagCloudStyleSettings,
  renderAdBannerStyleSettings,
  renderHeroSplit4StyleSettings,
  renderHeroSliderStyleSettings,
}: BlockConfigPanelVisualFamilySectionsProps) {
  switch (sectionKey) {
    case "classicHero":
      return (
        <>
          {renderHeroLayoutSettings()}
          {renderHeroTextSettings()}
        </>
      );
    case "bulletList":
      return <>{renderBulletListContentSettings()}</>;
    case "newsFeed":
      return <>{renderNewsFeedStyleSettings()}</>;
    case "headlineBig":
      return <>{renderHeadlineBigStyleSettings()}</>;
    case "sidebarWidget":
      return <>{renderSidebarWidgetStyleSettings()}</>;
    case "tagCloud":
      return <>{renderTagCloudStyleSettings()}</>;
    case "adBanner":
      return <>{renderAdBannerStyleSettings()}</>;
    case "heroSplit":
      return <>{renderHeroSplit4StyleSettings()}</>;
    case "heroSlider":
      return <>{renderHeroSliderStyleSettings()}</>;
    default:
      return null;
  }
}
