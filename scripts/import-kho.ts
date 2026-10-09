// Nhập sản phẩm từ JSON (đã xuất từ file kho). Chạy: node --no-warnings --env-file=.env.local scripts/import-kho.ts <file.json> [--apply]
import {readFileSync} from 'node:fs';
import postgres from 'postgres';
const sql=postgres(process.env.DATABASE_URL!);const apply=process.argv.includes('--apply');
const items:{code:string;name:string;unit:string;cat:string;desc:string}[]=JSON.parse(readFileSync(process.argv[2],'utf8'));
const have=new Set((await sql`select code from products`).map(r=>r.code));
const cats=new Set((await sql`select name from categories`).map(r=>r.name)),units=new Set((await sql`select name from units`).map(r=>r.name));
for(const i of items){const m=[...cats].find(c=>c.toLowerCase()===i.cat.toLowerCase());if(m)i.cat=m}
const fresh=items.filter(i=>!have.has(i.code));
console.log({tong:items.length,moi:fresh.length,trungMa:items.length-fresh.length,nhomMoi:[...new Set(fresh.map(i=>i.cat))].filter(c=>!cats.has(c)).length,dvtMoi:[...new Set(fresh.map(i=>i.unit))].filter(u=>!units.has(u))});
if(apply)await sql.begin(async t=>{
 for(const c of new Set(fresh.map(i=>i.cat)))await t`insert into categories(name,sub) values(${c},'') on conflict(name) do nothing`;
 for(const u of new Set(fresh.map(i=>i.unit)))await t`insert into units(name) values(${u}) on conflict(name) do nothing`;
 for(const i of fresh)await t`insert into products(code,name,category_id,unit_id,price,description,show_on_web) values(${i.code},${i.name},(select id from categories where name=${i.cat}),(select id from units where name=${i.unit}),0,${i.desc},false) on conflict(code) do nothing`;
 console.log('đã nhập',fresh.length)});
await sql.end();
