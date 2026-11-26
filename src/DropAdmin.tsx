import { useEffect, useState, type FormEvent } from "react";
import { adminLogin, adminLogout, adminDrops, auditDrops, writeDrop, uploadDropArtwork, dropsConfigured, dropPrice, dropStatus, type Drop, type DropInput, type DropAudit } from "./freshDrops";
import "./freshDrops.css";

const categories = [["instrument","Instruments"],["outfit","Outfits"],["accessory","Accessories"],["hair","Hairstyles"],["stage","Stage backgrounds"],["tracks","Backing tracks"]];
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
function localDate(iso:string){const d=new Date(iso);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
function nextFriday(){const d=new Date();d.setHours(9,0,0,0);d.setDate(d.getDate()+((5-d.getDay()+7)%7));if(d.getTime()<=Date.now())d.setDate(d.getDate()+7);return d.toISOString();}
const fresh = ():DropInput=>({name:"",description:"",category:"instrument",price_cents:99,product_id:"",image_url:"",release_at:nextFriday(),state:"draft",featured:true,notify_members:false,auto_equip:true});
const formatDate=(s:string)=>new Date(s).toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"});

export default function DropAdmin(){
  const [token,setToken]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState("");
  const [items,setItems]=useState<Drop[]>([]),[audit,setAudit]=useState<DropAudit[]>([]);
  const [editing,setEditing]=useState<Drop|undefined>(),[form,setForm]=useState<DropInput>(fresh),[date,setDate]=useState(()=>localDate(nextFriday())),[price,setPrice]=useState("0.99");
  const [filter,setFilter]=useState("All"),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
  function patch<K extends keyof DropInput>(k:K,v:DropInput[K]){setForm(f=>({...f,[k]:v}));}
  async function refresh(t=token){const [d,a]=await Promise.all([adminDrops(t),auditDrops(t)]);setItems(d);setAudit(a);}
  async function run(action:()=>Promise<void>){setBusy(true);setError("");setNotice("");try{await action();}catch(e){setError(e instanceof Error?e.message:"Request failed");}finally{setBusy(false);}}
  useEffect(()=>{if(!token)return;const id=window.setInterval(()=>{refresh(token).catch(()=>{});},60000);return()=>clearInterval(id);},[token]);
  function reset(){setEditing(undefined);const f=fresh();setForm(f);setDate(localDate(f.release_at));setPrice("0.99");}
  function edit(d:Drop){setEditing(d);const {id,version,updated_at,...fields}=d;setForm(fields);setPrice((d.price_cents/100).toFixed(2));setDate(localDate(d.release_at));}
  async function login(e:FormEvent){e.preventDefault();await run(async()=>{const t=await adminLogin(email.trim(),password);await refresh(t);setToken(t);});setPassword("");}
  function save(state:DropInput["state"]){void run(async()=>{
    const cents=Math.round(Number(price)*100);const release=new Date(date);
    if(!form.name.trim()||!form.product_id.trim()||!/^\d+(\.\d{1,2})?$/.test(price)||cents<1||cents>99999||!Number.isFinite(release.getTime()))throw new Error("Enter an item name, valid product ID, price and release date.");
    if(state==="scheduled"&&(!editing||dropStatus(editing)!=="Live")&&release.getTime()<=Date.now())throw new Error("Choose a future release time.");
    const saved=await writeDrop(token,{...form,name:form.name.trim(),product_id:form.product_id.trim(),price_cents:cents,release_at:release.toISOString(),state},editing);
    edit(saved);await refresh();setNotice(state==="scheduled"?"Schedule saved. The catalog will reveal this item at release time. Purchases are not active.":"Draft saved.");
  });}
  const locked=editing&&(dropStatus(editing)==="Live"||editing.state==="archived");
  return <main className="drop-admin"><header className="drop-header"><div><small>JAMBEACON · OWNER CONTROL CENTER</small><h1>Fresh Drop Friday</h1></div><a href="/">Back to JamBeacon</a></header>
  {!dropsConfigured?<section className="drop-panel"><h2>Backend connection required</h2><p>Owner access is disabled until the JamBeacon database is configured. No demo password or local-only admin access is available.</p></section>:!token?<form className="drop-panel drop-form" onSubmit={login}><h2>Owner sign in</h2><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label><button disabled={busy}>{busy?"Signing in…":"Sign in"}</button></form>:<>
  <div className="drop-toolbar"><button onClick={reset} disabled={busy}>+ New drop</button><button onClick={()=>void run(()=>refresh())} disabled={busy}>Refresh</button><button onClick={()=>void run(async()=>{try{await adminLogout(token);}finally{setToken("");setItems([]);setAudit([]);reset();}})}>Sign out</button></div>
  <div className="drop-stats">{["Draft","Scheduled","Live","Archived"].map(s=><button key={s} onClick={()=>setFilter(s)} className={filter===s?"selected":""}><strong>{items.filter(d=>dropStatus(d)===s).length}</strong>{s}</button>)}</div>
  <section className="drop-panel"><div className="drop-toolbar"><h2>Release calendar</h2><select aria-label="Filter drops" value={filter} onChange={e=>setFilter(e.target.value)}>{["All","Draft","Scheduled","Live","Archived"].map(s=><option key={s}>{s}</option>)}</select></div>
  {items.filter(d=>filter==="All"||dropStatus(d)===filter).length===0?<p>No drops in this view.</p>:items.filter(d=>filter==="All"||dropStatus(d)===filter).map(d=><article className="drop-list-item" key={d.id}><div><strong>{d.name}</strong><small>{formatDate(d.release_at)} · {dropPrice(d.price_cents)} · {dropStatus(d)}</small></div><button onClick={()=>edit(d)} disabled={busy}>Edit / view</button></article>)}</section>
  <section className="drop-panel"><h2>{editing?"Edit "+editing.name:"Create a weekly drop"}</h2><form className="drop-form" onSubmit={e=>{e.preventDefault();save("scheduled");}}>
    <fieldset disabled={busy||editing?.state==="archived"}><label>Item name<input maxLength={100} required value={form.name} onChange={e=>patch("name",e.target.value)}/></label>
    <label>Category<select value={form.category} disabled={!!locked} onChange={e=>patch("category",e.target.value)}>{categories.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
    <label>Description<textarea maxLength={1000} value={form.description} onChange={e=>patch("description",e.target.value)}/></label>
    <label>Price (USD)<input type="number" min=".01" max="999.99" step=".01" required value={price} disabled={!!locked} onChange={e=>setPrice(e.target.value)}/></label>
    <label>Play Billing product ID<input pattern="[a-z0-9][a-z0-9_.]{2,99}" maxLength={100} required value={form.product_id} disabled={!!locked} placeholder="drop_texas_thunder" onChange={e=>patch("product_id",e.target.value)}/></label>
    <label>Artwork URL<input maxLength={2048} value={form.image_url} placeholder="/avatars/item.webp or https://…" onChange={e=>patch("image_url",e.target.value)}/></label>
    <label>Upload artwork (PNG, JPG or WebP, up to 5 MB)<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files?.[0];e.target.value="";if(file)void run(async()=>{const url=await uploadDropArtwork(token,file);patch("image_url",url);setNotice("Artwork uploaded. Save the draft or schedule to attach it.");});}}/></label>
    {form.image_url&&<small>Artwork is publicly accessible by its URL. Upload product art only.</small>}
    <label>Release date and time ({tz})<input type="datetime-local" required value={date} disabled={!!locked} onChange={e=>setDate(e.target.value)}/></label>
    <label className="drop-check"><input type="checkbox" checked={form.featured} onChange={e=>patch("featured",e.target.checked)}/> Feature on the Beacon home screen</label>
    <label className="drop-check"><input type="checkbox" checked={form.notify_members} onChange={e=>patch("notify_members",e.target.checked)}/> Request notification (delivery not connected)</label>
    <label className="drop-check"><input type="checkbox" checked={form.auto_equip} onChange={e=>patch("auto_equip",e.target.checked)}/> Request auto-equip after verified purchase (not connected)</label>
    <div className="drop-toolbar">{!locked&&<button type="button" onClick={()=>save("draft")}>Save draft</button>}<button type="submit">{locked?"Save changes":"Schedule release"}</button></div></fieldset>
  </form>{editing&&editing.state!=="archived"&&<button className="drop-danger" disabled={busy} onClick={()=>{if(window.confirm("Archive this drop? It will be hidden from the catalog."))void run(async()=>{const {id,version,updated_at,...fields}=editing;edit(await writeDrop(token,{...fields,state:"archived"},editing));await refresh();setNotice("Archived.");});}}>Archive item</button>}</section>
  <section className="drop-panel"><h2>Activity log</h2>{audit.length===0?<p>No activity yet.</p>:audit.map(a=><article className="drop-list-item" key={a.id}><div><strong>{a.action==="INSERT"?"Created":"Updated"} · {a.after_value.name}</strong><small>{formatDate(a.changed_at)} · {a.actor_id||"System"}</small></div></article>)}</section></>}
  {error&&<p role="alert" className="drop-error">{error}</p>}{notice&&<p role="status" className="drop-notice">{notice}</p>}
  </main>;
}
