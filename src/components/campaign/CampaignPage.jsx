import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { CAMPAIGN_API_URL, campaignImageUrl, fetchJson } from '../campaign/campaignApi';

const taka = (amount) => `৳${Number(amount ?? 0).toLocaleString('en-BD')}`;

// REPLACE the product link below with your current website's actual product route.
const getProductLink = (product) => `/product-details/${product._id}`;

export default function CampaignPage() {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchJson(`${CAMPAIGN_API_URL}/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((data) => setCampaign(data))
      .catch((err) => {
        if (err.name !== 'AbortError') setError('This campaign is unavailable.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [slug]);

  if (loading) return <main className="p-8 text-center">Loading campaign...</main>;
  if (error || !campaign) return <main className="p-8 text-center">{error || 'Campaign not found.'}</main>;

  return (
    <main className="mx-auto max-w-7xl px-3 py-6 md:px-5">
      <Helmet>
        <title>{campaign.title}</title>
        <meta name="description" content={campaign.description || campaign.title} />
      </Helmet>

      <header className="mb-7">
        <img src={campaignImageUrl(campaign.bannerImage)} alt={campaign.title} className="w-full rounded-xl object-cover" />
        <h1 className="mt-5 text-2xl font-bold md:text-3xl">{campaign.title}</h1>
        {campaign.description && <p className="mt-2 text-slate-600">{campaign.description}</p>}
      </header>

      <h2 className="mb-4 text-xl font-bold">Campaign Products ({campaign.products.length})</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {campaign.products.map((product) => (
          <Link
            to={getProductLink(product)}
            key={product._id}
            className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md"
          >
            <img
              src={campaignImageUrl(product.productImage?.[0])}
              alt={product.productName}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
            <div className="space-y-1 p-3">
              <h3 className="line-clamp-2 min-h-10 text-sm font-medium">{product.productName}</h3>
              <p className="font-bold text-orange-600">{taka((product.flashSale?.enabled && Number(product.flashSale.salePrice) > 0) ? product.flashSale.salePrice : product.price)}</p>
              <p className="text-xs text-slate-500">{product.stock > 0 ? 'Available' : 'Out of stock'}</p>
            </div>
          </Link>
        ))}
      </div>
      {!campaign.products.length && <p className="text-slate-500">No available products in this campaign.</p>}
    </main>
  );
}
