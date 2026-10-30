import React, { useEffect, useMemo, useState } from "react";

/** Gallery images come from the landing page first; product images are fallback only. */
export default function LandingProductGallery({ page, product, heroImage, title = "আমাদের গ্যালারি" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = useMemo(() => {
    const landingImages = (Array.isArray(page?.gallery) ? page.gallery : [])
      .map((entry) => typeof entry === "string" ? { image: entry, title: "" } : entry)
      .filter((entry) => typeof entry?.image === "string" && entry.image.trim());
    const productImages = (Array.isArray(product?.productImage) ? product.productImage : [])
      .filter((src) => typeof src === "string" && src.trim())
      .map((src) => ({ image: src, title: product?.productName || "" }));
    const source = landingImages.length ? landingImages : productImages.length ? productImages : heroImage ? [{ image: heroImage, title: page?.title || "" }] : [];
    const seen = new Set();
    return source.filter((entry) => {
      const url = entry.image.trim();
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [page?.gallery, page?.title, product?.productImage, product?.productName, heroImage]);

  useEffect(() => { setActiveIndex(0); }, [page?._id, images]);
  const selected = images[activeIndex] || images[0];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-center text-3xl font-black mb-8" style={{ color: "var(--lp-primary)" }}>{title}</h2>
      <div className="rounded-2xl border border-emerald-900/10 bg-white p-3 sm:p-5 shadow-lg shadow-emerald-900/5">
        {selected ? (
          <>
            <div className="h-64 sm:h-80 md:h-[390px] rounded-xl overflow-hidden bg-[#f7faf7] flex items-center justify-center">
              <img src={selected.image} alt={selected.title || product?.productName || page?.title || "Product image"} className="w-full h-full object-contain p-3" />
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-2 sm:gap-3 overflow-x-auto pb-1" role="group" aria-label="পণ্যের ছবি নির্বাচন করুন">
                {images.map((item, index) => (
                  <button key={`${item.image}-${index}`} type="button" onClick={() => setActiveIndex(index)} aria-label={`ছবি ${index + 1} দেখুন`} aria-pressed={index === activeIndex} className={`shrink-0 w-[22%] sm:w-[23%] aspect-square rounded-xl overflow-hidden border-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${index === activeIndex ? "border-emerald-600 ring-2 ring-emerald-100" : "border-slate-200 hover:border-emerald-400"}`}>
                    <img src={item.image} alt={item.title || `পণ্যের ছবি ${index + 1}`} loading="lazy" className="w-full h-full object-contain bg-slate-50 p-1" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : <p className="py-16 text-center text-slate-500">এখনো কোনো গ্যালারি ছবি যোগ করা হয়নি।</p>}
      </div>
    </div>
  );
}
