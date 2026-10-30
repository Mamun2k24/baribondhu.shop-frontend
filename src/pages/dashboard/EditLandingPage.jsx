import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import LandingDesignEditor, { landingContentDefaults } from "./LandingDesignEditor";

const Card = ({ children }) => <section className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">{children}</section>;
const inputClass = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

export default function EditLandingPage() {
  const { id } = useParams(); const navigate = useNavigate(); const qc = useQueryClient(); const api = useAxiosSecure(); const apiRef = useRef(api); apiRef.current = api;
  const [form, setForm] = useState(null); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [msg, setMsg] = useState("");
  useEffect(() => { let cancelled = false; setLoading(true); apiRef.current.get(`/api/landing-pages/${id}`).then(r => { if (cancelled) return; const data = r.data?.data || r.data; setForm({ ...data, content: { ...landingContentDefaults, ...(data.content || {}), design: { ...landingContentDefaults.design, ...(data.content?.design || {}) }, sectionVisibility: { ...landingContentDefaults.sectionVisibility, ...(data.content?.sectionVisibility || {}) } } }); }).catch(e => !cancelled && setMsg(e.response?.data?.message || "পেজ লোড করা যায়নি")).finally(() => !cancelled && setLoading(false)); return () => { cancelled = true; }; }, [id]);
  const hero = (name, val) => setForm(p => ({ ...p, hero: { ...p.hero, [name]: val } }));
  const save = async (e) => {
    e.preventDefault(); if (saving || !form) return; setSaving(true); setMsg(""); try {
      // Preserve existing product, status, orderForm and checkout data. Update only visual content and hero.
      const payload = { title: form.title, slug: form.slug, hero: form.hero, content: form.content };
      await apiRef.current.put(`/api/landing-pages/${id}`, payload);
      const r = await apiRef.current.get(`/api/landing-pages/${id}`); const saved = r.data?.data || r.data;
      const expected = payload.content.sectionVisibility || {}; const actual = saved.content?.sectionVisibility || {};
      if (Object.keys(expected).some(k => Boolean(expected[k]) !== Boolean(actual[k]))) throw new Error("সেকশন দেখানো/লুকানোর সেটিংস ডেটাবেজে সংরক্ষিত হয়নি।");
      setForm(p => ({ ...p, ...saved, content: { ...landingContentDefaults, ...saved.content, design: { ...landingContentDefaults.design, ...saved.content?.design }, sectionVisibility: { ...landingContentDefaults.sectionVisibility, ...actual } } }));
      await qc.invalidateQueries({ queryKey: ["landing-page"] }); await qc.invalidateQueries({ queryKey: ["landing-pages"] }); setMsg("পরিবর্তন সংরক্ষিত হয়েছে।");
    } catch (e) { setMsg(e.response?.data?.message || e.message || "সংরক্ষণ করা যায়নি"); } finally { setSaving(false); }
  };
  if (loading) return <p className="p-8">পেজ লোড হচ্ছে...</p>; if (!form) return <p role="alert" className="p-8 text-red-600">{msg || "পেজ পাওয়া যায়নি"}</p>;
  return <form onSubmit={save} className="mx-auto max-w-5xl space-y-5 p-4 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><button type="button" onClick={() => navigate(-1)} className="text-sm text-slate-500">← ফিরে যান</button><h1 className="text-2xl font-black">ল্যান্ডিং পেজ সম্পাদনা</h1><p className="text-xs text-slate-500">বর্তমান অবস্থা: {form.status}</p></div><div className="flex gap-2"><a href={`/lp/${form.slug}`} target="_blank" rel="noreferrer" className="rounded-lg border px-4 py-2 text-sm">লাইভ পেজ দেখুন</a><button type="submit" disabled={saving} className="rounded-lg bg-emerald-700 px-5 py-2 font-bold text-white disabled:opacity-50">{saving ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সংরক্ষণ করুন"}</button></div></div>
    {msg && <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm">{msg}</p>}
    <Card><h2 className="text-lg font-black">পেজের তথ্য</h2><label className="block text-sm font-semibold">পেজের নাম<input required className={inputClass} value={form.title || ""} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></label><label className="block text-sm font-semibold">পেজের স্লাগ<input required className={inputClass} value={form.slug || ""} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} /></label><p className="text-sm text-slate-600">পণ্য, অর্ডার, পেমেন্ট ও ডেলিভারি সেটিংস এখানে পরিবর্তন হবে না।</p></Card>
    <Card><h2 className="text-lg font-black">প্রধান ব্যানার</h2><label className="block text-sm font-semibold">বড় শিরোনাম<textarea rows={3} className={inputClass + " w-full"} value={form.hero?.headline || ""} onChange={e => hero("headline", e.target.value)} /></label><label className="block text-sm font-semibold">ছোট শিরোনাম<textarea className={inputClass + " w-full"} value={form.hero?.subHeadline || ""} onChange={e => hero("subHeadline", e.target.value)} /></label><label className="block text-sm font-semibold">প্রধান ব্যানারের ছবির URL<input className={inputClass} value={form.hero?.image || ""} onChange={e => hero("image", e.target.value)} /></label><label className="block text-sm font-semibold">অর্ডার বাটনের লেখা<input className={inputClass} value={form.hero?.buttonText || ""} onChange={e => hero("buttonText", e.target.value)} /></label></Card>
    <LandingDesignEditor value={form} onChange={setForm} /></form>;
}
