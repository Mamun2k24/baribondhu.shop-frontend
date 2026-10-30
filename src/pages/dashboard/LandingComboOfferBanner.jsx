import React from "react";

/** Dynamic banner settings come from page.content.comboBanner. */
export default function LandingComboOfferBanner({ settings, onOrder, checkoutEnabled = true }) {
  if (!settings?.enabled || !settings?.image?.trim()) return null;
  const openCheckout = () => {
    if (checkoutEnabled && typeof onOrder === "function") onOrder();
  };
  return (
    <section aria-label="স্পেশাল কম্বো অফার" className="px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-xl sm:rounded-2xl">
        {checkoutEnabled ? (
          <button type="button" onClick={openCheckout} className="block w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-emerald-600" aria-label="৩ জারের কম্বো অফার, অর্ডার করতে ক্লিক করুন">
            <img src={settings.image} alt={settings.alt || "৩ জারের ইলিশের আচার কম্বো অফার, ১৪৯৯ টাকার বদলে ৯৯৯ টাকা"} className="block h-auto w-full object-contain" loading="eager" decoding="async" />
          </button>
        ) : (
          <img src={settings.image} alt={settings.alt || "ইলিশের আচার কম্বো অফার"} className="block h-auto w-full object-contain" loading="eager" decoding="async" />
        )}
      </div>
    </section>
  );
}
