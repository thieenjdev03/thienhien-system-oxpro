import {redirect} from 'next/navigation';
import {currentUser,startSession} from '@/lib/auth';
import {sql} from '@/lib/db';
import {verifyPassword} from '@/lib/password';
import {Brand} from '@/components/brand';
import '../admin/admin.css';
async function login(fd:FormData){'use server';
 const username=String(fd.get('username')||'').trim().toLowerCase(),pw=String(fd.get('password')||'');
 const [u]=await sql`select id,password_hash,fails,locked_until from users where username=${username}`;
 const bad=()=>redirect('/login?e=1');
 if(!u)return bad();
 if(u.locked_until&&new Date(u.locked_until)>new Date())return redirect('/login?e=2');
 if(!verifyPassword(pw,u.password_hash)){await sql`update users set locked_until=case when fails+1>=5 then now()+interval '15 minutes' else null end,fails=case when fails+1>=5 then 0 else fails+1 end where id=${u.id}`;return bad()}
 await sql`update users set fails=0,locked_until=null where id=${u.id}`;await startSession(u.id);redirect('/admin')}
export default async function Login({searchParams}:{searchParams:Promise<{e?:string}>}){
 if(await currentUser())redirect('/admin');const {e}=await searchParams;
 return <main className="login"><form action={login} className="card"><Brand sub="Quản lý bán hàng"/><h1>Đăng nhập</h1>
 {e&&<p className="err">{e==='2'?'Tài khoản bị khoá 15 phút do nhập sai nhiều lần.':'Sai tài khoản hoặc mật khẩu.'}</p>}
 <label>Tài khoản<input name="username" required autoFocus autoComplete="username"/></label><label>Mật khẩu<input name="password" type="password" required autoComplete="current-password"/></label><button className="btn">Đăng nhập</button></form></main>}
