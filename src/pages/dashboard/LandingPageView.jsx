import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiMenu, FiX, FiShoppingCart, FiPackage, FiShield, FiFeather, FiTruck, FiUser, FiPhone, FiMapPin, FiMinus, FiPlus, FiTool, FiCheckCircle } from 'react-icons/fi';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const money = (n) => `৳${Number(n || 0).toLocaleString('en-BD')}`;
// UI-only mirror of utils/pricing.js; order totals remain authoritative on the server.
const displayedUnitPrice = (product) => {
  const base = Number(product?.price || 0);
  if (product?.flashSale?.enabled && product.flashSale.salePrice && Number(product.flashSale.salePrice) < base) {
    return Number(product.flashSale.salePrice);
  }
  const discount = Number(product?.discount || 0);
  return discount > 0 ? Math.max(0, Math.round(base * (1 - discount / 100))) : base;
};
const displayedShipping = ({ subtotal, selectedOption, district, settings }) => {
  const base = Number(selectedOption === 'inside' ? settings?.insideDhakaRate ?? 60 : settings?.outsideDhakaRate ?? 120);
  const campaign = settings?.campaign || {};
  const now = new Date();
  const active = Boolean(campaign.active) && (!campaign.startAt || now >= new Date(campaign.startAt)) && (!campaign.endAt || now <= new Date(campaign.endAt));
  const threshold = Number(active ? campaign.freeThreshold : settings?.freeThreshold) || 0;
  const freeDistrict = (settings?.freeForDistricts || []).map(String).includes(String(district));
  return threshold > 0 && subtotal >= threshold || (district && freeDistrict) ? 0 : Math.max(0, Math.round(base));
};
const fallbackOne = 'https://i.ibb.co.com/NnSY1yYs/860410249-122126245143472673-1105257856993403619-n.jpg';
const fallbackTwo = 'https://i.ibb.co.com/0pgKx5GY/859151853-122126243925472673-6616497023726215156-n.jpg';
const fallbackExtra = 'https://i.ibb.co.com/ZRqtTLPY/ssssss.jpg';
const defaultDetails = [
  { title: 'মজবুত 600D', subtitle: 'অক্সফোর্ড ফ্যাব্রিক', image: fallbackOne },
  { title: 'টেকসই', subtitle: 'ক্লিপ ও বেল্ট', image: fallbackTwo },
  { title: 'বহু পকেট', subtitle: 'সব টুল রাখুন', image: fallbackOne },
  { title: 'অতিরিক্ত পাউচ', subtitle: 'ও ফ্রি হুক', image: fallbackTwo }
];
const defaultUsers = [
  { name: 'ইলেকট্রিশিয়ান', image: fallbackOne },
  { name: 'কার্পেন্টার', image: 'https://i.ibb.co.com/fP1c8Xr/cover.jpg' },
  { name: 'প্লাম্বার/মেকানিক্যাল টেকনিশিয়ান', image: fallbackOne },
  { name: 'প্লাম্বার', image: 'https://i.ibb.co.com/fP1c8Xr/cover.jpg' }
];
function InfoIcon({ Icon, title, description }) { return <div className="flex flex-1 flex-col items-center text-center"><span className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-neutral-950 text-white"><Icon size={24} /></span><span className="text-[14px] font-extrabold leading-tight">{title}</span>{description && <span className="text-[12px] font-semibold leading-tight">{description}</span>}</div> }

export default function LandingPageView() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [quantity, setQuantity] = useState(1);
  const [shippingOption, setShippingOption] = useState('inside');
  const [submitting, setSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', address: '' });
  const homepage = location.pathname === '/';
  const { data: page, isLoading, isError } = useQuery({
    queryKey: ['landing-page', homepage ? 'homepage' : slug],
    enabled: homepage || Boolean(slug), retry: 1,
    queryFn: async () => { const res = await axiosSecure.get(homepage ? '/api/landing-pages/public/homepage' : `/api/landing-pages/public/${encodeURIComponent(slug)}`); return res.data.data || res.data; },
  });
  const { data: shippingSettings, isLoading: shippingLoading, isError: shippingError } = useQuery({
    queryKey: ['public-shipping-settings'],
    queryFn: async () => { const res = await axiosSecure.get('/api/shipping-settings'); return res.data?.data || res.data; },
    staleTime: 60000, retry: 1,
  });

  if (isLoading) return <div className="min-h-screen grid place-items-center text-lg font-bold">পেজ লোড হচ্ছে...</div>;
  if (isError || !page || !page.product?._id) return <div className="min-h-screen grid place-items-center p-6 text-center">ল্যান্ডিং পেজ অথবা পণ্য পাওয়া যায়নি।</div>;

  const product = page.product;
  const price = displayedUnitPrice(product);
  const oldPrice = Number(page.offer?.oldPrice || product.regularPrice || product.price || 0);
  const inside = Number(shippingSettings?.insideDhakaRate ?? 60);
  const outside = Number(shippingSettings?.outsideDhakaRate ?? 120);
  const subtotal = price * quantity;
  const district = shippingOption === 'inside' ? 'Dhaka' : '';
  const shipping = displayedShipping({ subtotal, selectedOption: shippingOption, district, settings: shippingSettings });
  const total = subtotal + shipping;
  const show = (key) => page.content?.sectionVisibility?.[key] !== false;
  const goCheckout = () => document.getElementById('checkout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const update = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));
  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (shippingLoading || shippingError) return alert('ডেলিভারি চার্জ লোড হয়নি। আবার চেষ্টা করুন।');
    if (!/^01[3-9]\d{8}$/.test(form.mobile.replace(/\s/g, ''))) return alert('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন।');
    setSubmitting(true);
    try {
      const guestId = window.crypto?.randomUUID?.() || `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const payload = {
        guestId, cartItems: [{ productId: product._id, quantity }], shippingOption,
        district: shippingOption === 'inside' ? 'Dhaka' : '',
        paymentMethod: 'Cash on Delivery', manualPayment: null,
        customer: { name: form.name.trim(), mobile: form.mobile.trim() }, address: form.address.trim(),
      };
      const response = await axiosSecure.post('/api/order', payload);
      const order = response.data?.order;
      if (!order) throw new Error('অর্ডারের তথ্য পাওয়া যায়নি।');
      if (response.data.guestAccessToken) sessionStorage.setItem(`landing-guest-order-${order._id}`, JSON.stringify({ guestId, guestAccessToken: response.data.guestAccessToken }));
      navigate('/order-success', { state: { order, guestAccessToken: response.data.guestAccessToken } });
    } catch (err) { alert(err.response?.data?.message || err.message || 'অর্ডার করা যায়নি।'); }
    finally { setSubmitting(false); }
  };

  const design = page.content?.design || {};
  const details = design.details?.length ? design.details : defaultDetails;
  const users = design.users?.length ? design.users : defaultUsers;
  const heroImage = page.hero?.image || design.heroImage || fallbackOne;
  const showcaseImage = design.showcaseImage || fallbackExtra;
  const bottomImage = design.bottomImage || fallbackTwo;

  return (
    <main id="home" className="mx-auto min-h-screen max-w-[1100px] bg-white text-neutral-950" style={{ fontFamily: "'Hind Siliguri','Noto Sans Bengali',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700;800;900&display=swap');
      .bb-field{width:100%;min-height:46px;padding:10px 12px 10px 44px;border:1px solid #d4d4d4;border-radius:8px;background:white;outline-offset:2px}
      .bb-shadow-cta{box-shadow:0 4px 0 #a80000,0 8px 15px #0002}`}</style>
      
      {show('header') && <header className="absolute left-1/2 z-20 flex w-full max-w-[1100px] -translate-x-1/2 items-center justify-between px-5 py-4">
        <a href="#home" className="flex items-center gap-2"><span className="flex size-10 items-center justify-center rounded-full bg-white/85"><FiTool size={24} /></span><span className="leading-none"><b className="block text-[23px] font-black">{design.brandName || 'বাড়িবন্ধু'}</b><span className="block text-center text-[8px] font-bold tracking-[.27em]">{design.brandSubtitle || 'ENTERPRISE'}</span></span></a>
        <button type="button" aria-label="মেনু" onClick={() => setMenuOpen(v => !v)} className="rounded-full bg-white/85 p-2.5">{menuOpen ? <FiX size={23} /> : <FiMenu size={23} />}</button>
        {menuOpen && <nav className="absolute right-4 top-[75px] flex min-w-44 flex-col gap-3 rounded-xl bg-white p-5 font-bold shadow-xl"><a href="#features" onClick={() => setMenuOpen(false)}>বিস্তারিত</a><a href="#users" onClick={() => setMenuOpen(false)}>যাদের জন্য</a><a href="#checkout" onClick={() => setMenuOpen(false)}>অর্ডার করুন</a></nav>}
      </header>}

      {show('hero') && <>
        <section className="relative min-h-[720px] overflow-hidden bg-[#ece9e1] sm:min-h-[760px] lg:min-h-[700px]">
          <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-90 lg:bg-right" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/65 to-transparent lg:from-white/95 lg:via-white/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fffefa] via-transparent to-transparent" />
          <div className="relative z-10 flex min-h-[720px] flex-col justify-end px-5 pb-6 pt-32 sm:px-10 lg:min-h-[700px] lg:w-[58%] lg:justify-center lg:pb-12">
            <div className="mb-5"><h1 className="max-w-[500px] whitespace-pre-line text-[clamp(40px,9vw,80px)] font-black leading-[1.13] tracking-tight">{page.hero?.headline || 'কাজের\nসময়\nসব টুল\nহাতের কাছে'}</h1><p className="mt-4 whitespace-pre-line text-[20px] font-bold leading-tight sm:text-[24px]">{page.hero?.subHeadline || 'প্রফেশনাল টুল\nওয়েস্ট ব্যাগ'}</p></div>
            <div className="mb-5 flex max-w-[410px] justify-between gap-1"><InfoIcon Icon={FiPackage} title="বহু পকেট" /><InfoIcon Icon={FiShield} title="মজবুত" description="ও টেকসই" /><InfoIcon Icon={FiFeather} title="হালকা" description="ও আরামদায়ক" /></div>
            <div className="text-center"><div className="mx-auto w-fit -rotate-3 bg-[#ffe000] px-8 py-1">{oldPrice > price && <div className="text-[24px] font-extrabold text-black/80 line-through">{money(oldPrice)}</div>}<div className="text-[56px] font-black leading-none">{money(price)}</div></div><button type="button" onClick={goCheckout} className="bb-shadow-cta mx-auto mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#f00] px-8 py-3 text-[21px] font-extrabold text-white hover:bg-red-700"><FiShoppingCart size={25} />{page.hero?.buttonText || 'অর্ডার করুন'} ›</button></div>
          </div>
        </section>
      </>}

      {show('showcase') && <section className="bg-white px-3 pb-5 sm:px-8"><img src={showcaseImage} alt={product.productName || 'প্রোডাক্ট'} className="h-[240px] w-full rounded-2xl bg-[#ece9e1] object-contain sm:h-[370px] lg:h-[460px]" /></section>}
      
      {show('details') && (
        <section
          id="features"
          className="px-4 py-6 sm:px-8"
        >
          <h2 className="section-heading mb-6 text-[26px] font-black">
            {design.detailsTitle || 'প্রোডাক্টের বিস্তারিত'}
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {details.map((x, i) => (
              <article
                key={i}
                className="overflow-hidden rounded-xl bg-[#f6f6f6] pb-3 text-center"
              >
                <img
                  src={x.image || fallbackOne}
                  alt={x.title || ''}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />

                <h3 className="mt-2 text-[18px] font-extrabold leading-tight">
                  {x.title}
                </h3>

                <p className="text-[15px] font-semibold leading-tight">
                  {x.subtitle}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {show('users') && (
        <section
          id="users"
          className="px-4 py-6 sm:px-8"
        >
          <h2 className="section-heading mb-6 text-[26px] font-black">
            {design.usersTitle || 'যাদের জন্য উপযোগী'}
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {users.map((x, i) => (
              <article
                key={i}
                className="overflow-hidden rounded-xl bg-[#f6f6f6] pb-3 text-center"
              >
                <img
                  src={x.image || fallbackOne}
                  alt={x.name || ''}
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />

                <h3 className="mt-2 text-[18px] font-extrabold leading-tight">
                  {x.name}
                </h3>
              </article>
            ))}
          </div>
        </section>
      )}

      {show('bottomBanner') && <section className="px-2 py-5 sm:px-8"><img src={bottomImage} alt="প্রোডাক্ট ব্যানার" className="block h-auto w-full rounded-2xl" loading="lazy" /></section>}

      {show('delivery') && <section className="grid grid-cols-2 gap-3 px-4 py-3 sm:px-8"><div className="flex items-center justify-center gap-3 rounded-xl bg-[#f5f5f5] p-3"><FiTruck size={40} /><div className="text-sm font-bold leading-tight">ঢাকার ভিতরে<br />ডেলিভারি<br /><strong className="text-2xl">{money(inside)}</strong></div></div><div className="flex items-center justify-center gap-3 rounded-xl bg-[#f5f5f5] p-3"><FiTruck size={40} /><div className="text-sm font-bold leading-tight">ঢাকার বাইরে<br />ডেলিভারি<br /><strong className="text-2xl">{money(outside)}</strong></div></div></section>}

      {<div className="mx-auto max-w-[660px] px-3 pb-3 pt-3 sm:px-6"><section id="checkout" className="scroll-mt-4 rounded-[16px] border-2 border-[#ffdd00] bg-white p-[5px] shadow-sm"><div className="rounded-t-[10px] bg-[#ffdc00] py-2 text-center text-[20px] font-black"><FiShoppingCart className="mr-2 inline-block" /> প্রথমেই অর্ডার করুন</div>
        <form onSubmit={submit} className="space-y-3 p-3 sm:p-5">
          <div className="relative"><FiUser className="absolute left-3 top-3 size-5 text-neutral-500" /><input className="bb-field" required minLength={2} autoComplete="name" aria-label="আপনার নাম" value={form.name} onChange={e => update('name', e.target.value)} placeholder="আপনার নাম" /></div>
          <div className="relative"><FiPhone className="absolute left-3 top-3 size-5 text-neutral-500" /><input className="bb-field" required type="tel" inputMode="numeric" autoComplete="tel" aria-label="মোবাইল নাম্বার" value={form.mobile} onChange={e => update('mobile', e.target.value)} placeholder="মোবাইল নাম্বার" /></div>
          <div className="relative"><FiTruck className="absolute left-3 top-3 size-5 text-neutral-500" /><select className="bb-field" aria-label="ডেলিভারি এলাকা" value={shippingOption} onChange={e => setShippingOption(e.target.value)}><option value="inside">ঢাকার ভিতরে ({money(inside)})</option><option value="outside">ঢাকার বাইরে ({money(outside)})</option></select></div>
          <div className="relative"><FiMapPin className="absolute left-3 top-3 size-5 text-neutral-500" /><textarea className="bb-field min-h-[86px] resize-y" required aria-label="সম্পূর্ণ ঠিকানা" value={form.address} onChange={e => update('address', e.target.value)} placeholder="সম্পূর্ণ ঠিকানা লিখুন" /></div>
          <div className="rounded-lg bg-neutral-50 p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-xs text-neutral-500">পরিমাণ</p><p className="font-bold">{product.productName}</p></div><div className="flex items-center overflow-hidden rounded-lg border border-neutral-200 bg-white"><button type="button" className="px-3 py-2" aria-label="পরিমাণ কমান" onClick={() => setQuantity(q => Math.max(1, q - 1))}><FiMinus /></button><strong className="min-w-7 text-center">{quantity}</strong><button type="button" className="px-3 py-2" aria-label="পরিমাণ বাড়ান" onClick={() => setQuantity(q => q + 1)}><FiPlus /></button></div></div><div className="mt-2 flex justify-between border-t pt-2 text-sm"><span>পণ্য {money(subtotal)} + ডেলিভারি {money(shipping)}</span><strong className="text-[17px]">মোট {money(total)}</strong></div></div>
          <button type="submit" disabled={submitting || shippingLoading || shippingError} className="bb-shadow-cta flex w-full items-center justify-center gap-2 rounded-lg bg-[#f00] py-3 text-[19px] font-extrabold text-white transition hover:bg-red-700 disabled:opacity-50"><FiShoppingCart size={24} />{submitting ? 'অর্ডার হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}</button>
          {shippingError && <p role="alert" className="text-sm text-red-700">ডেলিভারি চার্জ পাওয়া যাচ্ছে না। রিফ্রেশ করুন।</p>}
        </form></section></div>}

      {show('footer') && <footer className="grid grid-cols-3 gap-2 px-3 py-5 text-center sm:px-8"><InfoIcon Icon={FiPackage} title="নিরাপদ" description="ডেলিভারি" /><InfoIcon Icon={FiShield} title="কোয়ালিটি" description="প্রোডাক্ট" /><InfoIcon Icon={FiCheckCircle} title="সহজ" description="অর্ডার প্রসেস" /></footer>}
    </main>
  );
}