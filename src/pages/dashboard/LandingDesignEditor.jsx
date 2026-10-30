import React, { useState } from "react";

// Only Baribondhu landing-page design sections. Checkout is intentionally always visible.
export const SECTION_OPTIONS = [
  { key: "header", label: "হেডার ও লোগো" },
  { key: "hero", label: "প্রধান ব্যানার" },
  { key: "showcase", label: "প্রোডাক্ট ব্যানার" },
  { key: "features", label: "প্রোডাক্টের বিস্তারিত" },
  { key: "users", label: "যাদের জন্য উপযোগী" },
  { key: "bottomBanner", label: "বড় প্রোডাক্ট ব্যানার" },
  { key: "delivery", label: "ডেলিভারি তথ্য" },
  { key: "footer", label: "ফুটার তথ্য" },
];
export const landingThemeDefaults = {primary:"#153f2d",accent:"#f59e0b",background:"#e4f3e9",button:"#169447",text:"#142c21"};
export const landingContentDefaults = {
  sectionVisibility: Object.fromEntries(SECTION_OPTIONS.map(({key})=>[key,true])),
  design: {brandName:"বাড়িবন্ধু",brandSubtitle:"ENTERPRISE",detailsTitle:"প্রোডাক্টের বিস্তারিত",usersTitle:"যাদের জন্য উপযোগী",showcaseImage:"",bottomImage:"",details:[],users:[]},
};
const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600";
const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 space-y-4";
const LABELS = {brandName:"ব্র্যান্ডের নাম",brandSubtitle:"ব্র্যান্ডের উপশিরোনাম",detailsTitle:"বিস্তারিত সেকশনের শিরোনাম",usersTitle:"যাদের জন্য সেকশনের শিরোনাম",showcaseImage:"প্রোডাক্ট ব্যানারের ছবির লিংক",bottomImage:"বড় ব্যানারের ছবির লিংক"};
export default function LandingDesignEditor({value,onChange}) {
 const [uploading,setUploading]=useState("");
 const content=value.content||{};
 const design=content.design||{};
 const visibility=content.sectionVisibility||{};
 const setDesign=(key, val)=>onChange(prev=>({...prev,content:{...prev.content,design:{...prev.content?.design,[key]:val}}}));
 const setVisibility=(key, val)=>onChange(prev=>({...prev,content:{...prev.content,sectionVisibility:{...prev.content?.sectionVisibility,[key]:val}}}));
 const setRow=(key, index, field, val)=>onChange(prev=>{const old=prev.content?.design||{};const rows=[...(old[key]||[])];rows[index]={...rows[index],[field]:val};return {...prev,content:{...prev.content,design:{...old,[key]:rows}}};});
 const addRow=(key)=>onChange(prev=>{const old=prev.content?.design||{};return {...prev,content:{...prev.content,design:{...old,[key]:[...(old[key]||[]),key==="users"?{name:"",image:""}:{title:"",subtitle:"",image:""}]}}};});
 const deleteRow=(key,i)=>onChange(prev=>{const old=prev.content?.design||{};return {...prev,content:{...prev.content,design:{...old,[key]:(old[key]||[]).filter((_,n)=>n!==i)}}};});
 const upload=async(file, handler, id)=>{
  if(!file)return;
  if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>5*1024*1024){alert("শুধু JPG, PNG বা WebP (সর্বোচ্চ ৫ MB) দিন।");return;}
  const key=import.meta.env.VITE_IMGBB_API_KEY;
  if(!key){alert("VITE_IMGBB_API_KEY পাওয়া যায়নি। ছবির URL লিখতে পারেন।");return;}
  setUploading(id);
  try{const body=new FormData();body.append("image",file);const response=await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`,{method:"POST",body});const result=await response.json();if(!response.ok||!result?.data?.url)throw new Error(result?.error?.message||"আপলোড ব্যর্থ");handler(result.data.url);}catch(e){alert(e.message||"ছবি আপলোড হয়নি");}finally{setUploading("");}
 };
 const imageEditor=(title,url,onUrl,id)=><div className="space-y-2"><label className="block text-sm font-semibold">{title}</label><input className={inputClass} value={url||""} onChange={e=>onUrl(e.target.value)} placeholder="ছবির URL"/><label className="inline-block cursor-pointer rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold">{uploading===id?"আপলোড হচ্ছে...":"কম্পিউটার থেকে ছবি দিন"}<input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" disabled={Boolean(uploading)} onChange={e=>{upload(e.target.files?.[0],onUrl,id);e.target.value="";}}/></label>{url&&<img src={url} alt="ছবির প্রিভিউ" className="h-32 w-auto max-w-full rounded-lg object-contain"/>}</div>;
 return <div className="space-y-5">
  <section className={cardClass}><h2 className="text-lg font-black">সেকশন দেখানো / লুকানো</h2><p className="text-xs text-slate-500">শুধু এই ওয়েবসাইটের সেকশনগুলো। পরিবর্তনের পর সংরক্ষণ করুন।</p><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{SECTION_OPTIONS.map(({key,label})=><label key={key} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-sm font-semibold"><span>{label}</span><input type="checkbox" className="h-5 w-5 accent-emerald-600" checked={visibility[key]!==false} onChange={e=>setVisibility(key,e.target.checked)}/></label>)}</div><div className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">অর্ডার ফর্ম সবসময় চালু থাকবে। বিদ্যমান অর্ডার ও চেকআউট ব্যবস্থা অপরিবর্তিত।</div></section>
  <section className={cardClass}><h2 className="text-lg font-black">হেডার ও সেকশনের নাম</h2>{["brandName","brandSubtitle","detailsTitle","usersTitle"].map(key=><label key={key} className="block space-y-1"><span className="text-sm font-semibold">{LABELS[key]}</span><input className={inputClass} value={design[key]||""} onChange={e=>setDesign(key,e.target.value)}/></label>)}</section>
  <section className={cardClass}><h2 className="text-lg font-black">প্রোডাক্ট ও বড় ব্যানারের ছবি</h2>{["showcaseImage","bottomImage"].map(key=><div key={key}>{imageEditor(LABELS[key],design[key],url=>setDesign(key,url),key)}</div>)}</section>
  {[{key:"details",label:"প্রোডাক্টের বিস্তারিত কার্ড"},{key:"users",label:"যাদের জন্য উপযোগী কার্ড"}].map(({key,label})=><section key={key} className={cardClass}><h2 className="text-lg font-black">{label}</h2>{(design[key]||[]).map((item,i)=><div key={i} className="space-y-3 rounded-xl border bg-slate-50 p-3"><div className="flex items-center justify-between"><strong>কার্ড {i+1}</strong><button type="button" onClick={()=>deleteRow(key,i)} className="text-sm font-bold text-red-600">মুছে ফেলুন</button></div><label className="block text-sm font-semibold">{key==="users"?"পেশার নাম":"কার্ডের শিরোনাম"}<input className={inputClass} value={item[key==="users"?"name":"title"]||""} onChange={e=>setRow(key,i,key==="users"?"name":"title",e.target.value)}/></label>{key==="details"&&<label className="block text-sm font-semibold">ছোট বিবরণ<input className={inputClass} value={item.subtitle||""} onChange={e=>setRow(key,i,"subtitle",e.target.value)}/></label>}{imageEditor("কার্ডের ছবি",item.image,url=>setRow(key,i,"image",url),`${key}-${i}`)}</div>)}<button type="button" onClick={()=>addRow(key)} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white">+ নতুন কার্ড যোগ করুন</button></section>)}
  <section className={cardClass}><h2 className="text-lg font-black">অর্ডার ও ডেলিভারি</h2><p className="text-sm text-slate-600">অর্ডার ফর্ম, পেমেন্ট, পণ্যের দাম এবং ডেলিভারি চার্জ বিদ্যমান সিস্টেম থেকে আসবে। এখানে এগুলোর কোনো সেটিংস পরিবর্তন করা হবে না।</p></section>
 </div>;
}
