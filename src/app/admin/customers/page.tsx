import Link from 'next/link';
import {requireUser} from '@/lib/auth';
import {sql} from '@/lib/db';
import {balances} from '@/lib/queries';
import {vnd} from '@/lib/money';
import {saveCustomer} from './actions';
export default async function Page({searchParams}:{searchParams:Promise<{q?:string;all?:string;debt?:string}>}){
 await requireUser();const {q='',all,debt}=await searchParams;
 const [rows,bal]=await Promise.all([sql`select * from customers where not is_retail and (${!!all} or not archived) and (${q}='' or name ilike ${'%'+q+'%'} or phone ilike ${'%'+q+'%'}) order by archived,name`,balances()]);
 const total=[...bal.values()].reduce((a,b)=>a+Math.max(0,b),0);
 const owing=(id:number)=>bal.get(id)||0;const list=debt?rows.filter(r=>owing(r.id)>0):rows;const nDebt=rows.filter(r=>owing(r.id)>0).length;
 return <><div className="head"><h1>Khách hàng & công nợ</h1><span className="sp"/><span className="muted">Tổng phải thu: <b className="neg">{vnd(total)} ₫</b></span></div>
 <details className="form"><summary>+ Thêm khách hàng</summary><form action={saveCustomer} className="row" style={{marginTop:12,alignItems:'end'}}>
  <label>Tên khách / công ty *<input name="name" required/></label><label>SĐT<input name="phone"/></label><label>Địa chỉ<input name="address"/></label><label>Mã số thuế<input name="tax_code"/></label><label>Ghi chú<input name="note"/></label><button>Thêm</button></form></details>
 <div className="chips"><Link className="chip" aria-current={!!debt} href={`?debt=1${all?'&all=1':''}`}>Còn nợ · {nDebt}</Link><Link className="chip" aria-current={!debt} href={all?'?all=1':'?'}>Tất cả · {rows.length}</Link></div>
 <form className="head"><label className="grow" style={{maxWidth:420,flex:1}}><input type="hidden" name="debt" value={debt||''}/><input name="q" defaultValue={q} placeholder="Tìm tên hoặc SĐT"/></label><label className="row"><input type="checkbox" name="all" value="1" defaultChecked={!!all}/>Gồm đã lưu trữ</label><button className="o">Tìm</button></form>
 <div className="card"><table><thead><tr><th>Khách hàng</th><th>SĐT</th><th>MST</th><th className="n">Công nợ</th><th>Tình trạng</th><th/></tr></thead><tbody>
 {list.map(r=>{const b=owing(r.id);return <tr key={r.id} className={r.archived?'off':''}><td><Link href={`/admin/customers/${r.id}`}>{r.name}</Link>{r.archived&&' (đã lưu trữ)'}</td><td>{r.phone}</td><td>{r.tax_code}</td><td className={`n ${b>0?'neg':''}`}>{vnd(b)}</td><td>{b>0?<span className="tag wa">Còn nợ</span>:<span className="tag ok">Đã trả đủ</span>}</td><td className="n">{b>0&&!r.archived&&<Link className="btn o sm" href={`/admin/customers/${r.id}#thu-tien`}>Thu tiền</Link>}</td></tr>})}
 {!list.length&&<tr><td colSpan={6} className="muted">Chưa có khách hàng nào. Bấm "+ Thêm khách hàng" ở trên.</td></tr>}</tbody></table></div></>}
