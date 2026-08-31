import type { ReactNode } from "react";
import type { WidgetPanelSectionKey } from "@/lib/widget-config-registry";

type RenderCallback = () => ReactNode;

type BlockConfigPanelContentSectionsProps = {
  sectionKey: WidgetPanelSectionKey;
  canRenderGenericNewsVisibility: boolean;
  showSidebarWidgetContent: boolean;
  showGlobalSidebarNotice: boolean;
  showTagCloudContent: boolean;
  showRelatedPostsContent: boolean;
  showImageWidgetContent: boolean;
  renderWidgetNameField: RenderCallback;
  renderGenericNewsContentSettings: RenderCallback;
  renderHeroContentSettings: RenderCallback;
  renderBulletListSourceSettings: RenderCallback;
  renderNewsFeedSourceSettings: RenderCallback;
  renderHeadlineBigContentSettings: RenderCallback;
  renderHeroSplit4ContentSettings: RenderCallback;
  renderHeroSliderContentSettings: RenderCallback;
  renderAdBannerContentSettings: RenderCallback;
  renderSidebarWidgetContentSettings: RenderCallback;
  renderGlobalSidebarNotice: RenderCallback;
  renderTagCloudContentSettings: RenderCallback;
  renderRelatedPostsContentSettings: RenderCallback;
  renderImageWidgetContentSettings: RenderCallback;
};

export function BlockConfigPanelContentSections({
  sectionKey,
  canRenderGenericNewsVisibility,
  showSidebarWidgetContent,
  showGlobalSidebarNotice,
  showTagCloudContent,
  showRelatedPostsContent,
  showImageWidgetContent,
  renderWidgetNameField,
  renderGenericNewsContentSettings,
  renderHeroContentSettings,
  renderBulletListSourceSettings,
  renderNewsFeedSourceSettings,
  renderHeadlineBigContentSettings,
  renderHeroSplit4ContentSettings,
  renderHeroSliderContentSettings,
  renderAdBannerContentSettings,
  renderSidebarWidgetContentSettings,
  renderGlobalSidebarNotice,
  renderTagCloudContentSettings,
  renderRelatedPostsContentSettings,
  renderImageWidgetContentSettings,
}: BlockConfigPanelContentSectionsProps) {
  const renderPrimaryContentFamilySettings = () => {
    switch (sectionKey) {
      case "classicHero":
        return renderHeroContentSettings();
      case "bulletList":
        return renderBulletListSourceSettings();
      case "newsFeed":
        return renderNewsFeedSourceSettings();
      case "headlineBig":
        return renderHeadlineBigContentSettings();
      case "heroSplit":
        return renderHeroSplit4ContentSettings();
      case "heroSlider":
        return renderHeroSliderContentSettings();
      case "adBanner":
        return renderAdBannerContentSettings();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderWidgetNameField()}
      {canRenderGenericNewsVisibility && renderGenericNewsContentSettings()}
      {renderPrimaryContentFamilySettings()}
      {showSidebarWidgetContent && renderSidebarWidgetContentSettings()}
      {showGlobalSidebarNotice && renderGlobalSidebarNotice()}
      {showTagCloudContent && renderTagCloudContentSettings()}
      {showRelatedPostsContent && renderRelatedPostsContentSettings()}
      {showImageWidgetContent && renderImageWidgetContentSettings()}
    </div>
  );
}
