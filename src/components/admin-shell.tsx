'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import {LayoutDashboard,FileText,Users,Package,Layers,Ruler,SlidersHorizontal,UserCog,Menu,LogOut} from 'lucide-react';
import {Brand} from './brand';
const GROUPS=[
 ['Bán hàng',[['/admin','Tổng quan',LayoutDashboard],['/admin/invoices','Phiếu bán hàng',FileText],['/admin/customers','Khách hàng & công nợ',Users]]],
 ['Danh mục',[['/admin/products','Sản phẩm',Package],['/admin/categories','Nhóm sản phẩm',Layers],['/admin/units','Đơn vị tính',Ruler]]],
 ['Hệ thống',[['/admin/settings','Cài đặt công ty',SlidersHorizontal],['/admin/account','Tài khoản',UserCog]]],
] as const;
export default function AdminShell({name,role,logout,children}:{name:string;role:string;logout:()=>Promise<void>;children:React.ReactNode}){
 const path=usePathname(),[open,setOpen]=useState(false),admin=role==='admin';
 useEffect(()=>setOpen(false),[path]);
 useEffect(()=>{const k=(e:KeyboardEvent)=>e.key==='Escape'&&setOpen(false);addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[]);
 const on=(h:string)=>h==='/admin'?path===h:path===h||path.startsWith(h+'/');
 return <div className="adm" data-open={open||undefined}>
  <div className="scrim" onClick={()=>setOpen(false)}/>
  <aside className="side"><Brand/>
   <nav className="anav">{GROUPS.map(([g,items])=>{const vis=items.filter(([h])=>admin||h!=='/admin/settings');return <div key={g}><h4>{g}</h4>{vis.map(([h,t,Ic])=><Link key={h} href={h} aria-current={on(h)?'page':undefined}><Ic size={16}/>{t}</Link>)}</div>})}</nav>
   <div className="me"><span className="av">{name.slice(0,1).toUpperCase()}</span><div className="grow"><b>{name}</b><small>{admin?'Admin':'Kế toán'}</small></div>
    <form action={logout}><button className="ghost icon" title="Đăng xuất" aria-label="Đăng xuất"><LogOut size={16}/></button></form></div></aside>
  <div className="mainw"><header className="top"><button className="ghost icon burger" aria-label="Mở menu" onClick={()=>setOpen(true)}><Menu size={18}/></button><span className="crumb">Quản trị</span></header>
   <main>{children}</main></div></div>}
