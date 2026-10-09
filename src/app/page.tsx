import Site from '@/components/site';
import {getPublicCatalog} from '@/lib/public-catalog';
export default async function Home(){ return <Site {...await getPublicCatalog()}/> }
