'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowUpRight,Phone} from 'lucide-react';
import {Mark} from './brand';
import {tr,type Lang} from '@/lib/i18n';
import type {PublicProduct} from '@/lib/public-catalog';
const D={vi:{home:'Trang chủ',back:'Tất cả sản phẩm',code:'Mã hàng',group:'Nhóm sản phẩm',cta:'Yêu cầu báo giá',call:'Gọi tư vấn',note:'Giá được báo riêng theo số lượng và quy cách.',rel:'Sản phẩm cùng nhóm',sub:'THIEN HIEN METALWORKS'},
 en:{home:'Home',back:'All products',code:'Item code',group:'Category',cta:'Request a quote',call:'Call us',note:'Pricing is quoted per quantity and specification.',rel:'More in this category',sub:'THIEN HIEN METALWORKS'}};
export default function ProductDetail({product:p,related}:{product:PublicProduct;related:PublicProduct[]}){
 const [lang,setLang]=useState<Lang>('vi'); const d=D[lang]; const L=(x:string)=>tr(lang,x);
 useEffect(()=>{try{if(localStorage.getItem('lang')==='en')setLang('en')}catch{}},[]);
 return <>
 <header className="header"><div className="container nav"><Link className="brand" href="/"><span className="brand-mark"><Mark width={22} height={22}/></span><span className="brand-type">THIỆN HIỀN<small>{d.sub}</small></span></Link><Link className="text-link" href="/#san-pham"><ArrowLeft size={15}/> {d.back}</Link></div></header>
 <main className="container" style={{padding:'56px 0 96px'}}>
  <p style={{fontSize:12,color:'#586575',margin:'0 0 28px'}}><Link href="/">{d.home}</Link> / <Link href="/#san-pham">{L(p.category)}</Link> / {p.id}</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:48,alignItems:'start'}}>
   <div className="product-image" style={{height:'min(520px,90vw)'}}>{p.tag&&<span className="product-tag">{L(p.tag)}</span>}<img src={p.image} alt={p.name}/></div>
   <div>
    <div className="eyebrow"><span className="eyebrow-line"/> {L(p.category).toUpperCase()}</div>
    <h1 style={{font:"700 clamp(32px,4vw,48px)/1.15 'Montserrat',sans-serif",letterSpacing:'-1.5px',margin:'20px 0'}}>{p.name}</h1>
    <p style={{color:'#586575',lineHeight:1.9,fontSize:15}}>{p.description}</p>
    <dl style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:'10px 28px',fontSize:13,margin:'28px 0',padding:'20px 0',borderTop:'1px solid #DDE2E5',borderBottom:'1px solid #DDE2E5'}}><dt style={{color:'#586575'}}>{d.code}</dt><dd className="dl-mono" style={{margin:0,fontWeight:700}}>{p.id}</dd><dt style={{color:'#586575'}}>{d.group}</dt><dd style={{margin:0,fontWeight:700}}>{L(p.category)}</dd></dl>
    <div style={{display:'flex',gap:16,flexWrap:'wrap'}}><Link className="btn bronze" href="/#lien-he">{d.cta} <ArrowUpRight size={17}/></Link><a className="btn outline-dark" href="tel:0947111191"><Phone size={15}/> {d.call}</a></div>
    <p style={{fontSize:11,color:'#8b8c82',marginTop:18}}>{d.note}</p>
   </div></div>
  {related.length>0&&<section style={{marginTop:88}}><h2 style={{font:"700 24px 'Montserrat',sans-serif",marginBottom:24}}>{d.rel}</h2><div className="product-grid">{related.map(r=><Link key={r.id} href={`/san-pham/${encodeURIComponent(r.id)}`} className="product-card"><div className="product-image"><img src={r.image} alt=""/></div><div className="product-info"><div className="product-topline"><span>{L(r.category)}</span><span>{r.id}</span></div><h3>{r.name}</h3></div></Link>)}</div></section>}
 </main></>
}
