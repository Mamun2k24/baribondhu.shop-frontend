
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiLayers,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiUploadCloud,
  FiXCircle,
} from "react-icons/fi";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const MAX_PUBLISHED = 2;

const LandingPages = () => {
  const axiosSecure = useAxiosSecure();
  const [busyId, setBusyId] = useState(null);

  const {
    data: pages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["landing-pages"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/landing-pages");
      return res.data.data || res.data;
    },
  });

  const publishedCount = pages.filter(
    (page) => page.status === "published"
  ).length;

  const draftCount = pages.filter(
    (page) => page.status === "draft"
  ).length;

  const homepage = pages.find(
    (page) => page.isHomepage === true
  );

  const showError = (error, fallback) => {
    alert(error.response?.data?.message || fallback);
  };

  const handleStatus = async (page, nextStatus) => {
    if (
      nextStatus === "published" &&
      page.status !== "published" &&
      publishedCount >= MAX_PUBLISHED
    ) {
      alert(
        "সর্বোচ্চ ২টি Landing Page Published রাখা যাবে। আগে একটি Unpublish করুন।"
      );
      return;
    }

    if (
      page.isHomepage &&
      nextStatus !== "published" &&
      !window.confirm(
        "এই Page বর্তমানে Homepage। Unpublish করলে Main Domain-এ কোনো Homepage থাকবে না। চালিয়ে যাবেন?"
      )
    ) {
      return;
    }

    try {
      setBusyId(page._id);

      await axiosSecure.patch(
        `/api/landing-pages/${page._id}/status`,
        { status: nextStatus }
      );

      await refetch();

      alert(
        nextStatus === "published"
          ? "Landing Page Published হয়েছে"
          : "Landing Page Unpublished হয়েছে"
      );
    } catch (error) {
      showError(error, "Status update failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleSetHomepage = async (page) => {
    if (page.status !== "published") {
      alert("আগে Landing Page Publish করুন।");
      return;
    }

    if (page.isHomepage) return;

    if (
      !window.confirm(
        `"${page.title}" কি baribondhu.shop-এর Homepage করতে চান?`
      )
    ) {
      return;
    }

    try {
      setBusyId(page._id);

      await axiosSecure.patch(
        `/api/landing-pages/${page._id}/set-homepage`
      );

      await refetch();
      alert("Homepage সফলভাবে পরিবর্তন হয়েছে");
    } catch (error) {
      showError(error, "Failed to set homepage");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (page) => {
    if (
      !window.confirm(
        `"${page.title}" স্থায়ীভাবে Delete করতে চান?`
      )
    ) {
      return;
    }

    try {
      setBusyId(page._id);

      await axiosSecure.delete(
        `/api/landing-pages/${page._id}`
      );

      await refetch();
      alert("Landing Page Deleted");
    } catch (error) {
      showError(error, "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-60 flex items-center justify-center text-slate-500">
        Loading Landing Pages...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-600">
          Landing Pages Load করা যায়নি।
        </p>
        <button
          onClick={() => refetch()}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Landing Pages
          </h1>
          <p className="text-slate-500 mt-1">
            Manage published pages and your main domain homepage
          </p>
        </div>

        <Link
          to="/dashboard/landing-pages/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
        >
          <FiPlus />
          Create Landing Page
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border flex items-center gap-4">
          <FiLayers size={28} className="text-blue-600" />
          <div>
            <p className="text-sm text-slate-500">
              Total Pages
            </p>
            <h2 className="text-2xl font-bold">
              {pages.length}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border flex items-center gap-4">
          <FiCheckCircle size={28} className="text-green-600" />
          <div>
            <p className="text-sm text-slate-500">
              Published
            </p>
            <h2 className="text-2xl font-bold">
              {publishedCount} / {MAX_PUBLISHED}
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border flex items-center gap-4">
          <FiClock size={28} className="text-yellow-600" />
          <div>
            <p className="text-sm text-slate-500">
              Draft
            </p>
            <h2 className="text-2xl font-bold">
              {draftCount}
            </h2>
          </div>
        </div>
      </div>

      {/* Homepage Info */}
      <div className="bg-white border rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <FiHome className="text-green-600" />
          Main Domain Homepage
        </div>

        <a
          href="https://baribondhu.shop/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm"
        >
          https://baribondhu.shop/
        </a>

        <p className="text-sm text-slate-600">
          {homepage
            ? `Selected: ${homepage.title}`
            : "এখনো কোনো Homepage নির্বাচন করা হয়নি।"}
        </p>
      </div>

      {/* Page Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pages.map((page) => {
          const isPublished = page.status === "published";
          const isHomepage = page.isHomepage === true;
          const isBusy = busyId !== null;
          const publishDisabled =
            !isPublished &&
            publishedCount >= MAX_PUBLISHED;

          return (
            <div
              key={page._id}
              className="bg-white rounded-2xl border shadow-sm p-5 space-y-5"
            >
              <div className="flex gap-4">
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={
                      page.hero?.image ||
                      page.product?.productImage?.[0] ||
                      ""
                    }
                    alt={page.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <h2 className="font-bold text-lg break-words">
                    {page.title}
                  </h2>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isPublished
                          ? "bg-green-100 text-green-700"
                          : page.status === "inactive"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {page.status}
                    </span>

                    {isHomepage && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <FiHome />
                        Homepage
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-500">
                    {page.product?.productName || "Product"}
                  </p>

                  <p className="text-xs text-slate-500 break-all">
                    /lp/{page.slug}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FiEye />
                    {page.analytics?.views || 0} views
                  </div>
                </div>
              </div>

              {/* Publishing Controls */}
              <div className="flex flex-wrap gap-2">
                {isPublished ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      handleStatus(page, "draft")
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-100 text-amber-800 font-semibold disabled:opacity-50"
                  >
                    <FiXCircle />
                    Unpublish
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy || publishDisabled}
                    onClick={() =>
                      handleStatus(page, "published")
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50"
                  >
                    <FiUploadCloud />
                    Publish
                  </button>
                )}

                {isPublished && (
                  <button
                    type="button"
                    disabled={isBusy || isHomepage}
                    onClick={() => handleSetHomepage(page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold disabled:opacity-60 ${
                      isHomepage
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    <FiHome />
                    {isHomepage
                      ? "Current Homepage"
                      : "Set as Homepage"}
                  </button>
                )}
              </div>

              {publishDisabled && (
                <p className="text-xs text-red-600">
                  ২টি Page ইতিমধ্যে Published আছে।
                  নতুনটি Publish করতে আগে একটি Unpublish করুন।
                </p>
              )}

              {/* Actions */}
              <div className="border-t pt-4 flex flex-wrap gap-2">
                <Link
                  to={`/lp/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700"
                >
                  <FiEye />
                  Preview
                </Link>

                <Link
                  to={`/dashboard/landing-pages/edit/${page._id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  <FiEdit />
                  Edit
                </Link>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleDelete(page)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 disabled:opacity-50"
                >
                  <FiTrash2 />
                  {busyId === page._id
                    ? "Processing..."
                    : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {pages.length === 0 && (
        <div className="bg-white rounded-2xl border p-10 text-center text-slate-500">
          এখনো কোনো Landing Page তৈরি করা হয়নি।
        </div>
      )}
    </div>
  );
};

export default LandingPages;
