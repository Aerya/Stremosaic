import * as tmdb from './tmdb/index.ts';
import type { ContentType, StremioMetaPreview } from '../types/index.ts';

const BASE='https://bingebase.com';
const UA='Stremosaic/0.1 (+https://github.com/Aerya/Stremosaic)';

export async function fetchPublicProfileLists(username:string){
  let r=await fetch(`${BASE}/users/${encodeURIComponent(username)}/lists`,{headers:{'user-agent':UA}});
  if(!r.ok) r=await fetch(`${BASE}/users/${encodeURIComponent(username)}`,{headers:{'user-agent':UA}});
  const html=await r.text(); if(!r.ok) throw new Error(`Bingebase HTTP ${r.status}`);
  const re=/href=["'](\/users\/[^"']+\/lists\/[^"'#?]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const seen=new Set<string>(); const lists:{name:string;url:string}[]=[]; let m:RegExpExecArray|null;
  while((m=re.exec(html))!==null){ const url=`${BASE}${m[1]}`; if(seen.has(url))continue; seen.add(url); const name=m[2].replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim(); if(name)lists.push({name,url}); }
  return lists;
}

export async function fetchPublicListMetas(apiKey:string,listUrl:string,type:ContentType):Promise<StremioMetaPreview[]>{
  if(!/^https:\/\/bingebase\.com\/users\/[^/]+\/lists\/[^/?#]+$/i.test(listUrl)) throw new Error('URL de liste Bingebase invalide');
  const r=await fetch(listUrl,{headers:{'user-agent':UA}}); const html=await r.text(); if(!r.ok) throw new Error(`Bingebase HTTP ${r.status}`);
  const wanted=type==='series'?'series':'movie';
  const re=/href=["']\/(movies|tv)\/([^"'/?#]+?)-(\d{4})["']/gi; const items:{slug:string;year:number}[]=[]; const seen=new Set<string>(); let m:RegExpExecArray|null;
  while((m=re.exec(html))!==null && items.length<100){ const kind=m[1]==='tv'?'series':'movie'; if(kind!==wanted)continue; const key=`${m[1]}:${m[2]}:${m[3]}`; if(seen.has(key))continue; seen.add(key); items.push({slug:m[2],year:Number(m[3])}); }
  const metas:StremioMetaPreview[]=[];
  for(const item of items.slice(0,50)){
    const data:any=await tmdb.search(apiKey,item.slug.replace(/-/g,' '),wanted as ContentType,1);
    const rows=Array.isArray(data?.results)?data.results:[];
    const hit=rows.find((x:any)=>String((wanted==='series'?x.first_air_date:x.release_date)||'').startsWith(String(item.year)))||rows[0];
    if(hit){ const details:any=await tmdb.getDetails(apiKey,hit.id,wanted as ContentType); const meta=await tmdb.toStremioMetaPreview(details,wanted as ContentType,null,null,null); if(meta)metas.push(meta); }
  }
  return metas;
}
