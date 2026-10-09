import {sql} from './db';
import {categories as seedCats,products as seedProducts} from '@/data/catalog';
export type PublicCategory={name:string;sub:string;image:string};
export type PublicProduct={id:string;name:string;category:string;description:string;image:string;tag?:string};
// Trang chủ đọc từ DB (không có giá); DB lỗi thì dùng dữ liệu mẫu để build/deploy không hỏng.
export async function getPublicCatalog():Promise<{categories:PublicCategory[];products:PublicProduct[]}>{
 try{const [categories,products]=await Promise.all([
  sql`select c.name,c.sub,c.image from categories c where not c.archived and exists(select 1 from products p where p.category_id=c.id and p.show_on_web and not p.archived) order by c.id`,
  sql`select p.code id,p.name,c.name category,p.description,coalesce(p.image_url,c.image) image,p.tag from products p join categories c on c.id=p.category_id where p.show_on_web and not p.archived and not c.archived order by p.id`]);
  return {categories:categories as unknown as PublicCategory[],products:products.map(p=>({...p,tag:p.tag||undefined})) as unknown as PublicProduct[]}}
 catch(e){console.error('public catalog fallback',e);return {categories:seedCats,products:seedProducts}}}
