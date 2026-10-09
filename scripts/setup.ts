// node --env-file=.env.local scripts/setup.ts  — tạo bảng, dữ liệu mẫu, tài khoản (idempotent)
import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {sql} from '../src/lib/db.ts';
import {hashPassword} from '../src/lib/password.ts';
import {categories,products} from '../src/data/catalog.ts';
await sql.unsafe(readFileSync('db/schema.sql','utf8'));
for(const u of ['Cái','Bộ','Mét','Kg','Cây'])await sql`insert into units(name) values(${u}) on conflict do nothing`;
for(const c of categories)await sql`insert into categories(name,sub,image) values(${c.name},${c.sub},${c.image}) on conflict do nothing`;
const [{n}]=await sql`select count(*)::int n from products`;
if(!n)for(const p of products){const [c]=await sql`select id from categories where name=${p.category}`;const [u]=await sql`select id from units where name='Cái'`;
 await sql`insert into products(code,name,category_id,unit_id,description,image_url,tag) values(${p.id},${p.name},${c.id},${u.id},${p.description},${p.image},${p.tag??null}) on conflict do nothing`}
await sql`insert into customers(name,is_retail) values('Khách lẻ',true) on conflict do nothing`;
const defaults:Record<string,string>={company_name:'CÔNG TY TNHH SẢN XUẤT THIỆN HIỀN',tax_code:'0319260193',address:'738/20/5A Lê Đức Anh, Phường Bình Tân, TP Hồ Chí Minh, Việt Nam',phone:'0947111191',bank_name:'',bank_account:'',bank_holder:'CÔNG TY TNHH SẢN XUẤT THIỆN HIỀN',logo_url:''};
for(const [k,v] of Object.entries(defaults))await sql`insert into settings(key,value) values(${k},${v}) on conflict do nothing`;
const [{u}]=await sql`select count(*)::int u from users`;
if(!u){const out:string[]=['Tài khoản đăng nhập /login (đổi mật khẩu sau khi nhận):'];
 for(const [username,name,role] of [['admin','Quản trị','admin'],['ketoan','Kế toán','accountant']]){const pw=randomBytes(6).toString('base64url');
  await sql`insert into users(username,name,role,password_hash) values(${username},${name},${role},${hashPassword(pw)})`;out.push(`${username} / ${pw}  (${role})`)}
 writeFileSync('credentials.txt',out.join('\n')+'\n');console.log(out.join('\n'))}
console.log('setup done');await sql.end();
