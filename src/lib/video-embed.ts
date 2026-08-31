import { getYouTubeEmbedUrl } from "@/lib/utils";

export type VideoEmbedAspect = "landscape" | "portrait";
export type VideoEmbedProvider =
  | "youtube"
  | "vimeo"
  | "instagram"
  | "twitter"
  | "threads"
  | "tiktok"
  | "facebook"
  | "facebook-post"
  | "dailymotion";

export type VideoEmbedInfo = {
  originalUrl: string;
  embedSrc: string;
  provider: VideoEmbedProvider;
  aspect: VideoEmbedAspect;
  title: string;
  embedId?: string;
};

export function getVideoEmbedInfo(rawUrl: string): VideoEmbedInfo | null {
  const originalUrl = rawUrl.trim();
  if (!originalUrl) return null;

  const youtube = getYouTubeEmbedUrl(originalUrl);
  if (youtube) {
    return {
      originalUrl,
      embedSrc: youtube,
      provider: "youtube",
      aspect: "landscape",
      title: "YouTube Video",
    };
  }

  try {
    const parsed = new URL(originalUrl);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const parts = parsed.pathname.split("/").filter(Boolean);

    if (hostname === "vimeo.com" || hostname.endsWith(".vimeo.com")) {
      const id = parts.find((part) => /^\d+$/.test(part));
      if (id) {
        return {
          originalUrl,
          embedSrc: `https://player.vimeo.com/video/${id}`,
          provider: "vimeo",
          aspect: "landscape",
          title: "Vimeo Video",
        };
      }
    }

    if (hostname === "instagram.com" || hostname.endsWith(".instagram.com")) {
      const kind = parts[0] === "reels" ? "reel" : parts[0];
      const id = parts[1];
      if (id && ["p", "reel", "tv"].includes(kind)) {
        const canonicalInstagramUrl = `https://www.instagram.com/${kind}/${id}/`;
        return {
          originalUrl: canonicalInstagramUrl,
          embedSrc: `https://www.instagram.com/${kind}/${id}/embed`,
          provider: "instagram",
          aspect: kind === "reel" ? "portrait" : "portrait",
          title: "Instagram Embed",
        };
      }
    }

    if (hostname === "x.com" || hostname.endsWith(".x.com") || hostname === "twitter.com" || hostname.endsWith(".twitter.com")) {
      const statusIndex = parts.findIndex((part) => part === "status");
      const user = parts[0];
      const id = statusIndex >= 0 ? parts[statusIndex + 1] : undefined;
      if (user && id && /^\d+$/.test(id)) {
        const canonicalTwitterUrl = `https://twitter.com/${user}/status/${id}`;
        return {
          originalUrl: canonicalTwitterUrl,
          embedSrc: canonicalTwitterUrl,
          provider: "twitter",
          aspect: "portrait",
          title: "X Post",
        };
      }
    }

    if (hostname === "threads.net" || hostname.endsWith(".threads.net")) {
      const user = parts[0];
      const postIndex = parts.findIndex((part) => part === "post");
      const id = postIndex >= 0 ? parts[postIndex + 1] : undefined;
      if (user && id) {
        const canonicalThreadsUrl = `https://www.threads.net/${user}/post/${id}`;
        return {
          originalUrl: canonicalThreadsUrl,
          embedSrc: canonicalThreadsUrl,
          provider: "threads",
          aspect: "portrait",
          title: "Threads Post",
        };
      }
    }

    if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com")) {
      const videoIndex = parts.findIndex((part) => part === "video");
      const id = videoIndex >= 0 ? parts[videoIndex + 1] : undefined;
      if (id && /^\d+$/.test(id)) {
        return {
          originalUrl,
          embedSrc: `https://www.tiktok.com/embed/v2/${id}`,
          provider: "tiktok",
          aspect: "portrait",
          title: "TikTok Video",
          embedId: id,
        };
      }
    }

    if (
      hostname === "facebook.com" ||
      hostname.endsWith(".facebook.com") ||
      hostname === "fb.watch"
    ) {
      if (parts.includes("posts") || parsed.pathname === "/permalink.php" || (parsed.searchParams.has("story_fbid") && parsed.searchParams.has("id"))) {
        return {
          originalUrl,
          embedSrc: `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(originalUrl)}&show_text=true&width=500`,
          provider: "facebook-post",
          aspect: "portrait",
          title: "Facebook Post",
        };
      }

      return {
        originalUrl,
        embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(originalUrl)}&show_text=false`,
        provider: "facebook",
        aspect: parsed.pathname.includes("/reel/") || hostname === "fb.watch" ? "portrait" : "landscape",
        title: "Facebook Video",
      };
    }

    if (hostname === "dailymotion.com" || hostname === "dai.ly") {
      const id =
        hostname === "dai.ly"
          ? parts[0]
          : parts[0] === "video"
            ? parts[1]
            : undefined;
      if (id) {
        return {
          originalUrl,
          embedSrc: `https://www.dailymotion.com/embed/video/${id}`,
          provider: "dailymotion",
          aspect: "landscape",
          title: "Dailymotion Video",
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function isSupportedVideoEmbedUrl(rawUrl: string): boolean {
  return getVideoEmbedInfo(rawUrl) !== null;
}
