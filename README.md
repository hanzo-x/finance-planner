# Finance Planner

Ứng dụng web quản lý chi tiêu cá nhân: ghi thu chi theo danh mục, xem biểu đồ chi tiêu trong tháng, đặt wishlist và nhận lời chúc mừng khi tiết kiệm đạt 50% / 75% / 100% giá món đồ. Có thêm giao dịch định kỳ (tự ghi lương, tiền trọ...), dự báo ngày đủ tiền mua món đồ, biểu đồ thu – chi 6 tháng và nhận xét tháng tự động. Đồ án cá nhân môn **Phát triển ứng dụng web (PHY10615)**, HK1 2026–2027.

| | |
|---|---|
| **Production (Vercel)** | https://finance-planner-tan-seven.vercel.app |
| **GitHub** | https://github.com/hanzo-x/finance-planner |
| **Tài khoản demo** | Email: `demo@example.com` · Mật khẩu: `Demo@2026Planner` *(tạo bằng `npx prisma db seed`, xem bên dưới)* |
| **Nhật ký dùng AI** | [AI_LOG.md](./AI_LOG.md) |

## Ảnh chụp màn hình

> Chụp từ bản production rồi bỏ vào thư mục `docs/screenshots/`: `dashboard.png` (trang `/dashboard`), `transactions.png` (`/transactions`, có bộ lọc), `wishlist.png` (`/wishlist`, có thanh tiến độ), `budgets.png` (`/budgets`), `recurring.png` (`/recurring`, có vài khoản định kỳ).

| Tổng quan | Giao dịch | Wishlist | Ngân sách | Định kỳ |
|---|---|---|---|---|
| ![Tổng quan](docs/screenshots/dashboard.png) | ![Giao dịch](docs/screenshots/transactions.png) | ![Wishlist](docs/screenshots/wishlist.png) | ![Ngân sách](docs/screenshots/budgets.png) | ![Định kỳ](docs/screenshots/recurring.png) |

## Công nghệ

| Phần | Công nghệ (phiên bản) |
|---|---|
| Framework | Next.js 16.4 (App Router) + React 19 + TypeScript |
| Giao diện | Tailwind CSS v4, thành phần kiểu shadcn/ui (Radix), next-themes (sáng/tối), Sonner (toast) |
| Biểu đồ | shadcn Chart (Recharts 3) |
| Database | PostgreSQL trên Neon (Free) + Prisma ORM 7 (`prisma-client` + `@prisma/adapter-pg`) |
| Đăng nhập | Better Auth 1.7 (email + mật khẩu, GitHub) |
| Validate | Zod 4 |
| Kiểm thử | Vitest 5 + React Testing Library |
| CI / Deploy | GitHub Actions (lint, typecheck, test, build) + Vercel |

## Chạy trên máy của bạn

Cần: **Node.js 24**, Git, và một database PostgreSQL (khuyên dùng Neon miễn phí).

```bash
npm ci                              # cài thư viện (tự chạy prisma generate)
cp .env.example .env                # rồi mở .env điền các giá trị (xem giải thích trong file)
npx prisma migrate deploy           # tạo các bảng trong database (chạy các file trong prisma/migrations)
npx prisma db seed                  # tạo tài khoản demo + ~45 giao dịch mẫu + 3 khoản định kỳ
npm run dev                         # mở http://localhost:3000
```

### Biến môi trường

| Biến | Dùng để |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối database mà app dùng khi chạy (Neon: bản có `-pooler`) |
| `DIRECT_URL` | Chuỗi kết nối trực tiếp, dùng cho `prisma migrate` (Neon: bản không có `-pooler`) |
| `BETTER_AUTH_SECRET` | Chuỗi bí mật để ký cookie đăng nhập (cách tạo: xem `.env.example`) |
| `BETTER_AUTH_URL` | Địa chỉ gốc của web (local: `http://localhost:3000`) |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Đăng nhập bằng GitHub (tạo OAuth App trên GitHub) |
| `SEED_DEMO_EMAIL`, `SEED_DEMO_PASSWORD` | (Tuỳ chọn) đổi tài khoản demo do seed tạo |

Không bao giờ commit file `.env`. Chỉ `.env.example` (không chứa bí mật thật) được đưa lên GitHub.

### Chạy kiểm thử

```bash
npm run lint
npm run typecheck
npx vitest run          # 151 test: logic, validate, CSV, định kỳ, dự báo, route handler, component
npm run build
```

## Checklist tính năng

**Tính năng cốt lõi**

- ✅ Đăng ký / đăng nhập bằng email + mật khẩu (Better Auth), hiện tên người dùng, đăng xuất
- ⚠️ Đăng nhập bằng GitHub: code đã có, nút tự tắt nếu chưa cấu hình. *Cập nhật thành ✅ sau khi bạn tự thử đăng nhập GitHub thật trên production.*
- ✅ Mọi dữ liệu thuộc về một người dùng; kiểm tra phía server ở từng page, Server Action, Route Handler
- ✅ CRUD giao dịch (số tiền VND nguyên dương, mô tả 1–120 ký tự, loại, 8 danh mục, ngày)
- ✅ Validate bằng Zod phía server, lỗi hiện dưới từng ô, toast thành công/thất bại
- ✅ CRUD wishlist (tên, giá, mức ưu tiên) + thanh tiến độ = số dư ÷ giá × 100%, giới hạn 0–100% (số dư âm → 0%)
- ✅ Dashboard: số dư nổi bật (tổng thu − tổng chi), biểu đồ tròn chi tiêu theo danh mục tháng này kèm bảng số liệu, tiến độ wishlist
- ✅ Lọc: Tháng này / Tháng trước / Tất cả, theo danh mục, theo loại; trạng thái nằm trên URL, lọc phía server
- ✅ Toast mốc tiết kiệm 50% / 75% / 100%, không báo lặp (lưu mốc đã báo trong database); logic là hàm thuần có unit test (`src/lib/milestones.ts`)

**Tính năng mở rộng**

- ✅ Ngân sách theo danh mục mỗi tháng + cảnh báo ≥ 80% và ≥ 100% (toast + trang Ngân sách + Tổng quan)
- ✅ Nhập / xuất CSV qua Route Handler (kiểm tra tiêu đề, từng dòng, dung lượng, chống CSV injection)
- ✅ **Giao dịch định kỳ** (lương, tiền trọ, internet...): khai báo một lần, app tự ghi giao dịch vào đúng ngày mỗi tháng; tạm dừng / bật lại / sửa / xoá; ghi bù khi lâu không mở; không ghi trùng kể cả khi mở nhiều tab (`src/lib/recurring.ts`, `recurring-service.ts`)
- ✅ **Dự báo** "bao giờ đủ tiền" cho từng món wishlist, dựa trên tốc độ để dành 30–90 ngày gần nhất (`src/lib/forecast.ts`)
- ✅ **Biểu đồ cột thu – chi 6 tháng** và thẻ **"Nhận xét tháng này"** tự động (danh mục chi nhiều nhất, so với cùng kỳ tháng trước, tỉ lệ giữ lại được) (`trend.ts`, `insights.ts`)
- ✅ **Pháo giấy** khi một món wishlist đạt 100% (tự vẽ bằng canvas, không thêm thư viện; tôn trọng chế độ "giảm chuyển động") (`confetti.ts`)
- ⚠️ PWA một phần: có `manifest` + icon + giao diện responsive (cài được trên trình duyệt hỗ trợ); **chưa có** service worker / chế độ offline

**Yêu cầu kỹ thuật**

- ✅ Route Handler `GET /api/transactions` trả 401 khi chưa đăng nhập (có test)
- ✅ Data Access Layer `requireUser()` (`src/lib/dal.ts`) + `proxy.ts` chặn nhanh các trang cần đăng nhập
- ✅ ≥ 8 unit test + ≥ 1 component test (xem `src/**/*.test.ts(x)`)
- ✅ GitHub Actions CI: lint, typecheck, test, build (`.github/workflows/ci.yml`)
- ✅ `AGENTS.md` có mục "Luật dự án", `AI_LOG.md`, `.env.example`
- ❌ Playwright E2E (đề chỉ khuyến khích, chưa làm)
- ❌ Chưa đo Lighthouse trên production (đã quét axe-core cục bộ, không còn lỗi mức nghiêm trọng)

## Quyết định kỹ thuật

| Quyết định | Lý do |
|---|---|
| Tiền lưu bằng **số nguyên (Int) đồng** | Số thực có sai số (0,1 + 0,2 ≠ 0,3). Giới hạn 2 tỷ đồng/khoản để vừa kiểu Int 32-bit. |
| Ngày giao dịch lưu **00:00 UTC** của ngày đó; "tháng này" tính theo **giờ Việt Nam (UTC+7)** | Ngày không bị lệch dù server (Vercel) chạy ở múi giờ nào. Có test cho các mốc nửa đêm và tháng 12 → tháng 1. |
| Bộ lọc nằm trên **URL (`searchParams`)**, lọc bằng câu truy vấn database | Chia sẻ được link, bấm Back vẫn đúng, không cần Zustand. Giá trị bậy trên URL bị bỏ qua. |
| Giao dịch định kỳ ghi bằng cách **"ghi bù khi mở trang"**, không dùng cron | Vercel gói miễn phí không có tiến trình chạy ngầm. Mỗi lần mở trang, app tạo các lần đã đến hạn mà chưa ghi (`generatedThrough` = ngày đã ghi tới). Chống ghi trùng 3 lớp: khoá lạc quan trên `generatedThrough`, ràng buộc unique `(recurringId, date)` trong database, `createMany` + `skipDuplicates`. Có test cho ngày 31 / tháng 2 / năm nhuận, và đã thử 8 request cùng lúc. |
| Mốc tiết kiệm lưu ở cột `WishlistItem.milestone` + "khoá lạc quan" (`where milestone = giá trị cũ`) | Không báo lặp lại, kể cả khi hai request chạy cùng lúc. Nhảy từ 0% lên 80% chỉ báo mốc 75%. |
| Phân quyền: `requireUser()` trong mọi page/action, `updateMany/deleteMany` với `where: { id, userId }` | Người khác đoán được `id` cũng không sửa/xoá được dữ liệu của bạn (đã thử bằng trình duyệt). `proxy.ts` chỉ là lớp chặn nhanh, không phải chốt bảo mật chính. |
| Tắt `cacheComponents` (create-next-app 16.4 bật sẵn) | Mọi trang trong app đều là dữ liệu riêng của từng người dùng, không có gì để cache chung. |
| `<select>` gốc của trình duyệt thay cho Radix Select | Dùng bàn phím/trình đọc màn hình/điện thoại tốt sẵn, gửi cùng `<form>` không cần code thêm. |
| Prisma Client khởi tạo "lười" (`src/lib/prisma.ts`) | `next build` không cần có `DATABASE_URL`; dev không tạo thừa kết nối khi hot reload. |
| Không dùng `dangerouslySetInnerHTML` | Theo "Luật dự án"; shadcn Chart gốc dùng nó để chèn style nên đã viết lại bằng CSS variable trên thuộc tính `style`. |

## Giới hạn đã biết

- Chưa có xác minh email, quên mật khẩu, đổi mật khẩu.
- Trang Giao dịch hiển thị tối đa 500 giao dịch mới nhất (chưa phân trang); dùng bộ lọc để thu hẹp.
- Các tệp trong `src/components/ui/` được viết tay theo phong cách shadcn/ui vì môi trường tạo dự án không tải được registry của shadcn. Muốn thay bằng bản chính thức thì chạy `npx shadcn@latest init` (tạo `components.json`) rồi `npx shadcn@latest add <component>`.
- Hai file migration (`20261125000000_init`, `20261126000000_recurring_transactions`) được viết tay theo đúng schema và đã chạy thử trên PostgreSQL 16; hãy dùng `npx prisma migrate deploy` để áp dụng. Nếu sau này dùng `npx prisma migrate dev` mà báo lệch (drift), hãy để Prisma tạo migration mới.
- Giao dịch định kỳ chỉ được ghi khi có người mở trang (không có tiến trình chạy ngầm); sửa khoản định kỳ chỉ áp dụng cho các lần ghi sau, và không sửa được ngày trong tháng / ngày bắt đầu (muốn đổi thì tạm dừng rồi tạo khoản mới). Dự báo "bao giờ đủ tiền" chỉ là ước tính tuyến tính từ thói quen gần đây, không phải cam kết.
- Toàn bộ ảnh minh hoạ (`hero.png`, `og.png`, icon và 12 ảnh trong `public/images/`: `feature-*`, `auth-side`, `not-found`, `empty-*`, `step-*`) do Gemini tạo, đã khai báo trong `AI_LOG.md`; prompt tạo ảnh do sinh viên lưu riêng, không đưa vào repo.
- `npm audit` báo 3 lỗ hổng mức cao trong gói `effect` đi kèm Prisma CLI (công cụ dòng lệnh, không chạy trong ứng dụng khi hoạt động). Chưa xử lý.
- Chưa đo Lighthouse, chưa có Playwright E2E.

## Cấu trúc thư mục

```
prisma/              schema, migration, seed
src/app/             các trang (App Router), Server Actions (actions/), Route Handlers (api/)
src/components/      thành phần giao diện; ui/ là bộ nút, hộp thoại, biểu đồ...
src/lib/             logic: dal.ts (đăng nhập), queries.ts (database), milestones.ts, recurring.ts, forecast.ts, trend.ts, insights.ts, dates.ts, csv.ts, schemas.ts...
src/proxy.ts         chặn nhanh trang cần đăng nhập
docs/screenshots/    ảnh chụp màn hình cho README
```

## Sử dụng AI

Đồ án thuộc **Mức AI 3 (AI cộng tác)**. Chi tiết từng lần dùng AI, phần mình đã kiểm chứng và sửa: [AI_LOG.md](./AI_LOG.md).
