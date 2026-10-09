import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { metadataBase: new URL(process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:'http://localhost:3000'), title: 'Thiện Hiền | Cơ khí, kim khí & phụ kiện xây dựng', openGraph: { images: ['/brand/logo-full.png'] }, description: 'Thiện Hiền sản xuất và cung cấp cơ khí, kim khí và phụ kiện xây dựng. Tra cứu theo mã hàng và gửi yêu cầu báo giá.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi"><body>{children}</body></html>; }
