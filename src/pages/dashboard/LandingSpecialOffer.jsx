import React from "react";
import {
  FiShoppingCart,
  FiTruck,
  FiDollarSign,
  FiGift,
} from "react-icons/fi";

const DEFAULT_BENEFITS = [
  { icon: "cart", title: "ঢাকায় ডেলিভারি", description: "ঢাকার ভিতরে দ্রুত ডেলিভারি" },
  { icon: "truck", title: "ঢাকার বাইরে", description: "হাতে পেয়ে টাকা দিন" },
  { icon: "cash", title: "ক্যাশ অন ডেলিভারি", description: "দেশের যেকোনো জায়গায় পৌঁছে যাবে" },
];

const ICONS = {
  cart: FiShoppingCart,
  truck: FiTruck,
  cash: FiDollarSign,
};

const LandingSpecialOffer = ({ theme = {}, content = {}, onOrderClick }) => {
  const primary = theme.primary || "#064E2B";
  const buttonColor = theme.button || "#219653";
  const accentColor = theme.accent || "#2CA85D";
  const sectionBg = theme.sectionBg || "#E5F4E9";

  const offer = content.specialOffer || {};
  const headingBefore = offer.headingBefore ?? "আজ";
  const headingHighlight = offer.headingHighlight ?? "অর্ডার করলে পাচ্ছেন";
  const headingAfter = offer.headingAfter ?? "বিশেষ ডিসকাউন্ট!";
  const buttonText = offer.buttonText || "এখনই অর্ডার করুন";
  const benefits = Array.isArray(offer.benefits) && offer.benefits.length > 0
    ? offer.benefits
    : DEFAULT_BENEFITS;

  const scrollToCheckout = () => {
    if (typeof onOrderClick === "function") {
      onOrderClick();
      return;
    }
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      className="relative w-full overflow-hidden px-3 py-5 sm:px-6 sm:py-12 md:py-20"
      style={{ backgroundColor: sectionBg }}
    >
      <div className="relative mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[18px] border border-white/70 bg-white/85 px-3 py-5 shadow-[0_12px_45px_rgba(6,78,43,0.09)] sm:rounded-[24px] sm:px-8 sm:py-8 md:rounded-[30px] md:px-12 md:py-12">
          <div className="mb-4 text-center sm:mb-8 md:mb-10">
            <h2 className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[19px] font-black leading-[1.4] tracking-tight text-gray-950 sm:gap-x-2 sm:text-[30px] md:text-[36px] lg:text-[40px]">
              <FiGift className="mr-0.5 inline-block shrink-0 text-orange-500 sm:mr-1" size={25} />
              <span>{headingBefore}</span>
              <span style={{ color: accentColor }}>{headingHighlight}</span>
              <span>{headingAfter}</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:gap-5">
            {benefits.map((item, index) => {
              const Icon = ICONS[item.icon] || FiTruck;
              return (
                <div
                  key={`${item.title}-${index}`}
                  className="group flex min-w-0 flex-col items-center justify-start rounded-xl px-2 py-3 text-center transition-all duration-300 hover:shadow-lg sm:min-h-[190px] sm:justify-center sm:rounded-2xl sm:px-4 sm:py-7 md:min-h-[210px] md:hover:-translate-y-1"
                  style={{ backgroundColor: "rgba(30, 150, 80, 0.10)" }}
                >
                  <div
                    className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform duration-300 group-hover:scale-105 sm:mb-5 sm:h-[62px] sm:w-[62px] md:h-[68px] md:w-[68px]"
                    style={{ backgroundColor: primary }}
                  >
                    <Icon className="h-[18px] w-[18px] sm:h-7 sm:w-7" strokeWidth={2} />
                  </div>
                  <h3 className="mb-1 break-words text-[12px] font-extrabold leading-[1.45] text-gray-950 sm:mb-3 sm:text-[17px] md:text-[19px]">
                    {item.title}
                  </h3>
                  <p className="break-words text-[11px] leading-[1.5] text-gray-600 sm:text-[14px] sm:leading-relaxed md:text-[15px]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-center sm:mt-8 md:mt-10">
            <button
              type="button"
              onClick={scrollToCheckout}
              className="group inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(20,130,60,0.18)] transition-all duration-300 hover:shadow-xl active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:min-h-[60px] sm:w-auto sm:gap-3 sm:px-8 sm:py-4 sm:text-lg md:px-12 md:text-xl md:hover:-translate-y-1"
              style={{ background: `linear-gradient(110deg, ${primary}, ${buttonColor})`, outlineColor: primary }}
            >
              <span>{buttonText}</span>
              <FiShoppingCart className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1 sm:h-[22px] sm:w-[22px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingSpecialOffer;
