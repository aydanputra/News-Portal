export const UI = {
  // Layout & Backgrounds - Clean Minimal
  bg: {
    app: "bg-neutral-50",
    card: "bg-white border border-neutral-200",
    cardHover: "hover:shadow-sm hover:border-neutral-300 transition-all duration-150",
    subtle: "bg-neutral-100",
  },
  
  // Borders & Dividers - Minimal
  border: {
    default: "border border-neutral-200",
    divider: "divide-y divide-neutral-200",
    subtle: "border-neutral-100",
  },

  // Typography - Clean & Readable
  text: {
    h1: "text-2xl md:text-3xl font-semibold text-neutral-900 tracking-tight",
    sectionTitle: "text-lg font-semibold text-neutral-900",
    cardTitle: "text-base font-medium text-neutral-900",
    body: "text-sm text-neutral-600 leading-relaxed",
    meta: "text-xs text-neutral-500 font-medium",
    muted: "text-neutral-400",
    link: "text-blue-600 hover:text-blue-700 font-medium transition-colors",
  },

  // Interactive Elements - Minimal
  button: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-150",
    secondary: "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 font-medium transition-colors duration-150",
    ghost: "hover:bg-neutral-100 text-neutral-700 transition-colors duration-150",
    icon: "p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors duration-150",
  },

  // Navigation - Clean
  nav: {
    item: "flex items-center px-4 py-2.5 text-sm font-medium transition-colors duration-150",
    itemActive: "bg-neutral-100 text-neutral-900 border-l-2 border-blue-600",
    itemInactive: "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50",
    bottomBar: "bg-white border-t border-neutral-200",
  },

  // Lists & Tables - Clean
  list: {
    container: "bg-white border border-neutral-200 rounded-lg overflow-hidden",
    item: "px-6 py-4 hover:bg-neutral-50 transition-colors duration-150",
    header: "px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-500 uppercase tracking-wider",
  },

  // Status - Clean Colors
  status: {
    live: "bg-green-100 text-green-800 border border-green-200",
    draft: "bg-neutral-100 text-neutral-700 border border-neutral-200",
    review: "bg-amber-100 text-amber-700 border border-amber-200",
    scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
    rejected: "bg-red-100 text-red-700 border border-red-200",
  },

  // Spacing - Consistent
  spacing: {
    xs: "px-2 py-1",
    sm: "px-3 py-2",
    md: "px-4 py-3",
    lg: "px-6 py-4",
    xl: "px-8 py-6",
  },

  // Radius - Subtle
  radius: {
    sm: "rounded-md",
    md: "rounded-lg",
    lg: "rounded-xl",
    full: "rounded-full",
  },

  // Shadows - Subtle
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    none: "shadow-none",
  },
};

// Utility classes untuk layout yang sering digunakan
export const Layout = {
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  card: "bg-white border border-neutral-200 rounded-lg",
  section: "space-y-6",
  grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
  flex: {
    between: "flex items-center justify-between",
    center: "flex items-center justify-center",
    start: "flex items-center justify-start",
    end: "flex items-center justify-end",
    col: "flex flex-col",
    row: "flex flex-row items-center",
  },
};

// Animation utilities - minimal
export const Animation = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up",
  hover: "transition-all duration-150 ease-out",
  fast: "transition-all duration-100 ease-out",
  slow: "transition-all duration-200 ease-out",
};