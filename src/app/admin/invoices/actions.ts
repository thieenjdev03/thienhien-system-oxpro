'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {requireAdmin,requireUser} from '@/lib/auth';
import {sql} from '@/lib/db';
import {totals} from '@/lib/totals';
export type Payload={id?:number;customer_id:number;date:string;note:string;discount:number;vat_percent:number;prepaid:number;lines:{product_id:number|null;name:string;unit:string;qty:number;price:number;discount_percent:number}[]};
const bump=()=>{revalidatePath('/admin/invoices');revalidatePath('/admin/customers');revalidatePath('/admin')};
export async function saveInvoice(p:Payload,issue:boolean):Promise<{error:string}|void>{
 const u=await requireUser();
 const lines=p.lines.filter(l=>l.name.trim()||l.qty||l.price);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date))return {error:'Ngày không hợp lệ'};
 if(lines.some(l=>!l.name.trim()||!(l.qty>0)||l.price<0||l.discount_percent<0||l.discount_percent>100))return {error:'Mỗi dòng cần tên hàng, số lượng > 0, đơn giá ≥ 0, chiết khấu 0–100%'};
 if(p.discount<0||p.vat_percent<0||p.vat_percent>100||p.prepaid<0)return {error:'Chiết khấu, VAT hoặc tiền trả trước không hợp lệ'};
 if(issue&&!lines.length)return {error:'Phiếu chưa có dòng hàng nào'};
 const [c]=await sql`select id,is_retail,archived from customers where id=${p.customer_id}`;if(!c||c.archived)return {error:'Chọn khách hàng'};
 const {total}=totals(lines,p.discount,p.vat_percent);
 if(p.prepaid>total)return {error:'Tiền trả trước lớn hơn tổng phiếu'};
 if(issue&&c.is_retail&&p.prepaid!==total)return {error:'Khách lẻ phải trả đủ khi lập phiếu'};
 let id=p.id;
 try{await sql.begin(async tx=>{
  if(id){const [cur]=await tx`select status from invoices where id=${id} for update`;if(!cur||cur.status!=='draft')throw new Error('Chỉ sửa được phiếu nháp');
   await tx`update invoices set customer_id=${p.customer_id},date=${p.date},note=${p.note},discount=${p.discount},vat_percent=${p.vat_percent},prepaid=${p.prepaid} where id=${id}`;await tx`delete from invoice_lines where invoice_id=${id}`}
  else{const [r]=await tx`insert into invoices(customer_id,date,note,discount,vat_percent,prepaid,created_by) values(${p.customer_id},${p.date},${p.note},${p.discount},${p.vat_percent},${p.prepaid},${u.id}) returning id`;id=r.id}
  for(const [i,l] of lines.entries())await tx`insert into invoice_lines(invoice_id,pos,product_id,name,unit,qty,price,discount_percent) values(${id!},${i},${l.product_id},${l.name.trim()},${l.unit.trim()},${l.qty},${l.price},${l.discount_percent})`;
  if(issue){const y=Number(p.date.slice(0,4));const [k]=await tx`insert into invoice_counters(year,last) values(${y},1) on conflict(year) do update set last=invoice_counters.last+1 returning last`;
   await tx`update invoices set status='issued',number=${`PBH-${y}-${String(k.last).padStart(4,'0')}`} where id=${id!}`;
   if(p.prepaid>0)await tx`insert into payments(customer_id,invoice_id,date,amount,method,note,created_by) values(${p.customer_id},${id!},${p.date},${p.prepaid},'Tiền mặt','Trả trước khi lập phiếu',${u.id})`}
 })}catch(e){return {error:(e as Error).message}}
 bump();redirect(`/admin/invoices/${id}`)}
export async function cancelInvoice(fd:FormData){await requireAdmin();const id=Number(fd.get('id')),reason=String(fd.get('reason')||'').trim();if(!reason)return;
 await sql.begin(async tx=>{const r=await tx`update invoices set status='cancelled',cancel_reason=${reason} where id=${id} and status='issued' returning id`;if(r.length)await tx`update payments set invoice_id=null where invoice_id=${id}`});
 bump();revalidatePath(`/admin/invoices/${id}`)}
export async function deleteDraft(fd:FormData){await requireUser();await sql`delete from invoices where id=${Number(fd.get('id'))} and status='draft'`;bump();redirect('/admin/invoices')}
export async function quickCreateProduct(p:{code:string;name:string;category_id:number;unit:string;price:number}):Promise<{error:string}|{id:number;code:string}>{
 await requireAdmin();const code=p.code.trim().toUpperCase();if(!code||!p.name.trim())return {error:'Thiếu mã hoặc tên'};
 await sql`insert into units(name) values(${p.unit.trim()||'Cái'}) on conflict do nothing`;
 try{const [r]=await sql`insert into products(code,name,category_id,unit_id,price) values(${code},${p.name.trim()},${p.category_id},(select id from units where name=${p.unit.trim()||'Cái'}),${Math.max(0,Math.round(p.price))}) returning id`;
  revalidatePath('/admin/products');revalidatePath('/');return {id:r.id,code}}catch{return {error:'Mã hàng đã tồn tại'}}}
