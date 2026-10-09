import {notFound} from 'next/navigation';
import {getPublicProduct} from '@/lib/public-catalog';
import ProductDetail from '@/components/product-detail';
type Props={params:Promise<{code:string}>};
const load=async(p:Props['params'])=>getPublicProduct(decodeURIComponent((await p).code));
export async function generateMetadata({params}:Props){const d=await load(params);return {title:d?`${d.product.name} | Thiện Hiền`:'404 | Thiện Hiền',description:d?.product.description}}
export default async function Page({params}:Props){const d=await load(params);if(!d)notFound();return <ProductDetail {...d}/>}
