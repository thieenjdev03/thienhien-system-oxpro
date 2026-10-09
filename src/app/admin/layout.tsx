import {Inter} from 'next/font/google';
import {endSession,requireUser} from '@/lib/auth';
import {redirect} from 'next/navigation';
import AdminShell from '@/components/admin-shell';
import './admin.css';
const inter=Inter({subsets:['latin','vietnamese'],display:'swap'});
export const metadata={title:'Quản trị | Thiện Hiền',robots:{index:false}};
async function logout(){'use server';await endSession();redirect('/login')}
export default async function Layout({children}:{children:React.ReactNode}){
 const u=await requireUser();
 return <div className={inter.className} style={{display:'contents'}}><AdminShell name={u.name} role={u.role} logout={logout}>{children}</AdminShell></div>}
