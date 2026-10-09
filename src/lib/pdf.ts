import PDFDocument from 'pdfkit';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {sql} from './db';
import {docTien,fdate,vnd} from './money';
import {lineAmount} from './totals';
import {statement,getInvoices} from './queries';
const F=(n:string)=>path.join(process.cwd(),'fonts',n);
type Doc=PDFKit.PDFDocument;
async function settings(){const s:Record<string,string>=Object.fromEntries((await sql`select key,value from settings`).map(r=>[r.key,r.value]));
 let logo:Buffer|null=null;try{if(s.logo_url)logo=s.logo_url.startsWith('/')?await readFile(path.join(process.cwd(),'public',s.logo_url)):Buffer.from(await (await fetch(s.logo_url)).arrayBuffer())}catch{}
 return {s,logo}}
function build(fn:(d:Doc)=>void):Promise<Buffer>{return new Promise((res,rej)=>{
 const d=new PDFDocument({size:'A4',margin:40,font:F('Roboto-Regular.ttf'),info:{Title:'Thiện Hiền'}});d.registerFont('B',F('Roboto-Bold.ttf'));d.registerFont('R',F('Roboto-Regular.ttf'));
 const b:Buffer[]=[];d.on('data',c=>b.push(c));d.on('end',()=>res(Buffer.concat(b)));d.on('error',rej);fn(d);d.end()})}
function header(d:Doc,{s,logo}:Awaited<ReturnType<typeof settings>>){
 let x=40;if(logo){try{d.image(logo,40,36,{fit:[70,70]});x=122}catch{}}
 d.font('B').fontSize(13).text(s.company_name||'',x,40,{width:555-x});d.font('R').fontSize(9).text(`MST: ${s.tax_code||''}`,x).text(`Địa chỉ: ${s.address||''}`,x).text(`Điện thoại: ${s.phone||''}`,x);
 d.y=Math.max(d.y,logo?110:0)+10;d.moveTo(40,d.y).lineTo(555,d.y).strokeColor('#999').lineWidth(.5).stroke();d.y+=12}
type Col={label:string;w:number;right?:boolean};
function table(d:Doc,cols:Col[],rows:string[][]){
 const row=(cells:string[],head=false)=>{d.font(head?'B':'R').fontSize(9);
  const h=Math.max(...cells.map((c,i)=>d.heightOfString(c,{width:cols[i].w-8})))+8;
  if(d.y+h>780){d.addPage();d.y=40;if(!head)row(cols.map(c=>c.label),true);d.font(head?'B':'R').fontSize(9)}
  let x=40;const y=d.y;
  cells.forEach((c,i)=>{d.rect(x,y,cols[i].w,h).strokeColor('#bbb').lineWidth(.4).stroke();if(head)d.rect(x,y,cols[i].w,h).fillAndStroke('#eee','#bbb');
   d.fillColor('#000').text(c,x+4,y+4,{width:cols[i].w-8,align:cols[i].right?'right':'left'});x+=cols[i].w});d.y=y+h};
 row(cols.map(c=>c.label),true);rows.forEach(r=>row(r))}
const kv=(d:Doc,k:string,v:string,x=40,w=515)=>{d.font('R').fontSize(10).text(k+' ',x,d.y,{continued:true,width:w}).font('B').text(v)};
function right(d:Doc,k:string,v:string,bold=false){const y=d.y;d.font('R').fontSize(10).text(k,300,y,{width:150,align:'right'});d.font(bold?'B':'R').text(v,455,y,{width:100,align:'right'});d.y=y+16}
export async function invoicePdf(id:number){
 const [i]=await getInvoices({id});if(!i||i.status==='draft')return null;
 const st=await statement(i.customer_id),[c]=await sql`select * from customers where id=${i.customer_id}`,ctx=await settings(),s=ctx.s;
 const rem=st?.remaining.get(i.id)??0;
 return build(d=>{header(d,ctx);
  d.font('B').fontSize(16).text('PHIẾU BÁN HÀNG',40,d.y,{align:'center'}).font('R').fontSize(10).text(`Số: ${i.number}   ·   Ngày ${fdate(i.date)}`,{align:'center'});
  if(i.status==='cancelled')d.fillColor('#b3261e').text(`ĐÃ HUỶ: ${i.cancel_reason||''}`,{align:'center'}).fillColor('#000');
  d.moveDown(.8);kv(d,'Khách hàng:',c.name);if(c.address)kv(d,'Địa chỉ:',c.address);if(c.phone)kv(d,'Điện thoại:',c.phone);if(c.tax_code)kv(d,'MST:',c.tax_code);if(i.note)kv(d,'Ghi chú:',i.note);d.moveDown(.6);
  table(d,[{label:'STT',w:28},{label:'Tên hàng',w:218},{label:'ĐVT',w:40},{label:'SL',w:45,right:true},{label:'Đơn giá',w:72,right:true},{label:'CK %',w:32,right:true},{label:'Thành tiền',w:80,right:true}],
   i.lines.map((l,k)=>[String(k+1),l.code?`${l.name} (${l.code})`:l.name,l.unit,String(l.qty),vnd(l.price),l.discount_percent?String(l.discount_percent):'',vnd(lineAmount(l))]));
  d.y+=8;if(d.y>650){d.addPage();d.y=40}
  right(d,'Tạm tính',vnd(i.subtotal));if(i.discount)right(d,'Chiết khấu',`-${vnd(i.discount)}`);if(i.vat_percent)right(d,`VAT ${i.vat_percent}%`,vnd(i.vat));
  right(d,'Tổng cộng',`${vnd(i.total)} ₫`,true);
  d.font('R').fontSize(10).text(`Bằng chữ: ${docTien(i.total)}`,40,d.y+2,{width:515});d.moveDown(.5);
  if(i.status==='issued'){right(d,'Đã thanh toán',vnd(i.total-rem));right(d,'Còn nợ phiếu này',`${vnd(rem)} ₫`,true);if(!c.is_retail&&st)right(d,'Tổng công nợ của khách',`${vnd(st.balance)} ₫`)}
  d.moveDown(.6);if(s.bank_account)kv(d,'Chuyển khoản:',`${s.bank_name} · STK ${s.bank_account} · ${s.bank_holder}`);
  if(d.y>690){d.addPage();d.y=40}d.y+=20;const y=d.y;
  d.font('B').fontSize(10).text('Người mua hàng',60,y,{width:180,align:'center'}).text('Người bán hàng',350,y,{width:180,align:'center'});
  d.font('R').fontSize(8).fillColor('#777').text('(Ký, ghi rõ họ tên)',60,y+14,{width:180,align:'center'}).text('(Ký, ghi rõ họ tên)',350,y+14,{width:180,align:'center'})})}
export async function statementPdf(customerId:number,from='',to=''){
 const st=await statement(customerId);if(!st)return null;const ctx=await settings(),c=st.customer;
 const rows=st.rows.filter(r=>r.kind==='opening'||((!from||r.date>=from)&&(!to||r.date<=to)));
 return build(d=>{header(d,ctx);d.font('B').fontSize(16).text('SAO KÊ CÔNG NỢ',40,d.y,{align:'center'}).font('R').fontSize(10).text(from||to?`Từ ${from?fdate(from):'đầu'} đến ${to?fdate(to):'nay'}`:`Tính đến ngày ${fdate(new Date(Date.now()+7*3600e3).toISOString())}`,{align:'center'});
  d.moveDown(.8);kv(d,'Khách hàng:',c.name);if(c.address)kv(d,'Địa chỉ:',c.address);if(c.phone)kv(d,'Điện thoại:',c.phone);d.moveDown(.6);
  table(d,[{label:'Ngày',w:60},{label:'Chứng từ',w:110},{label:'Diễn giải',w:115},{label:'Phát sinh nợ',w:75,right:true},{label:'Đã thu',w:75,right:true},{label:'Công nợ',w:80,right:true}],
   rows.map(r=>[r.kind==='opening'?'':fdate(r.date),r.ref,r.note,r.debit?vnd(r.debit):'',r.credit?vnd(r.credit):'',vnd(r.balance)]));
  d.y+=10;right(d,'Công nợ hiện tại',`${vnd(st.balance)} ₫`,true);d.font('R').fontSize(10).text(`Bằng chữ: ${docTien(st.balance)}`,40,d.y+2,{width:515});
  if(ctx.s.bank_account){d.moveDown();kv(d,'Chuyển khoản:',`${ctx.s.bank_name} · STK ${ctx.s.bank_account} · ${ctx.s.bank_holder}`)}})}
