import type { ReactNode } from "react";
import type { ConfigValue } from "@/lib/page-builder-config";
import type { Block } from "./types";

export type BlockConfigPanelColorPickerProps = {
  label: string;
  configKey: string;
  globalDefault?: string;
  isResponsive?: boolean;
  activeDeviceTab?: "desktop" | "tablet" | "mobile";
  containerClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  swatchClassName?: string;
  inputClassName?: string;
  child: Block;
  getConfigValue: (child: Block, key: string) => unknown;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  updateChildConfig: (key: string, value: ConfigValue) => void;
};

export type BlockConfigPanelColorPickerRenderer = (
  props: BlockConfigPanelColorPickerProps,
) => ReactNode;

export type BlockConfigPanelAdOption = {
  id: string;
  name: string;
  position?: string | null;
  isActive?: boolean | null;
};

export type BlockConfigPanelSharedCategoryTextOptions = {
  textDefault: string;
  backgroundDefault: string;
  showMarginBottom?: boolean;
};

export type BlockConfigPanelSharedTitleTextOptions = {
  colorKey: string;
  hoverColorKey: string;
  fontSizeKey: string;
  lineHeightKey: string;
  fontWeightKey: string;
  marginBottomKey: string;
  colorDefault: string;
  hoverColorDefault: string;
  fontWeightDefault: string;
};

export type SharedPanelOptions = {
  copyTitle: string;
  sectionTitle?: string;
  toggleLabel?: string;
  colorLabel?: string;
  radiusLabel?: string;
  paddingLabel?: string;
  marginLabel?: string;
  textAlignLabel?: string;
  verticalAlignLabel?: string;
  alignKey?: string;
  alignDefault?: "left" | "center" | "right";
  showVerticalAlign?: boolean;
  showBorderControls?: boolean;
  borderColorLabel?: string;
  borderWidthLabel?: string;
  borderStyleLabel?: string;
};

export type BlockConfigPanelCoreVisualProps = {
  child: Block;
  heroControlClass: string;
  heroColorTriggerClass: string;
  heroColorSwatchClass: string;
  heroColorInputClass: string;
  globalWidgetTitleColor: string;
  globalAccentTone: string;
  globalNewsTitleColor: string;
  globalHoverColor: string;
  globalMetaTone: string;
  globalExcerptTone: string;
  getConfigBool: (key: string, fallback?: boolean) => boolean;
  getConfigString: (key: string, fallback?: string) => string;
  getConfigValue: (child: Block, key: string) => unknown;
  getConfigForApply: (key: string) => ConfigValue | undefined;
  applyToAllDevices: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  renderHeroTextSection: (title: string, content: ReactNode) => ReactNode;
  ColorPicker: BlockConfigPanelColorPickerRenderer;
};

export type BlockConfigPanelSurfaceVisualProps = BlockConfigPanelCoreVisualProps & {
  globalSurfaceTone: string;
  globalBorderTone: string;
};

export type BlockConfigPanelCoreContentProps = {
  deviceLabel: string;
  controlClassName: string;
  getConfigString: (key: string, fallback?: string) => string;
  getConfigForApply: (key: string) => ConfigValue | undefined;
  applyToAllDevices: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  updateChildConfig: (key: string, value: ConfigValue) => void;
};

export type BlockConfigPanelSharedAdvancedProps = {
  renderSharedVisibilitySettings: () => ReactNode;
  renderSharedBoxBackgroundSettings: (
    options: string | SharedPanelOptions,
  ) => ReactNode;
  renderSharedWidgetSpacingSettings: (
    options: string | SharedPanelOptions,
  ) => ReactNode;
};

export type BlockConfigPanelHeroAdvancedProps = BlockConfigPanelSharedAdvancedProps & {
  deviceLabel: string;
  controlClassName: string;
  getConfigString: (key: string, fallback?: string) => string;
  getConfigForApply: (key: string) => ConfigValue | undefined;
  applyToAllDevices: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
};

export type BlockConfigPanelSharedBoxBackgroundProps = Pick<
  BlockConfigPanelSurfaceVisualProps,
  | "child"
  | "globalSurfaceTone"
  | "globalBorderTone"
  | "heroColorTriggerClass"
  | "heroColorSwatchClass"
  | "heroColorInputClass"
  | "getConfigBool"
  | "getConfigString"
  | "getConfigValue"
  | "getConfigForApply"
  | "applyToAllDevices"
  | "updateChildResponsiveConfig"
  | "updateChildConfig"
  | "ColorPicker"
> & {
  options: SharedPanelOptions;
  deviceLabel: string;
  controlClassName: string;
  isPostBuilder: boolean;
  openMediaLibraryForKey: (key: string) => void;
};

export type BlockConfigPanelSharedWidgetSpacingProps = {
  options: SharedPanelOptions;
  deviceLabel: string;
  controlClassName: string;
  isPostBuilder: boolean;
  getConfigString: (key: string, fallback?: string) => string;
  getConfigForApply: (key: string) => ConfigValue | undefined;
  applyToAllDevices: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
};

export type BlockConfigPanelSharedContentAlignmentProps = {
  options: SharedPanelOptions;
  deviceLabel: string;
  isPostBuilder: boolean;
  getConfigString: (key: string, fallback?: string) => string;
  getConfigForApply: (key: string) => ConfigValue | undefined;
  applyToAllDevices: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
};

export type BlockConfigPanelSharedVisibilityProps = {
  isPostWidget: boolean;
  getConfigBool: (key: string, fallback?: boolean) => boolean;
  updateChildConfig: (key: string, value: ConfigValue) => void;
};

export type BlockConfigPanelPostContentLayoutSectionProps = {
  child: Block;
  isPostWidget: boolean;
  renderSharedContentAlignmentSettings: (
    options: string | SharedPanelOptions,
  ) => ReactNode;
};

export type BlockConfigPanelWidgetNameFieldProps = {
  child: Block;
  isPostBuilder: boolean;
  showInPostBuilder?: boolean;
  isReferenceStyleWidget: boolean;
  controlClassName: string;
  showTitle: boolean;
  onUpdateTitle: (value: string) => void;
};

export type BlockConfigPanelSlugSelectionListOptions = {
  label: string;
  selectedSlugs: string[];
  onChange: (slugs: string[]) => void;
  emptyStateLabel: string;
  helperText: string;
  selectedLabel: string;
  emptyDataText: string;
  items: Array<{ id: string; slug: string; name: string }>;
};

export type BlockConfigPanelSearchableMultiSelectRenderer = (
  options: BlockConfigPanelSlugSelectionListOptions,
) => ReactNode;

export type BlockConfigPanelSharedSourceFilterFieldsProps = {
  filterType: string;
  categories: Array<{ id: string; slug: string; name: string }>;
  tags: Array<{ id: string; slug: string; name: string }>;
  selectedCategoryIncludeSlugs: string[];
  selectedCategoryExcludeSlugs: string[];
  selectedTagIncludeSlugs: string[];
  selectedTagExcludeSlugs: string[];
  setSelectedCategoryIncludeSlugs: (slugs: string[]) => void;
  setSelectedCategoryExcludeSlugs: (slugs: string[]) => void;
  setSelectedTagIncludeSlugs: (slugs: string[]) => void;
  setSelectedTagExcludeSlugs: (slugs: string[]) => void;
  renderSlugSelectionList: (
    options: BlockConfigPanelSlugSelectionListOptions,
  ) => ReactNode;
};

export type BlockConfigPanelPostBuilderExtraAdvancedProps =
  BlockConfigPanelSharedAdvancedProps & {
    isPostBuilder: boolean;
    isPostContentWidget: boolean;
    canRenderSharedVisibilitySettings: boolean;
    postBuilderTabPanelClass: string;
  };

export type BlockConfigPanelSharedTextBaseProps = Pick<
  BlockConfigPanelCoreVisualProps,
  | "child"
  | "heroControlClass"
  | "heroColorTriggerClass"
  | "heroColorSwatchClass"
  | "heroColorInputClass"
  | "globalMetaTone"
  | "globalExcerptTone"
  | "getConfigBool"
  | "getConfigString"
  | "getConfigValue"
  | "updateChildResponsiveConfig"
  | "updateChildConfig"
  | "renderHeroTextSection"
  | "ColorPicker"
>;

export type BlockConfigPanelSharedCategoryTextSectionProps =
  BlockConfigPanelSharedTextBaseProps & BlockConfigPanelSharedCategoryTextOptions;

export type BlockConfigPanelSharedTitleTextSectionProps =
  BlockConfigPanelSharedTextBaseProps & BlockConfigPanelSharedTitleTextOptions;

export type BlockConfigPanelSharedMetaTextSectionProps =
  BlockConfigPanelSharedTextBaseProps;

export type BlockConfigPanelSharedExcerptTextSectionProps =
  BlockConfigPanelSharedTextBaseProps;

export type BlockConfigPanelSharedCategoryTextRenderer = (
  options: BlockConfigPanelSharedCategoryTextOptions,
) => ReactNode;

export type BlockConfigPanelSharedTitleTextRenderer = (
  options: BlockConfigPanelSharedTitleTextOptions,
) => ReactNode;

export type BlockConfigPanelMainContainerSectionProps = Pick<
  BlockConfigPanelSurfaceVisualProps,
  | "child"
  | "heroColorTriggerClass"
  | "heroColorSwatchClass"
  | "heroColorInputClass"
  | "globalSurfaceTone"
  | "getConfigBool"
  | "getConfigString"
  | "getConfigValue"
  | "getConfigForApply"
  | "applyToAllDevices"
  | "updateChildResponsiveConfig"
  | "updateChildConfig"
  | "ColorPicker"
> & {
  deviceLabel: string;
  isClassicHeroWidget: boolean;
  isBulletListWidget: boolean;
  openMediaLibraryForKey: (key: string) => void;
};

export type BlockConfigPanelHeroLayoutSectionProps = {
  isClassicHeroWidget: boolean;
  heroControlClass: string;
  getConfigString: (key: string, fallback?: string) => string;
  getConfigForApply: (key: string) => ConfigValue | undefined;
  applyToAllDevices: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  updateChildConfig: (key: string, value: ConfigValue) => void;
};

export type BlockConfigPanelHeroTextSettingsSectionProps = Pick<
  BlockConfigPanelCoreVisualProps,
  "globalAccentTone" | "globalNewsTitleColor" | "globalHoverColor" | "getConfigForApply" | "applyToAllDevices"
> & {
  isClassicHeroWidget: boolean;
  renderSharedCategoryTextSection: BlockConfigPanelSharedCategoryTextRenderer;
  renderSharedTitleTextSection: BlockConfigPanelSharedTitleTextRenderer;
  renderSharedMetaTextSection: () => ReactNode;
  renderSharedExcerptTextSection: () => ReactNode;
};

export type BlockConfigPanelHeadlineBigContentSectionProps = {
  heroTextControlClass: string;
  heroControlClass: string;
  getConfigString: (key: string, fallback?: string) => string;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  renderSharedSourceFilterFields: () => ReactNode;
};

export type BlockConfigPanelHeadlineBigStyleSectionProps = Pick<
  BlockConfigPanelSurfaceVisualProps,
  | "child"
  | "heroControlClass"
  | "heroColorTriggerClass"
  | "heroColorSwatchClass"
  | "heroColorInputClass"
  | "globalWidgetTitleColor"
  | "globalAccentTone"
  | "globalNewsTitleColor"
  | "globalHoverColor"
  | "globalSurfaceTone"
  | "globalBorderTone"
  | "getConfigBool"
  | "getConfigString"
  | "getConfigValue"
  | "getConfigForApply"
  | "applyToAllDevices"
  | "updateChildResponsiveConfig"
  | "updateChildConfig"
  | "renderHeroTextSection"
  | "ColorPicker"
> & {
  renderSharedCategoryTextSection: BlockConfigPanelSharedCategoryTextRenderer;
  renderSharedTitleTextSection: BlockConfigPanelSharedTitleTextRenderer;
  renderSharedMetaTextSection: () => ReactNode;
  renderSharedExcerptTextSection: () => ReactNode;
};

export type BlockConfigPanelHeadlineBigAdvancedSectionProps =
  BlockConfigPanelSharedAdvancedProps;

export type BlockConfigPanelHeroSliderContentSectionProps = {
  heroTextControlClass: string;
  heroControlClass: string;
  getConfigString: (key: string, fallback?: string) => string;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  renderSharedSourceFilterFields: () => ReactNode;
  sectionTitle?: string;
  badgeLabel?: string;
  hideSourceControls?: boolean;
  sourceInfoText?: string;
  extraSections?: ReactNode;
};

export type BlockConfigPanelHeroSliderAdvancedSectionProps =
  BlockConfigPanelSharedAdvancedProps & {
    deviceLabel: string;
    heroControlClass: string;
    getConfigBool: (key: string, fallback?: boolean) => boolean;
    getConfigString: (key: string, fallback?: string) => string;
    getConfigForApply: (key: string) => ConfigValue | undefined;
    applyToAllDevices: (key: string, value: ConfigValue) => void;
    updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
    updateChildConfig: (key: string, value: ConfigValue) => void;
  };

export type BlockConfigPanelHeroSplit4ContentSectionProps = {
  heroTextControlClass: string;
  heroControlClass: string;
  getConfigString: (key: string, fallback?: string) => string;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  renderSharedSourceFilterFields: () => ReactNode;
};

export type BlockConfigPanelHeroSplit4AdvancedSectionProps =
  BlockConfigPanelSharedAdvancedProps;

type BlockConfigPanelPrimarySourceSectionBaseProps = {
  heroTextControlClass: string;
  heroControlClass: string;
  getConfigString: (key: string, fallback?: string) => string;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  renderSharedSourceFilterFields: () => ReactNode;
};

export type BlockConfigPanelHeroContentSectionProps =
  BlockConfigPanelPrimarySourceSectionBaseProps;

export type BlockConfigPanelBulletListSourceSectionProps =
  BlockConfigPanelPrimarySourceSectionBaseProps;

export type BlockConfigPanelNewsFeedSourceSectionProps =
  BlockConfigPanelPrimarySourceSectionBaseProps & {
    isNewsListWidget: boolean;
    sectionTitle?: string;
    paginationSectionTitle?: string;
  };

export type BlockConfigPanelBulletListContentSectionProps = Pick<
  BlockConfigPanelSurfaceVisualProps,
  | "child"
  | "heroControlClass"
  | "heroColorTriggerClass"
  | "heroColorSwatchClass"
  | "heroColorInputClass"
  | "globalAccentTone"
  | "globalNewsTitleColor"
  | "globalHoverColor"
  | "getConfigString"
  | "getConfigValue"
  | "getConfigForApply"
  | "applyToAllDevices"
  | "updateChildResponsiveConfig"
  | "updateChildConfig"
  | "renderHeroTextSection"
  | "ColorPicker"
>;
