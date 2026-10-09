'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {requireAdmin,requireUser} from '@/lib/auth';
import {sql} from '@/lib/db';
import {statement} from '@/lib/queries';
import {today} from '@/lib/money';
const bump=(id?:number)=>{revalidatePath('/admin/customers');revalidatePath('/admin');if(id)revalidatePath(`/admin/customers/${id}`)};
export async function saveCustomer(fd:FormData){
 const u=await requireUser();const id=Number(fd.get('id')),name=String(fd.get('name')).trim();if(!name)return;
 const f=(k:string)=>String(fd.get(k)||'').trim();const opening=Math.max(0,Math.round(Number(fd.get('opening'))||0));
 if(id){await sql`update customers set name=${name},phone=${f('phone')},address=${f('address')},tax_code=${f('tax_code')},note=${f('note')} where id=${id} and not is_retail`;
  if(u.role==='admin')await sql`update customers set opening_balance=${opening} where id=${id} and not is_retail`;bump(id)}
 else{const [c]=await sql`insert into customers(name,phone,address,tax_code,note,opening_balance) values(${name},${f('phone')},${f('address')},${f('tax_code')},${f('note')},${u.role==='admin'?opening:0}) returning id`;bump();redirect(`/admin/customers/${c.id}`)}}
export async function removeCustomer(fd:FormData){await requireAdmin();const id=Number(fd.get('id'));
 const r=await sql`delete from customers c where id=${id} and not is_retail and opening_balance=0 and not exists(select 1 from invoices where customer_id=c.id) and not exists(select 1 from payments where customer_id=c.id) returning id`;
 if(!r.length)await sql`update customers set archived=true where id=${id} and not is_retail`;bump(id);redirect('/admin/customers')}
export async function restoreCustomer(fd:FormData){await requireAdmin();const id=Number(fd.get('id'));await sql`update customers set archived=false where id=${id}`;bump(id)}
export async function addPayment(fd:FormData){
 const u=await requireUser();const customer=Number(fd.get('customer')),amount=Math.round(Number(fd.get('amount'))||0),invoice=Number(fd.get('invoice'))||null;
 if(amount<=0)return;
 const s=await statement(customer);if(!s||s.customer.is_retail)return;
 if(invoice){const rem=s.remaining.get(invoice);if(rem===undefined||amount>rem)throw new Error('Số tiền vượt quá phần còn nợ của phiếu')}
 await sql`insert into payments(customer_id,invoice_id,date,amount,method,note,created_by) values(${customer},${invoice},${String(fd.get('date'))||today()},${amount},${String(fd.get('method')||'Tiền mặt')},${String(fd.get('note')||'').trim()},${u.id})`;bump(customer)}
export async function relinkPayment(fd:FormData){
 await requireUser();const id=Number(fd.get('id')),invoice=Number(fd.get('invoice'))||null;
 const [p]=await sql`select customer_id,amount from payments where id=${id}`;if(!p)return;
 if(invoice){const s=await statement(p.customer_id);const rem=s?.remaining.get(invoice);
  const [own]=await sql`select amount from payments where id=${id} and invoice_id=${invoice}`;
  if(rem===undefined||p.amount>rem+(own?.amount||0))throw new Error('Phiếu không hợp lệ hoặc không đủ phần còn nợ')}
 await sql`update payments set invoice_id=${invoice} where id=${id}`;bump(p.customer_id)}
export async function deletePayment(fd:FormData){await requireAdmin();const id=Number(fd.get('id'));
 const [p]=await sql`delete from payments where id=${id} returning customer_id`;if(p)bump(p.customer_id)}
