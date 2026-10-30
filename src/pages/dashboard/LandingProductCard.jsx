import React from "react";

const LandingProductCard = ({ page, product, price, heroImage, onOrder }) => {
  const name = product?.productName || page?.title || "আমাদের পণ্য";
  const image = product?.productImage?.[0] || heroImage;
  const description = product?.details || page?.hero?.subHeadline || "";
  const oldPrice = Number(page?.offer?.oldPrice || 0);
  const currentPrice = Number(price || 0);
  const discount = oldPrice > currentPrice && currentPrice > 0
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : 0;
  const discountLabel = page?.offer?.discountText || (discount ? `${discount}% ছাড়` : "");

  const whatsappMessage = `আসসালামু আলাইকুম, ${name} সম্পর্কে জানতে চাই।`;
  const whatsappUrl = `https://wa.me/8801781977392?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section aria-labelledby="landing-product-heading" className="mt-12 md:mt-16">
      <h2 id="landing-product-heading" className="mb-7 text-center text-3xl md:text-4xl font-black">
        {page?.content?.productTitle || "আমাদের পণ্য"}
      </h2>
      <article className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-emerald-100 bg-white/80 p-5 shadow-lg shadow-emerald-900/5 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12">
          <div className="flex min-h-64 items-center justify-center rounded-2xl bg-white/70 p-5 sm:min-h-80">
            {image ? <img src={image} alt={name} loading="lazy" className="h-64 w-full object-contain sm:h-80" /> : <span className="text-slate-500">পণ্যের ছবি নেই</span>}
          </div>
          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              {discountLabel && <span className="rounded-full px-4 py-1.5 text-sm font-bold text-white" style={{ background: "var(--lp-accent)" }}>🏷️ {discountLabel}</span>}
              <span className="text-sm font-bold text-rose-600">🔥 স্টক সীমিত!</span>
            </div>
            <div>
              <h3 className="text-2xl font-black leading-snug md:text-3xl">{name}</h3>
              {description && <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 md:text-base">{description}</p>}
            </div>
            <div className="flex flex-wrap items-baseline gap-4">
              <strong className="text-3xl font-black md:text-4xl" style={{ color: "var(--lp-button)" }}>৳{currentPrice.toLocaleString("en-BD")}</strong>
              {oldPrice > currentPrice && <del className="text-lg text-slate-500">৳{oldPrice.toLocaleString("en-BD")}</del>}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold sm:text-sm">
              {["✅ মানসম্মত পণ্য", "🌸 যত্নসহকারে নির্বাচিত", "💪 নির্ভরযোগ্য সেবা"].map(label => <span key={label} className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-900">{label}</span>)}
            </div>
            <div className="flex w-full items-stretch gap-2 sm:w-auto sm:gap-3">
              <button
                type="button"
                onClick={onOrder}
                className="min-w-0 flex-1 rounded-xl px-3 py-3 text-sm font-extrabold text-white shadow-md transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex-none sm:px-9 sm:py-4 sm:text-base"
                style={{ background: "var(--lp-button)" }}
              >
                অর্ডার করুন
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp-এ যোগাযোগ করুন: 01781977392"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#1ebc59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex-none sm:px-6 sm:py-4 sm:text-base"
              >
                <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className="h-5 w-5 shrink-0">
                  <path d="M16.01 3C8.83 3 3 8.82 3 16c0 2.29.6 4.53 1.73 6.5L3 29l6.68-1.75A12.92 12.92 0 0 0 16 29c7.18 0 13-5.82 13-13S23.19 3 16.01 3Zm0 23.64a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-3.96 1.04 1.06-3.86-.25-.4A10.63 10.63 0 1 1 16 26.64Zm5.83-7.96c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.58-1.6-.95-.85-1.6-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.42 4.8.76.33 1.36.53 1.82.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default LandingProductCard;
