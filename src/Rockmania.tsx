import { useState, useEffect } from "react";
import "./rockmania.css";

export const levels = [
 {title:"Bedroom Rockstar", mission:"Save your avatar and artist profile", event:"identity", count:1, badge:"Bedroom Rockstar"},
 {title:"First Riff", mission:"Save a recorded take in the Jam Shack", event:"take", count:1, badge:"First Riff"},
 {title:"Garage Band", mission:"Play one backing track for at least 30 seconds", event:"practice", count:1, badge:"Garage Band"},
 {title:"Open Mic", mission:"Prepare a recording for peer review", event:"submission", count:1, badge:"Open Mic"},
 {title:"Sound Check", mission:"Write a constructive review draft", event:"review", count:1, badge:"Sound Check"},
 {title:"Local Legend", mission:"Write a collaboration discussion", event:"discussion", count:1, badge:"Local Legend"},
 {title:"Band Builder", mission:"Save a musician contact", event:"contact", count:1, badge:"Band Builder"},
 {title:"On the Road", mission:"Practice three different backing tracks", event:"practice", count:3, badge:"On the Road"},
 {title:"Main Stage", mission:"Save a second original take", event:"take", count:2, badge:"Main Stage"},
 {title:"Rockmania", mission:"Choose a recording for your showcase", event:"showcase", count:1, badge:"Rockmania"}
] as const;
export type EventKind = typeof levels[number]["event"];
export type Campaign = { intro:boolean; path:"band"|"solo"|null; events:Record<string,string[]>; xp:number };
const initial:Campaign={intro:false,path:null,events:{},xp:0};
const awards:Record<EventKind,number>={identity:10,take:5,practice:5,submission:10,review:5,discussion:10,contact:5,showcase:10};
const limits:Record<EventKind,number>={identity:1,take:20,practice:30,submission:3,review:3,discussion:3,contact:5,showcase:1};
export function completed(c:Campaign){let n=0;for(const l of levels){if((c.events[l.event]||[]).length<l.count)break;n++;}return n;}
export function award(c:Campaign,kind:EventKind,id:string):Campaign {
 const existing=c.events[kind]||[];
 if(!id||existing.includes(id)||existing.length>=limits[kind])return c;
 const next={...c,events:{...c.events,[kind]:[...existing,id]},xp:c.xp+awards[kind]};
 return {...next,xp:next.xp+10*(completed(next)-completed(c))};
}
export function useRockmania(){
 const [state,setState]=useState<Campaign>(()=>{try{const s=JSON.parse(localStorage.getItem("jambeacon-rockmania-v1")||"null");return s&&s.events&&typeof s.xp==="number"?s:initial;}catch{return initial;}});
 const [storageError,setStorageError]=useState(false);
 useEffect(()=>{try{localStorage.setItem("jambeacon-rockmania-v1",JSON.stringify(state));setStorageError(false);}catch{setStorageError(true);}},[state]);
 return {state,storageError,earn:(kind:EventKind,id:string)=>setState(c=>award(c,kind,id)),intro:()=>setState(c=>({...c,intro:true})),choose:(path:"band"|"solo")=>setState(c=>({...c,path}))};
}
export type Earn=(kind:EventKind,id:string)=>void;
export function CampaignPanel({state,go,earn,openOffer,storageError}:{state:Campaign;go:(page:"builder"|"profile"|"jams"|"loops"|"inbox")=>void;earn:Earn;openOffer:()=>void;storageError:boolean}){
 const [review,setReview]=useState("");
 const [feedback,setFeedback]=useState("");
 const done=completed(state), current=levels[Math.min(done,9)];
 const destinations=["builder","jams","loops","jams","jams","inbox","profile","loops","jams","profile"] as const;
 return <section className="screen rm-campaign"><div className="rm-card"><small>ROAD TO ROCKMANIA • CHAPTER ONE</small><h1>{done===10?"Rockmania champion":current.title}</h1><p>{Math.min(done+1,10)} / 10 levels · {state.xp} XP</p><progress max={10} value={done}/><p>{done===10?"Your next stage awaits.":current.mission}</p>{done<10&&<button onClick={()=>go(destinations[done])}>Go to mission →</button>}<small>Campaign preview • progress is saved on this device.</small>{storageError&&<p role="alert">Progress could not be saved to this device.</p>}</div>
 <ol className="rm-levels">{levels.map((l,i)=><li key={l.title}><b>{i+1}. {l.title}</b><span>{i<done?"✓ "+l.badge:i===done?"Current mission":"Locked"}</span><small>{l.mission}</small></li>)}</ol>
 <div className="rm-card"><h2>Review rehearsal</h2><p>Practice giving useful feedback. This is a private draft, not a published peer review.</p><textarea aria-label="Review draft" value={review} onChange={e=>setReview(e.target.value)} placeholder="What works? What could improve?" maxLength={1200}/><button disabled={review.trim().length<40} onClick={()=>{try{localStorage.setItem("jambeacon-review-draft",review.trim());earn("review","first-draft");setFeedback("Private review draft saved.");}catch{setFeedback("Could not save draft.");}}}>Save review draft</button><p role="status">{feedback}</p></div>
 <div className="rm-card"><h2>Invite your crew</h2><p>Share JamBeacon. Verified referral XP will be available when accounts are connected.</p><button onClick={async()=>{try{if(navigator.share)await navigator.share({title:"JamBeacon",url:"https://jambeacon.com"});else await navigator.clipboard.writeText("https://jambeacon.com");setFeedback("Invite link ready.");}catch{setFeedback("Share cancelled or unavailable.");}}}>Share JamBeacon</button></div>
 <div className="rm-card"><h2>Backstage Pass • $9.99</h2><p>Planned one-time supporter package. Payments are not enabled in this test build.</p><button onClick={openOffer}>Supporter details</button></div></section>;
}
export function StoryScene({scene,finish,choose,cast}:{scene:"dream"|"invite";finish:()=>void;choose:(p:"band"|"solo")=>void;cast:string[]}){
 return <div className="modal-backdrop"><section role="dialog" aria-modal="true" aria-label={scene==="dream"?"The dream":"The invitation"} className="unlock-modal rm-story">
 {scene==="dream"?<><small>CHAPTER 1 • THE DREAM</small><h2>Every rock star starts somewhere.</h2><p>The alarm rings. School is calling, but your guitar is louder. One riff turns your bedroom into a packed arena. Then the alarm pulls you back.</p><div className="rm-cast">{cast.slice(0,3).map((src,i)=><img key={src} src={src} alt={"JamBeacon cast member "+(i+1)}/>)}</div><audio controls preload="none" src="/audio/loops-v2/arena-drive-135bpm.mp3"/><small>Preview soundtrack: Arena Drive. Cinematic video not yet available.</small><button onClick={finish}>Wake up &amp; enter JamBeacon</button><button onClick={finish}>Skip intro</button></>:<><small>CHAPTER 2 • THE INVITATION</small><h2>Ready to join the band?</h2><div className="rm-cast">{cast.map((src,i)=><img key={src} src={src} alt={"JamBeacon cast member "+(i+1)}/>)}</div><p>TX Hippie Child: We have the music. We have the crew. What we're missing is you. Wanna make some noise?</p><button onClick={()=>choose("band")}>I'm in! → Jam Shack</button><button onClick={()=>choose("solo")}>Not ready yet → Build my avatar</button><small>Both paths can complete all ten levels.</small></>}</section></div>;
}
type Extra={hometown:string;age:string;photos:string[];contacts:string[]};
const blank:Extra={hometown:"",age:"",photos:[],contacts:[]};
function resizePhoto(file:File):Promise<string>{return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{try{const scale=Math.min(1,480/Math.max(img.width,img.height));const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext("2d");if(!ctx)throw Error();ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",.72));}catch(e){reject(e);}finally{URL.revokeObjectURL(url);}};img.onerror=()=>{URL.revokeObjectURL(url);reject(Error());};img.src=url;});}
export function ProfileExtras({state,earn,live,toggle,go}:{state:Campaign;earn:Earn;live:boolean;toggle:()=>void;go:()=>void}){
 const [extra,setExtra]=useState<Extra>(()=>{try{return {...blank,...JSON.parse(localStorage.getItem("jambeacon-profile-extras-v1")||"{}")};}catch{return blank;}}),[contact,setContact]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const save=(next:Extra)=>{try{localStorage.setItem("jambeacon-profile-extras-v1",JSON.stringify(next));setExtra(next);setError("");return true;}catch{setError("Device storage is full or unavailable.");return false;}};
 const done=completed(state);
 return <div className="rm-card"><h2>My music journey</h2><p>Level {Math.min(done+1,10)} · {state.xp} XP · {done===10?"Rockmania":levels[done].title}</p><p>{levels.slice(0,done).map(l=>l.badge).join(" • ")||"No badges yet"}</p><button onClick={go}>Continue campaign</button>
 <label>Hometown (optional, private)<input maxLength={80} value={extra.hometown} onChange={e=>save({...extra,hometown:e.target.value})}/></label><label>Age range (optional, private)<select value={extra.age} onChange={e=>save({...extra,age:e.target.value})}><option value="">Prefer not to say</option><option>Under 18</option><option>18–24</option><option>25–34</option><option>35–44</option><option>45+</option></select></label>
 <button onClick={toggle}>Beacon preview: {live?"On":"Off"}</button><small>Local preview only. No real location is shared.</small><h3>My instruments · {extra.photos.length}/5</h3><div className="rm-photos">{extra.photos.map((src,i)=><div key={i}><img src={src} alt={"Instrument "+(i+1)}/><button onClick={()=>save({...extra,photos:extra.photos.filter((_,n)=>n!==i)})}>Remove</button></div>)}</div>
 <label>Upload equipment photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy||extra.photos.length>=5} onChange={async e=>{const f=e.target.files?.[0];e.target.value="";if(!f)return;if(f.size>12000000){setError("Choose an image under 12 MB.");return;}setBusy(true);try{const image=await resizePhoto(f);save({...extra,photos:[...extra.photos,image].slice(0,5)});}catch{setError("Unable to read this photo.");}finally{setBusy(false);}}}/></label>
 <h3>My Jam Crew</h3><small>Private contact notes, not verified JamBeacon connections.</small>{extra.contacts.map(name=><div key={name}>{name} <button onClick={()=>save({...extra,contacts:extra.contacts.filter(n=>n!==name)})}>Remove</button></div>)}<form onSubmit={e=>{e.preventDefault();const name=contact.trim();if(name&&!extra.contacts.includes(name)&&extra.contacts.length<50&&save({...extra,contacts:[...extra.contacts,name]})){earn("contact",name.toLowerCase());setContact("");}}}><input aria-label="Musician contact name" maxLength={80} value={contact} onChange={e=>setContact(e.target.value)}/><button>Add contact</button></form>{error&&<p role="alert">{error}</p>}</div>;
}
