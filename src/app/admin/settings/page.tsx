import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/auth';
import {sql} from '@/lib/db';
import {saveImage} from '@/lib/upload';
import ImagePicker from '@/components/image-picker';
const F:[string,string][]=[['company_name','Tên công ty'],['tax_code','Mã số thuế'],['address','Địa chỉ'],['phone','Số điện thoại'],['bank_name','Ngân hàng'],['bank_account','Số tài khoản'],['bank_holder','Chủ tài khoản']];
async function save(fd:FormData){'use server';await requireAdmin();
 for(const [k] of F)await sql`insert into settings(key,value) values(${k},${String(fd.get(k)||'').trim()}) on conflict(key) do update set value=excluded.value`;
 const f=fd.get('logo');if(f instanceof File&&f.size){const url=await saveImage(f,'logo',true);await sql`insert into settings(key,value) values('logo_url',${url}) on conflict(key) do update set value=excluded.value`}
 revalidatePath('/admin/settings')}
export default async function Page(){
 await requireAdmin();const s=Object.fromEntries((await sql`select key,value from settings`).map(r=>[r.key,r.value]));
 return <><h1>Cài đặt công ty</h1><p className="muted">Thông tin này in trên PDF phiếu bán hàng và sao kê công nợ.</p>
 <form action={save} className="form" style={{display:'grid',maxWidth:640}}>{F.map(([k,l])=><label key={k}>{l}<input name={k} defaultValue={s[k]}/></label>)}
 <label>Logo (PNG/JPG, hiện trên PDF)<ImagePicker name="logo" current={s.logo_url} png/></label><div><button>Lưu</button></div></form></>}
