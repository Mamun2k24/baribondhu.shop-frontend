
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, X, ShieldCheck, Zap, Star } from "lucide-react";

// Extract YouTube Video ID
function getYouTubeVideoId(url) {
  if (!url) return "";

  try {
    const input = url.trim();
    const parsed = new URL(
      /^https?:\/\//i.test(input) ? input : `https://${input}`
    );

    const host = parsed.hostname
      .toLowerCase()
      .replace(/^(www\.|m\.)/, "");

    let id = "";

    if (host === "youtu.be") {
      id = parsed.pathname.split("/")[1] || "";
    } else if (
      host === "youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (parsed.pathname === "/watch") {
        id = parsed.searchParams.get("v") || "";
      } else {
        const parts = parsed.pathname.split("/").filter(Boolean);

        if (["shorts", "embed", "live"].includes(parts[0])) {
          id = parts[1] || "";
        }
      }
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
  } catch {
    return "";
  }
}

export default function VideoPromo() {
  const [isOpen, setIsOpen] = useState(false);

  const BASE = (
    import.meta.env.VITE_APP_SERVER_URL || ""
  ).replace(/\/+$/, "");

  // Fetch active videos from backend
  const { data: videosData, isLoading } = useQuery({
    queryKey: ["publicActiveVideos"],
    queryFn: async () => {
      const res = await fetch(`${BASE}/api/videos`);

      if (!res.ok) {
        throw new Error("Failed to load videos");
      }

      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });

  const activeVideo = useMemo(() => {
    const list = videosData?.items || [];
    return list.length > 0 ? list[0] : null;
  }, [videosData]);

  // Dynamic YouTube Video ID
  const videoId = useMemo(() => {
    return getYouTubeVideoId(activeVideo?.youtubeUrl);
  }, [activeVideo?.youtubeUrl]);

  // Dynamic Thumbnail
  const thumbnailUrl = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : "";

  // Dynamic YouTube Embed
  const videoEmbedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : "";

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10">
        <div className="w-full h-[200px] md:h-[300px] rounded-3xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!activeVideo) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 font-sans">

      {/* MAIN VIDEO BANNER */}
      <div className="relative w-full h-[200px] md:h-[300px] rounded-3xl overflow-hidden shadow-lg border border-slate-100 group bg-slate-900">

        {/* DYNAMIC VIDEO THUMBNAIL */}
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={activeVideo.title || "Video Preview"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            loading="lazy"
          />
        )}

        {/* DARK GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-black/30" />

        {/* TOP BADGES */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 flex gap-2 z-10">

          <span className="bg-orange-600/90 backdrop-blur-md text-white text-[10px] md:text-xs font-black px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5 tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Live Experience
          </span>

          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] md:text-xs font-bold px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Trusted
          </span>

        </div>

        {/* CENTER PLAY BUTTON */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">

          <button
            type="button"
            onClick={() => {
              if (videoEmbedUrl) setIsOpen(true);
            }}
            disabled={!videoEmbedUrl}
            className="w-16 h-16 md:w-20 md:h-20 bg-rose-500/90 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group/btn relative disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Play Promotional Video"
          >
            <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-40 group-hover/btn:opacity-60" />

            <Play className="w-6 h-6 md:w-8 md:h-8 fill-current translate-x-0.5 relative z-10" />
          </button>

          {/* DYNAMIC VIDEO CONTENT */}
          <div className="text-center text-white space-y-1 px-4 drop-shadow-md max-w-2xl mx-auto">

            <h3 className="text-lg md:text-2xl font-black tracking-tight line-clamp-1">
              {activeVideo.title}
            </h3>

            <p className="text-xs md:text-sm font-medium text-slate-200 line-clamp-2">
              {activeVideo.description ||
                "Watch our latest promotional video."}
            </p>

          </div>
        </div>

        {/* BOTTOM INFORMATION BAR */}
        <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:right-6 md:left-6 items-center justify-between text-white z-10 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/5 text-[11px] md:text-xs font-bold hidden sm:flex">

          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-current" />
            4.9/5 Rated by Thousands of Verified Buyers
          </div>

          <a
            href={activeVideo.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline cursor-pointer hover:text-orange-400 transition-colors"
          >
            Watch on YouTube
          </a>

        </div>
      </div>

      {/* VIDEO MODAL */}
      {isOpen && videoEmbedUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-black aspect-video w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10">

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors z-50 border border-white/10"
              title="Close Video"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            <iframe
              src={videoEmbedUrl}
              title={activeVideo.title || "Promo Video"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />

          </div>
        </div>
      )}

    </div>
  );
}
