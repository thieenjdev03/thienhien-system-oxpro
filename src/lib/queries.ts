import {sql} from './db';
import {debt} from './debt';
import {totals,type Line} from './totals';
export type InvLine=Line&{id?:number;product_id:number|null;code?:string;name:string;unit:string};
export type Invoice={id:number;number:string|null;customer_id:number;date:string;status:'draft'|'issued'|'cancelled';discount:number;vat_percent:number;prepaid:number;note:string;cancel_reason:string|null;customer:string;lines:InvLine[];subtotal:number;after:number;vat:number;total:number};
const withTotals=(r:any):Invoice=>({...r,...totals(r.lines,r.discount,r.vat_percent)});
export async function getInvoices(where:{customer?:number;id?:number;status?:string}={},limit=500):Promise<Invoice[]>{
 const rows=await sql`select i.*,c.name customer,coalesce((select json_agg(json_build_object('id',l.id,'product_id',l.product_id,'code',p.code,'name',l.name,'unit',l.unit,'qty',l.qty,'price',l.price,'discount_percent',l.discount_percent) order by l.pos) from invoice_lines l left join products p on p.id=l.product_id where l.invoice_id=i.id),'[]') lines
  from invoices i join customers c on c.id=i.customer_id where (${where.customer??null}::int is null or i.customer_id=${where.customer??null}) and (${where.id??null}::int is null or i.id=${where.id??null}) and (${where.status??null}::text is null or i.status=${where.status??null})
  order by i.date desc,i.id desc limit ${limit}`;
 return rows.map(withTotals)}
export type Payment={id:number;customer_id:number;invoice_id:number|null;invoice_number:string|null;date:string;amount:number;method:string;note:string};
export async function getPayments(customer?:number):Promise<Payment[]>{
 return await sql`select p.id,p.customer_id,p.invoice_id,i.number invoice_number,p.date,p.amount,p.method,p.note from payments p left join invoices i on i.id=p.invoice_id where (${customer??null}::int is null or p.customer_id=${customer??null}) order by p.date,p.id` as any}
// Công nợ của tất cả khách (hoặc một khách): Map<customerId,balance>
export async function balances(customer?:number){
 const [cs,invs,pays]:any[][]=await Promise.all([
  sql`select id,opening_balance from customers where not is_retail and (${customer??null}::int is null or id=${customer??null})`,
  sql`select i.id,i.customer_id,coalesce(sum(round(l.qty*l.price*(1-l.discount_percent/100))),0) sub,i.discount,i.vat_percent from invoices i left join invoice_lines l on l.invoice_id=i.id where i.status='issued' and (${customer??null}::int is null or i.customer_id=${customer??null}) group by i.id order by i.date,i.id`,
  sql`select customer_id,invoice_id,amount from payments where (${customer??null}::int is null or customer_id=${customer??null})`]);
 const out=new Map<number,number>();
 for(const c of cs){const mine=invs.filter((i:any)=>i.customer_id===c.id).map((i:any)=>{const after=Math.max(0,i.sub-i.discount);return {id:i.id,total:after+Math.round(after*i.vat_percent/100)}});
  out.set(c.id,debt(c.opening_balance,mine,pays.filter((p:any)=>p.customer_id===c.id)).balance)}
 return out}
export type StatementRow={date:string;kind:'opening'|'invoice'|'payment';ref:string;note:string;debit:number;credit:number;balance:number;remaining?:number;cancelled?:boolean};
export async function statement(customerId:number){
 const [customer]=await sql`select * from customers where id=${customerId}`;if(!customer)return null;
 const [invs,pays]=await Promise.all([getInvoices({customer:customerId},5000),getPayments(customerId)]);
 const issued=invs.filter(i=>i.status==='issued').sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id);
 const d=debt(customer.opening_balance,issued.map(i=>({id:i.id,total:i.total})),pays);
 const ev:Omit<StatementRow,'balance'>[]=[
  ...(customer.opening_balance?[{date:'0000-00-00',kind:'opening' as const,ref:'Số dư đầu kỳ',note:'',debit:customer.opening_balance,credit:0}]:[]),
  ...invs.filter(i=>i.status!=='draft').map(i=>({date:i.date,kind:'invoice' as const,ref:i.number||'',note:i.status==='cancelled'?`Đã huỷ: ${i.cancel_reason||''}`:i.note,debit:i.status==='issued'?i.total:0,credit:0,remaining:i.status==='issued'?d.remaining.get(i.id):undefined,cancelled:i.status==='cancelled'})),
  ...pays.map(p=>({date:p.date,kind:'payment' as const,ref:`Thu tiền${p.invoice_number?` (${p.invoice_number})`:''}`,note:[p.method,p.note].filter(Boolean).join(' · '),debit:0,credit:p.amount}))];
 ev.sort((a,b)=>a.date.localeCompare(b.date)||(a.kind==='payment'?1:0)-(b.kind==='payment'?1:0));
 let bal=0;const rows:StatementRow[]=ev.map(e=>({...e,balance:(bal+=e.debit-e.credit)}));
 return {customer,rows,balance:d.balance,remaining:d.remaining,invoices:invs,payments:pays}}

export async function invoiceFormData(){
 const [customers,products,categories]=await Promise.all([sql`select id,name,is_retail from customers where not archived order by is_retail desc,name`,
  sql`select p.id,p.code,p.name,u.name unit,p.price from products p join units u on u.id=p.unit_id where not p.archived order by p.code`,sql`select id,name from categories where not archived order by id`]);
 return {customers,products,categories} as any}
