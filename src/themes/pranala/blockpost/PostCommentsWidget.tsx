import React, { useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircleMore, Reply, Send, X } from "lucide-react";
import { WidgetRenderContext } from "./types";
import { toPx } from "./helpers";

type CommentItem = {
  id: string;
  name: string;
  email?: string;
  website?: string | null;
  content: string;
  parentId?: string | null;
  createdAt?: string;
  replies?: CommentItem[];
};

const COMMENT_AUTHOR_CACHE_KEY = "pranala-comment-author-cache";
const COMMENT_AUTHOR_CACHE_TTL = 12 * 60 * 60 * 1000;

const MOCK_COMMENTS: CommentItem[] = [
  {
    id: "comment-1",
    name: "Rina Putri",
    website: "https://example.com",
    content: "Artikel ini sangat membantu. Penjelasannya jelas dan alurnya enak diikuti.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  },
  {
    id: "comment-2",
    name: "Fajar Adi",
    content: "Setuju, terutama bagian penutupnya. Akan bagus kalau ada update lanjutan untuk topik ini.",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    replies: [
      {
        id: "comment-2-1",
        name: "Admin",
        content: "Terima kasih, masukan ini akan kami pertimbangkan untuk artikel berikutnya.",
        parentId: "comment-2",
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
      }
    ]
  }
];

const buildCommentTree = (items: CommentItem[]) => {
  const map = new Map<string, CommentItem>();
  const roots: CommentItem[] = [];

  items.forEach((item) => {
    map.set(item.id, { ...item, replies: [] });
  });

  map.forEach((item) => {
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)?.replies?.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
};

const formatCommentDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

export default function PostCommentsWidget({
  widget,
  post,
  headingColor,
  metaColor,
  contentColor,
  accentColor,
  hoverColor,
  preview,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool,
  isPublicDarkMode
}: WidgetRenderContext) {
  const titleText = widget?.title || "Komentar";
  const showTitle = getConfigBool("showTitle", true);
  const showCommentCount = getConfigBool("showCommentCount", true);
  const showCommentForm = getConfigBool("showCommentForm", true);
  const showCommentDate = getConfigBool("showCommentDate", true);
  const showWebsiteField = getConfigBool("showWebsiteField", true);
  const allowReplies = getConfigBool("allowReplies", true);
  const commentSortValue = getResponsiveConfig("commentSort");
  const commentSort = commentSortValue === "latest" ? "latest" : "oldest";
  const initialCommentsLimitValue = Number(getResponsiveConfig("initialCommentsLimit"));
  const initialCommentsLimit = Number.isFinite(initialCommentsLimitValue) && initialCommentsLimitValue > 0 ? initialCommentsLimitValue : 3;
  const loadMoreStepValue = Number(getResponsiveConfig("loadMoreStep"));
  const loadMoreStep = Number.isFinite(loadMoreStepValue) && loadMoreStepValue > 0 ? loadMoreStepValue : 3;
  const formTitleTextRaw = getResponsiveConfig("commentFormTitle");
  const submitButtonTextRaw = getResponsiveConfig("submitButtonText");
  const emptyCommentsTextRaw = getResponsiveConfig("emptyCommentsText");
  const commentPlaceholderRaw = getResponsiveConfig("commentPlaceholder");
  const loadMoreButtonTextRaw = getResponsiveConfig("loadMoreButtonText");
  const formTitleText = typeof formTitleTextRaw === "string" && formTitleTextRaw.trim() !== "" ? formTitleTextRaw.trim() : "Tinggalkan Komentar";
  const submitButtonText = typeof submitButtonTextRaw === "string" && submitButtonTextRaw.trim() !== "" ? submitButtonTextRaw.trim() : "Kirim Komentar";
  const emptyCommentsText = typeof emptyCommentsTextRaw === "string" && emptyCommentsTextRaw.trim() !== "" ? emptyCommentsTextRaw.trim() : "Belum ada komentar. Jadilah yang pertama mengirim komentar.";
  const commentPlaceholder = typeof commentPlaceholderRaw === "string" && commentPlaceholderRaw.trim() !== "" ? commentPlaceholderRaw.trim() : "Tulis komentar Anda di sini...";
  const loadMoreButtonText = typeof loadMoreButtonTextRaw === "string" && loadMoreButtonTextRaw.trim() !== "" ? loadMoreButtonTextRaw.trim() : "Muat lebih banyak";
  const blockTitleColor = (getResponsiveConfig("blockTitleColor") as string) || "var(--home-widget-title-color, inherit)";
  const blockTitleBorderColor = (getResponsiveConfig("blockTitleBorderColor") as string) || accentColor;
  const blockTitleFontSize = toPx(getResponsiveConfig("blockTitleFontSize")) || "var(--home-widget-title-size, 1.25rem)";
  const blockTitleLineHeight = typeof getResponsiveConfig("blockTitleLineHeight") === "number" ? getResponsiveConfig("blockTitleLineHeight") as number : undefined;
  const authorColor = (getResponsiveConfig("commentAuthorColor") as string) || (isPublicDarkMode ? "var(--fg-primary)" : headingColor);
  const commentMetaTextColor = (getResponsiveConfig("commentMetaColor") as string) || (isPublicDarkMode ? "var(--fg-secondary)" : metaColor);
  const commentBodyColor = (getResponsiveConfig("commentTextColor") as string) || (isPublicDarkMode ? "var(--fg-primary)" : contentColor);
  const commentCardColor = (getResponsiveConfig("commentCardColor") as string) || (isPublicDarkMode ? "rgba(15, 23, 42, 0.42)" : "var(--bg-surface)");
  const commentBorderColor = (getResponsiveConfig("commentBorderColor") as string) || (isPublicDarkMode ? "rgba(148, 163, 184, 0.2)" : "var(--border)");
  const inputBgColor = (getResponsiveConfig("inputBgColor") as string) || (isPublicDarkMode ? "rgba(15, 23, 42, 0.58)" : "var(--bg-base)");
  const inputBorderColor = (getResponsiveConfig("inputBorderColor") as string) || (isPublicDarkMode ? "rgba(148, 163, 184, 0.24)" : "var(--border)");
  const buttonBgColor = (getResponsiveConfig("buttonBgColor") as string) || accentColor;
  const buttonTextColor = (getResponsiveConfig("buttonTextColor") as string) || "#ffffff";
  const helperTextColor = (getResponsiveConfig("helperTextColor") as string) || (isPublicDarkMode ? "var(--fg-secondary)" : metaColor);
  const replyLinkColor = (getResponsiveConfig("replyLinkColor") as string) || hoverColor || accentColor;
  const formTextColor = isPublicDarkMode ? "var(--fg-primary)" : contentColor;

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(!preview);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(initialCommentsLimit);
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    content: ""
  });

  useEffect(() => {
    if (preview || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(COMMENT_AUTHOR_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { name?: string; email?: string; savedAt?: number };
      if (!parsed?.savedAt || Date.now() - parsed.savedAt > COMMENT_AUTHOR_CACHE_TTL) {
        window.localStorage.removeItem(COMMENT_AUTHOR_CACHE_KEY);
        return;
      }
      setForm((prev) => ({
        ...prev,
        name: typeof parsed.name === "string" ? parsed.name : prev.name,
        email: typeof parsed.email === "string" ? parsed.email : prev.email
      }));
    } catch {
      window.localStorage.removeItem(COMMENT_AUTHOR_CACHE_KEY);
    }
  }, [preview]);

  useEffect(() => {
    if (preview) {
      setComments(MOCK_COMMENTS);
      setIsLoading(false);
      return;
    }
    if (!post?.id) {
      setComments([]);
      setIsLoading(false);
      return;
    }

    let ignore = false;
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts/${post.id}/comments`, { cache: "no-store" });
        if (!response.ok) throw new Error("Gagal memuat komentar");
        const data = await response.json();
        if (!ignore) setComments(Array.isArray(data) ? data : []);
      } catch {
        if (!ignore) setMessage("Komentar belum dapat dimuat.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchComments();
    return () => {
      ignore = true;
    };
  }, [preview, post?.id]);

  useEffect(() => {
    setVisibleCount(initialCommentsLimit);
  }, [initialCommentsLimit, comments.length]);

  useEffect(() => {
    if (preview || typeof window === "undefined") return;
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) return;
    window.localStorage.setItem(COMMENT_AUTHOR_CACHE_KEY, JSON.stringify({
      name,
      email,
      savedAt: Date.now()
    }));
  }, [form.name, form.email, preview]);

  const threadedComments = useMemo(() => {
    const compare = (a: CommentItem, b: CommentItem) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return commentSort === "latest" ? bTime - aTime : aTime - bTime;
    };
    const sortTree = (items: CommentItem[]): CommentItem[] =>
      [...items]
        .sort(compare)
        .map((item) => ({
          ...item,
          replies: sortTree(item.replies || [])
        }));
    return sortTree(buildCommentTree(comments));
  }, [comments, commentSort]);
  const totalComments = comments.length;
  const visibleComments = threadedComments.slice(0, visibleCount);
  const canLoadMore = threadedComments.length > visibleCount;

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (preview) return;
    setSubmitState("submitting");
    setMessage("");

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          parentId: replyTo?.id || null
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Gagal mengirim komentar");
      }

      setComments((prev) => [...prev, data]);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(COMMENT_AUTHOR_CACHE_KEY, JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          savedAt: Date.now()
        }));
      }
      setForm((prev) => ({ ...prev, website: "", content: "" }));
      setReplyTo(null);
      setSubmitState("success");
      setMessage("Komentar berhasil dikirim.");
      setVisibleCount((prev) => Math.max(prev, initialCommentsLimit));
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "Gagal mengirim komentar.");
    }
  };

  const renderComment = (comment: CommentItem, depth = 0) => {
    const dateText = formatCommentDate(comment.createdAt);
    const commentInitial = (comment.name || "U").charAt(0).toUpperCase();
    const hasReplies = Array.isArray(comment.replies) && comment.replies.length > 0;

    return (
      <div key={comment.id} className="space-y-3">
        <article
          className="rounded-2xl border p-4"
          style={{
            backgroundColor: commentCardColor,
            borderColor: commentBorderColor,
            marginLeft: depth > 0 ? `${Math.min(depth * 18, 36)}px` : undefined,
            borderRadius: "var(--home-main-box-radius, 0.75rem)"
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center border font-semibold"
              style={{
                backgroundColor: isPublicDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                borderColor: commentBorderColor,
                color: authorColor,
                borderRadius: "var(--home-main-box-radius, 0.75rem)"
              }}
            >
              {commentInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold" style={{ color: authorColor }}>
                    {comment.name}
                  </div>
                  {showWebsiteField && comment.website && (
                    <a
                      href={comment.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs underline-offset-2 hover:underline"
                      style={{ color: replyLinkColor }}
                    >
                      {comment.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
                {showCommentDate && dateText && (
                  <div className="text-xs" style={{ color: commentMetaTextColor }}>
                    {dateText}
                  </div>
                )}
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-6" style={{ color: commentBodyColor }}>
                {comment.content}
              </p>

              {allowReplies && showCommentForm && (
                <button
                  type="button"
                  onClick={() => setReplyTo(comment)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: replyLinkColor }}
                >
                  <Reply size={13} />
                  Balas komentar
                </button>
              )}
            </div>
          </div>
        </article>

        {hasReplies && (
          <div className="space-y-3">
            {comment.replies!.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="space-y-5"
      style={{
        ...widgetContainerStyle,
        ["--widget-title-size-mobile" as string]: blockTitleFontSize,
        ["--widget-title-size-tablet" as string]: blockTitleFontSize,
        ["--widget-title-size-desktop" as string]: blockTitleFontSize,
        ["--widget-title-color-mobile" as string]: blockTitleColor,
        ["--widget-title-color-tablet" as string]: blockTitleColor,
        ["--widget-title-color-desktop" as string]: blockTitleColor,
        ["--widget-title-border-color-mobile" as string]: blockTitleBorderColor,
        ["--widget-title-border-color-tablet" as string]: blockTitleBorderColor,
        ["--widget-title-border-color-desktop" as string]: blockTitleBorderColor
      }}
    >
      {showTitle && titleText && (
        <div
          className="mb-3 flex flex-col gap-3 pb-3 md:flex-row md:items-center md:justify-between"
          style={{ borderBottom: isPublicDarkMode ? "1px solid rgba(148, 163, 184, 0.16)" : "1px solid rgb(243 244 246)" }}
        >
          <h3
            className="font-bold flex items-center theme-widget-title min-w-0"
            style={{
              lineHeight: blockTitleLineHeight
            }}
          >
            <div
              className="widget-title-bar w-1 h-5 mr-3 shrink-0"
              style={{
                borderRadius: "var(--home-main-box-radius, 0.25rem)"
              }}
            />
            <span className="truncate">{titleText}</span>
          </h3>
          {showCommentCount && (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium md:ml-auto"
              style={{
                color: commentMetaTextColor,
                borderColor: commentBorderColor,
                borderRadius: "999px"
              }}
            >
              <MessageCircleMore size={14} />
              {totalComments} komentar
            </span>
          )}
        </div>
      )}

      {!showTitle && showCommentCount && (
        <span
          className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium"
          style={{
            color: commentMetaTextColor,
            borderColor: commentBorderColor,
            borderRadius: "999px"
          }}
        >
          <MessageCircleMore size={14} />
          {totalComments} komentar
        </span>
      )}

      {showCommentForm && (
        <div
          className="rounded-2xl border p-4 md:p-5"
          style={{
            backgroundColor: commentCardColor,
            borderColor: commentBorderColor,
            borderRadius: "var(--home-main-box-radius, 0.75rem)"
          }}
        >
          <div className="mb-4">
            <div className="text-base font-semibold" style={{ color: isPublicDarkMode ? "var(--fg-primary)" : headingColor }}>
              {replyTo ? `Balas Komentar ${replyTo.name}` : formTitleText}
            </div>
            <div className="mt-1 text-sm" style={{ color: helperTextColor }}>
              Email tidak akan dipublikasikan. Kolom wajib ditandai.
            </div>
          </div>

          {replyTo && (
            <div
              className="mb-4 flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm"
              style={{
                backgroundColor: isPublicDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                borderColor: commentBorderColor,
                color: helperTextColor
              }}
            >
              <div>
                Membalas <span style={{ color: authorColor }} className="font-semibold">{replyTo.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="inline-flex items-center gap-1 text-xs font-medium"
                style={{ color: replyLinkColor }}
              >
                <X size={12} />
                Batal
              </button>
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                type="text"
                required
                disabled={preview || submitState === "submitting"}
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Nama *"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ backgroundColor: inputBgColor, borderColor: inputBorderColor, color: formTextColor, borderRadius: "var(--home-main-box-radius, 0.75rem)" }}
              />
              <input
                type="email"
                required
                disabled={preview || submitState === "submitting"}
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email *"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ backgroundColor: inputBgColor, borderColor: inputBorderColor, color: formTextColor, borderRadius: "var(--home-main-box-radius, 0.75rem)" }}
              />
            </div>

            {showWebsiteField && (
              <input
                type="url"
                disabled={preview || submitState === "submitting"}
                value={form.website}
                onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="Website"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors"
                style={{ backgroundColor: inputBgColor, borderColor: inputBorderColor, color: formTextColor, borderRadius: "var(--home-main-box-radius, 0.75rem)" }}
              />
            )}

            <textarea
              required
              disabled={preview || submitState === "submitting"}
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              placeholder={commentPlaceholder}
              rows={5}
              className="w-full rounded-2xl border px-3 py-3 text-sm outline-none transition-colors"
              style={{ backgroundColor: inputBgColor, borderColor: inputBorderColor, color: formTextColor, borderRadius: "var(--home-main-box-radius, 0.75rem)" }}
            />

            {message && (
              <div className="text-sm" style={{ color: submitState === "error" ? "#dc2626" : helperTextColor }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={preview || submitState === "submitting"}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor, borderRadius: "var(--home-main-box-radius, 0.75rem)" }}
            >
              {submitState === "submitting" ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              {submitButtonText}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div
            className="flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm"
            style={{
              color: helperTextColor,
              backgroundColor: commentCardColor,
              borderColor: commentBorderColor,
              borderRadius: "var(--home-main-box-radius, 0.75rem)"
            }}
          >
            <Loader2 size={15} className="animate-spin" />
            Memuat komentar...
          </div>
        ) : visibleComments.length > 0 ? (
          <>
            {visibleComments.map((comment) => renderComment(comment))}
            {canLoadMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + loadMoreStep)}
                className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-85"
                style={{
                  color: authorColor,
                  borderColor: commentBorderColor,
                  backgroundColor: commentCardColor,
                  borderRadius: "var(--home-main-box-radius, 0.75rem)"
                }}
              >
                {loadMoreButtonText}
              </button>
            )}
          </>
        ) : (
          <div
            className="rounded-2xl border border-dashed px-4 py-5 text-sm"
            style={{
              color: helperTextColor,
              backgroundColor: commentCardColor,
              borderColor: commentBorderColor,
              borderRadius: "var(--home-main-box-radius, 0.75rem)"
            }}
          >
            {preview ? "Preview daftar komentar akan tampil di sini." : emptyCommentsText}
          </div>
        )}
      </div>
    </div>
  );
}
