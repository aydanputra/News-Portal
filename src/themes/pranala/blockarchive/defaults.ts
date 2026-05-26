type BuilderBlock = {
  id: string;
  type: string;
  title: string;
  order: number;
  isVisible: boolean;
  placement?: string;
  config?: Record<string, unknown>;
};

export const DEFAULT_PRANALA_ARCHIVE_BLOCKS: BuilderBlock[] = [
  {
    id: "section_archive_header_1",
    type: "section",
    title: "Archive Header",
    order: 0,
    isVisible: true,
    placement: "main",
    config: {
      layout: "100",
      children: [
        {
          id: "archive_header_1",
          type: "archive_header",
          title: "Header Arsip",
          order: 0,
          isVisible: true,
          config: {
            columnIndex: 0,
            showDescription: true,
            showPostCount: true,
            textAlign: "left",
          },
        },
      ],
    },
  },
  {
    id: "section_archive_main_1",
    type: "section",
    title: "Archive Main",
    order: 1,
    isVisible: true,
    placement: "main",
    config: {
      layout: "66-33",
      children: [
        { id: "news_grid_archive_1", type: "news_grid", title: "Grid News", order: 1, isVisible: true, config: { columnIndex: 0, limit: 12, offset: 0, gridColumns: 3, tabletGridColumns: 2, mobileGridColumns: 1, showTitle: true, showCategory: true, showMetaInfo: true, showExcerpt: true, excerptLength: 22, useBox: false } },
        { id: "sidebar_widget_archive_1", type: "sidebar_widget", title: "Sidebar Widget", order: 1, isVisible: true, config: { columnIndex: 1, widgetType: "popular_posts", limit: 5 } }
      ]
    }
  },
  {
    id: "section_archive_footer_1",
    type: "section",
    title: "Archive Footer",
    order: 2,
    isVisible: true,
    placement: "main",
    config: {
      layout: "100",
      children: [
        { id: "archive_empty_state_1", type: "archive_empty_state", title: "Empty State Arsip", order: 1, isVisible: true, config: { columnIndex: 0 } },
        { id: "archive_pagination_1", type: "archive_pagination", title: "Pagination Arsip", order: 2, isVisible: true, config: { columnIndex: 0, showPrevNext: true, maxVisiblePages: 5 } }
      ]
    }
  }
];
