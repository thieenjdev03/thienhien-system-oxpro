import Link from 'next/link';
import {requireUser} from '@/lib/auth';
import {getInvoices} from '@/lib/queries';
import {fdate,vnd} from '@/lib/money';
const L={draft:'Nháp',issued:'Đã xuất',cancelled:'Đã huỷ'};
export default async function Page({searchParams}:{searchParams:Promise<{status?:string;q?:string}>}){
 await requireUser();const {status='',q=''}=await searchParams;
 const rows=(await getInvoices({status:status||undefined},300)).filter(i=>!q||`${i.number} ${i.customer}`.toLowerCase().includes(q.toLowerCase()));
 return <><h1>Phiếu bán hàng</h1><div className="form"><Link className="btn" href="/admin/invoices/new">+ Lập phiếu mới</Link>
 <form className="row"><label>Tìm số phiếu / khách<input name="q" defaultValue={q}/></label><label>Trạng thái<select name="status" defaultValue={status}><option value="">Tất cả</option>{Object.entries(L).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><button className="o">Lọc</button></form></div>
 <table><thead><tr><th>Số phiếu</th><th>Ngày</th><th>Khách hàng</th><th>Trạng thái</th><th className="n">Tổng tiền</th><th className="n">Trả trước</th></tr></thead><tbody>
 {rows.map(i=><tr key={i.id} className={i.status==='cancelled'?'off':''}><td><Link href={`/admin/invoices/${i.id}`}>{i.number||`(nháp #${i.id})`}</Link></td><td>{fdate(i.date)}</td><td>{i.customer}</td><td><span className={`tag ${i.status}`}>{L[i.status]}</span></td><td className="n">{vnd(i.total)}</td><td className="n">{i.prepaid?vnd(i.prepaid):''}</td></tr>)}</tbody></table></>}
