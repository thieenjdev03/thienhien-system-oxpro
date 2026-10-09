'use client';
import type { ButtonHTMLAttributes,ReactNode } from 'react';
/** Accessible, reduced-motion-aware adaptation of Magic UI Shimmer Button. */
export function ShimmerButton({children,className='',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{children:ReactNode}) {return <button {...props} className={'shimmer-button '+className}><span className="shimmer-sheen" aria-hidden="true"/><span className="shimmer-inner">{children}</span></button>}
