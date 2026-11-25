# AI_LOG – Nhật ký sử dụng AI

> Mức AI của bài này: Mức 3 (AI cộng tác) – xem Hướng dẫn sử dụng AI của môn học.
> Khai báo trung thực không bị trừ điểm. Không khai báo = vi phạm liêm chính học thuật.

> ⚠️ **Bạn (sinh viên) phải đọc và sửa file này cho đúng với những gì BẠN thực sự đã làm.**
> Các cột "Mình đã kiểm chứng / sửa gì" và phần "Tự đánh giá" bên dưới cố tình để trống ở chỗ
> chỉ bạn mới biết. Đừng điền những việc bạn chưa làm. Cột "Claude đã tự kiểm tra" chỉ ghi những
> lần chạy kiểm tra mà Claude đã thực hiện trong phiên làm việc.

| Ngày | Công cụ | Việc nhờ AI | Prompt (tóm tắt) | Kết quả dùng thế nào | Mình đã kiểm chứng / sửa gì | Commit/PR |
|---|---|---|---|---|---|---|
| 2026-11-25 | Claude (Sonnet 5.5) | Dựng toàn bộ khung dự án theo đề: schema Prisma, migration, seed, Better Auth, Server Actions, Route Handler, trang Tổng quan / Giao dịch / Wishlist / Ngân sách, 2 tính năng mở rộng (ngân sách + CSV), CI, README | Gửi file đề PDF (phần A. Đồ án cá nhân), nhờ tạo trang web Quản lý chi tiêu theo đúng đề; yêu cầu giải thích đơn giản | Lấy toàn bộ làm bản nền ban đầu | *(Bạn điền: đã đọc file nào, đã chạy thử gì, đã sửa/đổi gì)* | *(điền)* |
| 2026-11-25 | Claude (Sonnet 5.5) | Viết 89 unit/component test cho logic thuần (ngày, mốc tiết kiệm, tiền, Zod, CSV, ngân sách, tổng hợp), route 401, component | Tự sinh cùng lượt trên | Dùng nguyên | *(Bạn điền: ví dụ cố tình sửa hàm rồi xem test đỏ)* | *(điền)* |
| 2026-11-25 | Claude (Sonnet 5.5) | Viết README, AGENTS.md, danh sách prompt ảnh Gemini, bản đồ code, hướng dẫn | Tự sinh cùng lượt trên | Dùng sau khi chỉnh link/tài khoản của mình | *(Bạn điền)* | *(điền)* |
| 2026-11-25 | Gemini | Tạo 15 ảnh: hero trang chủ, ảnh chia sẻ link (og), biểu tượng ứng dụng, 4 ảnh tính năng, ảnh trang đăng nhập/đăng ký, ảnh trang 404, 3 ảnh trạng thái trống, 3 ảnh "3 bước" | Prompt tạo ảnh do sinh viên lưu riêng (không đưa vào repo) | Dùng sau khi cắt mép (bỏ ngôi sao nhỏ của Gemini ở góc) và đổi kích thước bằng Pillow. Ảnh Bước 3 lần đầu Gemini trả trùng ảnh Bước 2 nên phải tạo lại | *(Bạn điền: đã xem lại ảnh, chọn/tạo lại mấy lần)* | *(điền)* |
| 2026-11-25 | Claude (Sonnet 5.5) | Thêm 4 tính năng mở rộng theo yêu cầu của mình: giao dịch định kỳ (bảng mới + migration viết tay + trang + ghi bù tự động), dự báo ngày đủ tiền cho wishlist, biểu đồ cột thu – chi 6 tháng + nhận xét tháng, pháo giấy khi đạt 100%; viết thêm test, cập nhật tài liệu | "Làm thêm cho độc và hay hơn"; mình chọn 4 tính năng trong danh sách Claude đề xuất | Lấy làm bản nền | *(Bạn điền: đã đọc file nào, đã tự thử tạo khoản định kỳ / mở 2 tab / sửa thử hàm nào)* | *(điền)* |

## Claude đã tự kiểm tra gì trong phiên làm việc (ngày 25/11/2026)

Đây là những gì Claude đã chạy, **không** thay thế việc bạn tự kiểm chứng:

- `npm run lint`, `tsc --noEmit`, `vitest run` (151 test qua sau khi thêm 4 tính năng mở rộng), `next build` đều thành công trên máy ảo của Claude.
- Chạy ứng dụng thật với PostgreSQL 16 cài trong máy ảo + trình duyệt Chrome tự động: đăng nhập sai/đúng, lỗi từng ô, lọc theo URL, thêm/sửa/xoá giao dịch và wishlist, toast mốc 50/75/100% (không lặp), cảnh báo ngân sách, xuất/nhập CSV, đăng xuất, người dùng B sửa/xoá giao dịch của người dùng A (bị chặn), quét axe-core.
- Với 4 tính năng mở rộng, Claude chạy thêm bằng trình duyệt tự động: tạo khoản định kỳ có ngày bắt đầu trong quá khứ (ghi bù đúng số giao dịch), tải lại 5 lần và mở 8 request cùng lúc (không ghi trùng), tạm dừng / bật lại / sửa / xoá, người dùng B gửi lại đúng yêu cầu của A (bị từ chối, dữ liệu không đổi), pháo giấy xuất hiện đúng một lần rồi biến mất và không xuất hiện khi bật "giảm chuyển động", quét axe-core (sáng/tối), kiểm tra tràn ngang trên màn hình điện thoại 390px.
- Lỗi Claude tự phát hiện khi chạy thử các tính năng mới: (1) màu chữ toast cảnh báo của thư viện Sonner có độ tương phản chỉ ~3:1 ở chế độ sáng (đã làm đậm màu); (2) trang Giao dịch bị kéo ngang cả trang trên điện thoại do chữ ẩn `sr-only` nằm ngoài khung cuộn của bảng (lỗi có từ trước, đã sửa bằng `relative` trên khung cuộn); (3) lỗi "ngày bắt đầu" của khoản định kỳ chỉ hiện sau khi sửa hết các lỗi khác (đã chuyển kiểm tra vào chính ô ngày).
- Một lỗi Claude tự phát hiện khi chạy test: schema email dùng `z.email().trim()` kiểm tra định dạng *trước khi* cắt khoảng trắng nên email có dấu cách thừa bị từ chối; đã sửa bằng cách cắt/đổi chữ thường trước rồi mới kiểm tra.
- **Chưa kiểm tra**: đăng nhập GitHub thật, chạy trên Neon + Vercel thật, `prisma migrate dev` / `migrate deploy` thật (môi trường của Claude không tải được công cụ migrate của Prisma nên 2 file migration được viết tay và chạy thử bằng `psql`), Lighthouse.

## Tự đánh giá cuối bài

*(Bạn tự viết, bằng lời của bạn, sau khi đã đọc lại code và chạy thử ứng dụng)*

- Phần mình tự làm hoàn toàn:
- Phần AI giúp nhiều nhất và mình đã hiểu nó thế nào:
- Một lần AI sai và cách mình phát hiện: *(gợi ý để bạn tự kiểm: lỗi email ở trên là một ví dụ có thật do Claude phát hiện; nếu bạn tự tìm được một lỗi khác thì ghi lỗi của bạn)*
