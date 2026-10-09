import {revalidatePath} from 'next/cache';
import Link from 'next/link';
import {requireAdmin,requireUser} from '@/lib/auth';
import {sql} from '@/lib/db';
const IMAGES=['pano','hinge','spikes','rosette','scroll','hardware'].map(n=>`/assets/${n}.svg`);
const done=()=>{revalidatePath('/admin/categories');revalidatePath('/')};
async function save(fd:FormData){'use server';await requireAdmin();
 const id=Number(fd.get('id')),name=String(fd.get('name')).trim(),sub=String(fd.get('sub')||'').trim(),image=String(fd.get('image'));
 if(!name)return;
 if(id)await sql`update categories set name=${name},sub=${sub},image=${image} where id=${id}`;else await sql`insert into categories(name,sub,image) values(${name},${sub},${image})`;done()}
async function remove(fd:FormData){'use server';await requireAdmin();const id=Number(fd.get('id'));
 const r=await sql`delete from categories c where id=${id} and not exists(select 1 from products where category_id=c.id) returning id`;
 if(!r.length)await sql`update categories set archived=true where id=${id}`;done()}
async function restore(fd:FormData){'use server';await requireAdmin();await sql`update categories set archived=false where id=${Number(fd.get('id'))}`;done()}
export default async function Page({searchParams}:{searchParams:Promise<{edit?:string}>}){
 const u=await requireUser(),admin=u.role==='admin',{edit}=await searchParams;
 const rows=await sql`select c.*,(select count(*)::int from products where category_id=c.id) n from categories c order by archived,id`;
 const cur=rows.find(r=>String(r.id)===edit);
 return <><h1>Nhóm sản phẩm</h1>
 {admin&&<form action={save} className="form" key={cur?.id??'new'}><input type="hidden" name="id" defaultValue={cur?.id??''}/>
  <label>Tên nhóm *<input name="name" required defaultValue={cur?.name}/></label><label>Mô tả ngắn<input name="sub" defaultValue={cur?.sub}/></label>
  <label>Hình minh hoạ<select name="image" defaultValue={cur?.image}>{IMAGES.map(i=><option key={i}>{i}</option>)}</select></label>
  <button>{cur?'Lưu':'Thêm nhóm'}</button>{cur&&<Link href="/admin/categories" className="btn o">Huỷ</Link>}</form>}
 <table><thead><tr><th>Tên</th><th>Mô tả</th><th className="n">Số sản phẩm</th><th/></tr></thead><tbody>
 {rows.map(r=><tr key={r.id} className={r.archived?'off':''}><td>{r.name}{r.archived&&' (đã lưu trữ)'}</td><td>{r.sub}</td><td className="n">{r.n}</td>
 <td>{admin&&<div className="row"><Link href={`/admin/categories?edit=${r.id}`}>Sửa</Link>
  {r.archived?<form action={restore}><input type="hidden" name="id" value={r.id}/><button className="o">Khôi phục</button></form>:<form action={remove}><input type="hidden" name="id" value={r.id}/><button className="d">{r.n?'Lưu trữ':'Xoá'}</button></form>}</div>}</td></tr>)}</tbody></table></>}
