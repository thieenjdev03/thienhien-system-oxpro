// Dấu thương hiệu Thiện Hiền: chữ T dựng từ hai khối, khe giữa như mối hàn.
export function Mark(p:React.ComponentProps<'svg'>){return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><rect x="4" y="4" width="16" height="5" rx="1"/><rect x="10" y="11" width="4" height="9" rx="1"/></svg>}
export function Brand({sub='Quản lý bán hàng'}:{sub?:string}){return <div className="abrand"><span className="mark"><Mark/></span><div><b>Thiện Hiền</b><span>{sub}</span></div></div>}
