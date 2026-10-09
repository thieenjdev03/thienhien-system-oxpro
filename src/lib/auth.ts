import {createHmac,timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {sql} from './db';
export type User={id:number;username:string;name:string;role:'admin'|'accountant'};
const secret=()=>{const s=process.env.AUTH_SECRET;if(!s||s.length<16)throw new Error('AUTH_SECRET chưa cấu hình');return s};
const sign=(v:string)=>createHmac('sha256',secret()).update(v).digest('base64url');
export async function startSession(uid:number){const v=`${uid}.${Date.now()+7*864e5}`;(await cookies()).set('sid',`${v}.${sign(v)}`,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:7*86400})}
export async function endSession(){(await cookies()).delete('sid')}
export async function currentUser():Promise<User|null>{
 const raw=(await cookies()).get('sid')?.value;if(!raw)return null;
 const i=raw.lastIndexOf('.');const v=raw.slice(0,i),sig=raw.slice(i+1);const ok=sign(v);
 if(sig.length!==ok.length||!timingSafeEqual(Buffer.from(sig),Buffer.from(ok)))return null;
 const [uid,exp]=v.split('.').map(Number);if(!uid||exp<Date.now())return null;
 const [u]=await sql`select id,username,name,role from users where id=${uid}`;return (u as User)||null}
export async function requireUser(){const u=await currentUser();if(!u)redirect('/login');return u}
export async function requireAdmin(){const u=await requireUser();if(u.role!=='admin')throw new Error('Chỉ admin được thực hiện thao tác này');return u}
