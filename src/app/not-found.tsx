import Link from 'next/link';
export const metadata = {title:'404 | Thiện Hiền'};
export default function NotFound(){return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',textAlign:'center',padding:24,background:'#10283F',color:'#F5F5F2'}}>
 <div><p style={{color:'#F28C28',letterSpacing:'.2em',fontSize:14}}>404</p><h1 style={{fontSize:'clamp(2rem,6vw,3.5rem)',margin:'12px 0'}}>Không tìm thấy trang</h1><p style={{opacity:.75}}>Page not found.</p>
 <Link href="/" style={{display:'inline-block',marginTop:24,padding:'12px 24px',background:'#F28C28',color:'#fff',textDecoration:'none'}}>Về trang chủ · Home</Link></div></main>}
