import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CAMPAIGN_API_URL, campaignImageUrl, fetchJson } from './campaignApi';

export default function HomeCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetchJson(CAMPAIGN_API_URL, { signal: controller.signal })
      .then((list) => setCampaigns(Array.isArray(list) ? list : []))
      .catch((error) => {
        if (error.name !== 'AbortError') console.error('Campaign banners:', error);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  if (loading || !campaigns.length) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-7 md:px-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Special Collections</h2>
        <span className="text-sm text-slate-500">Explore our campaigns</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Link
            key={campaign._id}
            to={`/campaign/${campaign.slug}`}
            className="group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:shadow-lg"
          >
            <img
              src={campaignImageUrl(campaign.bannerImage)}
              alt={campaign.title}
              loading="lazy"
              className="aspect-[16/9] w-full object-cover transition group-hover:scale-[1.02]"
            />
            <div className="flex items-center justify-between gap-3 p-3">
              <h3 className="min-w-0 truncate font-semibold text-slate-900">{campaign.title}</h3>
              <span className="shrink-0 text-sm font-semibold text-blue-600">Shop now →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
