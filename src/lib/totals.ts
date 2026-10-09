export type Line={qty:number;price:number;discount_percent:number};
export const lineAmount=(l:Line)=>Math.round(l.qty*l.price*(1-l.discount_percent/100));
export function totals(lines:Line[],discount:number,vatPercent:number){
 const subtotal=lines.reduce((s,l)=>s+lineAmount(l),0);
 const after=Math.max(0,subtotal-discount);const vat=Math.round(after*vatPercent/100);
 return {subtotal,after,vat,total:after+vat}}
