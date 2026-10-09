// Monogram TH: thân chữ T dùng chung làm cột trái của chữ H; mũ cam là điểm nhấn, mono=true cho bản một màu.
export function Mark(p:React.ComponentProps<'img'>){return <img src="/brand/logo-mark.png" alt="" width={240} height={200} {...p} style={{width:'100%',height:'100%',objectFit:'contain',...p.style}}/>}
export function Brand({sub='Quản lý bán hàng'}:{sub?:string}){return <div className="abrand"><span className="mark"><Mark/></span><div><b>Thiện Hiền</b><span>{sub}</span></div></div>}
