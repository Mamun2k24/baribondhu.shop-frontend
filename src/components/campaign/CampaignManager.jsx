import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiPlus, FiRefreshCcw, FiExternalLink, FiEdit2, FiTrash2, FiSave } from 'react-icons/fi';
import { CAMPAIGN_API_URL, campaignAdminRequest, campaignImageUrl } from '../campaign/campaignApi';

const EMPTY = {
  title: '', slug: '', bannerImage: '', description: '',
  status: 'draft', showOnHome: true, sortOrder: 0,
  startDate: '', endDate: '', productIds: [],
};

function slugify(text) {
  return String(text).toLowerCase().trim()
    .replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}
const toInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const toApiDate = (value) => value ? new Date(value).toISOString() : null;

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [productLabels, setProductLabels] = useState({});

  const loadCampaigns = useCallback(async () => {
    setListError('');
    setLoading(true);
    try {
      const data = await campaignAdminRequest();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (e) { setListError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  useEffect(() => {
    const c = new AbortController();
    setLoadingProducts(true);
    setProductsError('');
    const search = new URLSearchParams({ page: String(page), limit: '20', q: query });
    campaignAdminRequest(`/available-products?${search}`, { signal: c.signal })
      .then(result => {
        if (c.signal.aborted) return;
        setItems(result.items || []);
        setTotalPages(Math.max(1, result.totalPages || 1));
        setProductLabels(old => {
          const next = { ...old };
          for (const item of result.items || []) next[item._id] = item.productName;
          return next;
        });
      })
      .catch(e => { if (e.name !== 'AbortError') setProductsError(e.message); })
      .finally(() => { if (!c.signal.aborted) setLoadingProducts(false); });
    return () => c.abort();
  }, [page, query]);

  const selected = useMemo(() => new Set(form.productIds), [form.productIds]);
  const setField = (name, value) => setForm(f => ({ ...f, [name]: value }));

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY, productIds: [] });
    setFormError(''); setFormSuccess(''); setFieldErrors({});
  };

  const edit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || '', slug: item.slug || '',
      bannerImage: item.bannerImage || '', description: item.description || '',
      status: item.status || 'draft', showOnHome: item.showOnHome !== false,
      sortOrder: item.sortOrder ?? 0,
      startDate: toInputDate(item.startDate), endDate: toInputDate(item.endDate),
      productIds: (item.productIds || []).map(id => String(id._id || id)),
    });
    setFormError(''); setFormSuccess(''); setFieldErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleProduct = id => setForm(f => ({
    ...f,
    productIds: f.productIds.includes(id)
      ? f.productIds.filter(p => p !== id)
      : [...f.productIds, id],
  }));

  const submit = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess(''); setFieldErrors({});
    if (!form.slug.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)) {
      setFormError('Slug must use English lowercase letters, numbers and hyphens.'); return;
    }
    if (form.status === 'active' && !form.productIds.length) {
      setFormError('Select at least one product for an active campaign.'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(), slug: form.slug.trim(),
        bannerImage: form.bannerImage.trim(),
        sortOrder: Number(form.sortOrder),
        startDate: toApiDate(form.startDate),
        endDate: toApiDate(form.endDate),
      };
      await campaignAdminRequest(editingId ? `/${editingId}` : '', {
        method: editingId ? 'PUT' : 'POST', data: payload,
      });
      setFormSuccess(editingId ? 'Campaign updated successfully.' : 'Campaign created successfully.');
      await loadCampaigns();
    } catch (err) { setFormError(err.message); setFieldErrors(err.errors || {}); }
    finally { setSaving(false); }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete campaign “${item.title}”? Products will NOT be deleted.`)) return;
    try {
      await campaignAdminRequest(`/${item._id}`, { method: 'DELETE' });
      if (editingId === item._id) resetForm();
      await loadCampaigns();
    } catch (e) { setListError(e.message); }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-3 py-4 md:px-5 font-quicksand">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold text-slate-900">Campaign Management</h1><p className="text-sm text-slate-500">Manage homepage posters and Facebook Ads campaign collections.</p></div>
        <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"><FiPlus /> New Campaign</button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">{editingId ? 'Edit Campaign' : 'Create Campaign'}</h2><span className="text-xs text-slate-400">Fields marked * are required</span></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Campaign Title *
              <input required maxLength={120} value={form.title} onChange={e => {
                const title = e.target.value;
                setForm(f => ({ ...f, title, slug: editingId ? f.slug : slugify(title) }));
              }} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-normal focus:border-indigo-500" placeholder="Eid Special Collection" />
            </label>
            <label className="block text-sm font-semibold">URL Slug *
              <input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={e => setField('slug', e.target.value.toLowerCase())} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-normal" placeholder="eid-special" />
              <span className="text-xs font-normal text-slate-500">Use English letters: /campaign/{form.slug || 'eid-special'}</span>
            </label>
          </div>
          <label className="block text-sm font-semibold">Campaign Poster URL / Uploaded Image Path *
            <input required value={form.bannerImage} onChange={e => setField('bannerImage', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-normal" placeholder="https://cdn.example.com/campaign/eid.webp" />
            <span className="text-xs font-normal text-slate-500">Use your existing image uploader first and paste its URL here. Upload API integration is still pending.</span>
          </label>
          {!!campaignImageUrl(form.bannerImage) && (
            <div className="overflow-hidden rounded-xl border bg-slate-50"><img src={campaignImageUrl(form.bannerImage)} alt="Campaign poster preview" className="aspect-[16/9] w-full object-contain" onError={e => e.currentTarget.style.visibility = 'hidden'} /></div>
          )}
          <label className="block text-sm font-semibold">Short Description
            <textarea rows={2} maxLength={300} value={form.description} onChange={e => setField('description', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-normal" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Status
              <select value={form.status} onChange={e => setField('status', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-normal"><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option></select>
            </label>
            <label className="block text-sm font-semibold">Home Display Order
              <input type="number" value={form.sortOrder} onChange={e => setField('sortOrder', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-normal" />
            </label>
            <label className="block text-sm font-semibold">Start Date (optional)
              <input type="datetime-local" value={form.startDate} onChange={e => setField('startDate', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-normal" />
            </label>
            <label className="block text-sm font-semibold">End Date (optional)
              <input type="datetime-local" value={form.endDate} onChange={e => setField('endDate', e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 font-normal" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.showOnHome} onChange={e => setField('showOnHome', e.target.checked)} className="h-4 w-4 accent-indigo-600" /> Show campaign poster on homepage</label>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Select Products <span className="text-indigo-600">({form.productIds.length})</span></h3><p className="text-xs text-slate-500">Only approved and published products can be selected. Max 100.</p></div></div>
            <div className="mb-3 flex gap-2"><input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Search name or SKU" /><button type="button" title="Refresh" onClick={() => { setQuery(''); setPage(1); }} className="rounded-lg border px-3"><FiRefreshCcw /></button></div>
            {productsError && <p className="text-sm text-red-600">{productsError}</p>}
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {loadingProducts && <p className="p-3 text-sm text-slate-500">Loading products...</p>}
              {!loadingProducts && items.map(product => <label key={product._id} className="flex cursor-pointer items-center gap-3 rounded-lg bg-white p-2 hover:bg-indigo-50">
                <input type="checkbox" checked={selected.has(product._id)} disabled={!selected.has(product._id) && form.productIds.length >= 100} onChange={() => toggleProduct(product._id)} className="h-4 w-4 shrink-0 accent-indigo-600" />
                <img src={campaignImageUrl(product.productImage?.[0])} alt="" className="h-10 w-10 shrink-0 rounded object-contain bg-slate-50" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{product.productName}</p><p className="text-xs text-slate-500">SKU: {product.sku} · ৳{Number(product.price || 0).toLocaleString()}</p></div>
              </label>)}
              {!loadingProducts && !items.length && <p className="p-3 text-sm text-slate-500">No matching products.</p>}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2"><button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border bg-white px-3 py-1.5 text-xs disabled:opacity-40">Previous</button><span className="text-xs text-slate-500">Page {page} / {totalPages}</span><button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border bg-white px-3 py-1.5 text-xs disabled:opacity-40">Next</button></div>
            {form.productIds.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">{form.productIds.map(id => <button key={id} type="button" onClick={() => toggleProduct(id)} title="Remove product" className="max-w-[220px] truncate rounded-full bg-indigo-100 px-2.5 py-1 text-xs text-indigo-800">{productLabels[id] || `Product ${id.slice(-6)}`} ×</button>)}</div>}
          </div>
          {formError && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700"><p>{formError}</p>{Object.entries(fieldErrors).map(([k,v]) => <p key={k}>{k}: {String(v)}</p>)}</div>}
          {formSuccess && <div role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{formSuccess}</div>}
          <div className="flex flex-wrap gap-2"><button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"><FiSave />{saving ? 'Saving...' : editingId ? 'Update Campaign' : 'Create Campaign'}</button><button type="button" onClick={resetForm} className="rounded-xl border px-4 py-2 text-sm">Clear Form</button></div>
        </form>

        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">All Campaigns</h2><button type="button" title="Reload campaigns" onClick={loadCampaigns} className="rounded-lg border p-2"><FiRefreshCcw /></button></div>
          {loading && <p className="text-sm text-slate-500">Loading campaigns...</p>}
          {listError && <p className="mb-3 text-sm text-red-600">{listError}</p>}
          {!loading && campaigns.length === 0 && <p className="text-sm text-slate-500">No campaigns yet.</p>}
          <div className="space-y-3">{campaigns.map(item => <article key={item._id} className="overflow-hidden rounded-xl border border-slate-200">
            <img src={campaignImageUrl(item.bannerImage)} alt={item.title} className="aspect-[16/9] w-full object-cover bg-slate-50" />
            <div className="space-y-2 p-3"><div className="flex items-start justify-between gap-2"><h3 className="font-bold text-slate-800">{item.title}</h3><span className={`rounded-full px-2 py-0.5 text-xs ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{item.status}</span></div>
              <p className="break-words text-xs text-slate-500">/campaign/{item.slug} · {item.productIds?.length || 0} products</p>
              <div className="flex gap-2"><button type="button" onClick={() => edit(item)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"><FiEdit2 /> Edit</button><a target="_blank" rel="noreferrer" href={`/campaign/${item.slug}`} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold"><FiExternalLink /> Preview</a><button type="button" onClick={() => remove(item)} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-600"><FiTrash2 /> Delete</button></div>
            </div>
          </article>)}</div>
          <p className="mt-4 text-xs text-slate-500">Only active campaigns within their schedule appear publicly. Draft and paused campaigns cannot be visited using the public URL.</p>
        </aside>
      </div>
    </section>
  );
}
