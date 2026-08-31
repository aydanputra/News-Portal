import type { ReactNode } from "react";
import type { WidgetPanelSectionKey } from "@/lib/widget-config-registry";

type RenderCallback = () => ReactNode;

type BlockConfigPanelAdvancedSectionsProps = {
  sectionKey: WidgetPanelSectionKey;
  renderHeroAdvancedSettings: RenderCallback;
  renderBulletListAdvancedSettings: RenderCallback;
  renderNewsFeedAdvancedSettings: RenderCallback;
  renderHeadlineBigAdvancedSettings: RenderCallback;
  renderSidebarWidgetAdvancedSettings: RenderCallback;
  renderTagCloudAdvancedSettings: RenderCallback;
  renderHeroSplit4AdvancedSettings: RenderCallback;
  renderHeroSliderAdvancedSettings: RenderCallback;
  renderAdBannerAdvancedSettings: RenderCallback;
  renderPostBuilderExtraAdvancedSettings: RenderCallback;
};

export function BlockConfigPanelAdvancedSections({
  sectionKey,
  renderHeroAdvancedSettings,
  renderBulletListAdvancedSettings,
  renderNewsFeedAdvancedSettings,
  renderHeadlineBigAdvancedSettings,
  renderSidebarWidgetAdvancedSettings,
  renderTagCloudAdvancedSettings,
  renderHeroSplit4AdvancedSettings,
  renderHeroSliderAdvancedSettings,
  renderAdBannerAdvancedSettings,
  renderPostBuilderExtraAdvancedSettings,
}: BlockConfigPanelAdvancedSectionsProps) {
  const renderPrimaryAdvancedFamilySettings = () => {
    switch (sectionKey) {
      case "classicHero":
        return renderHeroAdvancedSettings();
      case "bulletList":
        return renderBulletListAdvancedSettings();
      case "newsFeed":
        return renderNewsFeedAdvancedSettings();
      case "headlineBig":
        return renderHeadlineBigAdvancedSettings();
      case "sidebarWidget":
        return renderSidebarWidgetAdvancedSettings();
      case "tagCloud":
        return renderTagCloudAdvancedSettings();
      case "heroSplit":
        return renderHeroSplit4AdvancedSettings();
      case "heroSlider":
        return renderHeroSliderAdvancedSettings();
      case "adBanner":
        return renderAdBannerAdvancedSettings();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderPostBuilderExtraAdvancedSettings()}
      {renderPrimaryAdvancedFamilySettings()}
    </div>
  );
}
