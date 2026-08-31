"use client";

import { useMemo, useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import {
  applyAutoShareTemplate,
  DEFAULT_AUTO_SHARE_SETTINGS,
  hasAnyAutoShareTarget,
  type AutoShareSettings,
} from "@/lib/auto-share";

type SharePost = {
  id: string;
  title: string;
  slug?: string;
  status?: string;
  published: boolean;
  category: {
    name: string;
    slug?: string;
  };
};

export default function AdminPostShareButton({
  post,
  settings,
  compact = false,
}: {
  post: SharePost;
  settings?: AutoShareSettings | null;
  compact?: boolean;
}) {
  const [sharing, setSharing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const safeSettings = settings || DEFAULT_AUTO_SHARE_SETTINGS;
  const isPublished = (post.status || "").toUpperCase() === "PUBLISHED" || post.published;
  const categorySlug = post.category?.slug || "";
  const postSlug = post.slug || "";
  const canShare = isPublished && categorySlug !== "" && postSlug !== "";

  const shareUrl = useMemo(() => {
    if (!canShare || typeof window === "undefined") return "";
    return `${window.location.origin}/${categorySlug}/${postSlug}`;
  }, [canShare, categorySlug, postSlug]);

  const shareText = useMemo(() => {
    if (!shareUrl) return "";
    return applyAutoShareTemplate(safeSettings.shareTextTemplate, {
      title: post.title || "",
      category: post.category?.name || "",
      url: shareUrl,
    });
  }, [post.category?.name, post.title, safeSettings.shareTextTemplate, shareUrl]);

  const hasAutoShareTarget = canShare && hasAnyAutoShareTarget(settings);
  const whatsappShareHref = useMemo(() => {
    if (!canShare || !shareUrl || !safeSettings.showWhatsapp) return "";
    const messageText = shareText || post.title || "";
    const messageWithUrl = messageText.includes(shareUrl) ? messageText : `${messageText} ${shareUrl}`.trim();
    return `https://wa.me/?text=${encodeURIComponent(messageWithUrl)}`;
  }, [canShare, post.title, safeSettings.showWhatsapp, shareText, shareUrl]);
  const canTriggerShare = canShare && (hasAutoShareTarget || whatsappShareHref !== "");

  if (!settings) return null;

  const handleShare = async () => {
    if (!canTriggerShare || sharing) return;
    setSharing(true);
    setFeedback(null);

    let whatsappWindow: Window | null = null;
    if (whatsappShareHref && typeof window !== "undefined") {
      whatsappWindow = window.open("about:blank", "_blank");
      if (whatsappWindow) {
        whatsappWindow.opener = null;
        whatsappWindow.document.write("Mengarahkan ke WhatsApp Channel...");
      }
    }

    if (!hasAutoShareTarget) {
      if (whatsappWindow && whatsappShareHref) {
        whatsappWindow.location.href = whatsappShareHref;
      } else if (whatsappShareHref && typeof window !== "undefined") {
        window.open(whatsappShareHref, "_blank");
      }
      setFeedback({
        type: "success",
        text: "Share manual WhatsApp Channel dibuka.",
      });
      setSharing(false);
      window.setTimeout(() => setFeedback(null), 4500);
      return;
    }

    try {
      const res = await fetch("/api/admin/tools/auto-share/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, mode: "all" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Gagal menjalankan Share.");
      }

      const successCount = Number(json?.successCount || 0);
      const failureCount = Number(json?.failureCount || 0);
      if (failureCount > 0) {
        const firstError = Array.isArray(json?.results)
          ? json.results.find((item: any) => item?.ok === false)?.error
          : "";
        setFeedback({
          type: "error",
          text: `Auto share selesai sebagian. Facebook/Telegram berhasil ${successCount}, gagal ${failureCount}. WhatsApp dibuka manual.${firstError ? ` ${firstError}` : ""}`,
        });
      } else {
        setFeedback({
          type: "success",
          text: `Facebook dan Telegram berhasil diproses otomatis. WhatsApp dibuka manual.`,
        });
      }

      if (whatsappWindow && whatsappShareHref) {
        whatsappWindow.location.href = whatsappShareHref;
      } else if (whatsappShareHref && typeof window !== "undefined") {
        window.open(whatsappShareHref, "_blank");
      }
    } catch (error: any) {
      if (whatsappWindow && whatsappShareHref) {
        whatsappWindow.location.href = whatsappShareHref;
      } else if (whatsappShareHref && typeof window !== "undefined") {
        window.open(whatsappShareHref, "_blank");
      }
      setFeedback({
        type: "error",
        text: `${error?.message || "Gagal menjalankan auto share untuk Facebook/Telegram."} WhatsApp tetap dibuka manual.`,
      });
    } finally {
      setSharing(false);
      window.setTimeout(() => setFeedback(null), 4500);
    }
  };

  if (!canShare) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] font-semibold text-[var(--fg-muted)] opacity-60 cursor-not-allowed ${
          compact ? "gap-1 px-2 py-[5px] text-[9px] leading-none" : "gap-2 px-3 py-2 text-xs"
        }`}
        title="Share hanya tersedia untuk artikel yang sudah published"
      >
        <Share2 size={compact ? 10 : 14} />
        Share
      </button>
    );
  }

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={!canTriggerShare || sharing}
        className={`inline-flex items-center rounded-full border font-semibold transition-colors ${
          compact ? "gap-1 px-2 py-[5px] text-[9px] leading-none" : "gap-2 px-3 py-2 text-xs"
        } ${
          canTriggerShare
            ? "border-[var(--accent)] bg-[var(--accent)] text-white hover:opacity-90"
            : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-muted)] opacity-60 cursor-not-allowed"
        }`}
        title={
          canTriggerShare
            ? "Kirim auto share ke Facebook dan Telegram, lalu lanjut ke WhatsApp Channel"
            : "Lengkapi dulu pengaturan Auto Share atau aktifkan WhatsApp manual"
        }
      >
        {sharing ? (
          <Loader2 size={compact ? 10 : 14} className="animate-spin" />
        ) : (
          <Share2 size={compact ? 10 : 14} />
        )}
        Share
      </button>

      {feedback ? (
        <div
          className={`absolute right-0 top-full z-30 mt-2 max-w-[280px] rounded-xl border px-3 py-2 text-xs shadow-xl ${
            feedback.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-rose-300 bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.text}
        </div>
      ) : null}
    </div>
  );
}
