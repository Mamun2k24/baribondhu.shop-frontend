import React, { useCallback, useEffect, useRef, useState } from "react";

// Reviews are supplied by the landing page. No placeholder testimonials are added.
export default function LandingReviewsCarousel({ reviews = [], title = "আমাদের সন্তুষ্ট গ্রাহকরা" }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const total = reviews.length;
  const maxStart = Math.max(0, total - visibleCount);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const update = () => setVisibleCount(window.innerWidth >= 1024 ? 4 : window.innerWidth >= 640 ? 2 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goTo = useCallback((index, behavior = "smooth") => {
    const next = Math.max(0, Math.min(Math.max(0, total - visibleCount), index));
    const track = trackRef.current;
    const item = track?.children[next];
    if (track && item) {
      const first = track.children[0];
      track.scrollTo({ left: item.offsetLeft - first.offsetLeft, behavior: reducedMotion ? "auto" : behavior });
    }
    setActive(next);
  }, [total, visibleCount, reducedMotion]);

  useEffect(() => {
    if (active > maxStart) goTo(maxStart, "auto");
  }, [active, maxStart, goTo]);

  useEffect(() => {
    if (maxStart === 0 || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) goTo(active >= maxStart ? 0 : active + 1);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [active, maxStart, paused, reducedMotion, goTo]);

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || !track.children.length) return;
    const first = track.children[0];
    const second = track.children[1];
    const step = second ? second.offsetLeft - first.offsetLeft : first.getBoundingClientRect().width;
    if (step > 0) setActive(Math.max(0, Math.min(maxStart, Math.round(track.scrollLeft / step))));
  };

  if (!total) return null;

  return (
    <section className="relative overflow-hidden px-3 py-7 sm:px-6 sm:py-10 lg:py-14" aria-label={title}>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-5 text-center sm:mb-7 lg:mb-9">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-white/65 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[.16em] text-emerald-900 sm:px-4 sm:py-1.5 sm:text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> CUSTOMER FEEDBACK
          </span>
          <h2 className="mt-2 text-[23px] font-black leading-snug tracking-tight sm:mt-3 sm:text-3xl lg:text-4xl" style={{ color: "var(--lp-text, #142c21)" }}>{title}</h2>
          <div className="mx-auto mt-2 h-[3px] w-12 rounded-full sm:mt-3 sm:w-16" style={{ background: "var(--lp-accent, #f59e0b)" }} />
          <p className="mx-auto mt-2 max-w-lg text-xs leading-5 text-emerald-950/65 sm:mt-3 sm:text-sm">আমাদের গ্রাহকদের অভিজ্ঞতা ও মতামত</p>
        </div>

        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}>
          <div
            ref={trackRef}
            onScroll={handleScroll}
            className="flex snap-x snap-mandatory items-start gap-3 overflow-x-auto scroll-smooth pb-2 sm:items-stretch sm:gap-5 sm:pb-4"
            style={{ scrollbarWidth: "none" }}
            aria-label="গ্রাহকদের রিভিউ"
          >
            {reviews.map((review, index) => {
              const rating = Math.max(1, Math.min(5, Math.round(Number(review.rating) || 5)));
              const name = review.name?.trim() || "Customer";
              return (
                <article
                  key={review._id || index}
                  className="group relative flex h-auto w-full shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white px-4 pb-3 pt-4 shadow-[0_5px_18px_rgba(13,62,42,0.07)] transition-shadow hover:border-emerald-200 hover:shadow-[0_10px_28px_rgba(13,62,42,0.12)] sm:w-[calc((100%-1.25rem)/2)] sm:rounded-[22px] sm:p-5 lg:w-[calc((100%-3.75rem)/4)]"
                >
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-800 via-emerald-500 to-amber-400" aria-hidden="true" />
                  <span className="pointer-events-none absolute right-4 top-3 font-serif text-5xl leading-none text-emerald-100 sm:top-5 sm:text-6xl" aria-hidden="true">“</span>
                  <div className="relative mb-2.5 flex items-center gap-2.5 pr-8 sm:mb-4 sm:gap-3">
                    {review.image ? (
                      <img src={review.image} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-full border-2 border-emerald-100 object-cover sm:h-12 sm:w-12" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-base font-extrabold text-emerald-900 sm:h-12 sm:w-12 sm:text-lg" aria-hidden="true">{name.charAt(0).toUpperCase()}</div>
                    )}
                    <div className="min-w-0">
                      <h3 className="break-words text-[13px] font-extrabold leading-5 text-emerald-950 sm:text-sm">{name}</h3>
                      {review.dateLabel && <p className="text-[10px] text-slate-400 sm:mt-0.5 sm:text-[11px]">{review.dateLabel}</p>}
                    </div>
                  </div>
                  <div className="mb-2 flex items-center gap-0.5 sm:mb-3 sm:gap-1" aria-label={`${rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, star) => <span key={star} className={`text-sm sm:text-base ${star < rating ? "text-amber-500" : "text-slate-200"}`} aria-hidden="true">★</span>)}
                    <span className="ml-1.5 text-[10px] font-semibold text-slate-500 sm:ml-2 sm:text-[11px]">{rating}/5</span>
                  </div>
                  <blockquote className="border-l-[3px] border-amber-300 pl-2.5 sm:pl-3">
                    <p className="whitespace-pre-line text-[12px] italic leading-[1.65] text-slate-600 sm:text-[13px] sm:leading-[1.8]" style={{ fontFamily: 'Georgia, "Noto Serif Bengali", serif' }}>
                      {review.comment?.trim() || "রেটিং দিয়েছেন"}
                    </p>
                  </blockquote>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-emerald-50 pt-2 text-[9px] font-bold uppercase tracking-wider text-emerald-800/70 sm:mt-4 sm:gap-2 sm:pt-3 sm:text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Customer review
                  </div>
                </article>
              );
            })}
          </div>

          {maxStart > 0 && (
            <div className="mt-2 flex items-center justify-center gap-3 sm:mt-3 sm:gap-4">
              <button type="button" onClick={() => goTo(active <= 0 ? maxStart : active - 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white text-lg text-emerald-900 shadow-sm transition hover:bg-emerald-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:h-10 sm:w-10 sm:text-xl" aria-label="আগের রিভিউ">‹</button>
              <div className="flex max-w-[170px] items-center gap-1.5 overflow-x-auto py-2 sm:max-w-none sm:gap-2" style={{ scrollbarWidth: "none" }} aria-label="রিভিউ পৃষ্ঠা">
                {Array.from({ length: maxStart + 1 }, (_, index) => (
                  <button key={index} type="button" onClick={() => goTo(index)} aria-label={`রিভিউ পৃষ্ঠা ${index + 1}`} aria-current={active === index ? "true" : undefined} className={`h-2 shrink-0 rounded-full transition-all ${active === index ? "w-6 bg-emerald-800" : "w-2 bg-emerald-200 hover:bg-emerald-400"}`} />
                ))}
              </div>
              <button type="button" onClick={() => goTo(active >= maxStart ? 0 : active + 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-white text-lg text-emerald-900 shadow-sm transition hover:bg-emerald-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:h-10 sm:w-10 sm:text-xl" aria-label="পরের রিভিউ">›</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
