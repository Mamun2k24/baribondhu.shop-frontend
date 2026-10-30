import React, { useEffect, useState } from "react";

// Mobile-only sticky checkout CTA. Hidden while checkout is visible.
export default function LandingMobileStickyOrder({ onOrder }) {
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  useEffect(() => {
    const checkout = document.getElementById("checkout");
    if (!checkout) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCheckoutVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -72px 0px" }
    );
    observer.observe(checkout);
    return () => observer.disconnect();
  }, []);

  if (checkoutVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-emerald-900/10 bg-white/95 px-3 pt-2 shadow-[0_-6px_20px_rgba(0,0,0,0.10)] backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}>
      <button type="button" onClick={onOrder}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white shadow-sm active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        style={{ background: "var(--lp-button, #169447)" }}
        aria-label="অর্ডার ফর্মে যান">
        <span aria-hidden="true">🛒</span> অর্ডার করুন <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
