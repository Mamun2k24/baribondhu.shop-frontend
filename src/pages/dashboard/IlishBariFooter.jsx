import React from "react";
import {
  FaFacebookF,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaLeaf,
  FaTruck,
  FaDollarSign,
  FaHeadphones,
} from "react-icons/fa";

export default function IlishBariFooter({
  phone = "01700000000",
  whatsapp = "01700000000",
  email = "info-[#005b36]",
  facebookUrl = "https://facebook.com",
}) {
  const whatsappNumber = String(whatsapp || phone).replace(/\D/g, "");

  const features = [
    {
      icon: <FaLeaf className="text-xl" />,
      title: "খাঁটি অর্গানিক পণ্য",
      subtitle: "প্রাকৃতিক ও নিরাপদ উপাদান।",
    },
    {
      icon: <FaTruck className="text-xl" />,
      title: "দ্রুত ডেলিভারি",
      subtitle: "সারা দেশে দ্রুত পৌঁছে যায়।",
    },
    {
      icon: <FaDollarSign className="text-xl" />,
      title: "নিরাপদ পেমেন্ট",
      subtitle: "১০০% সুরক্ষিত লেনদেন ব্যবস্থা।",
    },
    {
      icon: <FaHeadphones className="text-xl" />,
      title: "সহজ সাপোর্ট",
      subtitle: "দ্রুত সহায়তা সবসময় প্রস্তুত।",
    },
  ];

  return (
    <footer className="bg-[#005b36] text-white">
      {/* 1. Feature Grid Section */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-emerald-400/20">
            {features.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 ${
                  index !== 0 ? "pt-4 sm:pt-0 sm:pl-6" : ""
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-white text-white">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-xs text-emerald-100/90 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Footer Content (Expanded Grid Layout) */}
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand Info & Description */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-extrabold tracking-tight">ইলিশ বাড়ি</h2>
            <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
              স্বাদ ও মানের সেরা নিশ্চয়তা। সরাসরি নদী থেকে তাজা ও ১০০% খাঁটি পণ্য আমরা পৌঁছে দিই আপনার দোরগোড়ায়।
            </p>
            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-3">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#005b36]"
                >
                  <FaFacebookF className="text-sm" />
                </a>
              )}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[#005b36]"
                >
                  <FaWhatsapp className="text-sm" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-base font-semibold text-white border-b border-emerald-400/30 pb-2 inline-block">
              গুরুত্বপূর্ণ লিঙ্ক
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-emerald-100/90">
              <li>
                <a href="/#products" className="transition hover:text-white hover:underline">
                  আমাদের পণ্য
                </a>
              </li>
              <li>
                <a href="/#about" className="transition hover:text-white hover:underline">
                  আমাদের সম্পর্কে
                </a>
              </li>
              <li>
                <a href="/#privacy" className="transition hover:text-white hover:underline">
                  প্রাইভেসি পলিসি
                </a>
              </li>
              <li>
                <a href="/#terms" className="transition hover:text-white hover:underline">
                  শর্তাবলী
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-base font-semibold text-white border-b border-emerald-400/30 pb-2 inline-block">
              যোগাযোগ
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-emerald-100/90">
              <li className="flex items-center gap-2.5">
                <FaPhoneAlt className="text-xs shrink-0" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaEnvelope className="text-xs shrink-0" />
                <span>{email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <FaMapMarkerAlt className="text-xs shrink-0 mt-1" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Order / Call Action */}
          <div className="bg-white/5 p-5 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-sm text-white">সহজ অর্ডারের জন্য</h4>
              <p className="text-xs text-emerald-100/80 mt-1">
                যেকোনো প্রয়োজনে সরাসরি কল করুন অথবা হোয়াটসঅ্যাপে মেসেজ দিন।
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#005b36] transition hover:bg-emerald-100"
                >
                  <FaPhoneAlt /> কল করুন
                </a>
              )}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/40 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
                >
                  <FaWhatsapp /> হোয়াটসঅ্যাপ মেসেজ
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Copyright Bottom Bar */}
      <div className="border-t border-white/10 bg-[#00472b] px-4 py-3 text-center text-xs text-emerald-100/80">
        © {new Date().getFullYear()} ইলিশ বাড়ি। সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}