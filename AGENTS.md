<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Luật dự án (PHY10615 – Phát triển ứng dụng web)

### Phiên bản & công nghệ (không tự ý đổi)
- Next.js 16.4 App Router, React 19, TypeScript. KHÔNG dùng pages router, getServerSideProps, next/router; dùng proxy.ts (không có middleware.ts).
- Tailwind CSS v4 cấu hình bằng CSS (@theme). KHÔNG tạo tailwind.config.js.
- shadcn/ui dùng Radix: npx shadcn@latest add <component>.
- Prisma ORM 7 (KHÔNG nâng lên 8): generator "prisma-client" có output, adapter @prisma/adapter-pg, URL trong prisma.config.ts.
- Better Auth 1.7 (KHÔNG dùng NextAuth/Auth.js). Session: auth.api.getSession({ headers: await headers() }).
- Zod 4: z.flattenError(), { error: "..." }, z.email().
- Test: Vitest 5 + React Testing Library; E2E: Playwright.

### Bảo mật (bắt buộc)
- Mọi Server Action và Route Handler: gọi requireUser() trước, validate input bằng Zod, mọi truy vấn lọc theo userId lấy từ session.
- Sửa/xoá dùng updateMany/deleteMany với where: { id, userId } và kiểm tra count.
- Không đưa bí mật vào biến NEXT_PUBLIC_*; không commit .env.
- Không dùng dangerouslySetInnerHTML hoặc $queryRawUnsafe.

### Quy trình
- Trước khi kết thúc: chạy npm run lint, npm run typecheck, npx vitest run.
- Thay đổi logic nghiệp vụ phải kèm test.
- Không tự cài gói npm mới: nêu tên gói, lý do, link npm và chờ người dùng xác nhận.
- Tóm tắt thay đổi ngắn gọn để sinh viên ghi vào AI_LOG.md.

### Ghi chú riêng của dự án
- Route Handler không có `requireUser()` (vì nó chuyển hướng, không trả JSON) nên dùng `getCurrentUser()` rồi tự trả 401.
- Tiền VND luôn là số nguyên (Int). Ngày giao dịch lưu 00:00 UTC của ngày đó (xem `src/lib/dates.ts`).
- Logic nghiệp vụ (mốc tiết kiệm, ngân sách, lọc ngày, CSV, định kỳ, dự báo, xu hướng, nhận xét) là hàm thuần trong `src/lib/` và có unit test cạnh file.
- Giao dịch định kỳ: gọi `syncRecurring(userId)` ở ĐẦU mỗi page đọc số liệu (layout và page dựng song song nên không đặt ở layout). Không bao giờ ghi giao dịch định kỳ ngoài `recurring-service.ts`.
- Migration viết tay: không sửa file migration đã có; thay đổi database = thêm một thư mục migration mới. Áp dụng bằng `npx prisma migrate deploy`.
- Pháo giấy (`src/lib/confetti.ts`) tự viết bằng canvas để không thêm gói npm.
