# Thiện Hiền — Website & trang quản trị

A Vietnamese industrial metalwork website concept built using **Next.js 15, TypeScript, CSS**, and local adaptations of three **Magic UI component patterns**: Blur Fade, Marquee and Shimmer Button.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

Requires Node.js 20.9+. Build: `npm run build`.

## Magic UI integration

The repository includes local project-adapted implementations in `src/components/ui` so all code is inspectable. For **official registry-maintained Magic UI components**, initialize shadcn and replace those local implementations:

```bash
npx shadcn@latest init
npx shadcn@latest add @magicui/blur-fade @magicui/marquee @magicui/shimmer-button
```

Official documentation: https://magicui.design/docs/installation . APIs may differ from the local adaptations; review imports/props when replacing.

## Features

- Responsive hero, category cards, product grid, about, applications, CTA and footer.
- Filter catalog by category and search by product name/SKU.
- Multi-item quotation drawer with quantity controls and contact fields.
- Demo quotation uses `mailto:` — **does not send data to a backend**.
- Reduced-motion support, semantic labels, keyboard-operable controls.
- Product artwork is original project SVG illustrations (NOT verified product photographs).
- SEO title and description.

## Before production

1. Replace branding, contact details, placeholder copy, category/SKU/product data in `src/data/catalog.ts`.
2. Replace SVG illustrations with photographs of the *actual* products; verify image rights and dimensions.
3. Replace `baogia@example.com` and `mailto:` flow in `src/components/site.tsx` with a server-side quotation API, validation, rate limiting, anti-spam, persistent storage and consent handling.
4. Connect a CMS or database if product updates are frequent.
5. Run `npm run build`; visually review at 390px, 768px, and 1440px with browser automation.
6. Reference site denied automated access (403). This is a distinctive implementation of the agreed sitemap, not a pixel-exact clone.

## Visual style

Charcoal green `#1d2625`, bronze `#ad7a46`, parchment `#f4f2ec`. Decorative animation is limited to entrance, category marquee and CTA shimmer.

## Trang quản trị (/admin)
- Cấu hình: copy `.env.example` → `.env.local` (`DATABASE_URL` Postgres, `AUTH_SECRET` chuỗi ngẫu nhiên dài, tuỳ chọn `BLOB_READ_WRITE_TOKEN` cho ảnh).
- `npm run db:setup` tạo bảng, dữ liệu mẫu và 2 tài khoản (admin, ketoan); mật khẩu ghi ở `credentials.txt` (đã gitignore). Chạy lại an toàn.
- `npm test` kiểm tra công thức công nợ, tổng tiền, đọc số tiền bằng chữ.
- Deploy Vercel: đặt 3 biến môi trường trên, chạy `db:setup` một lần với `DATABASE_URL` của production.
# thienhien-system-oxpro
