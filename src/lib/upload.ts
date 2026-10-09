import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
// Nén về tối đa 1200px; trả về URL công khai. Có BLOB_READ_WRITE_TOKEN thì lưu Vercel Blob, không thì public/uploads (dev).
export async function saveImage(file:File,name:string,png=false){
 if(file.size>5*1024*1024)throw new Error('Ảnh tối đa 5MB');
 const img=sharp(Buffer.from(await file.arrayBuffer())).rotate().resize(1200,1200,{fit:'inside',withoutEnlargement:true});
 const out=await (png?img.png():img.jpeg({quality:82})).toBuffer();const path=`${name}-${Date.now()}.${png?'png':'jpg'}`;
 if(process.env.BLOB_READ_WRITE_TOKEN){const {put}=await import('@vercel/blob');return (await put(path,out,{access:'public'})).url}
 await mkdir('public/uploads',{recursive:true});await writeFile(`public/uploads/${path}`,out);return `/uploads/${path}`}
