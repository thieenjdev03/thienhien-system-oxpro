'use client';
import {useEffect,useRef,useState} from 'react';
import {quickCreateProduct,saveInvoice} from '@/app/admin/invoices/actions';
import {lineAmount,totals} from '@/lib/totals';
import {vnd} from '@/lib/money';
type P={id:number;code:string;name:string;unit:string;price:number};
type Row={code:string;product_id:number|null;name:string;unit:string;qty:string;price:string;dp:string};
type Init={id?:number;customer_id?:number;date:string;note:string;discount:number;vat_percent:number;prepaid:number;lines:{code?:string;product_id:number|null;name:string;unit:string;qty:number;price:number;discount_percent:number}[]};
const COLS=['code','name','unit','qty','price','dp'] as const;
const blank=():Row=>({code:'',product_id:null,name:'',unit:'',qty:'',price:'',dp:''});
const dec=(s:string)=>Number(String(s).trim().replace(/\s|₫/g,'').replace(',','.'))||0;
// Số tiền: "1.500.000" hoặc "1,500,000" là hàng nghìn; còn lại coi dấu phẩy là thập phân
const money=(s:string)=>{s=String(s).trim().replace(/\s|₫/g,'');return /^\d{1,3}([.,]\d{3})+$/.test(s)?Number(s.replace(/[.,]/g,'')):dec(s)};
export default function InvoiceForm({init,customers,products:p0,categories,isAdmin}:{init:Init;customers:{id:number;name:string;is_retail:boolean}[];products:P[];categories:{id:number;name:string}[];isAdmin:boolean}){
 const [products,setProducts]=useState(p0);
 const [rows,setRows]=useState<Row[]>(init.lines.length?init.lines.map(l=>({code:l.code||'',product_id:l.product_id,name:l.name,unit:l.unit,qty:String(l.qty),price:String(l.price),dp:l.discount_percent?String(l.discount_percent):''})):[blank(),blank(),blank()]);
 const [customer,setCustomer]=useState(init.customer_id||customers.find(c=>c.is_retail)?.id||0);
 const [date,setDate]=useState(init.date),[note,setNote]=useState(init.note);
 const [disc,setDisc]=useState(init.discount?String(init.discount):''),[vat,setVat]=useState(String(init.vat_percent||0)),[pre,setPre]=useState(init.prepaid?String(init.prepaid):'');
 const [err,setErr]=useState(''),[busy,setBusy]=useState(false),[qc,setQc]=useState<{i:number;code:string;cat:number}|null>(null);
 const focus=useRef<[number,number]|null>(null);
 useEffect(()=>{if(focus.current){const [r,c]=focus.current;focus.current=null;document.querySelector<HTMLInputElement>(`[data-r="${r}"][data-c="${c}"]`)?.focus()}});
 const lines=rows.map(r=>({qty:dec(r.qty),price:money(r.price),discount_percent:dec(r.dp)}));
 const t=totals(lines,money(disc),dec(vat));const retail=customers.find(c=>c.id===customer)?.is_retail;const prepaid=retail?t.total:money(pre);
 const set=(i:number,k:keyof Row,v:string)=>setRows(rs=>rs.map((r,j)=>{if(j!==i)return r;const n={...r,[k]:v} as Row;
  if(k==='code'){const m=products.find(x=>x.code.toLowerCase()===v.trim().toLowerCase());if(m)return {...n,code:m.code,product_id:m.id,name:m.name,unit:m.unit,price:n.price||String(m.price),qty:n.qty||'1'};if(r.product_id)return {...n,product_id:null}}
  return n}));
 function key(e:React.KeyboardEvent<HTMLInputElement>,r:number,c:number){
  const go=(dr:number)=>{e.preventDefault();const nr=r+dr;if(nr<0)return;if(nr>=rows.length)setRows(x=>[...x,blank()]);focus.current=[nr,c];if(nr<rows.length)document.querySelector<HTMLInputElement>(`[data-r="${nr}"][data-c="${c}"]`)?.focus()};
  if(e.key==='Enter'||e.key==='ArrowDown')go(1);else if(e.key==='ArrowUp')go(-1)}
 function paste(e:React.ClipboardEvent<HTMLInputElement>,r:number,c:number){
  const txt=e.clipboardData.getData('text');if(!/[\t\n]/.test(txt.trim()))return;e.preventDefault();
  const data=txt.replace(/\r/g,'').replace(/\n+$/,'').split('\n').map(l=>l.split('\t'));
  setRows(rs=>{const out=[...rs];data.forEach((cells,di)=>{while(out.length<=r+di)out.push(blank());let row={...out[r+di]};
   cells.forEach((v,ci)=>{const k=COLS[c+ci];if(!k)return;row={...row,[k]:k==='price'||k==='dp'?String(money(v)||''):v.trim()}});
   const m=products.find(x=>x.code.toLowerCase()===row.code.toLowerCase());if(m)row={...row,code:m.code,product_id:m.id,name:row.name||m.name,unit:row.unit||m.unit,price:row.price||String(m.price)};out[r+di]=row});return out})}
 async function submit(issue:boolean){
  if(issue&&!confirm('Xuất phiếu sẽ cấp số phiếu và khoá nội dung. Tiếp tục?'))return;
  setBusy(true);setErr('');
  const res=await saveInvoice({id:init.id,customer_id:customer,date,note,discount:money(disc),vat_percent:dec(vat),prepaid,lines:rows.map(r=>({product_id:r.product_id,name:r.name,unit:r.unit,qty:dec(r.qty),price:money(r.price),discount_percent:dec(r.dp)}))},issue);
  if(res?.error){setErr(res.error);setBusy(false)}}
 async function createProduct(){if(!qc)return;const r=rows[qc.i];
  const res=await quickCreateProduct({code:qc.code,name:r.name,category_id:qc.cat,unit:r.unit,price:money(r.price)});
  if('error' in res)return setErr(res.error);
  setProducts(ps=>[...ps,{id:res.id,code:res.code,name:r.name,unit:r.unit||'Cái',price:money(r.price)}]);setRows(rs=>rs.map((x,j)=>j===qc.i?{...x,code:res.code,product_id:res.id}:x));setQc(null);setErr('')}
 const H=['Mã hàng','Tên hàng *','ĐVT','Số lượng','Đơn giá','CK %'];const W=['110px','','80px','90px','120px','70px'];
 return <div className="cols pb">
 <div className="stack">
 <div className="card pad"><div className="form" style={{border:0,padding:0}}><label style={{flex:'2 1 240px'}}>Khách hàng *<select value={customer} onChange={e=>setCustomer(Number(e.target.value))}>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
  <label>Ngày<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label style={{flex:'2 1 240px'}}>Ghi chú<input value={note} onChange={e=>setNote(e.target.value)}/></label></div></div>
 <datalist id="codes">{products.map(x=><option key={x.id} value={x.code}>{x.name}</option>)}</datalist>
 <div className="card"><div className="sec"><h2>Dòng hàng</h2><span className="muted">Enter/↑↓ chuyển dòng · dán từ Excel được</span><span className="sp"/><button type="button" className="o sm" onClick={()=>setRows(rs=>[...rs,blank()])}>+ Thêm dòng</button></div>
 <div className="lines"><table className="grid"><thead><tr><th style={{width:40,textAlign:'center'}}>#</th>{H.map((h,c)=><th key={h} className={c>=3?'n':''}>{h}</th>)}<th className="n" style={{paddingRight:16}}>Thành tiền</th><th/></tr></thead><tbody>
 {rows.map((r,i)=><tr key={i}><td>{i+1}</td>
  {COLS.map((k,c)=><td key={k} style={{width:W[c]||undefined,minWidth:c===1?220:undefined}}><input data-r={i} data-c={c} value={r[k]} list={k==='code'?'codes':undefined} inputMode={c>=3?'decimal':undefined} style={c>=3?{textAlign:'right'}:undefined} onChange={e=>set(i,k,e.target.value)} onKeyDown={e=>key(e,i,c)} onPaste={e=>paste(e,i,c)}/></td>)}
  <td className="amt">{r.name||r.qty?vnd(lineAmount(lines[i])):''}</td>
  <td className="act">{isAdmin&&!r.product_id&&r.name&&<button type="button" className="o" title="Lưu thành sản phẩm" onClick={()=>setQc({i,code:'',cat:categories[0]?.id||0})}>+SP</button>} <button type="button" className="ghost" aria-label="Xoá dòng" onClick={()=>setRows(rs=>rs.length>1?rs.filter((_,j)=>j!==i):[blank()])}>×</button></td></tr>)}</tbody></table></div></div>
 {qc&&<div className="form"><b>Lưu "{rows[qc.i].name}" thành sản phẩm</b><label>Mã hàng *<input value={qc.code} onChange={e=>setQc({...qc,code:e.target.value})}/></label><label>Nhóm<select value={qc.cat} onChange={e=>setQc({...qc,cat:Number(e.target.value)})}>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button type="button" onClick={createProduct}>Tạo</button><button type="button" className="o" onClick={()=>setQc(null)}>Huỷ</button></div>}
 </div>
 <aside className="card pad sum"><h2 style={{margin:0}}>Thanh toán</h2>
  <dl><div><dt>Tạm tính</dt><dd>{vnd(t.subtotal)} ₫</dd></div>
  <div><dt>Chiết khấu phiếu (₫)</dt><dd><input value={disc} onChange={e=>setDisc(e.target.value)} inputMode="numeric"/></dd></div>
  <div><dt>VAT (%)</dt><dd><input value={vat} onChange={e=>setVat(e.target.value)} inputMode="decimal"/></dd></div>
  <div><dt>Tiền VAT</dt><dd>{vnd(t.vat)} ₫</dd></div>
  <div className="tot"><dt>Tổng cộng</dt><dd>{vnd(t.total)} ₫</dd></div>
  <div><dt>Trả trước (₫){retail&&' · khách lẻ trả đủ'}</dt><dd><input value={retail?String(t.total):pre} disabled={retail} onChange={e=>setPre(e.target.value)} inputMode="numeric"/></dd></div>
  <div><dt>Còn nợ</dt><dd><b className={t.total-prepaid>0?'neg':''}>{vnd(t.total-prepaid)} ₫</b></dd></div></dl>
  {err&&<p className="err">{err}</p>}
  <div className="btns"><button type="button" disabled={busy} onClick={()=>submit(true)}>Xuất phiếu</button><button type="button" className="o" disabled={busy} onClick={()=>submit(false)}>Lưu nháp</button></div></aside></div>}
