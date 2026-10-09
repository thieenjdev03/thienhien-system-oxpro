import {revalidatePath} from 'next/cache';
import Link from 'next/link';
import {requireAdmin,requireUser} from '@/lib/auth';
import {sql} from '@/lib/db';
const done=()=>revalidatePath('/admin/units');
async function save(fd:FormData){'use server';await requireAdmin();
 const id=Number(fd.get('id')),name=String(fd.get('name')).trim();if(!name)return;
 if(id)await sql`update units set name=${name} where id=${id}`;else await sql`insert into units(name) values(${name}) on conflict do nothing`;done()}
async function remove(fd:FormData){'use server';await requireAdmin();const id=Number(fd.get('id'));
 const r=await sql`delete from units u where id=${id} and not exists(select 1 from products where unit_id=u.id) returning id`;
 if(!r.length)await sql`update units set archived=true where id=${id}`;done()}
async function restore(fd:FormData){'use server';await requireAdmin();await sql`update units set archived=false where id=${Number(fd.get('id'))}`;done()}
export default async function Page({searchParams}:{searchParams:Promise<{edit?:string}>}){
 const u=await requireUser(),admin=u.role==='admin',{edit}=await searchParams;
 const rows=await sql`select u.*,(select count(*)::int from products where unit_id=u.id) n from units u order by archived,id`;
 const cur=rows.find(r=>String(r.id)===edit);
 return <><h1>Đơn vị tính</h1>
 {admin&&<form action={save} className="form" key={cur?.id??'new'}><input type="hidden" name="id" defaultValue={cur?.id??''}/><label>Tên đơn vị *<input name="name" required defaultValue={cur?.name}/></label><button>{cur?'Lưu':'Thêm đơn vị'}</button>{cur&&<Link href="/admin/units" className="btn o">Huỷ</Link>}</form>}
 <table><thead><tr><th>Đơn vị</th><th className="n">Số sản phẩm</th><th/></tr></thead><tbody>
 {rows.map(r=><tr key={r.id} className={r.archived?'off':''}><td>{r.name}{r.archived&&' (đã lưu trữ)'}</td><td className="n">{r.n}</td>
 <td>{admin&&<div className="row"><Link href={`/admin/units?edit=${r.id}`}>Sửa</Link>
  {r.archived?<form action={restore}><input type="hidden" name="id" value={r.id}/><button className="o">Khôi phục</button></form>:<form action={remove}><input type="hidden" name="id" value={r.id}/><button className="d">{r.n?'Lưu trữ':'Xoá'}</button></form>}</div>}</td></tr>)}</tbody></table></>}
