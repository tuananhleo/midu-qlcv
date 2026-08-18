---
name: luu-tai-lieu
description: Ghi các thay đổi/quyết định gần đây của dự án MIDU QLCV vào file MIDU_QLCV_TAILIEU.md (đánh số Task #NNN tiếp theo), rồi commit + push. Dùng khi người dùng nói "lưu vào tài liệu", "ghi lại tài liệu", "note vào tài liệu cho anh" hoặc tương đương.
---

# Lưu tài liệu MIDU QLCV

Skill này ghi lại các việc vừa làm/vừa trao đổi (fix, tính năng mới, quyết định thiết kế, phát
hiện lỗi...) vào file tài liệu changelog của dự án, theo đúng format đã dùng xuyên suốt từ đầu.

## File đích

`MIDU_QLCV_TAILIEU.md` ở thư mục gốc dự án (cùng cấp với `admin.html`/`tracker.html`/
`order.html`/`MIDU_MKT_Script.gs`).

Nếu file này CHƯA tồn tại (dự án mới, hoặc bị xoá nhầm): tạo mới, bắt đầu bằng 1 tiêu đề
`# MIDU QLCV — Tài liệu dự án` rồi bắt đầu ngay từ `### Task #1`. Nếu ĐÃ tồn tại, luôn nối
tiếp — không bao giờ ghi đè/xoá nội dung cũ.

## Các bước thực hiện

1. **Đọc file hiện tại**, tìm số Task lớn nhất đang có (`### Task #NNN`). Task mới sẽ đánh số
   `NNN+1` (nếu ghi nhiều việc cùng lúc thì tăng dần #NNN+1, #NNN+2...).
2. **Xác định phạm vi cần ghi** — dựa vào những gì vừa làm/trao đổi trong phiên hiện tại kể từ
   lần lưu tài liệu gần nhất (không phải toàn bộ lịch sử dự án). Nếu không chắc ranh giới, có
   thể đối chiếu với `git log` gần đây trên các file `.html`/`.gs` để không bỏ sót việc đã code
   nhưng chưa ghi tài liệu.
3. **Viết entry mới**, chèn ngay TRƯỚC section `## 14. Liên kết nhanh` (hoặc section liên kết
   nhanh cuối file, số thứ tự `##` có thể đã đổi — luôn tìm đúng heading `## `+số+`. Liên kết
   nhanh`, chèn ngay trước nó, sau dấu `---` cuối cùng của entry Task liền trước).

   **Format bắt buộc cho mỗi Task** (khớp với 114 entry đã có sẵn trong file — đọc vài entry
   gần cuối file để bắt đúng giọng văn/độ chi tiết trước khi viết):
   ```
   ### Task #NNN — Tiêu đề ngắn gọn, mô tả đúng việc đã làm

   **Yêu cầu/Câu hỏi (nếu có, trích gần nguyên văn):** "..."

   **Nguyên nhân/Phát hiện (nếu là fix bug):** giải thích ngắn gọn root cause, KHÔNG chỉ mô tả
   triệu chứng.

   **Fix/Quyết định:** đã làm gì, đổi file nào, hàm nào — đủ chi tiết để đọc lại 1 tháng sau
   vẫn hiểu được, nhưng KHÔNG chép nguyên code, chỉ mô tả.

   **Xác nhận/Lưu ý (nếu có):** đã test/kiểm chứng thế nào, hoặc hạn chế/rủi ro còn tồn đọng
   cần nhớ (VD: giới hạn chỉ ở phía client, chưa chặn server; dữ liệu có thể lệch tên do X...).

   ---
   ```
   - Viết bằng tiếng Việt, giọng văn kỹ thuật, ngắn gọn — đúng phong cách các entry đã có.
   - Chỉ giữ những mục (Yêu cầu/Nguyên nhân/Fix/Xác nhận) THỰC SỰ có nội dung — không viết
     "Không có" cho mục rỗng, bỏ hẳn mục đó.
   - Nếu việc vừa làm chỉ là 1 câu trả lời/tư vấn (không sửa code), vẫn ghi lại nếu nó ảnh hưởng
     tới quyết định thiết kế tương lai (VD: "tư vấn không cần tạo tài khoản cho phòng ban khác").
   - Trích **nguyên văn** câu yêu cầu của người dùng khi có thể — đây là thói quen xuyên suốt
     tài liệu, giúp tra lại đúng ngữ cảnh sau này.

4. **Kiểm tra cú pháp Markdown hợp lệ** (không bắt buộc chạy tool, chỉ cần đọc lại đảm bảo
   không lỗi heading/bullet).

5. **Commit + push:**
   ```
   git add MIDU_QLCV_TAILIEU.md
   git commit -m @'
   Ghi lai tai lieu Task #NNN[-MMM]: <tom tat rat ngan, khong dau, khong dung
   dau ngoac kep trong noi dung>
   '@
   git push
   ```
   **Bắt buộc dùng PowerShell heredoc `@'...'@`** (single-quoted, không nội suy biến) cho commit
   message — dùng `-m "..."` thường với chuỗi có dấu ngoặc kép lồng bên trong ĐÃ từng làm hỏng
   lệnh git (pathspec error, các từ sau dấu `"` bị hiểu nhầm thành tên file). Nếu nội dung tóm
   tắt cần nhắc tên field/chuỗi có dấu ngoặc kép, đổi sang không dùng ngoặc kép trong message
   (VD `field status` thay vì `field "status"`).

6. **Báo lại ngắn gọn cho người dùng**: đã ghi Task # nào, link tới file (dùng cú pháp
   `[MIDU_QLCV_TAILIEU.md](MIDU_QLCV_TAILIEU.md)`), và mã commit đã push.

## Lưu ý khác

- KHÔNG tự ý sửa/xoá nội dung Task cũ trừ khi người dùng yêu cầu rõ — skill này chỉ THÊM MỚI
  vào cuối (trước "Liên kết nhanh").
- Nếu section "## 14. Liên kết nhanh" (hoặc số thứ tự đã đổi) có bảng URL và có link mới phát
  sinh từ việc vừa làm (VD deploy mới, domain đổi) đáng để thêm vào bảng đó — có thể cập nhật
  kèm theo, nhưng đây là phụ, không bắt buộc mỗi lần chạy skill.
