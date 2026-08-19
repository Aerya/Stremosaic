import type { Request, Response } from 'express';
import { getUserConfig, getApiKeyFromConfig } from '../../services/configService.ts';
import { fetchPublicListMetas } from '../../services/bingebase.ts';
import { buildCatalogId } from '../../constants.ts';
import type { ContentType } from '../../types/index.ts';

export async function handleBingebaseCatalogRequest(userId:string,type:ContentType,catalogId:string,_extra:Record<string,string>,res:Response,_req:Request){
  try{
    const config:any=await getUserConfig(userId); if(!config)return res.json({metas:[]});
    const cat=config.catalogs.find((c:any)=>c.source==='bingebase' && buildCatalogId('bingebase',c)===catalogId);
    const url=cat?.filters?.bingebaseListUrl; if(!url)return res.json({metas:[]});
    const key=getApiKeyFromConfig(config); if(!key)return res.json({metas:[]});
    const metas=await fetchPublicListMetas(key,url,type);
    return res.json({metas});
  }catch{return res.json({metas:[]});}
}
