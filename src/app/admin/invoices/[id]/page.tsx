import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import {getInvoices,invoiceFormData} from '@/lib/queries';
import {docTien,fdate,vnd} from '@/lib/money';
import {lineAmount} from '@/lib/totals';
import InvoiceForm from '@/components/invoice-form';
import {cancelInvoice,deleteDraft} from '../actions';
const L={draft:'Nháp',issued:'Đã xuất',cancelled:'Đã huỷ'};
export default async function Page({params}:{params:Promise<{id:string}>}){
 const u=await requireUser(),admin=u.role==='admin',{id}=await params;
 const [i]=await getInvoices({id:Number(id)});if(!i)notFound();
 if(i.status==='draft'){const d=await invoiceFormData();
  return <><h1>Phiếu nháp #{i.id}</h1><form action={deleteDraft} style={{marginBottom:10}}><input type="hidden" name="id" value={i.id}/><button className="d">Xoá nháp</button></form>
  <InvoiceForm {...d} isAdmin={admin} init={{id:i.id,customer_id:i.customer_id,date:i.date,note:i.note,discount:i.discount,vat_percent:i.vat_percent,prepaid:i.prepaid,lines:i.lines}}/></>}
 return <><h1>{i.number} <span className={`tag ${i.status}`}>{L[i.status]}</span></h1>
 <p>Khách hàng: <b>{i.customer}</b> · Ngày {fdate(i.date)}{i.note&&` · ${i.note}`}</p>
 {i.status==='cancelled'&&<p className="err">Đã huỷ: {i.cancel_reason}</p>}
 <table><thead><tr><th>#</th><th>Mã</th><th>Tên hàng</th><th>ĐVT</th><th className="n">SL</th><th className="n">Đơn giá</th><th className="n">CK %</th><th className="n">Thành tiền</th></tr></thead><tbody>
 {i.lines.map((l,k)=><tr key={k}><td>{k+1}</td><td>{l.code}</td><td>{l.name}</td><td>{l.unit}</td><td className="n">{l.qty}</td><td className="n">{vnd(l.price)}</td><td className="n">{l.discount_percent||''}</td><td className="n">{vnd(lineAmount(l))}</td></tr>)}</tbody></table>
 <div className="sum"><div><span>Tạm tính</span><b>{vnd(i.subtotal)}</b></div>{i.discount>0&&<div><span>Chiết khấu cả phiếu</span><b>-{vnd(i.discount)}</b></div>}{i.vat_percent>0&&<div><span>VAT {i.vat_percent}%</span><b>{vnd(i.vat)}</b></div>}
  <div className="tot"><span>Tổng cộng</span><span>{vnd(i.total)} ₫</span></div><div className="muted">{docTien(i.total)}</div>{i.prepaid>0&&<div><span>Đã trả trước</span><b>{vnd(i.prepaid)}</b></div>}</div>
 <div className="row" style={{marginTop:16}}><a className="btn" href={`/api/invoices/${i.id}/pdf`}>Xuất PDF</a><Link className="btn o" href={`/admin/customers/${i.customer_id}`}>Công nợ khách</Link></div>
 {admin&&i.status==='issued'&&<form action={cancelInvoice} className="form" style={{marginTop:18}}><input type="hidden" name="id" value={i.id}/><label>Lý do huỷ phiếu *<input name="reason" required size={40}/></label><button className="d">Huỷ phiếu</button></form>}</>}
