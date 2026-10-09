import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
export function hashPassword(pw:string){const salt=randomBytes(16).toString('hex');return `${salt}:${scryptSync(pw,salt,64).toString('hex')}`}
export function verifyPassword(pw:string,stored:string){const [salt,h]=stored.split(':');if(!salt||!h)return false;const a=Buffer.from(h,'hex'),b=scryptSync(pw,salt,64);return a.length===b.length&&timingSafeEqual(a,b)}
