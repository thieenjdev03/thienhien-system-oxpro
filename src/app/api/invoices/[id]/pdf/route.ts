import {currentUser} from '@/lib/auth';
import {invoicePdf} from '@/lib/pdf';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){
 if(!await currentUser())return new Response('Unauthorized',{status:401});const {id}=await params;
 const buf=await invoicePdf(Number(id));if(!buf)return new Response('Not found',{status:404});
 return new Response(new Uint8Array(buf),{headers:{'content-type':'application/pdf','content-disposition':`inline; filename="phieu-ban-hang-${id}.pdf"`}})}
