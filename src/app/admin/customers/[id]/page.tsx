import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {statement} from '@/lib/queries';
import {fdate,today,vnd} from '@/lib/money';
import {addPayment,deletePayment,relinkPayment,removeCustomer,restoreCustomer,saveCustomer} from '../actions';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{from?:string;to?:string}>}){
 const u=await requireUser(),admin=u.role==='admin',{id}=await params,{from='',to=''}=await searchParams;
 const s=await statement(Number(id));if(!s||s.customer.is_retail)notFound();const c=s.customer;
 const open=s.invoices.filter(i=>i.status==='issued'&&(s.remaining.get(i.id)||0)>0);
 const rows=s.rows.filter(r=>r.kind==='opening'||((!from||r.date>=from)&&(!to||r.date<=to)));
 const q=new URLSearchParams({...(from&&{from}),...(to&&{to})}).toString();
 return <><h1>{c.name}{c.archived&&' (đã lưu trữ)'}</h1>
 <div className="cards"><div>Công nợ hiện tại<b>{vnd(s.balance)} ₫</b></div><div>Số dư đầu kỳ<b>{vnd(c.opening_balance)} ₫</b></div><div>Phiếu đã xuất<b>{s.invoices.filter(i=>i.status==='issued').length}</b></div></div>
 <details className="form" style={{display:'block'}}><summary><b>Thông tin khách hàng</b></summary><form action={saveCustomer} className="row" style={{marginTop:10,alignItems:'end'}}><input type="hidden" name="id" value={c.id}/>
  <label>Tên *<input name="name" required defaultValue={c.name}/></label><label>SĐT<input name="phone" defaultValue={c.phone}/></label><label>Địa chỉ<input name="address" defaultValue={c.address}/></label><label>MST<input name="tax_code" defaultValue={c.tax_code}/></label><label>Ghi chú<input name="note" defaultValue={c.note}/></label>
  {admin&&<label>Số dư đầu kỳ (₫)<input name="opening" type="number" min="0" defaultValue={c.opening_balance}/></label>}<button>Lưu</button></form>
  {admin&&<form action={c.archived?restoreCustomer:removeCustomer} style={{marginTop:8}}><input type="hidden" name="id" value={c.id}/><button className={c.archived?'o':'d'}>{c.archived?'Khôi phục':'Xoá / lưu trữ khách hàng'}</button></form>}</details>
 {!c.archived&&<><h2 id="thu-tien">Thu tiền</h2><form action={addPayment} className="form"><input type="hidden" name="customer" value={c.id}/>
  <label>Ngày<input type="date" name="date" defaultValue={today()} required/></label><label>Số tiền (₫) *<input name="amount" type="number" min="1" required/></label>
  <label>Hình thức<select name="method"><option>Tiền mặt</option><option>Chuyển khoản</option></select></label>
  <label>Trừ vào phiếu<select name="invoice"><option value="">Tự động (phiếu cũ nhất trước)</option>{open.map(i=><option key={i.id} value={i.id}>{i.number} – còn {vnd(s.remaining.get(i.id)||0)}</option>)}</select></label>
  <label>Ghi chú<input name="note"/></label><button>Ghi nhận thu tiền</button></form>
  <Link className="btn" href={`/admin/invoices/new?customer=${c.id}`}>+ Lập phiếu bán hàng</Link></>}
 <h2>Sao kê công nợ</h2><form className="form"><label>Từ ngày<input type="date" name="from" defaultValue={from}/></label><label>Đến ngày<input type="date" name="to" defaultValue={to}/></label><button className="o">Lọc</button><a className="btn" href={`/api/customers/${c.id}/statement.pdf?${q}`}>Xuất PDF</a></form>
 <table><thead><tr><th>Ngày</th><th>Chứng từ</th><th>Ghi chú</th><th className="n">Phát sinh nợ</th><th className="n">Đã thu</th><th className="n">Công nợ luỹ kế</th><th className="n">Còn nợ phiếu</th></tr></thead><tbody>
 {rows.map((r,i)=><tr key={i} className={r.cancelled?'off':''}><td>{r.kind==='opening'?'':fdate(r.date)}</td><td>{r.kind==='invoice'&&!r.cancelled?<Link href={`/admin/invoices/${s.invoices.find(x=>x.number===r.ref)?.id}`}>{r.ref}</Link>:r.ref}</td><td>{r.note}</td><td className="n">{r.debit?vnd(r.debit):''}</td><td className="n">{r.credit?vnd(r.credit):''}</td><td className="n"><b>{vnd(r.balance)}</b></td><td className="n">{r.remaining===undefined?'':vnd(r.remaining)}</td></tr>)}</tbody></table>
 {s.payments.length>0&&<><h2>Các lần thu tiền</h2><table><thead><tr><th>Ngày</th><th className="n">Số tiền</th><th>Hình thức</th><th>Trừ vào</th><th/></tr></thead><tbody>
  {[...s.payments].reverse().map(p=><tr key={p.id}><td>{fdate(p.date)}</td><td className="n">{vnd(p.amount)}</td><td>{p.method} {p.note}</td>
  <td><form action={relinkPayment} className="row"><input type="hidden" name="id" value={p.id}/><select name="invoice" defaultValue={p.invoice_id??''}><option value="">Tự động</option>{s.invoices.filter(i=>i.status==='issued').map(i=><option key={i.id} value={i.id}>{i.number}</option>)}</select><button className="o">Đổi</button></form></td>
  <td>{admin&&<form action={deletePayment}><input type="hidden" name="id" value={p.id}/><button className="d">Xoá</button></form>}</td></tr>)}</tbody></table></>}</>}
