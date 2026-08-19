import { Router, type Request } from 'express';
import { requireAuth, requireConfigOwnership } from '../utils/authMiddleware.ts';
import { getUserConfig, saveUserConfig, getApiKeyFromConfig } from '../services/configService.ts';
import { encrypt } from '../utils/encryption.ts';
import { fetchPublicProfileLists, fetchPublicListMetas } from '../services/bingebase.ts';

const router = Router();
const BASE = 'https://bingebase.com';
const UA = 'Stremosaic/0.1 (+https://github.com/Aerya/Stremosaic)';

async function bb(path: string, init: RequestInit = {}) {
  const r = await fetch(`${BASE}${path}`, { ...init, headers: { 'content-type':'application/json', 'user-agent':UA, ...(init.headers||{}) } });
  const text = await r.text();
  let data:any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!r.ok) { const e:any = new Error(data?.error || `Bingebase HTTP ${r.status}`); e.status=r.status; throw e; }
  return data;
}

router.use('/:userId', requireAuth, requireConfigOwnership);

router.get('/:userId/status', async (req, res) => {
  const c:any = await getUserConfig(req.params.userId);
  res.json({ connected: !!c?.bingebaseAccessTokenEncrypted, username: c?.bingebaseUsername || '' });
});

router.post('/:userId/device/code', async (_req, res) => {
  try { res.json(await bb('/api/v1/kodi/device/code', { method:'POST', body:'{}' })); }
  catch(e:any){ res.status(e.status||502).json({error:e.message}); }
});

router.post('/:userId/device/token', async (req, res) => {
  try {
    const device_code = String(req.body?.device_code || '');
    if (!device_code) return res.status(400).json({error:'device_code requis'});
    const data = await bb('/api/v1/kodi/device/token', { method:'POST', body:JSON.stringify({device_code}) });
    if (!data.access_token) return res.status(202).json({ pending:true });
    const c:any = await getUserConfig(req.params.userId);
    if (!c) return res.status(404).json({error:'Configuration introuvable'});
    c.bingebaseAccessTokenEncrypted = encrypt(String(data.access_token)) || undefined;
    await saveUserConfig(c);
    res.json({ connected:true });
  } catch(e:any) {
    if (e.status === 400) return res.status(202).json({ pending:true, error:e.message });
    res.status(e.status||502).json({error:e.message});
  }
});

router.post('/:userId/disconnect', async (req, res) => {
  const c:any = await getUserConfig(req.params.userId);
  if (!c) return res.status(404).json({error:'Configuration introuvable'});
  delete c.bingebaseAccessTokenEncrypted; delete c.bingebaseUsername;
  await saveUserConfig(c); res.json({connected:false});
});

router.get('/:userId/lists', async (req, res) => {
  try {
    const username=String(req.query.username||'').trim().replace(/^@/,'');
    if(!/^[A-Za-z0-9._-]{1,64}$/.test(username)) return res.status(400).json({error:'Nom Bingebase invalide'});
    const lists=await fetchPublicProfileLists(username);
    const c:any=await getUserConfig(req.params.userId); if(c){c.bingebaseUsername=username; await saveUserConfig(c);}
    res.json({username,lists});
  }catch(e:any){res.status(502).json({error:e.message});}
});

router.get('/:userId/public-list', async (req, res) => {
  try {
    const c:any=await getUserConfig(req.params.userId); const apiKey=getApiKeyFromConfig(c); if(!apiKey) return res.status(400).json({error:'Clé TMDB absente'});
    const type=(String(req.query.type||'movie')==='series'?'series':'movie') as any;
    const metas=await fetchPublicListMetas(apiKey,String(req.query.url||''),type);
    res.json({metas});
  }catch(e:any){res.status(502).json({error:e.message});}
});

export { router as bingebaseRouter };
