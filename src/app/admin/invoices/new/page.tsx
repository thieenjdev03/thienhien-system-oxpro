import {requireUser} from '@/lib/auth';
import {invoiceFormData} from '@/lib/queries';
import {today} from '@/lib/money';
import InvoiceForm from '@/components/invoice-form';
export default async function Page({searchParams}:{searchParams:Promise<{customer?:string}>}){
 const u=await requireUser(),{customer}=await searchParams;const d=await invoiceFormData();
 return <><div className="head"><h1>Lập phiếu bán hàng</h1><span className="tag draft">Nháp</span></div><InvoiceForm {...d} isAdmin={u.role==='admin'} init={{customer_id:Number(customer)||undefined,date:today(),note:'',discount:0,vat_percent:0,prepaid:0,lines:[]}}/></>}
