import Link from 'next/link';
import {Plus,Users} from 'lucide-react';
import {requireUser} from '@/lib/auth';
import {sql} from '@/lib/db';
import {balances,getInvoices} from '@/lib/queries';
import {fdate,vnd} from '@/lib/money';
const L={draft:'Nháp',issued:'Đã xuất',cancelled:'Đã huỷ'};
export default async function Page(){
 await requireUser();const month=new Date(Date.now()+7*3600e3).toISOString().slice(0,7);
 const [bal,names,issued,drafts,recent]=await Promise.all([balances(),sql`select id,name from customers`,getInvoices({status:'issued'},1000),getInvoices({status:'draft'},1000),getInvoices({},6)]);
 const nm=new Map(names.map(n=>[n.id,n.name]));const debtors=[...bal].filter(([,b])=>b>0).sort((a,b)=>b[1]-a[1]);
 const owed=debtors.reduce((a,[,b])=>a+b,0);const m=issued.filter(i=>i.date.startsWith(month));
 return <><div className="head"><h1>Tổng quan</h1><span className="sp"/><Link className="btn o" href="/admin/customers"><Users size={16}/>Công nợ</Link><Link className="btn" href="/admin/invoices/new"><Plus size={16}/>Lập phiếu mới</Link></div>
 <div className="stats">
  <div className="card stat"><div className="cap">Doanh số tháng này</div><div className="big">{vnd(m.reduce((s,i)=>s+i.total,0))} ₫</div><div className="sub">{m.length} phiếu đã xuất</div></div>
  <div className="card stat"><div className="cap">Công nợ phải thu</div><div className="big">{vnd(owed)} ₫</div><div className="sub">{debtors.length} khách còn nợ</div></div>
  <div className="card stat"><div className="cap">Phiếu nháp chưa xuất</div><div className="big">{drafts.length}</div><div className="sub">{drafts.length?'Mở để xuất hoặc xoá':'Không có phiếu nháp'}</div></div>
  <div className="card stat"><div className="cap">Tổng phiếu đã xuất</div><div className="big">{issued.length}</div><div className="sub">Từ khi dùng phần mềm</div></div></div>
 <div className="cols">
  <div className="card"><div className="sec"><h2>Phiếu gần đây</h2><span className="sp"/><Link href="/admin/invoices">Xem tất cả</Link></div>
   {recent.length?<table><thead><tr><th>Số phiếu</th><th>Khách hàng</th><th>Ngày</th><th className="n">Tổng tiền</th><th>Trạng thái</th></tr></thead><tbody>
   {recent.map(i=><tr key={i.id} className={i.status==='cancelled'?'off':''}><td><Link href={`/admin/invoices/${i.id}`}>{i.number||`Nháp #${i.id}`}</Link></td><td>{i.customer}</td><td>{fdate(i.date)}</td><td className="n">{vnd(i.total)}</td><td><span className={`tag ${i.status}`}>{L[i.status]}</span></td></tr>)}</tbody></table>
   :<div className="empty"><b>Chưa có phiếu nào</b><span>Lập phiếu bán hàng đầu tiên để số liệu hiện ở đây.</span><Link className="btn" href="/admin/invoices/new"><Plus size={16}/>Lập phiếu mới</Link></div>}</div>
  <div className="card"><div className="sec"><h2>Khách còn nợ nhiều nhất</h2></div>
   {debtors.slice(0,6).map(([id,b])=><Link key={id} className="li" href={`/admin/customers/${id}`}><div className="grow"><b>{nm.get(id)}</b></div><b className="n neg" style={{flex:'none'}}>{vnd(b)}</b></Link>)}
   {!debtors.length&&<div className="empty">Chưa có công nợ</div>}
   {debtors.length>0&&<div className="li"><Link href="/admin/customers" style={{color:'var(--primary)',fontWeight:500}}>Xem tất cả công nợ</Link></div>}</div></div></>}
