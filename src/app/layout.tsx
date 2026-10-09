import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Thiện Hiền | Phụ kiện sắt & sắt mỹ thuật', description: 'Khám phá pano sắt, bản lề, chông hàng rào, mâm cầu thang và phụ kiện sắt mỹ thuật. Gửi yêu cầu báo giá nhanh theo mã sản phẩm.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi"><body>{children}</body></html>; }
