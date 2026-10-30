import LandingDesignEditor, { landingThemeDefaults, landingContentDefaults } from "./LandingDesignEditor";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import useAxiosSecure from "../../hooks/useAxiosSecure";

import {
  FiShoppingBag,
  FiImage,
  FiVideo,
  FiTag,
  FiArrowLeft,
  FiCheckCircle,
  FiPercent,
  FiUploadCloud,
  FiSliders,
  FiLayers,
} from "react-icons/fi";

const CreateLandingPage = () => {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("content"); // 'content' | 'design'

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    product: "",
    template: "product-sale-1",
    theme: landingThemeDefaults,
    content: landingContentDefaults,
    gallery: [],
    benefits: [],
    features: [],
    testimonials: [],
    faq: [],
    hero: {
      headline: "",
      subHeadline: "",
      image: "",
      buttonText: "অর্ডার করুন",
    },
    video: {
      enabled: false,
      type: "youtube",
      url: "",
    },
    offer: {
      enabled: true,
      oldPrice: 0,
      offerPrice: 0,
      discountText: "",
    },
  });

  // =========================
  // FETCH PRODUCTS
  // =========================
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["landing-products"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/products/public");
      return res.data.products || res.data;
    },
  });

  const handleBasicChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const selectedProd = products.find((p) => p._id === productId);

    setFormData((prev) => ({
      ...prev,
      product: productId,
      // Auto-fill price & title if empty
      title: prev.title || selectedProd?.productName || "",
      offer: {
        ...prev.offer,
        offerPrice: selectedProd?.price || prev.offer.offerPrice,
      },
    }));
  };

  const handleHeroChange = (e) => {
    setFormData({
      ...formData,
      hero: {
        ...formData.hero,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleVideoChange = (e) => {
    setFormData({
      ...formData,
      video: {
        ...formData.video,
        [e.target.name]: e.target.name === "enabled" ? e.target.checked : e.target.value,
      },
    });
  };

  const handleOfferChange = (e) => {
    setFormData({
      ...formData,
      offer: {
        ...formData.offer,
        [e.target.name]: e.target.type === "number" ? Number(e.target.value) : e.target.value,
      },
    });
  };

  // =========================
  // IMAGE UPLOAD (ImgBB)
  // =========================
  const handleHeroImageUpload = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    try {
      setUploadingImage(true);
      const body = new FormData();
      body.append("image", image);

      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
        body
      );

      const imageUrl = res.data.data.url;
      setFormData((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          image: imageUrl,
        },
      }));
    } catch (error) {
      console.log(error);
      alert("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const calculateDiscount = () => {
    const { oldPrice, offerPrice } = formData.offer;
    if (oldPrice > 0 && offerPrice > 0 && oldPrice > offerPrice) {
      const discount = Math.round(((oldPrice - offerPrice) / oldPrice) * 100);
      return `${discount}% ছাড়`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product) {
      alert("অনুগ্রহ করে একটি প্রোডাক্ট সিলেক্ট করুন");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosSecure.post("/api/landing-pages", formData);
      alert("Landing Page Created Successfully");
      navigate("/dashboard/landing-pages");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-1"
          >
            <FiArrowLeft /> ফিরে যান
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Create Landing Page
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            আপনার প্রোডাক্টের জন্য সেলস-ড্রাইভেন ল্যান্ডিং পেজ তৈরি করুন
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-slate-200/60 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "content"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FiLayers /> Basic & Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("design")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "design"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FiSliders /> Theme & Sections
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">
        {activeTab === "content" ? (
          <div className="space-y-6">
            {/* 1. Product & Basic Info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FiShoppingBag className="text-lg" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Product Information</h2>
                  <p className="text-xs text-slate-400">ল্যান্ডিং পেজের জন্য প্রোডাক্ট নির্বাচন করুন</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Select Product *
                  </label>
                  <select
                    required
                    value={formData.product}
                    onChange={handleProductSelect}
                    className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 outline-none transition"
                  >
                    <option value="">Choose Product</option>
                    {isLoading ? (
                      <option disabled>Loading products...</option>
                    ) : (
                      products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.productName} — ৳{p.price}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                      Landing Page Title
                    </label>
                    <input
                      name="title"
                      value={formData.title}
                      onChange={handleBasicChange}
                      placeholder="যেমন: প্রিমিয়াম লেদার ওয়ালেট অফার"
                      className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                      URL Slug
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs text-slate-400 font-medium select-none">
                        /lp/
                      </span>
                      <input
                        name="slug"
                        value={formData.slug}
                        onChange={handleBasicChange}
                        placeholder="leather-wallet-offer"
                        className="w-full pl-12 bg-slate-50/60 border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Hero Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                  <FiImage className="text-lg" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Hero Banner & Content</h2>
                  <p className="text-xs text-slate-400">প্রধান ব্যানার ও টেক্সট কনফিগার করুন</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Main Headline
                  </label>
                  <input
                    name="headline"
                    value={formData.hero.headline}
                    onChange={handleHeroChange}
                    placeholder="যেমন: আসল চামড়ার তৈরি দীর্ঘস্থায়ী স্টাইলিশ ওয়ালেট"
                    className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Sub Headline / Short Description
                  </label>
                  <textarea
                    rows="3"
                    name="subHeadline"
                    value={formData.hero.subHeadline}
                    onChange={handleHeroChange}
                    placeholder="প্রোডাক্ট সম্পর্কে সংক্ষেপে আকর্ষনীয় বর্ণনা লিখুন..."
                    className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 outline-none transition resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Hero Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1 w-full space-y-2">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer border border-indigo-100 bg-indigo-50/50 px-4 py-2.5 rounded-xl transition">
                        <FiUploadCloud className="text-base" />
                        <span>{uploadingImage ? "আপলোড হচ্ছে..." : "নতুন ইমেজ নির্বাচন করুন"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {formData.hero.image && (
                      <div className="relative group rounded-xl overflow-hidden border border-slate-200 w-24 h-24 shrink-0 bg-slate-100">
                        <img
                          src={formData.hero.image}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    CTA Button Text
                  </label>
                  <input
                    name="buttonText"
                    value={formData.hero.buttonText}
                    onChange={handleHeroChange}
                    placeholder="অর্ডার করুন"
                    className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* 3. Offer Pricing */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <FiTag className="text-lg" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Offer Pricing</h2>
                    <p className="text-xs text-slate-400">বিশেষ মূল্য এবং ডিসকাউন্ট কনফিগারেশন</p>
                  </div>
                </div>

                {calculateDiscount() && (
                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                    <FiPercent /> {calculateDiscount()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Old Price (৳)
                  </label>
                  <input
                    type="number"
                    name="oldPrice"
                    value={formData.offer.oldPrice || ""}
                    onChange={handleOfferChange}
                    placeholder="1200"
                    className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Offer Price (৳)
                  </label>
                  <input
                    type="number"
                    name="offerPrice"
                    value={formData.offer.offerPrice || ""}
                    onChange={handleOfferChange}
                    placeholder="850"
                    className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* 4. Product Video */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                    <FiVideo className="text-lg" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Product Video</h2>
                    <p className="text-xs text-slate-400">ইউটিউব এম্বেড লিংক</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={formData.video.enabled}
                    onChange={handleVideoChange}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-700">Enable Video</span>
                </label>
              </div>

              {formData.video.enabled && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    YouTube Embed URL
                  </label>
                  <input
                    name="url"
                    value={formData.video.url}
                    onChange={handleVideoChange}
                    placeholder="https://www.youtube.com/embed/xxxxxx"
                    className="w-full bg-slate-50/60 border border-slate-200 text-slate-800 text-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-3 outline-none transition"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <LandingDesignEditor value={formData} onChange={setFormData} />
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 pb-12 border-t border-slate-200/60">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-7 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition"
          >
            <FiCheckCircle className="text-sm" />
            {isSubmitting ? "Creating..." : "Create Landing Page"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLandingPage;