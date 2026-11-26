# Finance Planner – mốc fp2

Nội dung của mốc này: thêm, sửa, xoá giao dịch có kiểm tra bằng Zod (phía server), bộ lọc theo tháng / loại / danh mục lưu trên URL, và bộ unit test đầu tiên (`npx vitest run`).

Chưa có đăng nhập: app vẫn đọc dữ liệu của tài khoản mẫu do seed tạo.

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
