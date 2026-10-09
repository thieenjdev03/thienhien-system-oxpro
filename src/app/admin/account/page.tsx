import {revalidatePath} from 'next/cache';
import {requireAdmin,requireUser} from '@/lib/auth';
import {sql} from '@/lib/db';
import {hashPassword,verifyPassword} from '@/lib/password';
async function changeOwn(fd:FormData){'use server';const u=await requireUser();const [r]=await sql`select password_hash from users where id=${u.id}`;
 const next=String(fd.get('next'));if(!verifyPassword(String(fd.get('current')),r.password_hash)||next.length<8)return;
 await sql`update users set password_hash=${hashPassword(next)} where id=${u.id}`;revalidatePath('/admin/account')}
async function reset(fd:FormData){'use server';await requireAdmin();const next=String(fd.get('next'));if(next.length<8)return;
 await sql`update users set password_hash=${hashPassword(next)},fails=0,locked_until=null where id=${Number(fd.get('id'))}`}
async function create(fd:FormData){'use server';await requireAdmin();const next=String(fd.get('next')),un=String(fd.get('username')).trim().toLowerCase();if(next.length<8||!un)return;
 await sql`insert into users(username,name,role,password_hash) values(${un},${String(fd.get('name')).trim()||un},${fd.get('role')==='admin'?'admin':'accountant'},${hashPassword(next)}) on conflict do nothing`;revalidatePath('/admin/account')}
export default async function Page(){
 const u=await requireUser();const users=u.role==='admin'?await sql`select id,username,name,role from users order by id`:[];
 return <><h1>Tài khoản</h1><h2>Đổi mật khẩu của tôi ({u.username})</h2><form action={changeOwn} className="form"><label>Mật khẩu hiện tại<input type="password" name="current" required/></label><label>Mật khẩu mới (≥ 8 ký tự)<input type="password" name="next" minLength={8} required/></label><button>Đổi mật khẩu</button></form>
 {u.role==='admin'&&<><h2>Người dùng</h2><table><thead><tr><th>Tài khoản</th><th>Tên</th><th>Vai trò</th><th>Đặt lại mật khẩu</th></tr></thead><tbody>{users.map(x=><tr key={x.id}><td>{x.username}</td><td>{x.name}</td><td>{x.role==='admin'?'Admin':'Kế toán'}</td><td><form action={reset} className="row"><input type="hidden" name="id" value={x.id}/><input name="next" minLength={8} placeholder="Mật khẩu mới" required/><button className="o">Đặt lại</button></form></td></tr>)}</tbody></table>
 <h2>Thêm người dùng</h2><form action={create} className="form"><label>Tài khoản<input name="username" required/></label><label>Tên hiển thị<input name="name"/></label><label>Vai trò<select name="role"><option value="accountant">Kế toán</option><option value="admin">Admin</option></select></label><label>Mật khẩu (≥ 8 ký tự)<input name="next" minLength={8} required/></label><button>Thêm</button></form></>}</>}
