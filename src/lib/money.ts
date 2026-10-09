const nf=new Intl.NumberFormat('vi-VN');
export const vnd=(n:number)=>nf.format(Math.round(n));
export const fdate=(s:string)=>s?s.slice(0,10).split('-').reverse().join('/'):'';
export const today=()=>new Date(Date.now()+7*3600e3).toISOString().slice(0,10);
const D=['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'];
function three(n:number,full:boolean){const t=Math.floor(n/100),c=Math.floor(n/10)%10,u=n%10;const o:string[]=[];
 if(t||full)o.push(D[t],'trăm');
 if(c>1)o.push(D[c],'mươi');else if(c===1)o.push('mười');else if(u&&(t||full))o.push('lẻ');
 if(u){if(c>1&&u===1)o.push('mốt');else if(c>0&&u===5)o.push('lăm');else o.push(D[u])}
 return o.join(' ')}
export function docTien(n:number){n=Math.round(n);if(n===0)return 'Không đồng';const neg=n<0;n=Math.abs(n);
 const U=['','nghìn','triệu','tỷ'],parts:string[]=[];const g:number[]=[];while(n>0){g.push(n%1000);n=Math.floor(n/1000)}
 for(let i=g.length-1;i>=0;i--){if(!g[i])continue;const full=i<g.length-1;const w=three(g[i],full);
  const unit=U[i];parts.push(w+(unit?' '+unit:''))}
 const s=(neg?'âm ':'')+parts.join(' ')+' đồng';return s[0].toUpperCase()+s.slice(1)}
