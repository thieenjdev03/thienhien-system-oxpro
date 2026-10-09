import {currentUser} from '@/lib/auth';
import {statementPdf} from '@/lib/pdf';
export const runtime='nodejs';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 if(!await currentUser())return new Response('Unauthorized',{status:401});const {id}=await params,q=new URL(req.url).searchParams;
 const buf=await statementPdf(Number(id),q.get('from')||'',q.get('to')||'');if(!buf)return new Response('Not found',{status:404});
 return new Response(new Uint8Array(buf),{headers:{'content-type':'application/pdf','content-disposition':`inline; filename="sao-ke-cong-no-${id}.pdf"`}})}
