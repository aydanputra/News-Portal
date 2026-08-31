export const HEADER_BUILDER_CSS = `
  .hb-section { width: 100%; }
  .hb-sticky { position: sticky; top: var(--hb-sticky-top, 0px); z-index: var(--hb-sticky-z, 60); }
  .hb-inner {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
  }
  .hb-surface {
    width: 100%;
    box-sizing: border-box;
    background-color: var(--hb-desktop-bg-color, transparent);
    background-image: var(--hb-desktop-bg-image, none);
    background-size: var(--hb-desktop-bg-size, cover);
    background-position: center;
    background-repeat: no-repeat;
    padding-top: var(--hb-desktop-pad-top, 0px);
    padding-bottom: var(--hb-desktop-pad-bottom, 0px);
    padding-left: var(--hb-desktop-pad-left, 0px);
    padding-right: var(--hb-desktop-pad-right, 0px);
  }
  .hb-box-content {
    width: 100%;
    box-sizing: border-box;
    padding-top: var(--hb-desktop-box-py, 0px);
    padding-bottom: var(--hb-desktop-box-py, 0px);
    padding-left: var(--hb-desktop-box-px, 0px);
    padding-right: var(--hb-desktop-box-px, 0px);
  }
  .public-theme .hb-surface {
    border-style: var(--hb-desktop-border-style, none);
    border-color: var(--hb-desktop-border-color, transparent);
    border-top-width: var(--hb-desktop-border-top, 0px);
    border-right-width: var(--hb-desktop-border-right, 0px);
    border-bottom-width: var(--hb-desktop-border-bottom, 0px);
    border-left-width: var(--hb-desktop-border-left, 0px);
    box-shadow: var(--hb-desktop-shadow, none);
    border-radius: var(--hb-desktop-radius, 0px);
  }
  .hb-row { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; align-items: center; }
  .hb-logo { display: inline-flex; align-items: center; max-width: var(--hb-logo-maxw, none); }
  .hb-logo img { height: var(--hb-logo-h, 40px) !important; width: auto !important; max-width: 100% !important; object-fit: contain; }
  .hb-logo .hb-logo-text { font-size: var(--hb-logo-text, 28px); line-height: 1.1; }
  .hb-logo .hb-logo-dark { display: none !important; }
  html.public-dark .hb-logo .hb-logo-light { display: none !important; }
  html.public-dark .hb-logo .hb-logo-dark { display: block !important; }
  .hb-menu { --hb-menu-color: var(--hb-menu-desktop-color, var(--header-menu-color)); --hb-menu-hover: var(--hb-menu-desktop-hover, var(--accent)); --hb-menu-weight: var(--hb-menu-desktop-weight, 500); --hb-menu-font: var(--hb-menu-desktop-font, inherit); --hb-menu-size: var(--hb-menu-desktop-size, 12px); }
  .hb-menu-link { color: var(--hb-menu-color) !important; font-weight: var(--hb-menu-weight) !important; font-family: var(--hb-menu-font) !important; font-size: var(--hb-menu-size) !important; text-transform: uppercase; letter-spacing: 0.08em; transition: color 160ms ease; }
  .hb-menu-link:hover { color: var(--hb-menu-hover) !important; }
  .public-theme .hb-menu-link:hover { color: var(--hb-menu-hover) !important; }
  .hb-menu-panel { min-width: 14rem; overflow: hidden; border-radius: 0.75rem; border: 1px solid var(--border, #e5e7eb); background: var(--bg-elevated, #ffffff); box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12); }
  .hb-menu-sublink { color: var(--hb-menu-color) !important; font-weight: var(--hb-menu-weight) !important; font-family: var(--hb-menu-font) !important; font-size: var(--hb-menu-size) !important; transition: color 160ms ease, background-color 160ms ease; }
  .hb-menu-sublink:hover { color: var(--hb-menu-hover) !important; background: var(--bg-surface, #f9fafb); }
  .public-theme .hb-menu-sublink:hover { color: var(--hb-menu-hover) !important; }
  .hb-menu-chevron { color: inherit; }
  .hb-menu a { color: var(--hb-menu-color) !important; font-weight: var(--hb-menu-weight) !important; font-family: var(--hb-menu-font) !important; font-size: var(--hb-menu-size) !important; }
  .hb-menu a:hover { color: var(--hb-menu-hover) !important; }
  .public-theme .hb-menu a:hover { color: var(--hb-menu-hover) !important; }
  .hb-menu .font-light,
  .hb-menu .font-normal,
  .hb-menu .font-medium,
  .hb-menu .font-semibold,
  .hb-menu .font-bold,
  .hb-menu .font-extrabold { font-weight: var(--hb-menu-weight) !important; }
  .hb-menu .hover\\:text-indigo-600:hover { color: var(--hb-menu-hover) !important; }
  .hb-menu .hover\\:text-blue-600:hover { color: var(--hb-menu-hover) !important; }
  .public-theme .hb-menu .hover\\:text-indigo-600:hover { color: var(--hb-menu-hover) !important; }
  .public-theme .hb-menu .hover\\:text-blue-600:hover { color: var(--hb-menu-hover) !important; }
  .hb-menu .text-xs,
  .hb-menu .text-sm,
  .hb-menu .text-base { font-size: var(--hb-menu-size) !important; }
  .hb-search { --hb-search-color: var(--hb-search-desktop-color, var(--muted-text, var(--home-meta-color, #9ca3af))); --hb-search-hover: var(--hb-search-desktop-hover, var(--accent)); --hb-search-icon: var(--hb-search-desktop-icon, 20px); --hb-search-input-color: var(--hb-search-desktop-input, var(--home-news-title-color, #111827)); --hb-search-bg: var(--hb-search-desktop-bg, var(--bg-elevated, #ffffff)); --hb-search-border: var(--hb-search-desktop-border, var(--border, #e5e7eb)); --hb-search-radius: var(--hb-search-desktop-radius, 999px); --hb-search-height: var(--hb-search-desktop-height, 38px); --hb-search-font: var(--hb-search-desktop-font, 14px); --hb-search-button-bg: var(--hb-search-desktop-btnbg, var(--bg-elevated, #ffffff)); --hb-search-button-text: var(--hb-search-desktop-btntxt, #111827); }
  .hb-search-btn,
  .hb-search .hb-search-btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px; border: 0; background: transparent; cursor: pointer; border-radius: 10px; color: var(--hb-search-color, var(--muted-text, var(--home-meta-color, #9ca3af))) !important; }
  .hb-search-btn:hover,
  .hb-search .hb-search-btn:hover { color: var(--hb-search-hover, var(--accent)) !important; }
  .public-theme .hb-search-btn:hover,
  .public-theme .hb-search .hb-search-btn:hover { color: var(--hb-search-hover, var(--accent)) !important; }
  .hb-search-btn svg,
  .hb-search svg { width: var(--hb-search-icon, 20px) !important; height: var(--hb-search-icon, 20px) !important; }
  .hb-searchbar { width: 100%; }
  .hb-searchbar-box { width: 100%; display: flex; align-items: center; height: var(--hb-search-height); border: 1px solid var(--hb-search-border, var(--border, #e5e7eb)); border-radius: var(--hb-search-radius); background: var(--hb-search-bg, var(--bg-elevated, #ffffff)); overflow: hidden; }
  .hb-searchbar-icon { display: inline-flex; align-items: center; justify-content: center; padding-left: 12px; padding-right: 6px; color: var(--hb-search-color, var(--muted-text, var(--home-meta-color, #9ca3af))); }
  .hb-searchbar-input { flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent; color: var(--hb-search-input-color, var(--hb-search-color, #111827)); -webkit-text-fill-color: var(--hb-search-input-color, var(--hb-search-color, #111827)); caret-color: var(--hb-search-hover, var(--accent)); font-size: var(--hb-search-font); padding: 0 10px 0 0; }
  .hb-searchbar-input::placeholder { color: color-mix(in srgb, var(--hb-search-input-color, var(--hb-search-color, #111827)) 55%, transparent); }
  .hb-searchbar-button { height: 100%; border: 0; outline: none; background: var(--hb-search-button-bg, var(--bg-elevated, #ffffff)); color: var(--hb-search-button-text); font-size: var(--hb-search-font); padding: 0 14px; border-left: 1px solid var(--hb-search-border, var(--border, #e5e7eb)); }
  .hb-searchbar-button:hover { color: var(--hb-search-hover); }
  .hb-theme { --hb-theme-color: var(--hb-theme-desktop-color, #6b7280); --hb-theme-hover: var(--hb-theme-desktop-hover, var(--accent)); --hb-theme-icon: var(--hb-theme-desktop-icon, 20px); }
  .hb-theme .hb-theme-btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px; border: 0; background: transparent; cursor: pointer; border-radius: 10px; color: var(--hb-theme-color) !important; }
  .hb-theme .hb-theme-btn:hover { color: var(--hb-theme-hover) !important; }
  .public-theme .hb-theme .hb-theme-btn:hover { color: var(--hb-theme-hover) !important; }
  .hb-theme svg { width: var(--hb-theme-icon) !important; height: var(--hb-theme-icon) !important; }
  .hb-login-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--hb-login-py, 10px) var(--hb-login-px, 20px);
    border-radius: var(--hb-login-radius, 9999px);
    background: var(--hb-login-bg, var(--accent, #2563eb));
    color: var(--hb-login-text, #ffffff) !important;
    font-size: var(--hb-login-font, 14px);
    font-weight: 600;
    line-height: 1;
    text-decoration: none;
    transition: background-color 160ms ease, color 160ms ease, opacity 160ms ease;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.08);
  }
  .hb-login-link:hover {
    background: var(--hb-login-hover-bg, var(--accent-hover, var(--home-hover-color, var(--accent, #2563eb))));
  }
  .hb-mobile-toggle { --hb-mt-color: var(--hb-mt-desktop-color, #6b7280); --hb-mt-hover: var(--hb-mt-desktop-hover, var(--accent)); --hb-mt-icon: var(--hb-mt-desktop-icon, 24px); --hb-mt-bg: var(--hb-mt-desktop-bg, transparent); --hb-mt-bghover: var(--hb-mt-desktop-bghover, transparent); --hb-mt-radius: var(--hb-mt-desktop-radius, 10px); --hb-mt-pad: var(--hb-mt-desktop-pad, 8px); }
  .hb-mobile-toggle .hb-mt-btn { display: inline-flex; align-items: center; justify-content: center; padding: var(--hb-mt-pad) !important; border: 0; background: var(--hb-mt-bg) !important; cursor: pointer; border-radius: var(--hb-mt-radius) !important; color: var(--hb-mt-color) !important; }
  .hb-mobile-toggle .hb-mt-btn:hover { color: var(--hb-mt-hover) !important; background: var(--hb-mt-bghover) !important; }
  .public-theme .hb-mobile-toggle .hb-mt-btn:hover { color: var(--hb-mt-hover) !important; background: var(--hb-mt-bghover) !important; }
  .hb-mobile-toggle .hb-mt-btn svg { color: inherit !important; }
  .hb-mobile-toggle svg { width: var(--hb-mt-icon) !important; height: var(--hb-mt-icon) !important; }
  .hb-drawer { position: fixed; inset: 0; z-index: 100; }
  .hb-drawer-overlay { position: absolute; inset: 0; border: 0; background: var(--hb-drawer-overlay-color, #000); opacity: 0; transition: opacity var(--hb-drawer-duration, 240ms) var(--hb-drawer-ease, cubic-bezier(0.22, 1, 0.36, 1)); }
  .hb-drawer-open .hb-drawer-overlay { opacity: var(--hb-drawer-overlay-opacity, 0.3); }
  .hb-drawer-panel { position: absolute; top: 0; bottom: 0; width: var(--hb-drawer-width, 85%); max-width: var(--hb-drawer-maxw, 420px); background: var(--hb-drawer-bg, #fff); color: var(--hb-drawer-text, #111827); box-shadow: 0 10px 25px rgba(0,0,0,0.18); display: flex; flex-direction: column; will-change: transform, opacity; backface-visibility: hidden; transform: translateZ(0); transition: transform var(--hb-drawer-duration, 240ms) var(--hb-drawer-ease, cubic-bezier(0.22, 1, 0.36, 1)), opacity var(--hb-drawer-duration, 240ms) var(--hb-drawer-ease, cubic-bezier(0.22, 1, 0.36, 1)); }
  html.public-dark .hb-drawer {
    --hb-drawer-bg: var(--bg-elevated, #1e293b) !important;
    --hb-drawer-text: #f8fafc !important;
    --hb-drawer-link: #f8fafc !important;
    --hb-drawer-link-hover: #f8fafc !important;
    --hb-drawer-divider: var(--border, #334155) !important;
    --hb-drawer-social-color: #f8fafc !important;
    --hb-drawer-social-hover: #f8fafc !important;
  }
  html.public-dark .hb-drawer-panel { box-shadow: 0 18px 46px rgba(0, 0, 0, 0.5); }
  .hb-drawer-top { height: 64px; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--hb-drawer-divider, #f3f4f6); }
  .hb-drawer-top-left { flex: 1; min-width: 0; display: flex; align-items: center; }
  .hb-drawer-brand { display: inline-flex; align-items: center; gap: 10px; min-width: 0; text-decoration: none; color: var(--hb-drawer-link, #111827) !important; font-weight: 800; }
  .hb-drawer-brand:hover { color: var(--hb-drawer-link-hover, #111827) !important; }
  .hb-drawer-brand-logo { display: inline-flex; align-items: center; max-width: 180px; }
  .hb-drawer-brand-logo img { width: auto !important; height: 34px !important; object-fit: contain; }
  .hb-drawer-brand-text { font-size: 15px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hb-drawer-search { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; }
  .hb-drawer-search-input { flex: 1; min-width: 0; height: 38px; border-radius: 12px; border: 1px solid var(--hb-drawer-divider, #f3f4f6); background: var(--hb-drawer-bg, #fff); padding: 0 12px; font-size: 13px; color: var(--hb-drawer-text, #111827); -webkit-text-fill-color: var(--hb-drawer-text, #111827); caret-color: var(--hb-drawer-link-hover, var(--accent)); outline: none; }
  .hb-drawer-search-input::placeholder { color: color-mix(in srgb, var(--hb-drawer-text, #111827) 55%, transparent); opacity: 1; }
  .hb-drawer-search-input:focus { border-color: var(--hb-drawer-link-hover, var(--accent)); }
  .hb-drawer-search-btn { height: 38px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--hb-drawer-divider, #f3f4f6); background: var(--hb-drawer-bg, #fff); color: var(--hb-drawer-link, #111827) !important; font-size: 13px; font-weight: 700; cursor: pointer; }
  .hb-drawer-search-btn:hover { color: var(--hb-drawer-link-hover, #111827) !important; border-color: var(--hb-drawer-link-hover, #111827); }
  .hb-drawer-close { display: inline-flex; align-items: center; justify-content: center; border: 0; background: transparent; cursor: pointer; padding: 8px; border-radius: 12px; color: var(--hb-drawer-text, #111827) !important; }
  .hb-drawer-close:hover { color: var(--hb-drawer-link-hover, #111827) !important; }
  .hb-drawer-body { flex: 1; overflow: auto; padding: 4px 0; -webkit-overflow-scrolling: touch; }
  .hb-drawer-item { border-bottom: 1px solid var(--hb-drawer-divider, #f3f4f6); }
  .hb-drawer-item-row { display: flex; align-items: center; justify-content: space-between; }
  .hb-drawer-link {
    flex: 1;
    padding: 12px 16px;
    font-size: var(--hb-drawer-menu-font-size, 14px);
    line-height: var(--hb-drawer-menu-line-height, 1.45);
    font-weight: var(--hb-drawer-menu-font-weight, 500);
    font-family: var(--hb-drawer-menu-font-family, inherit);
    font-synthesis: var(--font-heading-synthesis, var(--font-body-synthesis, none));
    color: var(--hb-drawer-link, #111827) !important;
    text-decoration: none;
  }
  .hb-drawer-link:hover { color: var(--hb-drawer-link-hover, #111827) !important; }
  .hb-drawer-expand { padding: 12px 16px; border: 0; background: transparent; cursor: pointer; color: var(--hb-drawer-text, #111827) !important; }
  .hb-drawer-sub { padding: 0 0 10px; }
  .hb-drawer-sublink {
    display: block;
    padding: 8px 20px;
    font-size: calc(var(--hb-drawer-menu-font-size, 14px) - 1px);
    line-height: var(--hb-drawer-menu-line-height, 1.45);
    font-weight: var(--hb-drawer-menu-font-weight, 500);
    font-family: var(--hb-drawer-menu-font-family, inherit);
    font-synthesis: var(--font-heading-synthesis, var(--font-body-synthesis, none));
    color: var(--hb-drawer-link, #111827) !important;
    opacity: 0.78;
    text-decoration: none;
  }
  .hb-drawer-sublink:hover { color: var(--hb-drawer-link-hover, #111827) !important; }
  .hb-drawer-footer { padding: 14px 16px 16px; border-top: 1px solid var(--hb-drawer-divider, #f3f4f6); }
  .hb-drawer-footer-text { white-space: pre-line; font-size: 12px; color: var(--hb-drawer-text, #111827); opacity: 0.75; margin-top: 10px; }
  .hb-drawer-social { display: flex; gap: 8px; flex-wrap: wrap; }
  .hb-drawer-social-link { width: 38px; height: 38px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: var(--hb-drawer-social-color, #111827) !important; text-decoration: none; border: 1px solid var(--hb-drawer-divider, #f3f4f6); background: var(--hb-drawer-bg, #fff); }
  .hb-drawer-social-link:hover { color: var(--hb-drawer-social-hover, #111827) !important; border-color: var(--hb-drawer-social-hover, #111827); }
  .hb-drawer-social-link svg { width: var(--hb-drawer-social-size, 20px); height: var(--hb-drawer-social-size, 20px); }
  html.public-dark .hb-drawer-search-btn,
  html.public-dark .hb-drawer-social-link,
  html.public-dark .hb-drawer-search-input { background: color-mix(in srgb, var(--hb-drawer-bg, #111827) 88%, white 12%); }
  .hb-drawer-side-left .hb-drawer-panel { left: 0; }
  .hb-drawer-side-right .hb-drawer-panel { right: 0; }
  .hb-drawer-effect-slide.hb-drawer-side-left .hb-drawer-panel { transform: translate3d(-100%, 0, 0); }
  .hb-drawer-effect-slide.hb-drawer-side-right .hb-drawer-panel { transform: translate3d(100%, 0, 0); }
  .hb-drawer-effect-slide.hb-drawer-open .hb-drawer-panel { transform: translate3d(0, 0, 0); }
  .hb-drawer-effect-fade .hb-drawer-panel { opacity: 0; transform: translateX(0); }
  .hb-drawer-effect-fade.hb-drawer-open .hb-drawer-panel { opacity: 1; }
  @media (prefers-reduced-motion: reduce) {
    .hb-drawer-overlay,
    .hb-drawer-panel { transition: none !important; }
  }
  .hb-ad { width: 100%; max-width: var(--hb-ad-maxw, 100%); }
  .hb-ad > div { width: 100%; }
  @media (max-width: 767px) {
    .hb-inner {
      max-width: var(--hb-mobile-max, 100%);
    }
    .hb-surface {
      background-color: var(--hb-mobile-bg-color, var(--hb-desktop-bg-color, transparent));
      background-image: var(--hb-mobile-bg-image, var(--hb-desktop-bg-image, none));
      background-size: var(--hb-mobile-bg-size, var(--hb-desktop-bg-size, cover));
      padding-top: var(--hb-mobile-pad-top, var(--hb-desktop-pad-top, 0px));
      padding-bottom: var(--hb-mobile-pad-bottom, var(--hb-desktop-pad-bottom, 0px));
      padding-left: var(--hb-mobile-pad-left, var(--hb-desktop-pad-left, 0px));
      padding-right: var(--hb-mobile-pad-right, var(--hb-desktop-pad-right, 0px));
    }
    .hb-box-content {
      padding-top: var(--hb-mobile-box-py, var(--hb-desktop-box-py, 0px));
      padding-bottom: var(--hb-mobile-box-py, var(--hb-desktop-box-py, 0px));
      padding-left: var(--hb-mobile-box-px, var(--hb-desktop-box-px, 0px));
      padding-right: var(--hb-mobile-box-px, var(--hb-desktop-box-px, 0px));
    }
    .public-theme .hb-surface {
      border-style: var(--hb-mobile-border-style, var(--hb-desktop-border-style, none));
      border-color: var(--hb-mobile-border-color, var(--hb-desktop-border-color, transparent));
      border-top-width: var(--hb-mobile-border-top, var(--hb-desktop-border-top, 0px));
      border-right-width: var(--hb-mobile-border-right, var(--hb-desktop-border-right, 0px));
      border-bottom-width: var(--hb-mobile-border-bottom, var(--hb-desktop-border-bottom, 0px));
      border-left-width: var(--hb-mobile-border-left, var(--hb-desktop-border-left, 0px));
      box-shadow: var(--hb-mobile-shadow, var(--hb-desktop-shadow, none));
      border-radius: var(--hb-mobile-radius, var(--hb-desktop-radius, 0px));
    }
    .hb-row { align-items: flex-start; }
    .hb-logo { --hb-logo-h: var(--hb-logo-mobile-h, var(--hb-logo-desktop-h, 40px)); --hb-logo-maxw: var(--hb-logo-mobile-maxw, var(--hb-logo-desktop-maxw, none)); --hb-logo-text: var(--hb-logo-mobile-text, var(--hb-logo-desktop-text, 28px)); }
    .hb-menu { --hb-menu-color: var(--hb-menu-mobile-color, var(--hb-menu-desktop-color, var(--header-menu-color))); --hb-menu-hover: var(--hb-menu-mobile-hover, var(--hb-menu-desktop-hover, var(--accent))); --hb-menu-weight: var(--hb-menu-mobile-weight, var(--hb-menu-desktop-weight, 500)); --hb-menu-font: var(--hb-menu-mobile-font, var(--hb-menu-desktop-font, inherit)); --hb-menu-size: var(--hb-menu-mobile-size, var(--hb-menu-desktop-size, 12px)); }
    .hb-search { --hb-search-color: var(--hb-search-mobile-color, var(--hb-search-desktop-color, var(--muted-text, var(--home-meta-color, #9ca3af)))); --hb-search-hover: var(--hb-search-mobile-hover, var(--hb-search-desktop-hover, var(--accent))); --hb-search-icon: var(--hb-search-mobile-icon, var(--hb-search-desktop-icon, 20px)); --hb-search-input-color: var(--hb-search-mobile-input, var(--hb-search-desktop-input, var(--home-news-title-color, #111827))); --hb-search-bg: var(--hb-search-mobile-bg, var(--hb-search-desktop-bg, var(--bg-elevated, #ffffff))); --hb-search-border: var(--hb-search-mobile-border, var(--hb-search-desktop-border, var(--border, #e5e7eb))); --hb-search-radius: var(--hb-search-mobile-radius, var(--hb-search-desktop-radius, 999px)); --hb-search-height: var(--hb-search-mobile-height, var(--hb-search-desktop-height, 38px)); --hb-search-font: var(--hb-search-mobile-font, var(--hb-search-desktop-font, 14px)); --hb-search-button-bg: var(--hb-search-mobile-btnbg, var(--hb-search-desktop-btnbg, var(--bg-elevated, #ffffff))); --hb-search-button-text: var(--hb-search-mobile-btntxt, var(--hb-search-desktop-btntxt, #111827)); }
    .hb-theme { --hb-theme-color: var(--hb-theme-mobile-color, var(--hb-theme-desktop-color, #6b7280)); --hb-theme-hover: var(--hb-theme-mobile-hover, var(--hb-theme-desktop-hover, var(--accent))); --hb-theme-icon: var(--hb-theme-mobile-icon, var(--hb-theme-desktop-icon, 20px)); }
    .hb-mobile-toggle { --hb-mt-color: var(--hb-mt-mobile-color, var(--hb-mt-desktop-color, #6b7280)); --hb-mt-hover: var(--hb-mt-mobile-hover, var(--hb-mt-desktop-hover, var(--accent))); --hb-mt-icon: var(--hb-mt-mobile-icon, var(--hb-mt-desktop-icon, 24px)); --hb-mt-bg: var(--hb-mt-mobile-bg, var(--hb-mt-desktop-bg, transparent)); --hb-mt-bghover: var(--hb-mt-mobile-bghover, var(--hb-mt-desktop-bghover, transparent)); --hb-mt-radius: var(--hb-mt-mobile-radius, var(--hb-mt-desktop-radius, 10px)); --hb-mt-pad: var(--hb-mt-mobile-pad, var(--hb-mt-desktop-pad, 8px)); }
    .hb-ad { --hb-ad-maxw: var(--hb-ad-mobile-maxw, var(--hb-ad-desktop-maxw, 100%)); }
    .hide-mobile-widget { display: none !important; }
  }
  @media (min-width: 768px) and (max-width: 1024px) {
    .hb-inner {
      max-width: var(--hb-tablet-max, 100%);
    }
    .hb-surface {
      background-color: var(--hb-tablet-bg-color, var(--hb-desktop-bg-color, transparent));
      background-image: var(--hb-tablet-bg-image, var(--hb-desktop-bg-image, none));
      background-size: var(--hb-tablet-bg-size, var(--hb-desktop-bg-size, cover));
      padding-top: var(--hb-tablet-pad-top, var(--hb-desktop-pad-top, 0px));
      padding-bottom: var(--hb-tablet-pad-bottom, var(--hb-desktop-pad-bottom, 0px));
      padding-left: var(--hb-tablet-pad-left, var(--hb-desktop-pad-left, 0px));
      padding-right: var(--hb-tablet-pad-right, var(--hb-desktop-pad-right, 0px));
    }
    .hb-box-content {
      padding-top: var(--hb-tablet-box-py, var(--hb-desktop-box-py, 0px));
      padding-bottom: var(--hb-tablet-box-py, var(--hb-desktop-box-py, 0px));
      padding-left: var(--hb-tablet-box-px, var(--hb-desktop-box-px, 0px));
      padding-right: var(--hb-tablet-box-px, var(--hb-desktop-box-px, 0px));
    }
    .public-theme .hb-surface {
      border-style: var(--hb-tablet-border-style, var(--hb-desktop-border-style, none));
      border-color: var(--hb-tablet-border-color, var(--hb-desktop-border-color, transparent));
      border-top-width: var(--hb-tablet-border-top, var(--hb-desktop-border-top, 0px));
      border-right-width: var(--hb-tablet-border-right, var(--hb-desktop-border-right, 0px));
      border-bottom-width: var(--hb-tablet-border-bottom, var(--hb-desktop-border-bottom, 0px));
      border-left-width: var(--hb-tablet-border-left, var(--hb-desktop-border-left, 0px));
      box-shadow: var(--hb-tablet-shadow, var(--hb-desktop-shadow, none));
      border-radius: var(--hb-tablet-radius, var(--hb-desktop-radius, 0px));
    }
    .hb-row { align-items: flex-start; }
    .hb-logo { --hb-logo-h: var(--hb-logo-tablet-h, var(--hb-logo-desktop-h, 40px)); --hb-logo-maxw: var(--hb-logo-tablet-maxw, var(--hb-logo-desktop-maxw, none)); --hb-logo-text: var(--hb-logo-tablet-text, var(--hb-logo-desktop-text, 28px)); }
    .hb-menu { --hb-menu-color: var(--hb-menu-tablet-color, var(--hb-menu-desktop-color, var(--header-menu-color))); --hb-menu-hover: var(--hb-menu-tablet-hover, var(--hb-menu-desktop-hover, var(--accent))); --hb-menu-weight: var(--hb-menu-tablet-weight, var(--hb-menu-desktop-weight, 500)); --hb-menu-font: var(--hb-menu-tablet-font, var(--hb-menu-desktop-font, inherit)); --hb-menu-size: var(--hb-menu-tablet-size, var(--hb-menu-desktop-size, 12px)); }
    .hb-search { --hb-search-color: var(--hb-search-tablet-color, var(--hb-search-desktop-color, var(--muted-text, var(--home-meta-color, #9ca3af)))); --hb-search-hover: var(--hb-search-tablet-hover, var(--hb-search-desktop-hover, var(--accent))); --hb-search-icon: var(--hb-search-tablet-icon, var(--hb-search-desktop-icon, 20px)); --hb-search-input-color: var(--hb-search-tablet-input, var(--hb-search-desktop-input, var(--home-news-title-color, #111827))); --hb-search-bg: var(--hb-search-tablet-bg, var(--hb-search-desktop-bg, var(--bg-elevated, #ffffff))); --hb-search-border: var(--hb-search-tablet-border, var(--hb-search-desktop-border, var(--border, #e5e7eb))); --hb-search-radius: var(--hb-search-tablet-radius, var(--hb-search-desktop-radius, 999px)); --hb-search-height: var(--hb-search-tablet-height, var(--hb-search-desktop-height, 38px)); --hb-search-font: var(--hb-search-tablet-font, var(--hb-search-desktop-font, 14px)); --hb-search-button-bg: var(--hb-search-tablet-btnbg, var(--hb-search-desktop-btnbg, var(--bg-elevated, #ffffff))); --hb-search-button-text: var(--hb-search-tablet-btntxt, var(--hb-search-desktop-btntxt, #111827)); }
    .hb-theme { --hb-theme-color: var(--hb-theme-tablet-color, var(--hb-theme-desktop-color, #6b7280)); --hb-theme-hover: var(--hb-theme-tablet-hover, var(--hb-theme-desktop-hover, var(--accent))); --hb-theme-icon: var(--hb-theme-tablet-icon, var(--hb-theme-desktop-icon, 20px)); }
    .hb-mobile-toggle { --hb-mt-color: var(--hb-mt-tablet-color, var(--hb-mt-desktop-color, #6b7280)); --hb-mt-hover: var(--hb-mt-tablet-hover, var(--hb-mt-desktop-hover, var(--accent))); --hb-mt-icon: var(--hb-mt-tablet-icon, var(--hb-mt-desktop-icon, 24px)); --hb-mt-bg: var(--hb-mt-tablet-bg, var(--hb-mt-desktop-bg, transparent)); --hb-mt-bghover: var(--hb-mt-tablet-bghover, var(--hb-mt-desktop-bghover, transparent)); --hb-mt-radius: var(--hb-mt-tablet-radius, var(--hb-mt-desktop-radius, 10px)); --hb-mt-pad: var(--hb-mt-tablet-pad, var(--hb-mt-desktop-pad, 8px)); }
    .hb-ad { --hb-ad-maxw: var(--hb-ad-tablet-maxw, var(--hb-ad-desktop-maxw, 100%)); }
    .hide-tablet-widget { display: none !important; }
  }
  @media (min-width: 1025px) {
    .hb-inner {
      max-width: var(--hb-desktop-max, 100%);
    }
    .hb-surface {
      background-color: var(--hb-desktop-bg-color, transparent);
      background-image: var(--hb-desktop-bg-image, none);
      background-size: var(--hb-desktop-bg-size, cover);
      padding-top: var(--hb-desktop-pad-top, 0px);
      padding-bottom: var(--hb-desktop-pad-bottom, 0px);
      padding-left: var(--hb-desktop-pad-left, 0px);
      padding-right: var(--hb-desktop-pad-right, 0px);
    }
    .hb-logo { --hb-logo-h: var(--hb-logo-desktop-h, 40px); --hb-logo-maxw: var(--hb-logo-desktop-maxw, none); --hb-logo-text: var(--hb-logo-desktop-text, 28px); }
    .hb-ad { --hb-ad-maxw: var(--hb-ad-desktop-maxw, 100%); }
    .hide-desktop-widget { display: none !important; }
  }
`;
