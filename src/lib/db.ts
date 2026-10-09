import postgres from 'postgres';
// bigint/numeric -> number, date -> 'YYYY-MM-DD' string
const types={bigint:{to:20,from:[20],parse:Number,serialize:String},numeric:{to:1700,from:[1700],parse:Number,serialize:String},date:{to:1082,from:[1082],parse:(x:string)=>x,serialize:(x:string)=>x}} as never;
const g=globalThis as unknown as {sql?:ReturnType<typeof postgres>};
export const sql=g.sql??(g.sql=postgres(process.env.DATABASE_URL||'postgres://localhost/thienhien',{max:process.env.VERCEL?1:5,types,ssl:/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL||'localhost')?false:'require'}));
