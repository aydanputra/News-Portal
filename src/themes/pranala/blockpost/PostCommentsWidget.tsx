import React, { useEffect, useMemo, useRef, useState } from "react";
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
const COMMENT_AUTHOR_CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

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
  const [showIdentityFields, setShowIdentityFields] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    content: ""
  });
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const commentTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (preview || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(COMMENT_AUTHOR_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { name?: string; email?: string; website?: string; savedAt?: number };
      if (!parsed?.savedAt || Date.now() - parsed.savedAt > COMMENT_AUTHOR_CACHE_TTL) {
        window.localStorage.removeItem(COMMENT_AUTHOR_CACHE_KEY);
        return;
      }
      setForm((prev) => ({
        ...prev,
        name: typeof parsed.name === "string" ? parsed.name : prev.name,
        email: typeof parsed.email === "string" ? parsed.email : prev.email,
        website: typeof parsed.website === "string" ? parsed.website : prev.website
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
    const website = form.website.trim();
    if (!name || !email) return;
    window.localStorage.setItem(COMMENT_AUTHOR_CACHE_KEY, JSON.stringify({
      name,
      email,
      website,
      savedAt: Date.now()
    }));
  }, [form.name, form.email, form.website, preview]);

  useEffect(() => {
    if (!showIdentityFields) return;
    nameInputRef.current?.focus();
  }, [showIdentityFields]);

  useEffect(() => {
    if (!showIdentityFields || typeof window === "undefined") return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && submitState !== "submitting") {
        setShowIdentityFields(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showIdentityFields, submitState]);

  useEffect(() => {
    if (!replyTo || showIdentityFields || typeof window === "undefined") return;
    window.setTimeout(() => {
      commentTextareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      commentTextareaRef.current?.focus();
    }, 180);
  }, [replyTo, showIdentityFields]);

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
  const hasSavedIdentity = form.name.trim() !== "" && form.email.trim() !== "";

  const renderCommentEditor = (options?: { inline?: boolean }) => {
    const isInline = options?.inline === true;
    const containerRadius = isInline ? "calc(var(--home-main-box-radius, 0.75rem) - 0.1rem)" : "var(--home-main-box-radius, 0.75rem)";

    return (
      <div
        className={isInline ? "pt-1" : "rounded-2xl border p-4 md:p-5"}
        style={{
          backgroundColor: isInline
            ? "transparent"
            : commentCardColor,
          borderColor: isInline ? "transparent" : commentBorderColor,
          borderRadius: containerRadius,
        }}
      >
        <div className={isInline ? "mb-2" : "mb-4"}>
          <div className="flex items-start justify-between gap-3">
            <div className={isInline ? "text-xs font-medium" : "text-base font-semibold"} style={{ color: isInline ? helperTextColor : (isPublicDarkMode ? "var(--fg-primary)" : headingColor) }}>
              {replyTo ? `Membalas ${replyTo.name}` : formTitleText}
            </div>
            {!isInline && hasSavedIdentity && !showIdentityFields && (
              <button
                type="button"
                onClick={() => {
                  setShowIdentityFields(true);
                  setSubmitState("idle");
                  setMessage("");
                }}
                className={isInline
                  ? "shrink-0 inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-opacity hover:opacity-85"
                  : "shrink-0 inline-flex items-center justify-center rounded-xl border px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-85"}
                style={{
                  color: helperTextColor,
                  borderColor: commentBorderColor,
                  backgroundColor: isPublicDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                  borderRadius: containerRadius
                }}
              >
                Ubah info
              </button>
            )}
          </div>
        </div>

        {replyTo && !isInline && (
          <div
            className={isInline
              ? "mb-2.5 flex items-start justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-xs"
              : "mb-4 flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm"}
            style={{
              backgroundColor: isPublicDarkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
              borderColor: commentBorderColor,
              color: helperTextColor,
              borderRadius: containerRadius
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

        <form className={isInline ? "space-y-2" : "space-y-3"} onSubmit={handleSubmit}>
          <textarea
            ref={commentTextareaRef}
            required
            disabled={preview || submitState === "submitting"}
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            placeholder={commentPlaceholder}
            rows={isInline ? 2 : 5}
            className={isInline
              ? "w-full rounded-lg border px-2.5 py-2 text-xs outline-none transition-colors"
              : "w-full rounded-2xl border px-3 py-3 text-sm outline-none transition-colors"}
            style={{ backgroundColor: inputBgColor, borderColor: inputBorderColor, color: formTextColor, borderRadius: containerRadius }}
          />

          {message && (
            <div className="text-sm" style={{ color: submitState === "error" ? "#dc2626" : helperTextColor, display: showIdentityFields ? "none" : undefined }}>
              {message}
            </div>
          )}

          <div className={isInline ? "flex items-center gap-1.5" : "flex items-center gap-2"}>
            <button
              type="submit"
              disabled={preview || submitState === "submitting"}
              className={isInline
                ? "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
                : "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"}
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor, borderRadius: containerRadius }}
            >
              {submitState === "submitting" ? <Loader2 size={isInline ? 14 : 16} className="animate-spin" /> : <Send size={isInline ? 13 : 15} />}
              {isInline ? "Kirim" : submitButtonText}
            </button>
            {replyTo && (
              <button
                type="button"
                disabled={submitState === "submitting"}
                onClick={() => setReplyTo(null)}
                className={isInline
                  ? "inline-flex items-center justify-center rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                  : "inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"}
                style={{
                  color: helperTextColor,
                  borderColor: commentBorderColor,
                  backgroundColor: isInline ? "transparent" : (isPublicDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"),
                  borderRadius: containerRadius
                }}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (preview) return;
    if (!showIdentityFields && !hasSavedIdentity) {
      setShowIdentityFields(true);
      setSubmitState("idle");
      setMessage("");
      return;
    }

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedContent = form.content.trim();
    if (!trimmedName || !trimmedEmail || !trimmedContent) {
      setSubmitState("error");
      setMessage("Nama, email, dan isi komentar wajib diisi.");
      return;
    }

    setSubmitState("submitting");
    setMessage("");

    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: trimmedName,
          email: trimmedEmail,
          content: trimmedContent,
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
          website: form.website.trim(),
          savedAt: Date.now()
        }));
      }
      setForm((prev) => ({ ...prev, content: "" }));
      setReplyTo(null);
      setShowIdentityFields(false);
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
                  onClick={() => {
                    setReplyTo(comment);
                    setSubmitState("idle");
                    setMessage("");
                  }}
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

        {showCommentForm && replyTo?.id === comment.id && (
          <div
            style={{
              marginLeft: depth > 0 ? `${Math.min(depth * 18, 36)}px` : undefined,
            }}
          >
            {renderCommentEditor({ inline: true })}
          </div>
        )}

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
        ...widgetContainerStyle
      }}
    >
      {showCommentCount && (
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

      {showCommentForm && !replyTo && renderCommentEditor()}

      {showIdentityFields && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup form identitas komentar"
            className="absolute inset-0 cursor-default"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.44)" }}
            onClick={() => {
              if (submitState !== "submitting") {
                setShowIdentityFields(false);
              }
            }}
          />
          <div
            className="relative z-[1] w-full max-w-md rounded-2xl border p-4 shadow-2xl md:p-5"
            style={{
              backgroundColor: commentCardColor,
              borderColor: commentBorderColor,
              borderRadius: "var(--home-main-box-radius, 0.75rem)"
            }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold" style={{ color: isPublicDarkMode ? "var(--fg-primary)" : headingColor }}>
                  Lengkapi Informasi
                </div>
                <div className="mt-1 text-sm" style={{ color: helperTextColor }}>
                  Email tidak akan dipublikasikan. Kolom wajib ditandai.
                </div>
              </div>
              <button
                type="button"
                aria-label="Tutup pop up identitas komentar"
                disabled={submitState === "submitting"}
                onClick={() => setShowIdentityFields(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: helperTextColor, borderColor: commentBorderColor }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  ref={nameInputRef}
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

              {message && (
                <div className="text-sm" style={{ color: submitState === "error" ? "#dc2626" : helperTextColor }}>
                  {message}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={submitState === "submitting"}
                  onClick={() => setShowIdentityFields(false)}
                  className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    color: helperTextColor,
                    borderColor: commentBorderColor,
                    backgroundColor: isPublicDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    borderRadius: "var(--home-main-box-radius, 0.75rem)"
                  }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={preview || submitState === "submitting"}
                  onClick={() => setShowIdentityFields(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
                  style={{ backgroundColor: buttonBgColor, color: buttonTextColor, borderRadius: "var(--home-main-box-radius, 0.75rem)" }}
                >
                  Simpan Informasi
                </button>
              </div>
            </div>
          </div>
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
