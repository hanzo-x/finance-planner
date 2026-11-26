# Finance Planner – mốc fp1

Nội dung của mốc này: schema Prisma + migration + seed (45 giao dịch mẫu) + trang Tổng quan chỉ đọc, kết nối PostgreSQL (Neon).

Chưa có đăng nhập: app đọc dữ liệu của tài khoản mẫu do seed tạo (email trong `SEED_DEMO_EMAIL`).

## Chạy thử

```bash
npm ci
cp .env.example .env     # điền DATABASE_URL, DIRECT_URL
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

## Về mốc này

Mốc này được dựng lại từ bản hoàn chỉnh sau khi dự án đã xong, bằng cách giữ lại đúng phần thuộc mốc và bỏ phần làm sau. Bản đầy đủ, README chi tiết và `AI_LOG.md` nằm ở tag `v1.0`.
