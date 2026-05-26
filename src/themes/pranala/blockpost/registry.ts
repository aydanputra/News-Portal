import { AlignLeft, BarChart3, Image as ImageIcon, Layout, Link2, MessageCircle, Navigation, PanelTop, Rows3, Share2, Tags, Type, UserRound } from "lucide-react";

export type PostWidgetDefinition = {
  type: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  description?: string;
  desc: string;
  isSpecial?: boolean;
};

export const PRANALA_POST_WIDGET_GROUPS: { main: PostWidgetDefinition[]; support: PostWidgetDefinition[] } = {
  main: [
    { type: "post_breadcrumb", label: "Breadcrumb", icon: Link2, desc: "Navigasi posisi artikel." },
    { type: "post_title", label: "Judul Artikel", icon: Type, desc: "Judul utama artikel." },
    { type: "post_subtitle", label: "Subjudul", icon: AlignLeft, desc: "Subjudul atau lead artikel." },
    { type: "post_meta", label: "Meta Artikel", icon: Rows3, desc: "Penulis, tanggal, dan info meta." },
    { type: "post_featured_image", label: "Featured Image", icon: ImageIcon, desc: "Gambar utama artikel." },
    { type: "post_content", label: "Konten Artikel", icon: PanelTop, desc: "Isi utama artikel." },
  ],
  support: [
    { type: "post_tags", label: "Tag Artikel", icon: Tags, desc: "Daftar tag terkait." },
    { type: "post_share", label: "Tombol Share", icon: Share2, desc: "Bagikan artikel ke sosial media." },
    { type: "post_author_box", label: "Author Box", icon: UserRound, desc: "Profil singkat penulis." },
    { type: "post_stats", label: "Statistik Artikel", icon: BarChart3, desc: "Tampilkan jumlah pembaca dan komentar." },
    { type: "post_navigation", label: "Navigasi Post", icon: Navigation, desc: "Link artikel sebelumnya dan selanjutnya." },
    { type: "post_related_posts", label: "Related Posts", icon: Layout, desc: "Artikel terkait berdasarkan kategori atau tag." },
    { type: "post_comments", label: "Komentar", icon: MessageCircle, desc: "Area komentar pembaca." },
    { type: "sidebar_widget", label: "Sidebar Widget", icon: Rows3, desc: "Widget sidebar tambahan." },
    { type: "tag_cloud", label: "Tag Cloud", icon: Tags, desc: "Kumpulan tag populer." },
    { type: "ad_banner", label: "Iklan Banner", icon: Layout, desc: "Slot iklan pada halaman artikel." },
    { type: "section", label: "Inner Section", icon: Layout, desc: "Buat kolom tambahan di dalam kolom ini.", isSpecial: true },
  ]
};
