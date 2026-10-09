'use client';
import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
/** Small project-local adaptation of the Magic UI Blur Fade pattern. */
export function BlurFade({children,delay=0,className=''}:{children:ReactNode;delay?:number;className?:string}) {
 const reduced=useReducedMotion();
 return <motion.div className={className} initial={reduced?false:{opacity:0,y:18,filter:'blur(7px)'}} whileInView={{opacity:1,y:0,filter:'blur(0px)'}} viewport={{once:true,amount:0.12}} transition={{duration:.55,delay,ease:'easeOut'}}>{children}</motion.div>;
}
