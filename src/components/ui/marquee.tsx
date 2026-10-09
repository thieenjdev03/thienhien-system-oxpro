'use client';
import type { ReactNode } from 'react';
/** Project-local implementation of the Magic UI Marquee layout pattern. */
export function Marquee({children}:{children:ReactNode}) {return <div className="marquee" aria-label="Danh mục phụ kiện"><div className="marquee-track"><div className="marquee-set">{children}</div><div aria-hidden="true" className="marquee-set">{children}</div></div></div>}
