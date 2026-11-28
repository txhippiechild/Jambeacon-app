import { useEffect,useState } from "react";
import { dropsConfigured,releasedDrops,dropPrice,type Drop } from "./freshDrops";
import "./freshDrops.css";

export default function FreshDrops({featuredOnly=false}:{featuredOnly?:boolean}){
  const [items,setItems]=useState<Drop[]>([]),[failed,setFailed]=useState(false);
  useEffect(()=>{if(!dropsConfigured)return;let active=true;const load=()=>releasedDrops().then(d=>{if(active){setItems(d);setFailed(false);}}).catch(()=>{if(active)setFailed(true);});void load();const timer=window.setInterval(load,60000);return()=>{active=false;clearInterval(timer);};},[]);
  if(!dropsConfigured)return null;
  const visible=items.filter(d=>!featuredOnly||d.featured);
  if(featuredOnly&&(!visible.length||failed))return null;
  return <section className="drop-catalog" aria-label="Fresh Drop Friday"><h2>⚡ Fresh Drop Friday</h2>{failed?<p>Weekly drops are temporarily unavailable.</p>:!visible.length?<p>New gear drops here every Friday.</p>:visible.map(d=><article key={d.id} className="drop-product">{d.image_url&&<img src={d.image_url} alt={d.name} loading="lazy" referrerPolicy="no-referrer"/>}<div><strong>{d.name}</strong><p>{d.description}</p><b>{dropPrice(d.price_cents)} USD</b><small>Purchase coming soon · no charges</small></div></article>)}</section>;
}
