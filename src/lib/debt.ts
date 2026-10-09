export type Inv={id:number;total:number};
export type Pay={invoice_id:number|null;amount:number};
// Công nợ: thu tiền không gắn phiếu trừ vào số dư đầu kỳ rồi các phiếu cũ nhất trước; invs phải sắp xếp theo (ngày, id).
export function debt(opening:number,invs:Inv[],pays:Pay[]){
 let pool=0;const linked=new Map<number,number>();
 for(const p of pays){if(p.invoice_id)linked.set(p.invoice_id,(linked.get(p.invoice_id)||0)+p.amount);else pool+=p.amount}
 let open=Math.max(0,opening);const t0=Math.min(pool,open);open-=t0;pool-=t0;
 const remaining=new Map<number,number>();
 for(const i of invs){let rem=i.total-(linked.get(i.id)||0);const t=Math.min(pool,Math.max(rem,0));rem-=t;pool-=t;remaining.set(i.id,rem)}
 let balance=open-pool;for(const r of remaining.values())balance+=r;
 return {opening:open,remaining,credit:pool,balance}}
