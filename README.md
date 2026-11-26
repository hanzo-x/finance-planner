# Finance Planner – mốc fp3

Nội dung của mốc này: đăng nhập bằng email + mật khẩu và GitHub (Better Auth), `requireUser()` ở mọi trang, Server Action và Route Handler, mọi truy vấn lọc theo `userId` của session.

Tài khoản demo do seed tạo: `demo@example.com` / `Demo@2026Planner`.

## Chạy thử

```bash
npm ci
cp .env.example .env     # điền DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

## Về mốc này

Mốc này được dựng lại từ bản hoàn chỉnh sau khi dự án đã xong, bằng cách giữ lại đúng phần thuộc mốc và bỏ phần làm sau. Bản đầy đủ, README chi tiết và `AI_LOG.md` nằm ở tag `v1.0`.
