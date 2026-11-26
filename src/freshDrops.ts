export type Drop = {
  id: string; name: string; description: string; category: string; price_cents: number;
  product_id: string; image_url: string; release_at: string; state: "draft"|"scheduled"|"archived";
  featured: boolean; notify_members: boolean; auto_equip: boolean; version: number; updated_at: string;
};
export type DropInput = Omit<Drop,"id"|"version"|"updated_at">;
export type DropAudit = { id:number; drop_id:string; actor_id:string|null; action:string; changed_at:string; after_value:Drop };
const env = (import.meta as unknown as {env: Record<string,string|undefined>}).env;
const base = (env.VITE_SUPABASE_URL || "").replace(/\/$/,"");
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
export const dropsConfigured = /^https:\/\//.test(base) && !!key;

async function request<T>(path:string, token?:string, method="GET", data?:unknown, prefer?:string):Promise<T>{
  if(!dropsConfigured) throw new Error("JamBeacon backend has not been connected.");
  const headers:Record<string,string> = {apikey:key,"Content-Type":"application/json"};
  if(token) headers.Authorization = "Bearer "+token;
  if(prefer) headers.Prefer=prefer;
  const res=await fetch(base+path,{method,headers,body:data===undefined?undefined:JSON.stringify(data),cache:"no-store"});
  const result=await res.json().catch(()=>null);
  if(!res.ok) throw new Error(res.status===401?"Session expired or sign-in failed. Please sign in again.":String(result?.message||result?.msg||"Request failed ("+res.status+")"));
  return result as T;
}
export async function adminLogin(email:string,password:string):Promise<string>{
  const session=await request<{access_token:string}>("/auth/v1/token?grant_type=password",undefined,"POST",{email,password});
  if(!session.access_token) throw new Error("No session returned.");
  const allowed=await request<boolean>("/rest/v1/rpc/jb_is_drop_admin",session.access_token,"POST",{});
  if(!allowed){await adminLogout(session.access_token).catch(()=>{});throw new Error("This account has not been granted owner access.");}
  return session.access_token;
}
export async function adminLogout(token:string){await request("/auth/v1/logout?scope=local",token,"POST");}
export function adminDrops(token:string){return request<Drop[]>("/rest/v1/jb_weekly_drops?select=*&order=release_at.asc",token);}
export function auditDrops(token:string){return request<DropAudit[]>("/rest/v1/jb_drop_audit?select=id,drop_id,actor_id,action,changed_at,after_value&order=id.desc&limit=50",token);}
export function releasedDrops(){return request<Drop[]>("/rest/v1/jb_weekly_drops?select=*&state=eq.scheduled&order=release_at.desc&limit=100");}
export async function writeDrop(token:string,values:DropInput,existing?:Drop):Promise<Drop>{
  const path="/rest/v1/jb_weekly_drops"+(existing?"?id=eq."+encodeURIComponent(existing.id)+"&version=eq."+existing.version:"");
  const rows=await request<Drop[]>(path,token,existing?"PATCH":"POST",values,"return=representation");
  if(rows.length!==1) throw new Error("Drop changed elsewhere or access was denied. Reload before editing.");
  return rows[0];
}
export const dropPrice=(cents:number)=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(cents/100);
export const dropStatus=(d:Drop)=>d.state==="scheduled"?(Date.parse(d.release_at)<=Date.now()?"Live":"Scheduled"):d.state==="draft"?"Draft":"Archived";

export async function uploadDropArtwork(token:string,file:File):Promise<string>{
  if(!dropsConfigured)throw new Error("Backend not configured.");
  const extensions:Record<string,string>={"image/png":"png","image/jpeg":"jpg","image/webp":"webp"};
  const ext=extensions[file.type];if(!ext||file.size>5*1024*1024||!file.size)throw new Error("Choose a PNG, JPG or WebP image up to 5 MB.");
  const path=crypto.randomUUID()+"."+ext;
  const res=await fetch(base+"/storage/v1/object/jb-drop-art/"+path,{method:"POST",headers:{apikey:key,Authorization:"Bearer "+token,"Content-Type":file.type,"x-upsert":"false"},body:file});
  if(!res.ok)throw new Error("Artwork upload failed ("+res.status+"). Check your session and storage configuration.");
  return base+"/storage/v1/object/public/jb-drop-art/"+path;
}
