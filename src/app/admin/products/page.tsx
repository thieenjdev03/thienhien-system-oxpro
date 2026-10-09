import {revalidatePath} from 'next/cache';
import Link from 'next/link';
import {requireAdmin,requireUser} from '@/lib/auth';
import {sql} from '@/lib/db';
import {vnd} from '@/lib/money';
import {saveImage} from '@/lib/upload';
import ImagePicker from '@/components/image-picker';
const done=()=>{revalidatePath('/admin/products');revalidatePath('/')};
async function save(fd:FormData){'use server';await requireAdmin();
 const id=Number(fd.get('id')),code=String(fd.get('code')).trim().toUpperCase(),name=String(fd.get('name')).trim();
 const category=Number(fd.get('category')),unit=Number(fd.get('unit')),price=Math.max(0,Math.round(Number(fd.get('price'))||0));
 const description=String(fd.get('description')||'').trim(),tag=String(fd.get('tag')||'').trim()||null,web=fd.get('web')==='on';
 if(!code||!name)return;
 const f=fd.get('image');const image=f instanceof File&&f.size?await saveImage(f,`product-${code}`):null;
 if(id)await sql`update products set code=${code},name=${name},category_id=${category},unit_id=${unit},price=${price},description=${description},tag=${tag},show_on_web=${web},image_url=coalesce(${image},image_url) where id=${id}`;
 else await sql`insert into products(code,name,category_id,unit_id,price,description,tag,show_on_web,image_url) values(${code},${name},${category},${unit},${price},${description},${tag},${web},${image})`;done()}
async function remove(fd:FormData){'use server';await requireAdmin();const id=Number(fd.get('id'));
 const r=await sql`delete from products p where id=${id} and not exists(select 1 from invoice_lines where product_id=p.id) returning id`;
 if(!r.length)await sql`update products set archived=true where id=${id}`;done()}
async function restore(fd:FormData){'use server';await requireAdmin();await sql`update products set archived=false where id=${Number(fd.get('id'))}`;done()}
export default async function Page({searchParams}:{searchParams:Promise<{edit?:string;q?:string}>}){
 const u=await requireUser(),admin=u.role==='admin',{edit,q=''}=await searchParams;
 const [rows,cats,units]=await Promise.all([
  sql`select p.*,c.name category,u.name unit,exists(select 1 from invoice_lines where product_id=p.id) used from products p join categories c on c.id=p.category_id join units u on u.id=p.unit_id where ${q}='' or p.code ilike ${'%'+q+'%'} or p.name ilike ${'%'+q+'%'} order by p.archived,p.code`,
  sql`select * from categories where not archived order by id`,sql`select * from units where not archived order by id`]);
 const cur=rows.find(r=>String(r.id)===edit);
 return <><h1>Sản phẩm</h1>
 {admin&&<form action={save} className="form" key={cur?.id??'new'}><input type="hidden" name="id" defaultValue={cur?.id??''}/>
  <label>Mã hàng *<input name="code" required defaultValue={cur?.code} size={10}/></label><label>Tên sản phẩm *<input name="name" required defaultValue={cur?.name}/></label>
  <label>Nhóm<select name="category" defaultValue={cur?.category_id}>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
  <label>Đơn vị tính<select name="unit" defaultValue={cur?.unit_id}>{units.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
  <label>Giá bán mặc định (₫)<input name="price" type="number" min="0" defaultValue={cur?.price??0}/></label>
  <label>Mô tả<input name="description" defaultValue={cur?.description}/></label><label>Nhãn<input name="tag" defaultValue={cur?.tag??''} size={10}/></label>
  <label>Ảnh chính (≤5MB)<ImagePicker name="image" current={cur?.image_url}/></label>
  <label className="row"><input type="checkbox" name="web" defaultChecked={cur?cur.show_on_web:true}/> Hiện trên web</label>
  <button>{cur?'Lưu':'Thêm sản phẩm'}</button>{cur&&<Link href="/admin/products" className="btn o">Huỷ</Link>}</form>}
 <form className="form"><label>Tìm mã / tên<input name="q" defaultValue={q}/></label><button className="o">Tìm</button></form>
 <table><thead><tr><th/><th>Mã</th><th>Tên</th><th>Nhóm</th><th>ĐVT</th><th className="n">Giá bán</th><th>Web</th><th/></tr></thead><tbody>
 {rows.map(r=><tr key={r.id} className={r.archived?'off':''}><td><img className="thumb" src={r.image_url||'/assets/hardware.svg'} alt=""/></td><td>{r.code}</td><td>{r.name}{r.archived&&' (đã lưu trữ)'}</td><td>{r.category}</td><td>{r.unit}</td><td className="n">{vnd(r.price)}</td><td>{r.show_on_web?'✓':''}</td>
 <td>{admin&&<div className="row"><Link href={`/admin/products?edit=${r.id}`}>Sửa</Link>
  {r.archived?<form action={restore}><input type="hidden" name="id" value={r.id}/><button className="o">Khôi phục</button></form>:<form action={remove}><input type="hidden" name="id" value={r.id}/><button className="d">{r.used?'Lưu trữ':'Xoá'}</button></form>}</div>}</td></tr>)}</tbody></table></>}
