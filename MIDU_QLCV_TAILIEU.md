# MIDU QLCV — Tài liệu hệ thống
> Cập nhật lần cuối: 24/07/2026  
> Tác giả: Tuan Anh Leo (nguyentuananh.maps@gmail.com)

---

## 1. Tổng quan

Hệ thống quản lý công việc nội bộ phòng Marketing – Truyền thông MIDU. Không cần server riêng — toàn bộ là file HTML tĩnh, dữ liệu lưu trên Google Sheets (qua GAS) và Supabase.

**Truy cập nhanh:**

| Trang | URL GitHub Pages | File cục bộ |
|-------|-----------------|-------------|
| Gửi order | https://tuananhleo.github.io/midu-qlcv/order.html | order.html |
| Admin | https://tuananhleo.github.io/midu-qlcv/admin.html | admin.html |
| Theo dõi | https://tuananhleo.github.io/midu-qlcv/tracker.html | tracker.html |

**Thư mục làm việc:** `Z:\DU LIEU 2\MIDU\KHOI KINH DOANH VA TIEP THI\MARKETING-TRUYENTHONG\PHAN MEM QLCV\` (đổi từ `Z:\DU LIEU MIDU\MIDU\KHOI KINH DOANH VA TIEP THI\MARKETING-TRUYEN THONG\PHAN MEM QLCV\` ngày 23/07/2026 — folder cũ có thể vẫn còn tồn tại song song, đã copy đầy đủ + verify git log khớp, cần tự xoá tay folder cũ sau khi xác nhận không còn dùng)  
**GitHub repo:** https://github.com/tuananhleo/midu-qlcv (nhánh `main`)

---

## 2. Cấu trúc file

```
PHAN MEM QLCV/
├── order.html              — Trang gửi order (phòng ban dùng)
├── admin.html              — Trang quản lý (nhân viên MKT)
├── tracker.html            — Trang theo dõi tiến độ (public)
├── MIDU_MKT_Script.gs     — Google Apps Script backend (copy vào GAS editor)
├── do_git_push.bat         — Push lên GitHub (double-click là xong)
├── 1_setup_git.bat         — Cài đặt Git lần đầu
├── 2_push_and_deploy.bat   — Push Git + deploy Firebase (sau khi setup Firebase)
├── HUONG_DAN_DEPLOY.md    — Hướng dẫn deploy chi tiết
└── MIDU_QLCV_TAILIEU.md   — File tài liệu này
```

> ⚠️ File trang Lịch Content (hiện tại: `Content-Da-kenh-1-file.html`, nằm ngoài thư mục này tại `...\MARKETING-TRUYEN THONG\Content Oanh\`, deploy tại `content-marketing.pages.dev`) **TUYỆT ĐỐI KHÔNG sửa** — chỉ đọc để hiểu cấu trúc dữ liệu, mọi tích hợp xử lý ở phía admin.html/tracker.html (mục 9).

---

## 3. Backend — Google Apps Script (GAS)

**URL hiện tại:**
```
https://script.google.com/macros/s/AKfycbw5klIN8zAsl6cYSfIYDu8GNol4tCR4KQt8-fvldq_SZC1DDgUeK6bk73jF-ZoMdCjF/exec
```

**Google Sheet:** tên sheet `Orders`  
**Phiên bản:** v8  
**File script:** `MIDU_MKT_Script.gs` (copy toàn bộ nội dung vào Apps Script editor, sau đó deploy lại)

### Endpoints GAS

| Method | action | Ai gọi | Mô tả |
|--------|--------|--------|-------|
| GET | `getOrders` | admin, tracker | Lấy tất cả đơn hàng |
| GET | `getFormSchema` | order, admin | Lấy schema form + danh sách phòng ban |
| GET | `getUsers` | admin | Lấy danh sách tài khoản người dùng |
| POST | `submitOrder` | order.html | Gửi đơn mới |
| POST | `updateOrder` | admin.html | Cập nhật đơn (status, assignedTo, linkResult...) |
| POST | `deleteOrder` | admin.html | Xóa đơn |
| POST | `loginUser` | admin.html | Đăng nhập — trả về `{ user: { id, username, displayName, role, dept } }` |
| POST | `saveUser` | admin.html | Tạo/cập nhật tài khoản |
| POST | `deleteUser` | admin.html | Xóa tài khoản |
| POST | `toggleUserActive` | admin.html | Kích hoạt / vô hiệu hóa |
| POST | `saveFormSchema` | admin.html | Lưu schema form (từ Form Builder hoặc khi lưu phòng ban) |

### Cột Google Sheet (thứ tự cố định — KHÔNG thay đổi)

```
id, type, submittedAt,
requester, department, projectName, projectCode, deadline, priority, note,

── Thiết kế ──────────────────────────────────────────────────
d_objective, d_size, d_qty, d_text_content, d_ref, d_note_design,

── Video AI ──────────────────────────────────────────────────
d_script, d_duration, d_voice, d_ref_video, d_note_video,

── Media ─────────────────────────────────────────────────────
d_media_types, d_ratio, d_script_link, d_location, d_note_media,

── Chạy Ads ─────────────────────────────────────────────────
d_platform, d_budget, d_audience, d_creative, d_note_ads,

── Content ───────────────────────────────────────────────────
d_content_type, d_channel, d_topic, d_keywords, d_tone, d_outline, d_ref_content,

── Khác ──────────────────────────────────────────────────────
d_desc, d_ref_khac,

── Bắn Bot ───────────────────────────────────────────────────
d_gio_ban_bot, d_chuong_trinh, d_doi_tuong, d_page, d_cong_cu, d_noi_dung_bot, d_hinh_anh,

── Admin (luôn ở cuối — không thêm cột khác vào giữa) ───────
status, assignedTo, linkResult, adminNote, clientNote,
completedAt, completedBy, resultBy, resultAt
```

---

## 4. Database phụ — Supabase

**URL:** `https://loqcqtuouagzaqwdmhji.supabase.co`  
**Bảng:** `plan_data` — cấu trúc đơn giản: `id (text PK)`, `value (jsonb)`  
**Anon key:** (xem trong admin.html — key public, đọc/ghi theo RLS policy)

### ⚠️ Trang Lịch Content dùng mô hình nhiều board (từ 07/2026)

Trang Content (`content-marketing.pages.dev`, file cục bộ `Content-Da-kenh-1-file.html` — **không thuộc repo này, không sửa**) đã nâng cấp lên "mỗi người 1 board", chọn bằng dropdown "BẢNG CỦA" ngay trong trang. Từ đó **mọi key dữ liệu của board đều có hậu tố `--<workspaceId>`**, ví dụ `content-plan-orders-v1--kim-oanh`.

- Danh sách board: đọc từ `content-plan-workspaces-v1` (`[{id,name}]`)
- Board đang có: `kim-oanh` (Kim Oanh), `khanh-huyen` (Khánh Huyền)
- Các **key không hậu tố** (`content-plan-tasks-v2`, `content-plan-orders-v1`, `content-plan-channels-v1`...) là **bản chụp cũ, đông cứng từ trước khi có board** — trang Content không còn ghi vào đó nữa. Chỉ còn dùng làm nguồn bù tên kênh cũ khi load channels (xem 9.1).
- **Bài học:** nếu admin/tracker đọc nhầm key không hậu tố → sẽ thấy dữ liệu cũ/rỗng dù Content đã cập nhật liên tục. Đây chính là lỗi đã xảy ra và được vá trong Task #58 (mục 13).

**Các bản ghi quan trọng (theo từng board):**

| id (mẫu cho `kim-oanh`) | Nội dung |
|----|----------|
| `content-plan-tasks-v2--kim-oanh` | Lịch content (bài đăng, ý tưởng, kênh) của board đó |
| `content-plan-orders-v1--kim-oanh` | Đầu việc board đó gửi sang phòng MKT |
| `content-plan-channels-v1--kim-oanh` | Danh sách kênh của board đó |
| `content-plan-workspaces-v1` | (không hậu tố) danh sách toàn bộ board |

> Nếu mất quyền ghi Supabase → vào Supabase Dashboard → Authentication → Policies → bảng `plan_data` → kiểm tra policy cho anon key.

> ⚠️ **Sự cố dữ liệu (22/07/2026):** phát hiện `content-plan-tasks-v2--khanh-huyen` (toàn bộ lịch content của Khánh Huyền) rỗng hoàn toàn (`value:[]`) trong khi `content-plan-orders-v1--khanh-huyen` vẫn còn 1 order (`TK-260717-001`) tham chiếu tới 1 task đã không còn tồn tại trong mảng rỗng đó — khả năng cao thao tác xoá 1 task trên trang Content đã quét sạch nhầm toàn bộ mảng thay vì chỉ 1 phần tử (khác Task #63 — lần đó là lỗi hiển thị thoáng qua ở admin/tracker, lần này là mất dữ liệu thật trên Supabase). Đã xác nhận với Khánh Huyền và xoá order rác còn sót lại (không xoá được gì thêm vì file Content không thuộc repo này). Nếu lịch content của cô ấy vẫn trống sau khi xác nhận lại, cần báo lỗi bên phía file Content (`Content-Da-kenh-1-file.html`) để xử lý tận gốc.

---

## 5. localStorage keys

| Key | Lưu gì | Ai đọc/ghi |
|-----|--------|-----------|
| `midu_mkt_gas_url` | URL GAS tùy chỉnh (override mặc định) | admin, order |
| `midu_mkt_orders_cache` | Cache đơn GAS dạng `{orders, schema}` | admin |
| `midu_mkt_departments` | Danh sách phòng ban do admin config | admin, tracker, order |
| `midu_mkt_assignees` | Danh sách nhân viên MKT (fallback khi chưa có tài khoản) | admin |
| `midu_mkt_custom_roles` | Vai trò tùy chỉnh thêm ngoài 5 vai trò gốc | admin |
| `midu_mkt_session` | Session đăng nhập hiện tại (mất khi đóng tab) | admin |
| `midu_mkt_fb_config` | Cấu hình Firebase Firestore | admin |
| `midu_status_config` | Cấu hình trạng thái tùy chỉnh | admin |
| `midu_priority_config` | Cấu hình độ ưu tiên tùy chỉnh | admin |
| `midu_content_orders_cache` | Cache lịch content Oanh từ Supabase | admin |
| `midu_content_hidden` | IDs đơn content đã ẩn | admin |
| `midu_theme` | Chủ đề dark/light | admin |
| `grp_<key>` | Trạng thái mở/đóng từng group trong tracker | tracker |

---

## 6. Trang order.html — Gửi order

**Ai dùng:** Toàn bộ nhân viên các phòng ban — không cần đăng nhập.

### Luồng hoạt động

1. Load trang → fetch GAS `getFormSchema` → lấy danh sách phòng ban + loại công việc
2. Nếu có schema cũ trong localStorage → dùng tạm để render nhanh
3. **Luôn** gọi GAS để lấy `departments` mới nhất, kể cả khi đã có cache
4. Người dùng chọn loại công việc → form tương ứng xuất hiện động
5. Submit → POST `submitOrder` → lưu vào Google Sheet → hiện thông báo

### Đồng bộ phòng ban (quan trọng)

- Nguồn sự thật duy nhất về danh sách phòng ban là **admin config → GAS**
- Khi load `order.html`, dù có `lsSchema` cũ, vẫn luôn áp dụng `departments` từ GAS
- Code xử lý trong `init()`:
  ```javascript
  // Luôn áp dụng departments từ GAS (admin config là nguồn chính xác)
  else if (departments?.length) {
    buildDeptSelect(departments);
    localStorage.setItem('midu_mkt_departments', JSON.stringify(departments));
  }
  ```

### Auto-save thông tin người dùng

- Sau khi submit thành công, họ tên + phòng ban được lưu vào localStorage
- Lần sau mở lại → tự điền sẵn, người dùng không cần điền lại

### Các loại công việc mặc định

| ID | Tên | Icon | Mô tả ngắn |
|----|-----|------|-----------|
| `thiet-ke` | Thiết kế | 🎨 | Banner, poster, ấn phẩm |
| `video-ai` | Video AI | 🎬 | Video AI, storytelling |
| `media` | Media | 📸 | Quay, chụp, dựng video |
| `chay-ads` | Chạy Ads | 📢 | Facebook, Google, TikTok Ads |
| `content` | Content | ✍️ | Bài viết, caption, script |
| `lich-truyen-thong` | Lịch T.Thông | 📅 | Bắn bot, tin nhắn bán hàng |
| `khac` | Khác | 📦 | Yêu cầu khác |

---

## 7. Trang admin.html — Quản lý

**Ai dùng:** Nhân viên MKT đăng nhập, phân quyền theo vai trò.

### 7.1 Đăng nhập

- Màn hình login hiện ra khi chưa có `sessionStorage['midu_mkt_session']`
- POST `loginUser` lên GAS với `{ username, password }`
- Nếu GAS chưa deploy phiên bản mới → fallback dùng mật khẩu cũ trong `localStorage['midu_mkt_admin_pw']` (mặc định: `midu2024`)
- Sau đăng nhập: `currentUser = { id, username, displayName, role, dept }` lưu vào sessionStorage
- Session mất khi đóng tab (dùng sessionStorage, không phải localStorage)

### 7.2 Hệ thống vai trò

**5 vai trò gốc (không xóa được, có thể đổi tên/icon):**

| ID | Tên mặc định | Cấp |
|----|------------|-----|
| `admin` | 🔑 Quản trị viên | admin |
| `leader_thiet_ke` | 👑 Trưởng nhóm Thiết Kế | leader |
| `leader_media` | 👑 Trưởng nhóm Media | leader |
| `nv_thiet_ke` | 🎨 Nhân viên Thiết Kế | employee |
| `nv_media` | 📸 Nhân viên Media | employee |

Admin có thể tạo thêm vai trò custom ngoài 5 vai trò này.

**3 cấp quyền:**

| Cấp | Xem đơn | Xóa | Cài đặt | Form Builder | Quản lý user | Báo cáo |
|-----|---------|-----|---------|-------------|-------------|---------|
| `admin` | **Tất cả** | ✅ | ✅ | ✅ | ✅ | ✅ |
| `leader` | **Tất cả** | ❌ | ❌ | ❌ | ❌ | ✅ |
| `employee` | **Chỉ của mình** | ❌ | ❌ | ❌ | ❌ | ❌ |

> Employee chỉ thấy đơn có `assignedTo` khớp với `displayName` của họ (hỗ trợ đơn gán nhiều người, phân tách bằng dấu phẩy).
>
> **Ngoại lệ cố ý:** giới hạn "Chỉ của mình" áp dụng cho **đơn GAS** và **Internal Task** (việc tạo tay trong Tracker), nhưng **KHÔNG áp dụng cho Content Order/Content Task** (đồng bộ từ Lịch Content) — employee vẫn thấy toàn bộ card Lịch Content của mọi người, vì nhóm content tự cập nhật bên trang Content của họ, admin.html chỉ hiển thị để phòng theo dõi chung (xem Task #72).
>
> **Từ Task #76:** bảng 3 cấp trên chỉ là MẶC ĐỊNH BAN ĐẦU theo vai trò — mỗi người dùng (modal "Quản lý người dùng") có thể được cấu hình override riêng cho cả 6 quyền này, cộng thêm giới hạn "hạng mục công việc được xem" (áp dụng thêm vào, không thay thế, quy tắc "Chỉ của mình" của employee).

**Quyền phân công (assign):**

| Vai trò | Có thể assign cho |
|---------|------------------|
| `admin` | Tất cả mọi người |
| `leader_thiet_ke` | nv_thiet_ke + chính mình |
| `leader_media` | nv_media + chính mình |
| `employee` | Không assign được |

**Fallback khi chưa có tài khoản:** dùng danh sách `midu_mkt_assignees` trong localStorage thay cho tài khoản GAS.

### 7.3 Tải dữ liệu khi load trang (`loadAll`)

Thứ tự:
1. **Render cache ngay lập tức** từ `localStorage['midu_mkt_orders_cache']` và `midu_content_orders_cache` → UI hiện nhanh
2. **Song song** kick off 2 request chậm:
   - GAS `getOrders` + `getFormSchema` (có thể 3-5s)
   - Supabase `_loadContentTasks()` + `_loadContentOrders()` (thường nhanh hơn)
3. Supabase xong trước → render lại với data mới
4. GAS xong → cập nhật `allOrders`, `formSchema`, `midu_mkt_departments` → render lại lần cuối

### 7.4 Bộ lọc và tìm kiếm

**Bộ lọc trên tab Đơn hàng:**
- Từ khóa (ô tìm kiếm)
- Trạng thái (chips)
- Phòng ban (chips)
- Loại công việc (chips)
- Người phụ trách (chips)
- Khoảng thời gian (period buttons)

**Lọc phòng ban — logic `normDept()`:**

Chip phòng ban chỉ dùng danh sách từ admin config (không gộp từ đơn cũ). Khi so sánh dùng `normDept()` để bỏ prefix "Phòng ":
```javascript
function normDept(s){ return (s||'').trim().replace(/^Ph[oòó]ng\s+/i,''); }
// "Marketing – Truyền thông" khớp với "Phòng Marketing – Truyền thông"
```
Lý do cần hàm này: admin config lưu không có "Phòng" nhưng đơn cũ gửi có "Phòng " ở đầu.

**Tìm kiếm — tìm trong các trường:**
```
projectName, requester, department, id, projectCode,
assignedTo, resultText, adminNote, clientNote
```

**Bộ lọc kỳ (period) — áp dụng đồng thời cho cả tab Đơn hàng và tab Báo cáo:**

| Giá trị | Khoảng thời gian |
|---------|----------------|
| `today` | Hôm nay |
| `week` | Tuần này (T2–CN) |
| `last-week` | Tuần trước |
| `month` | Tháng này |
| `year` | Năm này |
| `all` | Tất cả thời gian |
| `custom` | Tùy chọn qua date range picker |

Logic lọc theo kỳ: dùng `submittedAt` của đơn. Đặc biệt: đơn trễ deadline (chưa hoàn thành + deadline < hôm nay) **luôn hiển thị** bất kể kỳ chọn.

### 7.5 Các tabs

#### Tab 1: Đơn hàng
- Danh sách GAS orders + content orders gộp lại
- Inline edit nhanh (không mở modal): status, assignedTo, linkResult, adminNote, clientNote
- Nút ✏️ mở modal chỉnh sửa toàn bộ (đổi requester, department, deadline, toàn bộ chi tiết...)
- Nút 🗑️ xóa (chỉ admin)
- Badge deadline: 🔴 TRỄ / ⚠️ Còn Xn (trong vòng 3 ngày) / bình thường
- **Ghi chú admin** (`adminNote`): nội bộ, KHÔNG hiển thị trên tracker.html

#### Tab 2: Phối hợp (Lịch Content)
- Iframe nhúng thẳng `https://content-marketing.pages.dev/` (link chung, đổi board bằng dropdown trong trang hoặc hash `#ws=<id>`)
- Danh sách `contentOrders` đọc từ Supabase, gộp từ **tất cả board** trong `_CONTENT_SOURCES` (xem 9.1)
- Khi admin cập nhật status/linkResult → `_writeBackContentOrder(orderId, link, status, ws)` ghi ngược đúng board (`ws` lấy từ field `_ws` gắn sẵn trên mỗi order khi load) → người content thấy ngay

#### Tab 3: Tracker (Kanban nội bộ)
- Tasks nội bộ lưu Supabase (`content-plan-tasks-v2`)
- Bộ lọc đầy đủ giống tab Đơn hàng
- Tạo/sửa/xóa task, gán người, đặt deadline

#### Tab 4: Kế hoạch tuần
- Lịch tuần (T2–T7), phân công cho từng người
- Bộ lọc theo người

#### Tab 5: Báo cáo (chỉ Admin và Leader)
- Xem chi tiết ở mục 7.6 bên dưới

### 7.6 Tab Báo cáo — chi tiết

**Quyền truy cập:** chỉ `admin` và `leader`.

**Dữ liệu báo cáo:** gộp 3 nguồn:
```javascript
[...allOrders,
 ...contentOrders (department mặc định 'Nội bộ MKT'),
 ...internalTasks (loại bỏ trùng với contentOrders)]
```

**Bộ lọc kỳ:** dùng chung với tab Đơn hàng (cùng 1 biến `currentPeriod`). Khi đổi kỳ → cả danh sách đơn lẫn báo cáo đều cập nhật.

**Date range picker tùy chỉnh:**
- Click "📅 Tùy chỉnh" → modal calendar hiện ra
- Bên trái: preset nhanh (Hôm nay, Tuần này, 7 ngày qua, 30 ngày qua, Tháng này, Tháng trước, Quý này, Năm này, Tất cả)
- Bên phải: calendar chọn ngày bắt đầu → ngày kết thúc (highlight khoảng giữa)
- Điều hướng tháng/năm bằng dropdown hoặc nút ◀ ▶
- Áp dụng → `currentPeriod='custom'`, `customRange = { from, to }`

**4 thẻ tóm tắt:**

| Thẻ | Mô tả |
|-----|-------|
| Tổng order | Số đơn trong kỳ |
| Hoàn thành | Số đơn status `hoan-thanh` + % so với tổng |
| Đang xử lý | Số đơn status `dang-xu-ly` |
| Trễ deadline | Số đơn chưa hoàn thành có deadline < hôm nay |

**4 biểu đồ (dùng Chart.js):**

| Biểu đồ | Loại | Mô tả | Click được không |
|---------|------|-------|-----------------|
| Theo loại order | Doughnut | Phân bổ đơn theo loại (thiết kế, video, media...) | ✅ Drill down |
| Theo phòng ban | Bar ngang | Số đơn từng phòng, sort giảm dần | ✅ Drill down |
| Theo trạng thái | Bar đứng | Chưa làm / Đang xử lý / Hoàn thành | ✅ Drill down |
| Order theo thời gian | Line | Số đơn gửi theo trục thời gian | ❌ |

**Trục thời gian tự điều chỉnh theo kỳ:**
- `today` → theo giờ (00:00 – 23:00)
- `week` → theo thứ (T2–CN)
- `month` → theo ngày (01/07 – 31/07)
- `year` → theo tháng (T1–T12)
- `custom` → theo ngày (tối đa 90 ngày)

**Drill down (click vào biểu đồ):**
- Mở modal danh sách đơn theo nhóm được chọn
- Hiện: tên dự án, người gửi, phòng ban, loại, trạng thái, deadline
- Có nút ↗ để nhảy sang tab Đơn hàng lọc theo đơn đó

**Nhóm theo dự án:**
- Nếu có đơn nào điền `projectCode` → xuất hiện section "📁 Theo dự án"
- Mỗi mã dự án là 1 card: tổng đơn, breakdown theo trạng thái, danh sách đơn con
- Click card → drill down xem chi tiết

### 7.7 Cài đặt (modal ⚙️ — chỉ Admin)

Gồm 6 mục:

**1. Phòng ban**
- Textarea mỗi dòng một phòng ban
- Nhấn "Lưu phòng ban" → lưu `midu_mkt_departments` localStorage + gửi lên GAS (`saveFormSchema` với `departments` mới)
- order.html tự lấy khi reload

**2. Nhân viên MKT** (fallback)
- Danh sách tên, dùng khi chưa có tài khoản người dùng nào
- Lưu vào `midu_mkt_assignees`
- Khi đã có tài khoản GAS → hệ thống dùng tài khoản thay cho danh sách này

**3. GAS URL**
- Override URL GAS mặc định (khi deploy GAS mới → URL thay đổi)
- Lưu vào `midu_mkt_gas_url`

**4. Firebase Config**
- Paste JSON config từ Firebase Console (Project Settings → General → Your apps)
- Lưu vào `midu_mkt_fb_config`
- Nút "🔄 Sync toàn bộ lên Firebase" → đẩy hết `allOrders` lên Firestore collection `midu_orders`
- Firebase là **tùy chọn** — nếu không config thì hệ thống vẫn chạy bình thường bằng GAS

**5. Trạng thái**
- Thêm/sửa/xóa trạng thái ngoài 4 trạng thái core
- Mỗi trạng thái có: icon, tên, màu chữ (color picker)
- 4 trạng thái core (`chua-lam`, `dang-xu-ly`, `feedback`, `hoan-thanh`) có nhãn "core" — không xóa được
- Lưu vào `midu_status_config`, áp dụng ngay lên chip lọc

**6. Độ ưu tiên**
- Thêm/sửa/xóa mức ưu tiên
- Mỗi mức có: icon, tên, checkbox "Mặc định" (chỉ 1 mức được là mặc định)
- Lưu vào `midu_priority_config`

### 7.8 Form Builder (modal 📝 — chỉ Admin)

Cho phép tùy chỉnh các trường trong form gửi order.

**Cấu trúc:**
- Mỗi tab là 1 loại công việc (Thiết kế, Video AI, Media, Chạy Ads, Content, Khác...)
- 7 loại mặc định (DEFAULT_TYPES) — không xóa được
- Admin có thể thêm loại mới: nhập icon + tên + mô tả ngắn → tự sinh `id`

**Mỗi trường (field) có:**
- `id` — định danh (tự sinh nếu tạo mới: `custom_<timestamp>`)
- `label` — tên hiển thị
- `type` — loại input: `text`, `textarea`, `number`, `url`, `checkbox-group`
- `placeholder` — gợi ý nhập
- `span` — chiều rộng: 1 (nửa) hoặc 2 (full)
- `rows` — số dòng (chỉ với textarea)

**Thao tác:**
- Kéo để sắp xếp lại thứ tự (drag & drop)
- Sửa trực tiếp label, placeholder, type, span ngay trên form
- Nút "+ Thêm trường" → thêm 1 trường text mới ở cuối
- Nút "↺ Reset" → khôi phục về trường mặc định của loại đó
- Nút "🗑️ Xóa loại này" → chỉ hiện với loại custom (không phải built-in)

**Lưu:**
- Nhấn "💾 Lưu thay đổi" → gộp schema với `departments` hiện tại → POST `saveFormSchema` lên GAS
- `formSchema` local cũng được cập nhật ngay
- order.html tự lấy schema mới khi reload

### 7.9 Quản lý người dùng (modal 👥 — chỉ Admin)

- Danh sách tất cả users từ GAS
- Hiện ai "Chưa có tài khoản đăng nhập" (nhân viên trong danh sách nhưng chưa tạo tài khoản)
- Tạo tài khoản: nhập username, password, vai trò → POST `saveUser` lên GAS
- Kích hoạt/vô hiệu hóa: `toggleUserActive`
- Xóa tài khoản: `deleteUser`
- Tài khoản `@admin` (u_admin) không thể xóa

---

## 8. Trang tracker.html — Theo dõi tiến độ

**Ai dùng:** Các phòng ban — public, không cần đăng nhập.

### Luồng hiển thị

1. Load → fetch GAS `getOrders` → render danh sách
2. Nhóm theo trạng thái (groups)
3. Bộ lọc phòng ban + trạng thái + loại + deadline + từ khóa

### Bộ lọc

Tương tự admin nhưng không có bộ lọc người phụ trách và kỳ thời gian.

**Chuẩn hóa phòng ban:** dùng `normDept()` giống admin.html.

**Tìm kiếm — các trường:**
```
projectName, department, id, projectCode, requester,
assignedTo, resultText, adminNote, clientNote
```

### Cấu trúc groups (nhóm trạng thái)

| Group | Key | Mở mặc định |
|-------|-----|------------|
| ⏳ Chưa làm | `chua-lam` | ✅ |
| 🔄 Đang xử lý | `dang-xu-ly` | ✅ |
| 💬 Feedback | `feedback` | ✅ |
| ✅ Hoàn thành | `done` | ❌ (đóng mặc định) |

**Auto-expand khi tìm kiếm:** khi có keyword trong ô tìm → tất cả groups tự mở:
```javascript
const hasKw = !!(document.getElementById('f-kw')?.value?.trim());
const open = hasKw ? true : (localStorage.getItem('grp_'+key) ?? (defaultOpen?'1':'0')) === '1';
```

Trạng thái mở/đóng của từng group được nhớ trong `localStorage['grp_<key>']`.

### Logic deadline hiển thị trên tracker

Tự động, không cần tác động thủ công:

| Tình huống | Badge hiển thị |
|-----------|---------------|
| Đơn chưa hoàn thành, deadline đã qua | 🔴 TRỄ (trên dòng deadline) |
| Đơn chưa hoàn thành, deadline còn ≤ 3 ngày | ⚠️ Còn Xn (màu vàng) |
| Đơn đã hoàn thành nhưng `completedAt > deadline` | ⚠️ Trễ deadline (badge đỏ nhỏ bên cạnh ngày hoàn thành) |
| Đơn hoàn thành đúng hạn | Hiện ngày hoàn thành bình thường |

Thẻ thống kê đầu trang tracker: **Trễ deadline** (màu đỏ) — click để lọc ngay.

### Hiển thị kết quả

- `linkResult`: hiện nút "📎 Xem kết quả" → mở link
- `clientNote`: hiện phần phản hồi cho người gửi (màu xanh lá)
- `adminNote`: **KHÔNG hiển thị** — chỉ admin thấy

---

## 9. Kết nối Lịch Content (Content Person Integration)

Hệ thống hỗ trợ 2 loại dữ liệu từ trang lịch content, đọc riêng theo **từng board** (xem mục 4):

| Loại | Supabase key (mẫu) | Biến trong code | Mục đích |
|------|-------------|-----------------|---------|
| **Content Tasks** | `content-plan-tasks-v2--<workspaceId>` | `contentTasks[]` | Công việc content của bản thân (bài đăng, kênh, ý tưởng) |
| **Content Orders** | `content-plan-orders-v1--<workspaceId>` | `contentOrders[]` | Order gửi sang phòng MKT (thiết kế, video, ads...) |

---

### 9.1 Kiến trúc CONTENT_SOURCES (config-driven, dễ mở rộng)

**Vị trí trong code:** ngay sau khai báo `_SB_KEY` trong cả `admin.html` (tên biến `_CONTENT_SOURCES`) và `tracker.html` (tên biến `CONTENT_SOURCES`).

```javascript
// tracker.html — admin.html tương tự nhưng không có field url/idPrefix
const CONTENT_APP_URL = 'https://content-marketing.pages.dev/'; // 1 link chung cho cả nhóm
const CONTENT_SOURCES = [
  { id:'kim-oanh',    name:'Kim Oanh',    url:CONTENT_APP_URL,                    idPrefix:'cont-'    },
  { id:'khanh-huyen', name:'Khánh Huyền', url:CONTENT_APP_URL+'#ws=khanh-huyen',  idPrefix:'cont-kh-' },
];
```

`id` chính là **workspace id** trong `content-plan-workspaces-v1` — mọi Supabase key của người đó được build động: `content-plan-tasks-v2--${id}`, `content-plan-orders-v1--${id}`, `content-plan-channels-v1--${id}`.

**Thêm content person mới:**
1. Xác nhận `id` board của họ (mở `content-marketing.pages.dev`, chọn tên họ ở dropdown "BẢNG CỦA", xem trong `content-plan-workspaces-v1` trên Supabase, hoặc hỏi trực tiếp)
2. Thêm 1 dòng vào `CONTENT_SOURCES` (cả admin.html lẫn tracker.html): `{ id:'<workspaceId>', name:'<Tên>', url:CONTENT_APP_URL+'#ws=<workspaceId>', idPrefix:'cont-<viet-tat>-' }` — `idPrefix` phải unique để tránh trùng ID card
3. Save → push git → xong. Không cần sửa logic fetch/render nào khác — mọi hàm đều lặp qua mảng này.

> ⚠️ Link `#ws=<id>` chỉ hoạt động trên bản Content **đang triển khai thật** (`content-marketing.pages.dev`). Domain cũ `content-kim-oanh.pages.dev`/`content-kim-oanh.netlify.app` đã ngừng dùng — đừng dùng lại các domain đó.

**Hàm `_loadContentTasks()` (admin) / `loadContentTasks()` (tracker):**

```
Vòng lặp qua CONTENT_SOURCES
  → Fetch Supabase key content-plan-tasks-v2--<id> của từng nguồn song song (Promise.all)
  → Map mỗi task với _sourceName, _sourceUrl, _ws:src.id, type:'content', department:'Marketing – Truyền thông'
  → Gộp tất cả vào contentTasks[] (flat)
```

**Field quan trọng trong mỗi content task:**

| Field | Nguồn dữ liệu | Ý nghĩa |
|-------|--------------|---------|
| `_ws` | `src.id` | Workspace/board nguồn — dùng để ghi ngược đúng chỗ, KHÔNG được bỏ khi map dữ liệu |
| `_contentTaskId` | `ct.id` (id gốc, chưa gắn `idPrefix`) | Dùng để build deep-link — xem khung dưới |
| `_sourceName` (tracker) | `src.name` | Tên người (Kim Oanh, Khánh Huyền...) |
| `_sourceUrl` | `_contentDeepLink(src.id, ct.id)` | Link mở **thẳng đúng bài** trên Lịch Content (không phải trang chủ) |
| `requester` | `src.name` | Người tạo đầu việc |
| `assignedTo` | `ct.coord` (nếu hợp lệ, khác rỗng/"Khác") hoặc `src.name` | Người thực hiện — **không được lọc bỏ task thiếu coord**, xem cảnh báo Task #58 |
| `type` | `'content'` | Loại đầu việc (dùng trong bộ lọc) |
| `department` | `'Marketing – Truyền thông'` | Phòng ban |
| `d_channel` | `ct.channelId` | Kênh đăng |
| `d_topic` | `ct.idea \|\| ct.content` | Chủ đề / ý tưởng |
| `linkResult` | `ct.postUrl \|\| ct.result \|\| ct.link \|\| ct.deliverableLink` | Link bài đã đăng |
| `_contentStatus` | `ct.status` | Trạng thái gốc từ lịch content (raw) |

**Card hiển thị (`_fromContent = true`) — CHỈ XEM, không có nút sửa:**
- Badge "📅 Lịch Content" + tên kênh + trạng thái
- Nút "↗ Mở bài này" ở cả admin.html lẫn tracker.html — href = `t._sourceUrl` (deep-link, xem khung "Deep-link" dưới)
- **Cố ý không có** dropdown trạng thái / nút "✏️ Sửa": chưa có cơ chế `_writeBackContentTask` ghi ngược trạng thái task loại này về Supabase (khác với Content Orders — xem 9.2), nên để editable sẽ trông như lưu được nhưng thực ra mất khi tải lại trang

> **Deep-link tới đúng bài (Task #59).** Trang Content tự có sẵn cơ chế nhận `#ws=<board>&task=<id>` trên URL (hàm `handleDeepLink()`/`taskDeepLink()` trong file Content, không do repo này viết) — tự chuyển đúng board, nhảy đúng tuần chứa bài, highlight dòng đó ~4s. admin.html/tracker.html đều có hàm `_contentDeepLink(ws, taskId)` build URL này (`CONTENT_APP_URL + '#ws=' + ws + '&task=' + taskId`), gắn vào `_sourceUrl` của **cả content task lẫn content order** (order dùng `o.taskId` — nếu order không phát sinh từ 1 bài lịch cụ thể thì `taskId` rỗng → không hiện nút, tránh dẫn tới link vô nghĩa). Trước đây `_sourceUrl` chỉ trỏ trang chủ, phải tự tìm bài thủ công — đã thay bằng deep-link theo yêu cầu thực tế.

**Tích hợp vào toàn hệ thống (BẮT BUỘC đủ cả 3 chỗ — xem Task #58):**
- `updateStats()`: tính cả `contentTasks` vào tổng số việc
- `render()` intRows: hiển thị trong danh sách, lọc được theo type/dept/status/keyword
- `renderReport()` allForReport: gộp vào báo cáo (department = 'Marketing – Truyền thông', type = 'content')

**Channels (tên kênh hiển thị thay vì ID):**
`_loadContentChannels()` (có ở **cả** admin.html lẫn tracker.html) đọc **cả** key cũ không hậu tố `content-plan-channels-v1` **lẫn** `content-plan-channels-v1--<id>` của từng board trong `CONTENT_SOURCES`/`_CONTENT_SOURCES`, gộp vào 1 map `_contentChannelMap` — ưu tiên tên ở key sau (mới hơn) khi trùng id kênh. Lý do gộp cả key cũ: khi Content chuyển sang mô hình board, board mới bị seed lại danh sách kênh gốc và có thể thiếu kênh cũ vẫn đang được dùng thật (đã xảy ra với kênh "Fanpage Học viện CGCC Midu" — xem Task #58).

> ⚠️ **Phải `await _loadContentChannels()` xong trước khi gọi `_loadContentTasks()`** — task map tên kênh ngay lúc load (không phải lazy), nên nếu chạy song song (`Promise.all`) sẽ bị race và card hiện ID thô thay vì tên (đúng lỗi đã xảy ra ở admin.html — ban đầu chỉ có tracker.html có bước này, admin.html hoàn toàn chưa có `_contentChannelMap` nên mọi badge kênh đều hiện ID thô kiểu `mren2mu1kbzeyi`, `ch-menaq7`). Xem `loadAll()` và `_autoSyncContent()` trong admin.html để đúng thứ tự gọi.

---

### 9.2 Content Orders (order từ lịch content sang MKT)

```
Lịch Content (board của từng người)
        │ Tạo order thiết kế / video / ads → ghi vào Supabase
        ▼
  plan_data (id = 'content-plan-orders-v1--<workspaceId>')
        │ admin.html gọi _loadContentOrders() khi load — lặp qua từng board trong CONTENT_SOURCES
        ▼
  contentOrders[] trong bộ nhớ (mỗi order có field _ws = board nguồn)
        │
        ├─→ Hiển thị trong tab "Phối hợp" (danh sách)
        ├─→ Gộp vào tab "Đơn hàng" (nếu chưa có GAS order tương ứng)
        └─→ Gộp vào tab "Báo cáo"
        │
        │ Admin cập nhật trạng thái / link kết quả (co._ws được truyền theo)
        ▼
  _writeBackContentOrder(orderId, deliverableLink, lcStatus, ws)
        │ nếu thiếu ws → dừng ngay, KHÔNG đoán board để tránh ghi nhầm
        │ đọc toàn bộ content-plan-orders-v1--<ws> → cập nhật đúng bản ghi → ghi lại toàn bộ
        ▼
  Người content reload trang → thấy trạng thái mới ngay, đúng board của họ
```

### Mapping trạng thái (content → hệ thống)

```javascript
const _CONTENT_STATUS_MAP = {
  'Lên kế hoạch':'chua-lam', 'Đang soạn':'dang-xu-ly',
  'Chờ duyệt':'dang-xu-ly',  'Đã lên lịch':'dang-xu-ly',
  'Đã đăng':'hoan-thanh',    'Huỷ':'hoan-thanh',
  'Order Thiết kế':'dang-xu-ly'
};
```

### Cache

`contentOrders` được cache vào `localStorage['midu_content_orders_cache']` để render nhanh lần sau. Mỗi khi load trang → vẫn fetch Supabase để lấy data mới nhất.

---

## 10. Firebase (tùy chọn)

Firebase Firestore là lớp đồng bộ **tùy chọn**, song song với GAS:

- **Khi không config:** hệ thống chạy hoàn toàn bình thường qua GAS
- **Khi có config:** mỗi khi updateOrder/deleteOrder → ghi mirror lên Firestore collection `midu_orders`
- **Sync toàn bộ:** nút trong Cài đặt → đẩy hết `allOrders` lên Firestore

Dùng Firebase SDK compat v9.22.2, load lazy (chỉ load khi có config).

---

## 11. Dữ liệu mặc định

**Phòng ban mặc định:**
```
Kinh doanh
Kế toán – Tài chính
Nhân sự
Vận hành
Ban Giám đốc
Marketing – Truyền thông
Kho – Logistics
Khác
```

**Trạng thái mặc định (4 core — không xóa được):**

| ID | Label | Icon | Màu |
|----|-------|------|-----|
| `chua-lam` | Chưa làm | ⏳ | #f97316 (cam) |
| `dang-xu-ly` | Đang xử lý | 🔄 | #60a5fa (xanh dương) |
| `feedback` | Feedback | 💬 | #a78bfa (tím) |
| `hoan-thanh` | Hoàn thành | ✅ | #22c55e (xanh lá) |

**Độ ưu tiên mặc định:**

| ID | Label | Icon | Mặc định |
|----|-------|------|---------|
| `thap` | Thấp | 🟢 | ❌ |
| `trung-binh` | Trung bình | 🟡 | ✅ |
| `cao` | Cao | 🟠 | ❌ |
| `khan-cap` | Khẩn cấp | ⚡ | ❌ |

**Người phụ trách fallback (khi chưa có tài khoản):**
```
Lê Ngọc Huy, Trọng Trung, Trung Kiên, Nguyên
```

---

## 12. Deploy & Git

### Push lên GitHub

Double-click `do_git_push.bat` → tự động:
1. Xóa `.git\index.lock` nếu còn tồn đọng
2. Set `safe.directory "*"` (fix lỗi WebDAV/RaiDrive)
3. Set git user email + name
4. Remove & re-add remote origin
5. Checkout nhánh main
6. `git add admin.html tracker.html order.html`
7. Commit + force push

Sau push ~1-2 phút → GitHub Pages tự cập nhật.

### Lưu ý Git trên ổ mạng Z: (RaiDrive/WebDAV)

- Git hay báo "dubious ownership" → đã fix bằng `safe.directory "*"` trong bat file
- File `.git\index.lock` hay tồn đọng nếu git bị interrupt → bat file tự xóa trước khi commit
- **Không** dùng bash/PowerShell để push (permission issues) → luôn dùng `.bat` file
- **File khóa khác `.git\index.lock` cũng có thể tồn đọng** — gặp thực tế 20/07/2026: `packed-refs.lock` và `refs/remotes/origin/main.lock` bị kẹt lại (không phải do bat file gây ra, bat chỉ dọn `index.lock`), khiến `git push` báo lỗi dù thực ra **đã đẩy lên GitHub thành công** — lỗi chỉ nằm ở bước git tự cập nhật con trỏ theo dõi cục bộ (`refs/remotes/origin/main`) sau khi push, không phải push thất bại. Nếu gặp lỗi "Another git process seems to be running" sau khi push, đừng vội cho là push fail — chạy `git fetch origin main` để xem remote đã có commit mới chưa trước khi thử lại.
- **Nghi có watcher chạy nền** (`watch_and_push.ps1` / `2_start_watcher.vbs`, xem mục 2) tự động thao tác git theo lịch — có thể là nguồn gây tranh chấp file khóa với thao tác push thủ công. Nếu push hay bị lock, kiểm tra có tiến trình PowerShell nào đang chạy watcher này không (Task Manager) trước khi push tay.
- `credential.helper=manager` (Git Credential Manager) có thể mở cửa sổ đăng nhập GitHub tương tác khi push lần đầu/token hết hạn — cửa sổ này chỉ hiện trên máy thật, không thao tác được qua terminal tự động. Nếu push "treo" không phản hồi, khả năng cao đang chờ đăng nhập ở cửa sổ đó.

### Setup Firebase Hosting (chưa thực hiện)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# → public dir: .   (dấu chấm)
# → single-page app: No
# → overwrite index.html: No
firebase deploy
```

Sau đó có thể dùng `2_push_and_deploy.bat` để push GitHub + deploy Firebase một lần.

---

## 13. Lịch sử thay đổi (gần nhất)

| Task | Mô tả | File |
|------|-------|------|
| #76 | **Phân quyền tuỳ chỉnh theo TỪNG NGƯỜI DÙNG** — trước đây quyền hoàn toàn cố định theo 3 mức admin/leader/employee, không có khái niệm giới hạn theo hạng mục công việc. Giờ mỗi người dùng (modal "Quản lý người dùng") có thể override riêng: 6 quyền (xem tất cả/xoá/cài đặt/Form Builder/quản lý user/báo cáo) + danh sách hạng mục công việc được xem (để trống = tất cả). Giới hạn hạng mục là ĐIỀU KIỆN THÊM VÀO, không thay thế quy tắc "chỉ xem việc của mình" của employee. Cần **deploy lại GAS** (thêm cột 9-10 sheet Users) để có hiệu lực. Chi tiết bên dưới. | admin.html, MIDU_MKT_Script.gs |
| #75 | **Sao lưu tự động Content Order/Content Task/Internal Task vào sheet "Orders"** — theo yêu cầu "tất cả các công việc cần được lưu về sheet này". Dùng lại đúng 2 action có sẵn `addOrder`/`updateOrder` (không cần sửa GAS). Chỉ ghi MỚI 1 lần khi thấy lần đầu (đánh dấu qua `KEY_MIRRORED_IDS` trong localStorage để không trùng dòng ở mỗi lượt đồng bộ định kỳ), lần sau chỉ update khi có thay đổi trạng thái/phân công/link kết quả. **Không áp dụng cho Lịch T.Thông** (đã tách sheet riêng ở #73, mirror vào đây sẽ phá mục đích chống phình sheet). Chi tiết bên dưới. | admin.html |
| #74 | **Fix panel "Lịch bắn gần nhất" trên order.html chỉ hiện lịch tương lai, bỏ sót lịch sử** — code cũ lọc `dt >= today` VÀ loại bỏ hẳn trạng thái "Đã bắn", nên lịch vừa bắn gần đây không hiện ra dù có dữ liệu thật, gây hiểu nhầm "chưa có lịch nào". Sửa: hiện cả lịch sử 14 ngày gần đây (đánh dấu ✅, làm mờ) lẫn lịch sắp tới, không loại trừ theo trạng thái. | order.html |
| #73 | **Tách Lịch T.Thông khỏi sheet Orders** — order loại `lich-truyen-thong` gửi từ order.html giờ ghi thẳng vào sheet ngoài "LỊCH TRUYỀN THÔNG QUA BOT" (`LICH_TT_SHEET_ID`, thêm 6 cột: ID/Người yêu cầu/Phòng ban/Ưu tiên/Người phụ trách/Link kết quả) thay vì sheet "Orders" — tránh sheet Orders phình to theo tần suất lịch bắn bot (~1/ngày). Vẫn quản lý được như order bình thường trên admin.html (assign/trạng thái/link kết quả qua GAS action `updateLichTT`); tracker.html chỉ xem. Thêm panel "📅 Lịch bắn gần nhất" trên order.html (gộp `getOrders`+`getLichTT`) để người gửi tự tránh trùng lịch — không tự động chặn. `MIDU_MKT_Script.gs` đưa vào Git lần đầu (trước đây chưa từng track). | admin.html, tracker.html, order.html, MIDU_MKT_Script.gs |
| #72 | **Fix lỗ hổng phân quyền: Internal Task không giới hạn theo người phụ trách** — employee đăng nhập đang thấy TẤT CẢ việc nội bộ tự tạo (Tracker), không riêng việc gán cho mình, khác với đơn GAS (đã giới hạn đúng từ trước). Đã xác nhận với người dùng: Content Order/Content Task **cố ý** không giới hạn (nhóm content tự cập nhật ở trang riêng), chỉ Internal Task cần sửa cho khớp với đơn GAS. Chi tiết bên dưới. | admin.html |
| #71 | **Chuẩn hoá tên người phụ trách trong báo cáo** — field `coord` bên Lịch Content là ô nhập tự do nên cùng 1 người bị ghi nhiều kiểu ("Huy AI", "A Huy thiết kế", "An thiết kế"...). Thêm bảng alias `_ASSIGNEE_ALIAS` gộp về đúng tên chuẩn, chỉ ảnh hưởng hiển thị báo cáo, không sửa dữ liệu gốc. Chi tiết bên dưới. | admin.html |
| #70 | **Fix hàng loạt lỗi số liệu tab Báo cáo + thiết kế lại giao diện**. Chi tiết bên dưới. | admin.html, tracker.html |
| #69 | **Đổi link Lịch Content** từ `content-kim-oanh.pages.dev` sang domain chuẩn mới `content-marketing.pages.dev` (hằng số `CONTENT_APP_URL`). | admin.html, tracker.html |
| #68 | **Tối ưu tốc độ tải Lịch Content**: song song hoá fetch channels (trước đây tuần tự từng key, chậm gấp N lần), thêm timeout 8s cho mọi fetch Content, fix race condition channels/tasks ở tracker.html, fix admin.html thiếu cache `contentTasks` (`KEY_CT_CACHE`) khiến mỗi lần F5 tạm thời mất hết card "📅 Lịch Content" vài giây trước khi tải lại đủ. Chi tiết bên dưới. | admin.html, tracker.html |
| #67 | **Tracker.html chỉ xem, không sửa được gì nữa** — bỏ dropdown đổi trạng thái Content Task (trước đây tracker public không đăng nhập vẫn sửa được), xoá luôn các hàm ghi Supabase không còn nút nào gọi tới (`saveLcResult`, `saveLcStatus`, `_writeBackContentOrder`, `_writeBackContentTask`, `_saveLcTaskStatus`) — trang public vẫn có thể bị gọi tay qua console nếu hàm còn tồn tại dù không có UI. | tracker.html |
| #66 | **Content Task giờ sửa được trạng thái**, ghi ngược về Supabase (trước đây chỉ xem). Chi tiết bên dưới. | admin.html, tracker.html |
| #65 | **Thêm trạng thái "🚫 Hủy"** — trước đây Content đánh dấu "Huỷ" bị gộp chung vào "Hoàn thành", sai lệch số liệu. Chi tiết bên dưới. | admin.html, tracker.html |
| #64 | **Đồng bộ tự động khi Content xoá/sửa/thêm** — không cần bấm "Tải lại" nữa. Chi tiết bên dưới. | admin.html, tracker.html |
| #63 | **Fix nghiêm trọng: 1 board lỗi thoáng qua làm sập TOÀN BỘ Lịch Content, kể cả board không liên quan.** Chi tiết bên dưới. | admin.html, tracker.html |
| #62 | **Tìm kiếm bỏ qua dấu tiếng Việt** (`normVN()`) + bổ sung field `requester` còn thiếu cho Content Order/Task, để ô tìm kiếm thực sự tìm được theo "Người yêu cầu". Chi tiết bên dưới. | admin.html, tracker.html |
| #61 | **Fix nút "📋 Sao chép" không copy được** (đặc biệt link và đường dẫn ổ cứng). Chi tiết bên dưới. | admin.html, tracker.html |
| #60 | **Fix nghiêm trọng (2 lớp lồng nhau): bật filter "Loại công việc" bất kỳ làm biến mất TOÀN BỘ Lịch Content trong admin.html** — (1) công thức lọc thiếu nhánh cho content task, (2) `TYPE_MAP` thiếu hẳn `'internal'` nên không có chip nào để khớp. Chi tiết bên dưới. | admin.html |
| #59 | **Deep-link "Mở bài này"**: nút mở Lịch Content giờ nhảy thẳng vào đúng bài (tự chuyển board + tuần + highlight) thay vì chỉ mở trang chủ rồi phải tự tìm. Áp dụng cho cả content task và content order (nếu có `taskId` gốc). | admin.html, tracker.html |
| #58 | **Fix đồng bộ Lịch Content bị đứt + admin thiếu việc so với tracker (nghiêm trọng)**. Chi tiết bên dưới. | admin.html, tracker.html |
| #54 | ~~Báo cáo tách nguồn~~: thêm bộ lọc Nguồn (Tất cả / Từ phòng ban / Nội bộ MKT) vào tab Báo cáo. **⚠️ Đã kiểm tra 20/07/2026: `currentSource`/`setSource()` KHÔNG còn tồn tại trong admin.html hiện tại** — có thể đã bị revert hoặc chưa từng merge đầy đủ. Dòng lịch sử này giữ lại để tra cứu, không phản ánh code hiện tại. | admin.html |
| #53 | ~~Tăng tốc load~~: kiến trúc cache-first 6 bước — đọc ALL cache trước (0ms), render ngay, song song GAS+Supabase (timeout 8s), render lại sau Supabase, render lại sau GAS. Áp dụng cả admin `loadAll()` và tracker `loadOrders()`. Thêm `KEY_CT_CACHE` cho contentTasks. **⚠️ Đã kiểm tra 22/07/2026: `KEY_CT_CACHE` KHÔNG tồn tại trong admin.html thực tế** (chỉ có ở tracker.html) — `showCached()` không đọc cache contentTasks, khiến mỗi lần F5 admin tạm mất card Lịch Content vài giây. Đã vá lại ở Task #68. | admin.html, tracker.html |
| #52 | ~~Báo cáo nâng cao~~: (1) Không hiện "Không có order nào" khi đang tải, (2) Breakdown loại order hiện TẤT CẢ type kể cả count 0, (3) Thêm chart + bảng theo người phân công (click xem chi tiết). **⚠️ Đã kiểm tra 22/07/2026: mục (3) KHÔNG tồn tại trong admin.html thực tế** (không có `chart-assignee`/hàm liên quan nào) — chưa từng merge đầy đủ hoặc bị mất. Đã làm lại từ đầu ở Task #70. | admin.html |
| #50 | ~~Fix báo cáo~~: thêm `'internal':'🏠 Nội bộ MKT'` vào `TYPE_MAP`, thêm bảng count+% dưới donut chart. **⚠️ Đã kiểm tra 20/07/2026: mục `'internal'` KHÔNG có trong `TYPE_MAP` thực tế** — có thể bị mất khi merge/revert sau đó. Đây chính là 1 trong 2 nguyên nhân của Task #60. Phần bảng count+% dưới donut chart thì vẫn còn. | admin.html |
| #49 | **Fix zero stats**: hybrid render — render ngay sau Supabase, re-render sau GAS. | admin.html, tracker.html |
| #48 | Channel name thật thay cho ID, modal xem chi tiết content, CONTENT_SOURCES config-driven | admin.html, tracker.html |
| #44–46 | Đồng bộ lịch content Kim Oanh vào admin/tracker qua Supabase | admin.html, tracker.html |

### Kiến trúc Cache-First 6 Bước (Task #53)

```
loadAll() / loadOrders():
  B1 ── Đọc 3 cache localStorage ngay lập tức (0ms, không network)
         KEY_CACHE (GAS orders) + KEY_CT_CACHE (contentTasks) + KEY_CO_CACHE (contentOrders)
  B2 ── RENDER #1 nếu có cache → tắt spinner ngay (near-instant)
  B3 ── Khởi động GAS fetch song song (timeout 8s, không chờ)
  B4 ── await Supabase (~1-2s): channels + contentTasks + contentOrders
  B4 ── RENDER #2 sau Supabase → cập nhật nội dung Oanh
  B5 ── await GAS (chậm ~5-8s)
         → cập nhật allOrders + lưu cache mới
  B6 ── RENDER #3 cuối + luôn tắt spinner
```

Cache keys: `midu_mkt_orders_cache` | `midu_ct_cache` | `midu_content_orders_cache`  
Ưu điểm: lần đầu ~2s (Supabase), lần sau ~0ms (cache); spinner không bao giờ treo.

### Task #57 — Click biểu đồ thời gian → xem danh sách công việc theo ngày

**Tính năng:** Bấm vào điểm bất kỳ trên biểu đồ "Order theo thời gian" sẽ mở modal hiển thị:
1. **Badges loại công việc** (Thiết kế ×3, Video AI ×1...) — click từng badge để lọc riêng loại đó
2. **Danh sách đầy đủ** tất cả CV ngày đó: tên, loại (màu), người yêu cầu, phòng ban, trạng thái, deadline, nút ↗

**Cách hoạt động (admin.html):**
- `_timeOrdersMap = {}` — biến module lưu `key → orders[]` khi build chart
- `buildChartTime()` đồng thời populate `_timeOrdersMap` và thêm `onClick` vào Chart.js options
- `openTimeDrillDown(key, orders)` — render modal với badge loại + danh sách
- `openDrillDownList(orders, title)` — hiện chi tiết khi click badge loại

---

### Task #56 — Fix biểu đồ thời gian luôn bằng 0

**Vấn đề:** `buildChartTime()` dùng `parseDate(o.submittedAt)` — nhưng `contentOrders` và `internalTasks` không có field `submittedAt` (chỉ có `createdAt` hoặc `deadline`), nên toàn bộ bar = 0.

**Fix (1 dòng, admin.html):**
```javascript
// Trước:
const d=parseDate(o.submittedAt);
// Sau:
const d=parseDate(o.submittedAt)||parseDate(o.createdAt)||parseDl(o);
```

Ưu tiên: `submittedAt` (GAS orders) → `createdAt` (internalTasks) → `deadline` (contentOrders fallback).

**⚠️ Đã kiểm tra 22/07/2026: fix này KHÔNG còn tồn tại trong `buildChartTime()` thực tế** — code chỉ còn `parseDate(o.submittedAt)` trơ trọi, y hệt "trước" ở trên, khiến người dùng report lại đúng triệu chứng cũ ("Biểu đồ theo thời gian order chưa chạy"). Đã áp lại đúng fallback 3 tầng này trong Task #70.

---

### Task #58 — Fix đồng bộ Lịch Content bị đứt + admin thiếu việc so với tracker

**Triệu chứng báo lên:** "trong admin rất hay thiếu công việc so với tracker" — lặp lại nhiều lần.

**3 nguyên nhân độc lập, cộng dồn lại:**

1. **Sai key Supabase.** Trang Content nâng cấp lên mô hình nhiều board (mục 4), mọi key thực tế đều có hậu tố `--<workspaceId>`. admin.html/tracker.html vẫn đọc/ghi key không hậu tố (đã đông cứng, không còn được Content ghi vào) → coi như đọc dữ liệu chết.
   - Fix: mọi fetch/POST tới `content-plan-tasks-v2`, `content-plan-orders-v1`, `content-plan-channels-v1` đổi sang có hậu tố `--<id>`, lặp qua `CONTENT_SOURCES` (mục 9.1).
2. **Filter âm thầm loại bỏ 80% task.** `_loadContentTasks()` trong admin.html có dòng `.filter(t=>t.coord&&t.coord.trim()&&t.coord.trim()!=='Khác')` — loại mọi task chưa gán "Phối hợp". Kiểm tra dữ liệu thật lúc phát hiện: **24/30 task** (80%) của Kim Oanh bị ẩn theo cách này. tracker.html không có filter này (dùng `src.name` làm fallback).
   - Fix: bỏ filter, dùng cùng fallback `ct.coord hợp lệ → src.name` như tracker.html.
3. **`contentTasks[]` chưa từng được đưa vào danh sách hiển thị của admin.html.** Đây là nguyên nhân lớn nhất: 3 hàm tổng hợp dữ liệu (`render()` → biến `intRows`, `updateStats()`, `renderReport()` → biến `allForReport`) đều gộp `contentOrders` + `internalTasks` nhưng **thiếu `contentTasks`** — trong khi tracker.html gộp đủ cả 3 nguồn ở những hàm tương đương. Nghĩa là toàn bộ lịch content (bài đăng, không phải "order") chưa bao giờ hiện trên admin, bất kể coord.
   - Fix: thêm `...contentTasks` vào cả 3 nơi.
   - Hệ quả phụ: vì các task này giờ mới lộ ra, phải thêm 1 nhánh render riêng cho `t._fromContent` trong `renderIntCard()` — dạng **chỉ xem**, không có dropdown trạng thái / nút Sửa (do chưa có `_writeBackContentTask`, nếu để sửa được sẽ trông như lưu nhưng thực ra mất khi tải lại).

**Đã verify bằng dữ liệu thật (không chỉ đọc code):**
- Gọi thẳng Supabase REST API xác nhận key có hậu tố mới là nơi dữ liệu sống thật (nhiều hơn key cũ)
- Đếm trực tiếp: trước fix, admin chỉ hiện 6/30 task content của Kim Oanh và **0** vì `contentTasks` không được render — tổng thiếu tới 41/47 việc (~87%) so với tracker
- Sau fix: mở song song 2 file thật (qua local static server), gọi hàm load + render trực tiếp trong console — **admin và tracker cho đúng cùng 1 con số: 47/47**

**Nhân tiện phát hiện thêm (đã fix trong cùng lượt):**
- Có board thứ 2 "Khánh Huyền" (`khanh-huyen`) đã hoạt động thật (dữ liệu ngày 18/07/2026) nhưng chưa được khai báo trong `CONTENT_SOURCES` — đã thêm vào cả admin.html và tracker.html
- `_writeBackContentOrder()` trước đây luôn ghi cứng về board của Kim Oanh dù order thuộc board nào — sửa thành nhận tham số `ws`, lấy từ field `_ws` gắn theo mỗi order/task lúc load, và **không ghi nếu thiếu `ws`** (tránh đoán bừa, ghi nhầm board)
- Domain nhúng/link "Mở Lịch Content" trong tracker.html trỏ tới `content-kim-oanh.netlify.app` — bản lỗi thời, không có dropdown nhiều board. Domain thật đang chạy là `content-kim-oanh.pages.dev`. Đã sửa link + thêm hash `#ws=khanh-huyen` để mở đúng board Khánh Huyền.
- Danh sách kênh của board `kim-oanh` bị thiếu "Fanpage Học viện CGCC Midu" (rớt mất khi Content migrate sang board, dù 6 task thật vẫn đang dùng kênh này) — `_loadContentChannels()` giờ gộp cả key kênh cũ lẫn kênh từng board để không mất tên hiển thị.
- admin.html chưa từng có `_contentChannelMap` → badge kênh trên card Lịch Content hiện ID thô (`mren2mu1kbzeyi`...) thay vì tên. Đã thêm `_loadContentChannels()` vào admin.html (giống hệt tracker.html), và bắt buộc `await` xong trước khi gọi `_loadContentTasks()` (xem cảnh báo race condition ở mục 9.1).
- `adminNote` của card Lịch Content trong admin.html trước đó dump nguyên văn toàn bộ `ct.content` (có thể dài cả đoạn văn) — không đúng ý định ban đầu (tracker.html chỉ hiện 1 dòng gọn). Đã rút về đúng format tracker.html: `Lịch Content · <tên người> · Kênh: <tên kênh> · <trạng thái>`.

**Không đụng vào file Content** trong toàn bộ quá trình fix — theo đúng yêu cầu, chỉ sửa admin.html/tracker.html để đọc đúng những gì Content đang thực sự ghi.

---

### Task #60 — Filter "Loại công việc" xoá sạch Lịch Content khỏi admin.html

**Triệu chứng:** ngay sau khi Task #58 tưởng đã xong (47/47 khớp tracker khi không lọc gì), anh Tuấn Anh báo lại "vẫn thiếu". Hoá ra Task #58 chỉ verify ở trạng thái **không lọc** — chưa test khi có filter đang bật, và đó chính là chỗ vỡ.

**Nguyên nhân:** `render()` trong admin.html, đoạn lọc theo loại công việc:
```javascript
// admin.html (SAI — trước fix)
if(filters.type) {
  const gasType = _LC_TO_GAS[t._rawType||''] || t._rawType || '';
  if(gasType !== filters.type) return false;
}
```
`_rawType` **chỉ tồn tại trên Content Orders** (`_fromContentOrder`), Content Tasks (`_fromContent`, tức lịch bài đăng) **không có field này** → `gasType` luôn ra chuỗi rỗng `''` → không khớp bất kỳ `filters.type` nào đang bật → **mọi task Lịch Content biến mất ngay khi user bấm bất kỳ chip "Loại công việc" nào**, kể cả chip "🏠 Nội bộ MKT" đúng ra phải khớp. tracker.html không dính lỗi này vì đã có sẵn nhánh riêng cho `_fromContent`.

**Fix:**
```javascript
// admin.html (ĐÚNG — sau fix, giống hệt tracker.html)
if(filters.type) {
  const gasType = t._fromContent ? t.type : (_LC_TO_GAS[t._rawType||''] || t._rawType || '');
  if(gasType !== filters.type) return false;
}
```
(Content Tasks trong admin.html có `type:'content'`, khớp đúng chip có sẵn "✍️ Content" — không cần chip riêng, xem điều chỉnh ngay dưới.)

**Đã verify bằng dữ liệu thật:** mô phỏng công thức cũ vs mới ngay trên dữ liệu Supabase live — công thức cũ cho **0/30** task hiện ra khi filter type bật, công thức mới cho **30/30**. Test thêm bằng cách gọi `render()` thật với `filters.type='internal'` trên trang thật → đúng 30 card Lịch Content xuất hiện.

**Lớp lỗi thứ 2, phát hiện ngay sau khi sửa lớp 1 — mới là nguyên nhân thực sự khiến bug KHÔNG BIẾN MẤT sau lần fix đầu:** sửa xong công thức ở trên vẫn chưa đủ, vì `TYPE_MAP` (nguồn tạo ra các chip lọc "Loại công việc" trên UI, qua `buildTypeChips()`) **hoàn toàn không có mục `'internal'`**:
```javascript
// admin.html dòng ~1020 (SAI — trước fix)
const TYPE_MAP = {'thiet-ke':...,'video-ai':...,'media':...,'chay-ads':...,'content':...,'lich-truyen-thong':...,'khac':...};
// thiếu 'internal' — mâu thuẫn với Task #50 trong lịch sử (đã ghi là thêm nhưng thực tế không có trong code)
```
Hệ quả: dù công thức lọc đã đúng (`t.type` cho content task = `'internal'`), **không hề có chip nào trên UI mang giá trị `'internal'`** để khớp — nghĩa là **bấm bất kỳ chip loại công việc nào (không riêng gì 1 loại) cũng xoá sạch toàn bộ Lịch Content**, vì content task không bao giờ khớp được filter đang chọn.
- Fix ban đầu: thêm `'internal':'🏠 Nội bộ MKT'` vào `TYPE_MAP` → chip mới xuất hiện, bấm vào hiện đúng 30/30 content task.
- **Điều chỉnh ngay sau đó theo yêu cầu thực tế (20/07/2026):** không cần chip riêng "Nội bộ MKT" — Content Orders (`_fromContentOrder`) đã có hạng mục riêng qua `_rawType`/`_LC_TO_GAS` rồi (Thiết kế, Video AI...); còn Content Tasks (lịch bài đăng của Kim Oanh/Khánh Huyền — 2 bạn content) thì xếp chung vào hạng mục **"✍️ Content"** có sẵn, không tạo chip mới. Đã bỏ `'internal'` khỏi `TYPE_MAP`, đổi `type:'internal'` → `type:'content'` trong `_loadContentTasks()` (admin.html) — khớp đúng với tracker.html vốn đã dùng `type:'content'` cho content task từ đầu.
- **Sót 1 chỗ:** tracker.html có `TYPE_MAP` **riêng, khai báo độc lập** với admin.html (không dùng chung biến) — bản của tracker.html vốn *đã* có sẵn `'internal':'🏠 Nội bộ MKT'` từ trước (không phải do lần sửa này thêm vào), dùng để lọc các task nội bộ tạo thủ công (không phải content). Khi bỏ chip ở admin.html, quên mất tracker.html vẫn còn hiện y hệt chip đó — người dùng phản ánh lại mới phát hiện. Đã bỏ luôn `'internal'` khỏi `TYPE_MAP` của tracker.html cho khớp 2 file. **Lưu ý cho lần sau: `TYPE_MAP` không phải biến dùng chung giữa 2 file — sửa 1 bên thì phải chủ động kiểm tra bên còn lại, đừng mặc định đã đồng bộ.**
- Đã verify: mô phỏng `render()` thật với từng chip trong `TYPE_MAP` (7 chip, không có `internal`) — 6 chip GAS gốc còn lại đều đúng 0 content task, riêng chip "✍️ Content" cho đúng 30/30.

**Fix kèm theo (cùng nguyên nhân gốc — filter tách rời logic giữa 2 file):**
- Ô tìm kiếm từ khóa (`kw`) trong admin.html thiếu các field `projectName, requester, d_channel, _channel` so với tracker.html — bổ sung cho khớp, tránh tìm ở tracker ra kết quả mà tìm ở admin không ra (dù dữ liệu vẫn còn, chỉ là search "trượt").

---

### ⚠️ Checklist bắt buộc mỗi khi sửa code liên quan Lịch Content (đọc trước khi commit)

Vì lỗi "admin thiếu việc" đã tái diễn ít nhất 2 lần (Task #58, #60) với 2 nguyên nhân hoàn toàn khác nhau, mọi thay đổi động tới `contentTasks`/`contentOrders` trong admin.html hoặc tracker.html **phải** chạy đủ 5 bước sau trước khi coi là xong:

1. **So tổng không lọc.** Mở song song 2 file (`node` static server cục bộ là đủ, xem cách làm ở Task #58), gọi `_loadContentChannels()` → `_loadContentTasks()` + `_loadContentOrders()` trên cả 2, so `contentTasks.length` và `contentOrders.length` — phải **bằng nhau tuyệt đối**.
2. **Bật TỪNG filter loại công việc một, không bỏ sót chip nào đang thật sự hiện trên UI** (gọi `buildTypeChips()` rồi đọc `document.querySelectorAll('#type-chips button')` để chắc chắn không bỏ sót chip nào — đừng chỉ suy từ `TYPE_MAP` trong đầu, vì `TYPE_MAP` từng thiếu hẳn giá trị khớp với content task mà không ai để ý cho tới khi test thật). Sau mỗi lần bật 1 chip, đếm số thẻ "📅 Lịch Content" còn hiện — phải về 0 ở 6 chip còn lại (Thiết kế, Video AI, Media, Ads, Lịch T.Thông, Khác — đúng, vì content task không phải loại đó) và **> 0 (đủ số lượng) ở đúng 1 chip "✍️ Content"**. Nếu **mọi chip đều cho ra 0** thì chắc chắn đang có bug như Task #60. Content Task **không có chip riêng** — cố tình xếp chung với order loại Content, không tạo thêm hạng mục mới.
3. **Gõ thử từ khóa tìm kiếm** trùng với tên kênh hoặc idea của 1 bài đã biết trước — phải ra kết quả ở **cả 2 trang**, không chỉ 1 trang. Gõ thêm **cùng từ khóa đó nhưng bỏ hết dấu tiếng Việt** (vd "khanh huyen" thay vì "Khánh Huyền") — phải ra **cùng số kết quả** như khi gõ đủ dấu (xem Task #62, `normVN()`).
4. **Bật filter phòng ban** với từng giá trị trong danh sách phòng ban đang cấu hình (mục 7.7) — xác nhận không có phòng ban nào vô tình khớp/không khớp department của content items khác ý muốn (admin.html dùng `'Nội bộ MKT'`, tracker.html dùng `'Marketing – Truyền thông'` — **2 chuỗi khác nhau**, xem ⚠️ dưới).
5. **Thêm field mới vào object task/order thì rà lại toàn bộ chỗ có `t._fromContent` hoặc `t._fromContentOrder`** ở cả 2 file (`render()`, `updateStats()`, `renderReport()`, `renderIntCard()`, hàm tương đương bên tracker) — thiếu 1 chỗ là lặp lại y hệt Task #58/#60.
6. **`admin.html` và `tracker.html` là 2 file độc lập hoàn toàn — không có biến/hằng số nào dùng chung.** `TYPE_MAP`, `_SB_KEY`, `CONTENT_APP_URL`... đều bị khai báo trùng lặp ở cả 2 nơi. Sửa 1 hằng số/UI element (thêm/bớt chip, đổi label...) ở file này **không tự động áp dụng** sang file kia — phải chủ động grep tên biến đó ở cả 2 file rồi sửa cả 2 (đã quên tracker.html khi bỏ chip "Nội bộ MKT" lúc làm Task #60, phải sửa lại lần 2).

> ⚠️ **Nợ kỹ thuật chưa xử lý:** `department` của content items KHÔNG khớp giữa 2 file — admin.html gán `'Nội bộ MKT'`, tracker.html gán `'Marketing – Truyền thông'` (task) / `'Truyền thông Marketing'` (order, thứ tự từ còn khác cả trong tracker). Hiện chưa gây mất việc vì 2 chuỗi này không nằm trong danh sách phòng ban cấu hình nên chip lọc phòng ban không bao giờ chọn trúng — nhưng nếu sau này có ai thêm "Nội bộ MKT" hoặc "Marketing – Truyền thông" vào danh sách phòng ban, hành vi lọc giữa 2 trang sẽ lệch nhau. Nên chuẩn hoá về 1 chuỗi duy nhất khi có dịp sửa lại khu vực này.

---

### Task #61 — Nút "📋 Sao chép" không copy được link / đường dẫn ổ cứng

**Triệu chứng:** cả admin.html lẫn tracker.html, nút sao chép link/đường dẫn kết quả không hoạt động.

**2 nguyên nhân độc lập trong cùng hàm `copyLink()`:**

1. **Không có fallback khi `navigator.clipboard.writeText()` thất bại.** Hàm chỉ gọi `.then(...)`, không có `.catch(...)`. API này chỉ hoạt động trong "secure context" (HTTPS/localhost) và cần document đang có focus — bất kỳ điều kiện nào không thỏa (mở qua `file://`, mất focus, trình duyệt chặn quyền...) sẽ khiến promise reject/throw và **không có gì xảy ra, không báo lỗi** — nhìn như nút bị liệt.
2. **Link/đường dẫn bị nhúng thẳng vào chuỗi `onclick="copyLink('...')"` chỉ escape dấu `'`, không escape `\` hay `"`.** Đường dẫn ổ cứng Windows luôn có `\` — ví dụ `...\file.docx` khi nằm trong chuỗi JS sẽ bị hiểu thành escape sequence (`\f` = form-feed, `\t` = tab...) làm hỏng nội dung; nếu chuỗi có thêm dấu `"` thì phá luôn cả attribute HTML, khiến nút không bấm được gì.

**Fix (cả 2 file, đồng bộ):**
- Đổi nút sang đọc giá trị từ `data-copy="${escapeHtml(url)}"` thay vì nhúng thẳng vào `onclick(...)` — escape qua HTML entity (`escapeHtml()` mới thêm) miễn nhiễm với `\`, `'`, `"` vì đây là ngữ cảnh HTML attribute chứ không phải JS string literal.
- `copyLink(btn)` đổi chữ ký, đọc `btn.dataset.copy`, thử `navigator.clipboard.writeText()` trước (nếu `window.isSecureContext` true), `.catch()` rơi xuống fallback: tạo `<textarea>` ẩn + `document.execCommand('copy')`, nếu vẫn fail thì `window.prompt('Copy:', url)` để người dùng tự copy tay — đúng pattern đã dùng ổn định trong file Content (`copyTaskLink()`).

**Đã verify:**
- Round-trip giá trị qua `data-copy` với path/URL "ác ý" (chứa cả `\`, `'`, `"`, `&`, `=`, `?`) — khớp 100% ký tự với bản gốc, ở cả 2 file
- Ép `navigator.clipboard`/`isSecureContext` fail có chủ đích — hàm không còn ném lỗi ra ngoài (trước đây 1 phiên bản trung gian vẫn có thể throw nếu cả `execCommand` lẫn `prompt` đều fail, đã bọc try/catch chặt hơn)

---

### Task #62 — Tìm kiếm theo "Người yêu cầu" không ra kết quả

**Yêu cầu:** "Cho anh tìm kiếm theo người yêu cầu nữa nhé".

**Kiểm tra trước khi sửa:** cả 2 file đã đưa `t.requester`/`o.requester` vào chuỗi tìm kiếm từ trước (không phải thiếu hoàn toàn) — nhưng test trực tiếp phát hiện **2 lỗ hổng khiến nó không hoạt động với đúng những cái tên hay gặp nhất**:

1. **Tìm kiếm phân biệt dấu tiếng Việt.** Gõ `"Khánh Huyền"` (đủ dấu) ra đúng 1 kết quả, nhưng gõ `"khanh huyen"` (kiểu gõ nhanh, không dấu — thói quen phổ biến) ra **0 kết quả**. Test với `"Kim Oanh"` lại đúng dù không gõ dấu — vì tên đó vốn không có dấu, khiến lỗi bị che giấu, chỉ lộ ra với tên có dấu như "Khánh Huyền".
   - Fix: thêm hàm `normVN(s)` (lowercase + bỏ dấu qua `normalize('NFD')`, đổi `đ`→`d`) — cùng kỹ thuật normalize đang dùng trong `makeWorkspaceId()` của file Content. Áp dụng cho cả `kw` (từ khóa gõ vào) lẫn chuỗi văn bản đem so sánh, ở **tất cả** các bộ lọc từ khóa trong cả 2 file (đơn hàng GAS lẫn nội bộ/Content).
2. **Content Order không có field `requester` ở cấp ngoài object** — tên người yêu cầu chỉ nằm trong `_rawOrder.requester` (dữ liệu thô để hiện modal chi tiết), không lọt vào chuỗi tìm kiếm `t.requester||''` dù công thức đã có sẵn tên field đó. admin.html "tình cờ" tìm được vì `adminNote` có dòng "Người yêu cầu: ..." nhúng sẵn; **tracker.html thì `adminNote` để trống với Content Order nên hoàn toàn không tìm được**. Content Task (lịch bài đăng) bên admin.html cũng thiếu field này tương tự.
   - Fix: thêm thẳng `requester:o.requester||src.name` vào Content Order, `requester:src.name` vào Content Task — ở cả 2 file, không phụ thuộc vào việc "tình cờ" xuất hiện trong `adminNote` nữa.

**Đã verify bằng dữ liệu thật, cả 2 file cho kết quả giống hệt nhau:**
```
"Khánh Huyền" → 1   "khanh huyen" → 1   "KHANH HUYEN" → 1   "Kim Oanh" → 46   "kim oanh" → 46
```

---

### Task #63 — 1 board lỗi thoáng qua làm sập toàn bộ Lịch Content

**Triệu chứng báo lên (sau khi Task #58-#62 đã lên GitHub Pages thật):** admin vẫn thỉnh thoảng thiếu việc, kiểu "lúc có lúc không" — khác hẳn kiểu lỗi cố định của các Task trước.

**Cách phát hiện:** đọc trực tiếp stat "Tổng" trên trang thật lúc anh báo lỗi = đúng bằng số Content Order tải được, **0 Content Task** — tức Content Task bị mất sạch trong khi Content Order vẫn còn nguyên.

**Nguyên nhân:** `_loadContentTasks()` và `_loadContentOrders()` (admin.html) + `loadContentOrders()` (tracker.html) dùng `Promise.all()` để tải song song nhiều board, nhưng **không có try/catch riêng cho từng board** — chỉ có 1 try/catch bọc ngoài (hoặc không có gì). Do Kim Oanh/Khánh Huyền đang **thao tác thật, liên tục** trên trang Content, thỉnh thoảng 1 request tới đúng lúc dữ liệu đang ghi dở/mạng chập chờn sẽ ném lỗi (fetch fail hoặc `JSON.parse` fail vì dữ liệu tạm thời không hợp lệ). Khi đó `Promise.all` **reject toàn bộ**, kéo theo mất luôn dữ liệu của board KHÔNG hề lỗi (vd Kim Oanh) chứ không chỉ board đang gặp sự cố (vd Khánh Huyền). `tracker.html`'s `loadContentTasks()` đã có sẵn try/catch riêng cho từng board từ trước — chỉ 3/4 hàm còn lại bị thiếu.

**Fix:** thêm `try{...}catch(e){ console.warn(...); return []; }` **bên trong** callback `.map()` của từng nguồn (không phải bọc ngoài `Promise.all`) ở cả 3 chỗ còn thiếu — 1 board lỗi giờ chỉ trả về mảng rỗng cho riêng board đó, các board khác không bị ảnh hưởng.

**Đã verify bằng cách giả lập lỗi thật:** ép `fetch` ném lỗi có chủ đích riêng cho board `khanh-huyen`, gọi lại `_loadContentTasks()+_loadContentOrders()` → kết quả: Kim Oanh vẫn đủ 36/36 task, chỉ thiếu đúng phần Khánh Huyền (18/19 order, đúng bằng số lượng giả lập lỗi) — không còn hiện tượng "sập cả 2 board vì 1 board lỗi" nữa.

**Bài học chung:** khi có nhiều nguồn dữ liệu độc lập tải song song qua `Promise.all`, **luôn đặt try/catch bên trong từng phần tử của `.map()`**, không đặt 1 try/catch chung bọc ngoài cả `Promise.all` — nếu không, 1 nguồn lỗi sẽ kéo sập toàn bộ các nguồn khác dù chúng hoàn toàn ổn.

---

### Task #64 — Xoá bên Content phải tự phản ánh sang trang phòng

**Yêu cầu:** "khi phía trang content xóa công việc thì bên trang của phòng cũng bị xóa nhé".

**Trước khi sửa:** dữ liệu Content luôn được lấy mới từ Supabase mỗi lần `_loadContentTasks()`/`_loadContentOrders()` chạy — nên xoá bên Content **vốn đã** tự mất bên phòng, nhưng chỉ khi có 1 lần tải lại mới (F5, hoặc bấm nút "↻ Tải lại"/"↻ Lịch Content"). Không có ai chủ động tải lại thì màn hình vẫn hiện dữ liệu cũ (đã xoá) tới khi nào tải lại.
- **tracker.html:** vốn đã có sẵn cơ chế tự tải lại toàn bộ (kể cả Content) mỗi **120 giây** (`resetRefreshTimer()`), nên vấn đề này gần như không tồn tại ở đây.
- **admin.html:** chỉ tự đồng bộ **một lần duy nhất**, 5 giây sau khi mở trang (`setTimeout(_autoSyncContent, 5000)`) — sau đó đứng yên, phải bấm tay.

**Fix (admin.html):** thêm `_periodicContentSync()` — bản không tiếng động của `_autoSyncContent()` (không khoá nút, không hiện toast), chạy lặp lại mỗi **90 giây** qua `setInterval`. Mỗi lần chạy: tải lại channels + tasks + orders từ Supabase, `updateStats()` luôn, còn `render()` (vẽ lại danh sách) thì **bỏ qua nếu đang có ô nhập liệu nào đang được focus** (`_hasActiveInput()`) — tránh render() đè mất nội dung người dùng đang gõ dở (vd đang gõ tên vào ô Phân công trên card Content Order nhưng chưa bấm Lưu).

**Fix kèm theo (tracker.html):** tuy đã có auto-reload 120s sẵn, nhưng chưa có lớp bảo vệ này — thêm `_hasActiveInput()` y hệt, áp vào bước render cuối của `loadOrders()`, để tránh cùng rủi ro mất nội dung đang gõ khi tự làm mới trúng lúc đang sửa.

**Đã verify bằng dữ liệu thật:**
- Giả lập Content xoá 1 task (chặn fetch, lọc bỏ item đó khỏi response) → gọi `_periodicContentSync()` → số task giảm đúng 1, item bị xoá xác nhận biến mất khỏi `contentTasks`
- Focus vào ô tìm kiếm rồi gọi `_periodicContentSync()` → xác nhận DOM danh sách **không đổi** (bỏ qua render), dữ liệu nền vẫn cập nhật ngầm để lần render kế tiếp là đúng

**Kết quả:** xoá/sửa/thêm bên Content giờ tự phản ánh sang admin.html trong tối đa ~90 giây, tracker.html trong tối đa ~120 giây — không cần ai bấm tay, và không có rủi ro mất thao tác đang làm dở.

---

### Task #65 — Thêm trạng thái "🚫 Hủy"

**Bối cảnh phát hiện:** trang Content vốn đã có sẵn trạng thái task **"Huỷ"** (`DEFAULT_STATUS` trong file Content, `done:true`) từ trước — nhưng `_CONTENT_STATUS_MAP` bên admin.html/tracker.html map `'Huỷ':'hoan-thanh'`, gộp chung "đã hủy" với "đã hoàn thành". Kết quả: bài bị hủy vẫn cộng vào số liệu "Hoàn thành" trên stat card, sai lệch báo cáo. Content Order chưa có khái niệm "Huỷ" (chỉ Chưa làm/Đang làm/Chờ feedback/Hoàn thành).

**Fix:**
- Thêm status `'huy'` (🚫 Hủy, màu xám) vào `DEFAULT_STATUSES` (admin.html, có migration tự bổ sung cho user đã có config cũ trong localStorage — không ghi đè trạng thái tùy chỉnh họ đã thêm) và `STATUS_MAP` (tracker.html, hằng số cố định).
- Đổi `_CONTENT_STATUS_MAP['Huỷ']` (và biến thể chính tả `'Hủy'`) → `'huy'` thay vì `'hoan-thanh'`.
- `updateStats()`/tính "Trễ deadline": loại `status==='huy'` khỏi tập "đang active" — việc đã hủy không tính trễ hạn.
- tracker.html: nhóm hiển thị theo trạng thái (render() 5 nhóm) gộp `huy` chung với `hoan-thanh` vào nhóm "✅ Hoàn thành" — nếu chỉ loại trừ khỏi nhóm "🔴 Cần xử lý" mà không xếp vào đâu, item sẽ **biến mất khỏi mọi nhóm**.

**Đã verify:** giả lập user có config cũ (không có `huy`) + có 1 status tùy chỉnh riêng → sau migration có đủ `huy`, không mất status tùy chỉnh; `STATUS_MAP['huy']`/`_CONTENT_STATUS_MAP['Huỷ']` đúng ở cả 2 file.

---

### Task #66 — Content Task sửa được trạng thái, ghi ngược về Content

**Yêu cầu:** "công việc của các bạn content trong admin cũng chỉ xem được thôi à" → xác nhận muốn sửa được, ghi ngược về Content giống Content Order.

**Fix:** thêm `_writeBackContentTask(taskId, status, ws)` (song song với `_writeBackContentOrder()` đã có) + `_saveLcTaskStatus()` (đọc lựa chọn dropdown, cập nhật state cục bộ, gọi ghi ngược) ở cả 2 file. Card Content Task giờ có dropdown trạng thái ngay trên card, đổi là ghi liền (không cần nút Lưu riêng).

**Chỉ map được 4/6 trạng thái của Content** — dropdown giới hạn còn `chua-lam`/`dang-xu-ly`/`hoan-thanh`/`huy` (map ngược `_LC_TASK_STATUS_REVERSE`: → 'Lên kế hoạch'/'Đang soạn'/'Đã đăng'/'Huỷ'). Bỏ qua `feedback` — khái niệm đó thuộc luồng Content Order (yêu cầu ngược lại phòng), không có ý nghĩa với lịch bài đăng của chính Content.

**⚠️ Sự cố xảy ra lúc verify (20-22/07/2026) — bài học quan trọng cho lần sau:** lúc test `_writeBackContentTask()`, mock `fetch` lọc theo `url.includes('content-plan-tasks-v2')` — nhưng **endpoint ghi (POST) dùng chung 1 URL `/rest/v1/plan_data` cho mọi bảng, định danh board nằm trong BODY chứ không phải URL**. Mock lọc sai khiến request POST thật lọt qua, **ghi đè "Huỷ" lên task `seed-1` thật của Kim Oanh**. Phát hiện và khôi phục lại đúng trạng thái gốc ("Đã đăng") ngay trong vài phút, xác nhận lại bằng cách đọc lại dữ liệu.
- **Quy tắc bắt buộc từ nay:** khi test bất kỳ hàm nào có gọi `fetch(...,{method:'POST'...})` tới Supabase, **PHẢI chặn toàn bộ `window.fetch` vô điều kiện** (không lọc theo URL) trong lúc test, trả về dữ liệu giả lập cho cả GET lẫn POST — không được tin tưởng lọc theo chuỗi URL vì endpoint ghi thường dùng chung 1 URL cho nhiều bảng khác nhau.

---

### Task #67 — Tracker.html chỉ xem, dọn hàm ghi Supabase mồ côi

**Bối cảnh:** rà lại thấy `tracker.html` (trang public, không đăng nhập) vẫn có 2 hàm `saveLcResult()`/`saveLcStatus()` ghi thẳng Supabase cho Content Order — không có nút/onclick nào gọi tới (dead code) nhưng vẫn gọi tay được qua console vì hàm ở global scope. Cũng phát hiện dropdown đổi trạng thái Content Task (Task #66) đang lộ trên tracker, trong khi chỉ nên sửa được ở admin.html.

**Fix:** xoá hẳn `saveLcResult`, `saveLcStatus`, `_writeBackContentOrder`, và bỏ dropdown + `_writeBackContentTask`/`_saveLcTaskStatus`/`_LC_TASK_STATUS_REVERSE` khỏi tracker.html — card Content Task giờ chỉ hiện badge trạng thái tĩnh + nút "Mở bài này". Toàn bộ khả năng ghi dữ liệu Content giờ chỉ còn ở admin.html (có đăng nhập).

---

### Task #68 — Tối ưu tốc độ tải Lịch Content + fix race + fix thiếu cache

**3 vấn đề độc lập, sửa cùng lượt:**

1. **`_loadContentChannels()` fetch tuần tự.** Cả admin.html lẫn tracker.html đọc 3 key kênh (1 cũ + 2 board) bằng vòng lặp `for...of` có `await` bên trong → 3 round-trip nối tiếp thay vì song song. Fix: `Promise.all`, áp kết quả theo đúng thứ tự mảng để giữ nguyên ưu tiên ghi đè khi trùng id kênh.
2. **Thiếu timeout.** Mọi fetch Content (channels/tasks/orders) không có `AbortSignal.timeout` — 1 board phản hồi chậm có thể treo cả quá trình tải/tải lại vô thời hạn. Thêm timeout 8s cho tất cả, đồng bộ với GAS fetch đã có sẵn.
3. **Race condition ở tracker.html:** `loadOrders()` gộp chung `_loadContentChannels()` + `loadContentTasks()` + `loadContentOrders()` vào 1 `Promise.all` — vi phạm đúng yêu cầu đã ghi ở mục 9.1 ("phải load xong channels trước tasks"), khiến card thỉnh thoảng hiện ID kênh thô thay vì tên. Tách lại: đợi channels xong rồi mới `Promise.all` tasks+orders.
4. **admin.html thiếu cache `contentTasks`.** Khác với tracker.html, admin.html chưa từng lưu/đọc cache cho `contentTasks` (không có `KEY_CT_CACHE`). Hệ quả: mỗi lần F5, `showCached()` render ngay bằng cache của `allOrders`+`contentOrders` nhưng `contentTasks` luôn rỗng cho tới khi Supabase tải xong (~vài giây) → card "📅 Lịch Content" biến mất tạm thời rồi hiện lại đủ. Đã thêm `KEY_CT_CACHE='midu_ct_cache'` (trùng key với tracker.html vì cùng origin, dùng chung localStorage), ghi trong `_loadContentTasks()`, đọc trong `showCached()`.

---

### Task #69 — Đổi domain Lịch Content

Domain deploy thật của trang Content đổi từ `content-kim-oanh.pages.dev` sang `content-marketing.pages.dev`. Cập nhật hằng số `CONTENT_APP_URL` ở cả admin.html và tracker.html, và toàn bộ tham chiếu domain cũ trong tài liệu này (trừ các dòng lịch sử ở Task #58 mang tính ghi chép thời điểm, giữ nguyên không sửa).

---

### Task #70 — Fix hàng loạt lỗi số liệu tab Báo cáo + thiết kế lại giao diện

**Yêu cầu gốc (thiết kế lại):** "Làm tiếp nhé" (đồng ý sau khi xem mockup) → sau khi thiết kế lại xong, người dùng test trên dữ liệu thật và phản hồi nguyên văn:
> "Đã có rồi nhưng không có nội bộ nhé, nội bộ chính là phòng marketing truyền thông rồi, báo cáo theo hạng mục công việc như content, thiết kế, chạy ads… Biểu đồ theo thời gian order chưa chạy, thêm báo cáo theo người được phân công, À 1 order có thể phân công 2 người phụ trách chứ"

4 yêu cầu trong 1 câu ứng với đúng 4 mục fix bên dưới (mục 5 gồm cả yêu cầu thêm báo cáo mới lẫn lưu ý 1 order có nhiều người phụ trách).

**Thiết kế lại (admin.html):**
- 4 ô KPI (Tổng/Hoàn thành/Đang xử lý/Trễ deadline) đổi sang dạng tile có icon + viền màu trái theo ý nghĩa (dùng bảng màu status cố định: tốt = xanh lá, cảnh báo/trễ = đỏ).
- Thêm nút "📋 Xem dạng bảng" chuyển 3-4 biểu đồ phân tích sang bảng số liệu (đọc/copy số chính xác hơn biểu đồ khi nhiều nhóm).
- Bảng màu biểu đồ "Theo loại order" (`TYPE_COLORS` cũ: indigo/violet/hồng/cam/xanh lá/xám) test bằng công cụ kiểm mù màu (dataviz skill) thì FAIL — 2 màu tím-indigo cạnh nhau gần như không phân biệt được, xám đọc thành "không màu". Thay bằng bộ 8 màu `CAT_PALETTE` đã kiểm chứng, gán theo VỊ TRÍ trong `TYPE_MAP` (cố định, không theo thứ tự xuất hiện trong data đang lọc) qua hàm `getTypeColor()`.

**Fix lỗi số liệu phát hiện được:**
1. **Biểu đồ "Theo trạng thái" chỉ đếm 3/5 trạng thái** (`chua-lam`/`dang-xu-ly`/`hoan-thanh`) — thiếu hẳn `feedback` và `huy` dù đã tồn tại từ Task #65. Sửa `buildChartStatus()` dùng đúng `statusConfig` đầy đủ (gồm cả trạng thái tuỳ chỉnh admin tự thêm).
2. **Content Order bị gán cứng `type:'internal'`** thay vì hạng mục thật (thiết kế/content/ads...) — dồn hết vào 1 mục mơ hồ trên biểu đồ "Theo loại order". Sửa dùng `_LC_TO_GAS[o._rawType]` (map có sẵn) để xếp đúng nhóm, áp dụng ở cả `_loadContentOrders()` lẫn override object trong `_updateInternal()`.
3. **"Nội bộ MKT" bị tách thành 1 phòng ban ảo** trên biểu đồ "Theo phòng ban" — Content Order/Task/internal task mặc định gán `department:'Nội bộ MKT'` (chuỗi không khớp tên phòng thật). Đổi default thành `'Marketing – Truyền thông'` ở toàn bộ chỗ gán (6 chỗ trong admin.html, 1 chỗ trong tracker.html còn bị gõ sai thành "Truyền thông Marketing" — sửa luôn).
4. **Biểu đồ "Order theo thời gian" bỏ sót gần hết dữ liệu** — xem lại kỹ hơn ở Task #56: fix 3-tầng fallback (`submittedAt`→`createdAt`→`deadline`) đã tài liệu hoá trước đây KHÔNG còn trong code thật, chỉ còn `parseDate(o.submittedAt)` trơ trọi (Content order/task/internal task không có field này → toàn bộ bị loại). Áp lại đúng fallback 3 tầng.
5. **Thêm mới báo cáo "Theo người phụ trách"** (biểu đồ + bảng + drill-down) — tính năng này tài liệu cũ (Task #52) từng ghi đã có nhưng kiểm tra thực tế không tồn tại. Điểm quan trọng: **1 order có thể gán nhiều người** (`assignedTo` dạng "A, B") — hàm `_splitAssignees()` tách chuỗi và cộng order đó vào tổng của TỪNG người, không tính gộp 1 lần cho cả cụm tên.

**Sự cố xảy ra ngay sau khi deploy — bài học quan trọng:** bản đầu tiên lồng `<span id="r-done-pct">` vào bên trong `<div id="r-done">` để hiển thị % cạnh số. Code `document.getElementById('r-done').textContent=done` xoá sạch luôn thẻ con `r-done-pct`, khiến dòng gán tiếp theo `document.getElementById('r-done-pct').textContent=...` gọi vào phần tử vừa bị xoá (`null`) → ném lỗi, `renderReport()` dừng giữa chừng, toàn bộ phần sau (Đang xử lý/Trễ deadline/4 biểu đồ/bảng) đứng im ("Báo cáo trống rỗng"). **Quy tắc rút ra:** không đặt 1 id sẽ bị `.textContent=` ghi đè làm cha của bất kỳ id nào khác cần giữ lại — nếu cần hiển thị 2 giá trị cạnh nhau, dùng 2 phần tử NGANG HÀNG (sibling), không lồng nhau.

---

### Task #71 — Chuẩn hoá tên người phụ trách trong báo cáo

**Yêu cầu (nguyên văn):**
> "Phần báo cáo theo tên người được phân công cần tối ưu, không còn Huy AI, anh Huy thiết kế hay An thiết kế, trao đổi với anh về danh sách nhân sự để làm rõ"

**Vấn đề:** field `coord` bên Lịch Content (Task #70 mục 5) là ô nhập tự do, không ràng buộc theo danh sách tài khoản — nên cùng 1 người bị ghi nhiều kiểu khác nhau qua thời gian, ví dụ thực tế lấy từ Supabase board Kim Oanh: `"Huy AI"`, `"A Huy thiết kế"`, `"An thiết kế"` bên cạnh phần lớn (33/40) task bỏ trống coord.

**Xác nhận với người dùng (không đoán):**

| Biến thể gốc | → Tên chuẩn |
|---|---|
| Huy AI | Đặng Ngọc Huy |
| A Huy thiết kế / anh Huy thiết kế | Lê Ngọc Huy |
| An thiết kế | Bùi Thành An |
| (trống) / Khác | Giữ nguyên hành vi cũ — tính vào tên người tạo bài (VD: Kim Oanh) |

**Fix:** thêm bảng `_ASSIGNEE_ALIAS` (admin.html), áp dụng trong `_splitAssignees()` qua hàm `_normAssignee()` — chuẩn hoá không phân biệt hoa/thường. **Chỉ ảnh hưởng cách hiển thị trong báo cáo** (biểu đồ/bảng/drill-down "Theo người phụ trách"), không sửa dữ liệu gốc trên Supabase — an toàn, không cần đụng vào file Content.

---

### Task #72 — Fix lỗ hổng phân quyền: Internal Task không giới hạn theo người phụ trách

**Câu hỏi gốc:** "Với phần logic tạo tài khoản cho nhân viên vào cập nhật tiến độ vẫn ok chứ, logic việc đó thế nào, chỉ nhìn được công việc của mình phụ trách hay nhìn được tất cả"

**Rà lại code (`getFilteredRows()`) phát hiện:** phần lọc theo nhân viên (`baseOrders`, dựa trên `perm().viewAll`) chỉ áp dụng cho **đơn GAS**. Biến `intRows` (gộp `contentOrders` + `contentTasks` + `internalTasks`) không hề có bước lọc theo người — nghĩa là 1 tài khoản `employee` đăng nhập vẫn thấy **toàn bộ** Content Order, Content Task, và Internal Task của mọi người, trái với tài liệu ghi "Chỉ của mình".

**Xác nhận với người dùng, tách làm 2 trường hợp khác nhau:**
- **Content Order/Content Task (Lịch Content):** giữ nguyên KHÔNG giới hạn — nguyên văn: "ở lịch content thì thôi, các bạn content sẽ cập nhật ở trang của content", tức đây là bảng theo dõi chung của phòng, nhóm content tự làm việc ở trang riêng của họ nên không cần giấu việc của nhau trong admin.html.
- **Internal Task (việc tạo tay trong tab Tracker, nút "+ Thêm việc nội bộ"):** **cần giới hạn** cho khớp với đơn GAS — nguyên văn xác nhận: "Giới hạn theo người phụ trách (Recommended)".

**Fix:** thêm hàm dùng chung `_isAssignedToMe(assignedToStr)` (tách theo dấu phẩy, so khớp `currentUser.displayName`), áp dụng cho cả `baseOrders` (đơn GAS, không đổi hành vi) và `internalTasks` (mới thêm) trong `getFilteredRows()`. `contentOrders`/`contentTasks` giữ nguyên không lọc.

---

### Task #74 — Fix panel "Lịch bắn gần nhất" bỏ sót lịch sử

**Vấn đề:** `scheduleCheckerLoad()` (order.html, thêm ở Task #73) lọc `x.dt >= today` (chỉ tương lai) và loại hẳn entry có trạng thái "Đã bắn" — nên lịch vừa bắn hôm qua/hôm nay không hiện, trong khi mục đích chính là giúp người gửi thấy được lịch GẦN ĐÂY (cả đã bắn lẫn sắp bắn) để tự tránh trùng.

**Fix:** đổi ngưỡng lọc thành `dt >= today - 14 ngày` (gộp cả lịch sử gần lẫn sắp tới), bỏ điều kiện loại trừ theo trạng thái. Lịch đã qua hiển thị mờ đi (`opacity:.65`) kèm ✅ và nhãn "X ngày trước" để phân biệt trực quan với lịch sắp tới.

---

### Task #75 — Sao lưu tự động mọi loại việc vào sheet "Orders"

**Yêu cầu (nguyên văn):** "Tất cả các công việc cần được lưu về sheet này nữa nhé, có logic cho việc này chưa" — xác nhận phạm vi: cả Content Order lẫn Content Task lẫn Internal Task đều cần mirror.

**Hiện trạng trước khi sửa:** chỉ đơn gửi qua order.html mới lưu vào sheet "Orders". Content Order/Task sống hẳn trong Supabase, Internal Task chỉ nằm trong `localStorage` — không có bản sao lưu nào ở Google Sheet, nghĩa là dữ liệu Internal Task có thể mất hoàn toàn nếu xoá dữ liệu trình duyệt hoặc đổi máy.

**Fix (admin.html, không cần sửa GAS — dùng lại đúng action `addOrder`/`updateOrder` đã có sẵn):**
- `_mirrorOrderToSheet(order)` — ghi 1 dòng mới vào sheet Orders, đánh dấu đã ghi qua `KEY_MIRRORED_IDS` (localStorage) để không ghi trùng ở các lượt đồng bộ định kỳ sau. Bỏ qua nếu `order._fromLichTT` (loại đó có sheet riêng, xem Task #73).
- `_mirrorUpdateSheet(id, fields)` — chỉ update nếu id đã từng được `_mirrorOrderToSheet` ghi thành công (tránh update vào dòng không tồn tại).
- Gọi ở 5 điểm: `_loadContentOrders()`/`_loadContentTasks()` (mirror khi thấy lần đầu), `_newInternal()` (mirror ngay khi tạo), `_updateInternal()` cả 2 nhánh (content order override + internal task thường — mirror update), `_saveLcTaskStatus()` (mirror update khi đổi trạng thái Content Task).
- Cột "Ghi chú" (note) của dòng sao lưu ghi rõ nguồn gốc (VD: "Sao lưu tự động · nguồn: Content Order") để phân biệt với đơn gửi thật qua order.html khi xem trực tiếp trên Sheet.

> ⚠️ **QUY TẮC BẮT BUỘC (đọc trước khi đụng vào bất cứ đâu dùng `allOrders`/`getOrders`):** sheet "Orders" giờ chứa 2 loại dòng trộn lẫn — đơn thật gửi qua order.html, VÀ bản sao lưu (mirror) của Content Order/Task/Internal Task. Sheet chỉ dùng để **backup**, KHÔNG được hiển thị lại dòng mirror ở bất kỳ đâu (danh sách, báo cáo, CSV, sync Firebase...) vì dữ liệu gốc của chúng đã hiển thị sẵn từ Supabase/localStorage — hiển thị thêm lần nữa sẽ bị trùng (xem sự cố thật đã xảy ra ở Task #79). Mọi chỗ đọc `allOrders`/`getOrders` mới thêm sau này **phải lọc qua `_isMirrorRow(o)`** (kiểm tra `o.note` bắt đầu bằng "Sao lưu") trước khi dùng — đã áp dụng sẵn ngay tại 2 điểm gán `allOrders` trong admin.html và tracker.html, nhưng nếu viết thêm 1 nguồn đọc `getOrders` mới (VD: 1 trang HTML mới, 1 script backfill mới) thì phải tự nhớ áp lại, không có gì tự động ngăn quên.

---

### Task #76 — Phân quyền tuỳ chỉnh theo từng người dùng

**Yêu cầu (nguyên văn):** "Xử lý việc phân cấp phân quyền cho người dùng nữa nhé. Cho anh tùy chọn phân cấp và tùy chọn hạng mục công việc nhân viên, leader được xem. Nói chung là mở hết để anh tự cấu hình."

**Xác nhận phạm vi với người dùng:**
- Giới hạn hạng mục công việc cấu hình theo **từng người dùng riêng lẻ**, không theo vai trò chung.
- Giới hạn hạng mục là điều kiện **THÊM VÀO** quy tắc "employee chỉ xem việc của mình" (Task #72), không thay thế — 1 order phải thoả cả 2 điều kiện mới hiện ra.
- Cả 6 quyền còn lại (xem tất cả/xoá/cài đặt/Form Builder/quản lý user/báo cáo) cũng chuyển từ cố định theo 3 mức admin/leader/employee sang **tuỳ chỉnh được theo từng người**.

**Trước khi sửa:** `PERM_LEVELS` (3 mức cố định) là nguồn quyền duy nhất, gắn cứng theo `role` của user — không có cách nào cấu hình khác cho 1 cá nhân cụ thể, và hoàn toàn chưa có khái niệm giới hạn theo hạng mục (`type`) ở bất kỳ đâu.

**Fix:**
- **GAS (`MIDU_MKT_Script.gs`):** thêm cột 9-10 vào sheet "Users" — `permOverrides` (JSON: `{viewAll,canDelete,canSettings,canFormBuilder,canUserMgmt,canReport}`) và `allowedTypes` (chuỗi phân cách dấu phẩy, rỗng = không giới hạn). `loginUserData`/`getUsersData`/`createUserData`/`updateUserData` đọc/ghi 2 cột này.
- **admin.html:** `perm()` giờ = `{...getRolePerm(role), ...currentUser.permOverrides}` (override đè lên mặc định vai trò, chỉ đè đúng key có mặt). `getAllowedTypes()` trả về mảng hoặc `null` (không giới hạn). Áp dụng trong `getFilteredRows()` cho cả đơn GAS lẫn Content Order/Task/Internal Task (dùng chung biến `gasType` đã có sẵn để tính đúng hạng mục, kể cả Content Order được map qua `_LC_TO_GAS`).
- **Modal "Quản lý người dùng":** thêm 6 checkbox quyền + checklist hạng mục công việc (theo `TYPE_MAP`, tự động theo cả loại tuỳ chỉnh admin thêm qua Form Builder). Đổi vai trò trong form sẽ nạp lại quyền theo mặc định vai trò mới (không đụng hạng mục đã chọn, vì đó là lựa chọn độc lập).
- Nếu admin tự sửa quyền của chính tài khoản đang đăng nhập → áp dụng ngay lập tức, không cần đăng xuất/đăng nhập lại.

**Bài học phụ khi sửa:** phát hiện `internalTasks` (việc nội bộ tạo tay, không phải Content Order/Task) trước giờ luôn tính `gasType` ra chuỗi rỗng `''` thay vì đúng `type:'internal'` của nó (do thiếu `_rawType`) — khiến chip lọc "Loại công việc" không bao giờ khớp được với việc nội bộ. Thêm `t.type` làm fallback cuối trong công thức tính `gasType`, sửa luôn cả bug cũ này.

**⚠️ Cần deploy lại GAS** (thêm cột mới vào sheet Users) thì tính năng mới có hiệu lực — chưa deploy thì mọi thứ vẫn chạy như cũ (permOverrides/allowedTypes trả về rỗng, không ảnh hưởng gì).

---

### Task #77 — Fix lỗi ghi trùng dòng khi sao lưu vào sheet + backfill dữ liệu cũ

**Bối cảnh:** sau Task #75, người dùng nhiều lần kiểm tra thực tế và phản ánh sheet "Orders" vẫn thiếu việc — nguyên văn qua nhiều lượt: "Thấy rồi nhé, nhưng các đầu việc khác lại chưa được lưu vào đây", "File sheet quản lý công việc chưa có đầy đủ công việc như trong admin và tracker", và chốt lại dứt khoát: **"Làm gì cũng được, nhưng phải lưu được hết công việc vào sheet nhé"**.

**Nguyên nhân gốc — 2 lỗi độc lập:**
1. **Không có bước ghi bù cho dữ liệu đã tồn tại từ trước.** `_mirrorOrderToSheet()` (Task #75) chỉ được gọi tại đúng thời điểm 1 việc được tạo mới/tải lần đầu — mọi Content Order/Content Task/Internal Task đã có sẵn TRƯỚC khi Task #75 triển khai không bao giờ được ghi bù, vì không có đoạn code nào quét lại toàn bộ dữ liệu cũ.
2. **Ghi đồng thời vượt giới hạn thực thi song song của GAS.** 3 điểm gọi mirror (`_loadContentOrders`, `_loadContentTasks`, `_loadInternal`) dùng `.forEach(o=>_mirrorOrderToSheet(o))` — bắn hàng chục request `POST` không đợi nhau cùng lúc. Google Apps Script giới hạn số lượt thực thi đồng thời trên 1 project; vượt ngưỡng khiến một số request thất bại âm thầm (chỉ `console.warn`, không có cảnh báo nào tới người dùng) → giải thích đúng hiện tượng "thiếu ngẫu nhiên, không theo quy luật rõ ràng" mà người dùng quan sát được.

**Fix:**
- Thêm bước ghi bù toàn bộ (`internalTasks.forEach(...)` → gọi mirror) ngay trong `_loadInternal()`, chạy mỗi lần tải trang.
- Thêm hàm `_mirrorAllSequential(items)` — vòng lặp `for...of` + `await` tuần tự (không song song), thay thế toàn bộ 3 chỗ `.forEach` cũ ở `_loadContentOrders()`, `_loadContentTasks()`, `_loadInternal()`. Đánh đổi: chậm hơn vài giây khi có nhiều việc chưa mirror, nhưng không còn request nào bị GAS từ chối âm thầm.

**Xử lý dữ liệu cũ bị thiếu (một lần, không lặp lại):** vì cơ chế mirror chạy trong trình duyệt (client-side), không có cách nào server tự quét lại toàn bộ lịch sử — viết 1 script Node.js độc lập (`backfill_mirror.js`, chạy 1 lần ngoài repo, không phải file sản phẩm) lặp lại đúng logic map dữ liệu của admin.html, so sánh ID với sheet hiện có, rồi gọi `addOrder` tuần tự (giãn cách 250ms/lượt) cho từng dòng còn thiếu. Kết quả: ghi bù thành công 48 dòng.

**Sự cố phụ phát sinh khi backfill:** trong lúc script backfill đang chạy, có 1 tab trình duyệt khác đang mở admin.html BẢN CŨ (chưa có fix `_mirrorAllSequential`) — cả 2 tiến trình cùng lúc quyết định mirror 1 số item giống nhau, và vì `addOrderData()` (GAS) không có bước kiểm tra trùng ID (luôn `appendRow`), kết quả là 9 dòng bị ghi trùng 2 lần. Phát hiện qua script đếm trùng lặp theo ID, xử lý bằng cách gọi `deleteOrder` (action GAS có sẵn) đúng 1 lần cho mỗi ID trùng — hàm này xoá đúng 1 dòng đầu tiên khớp (`indexOf`), giữ lại đúng 1 bản. Xác nhận cuối: 60 dòng, 0 trùng lặp.

**Trả lời câu hỏi liên quan của người dùng (kết luận ban đầu SAI, đã đính chính ở Task #78):**
- ~~"Lưu vào sheet lại chưa có kết quả (Kết quả/linkResult) à?" — không phải lỗi mirror, do dữ liệu gốc không có link.~~ **Sai — xem Task #78: đây thực sự là 1 bug, đã sửa.**
- **"Order mới sắp tới có tự động lưu vào sheet không?"** — có, nhưng cơ chế là client-side: mỗi khi có người **mở admin.html** (tải trang hoặc mỗi 90 giây trong lúc đang mở), code sẽ tự quét và ghi bù bất kỳ việc nào chưa có trong sheet. Đây **không phải** tiến trình server chạy nền 24/7 — nếu không ai mở admin.html trong thời gian dài, việc mới bên Content sẽ đợi tới lần mở tiếp theo mới được ghi (không mất dữ liệu, chỉ trễ).

---

### Task #78 — Đính chính Task #77: field link kết quả của Content Task bị map sai, không phải do thiếu dữ liệu

**Bối cảnh:** người dùng hỏi lại "K lấy được kết quả à, ở admin cũng có kết quả các đầu việc của content?" sau khi Task #77 kết luận (sai) rằng cột "Kết quả" trống là do dữ liệu gốc không có link.

**Kiểm tra lại kỹ hơn phát hiện:** field link bài đăng thật sự bên Lịch Content tên là **`contentLink`** (kèm `contentLinkLabel`) — không phải `postUrl`/`result`/`link`/`deliverableLink` như đã đoán và code tại Task #75/#77. 9/38 Content Task có trạng thái "Đã đăng" thực sự có `contentLink` hợp lệ (dạng URL Google Docs/Sheets), nhưng bị bỏ sót hoàn toàn vì đoán sai tên field.

**Bug thứ 2, nặng hơn:** card "📅 Lịch Content" (Content Task, nhánh `if(t._fromContent)` trong `renderIntCard()`, admin.html) **chưa từng có phần hiển thị "Kết quả" nào cả** — chỉ có 1 ô đổi trạng thái, khác với card Content Order và card Lịch T.Thông (cả 2 đều có sẵn khối hiển thị link). Trong khi đó tracker.html đã có sẵn khối hiển thị "Kết quả" cho Content Task từ trước nhưng cũng bị vô hiệu hoá vì cùng lỗi tên field.

**Fix:**
- `admin.html` `_loadContentTasks()`: thêm `linkResult:ct.contentLink||''` vào object map (trước đây hoàn toàn không có field này).
- `admin.html` `renderIntCard()` nhánh `_fromContent`: thêm khối hiển thị "🔗 Kết quả" (link + nút sao chép/mở link) giống hệt kiểu đã dùng ở Content Order/Lịch T.Thông — trước đây thiếu hẳn.
- `tracker.html` `loadContentTasks()`: sửa `linkResult:ct.postUrl||ct.result||ct.link||ct.deliverableLink||''` → `linkResult:ct.contentLink||''` (khối hiển thị đã có sẵn, chỉ cần map đúng field).
- Chạy 1 script sửa bù (`fix_content_task_links.js`, ngoài repo) cho 9 dòng Content Task đã mirror vào sheet Orders trước đó với `linkResult` rỗng oan — gọi `updateOrder` cập nhật đúng link. Kết quả: từ 2/60 dòng có Kết quả lên 11/60.

**Bài học:** kết luận "không phải bug" ở Task #77 đưa ra chỉ dựa trên kiểm tra field cứng đã đoán sẵn (`postUrl`/`result`/`link`/`deliverableLink`), chưa quét toàn bộ tên field thực tế xuất hiện trong dữ liệu — lần sau cần liệt kê hết `Object.keys()` của dữ liệu nguồn trước khi kết luận "dữ liệu không có", tránh lặp lại kiểu sai này.

---

### Task #79 — Fix lỗi trùng lặp: mọi việc mirror vào sheet bị hiển thị lại 2 lần

**Phát hiện qua ảnh chụp màn hình người dùng gửi:** cùng 1 việc ("Fanpage Học viện PNVM — Đếm ngược 24h diễn ra khóa 3") xuất hiện thành 2 card riêng biệt trên admin.html: 1 card `lco-mruh8w4njtzjd4` (ghi chú "Sao lưu bù (backfill) · nguồn: Content Order") và 1 card `TK-260721-018` (card Content Order thật, đọc trực tiếp từ Supabase). Câu hỏi gốc: "Admin và tracker sao nhiều công việc thế, hình như bị double này".

**Nguyên nhân gốc — lỗi thiết kế ở Task #75, không phải lỗi mới phát sinh:** tính năng sao lưu (mirror) được thiết kế để CHỈ backup dữ liệu vào sheet "Orders" phòng khi mất dữ liệu — nhưng lại quên rằng chính sheet "Orders" đó cũng là nguồn dữ liệu chính (`allOrders`, qua `getOrders`) mà admin.html/tracker.html vẫn hiển thị thành card đơn bình thường, không có bước lọc loại trừ bản sao lưu ra khỏi danh sách hiển thị. Hệ quả: từ lúc Task #75 chạy, **mọi** Content Order/Content Task từng được mirror đều hiện 2 lần — 1 lần từ nguồn thật (Supabase), 1 lần từ bản sao lưu (sheet). Kiểm tra thực tế lúc phát hiện: **toàn bộ 61 dòng trong sheet "Orders" đều là dòng mirror** (20 Content Order + 41 Content Task, 0 đơn thật gửi qua order.html) — nghĩa là danh sách chính ở admin.html/tracker.html khi đó đang hiển thị trùng 100%.

**Fix:** thêm hàm dùng chung `_isMirrorRow(o)` (kiểm tra `o.note` bắt đầu bằng "Sao lưu" — đúng tiền tố đã gắn sẵn từ Task #75/#77 để phân biệt dòng backup) ở cả admin.html và tracker.html, lọc ngay tại 2 điểm gán `allOrders` (đọc cache localStorage và đọc trực tiếp từ `getOrders`) — lọc ở gốc để áp dụng đồng nhất cho mọi chỗ dùng `allOrders` (danh sách chính, báo cáo, xuất CSV, đồng bộ Firebase), không chỉ lọc riêng ở `getFilteredRows()`.

**Lưu ý:** sheet "Orders" vẫn giữ đầy đủ các dòng mirror — chỉ ẩn khỏi giao diện hiển thị, không xoá. Nếu sau này cần xem/audit dữ liệu sao lưu thô, vẫn mở trực tiếp Google Sheet để xem (cột "Ghi chú" phân biệt rõ nguồn gốc).

---

### Task #80 — Fix gốc rễ: 1 việc bị ghi thành nhiều dòng trong sheet (không chỉ hiện trùng, mà GHI trùng thật)

**Câu hỏi gốc:** "Mà file sheet quản lý công việc, 1 đầu việc bị lưu nhiều dòng lắm" — khác với Task #79 (hiện trùng ở giao diện nhưng sheet chỉ có 1 dòng thật), lần này kiểm tra trực tiếp sheet phát hiện **bản thân dữ liệu trong sheet đã bị ghi trùng thật**: từ 60 dòng (sau khi dọn ở Task #77/#79) tăng lên **196 dòng**, có ID bị lặp tới **6 lần**.

**Nguyên nhân gốc:** cơ chế chống ghi trùng của tính năng mirror (Task #75) chỉ dựa vào `KEY_MIRRORED_IDS` — một danh sách lưu trong `localStorage`, tức **chỉ máy/trình duyệt đang chạy nó biết được**. Khi có nhiều người (hoặc cùng 1 người dùng nhiều máy/trình duyệt khác nhau) cùng mở admin.html, mỗi trình duyệt đều có `localStorage` RIÊNG, ban đầu đều rỗng — mỗi trình duyệt đều "tưởng" chưa có ai mirror việc đó và tự ý ghi lại từ đầu. Vì GAS `addOrderData()` không có bước kiểm tra trùng ID phía server (luôn `appendRow`, đã biết từ Task #77), mỗi trình duyệt độc lập ghi 1 bản → N trình duyệt cùng mở = N bản ghi cho cùng 1 việc. Cơ chế này tự động lặp lại mỗi 90 giây (đồng bộ định kỳ) và mỗi lần tải trang, nên số dòng trùng tăng liên tục theo thời gian, không tự dừng.

**Fix (thay đổi kiến trúc, không chỉ vá tạm):**
- Thêm `_sheetOrderIds` — tập hợp ID lấy trực tiếp từ `getOrders` (dữ liệu thật trên sheet, DÙNG CHUNG cho mọi trình duyệt), khác hẳn `KEY_MIRRORED_IDS` (chỉ máy này biết). `_mirrorOrderToSheet()`/`_mirrorUpdateSheet()` giờ kiểm tra CẢ 2: nếu `_sheetOrderIds` đã có ID đó (do trình duyệt KHÁC ghi) thì tự đánh dấu cục bộ và bỏ qua, không ghi thêm.
- Dời toàn bộ điểm gọi "quét-bù mirror" (`_mirrorAllSequential`) ra khỏi `_loadContentTasks()`/`_loadContentOrders()`/`_loadInternal()` — lúc các hàm này chạy, `_sheetOrderIds` chưa có dữ liệu thật (rỗng), mirror lúc đó không chống trùng được gì. Chuyển sang gọi ngay sau khi `_sheetOrderIds` đã được nạp từ `getOrders` thật: trong `loadAll()` (lúc tải trang), `_autoSyncContent()` (bấm nút "↻ Lịch Content"), và `_periodicContentSync()` (đồng bộ nền mỗi 90s) — cả 3 điểm đều tự refresh `_sheetOrderIds` trước khi mirror.

**Dọn dữ liệu đã trùng:** chạy 1 script Node.js (`dedup_orders.js`, ngoài repo, cùng cách làm với Task #77/#79) gọi `deleteOrder` cho từng ID bị lặp tới khi chỉ còn đúng 1 dòng. Trong lúc dọn, phát hiện sheet còn tăng dòng thêm (196→202) do vẫn có 1 tab trình duyệt mở bản code CŨ (chưa có fix) đang tự đồng bộ nền — xác nhận đúng cơ chế gây lỗi. Kết quả cuối: **67 dòng, 0 trùng lặp**.

**⚠️ Lưu ý bắt buộc sau khi deploy fix này:** mọi tab admin.html/tracker.html đang mở ở bất kỳ máy nào đều cần **tải lại trang (F5)** để nạp code mới — tab cũ vẫn chạy code cũ trong bộ nhớ cho tới khi tải lại, và sẽ tiếp tục ghi trùng nếu để mở lâu (đúng nguyên nhân khiến 196→202 xảy ra ngay trong lúc dọn dẹp).

**Xác nhận sau khi push code fix lên Git:** kiểm tra lại sheet Orders — vẫn giữ nguyên **67 dòng, 0 trùng lặp**, không phát sinh thêm dòng trùng nào kể từ lúc dọn xong. Cơ chế `_sheetOrderIds` hoạt động đúng như kỳ vọng.

---

### Task #81 — Chênh lệch số lượng giữa sheet (67) và admin/tracker (66): không phải bug, do 1 dòng "ghost"

**Câu hỏi gốc:** "Số lượng công việc trên sheet chưa khớp admin và tracker" → xác nhận cụ thể: sheet 67, admin/tracker 66.

**Đối chiếu trực tiếp với Supabase (nguồn thật của Lịch Content):** Content Order 21/21 và Content Task 45/45 đều đã mirror đủ vào sheet, không thiếu cái nào. Vậy 67 dòng sheet = 66 việc đang tồn tại thật (21+45) + **1 dòng dư** — dò ngược từng ID `lco-`/`cont-` trong sheet với dữ liệu Supabase hiện tại, phát hiện đúng 1 dòng không còn khớp: `cont-mryp7x35i83oth` (bài "Đau đầu có phải dấu hiệu của ĐỘT QUỴ?") — đã bị **xoá bên Lịch Content SAU KHI đã được mirror vào sheet**.

**Kết luận:** đây không phải lỗi ghi trùng hay bỏ sót — sheet chỉ đơn giản **không tự xoá dòng mirror khi nguồn gốc bị xoá** (đúng vai trò "sao lưu": giữ lại dữ liệu kể cả khi bản gốc mất đi), trong khi admin.html/tracker.html chỉ hiển thị dữ liệu đang sống từ Supabase nên không thấy dòng đó nữa. Chênh lệch 67 vs 66 = đúng 1 dòng "ghost" này, không hơn không kém.

**Xử lý:** người dùng xác nhận muốn xoá dòng ghost để khớp số tuyệt đối, chấp nhận đánh đổi mất bản ghi lịch sử của việc đã xoá — gọi `deleteOrder` xoá `cont-mryp7x35i83oth`. Kết quả: sheet còn **66 dòng**, khớp đúng admin/tracker.

**Lưu ý cho về sau:** đây là hành vi TỰ NHIÊN của cơ chế mirror (Task #75), không phải bug — mỗi khi 1 Content Order/Task bị xoá bên Lịch Content sau khi đã mirror, sheet sẽ dư đúng 1 dòng ghost cho việc đó. Nếu muốn số liệu sheet luôn khớp tuyệt đối với admin/tracker về lâu dài, cần thêm cơ chế tự dọn ghost (chưa làm, vì đánh đổi là mất lịch sử của việc đã xoá — cần hỏi ý kiến người dùng trước khi tự động hoá việc này).

---

### Task #82 — Tạo tài khoản nhân sự phòng MKT + mở rộng hệ thống vai trò (3 cấp × 6 vị trí)

**Yêu cầu (nguyên văn):** "Check cho anh việc tạo tài khoản cho các nhân sự nhé, hỏi anh và tạo tài khoản tương ứng, sau đó nhắn lại anh tên đăng nhập và mật khẩu" — kèm link Google Sheet danh sách phòng thật (14 người) và "mật khẩu mặc định là Midu123!".

**Quy trình:** tải CSV danh sách phòng qua link Google Sheet công khai (`export?format=csv`), đối chiếu với danh sách tài khoản hiện có (chỉ 3 tài khoản: `admin`, `huyle`, và 1 tài khoản "Nguyên" bị thiếu tên đầy đủ/sai vai trò — hoá ra là Phạm Trung Nguyên). Xác nhận với người dùng qua nhiều vòng hỏi đáp: bỏ qua 2 người bên Content (Kim Oanh, Khánh Huyền — dùng trang Content riêng), bỏ qua Đinh Gia Bảo (thực tập sinh mới, chưa rõ vị trí), và **mở rộng hệ thống vai trò từ 5 lên 18 vai trò** — 3 cấp (Thực tập sinh 🌱/Tập sự/Nhân viên) nhân với 6 vị trí (Thiết kế/Media/CSKH/AI/Phần mềm/Xây kênh), khớp đúng cách phòng MKT tổ chức nhân sự theo giai đoạn.

**Kỹ thuật quan trọng:** vai trò mới được thêm thẳng vào `BUILTIN_ROLES` (admin.html, code dùng chung mọi trình duyệt) thay vì dùng "vai trò tuỳ chỉnh" (`KEY_ROLES`, chỉ lưu `localStorage` — máy khác sẽ không thấy tên/icon đẹp, chỉ thấy id thô). Tất cả 15 vai trò mới đều `permLevel:'employee'` (quyền giống nhau, chỉ khác nhãn hiển thị để phản ánh đúng giai đoạn nhân sự).

**Tạo/sửa tài khoản** qua gọi trực tiếp GAS action `createUser`/`updateUser` (không qua UI vì không tự thao tác trình duyệt được) — 9 tài khoản mới + sửa lại 1 tài khoản cũ (Phạm Trung Nguyên: tên đầy đủ + đúng vai trò Trưởng nhóm Media), sau đó chỉnh tay 1 lần nữa theo yêu cầu riêng (Đặng Ngọc Huy: Tập sự AI → Nhân viên AI khi bạn đã chuyển giai đoạn).

**Phát hiện phụ quan trọng trong lúc làm — GAS live bị lệch phiên bản:** khi tìm hiểu câu hỏi "tự đổi mật khẩu thì admin có xem được không", phát hiện `getUsers` sống trả về mật khẩu dạng **văn bản thường** và thiếu hẳn `dept`/`active`/`createdAt`/`permOverrides`/`allowedTypes` — tức **bản GAS đang chạy live cũ hơn nhiều so với file `.gs` hiện tại** (file local đã có sẵn hash SHA-256 cho mật khẩu và đủ cột Task #76, nhưng chưa từng được deploy). Nghĩa là tính năng phân quyền riêng từng người (Task #76) **có thể chưa từng hoạt động thật trên live** suốt từ lúc "hoàn thành" tới giờ.

---

### Task #83 — Deploy lại GAS: sự cố sập đăng nhập toàn hệ thống + cách khắc phục

**Bối cảnh:** sau khi xác nhận GAS live bị lệch phiên bản (Task #82), người dùng đồng ý deploy lại. Do hạn chế đã biết (không tự thao tác trình duyệt được), hướng dẫn người dùng tự làm từng bước qua ảnh chụp màn hình: mở Apps Script gắn với Sheet "Orders" → dán đè bằng nội dung `MIDU_MKT_Script.gs` mới nhất → **"Triển khai" → biểu tượng ✏️ ở khung "Quản lý các tùy chọn triển khai" → chọn "Phiên bản mới" → Deploy** (giữ nguyên deployment cũ, không tạo deployment mới, để URL không đổi). Deploy thành công lên "Phiên bản 8" (từ "Phiên bản 7" cũ, đã chạy từ 3/7/2026).

**Sự cố nghiêm trọng phát hiện ngay sau deploy:** gọi thử `loginUser` cho cả 3 tài khoản mẫu (admin/huyle/anhnguyen) → **TẤT CẢ đều báo "Sai tên đăng nhập hoặc mật khẩu"** — tức **sập đăng nhập toàn bộ hệ thống** ngay sau khi deploy.

**Nguyên nhân gốc:** bản GAS mới thêm hash SHA-256 cho mật khẩu (`loginUserData` giờ so sánh `hashPw(password) === row[2]`), nhưng **toàn bộ 12 tài khoản hiện có** (kể cả `admin` gốc) đều đang lưu mật khẩu ở **cột C dạng văn bản thường** (từ bản code cũ, không hash) — không có bước migrate dữ liệu cũ sang hash mới trước khi deploy, nên mọi so sánh hash đều lệch, không ai đăng nhập được.

**Fix (ngay lập tức, cùng phiên làm việc, không để downtime kéo dài):** gọi `updateUser` cho cả 12 tài khoản với `{password:'Midu123', active:true}` — action `updateUserData` mới sẽ tự hash lại đúng chuẩn khi ghi. Kèm luôn `active:true` vì phát hiện cột "active" (cột G) của các tài khoản tạo từ code cũ đang trống (code cũ không ghi cột này), trong khi `loginUserData` mới yêu cầu đúng `active==='true'` mới cho đăng nhập — nếu chỉ sửa mật khẩu mà bỏ qua `active` vẫn có nguy cơ đăng nhập thất bại. Xác nhận lại: gọi thử `loginUser` cho đủ 12/12 tài khoản → tất cả đăng nhập thành công.

**⚠️ Bài học bắt buộc cho lần deploy GAS tiếp theo (nếu còn thay đổi liên quan đến bảo mật/schema Users):** bất kỳ thay đổi nào ảnh hưởng tới CÁCH DỮ LIỆU CŨ được đọc/so khớp (đổi từ plaintext sang hash, đổi tên cột, đổi kiểu dữ liệu...) đều PHẢI đi kèm bước migrate dữ liệu cũ ngay sau khi deploy — không thể giả định deploy xong là xong, phải test thử `loginUser` cho vài tài khoản NGAY sau khi deploy để phát hiện sớm, trước khi nhân viên thật gặp phải.

---

### Task #84 — Đồng bộ giao diện card đơn GAS ở admin.html khớp với tracker.html

**Yêu cầu (nguyên văn):** "Này, phần giao diện hiển thị công việc ở admin cho giống tracker đi"

**Đối chiếu 2 hàm `renderCard()` (admin.html vs tracker.html)** phát hiện 3 điểm admin.html thiếu so với tracker.html dù cùng hiển thị 1 loại dữ liệu (đơn gửi qua order.html):
1. **Huy hiệu "⚠️ Trễ deadline" cho việc đã hoàn thành nhưng trễ hạn** (`isLateDone` — so sánh `completedAt` với `deadline`) — tracker.html đã có từ lâu, admin.html chưa từng có.
2. **"Người cập nhật KQ" (resultBy)** — tracker.html hiện được kể cả khi order chưa có `linkResult`; admin.html trước đây chỉ hiện tên người cập nhật lồng bên trong khối "Kết quả", nên nếu chưa có link thì mất luôn thông tin ai đã cập nhật.
3. **Khung "chi tiết" (detHTML)** — tracker.html có `skipFields` loại trừ các field đã hiển thị riêng (assignedTo, linkResult, adminNote...) tránh hiện trùng; admin.html chưa có bước lọc này (rủi ro tiềm ẩn nếu `dynamicSchema` từ GAS từng chứa trùng tên field).

**Fix:** đồng bộ lại phần hiển thị (không đụng khung `admin-strip` sửa/lưu riêng của admin) — thêm `isLateDone`, `skipFields`, đổi khối "Hoàn thành" sang hiện kèm `completedBy` + huy hiệu trễ, thêm khối "Người cập nhật KQ" độc lập khi không có `linkResult`. Thêm hàm `parseCompleted()` (port nguyên từ tracker.html, admin.html trước đó chưa có) để tính đúng `isLateDone`.

---

### Task #85 — Tính năng tách việc bằng AI (Gemini) cho brief dự án tổng hợp

**Bối cảnh:** người dùng cho xem ảnh chụp 1 "công việc" bên phần mềm 1Office — thực chất là 1 brief dự án chung, chứa nhiều đầu việc khác loại gộp chung 1 đoạn mô tả (landing page, content, banner, setup thanh toán...), không khớp với mô hình "1 order = 1 loại việc cụ thể" hiện tại của order.html. Câu hỏi gốc: "làm thế nào tối ưu nhất khi đưa vào đây" → "làm thế nào để tối ưu nhất khi tách việc, không cần làm thủ công".

**Quyết định kiến trúc (thảo luận trước khi code, theo đúng quy tắc câu hỏi mở):**
- Chỉ làm trong admin.html (không đụng order.html) — admin/leader tự dán brief vào, không mở rộng ra cho phòng ban tự gửi.
- Dùng **Google Gemini API** (có free tier, gọi thẳng từ GAS — cùng hệ sinh thái Google, không cần thêm dịch vụ ngoài) thay vì Claude/OpenAI (không free).
- AI chỉ **gợi ý**, không bao giờ tự động tạo thẳng — luôn có bước xem lại/sửa trước khi tạo hàng loạt.

**Fix:**
- `MIDU_MKT_Script.gs`: action mới `splitProjectAI(description)` — đọc `GEMINI_API_KEY` từ **Script Properties** (không lưu trong code, tránh lộ khoá khi push lên GitHub công khai), gọi Gemini với `responseMimeType:'application/json'` để ép trả về đúng JSON có cấu trúc, không cần regex tách chuỗi.
- `admin.html`: nút "🤖 Tách việc AI" (`data-admin-only`) → modal dán Mã dự án + Người yêu cầu + textarea brief → gọi AI → hiện danh sách việc gợi ý (loại/tên việc/deadline/ghi chú đều sửa được, có thể bỏ tick từng dòng hoặc thêm dòng tay) → "Tạo các việc đã chọn" ghi từng đơn qua action `addOrder` có sẵn, **tuần tự** (đúng bài học Task #77, không dùng `Promise.all`/`forEach` song song), gắn chung Mã dự án để xem tổng thể ở mục "Theo dự án".

**Sự cố khi test — model Gemini đổi liên tục:** `gemini-2.0-flash` (chọn lúc viết code) báo lỗi quota free tier = 0; đổi sang `gemini-2.5-flash` thì báo **"no longer available to new users"**; đổi alias `gemini-flash-latest` vẫn trỏ về đúng model bị chặn đó. Thêm 1 action debug tạm gọi `models.list` của Gemini để lấy đúng danh sách model API key này thật sự dùng được → phát hiện model flash hiện hành là `gemini-3.6-flash` → đổi sang model này thì chạy đúng. Đã xoá action debug sau khi xác định xong, không để lại code thừa.

**Bài học:** tên model AI (đặc biệt của Gemini) thay đổi/deprecate rất nhanh theo thời gian — nếu 1 model báo lỗi 404/quota=0, đừng đoán tên model tiếp theo, gọi thẳng endpoint `models.list` bằng chính API key đó để biết chắc model nào đang thực sự khả dụng.

---

### Task #86 — Thiết lập `clasp` để tự deploy GAS qua dòng lệnh, không cần thao tác tay trên trình duyệt

**Bối cảnh:** sau 2 lần phải hướng dẫn người dùng tự copy/dán/bấm chuột deploy GAS qua ảnh chụp màn hình (Task #83, và lần đầu ở phần trước đó) — người dùng hỏi lại "Có cách nào để em tự làm việc này không". Do giới hạn của công cụ trình duyệt (đã xác nhận nhiều lần trong phiên: kết nối lỗi + chính sách chỉ cho xem, không cho bấm/gõ), tìm được hướng khác: **`clasp`** — công cụ dòng lệnh chính thức của Google cho Apps Script, chạy qua Bash trực tiếp trên máy người dùng (không qua trình duyệt mô phỏng).

**Thiết lập (làm 1 lần):**
1. Người dùng tự bật **"Google Apps Script API"** tại `script.google.com/home/usersettings` (bắt buộc phải người dùng làm, đây là cài đặt tài khoản Google).
2. Chạy `npx @google/clasp login` — in ra link OAuth, người dùng tự mở link, chọn đúng tài khoản (`tuananhleo.me@gmail.com`), cho phép — token lưu cục bộ trên máy (không phải nhập mật khẩu hộ ai, chỉ là cấp quyền OAuth như đăng nhập ứng dụng thông thường).
3. `clasp clone <scriptId>` để lấy đúng cấu trúc file project (`Mã.js` + `appsscript.json`) vào 1 thư mục làm việc riêng (không phải thư mục repo chính, tránh lẫn với các file khác).

**Quy trình deploy từ giờ (hoàn toàn qua lệnh, không cần người dùng bấm gì):**
```
cp MIDU_MKT_Script.gs "Mã.js"
npx @google/clasp push
npx @google/clasp deploy --deploymentId <ID_deployment_cu> --description "..."
```
Dùng đúng `--deploymentId` của deployment đang có (`AKfycbw5klIN8zAsl6cYSfIYDu8GNol4tCR4KQt8-fvldq_SZC1DDgUeK6bk73jF-ZoMdCjF`) để **giữ nguyên URL cũ**, không tạo deployment mới.

**Lưu ý quan trọng phát sinh khi dùng lần đầu:** thêm `UrlFetchApp.fetch()` (gọi Gemini) vào code là 1 NĂNG LỰC MỚI cần quyền OAuth mới (`script.external_request`) — deploy qua `clasp` không tự động xin quyền mới này (khác với deploy qua UI có màn hình xin quyền hiện ra). Phải thêm 1 hàm test nhỏ (`_testAuthExternalRequest`) và người dùng tự **chạy 1 lần** từ trình soạn thảo Apps Script (nút "Chạy") để đi qua đúng màn hình xin quyền — sau đó deploy lại qua `clasp` là dùng được bình thường. Đây là bước KHÔNG thể làm qua `clasp` (cần tương tác trình duyệt thật cho quyền mới), nhưng chỉ cần làm 1 lần cho mỗi loại quyền mới thêm vào code, không phải làm lại mỗi lần deploy thường.

**Sau lần thiết lập này:** mọi lần sửa `MIDU_MKT_Script.gs` không thêm quyền OAuth mới (VD sửa logic, thêm cột, thêm action không cần API ngoài...) đều deploy được hoàn toàn tự động qua `clasp`, không cần người dùng thao tác gì trên trình duyệt nữa.

---

### Task #87 — Thêm loại order "Dự án tổng hợp" ở order.html, nối với tính năng Tách việc AI

**Câu hỏi gốc:** "Thấy rồi nhưng ở màn order thì cần có chỗ order cho dự án chứ nhỉ" — sau khi Task #85 chỉ làm phần tách việc AI trong admin.html, người dùng nhận ra vẫn cần 1 chỗ để phòng ban tự GỬI brief dự án tổng hợp qua order.html (không phải lúc nào admin cũng có sẵn brief dán tay).

**Fix (không cần sửa GAS/deploy lại — tái dùng field có sẵn):**
- `order.html`: thêm type mới `du-an-tong-hop` ("📁 Dự án tổng hợp") — dùng lại đúng 2 field đã có của loại "Khác" (`d_desc` cho brief, `d_ref_khac` cho link tài liệu), chỉ đổi label gợi ý dán nguyên brief. Nhờ tái dùng field có sẵn nên không cần thêm cột mới ở sheet Orders/GAS.
- `admin.html` + `tracker.html`: thêm vào `TYPE_MAP` để hiện đúng icon/nhãn thay vì rơi về id thô.
- `admin.html`: card của order loại này có thêm nút riêng **"🤖 Tách việc AI"** (`openAiSplitFromOrder(id)`) — mở sẵn modal AI split (Task #85), tự điền Mã dự án/Người yêu cầu/nội dung brief từ chính order đó, admin không cần copy/dán lại tay.

---

### Task #88 — Fix giao diện lịch flatpickr + cảnh báo dự án tổng hợp chưa tách việc

**Sự cố giao diện lịch chọn ngày (order.html):** người dùng gửi ảnh chụp lịch flatpickr có 1 vệt cong màu đỏ đè lên góc lịch. Nguyên nhân: ô deadline bị bôi viền đỏ báo lỗi khi gửi form thiếu deadline, nhưng viền đỏ đó **không tự biến mất** khi chọn lại ngày (chỉ mất ở lần bấm Gửi tiếp theo) — viền đỏ còn sót lại lộ ra đè lên góc lịch khi mở lại ô đó. Fix: thêm `onChange`+`focus` listener xoá viền đỏ ngay khi chọn ngày mới.

**Sự cố tiếp theo — không hiện năm:** sau fix trên, phát hiện thêm: Tailwind CDN reset input/select quá mạnh làm ô năm gốc (`numInput`) của flatpickr gần như biến mất khỏi giao diện. Thử ép hiện lại bằng CSS `!important` (width/display/visibility) — nhưng khi ẩn kèm 2 nút mũi tên tăng/giảm năm (để gọn hơn), năm nhìn như chữ tĩnh, không rõ là bấm chọn được ("Ơ thế năm không chọn được à, chỉ là text cho đẹp thôi à"). **Fix triệt để:** bỏ hẳn ô năm gốc của flatpickr, tự dựng 1 dropdown `<select>` năm (`_fpBuildYearSelect`/`_fpSyncYearSelect`) cùng kiểu dáng với dropdown chọn tháng có sẵn — đảm bảo rõ ràng là chọn được, tránh mọi xung đột cascade với Tailwind vì dùng lại đúng CSS rule của dropdown tháng (đã hoạt động ổn định).

**Yêu cầu mới — cảnh báo dự án tổng hợp chưa tách việc:** sau khi order.html có loại "Dự án tổng hợp" (Task #87), người dùng nhận ra: 1 dự án tổng hợp vẫn chỉ được TÍNH là 1 đầu việc trong thống kê dù bên trong chứa nhiều việc con, và không có gì nhắc admin phải vào tách việc — dễ bị bỏ sót. Yêu cầu (nguyên văn): "cần có thông báo là có dự án tổng hợp mới chưa tách việc. vào đó thì hiển thị danh sách để admin lựa chọn tách việc."

**Fix:**
- Banner cảnh báo màu vàng ở đầu tab "Danh sách" — đếm số order loại `du-an-tong-hop` có `status !== 'hoan-thanh'` (dùng `allOrders` chưa lọc theo kỳ/phòng ban, vì đây là việc cần chú ý ngay bất kể đang lọc gì), tự cập nhật mỗi lần `updateStats()` chạy.
- Bấm "Xem danh sách" mở modal liệt kê từng dự án chưa tách, mỗi dòng có nút "🤖 Tách việc" ngay tại chỗ (gọi `openAiSplitFromOrder`).
- **Tự đóng vòng lặp:** sau khi `confirmAiCreate()` tạo việc con thành công, tự động cập nhật order "Dự án tổng hợp" gốc sang `status:'hoan-thanh'` + `adminNote` ghi rõ đã tách thành bao nhiêu việc con — nhờ vậy banner không đếm lại nó nữa, không cần thêm cột/trạng thái mới nào ở GAS.

---

### Task #89 — Badge tiến độ dự án + màn tổng quan dự án (admin.html + tracker.html)

**Câu hỏi gốc:** "Đã có 1 dự án tổng hợp, đang được tính là 1 đầu việc, nhưng trong đó là nhiều việc con thì nên xử lý thế nào" — sau khi tách việc bằng AI (Task #85), các việc con chỉ hiện như order bình thường, không có gì cho thấy chúng thuộc cùng 1 dự án lớn hơn, dễ gây hiểu lầm là các việc độc lập.

**Thảo luận trước khi code (dùng skill `mockup` dựng bản xem trước cho người dùng duyệt trước khi implement thật):** thống nhất 2 phần — (1) mỗi card việc con có 1 badge riêng ghi rõ tên dự án + số việc đã xong/tổng + % kèm thanh tiến độ nhỏ; (2) bấm vào badge đó mở 1 màn tổng quan riêng cho cả dự án, liệt kê đầy đủ các việc con kèm trạng thái từng việc.

**Fix (đồng bộ cả admin.html lẫn tracker.html, không cần sửa GAS):**
- `_getProjectStats(projectCode)` — tính % hoàn thành + đếm việc đã xong/tổng bằng cách lọc `allOrders` theo cùng `projectCode`, tính "sống" mỗi lần hiển thị (không lưu sẵn cột nào), nên luôn đúng kể cả khi thêm/xoá việc con sau này.
- `renderCard()`: nếu order có `projectCode` và có **từ 2 việc trở lên** cùng mã đó, thay badge "📁 mã dự án" trơn bằng khối màu vàng "📁 Dự án X · N/M việc · Z%" kèm thanh tiến độ, bấm vào gọi `openProjectOverview(projectCode)`.
- `openProjectOverview()` — modal mới (`project-overview-modal`) hiện: tên dự án + người yêu cầu (lấy từ chính order "Dự án tổng hợp" gốc nếu còn), % + thanh tiến độ lớn, và danh sách đầy đủ việc con (✓ xanh = xong, ◐ xanh dương = đang làm, ○ xám = chưa làm), sắp xếp việc xong lên trước. Bấm vào 1 dòng sẽ đóng modal, lọc ô tìm kiếm (`f-kw`) về đúng ID đó để nhảy thẳng tới card cần sửa.
- **Phát hiện phụ khi làm tracker.html:** class `.modal-box` được 2 modal cũ (`lco-detail-modal`, `ct-detail-modal`) dùng từ trước nhưng **chưa từng có CSS định nghĩa** — chỉ hiện đúng nhờ style `max-width` gắn kèm dòng, có thể trước giờ vẫn hiện không đúng thiết kế (thiếu nền/viền/bo góc) mà không ai để ý. Bổ sung rule `.modal-box` (khớp admin.html) để cả modal mới lẫn 2 modal cũ đều hiện đúng.

---

### Task #90 — Thêm loại order "Chatbot" (setup link đăng ký/điểm danh/thi)

**Yêu cầu (nguyên văn):** "Bây giờ anh cần 1 loại order nữa là chatbot, việc này thường thì sẽ là setup các link đăng ký, link điểm danh, link thi... do Lê Thị Huyền và Khuất Thị Ngát phụ trách" → hỏi lại field cụ thể, xác nhận: "Cái này đơn giản thôi, chỉ cần tên chương trình, fanpage là gì, các thông tin cần thu trong link với 1 dòng lưu ý."

**Fix (order.html, không cần thêm cột GAS/deploy lại — dùng lại field id có sẵn):**
```
'chatbot': [
  { id:'d_chuong_trinh', label:'Tên chương trình' },              // dùng lại id của "Lịch T.Thông"
  { id:'d_page',         label:'Fanpage' },                        // dùng lại id của "Lịch T.Thông"
  { id:'d_noi_dung_bot', label:'Thông tin cần thu thập trong link' }, // dùng lại id của "Lịch T.Thông"
  { id:'d_note_ads',     label:'Lưu ý' },                          // dùng lại id của "Chạy Ads"
]
```
Mỗi field id chỉ cần trùng với field id ĐÃ CÓ ở bất kỳ loại nào khác (vì tất cả loại dùng chung 1 bộ cột cố định trên sheet Orders) — nhãn hiển thị (label) độc lập theo từng loại, không ảnh hưởng gì tới loại gốc đang dùng field đó.

- `admin.html` + `tracker.html`: thêm `chatbot` vào `TYPE_MAP`/`DEFAULT_TYPES` (icon 🤖) để hiện đúng tên/icon thay vì id thô.

**Lưu ý đặt tên:** loại này KHÁC với "📅 Lịch T.Thông" (đặt lịch bắn tin nhắn bot hàng loạt) — "Chatbot" ở đây chỉ là việc setup link thu thập thông tin (đăng ký/điểm danh/thi) cho 1 chương trình, dù cả 2 đều liên quan tới "bot". Không có xung đột kỹ thuật (2 type id khác nhau hoàn toàn: `chatbot` vs `lich-truyen-thong`), chỉ là điểm dễ nhầm lẫn về mặt đặt tên nếu đọc lướt — cần lưu ý khi giải thích cho người mới.

---

### Task #91 — Dạy AI tách việc nhận diện loại "Chatbot"

**Yêu cầu (nguyên văn):** "Mô tả sao cho AI nhận diện được việc này để tách việc nhé, anh cũng sẽ báo đội khác ghi rõ là chatbot nếu liên quan đến chatbot" — người dùng chủ động báo trước với các đội khác để brief nhắc rõ chữ "chatbot" khi liên quan, giúp AI phân loại chính xác hơn.

**Fix:** cập nhật prompt của `splitProjectAI()` (GAS) — mô tả rõ ràng "chatbot" là setup LINK qua bot để thu thập thông tin (đăng ký/điểm danh/thi), phân biệt rõ với "lich-truyen-thong" (đặt LỊCH bắn tin nhắn hàng loạt theo thời gian), và chỉ dẫn AI: hễ văn bản có chữ "chatbot" hoặc mô tả việc tạo link đăng ký/điểm danh/thi qua bot thì luôn xếp vào loại này.

**Đã test xác nhận đúng:** brief mẫu "Setup chatbot làm link đăng ký, link điểm danh, link thi cho học viên" → AI xếp đúng vào `type:"chatbot"` (trước đây sẽ rơi vào "khac"). Deploy qua `clasp` (Task #86), không cần thao tác tay.

---

### Task #92 — Fix việc con tách AI bị "tách rời" khỏi dự án gốc nếu chưa điền Mã dự án

**Sự cố:** người dùng tạo 1 dự án tổng hợp thật (order.html) và tách AI ra 2 việc con — báo lại "vừa tạo 1 dự án và tách 2 việc con, nhưng không tìm thấy 2 việc con đâu". Kiểm tra sheet thấy 2 việc con **đã tạo thành công** (`KH-260729-141625` loại Khác, `OR-260729-141628` loại Chatbot), status "Chưa làm" nên không bị lọc theo kỳ. Sau khi người dùng chỉ ra thêm: "Những việc con này vẫn phải đi theo dự án chính chứ, không thể tách độc lập thế được, đã có màn hình gợi ý cách hiển thị rồi mà" — mới lộ ra nguyên nhân thật.

**Nguyên nhân gốc:** order "Dự án tổng hợp" gốc không điền "Mã dự án" (field tự do, không bắt buộc ở order.html) → `openAiSplitFromOrder()` (Task #85) điền sẵn ô Mã dự án bằng `o.projectCode||''` — rỗng theo → các việc con tạo ra cũng mang `projectCode` rỗng, không có gì chung để nhóm lại với nhau lẫn với dự án gốc → mất hẳn liên kết, badge tiến độ dự án (Task #89) không hiện vì `_getProjectStats()` không tìm được nhóm nào có projectCode trùng nhau.

**Fix:**
- `openAiSplitFromOrder()`: nếu order gốc chưa có `projectCode`, tự sinh mã theo mẫu `PJ-<id order gốc>` — ghi lại NGAY vào order gốc (qua `updateOrder`) để mọi việc con tách ra sau đó đều dùng chung mã này.
- `_getProjectStats()` (cả admin.html lẫn tracker.html): loại trừ chính order "Dự án tổng hợp" (loại `du-an-tong-hop`) khỏi tổng đếm việc con — nó là "vỏ chứa" (container), không phải 1 việc con thật, không nên tính vào N/M của thanh tiến độ. `openProjectOverview()` tìm order gốc riêng (không qua `items` đã lọc bỏ) để lấy tên dự án/người yêu cầu hiển thị ở đầu màn tổng quan.
- Backfill dữ liệu đã lỡ tạo: gán chung mã `PJ-OR-260729-105612` cho cả dự án gốc và 2 việc con đã tạo trước đó.

---

### Task #93 — Đổi quy trình làm việc: bắt buộc có Agent độc lập kiểm tra trước khi báo kết quả

**Bối cảnh:** sau 2 lỗi liên tiếp bị người dùng phát hiện qua thực tế sử dụng (Task #92 và các lỗi trước đó), người dùng yêu cầu thẳng: "Không ổn rồi, anh cần cách làm việc của em khác đi... cần có 1 Giám đốc dự án check lại nhé" — và khi được đề xuất tự kiểm tra lại (self-review), người dùng khẳng định rõ: "Em không tự đóng vai Giám đốc dự án được, anh cần 1 Agent khác."

**Quy trình mới (đã lưu vào bộ nhớ, áp dụng từ nay về sau cho project này):** sau khi code xong 1 thay đổi, PHẢI gọi 1 Agent riêng (Agent tool, context sạch, không thấy được quá trình implement) đóng vai "Giám đốc dự án" — giao đúng bối cảnh + yêu cầu kiểm tra kỹ (dò luồng dữ liệu, test trường hợp biên, gọi thử API thật nếu liên quan GAS/dữ liệu sống). Nếu Agent đó tìm ra lỗi → sửa → gọi lại Agent kiểm tra tiếp → lặp lại tới khi PASS. Chỉ báo "xong" cho người dùng sau khi có xác nhận PASS. Giới hạn còn lại: Agent (cũng như tôi) không tự xem được giao diện trên trình duyệt thật (công cụ trình duyệt lỗi cả phiên này) — luôn phải nói rõ phần đó chưa tự kiểm chứng được.

**Áp dụng ngay cho yêu cầu tiếp theo (gom việc con cùng dự án + hiện tên dự án thật) và phát hiện được 1 lỗi thật đáng kể:**
1. Yêu cầu gốc: "Về cách sắp xếp thì cứ sắp hết các đầu việc con trong 1 dự án liền nhau nhé, với tên dự án lấy tên bình thường chứ k hiển thị mã, khó để biết mã đó là dự án nào."
2. Fix ban đầu: `sorted()`/`sortedList()` — sau khi sắp theo ưu tiên như cũ, gom các item cùng `projectCode` đứng liền nhau (giữ nguyên vị trí của thành viên ưu tiên cao nhất). Thêm `_getProjectDisplayName(projectCode)` — tra order "Dự án tổng hợp" gốc theo `projectCode` để lấy `projectName` thật, dùng thay cho mã ở badge tiến độ card và tiêu đề màn tổng quan dự án.
3. **Vòng review Agent độc lập lần 1 phát hiện lỗi nghiêm trọng:** field `projectCode` bị dùng lại (từ trước, không liên quan gì tính năng dự án) để lưu **NGÀY lịch content** (VD `"2026-07-09"`) cho các mục Content Calendar mirror sang sheet Orders — kiểm tra dữ liệu thật cho thấy trong 17 nhóm `projectCode` trùng nhau (>1 order), chỉ **1 nhóm là dự án thật**, còn lại **16 nhóm là các bài đăng Content hoàn toàn không liên quan chỉ vì trùng ngày**, sẽ bị nhóm nhầm và hiện badge tiến độ giả nếu không chặn lại.
4. **Fix:** thêm `_isRealProject(projectCode)` — chỉ coi là dự án thật khi có ĐÚNG 1 order loại `du-an-tong-hop` mang cùng mã. Áp dụng chặn ở `_getProjectStats()` (trả về rỗng nếu không phải dự án thật, khiến badge tự động không hiện), và ở vòng lặp gom nhóm trong `sorted()`/`sortedList()`.
5. **Vòng review Agent độc lập lần 2** (kiểm tra lại đúng fix trên) phát hiện thêm 1 chỗ sót: hàm `buildProjectGroups()` (mục "Theo dự án" ở tab Báo cáo, chỉ admin.html có) vẫn đang nhóm theo `projectCode` thô, chưa qua `_isRealProject` — cùng lỗi y hệt, chỉ khác vị trí. Đã sửa nốt, dùng lại `_isRealProject()`+`_getProjectDisplayName()` cho đúng.
6. **Xác nhận cuối bằng dữ liệu thật:** đúng 1/17 nhóm được coi là dự án thật (khớp `PJ-OR-260729-105612`, 2 việc con sau khi loại trừ container), 16 nhóm còn lại (ngày lịch content) không còn bị gom/hiện badge sai nữa.

---

### Task #94 — Khối nhóm dự án liền mạch + AI gợi ý người phụ trách + fix lỗi regression phát hiện qua review

**Yêu cầu (nguyên văn, nhiều phần):**
- "Chưa sắp xếp các việc trong 1 dự án sẽ nằm cạnh nhau à" → xác nhận vẫn đúng nhưng do cache trình duyệt/GitHub Pages cũ, đã tự hết sau khi tải lại.
- "Chỗ này phải hiển thị là dự án tổng hợp và Ban đào tạo chứ, à mô tả dự án cần viết xuống dòng cho dễ đọc" — kèm ảnh chụp cho thấy card việc con ghi sai phòng ban "Marketing – Truyền thông" thay vì "Ban Đào tạo" (phòng ban thật của người gửi dự án), và mô tả dự án hiện dồn thành 1 dòng dài mất hết xuống dòng gốc.
- "Ngoài tracker cũng cần sắp xếp đầu việc trong dự án gần nhau, nhưng có cách nào thể hiện là các đầu việc kia là nằm trong dự án này chứ k tách riêng biệt ra không" → dùng skill `mockup` dựng bản xem trước khối nhóm viền vàng dùng chung 1 header, người dùng duyệt: "Ok rồi nhé".
- "với trong lúc AI phân việc có nên phân luôn người phụ trách không" (câu hỏi mở) → tư vấn nên làm, tận dụng vai trò đã có (Task #82); "Có nhé, nhưng làm luôn logic khi bận hoặc nghỉ việc nhé".

**Fix:**
1. **Phòng ban đúng thật:** `confirmAiCreate()` giờ kế thừa `department` từ order "Dự án tổng hợp" gốc (`sourceOrder.department`) thay vì gán cứng "Marketing – Truyền thông" cho mọi việc con. Đã backfill 2 việc con đã tạo trước đó về đúng "Ban Đào tạo".
2. **Giữ xuống dòng khi hiển thị:** khung "chi tiết" (`detHTML` trong `renderCard()`, cả 2 file) thêm `white-space:pre-line`, đồng thời bọc `escapeHtml()` cho giá trị hiển thị (tiện thể vá luôn 1 lỗ hổng XSS tiềm ẩn — dữ liệu trước đó chèn thẳng không thoát ký tự).
3. **Khối nhóm dự án liền mạch:** `_renderGrouped()`/`_renderProjectGroup()` (cả 2 file) — thay vì mỗi card việc con tự hiện badge tiến độ riêng, các việc cùng dự án được vẽ chung trong 1 khối viền vàng có 1 header dùng chung (tên dự án, %, thanh tiến độ), bấm header mở màn tổng quan như cũ. `renderCard(o, inGroup)` thêm tham số để ẩn hẳn badge riêng khi card đang được vẽ bên trong khối nhóm (tránh lặp lại thông tin).
4. **AI gợi ý người phụ trách:** `_TYPE_TO_POSITIONS` (map loại việc → vị trí vai trò, VD `chatbot`→`['cskh','phanmem']`) + `_suggestAssignee(type)` — lọc nhân sự đúng vị trí, **loại người đã nghỉ việc** (`active:false`), trong số còn lại **ưu tiên người đang có ít việc chưa xong nhất** (đỡ bận nhất). Chỉ là gợi ý — thêm cột "Người phụ trách" (dropdown) vào bảng xem lại trước khi tạo, vẫn sửa được tự do như mọi field khác.

**Sự cố tìm ra qua Agent review độc lập (đứt phiên giữa chừng do giới hạn API, resume lại bằng `SendMessage` tới đúng agent cũ để tiếp tục thay vì tạo agent mới mất ngữ cảnh) — phát hiện 1 lỗi regression thật:** `openAiSplitFromOrder()` ghi `projectCode` vào order gốc **NGAY LÚC MỞ MODAL** (để chuẩn bị sẵn cho lúc tạo việc con), nhưng nếu admin đóng/huỷ modal giữa chừng mà **chưa tạo việc con nào**, order gốc đã lỡ mang 1 `projectCode` thật nhưng KHÔNG có việc con nào đi kèm. `_isRealProject()` khi đó (chỉ cần có order gốc `du-an-tong-hop` là đủ, không đòi hỏi phải có việc con) coi đây là "dự án thật", khiến order đó bị vẽ thành 1 khối nhóm **rỗng "0/0 việc"**, mất hẳn card/nút Sửa-Xoá-Trạng thái bình thường của chính nó.

**Fix:** `_isRealProject(projectCode)` giờ đòi hỏi **CẢ 2 điều kiện**: có order gốc loại `du-an-tong-hop` **VÀ** có ít nhất 1 order khác (việc con) cùng mã — chỉ 1 trong 2 thì không được coi là dự án thật. Xác nhận lại bằng dữ liệu thật + mô phỏng: dự án thật (2 việc con) vẫn `true`; trường hợp giả lập chỉ có order gốc, chưa có việc con → `false` (đúng như kỳ vọng); 16 nhóm ngày lịch content (Task #93) vẫn `false` như cũ, không hồi quy.

---

### Task #95 — tracker.html: gộp trọn 1 dự án thành 1 khối duy nhất, xuyên trạng thái

**Câu hỏi/yêu cầu:** "Trong admin thì ok rồi, hiển thị ở tracker về dự án cũng như admin nhé."

**Phát hiện qua tự kiểm tra bằng dữ liệu thật (theo đúng quy trình mới):** admin.html dùng danh sách phẳng (không chia khu) nên `sorted()` luôn gom được trọn dự án dù các việc con khác trạng thái. Nhưng **tracker.html chia sẵn thành các khu riêng theo trạng thái** (🔴 Cần xử lý / 🔄 Đang làm / 💬 Feedback / ⏳ Chưa làm / ✅ Hoàn thành) **TRƯỚC KHI** gọi hàm gom nhóm — nếu 1 dự án có việc con rơi vào các khu khác nhau (VD: order gốc đã "Hoàn thành", 1 việc con trễ hạn nằm ở "Cần xử lý", 1 việc con chưa có deadline nằm ở "Chưa làm"), dữ liệu thật cho thấy đúng 3 khu khác nhau — mỗi khu chỉ tự vẽ phần việc rơi vào khu đó, xé lẻ mất tính liền mạch của cả dự án như admin.html.

**Xác nhận phạm vi với người dùng:** giữ nguyên cách chia khu như cũ, chỉ gộp riêng phần dự án (Recommended, thay đổi nhỏ) — hay gộp hẳn toàn bộ việc con về 1 khối bất kể trạng thái (giống hệt admin, cần đổi kiến trúc lớn hơn)? → chọn phương án 2: gộp hẳn.

**Fix:** trong `render()` — TRƯỚC KHI chia `allRows` vào các khu theo trạng thái, tách hẳn mọi item thuộc 1 `projectCode` "thật" (`_isRealProject`) ra thành `projectItems` riêng, chỉ còn lại `restItems` mới đem chia vào urgent/doing/feedback/pending/done như cũ. Thêm 1 khu mới **"📁 Dự án"** (dùng lại đúng `renderGroup()` có sẵn, luôn hiện đầu danh sách, mặc định mở) — vẽ từng dự án bằng `_renderProjectGroup()` với TOÀN BỘ việc con của nó (không phụ thuộc trạng thái/khu vực nào), sắp xếp theo đúng ưu tiên deadline như bình thường.

**Xác nhận bằng dữ liệu thật:** dự án thật (order gốc "Hoàn thành" + 2 việc con "Chưa làm" khác deadline, đáng lẽ rơi vào 3 khu khác nhau) — sau fix cả 3 đều được gom về đúng 1 khu "📁 Dự án", xác nhận không còn sót lại phần tử nào của dự án này trong urgent/pending/done nữa (đếm = 0 cho cả 3 khu), tổng số item vẫn khớp nguyên vẹn (114 = 3 + 111).

---

### Task #96 — Đưa vị trí dự án ở tracker.html theo đúng độ ưu tiên thật, bỏ khu cố định đầu danh sách

**Câu hỏi/phản hồi:** "Nhưng lúc nào dự án cũng ở trên đầu tiên trong admin và tracker à" → xác nhận đúng: admin.html đặt khối dự án theo độ ưu tiên (vị trí của thành viên khẩn cấp nhất, không phải luôn ở đầu), còn Task #95 vừa làm ở tracker.html lại CỐ ĐỊNH khu "📁 Dự án" luôn ở đầu, không nhất quán. Hỏi lại người dùng muốn thống nhất theo cách nào → "theo đúng độ ưu tiên như admin nhé".

**Vấn đề kỹ thuật:** admin.html dùng danh sách phẳng nên `sorted()` tự nhiên đặt khối vào đúng vị trí ưu tiên. Nhưng tracker.html chia sẵn thành khu theo TRẠNG THÁI (không phải theo độ ưu tiên thuần) — 1 dự án có nhiều việc con thì "độ ưu tiên" của cả khối là khái niệm mơ hồ: nên đặt dự án vào khu trạng thái nào khi các việc con có trạng thái khác nhau?

**Fix:** thay khu "📁 Dự án" cố định (Task #95) bằng cơ chế "đại diện" — với mỗi dự án, chọn ra **việc con khẩn cấp nhất** (dlPriority thấp nhất, deadline sớm nhất, không tính order gốc) làm đại diện (`projectMarkers`), mang đúng `status`/`deadline` của đại diện đó. Đại diện này được đưa vào cùng luồng phân loại theo trạng thái (`classifyPool`) như 1 item bình thường — tự nhiên rơi vào ĐÚNG khu trạng thái + đúng vị trí ưu tiên mà việc con khẩn cấp nhất đó đáng lẽ thuộc về, mô phỏng chính xác cách admin.html đặt cả khối vào vị trí của thành viên ưu tiên cao nhất. Lúc vẽ (`renderMixed`), gặp item được đánh dấu `_isProjectMarker` thì thay bằng `_renderProjectGroup()` với TOÀN BỘ việc con thật (không chỉ đại diện).

**Xác nhận bằng dữ liệu thật:** dự án có việc con trễ hạn từ 30/6 (dlPriority=0, khẩn cấp nhất) được chọn làm đại diện → dự án rơi đúng vào khu "🔴 Cần xử lý", đứng ở vị trí đầu tiên trong khu đó (index 0/27) đúng theo độ ưu tiên thật của deadline, không còn nằm ở 1 khu riêng cố định đầu toàn bộ danh sách nữa.

---

### Task #97 — Fix lệch trạng thái Content Order (LC) so với trang Content + mở rộng auto-complete Feedback 24h sang LC Order/việc nội bộ

**Câu hỏi/phản hồi:** người dùng gửi ảnh chụp 3 card LC Order (VA-260713-013, TK-260721-018, VA-260722-019) và hỏi "Kiểm tra những việc này nhé, xem có khớp trạng thái của trang content không, rồi logic feedback sau 24h tự động cập nhật hoàn thành đã áp dụng chưa".

**Kiểm tra bằng dữ liệu thật (Supabase, board Kim Oanh):**
| Mã | Trang Content (nguồn) | Admin/Tracker hiển thị | Khớp? |
|---|---|---|---|
| VA-260713-013 | Hoàn thành | Đang xử lý | ❌ Lệch |
| TK-260721-018 | Chờ feedback | Feedback | ✅ |
| VA-260722-019 | Chờ feedback | Feedback | ✅ |

**Nguyên nhân lệch:** `admin.html`/`tracker.html` build LC Order card bằng `status:saved?.status||autoStatus` — override cục bộ (`internalTasks`, lưu localStorage, tạo ra khi admin phân công/sửa trạng thái tay) luôn thắng trạng thái gốc từ Content, và KHÔNG BAO GIỜ tự đồng bộ lại. Case thật: từng gán "Đặng Ngọc Huy" cho VA-260713-013 (tự chuyển override → dang-xu-ly), sau đó bên Content tự đánh dấu "Hoàn thành" trực tiếp trên trang Content — override cũ vẫn ghi đè vĩnh viễn trên admin/tracker.

**Fix 1 (lệch trạng thái):** thêm bước `resolvedStatus` trong `_loadContentOrders()`/tương đương ở cả `admin.html` và `tracker.html` — nếu trạng thái gốc từ Content đã là "Hoàn thành" (trạng thái cuối) mà override cục bộ CHƯA phải "Hoàn thành", cho trạng thái từ Content thắng. Override do chính admin đặt "Hoàn thành" thì vẫn giữ nguyên (không bị trạng thái gốc cũ hơn ghi đè ngược). Vì dropdown "Trạng thái" trên card LC Order (`admin.html`) luôn hiển thị đúng `t.status` đã resolve, lần "Lưu" tiếp theo của admin sẽ tự ghi đúng giá trị này vào override — tự chữa lành, không cần migrate dữ liệu cũ.

**Kiểm tra bằng dữ liệu thật + mô phỏng 4 tình huống (Node):** case lệch thật (VA-260713-013) → resolve đúng "hoan-thanh"; 2 case khớp sẵn → không đổi; case chưa từng có override → không đổi; case admin tự đặt "hoan-thanh" trong khi trạng thái gốc chưa kịp ghi ngược → vẫn giữ "hoan-thanh" (không bị đè ngược).

**Fix 2 (auto-complete Feedback 24h):** phát hiện hàm `_autoCompleteFeedback24h()` đã tồn tại sẵn trong `admin.html` (dùng `resultAt` của `allOrders` — order thường trong sheet Orders) nhưng CHỈ áp dụng cho order thường, bỏ sót hoàn toàn LC Order (Content Order) và việc nội bộ MKT — đúng loại xuất hiện trong ảnh chụp màn hình. Mở rộng hàm để quét thêm `contentOrders` + `internalTasks` (loại không phải LC), dùng field `_feedbackAt` sẵn có (set tự động khi status chuyển sang "feedback", xem `_updateInternal()`), quá 24h thì gọi lại `_updateInternal(id,{status:'hoan-thanh',completedBy:'Hệ thống (24h)'})` — tái dùng đúng luồng ghi ngược Supabase (LC Order) + mirror sheet (việc nội bộ) có sẵn thay vì viết logic riêng. Sửa thêm 2 chỗ trong `_updateInternal()` (thêm điều kiện `&&!fields.completedBy`) để lời gọi auto-complete có thể tự ghi "Hệ thống (24h)" thay vì bị quy tắc mặc định ghi đè thành tên admin đang mở trình duyệt.

**Kiểm tra bằng mô phỏng (Node):** dựng 3 content order + 2 việc nội bộ giả lập đúng field thật (`_feedbackAt` 25h/2h/48h trước, trạng thái khác nhau) — đúng 2 item quá 24h ở trạng thái feedback được phát hiện, các item còn lại (chưa đủ 24h, không ở feedback, đã hoàn thành) không bị đụng tới.

**Giới hạn còn lại:** `internalTasks`/override chỉ lưu trong localStorage của từng trình duyệt — cơ chế auto-complete này chỉ chạy khi ai đó mở `admin.html` (nơi duy nhất có quyền sửa/ghi); nếu không có ai từng mở `admin.html` trên máy đó, override cũ sẽ không tự dọn. `tracker.html` chỉ hiển thị (đọc cùng localStorage nếu cùng trình duyệt/origin với admin.html), không tự chạy auto-complete.

---

### Task #98 — Vá lỗ hổng bảo mật: API GAS mở hoàn toàn, không cần đăng nhập

**Phát hiện qua review chủ động (không phải người dùng báo):** `doPost()` trong `MIDU_MKT_Script.gs` chỉ `loginUser` có kiểm tra mật khẩu — mọi action còn lại (`updateOrder`, `deleteOrder`, `createUser`, `updateUser`, `deleteUser`, `saveFormSchema`...) chạy thẳng không hỏi ai đang gọi. URL GAS lại nằm sẵn trong source public của `admin.html`/`order.html` — ai xem source cũng gọi thẳng được bằng Postman/curl, không cần tài khoản, có thể xoá/sửa toàn bộ dữ liệu hoặc tạo tài khoản admin mới. Ngoài ra: mật khẩu admin mặc định `Midu123` đoán được; Firestore rule đang ở chế độ test-mode mặc định (`allow read, write` mở toàn bộ database, **hết hạn 2026-08-05**) chứ không phải rule đã ghi trong `HUONG_DAN_DEPLOY.md`.

**Quyết định thiết kế (thống nhất với người dùng qua nhiều câu hỏi):** session token lưu sheet "Sessions" riêng (không dùng CacheService vì giới hạn cứng 6 tiếng của Google), hạn 7 ngày; hệ thống vai trò (trước đây `BUILTIN_ROLES`/`PERM_LEVELS` hard-code + vai trò tuỳ chỉnh chỉ lưu `localStorage` từng máy) chuyển hẳn sang sheet "Roles" dùng chung server-side; `submitOrders` (order.html, không có đăng nhập) giữ nguyên công khai — chỉ khoá các action quản trị.

**Fix (`MIDU_MKT_Script.gs`):** thêm sheet Sessions (`createSession`/`validateToken`/`deleteSession`, tự dọn token hết hạn) + sheet Roles (seed từ `BUILTIN_ROLES_GAS`, action `getRoles`/`createRole`/`updateRole`/`deleteRole`) + hàm `hasPerm(user,key)` tính quyền hiệu lực (permLevel theo role + permOverrides riêng từng người). `doPost()`: mọi action trừ `loginUser`/`submitOrders` bắt buộc `token` hợp lệ; `deleteOrder`/`createUser`/`deleteUser`/`saveFormSchema`/quản lý vai trò chỉ admin (`canDelete`/`canUserMgmt`/`canFormBuilder`) mới gọi được; `updateUser` cho phép tự đổi mật khẩu của chính mình dù không có `canUserMgmt`.

**Fix (`admin.html`):** wrapper tự gắn `token` vào mọi POST tới GAS (viết 1 lần ở tầng `fetch`, tránh sửa rải rác 20+ chỗ gọi); tự đăng xuất khi GAS báo phiên hết hạn/tài khoản bị khoá; `loadRoles()` fetch vai trò từ server khi đăng nhập, `getAllRoles()` đổi nguồn từ `BUILTIN_ROLES` hard-code sang dữ liệu server (giữ `BUILTIN_ROLES` làm fallback + giá trị mặc định cho "Hoàn tác về mặc định"); quản lý vai trò (thêm/sửa/xoá) đổi từ ghi `localStorage` sang gọi action `createRole`/`updateRole`/`deleteRole`.

**Fix (Firebase, làm trực tiếp qua Chrome đã đăng nhập sẵn của người dùng — không tự nhập mật khẩu):** bật **Authentication → Anonymous** (trước đó dự án chưa từng khởi tạo Authentication); `admin.html` gọi `signInAnonymously()` khi khởi tạo Firebase; publish lại Firestore Rules từ rule test-mode sắp hết hạn sang `allow read, write: if request.auth != null` giới hạn đúng collection `midu_orders`.

**Đã làm nhưng chưa xác nhận xong:** đổi mật khẩu admin mặc định — **người dùng xác nhận đã đổi xong (2026-08-04)**.

**Vận hành:** thêm bước chạy `verify.py` trước khi `git push` trong `watch_and_push.ps1` (FAIL thì huỷ push, ghi log); archive `MIDU_MKT_Order.html` (bản trùng không dùng, `order.html` mới là bản chính thức); xoá `admin.html.bak`.

---

### Task #99 — Gọn card "Lịch Content", bộ lọc/báo cáo "Tháng trước", thống nhất số đếm List/Report

**Câu hỏi/phản hồi 1:** người dùng gửi ảnh card "Lịch Content" hiện cả bài viết dài (VD nội dung khoá học nhiều gạch đầu dòng) tràn thành 1 khối chữ đậm dày đặc — "Chỗ này hiển thị trông hơi ghê, cho gọn gàng lại em, cả admin và tracker". Nguyên nhân: field `title`/`projectName` của card Lịch Content lấy nguyên văn `ct.idea||ct.content` (có thể dài cả bài) rồi hiện thẳng trong dòng tiêu đề in đậm.

**Fix:** thêm `_splitLongTitle()`/`_titleBlockHTML()` dùng chung (cả `admin.html`, `tracker.html`) — tách dòng/đoạn đầu làm tiêu đề ngắn, phần còn lại thu trong `<details>` "Xem đầy đủ nội dung ▾". Lần sửa đầu chỉ nối hàm vào `admin.html`, **quên nối vào `tracker.html`** — người dùng gửi ảnh so sánh phát hiện tracker chưa đổi, sửa bổ sung ngay sau. Cùng lúc phát hiện dữ liệu dán từ nơi khác lẫn thẻ HTML thừa (VD `<div>` hiện ra thành chữ do giờ đã `escapeHtml()` đúng cách, trước đây trình duyệt tự nuốt mất nên không ai thấy) — thêm bước lọc `replace(/<\/?[a-z][^>]*>/gi,'')` trước khi tách/hiện. Đổi luôn nút "Mở bài này trên Lịch Content" ở `admin.html` từ nút trơn sang dạng thanh info giống `tracker.html` cho dễ nhìn.

**Câu hỏi/phản hồi 2:** "Thêm bộ lọc của tháng trước và báo cáo tháng trước nhé" — `tracker.html` vốn đã có sẵn nút lọc + preset "Tháng trước". `admin.html` thiếu ở cả 2 nơi dùng chung `setPeriod()`/`getDateRange()` (tab Đơn hàng và tab Báo cáo) — thêm case `last-month` vào `getDateRange()`, nhãn vào `_periodLabels()`, nút vào cả 2 hàng bộ lọc kỳ.

**Câu hỏi/phản hồi 3:** "Ủa con số ở danh sách và màn báo cáo khác nhau à" (trong `admin.html`). Rà code thấy 3 nguyên nhân: (1) tab Báo cáo trước đây tự gộp nguồn riêng (`allForReport`), bỏ qua hoàn toàn bộ lọc phòng ban/loại/trạng thái/tìm kiếm đang chọn ở tab Đơn hàng; (2) Báo cáo không áp giới hạn quyền xem theo người dùng (`viewAll`/`_isAssignedToMe`) như tab Đơn hàng — nhân viên thường chỉ thấy việc của mình ở Đơn hàng nhưng Báo cáo lại tính cả team; (3) quy tắc "luôn hiện việc chưa xong/trễ hạn dù ngoài kỳ" chỉ áp cho đơn GAS thường ở tab Đơn hàng, không áp cho việc Lịch Content/Nội bộ MKT (trong khi Báo cáo áp đều cho mọi loại qua `filterByPeriod`).

**Fix:** thống nhất về đúng 1 nguồn — `renderReport()` giờ gọi `getFilteredRows()` (hàm tab Đơn hàng đang dùng) thay vì tự gộp mảng riêng; thêm carve-out "luôn hiện việc chưa xong/trễ hạn" vào phần lọc kỳ của `intRows` trong `getFilteredRows()` để khớp `filterByPeriod()`; `updateListPeriodLabel()` (dòng chữ nhỏ cạnh nút chọn kỳ) cũng đổi sang đếm bằng `getFilteredRows()` thay vì chỉ đếm riêng `allOrders`. Lưu ý đã báo người dùng: từ nay Báo cáo sẽ phản ánh đúng bộ lọc đang chọn ở tab Đơn hàng (không còn mặc định là tổng toàn bộ không lọc gì).

---

### Task #100 — Lịch truyền thông: bỏ field thừa, fix AI tách việc ghi nhầm sheet

**Câu hỏi 1:** người dùng hỏi rõ cơ chế Lịch truyền thông — sheet riêng (`LICH_TT_SHEET_ID`, tách khỏi sheet Orders để tránh phình sheet theo tần suất bắn bot) hay đồng bộ chung Orders? Trả lời qua review code: Content Order/Content Task/Việc nội bộ **có** mirror 1 bản vào sheet Orders làm bản ghi tổng hợp (`_mirrorOrderToSheet()`), nhưng Lịch truyền thông thì **không** — loại trừ tường minh (`if(order._fromLichTT) return`) đúng theo thiết kế tách riêng. order.html: loại "Lịch truyền thông" → sheet riêng, mọi loại khác → sheet Orders.

**Câu hỏi 2 (yêu cầu sửa):** "Bỏ phần Giờ deadline trong lịch truyền thông nhé, giờ deadline chính là giờ bắn bot rồi" — `order.html` có 2 field giờ trùng nhau cho loại Lịch truyền thông: field chung "Giờ deadline" (mọi loại đều có) và field riêng "Giờ bắn bot" (`d_gio_ban_bot`, chỉ loại này có). Fix: ẩn hẳn field "Giờ deadline" khi đang điền loại Lịch truyền thông (đổi grid 3 cột → 2 cột), giữ nguyên cho các loại khác. Code gửi đơn vốn đã ưu tiên đọc `d_gio_ban_bot` trước `deadlineTime` nên không mất dữ liệu.

**Phát hiện thêm khi trả lời câu hỏi 1 (không phải người dùng báo):** tính năng "Tách việc bằng AI" (`confirmAiCreate()` trong `admin.html`) tạo từng việc con bằng action `addOrder` — action này LUÔN ghi thẳng vào sheet Orders bất kể `type`, không có logic định tuyến như `submitOrders`. Nếu AI gợi ý 1 việc con thuộc loại "lich-truyen-thong" (có trong danh sách loại AI được phép gợi ý), việc đó sẽ bị ghi nhầm vào sheet Orders thay vì sheet Lịch T.Thông riêng. Người dùng xác nhận cần sửa.

**Fix:** đổi lời gọi trong vòng lặp tạo việc con từ `action:'addOrder'` sang `action:'submitOrders'` (mảng 1 phần tử) — `submitOrdersData()` phía GAS đã có sẵn logic định tuyến đúng theo `type`, không cần sửa gì thêm ở backend.

---

### Task #101 — Thông báo Zalo khi có order mới (qua Smax.ai)

**Yêu cầu:** bắn thông báo vào 1 group/tài khoản Zalo (qua nền tảng Smax.ai) mỗi khi có order mới, nội dung gồm loại yêu cầu + tên dự án, người gửi + phòng ban, deadline, link mở thẳng đơn đó trên admin.html.

**Thiết kế ban đầu (server-side, GAS):** thêm `notifyZaloNewOrder(order)` trong `MIDU_MKT_Script.gs`, gọi từ `submitOrdersData()` sau khi tạo đơn thành công — token bí mật của Smax lưu ở Script Properties (`SMAX_TRIGGER_TOKEN`), giống cách làm với `GEMINI_API_KEY`, không lộ ra client. Deep-link `admin.html?id=<mã đơn>` tự điền sẵn ô tìm kiếm khi mở từ link thông báo.

**Sự cố kéo dài không sửa được (Google Apps Script):** sau khi deploy, GAS báo lỗi `Bạn không có quyền thực hiện lệnh gọi UrlFetchApp.fetch` — **chỉ xảy ra khi web app được gọi ẩn danh** (đúng cách order.html hoạt động thật), trong khi chạy thử bằng nút "Chạy" trong trình soạn thảo lại không lỗi (chạy với quyền chủ script, không đại diện cho request ẩn danh thật). Đã thử đủ cách chuẩn mà không sửa được:
- Thu hồi + cấp lại quyền qua myaccount.google.com/permissions.
- Deploy lại nhiều lần ("New version" lẫn "New deployment" — nhiều lần lỡ tạo deployment mới thay vì cập nhật đúng bản đang chạy, phải dò lại URL đúng qua từng lần).
- Kiểm tra `appsscript.json` (không có `oauthScopes` tường minh — dùng auto-detect bình thường).
- Dùng kỹ thuật ghi kết quả gọi Smax vào `adminNote` của chính order để đọc log từ xa qua `getOrders` (không xem được Execution log của GAS từ bên ngoài) — xác nhận chính xác đây là lỗi quyền, không phải lỗi Smax hay lỗi code.
- Test qua link "Test deployments" (chạy với danh tính người phát triển, không lỗi — càng xác nhận vấn đề chỉ xảy ra với caller ẩn danh).

**Quyết định:** người dùng yêu cầu bỏ hẳn đường GAS, chuyển sang gọi thẳng Smax.ai **từ trình duyệt** (`order.html`, client-side) — đã trao đổi rõ đánh đổi: token Smax nằm trong code public, ai xem source cũng lấy được, người dùng chấp nhận đánh đổi này để tính năng chạy được ngay (phương án an toàn hơn — Firebase Cloud Function giữ token server-side — cần nâng cấp Firebase lên gói Blaze, để sau nếu cần). Đã xoá sạch `notifyZaloNewOrder`/debug write khỏi `MIDU_MKT_Script.gs`.

**Fix trong lúc làm — tên attribute sai chính tả:** người dùng cho tên attribute template Smax là `thontinlead` (thiếu chữ "g"), code làm đúng theo tên đó nên tin nhắn gửi được nhưng Smax không điền được nội dung vào (chỉ hiện phần chữ tĩnh có sẵn trong mẫu). Xác nhận lại đúng tên là `thongtinlead`, sửa lại khớp.

**Xác nhận hoạt động bằng dữ liệu thật:** gọi thẳng Smax API qua console trình duyệt tại đúng origin `tuananhleo.github.io` (không bị CORS chặn) → có tin. Điền và gửi 1 đơn thật qua giao diện order.html (mã `TK-260807-103535`) → Zalo nhận đúng đủ nội dung (loại đơn, tên dự án, người gửi, deadline kèm giờ, link mở đơn) — xác nhận hoạt động trọn vẹn qua đúng luồng người dùng thật sẽ dùng.

---

### Task #102 — Ổn định số lượng công việc hiển thị (Tổng/Trễ deadline/Đang làm/Hoàn thành) + fix hiển thị giờ

**Câu hỏi/phản hồi:** "Số lượng công việc ở admin và tracker mỗi lần vào là 1 con số, k khớp nhau", sau đó nhấn mạnh cần "làm cho ổn định" chứ không chỉ giải thích.

**Kiểm tra bằng dữ liệu thật (console cả 2 trang cùng lúc, cùng bộ lọc):** `getFilteredRows()` của `admin.html` và `tracker.html` trả về **kết quả khớp tuyệt đối** (rows=12, intRows=41, tổng=53) với cùng dữ liệu nguồn (allOrders=78, contentTasks=89, contentOrders=42) — xác nhận thuật toán đếm (đã thống nhất ở Task #99) vẫn đúng, không lệch giữa 2 trang tại 1 thời điểm.

**Nguyên nhân thật của cảm giác "nhảy múa":** cả `loadAll()` (admin.html) và `loadOrders()` (tracker.html) hiện số **nhiều lần trong lúc đang tải** để không phải chờ trắng màn hình — lần đầu dùng cache cũ, lần giữa dùng Content (Supabase) mới nhưng đơn GAS (`allOrders`) vẫn còn là bản cache cũ, chỉ lần cuối (sau khi GAS trả lời) mới thật sự đồng bộ cả 2 nguồn. 2 nguồn **lệch độ mới** ở các bước giữa khiến tổng số hiện ra 1 giá trị tạm rồi nhảy sang giá trị khác vài giây sau — nhìn giống như đếm sai, dù thực chất chỉ là hiệu ứng phụ của cách tải tiệm tiến.

**Fix:** thêm cờ `_dataReady` (mặc định `false`) ở cả 2 file — `updateStats()` chỉ thực sự ghi số vào 4 ô KPI khi cờ này bật; giữ nguyên số cũ (hoặc "–" mặc định lần đầu) trong lúc chưa đủ dữ liệu thay vì hiện số tạm rồi nhảy. Bật cờ `_dataReady = true` đúng lúc cả đơn GAS lẫn Content đã cùng về bản mới nhất (cuối `loadAll()`/bước B6 của `loadOrders()`), ngay trước lần gọi `updateStats()` cuối cùng.

**Fix kèm theo (phát hiện qua ảnh chụp thật lúc kiểm tra):**
1. Card đơn thường (`renderCard`) thiếu hiện giờ deadline (`deadlineTime`) — chỉ có ngày, trong khi card Lịch Content/Nội bộ đã có sẵn. Thêm `dlTimeStr` giống các loại card khác.
2. "Ngày gửi" hiện sai giờ (VD `07:00:00` dù gửi lúc 17:47) — do Google Sheets tự động chuyển chuỗi "dd/mm/yyyy HH:MM:SS" client gửi lên thành ô Date thật, nhưng `fmtCell()` (GAS, đọc dữ liệu trả về client) chỉ lấy phần ngày `YYYY-MM-DD`, bỏ mất giờ. Client parse lại chuỗi ngày trơn đó thành `Date`, JS hiểu là nửa đêm UTC, quy đổi sang giờ VN (UTC+7) ra lệch đúng 7 tiếng. Sửa `fmtCell()` giữ nguyên giờ khi khác nửa đêm — field ngày thuần thật (`deadline`) vẫn hiện đúng dạng chỉ-ngày như cũ vì luôn có giờ = 00:00:00.

---

### Task #103 — Rà soát nốt lỗi TDZ còn sót trước khi đưa vào dùng thật (đợt cuối)

**Bối cảnh:** theo yêu cầu "tự check các rule, tự test luồng trước khi đưa vào dùng thật", tiếp tục dò lỗi TDZ (temporal dead zone) trong `admin.html` — cùng lớp lỗi đã phát hiện trước đó ở `_serverRoles` và `_contentSyncInterval`/`_SB_URL`/`_SB_KEY`: biến khai báo bằng `let`/`const` ở cuối file nhưng bị `restoreSession()` (chạy đồng bộ ngay lúc script còn đang parse, nếu trình duyệt đã có session cũ) gọi tới thông qua chuỗi `afterLogin()→loadAll()→_loadContentTasks()/_loadContentOrders()` trước khi kịp chạy tới dòng khai báo gốc.

**Phát hiện qua console thật (reload lại trang có session sẵn):** `Cannot access '_CONTENT_SOURCES' before initialization`. Rà thêm thấy cùng lỗi tiềm ẩn ở `_CONTENT_STATUS_MAP`, `CONTENT_APP_URL`, `_LC_TASK_STATUS_REVERSE` — cùng khai báo muộn, cùng bị gọi sớm.

**Fix:** chuyển toàn bộ 4 hằng số này lên đầu file (gần `currentUser`/`_serverRoles`/`_contentSyncInterval`), xoá khai báo trùng ở vị trí cũ. Từ đây rút kinh nghiệm: mọi helper mới thêm cho luồng đồng bộ Content nên khai báo bằng `function` (hoisted, an toàn bất kể vị trí trong file) thay vì `const`/`let` — áp dụng ngay cho các hàm thêm sau này trong buổi (`_linkRowsHTML`, `_notifyZaloContentOrder`, `_looksMojibake`...).

**Xác nhận:** reload lại trang nhiều lần với session có sẵn (đúng luồng lỗi xảy ra), console sạch hoàn toàn lỗi `ReferenceError`/"before initialization". Đồng thời rà soát tương tự cho `tracker.html`/`order.html` — không phát hiện thêm trường hợp nào.

---

### Task #104 — Hiển thị nhiều link trong "Link kết quả" + fix canh lệch giao diện

**Câu hỏi:** "công việc đó kết quả có nhiều link thì hiển thị thế nào, nếu có link thì sao chép và mở link luôn, chứ nhiều link hơi thì hơi rối". Yêu cầu tiếp: nếu lẫn cả link web và đường dẫn ổ đĩa nội bộ (`Z:\...`) thì xử lý sao.

**Thiết kế:** thêm `_splitLinkResult()`/`_linkRowsHTML()` (đồng bộ cả `admin.html` và `tracker.html`) — tách nội dung theo dòng/dấu phẩy/chấm phẩy, hoặc khoảng trắng đứng trước `http` (phòng dữ liệu cũ dán liền 1 dòng). Mỗi link tách thành 1 dòng riêng, có nút "📋 Sao chép" + "🔗 Mở link" riêng, đánh số "🔗 Kết quả 1/2/3..." khi có từ 2 link trở lên. Đường dẫn không phải `http(s)://` (VD ổ `Z:\...`) vẫn hiện được và copy được, nhưng **không có nút Mở link** — trình duyệt không thể tự mở đường dẫn ổ đĩa cục bộ vì lý do bảo mật.

**Đổi ô nhập:** 5 ô nhập "Link kết quả" trong `admin.html` đổi từ `<input>` 1 dòng sang `<textarea>` 2 dòng — để giữ được xuống dòng thật khi dán nhiều link (input 1 dòng sẽ nuốt mất newline, dính 2 link liền nhau thành 1 chuỗi hỏng).

**Fix kèm theo — canh lệch giao diện:** đổi ô Link kết quả sang textarea cao hơn khiến cả hàng `.admin-strip` (Phân công/Trạng thái/Link kết quả/Ghi chú admin/nút Lưu-Sửa-Xoá) bị lệch nhãn do đang canh theo đáy (`align-items:flex-end`). Đổi sang canh theo đỉnh (`flex-start`) — chỉ ảnh hưởng đúng hàng có ô cao thấp khác nhau, các hàng khác (cao đều) không đổi gì.

---

### Task #105 — Bắn Zalo cho Order từ trang Content (tab "Order")

**Câu hỏi:** "nếu có order từ trang content thì có thông báo về group Zalo không" → xác nhận: KHÔNG, thông báo Zalo (Task #101) trước đây chỉ gắn vào luồng nộp qua `order.html`, cả trang Content lẫn `admin.html` không có đoạn code nào gọi Zalo cho việc đồng bộ từ Content.

**Yêu cầu:** "anh muốn tất cả các order đều được bắn thông báo về Zalo" → sau trao đổi, thu hẹp phạm vi đúng ý: chỉ áp dụng cho **tab "Order"** bên trang Content (order Thiết kế/Video/Ads/Media/Chatbot/Khác — khái niệm "order" thật sự, ai đó yêu cầu việc), KHÔNG áp dụng cho lịch bài đăng thường (content calendar — nhóm Content tự viết, không phải ai "gửi" cho ai, bắn thông báo sẽ quá ồn) hay việc nội bộ tạo trực tiếp trong `admin.html`.

**Fix:** thêm `_notifyZaloContentOrder()` trong `admin.html` (cùng cơ chế/token Smax.ai với `order.html`), gắn vào đúng điểm `_mirrorOrderToSheet()` xác nhận 1 order **mới lần đầu** (tái dùng cơ chế chống trùng có sẵn qua `_sheetOrderIds`, dùng chung mọi máy/trình duyệt — xem Task #80) — không cần dựng thêm cơ chế phát hiện "mới" riêng. Chỉ kích hoạt khi `order._fromContentOrder === true`.

**Lưu ý:** tính năng chỉ chạy được khi đồng bộ Content thành công — phụ thuộc trực tiếp vào Task #106 bên dưới.

---

### Task #106 — Trang Content bị lỗi hiển thị, chuyển hạ tầng từ Supabase sang Cloudflare KV — cập nhật đồng bộ theo + vá lỗi font dữ liệu Khánh Huyền

**Câu hỏi:** "Công việc từ trang content bị lỗi à" — tổng số công việc hiển thị tụt mạnh (còn 9, toàn dòng test cũ) dù đơn GAS vẫn bình thường.

**Nguyên nhân gốc (giai đoạn 1):** kiểm tra network thấy toàn bộ request gọi Supabase (`*.supabase.co/rest/v1/plan_data`) trả về **HTTP 402 — Payment Required**, tức project Supabase miễn phí đã **vượt hạn mức** (nghi vấn chính: ảnh dán/tải lên lưu thẳng dạng base64 trong cùng khối JSON, bị `admin.html`/`tracker.html` tải lại TOÀN BỘ định kỳ mỗi 90-120 giây/tab suốt cả ngày — egress cộng dồn rất nhanh). Đã báo cáo, đề xuất hướng khắc phục miễn phí (giãn chu kỳ polling, dừng polling khi tab ẩn, chuyển ảnh sang Supabase Storage) nhưng CHƯA thực hiện vì chờ quyết định.

**Chuyển hướng bất ngờ:** người dùng báo "trang content hoạt động rồi" — kiểm tra lại thấy Supabase **vẫn đang lỗi 402 y hệt**, nhưng trang Content (`content-marketing.pages.dev`) đã tải được bình thường. Soi network mới phát hiện: **trang Content đã tự chuyển hẳn hạ tầng dữ liệu sang Cloudflare Pages Functions** (`/api/kv?id=...`, `/api/img?id=...`, lưu ở Cloudflare KV) — không còn gọi Supabase nữa (0/93 request tới supabase.co). File nguồn `Content-Da-kenh-1-file.html` (đọc lại) xác nhận đúng: `API_BASE='https://content-marketing.pages.dev/api/kv'`, không còn `SUPABASE_URL`/`SUPABASE_ANON_KEY`.

**Hệ quả với QLCV:** `admin.html`/`tracker.html` vẫn gọi thẳng Supabase cũ để lấy Lịch Content — nghĩa là dù Supabase có được mở lại hay không, **sẽ KHÔNG BAO GIỜ thấy dữ liệu Content mới nữa** vì trang Content không còn ghi vào đó.

**Fix:** đổi toàn bộ nơi gọi Content (`_loadContentChannels`/`_loadContentTasks`/`_loadContentOrders`/`_writeBackContentOrder`/`_writeBackContentTask`, cả 2 file `admin.html` và `tracker.html`) từ Supabase REST (`*.supabase.co/rest/v1/plan_data?id=eq.X&select=value`, cần header `apikey`+`Authorization`) sang Cloudflare KV (`content-marketing.pages.dev/api/kv?id=X`, không cần khoá). Format response `{value:...}` và tên key (`content-plan-tasks-v2--<board>`...) giữ nguyên y hệt nên đổi gọn, đã xác nhận trực tiếp qua gọi API thật. Xoá luôn đoạn tự-test quyền ghi Supabase cũ (không còn ý nghĩa với backend mới).

**Phát hiện thêm — lỗi font "double UTF-8":** dữ liệu board **Khánh Huyền** hiện chữ lỗi kiểu `ÄÃ£ ÄÄng` thay vì "Đã đăng" (board Kim Oanh không bị). Xác nhận qua browser thật (không phải do công cụ debug — PowerShell tự nó cũng có vấn đề encoding riêng gây nhiễu chẩn đoán ban đầu, phải loại trừ). Theo yêu cầu "xử lý tại trang của mình, không đụng vào trang content" — thêm `_looksMojibake()`/`_fixMojibakeText()`/`_parseContentJSON()` (đồng bộ cả 2 file) tự phát hiện + vá lỗi CHỈ khi hiển thị, không ghi ngược gì về Content. Dấu hiệu nhận biết: dải ký hiệu Latin-1 Supplement `U+00A1-U+00BF` (¡-¿) — đại diện continuation-byte UTF-8 bị đọc nhầm Latin-1, không bao giờ xuất hiện trong văn bản bình thường. **Không được dùng ký tự Ã/Â để dò** — tự kiểm chứng cách đó báo sai tràn lan vì Ã/Â là chữ cái tiếng Việt hợp lệ (ã, â), suýt vá nhầm cả dữ liệu Kim Oanh vốn đúng. Có thêm lớp an toàn `_parseContentJSON()`: nếu bản đã vá làm hỏng cấu trúc JSON (ký tự điều khiển lọt vào chuỗi — gặp thực tế ở `content-plan-orders-v1--khanh-huyen`) thì quay về bản gốc thay vì crash cả lượt tải.

**Xác nhận bằng dữ liệu thật:** gọi trực tiếp cả 6 tổ hợp (channels/tasks/orders × 2 board) qua Node — Kim Oanh không bị đụng vào (giữ nguyên đúng), Khánh Huyền từ chuỗi lỗi font sửa thành tiếng Việt đọc được bình thường ("Đã đăng", nội dung bài viết mạch lạc). Tổng số công việc trên tracker.html tăng lại từ 9 lên 54, đúng dữ liệu Lịch Content thật.

---

### Task #107 — Lỗi đăng nhập do URL GAS cũ bị lưu đè trong localStorage

**Triệu chứng:** màn đăng nhập báo `Lỗi kết nối: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.

**Nguyên nhân:** `admin.html` có tính năng cho phép ghi đè URL GAS qua ô Cài đặt, lưu vào `localStorage` (`midu_mkt_gas_url`) — ưu tiên cao hơn hằng số `DEFAULT_GAS` trong code. Trong đợt debug Zalo trước đó (URL deployment đổi nhiều lần), giá trị này bị lưu đè bằng 1 URL deployment cũ nay đã chết, khiến request POST `loginUser` nhận về trang lỗi HTML của Google thay vì JSON — dù `DEFAULT_GAS` trong code hiện tại đã đúng và hoạt động tốt (xác nhận qua gọi thẳng bằng PowerShell, trả JSON hợp lệ).

**Fix (không phải sửa code — sửa dữ liệu trình duyệt người dùng):** hướng dẫn xoá key `midu_mkt_gas_url` khỏi `localStorage` qua Console (F12) hoặc tab Application/Storage của DevTools, tải lại trang. Không cần đăng nhập trước để làm bước này (đây chính là lý do vô hiệu hoá luôn cả settings UI vốn dùng để tự sửa URL).

**Xác nhận:** đăng nhập lại thành công sau khi xoá key.

---

### Task #108 — Tối ưu tốc độ tải trang + fix phiên đăng nhập không dùng lại được khi bấm link từ Zalo

**Yêu cầu:** "Xem lại tốc độ load trang" + "bấm từ link xem chi tiết ở Zalo k vào được luôn đầu việc, bắt đăng nhập admin dù trình duyệt đang đăng nhập sẵn rồi".

**Tốc độ tải — 2 điểm sửa (đồng bộ cả `admin.html`/`tracker.html`):**
1. `_loadLichTT()`/`loadLichTT()` (qua GAS, chậm — giống `getOrders`) trước đây bị gộp chung `Promise.all` với các lời gọi Content (Cloudflare KV, nhanh) — khiến lần hiển thị đầu tiên bị kẹt chờ GAS xong mới hiện, dù comment code sẵn có đã ghi rõ ý định để GAS chạy nền không chặn render. Tách riêng, chạy song song với `getOrders`/`getFormSchema`, gộp kết quả ở bước chờ GAS phía sau.
2. `render()` gọi hàm sắp xếp (`sorted()`/`sortedList()`) 2 lần liên tiếp trên cùng 1 tập dữ liệu — lần đầu chỉ để kiểm tra rỗng hay không rồi bị sắp xếp lại ngay lần 2 (`allMixed`, quyết định thứ tự hiển thị cuối). Bỏ lần sort đầu (không ảnh hưởng kết quả hiển thị, giảm 1 nửa chi phí `_isRealProject()` vốn chạy O(n) cho từng phần tử).

**Bấm link Zalo bắt đăng nhập lại — nguyên nhân thật:** phiên đăng nhập lưu ở `sessionStorage` — chỉ sống trong **đúng 1 tab trình duyệt**, không chia sẻ được sang tab mới dù cùng trình duyệt, cùng máy, cùng đang đăng nhập ở tab khác. Bấm link "Xem chi tiết" từ tin nhắn Zalo luôn mở 1 tab mới → tab đó luôn coi như chưa đăng nhập. Mâu thuẫn trực tiếp với thiết kế phiên có hạn 7 ngày phía server (Sessions sheet, Task #2-3) — `sessionStorage` còn tự mất khi đóng hẳn trình duyệt, phá luôn ý nghĩa "7 ngày" đó.

**Fix:** đổi toàn bộ `sessionStorage` → `localStorage` cho việc lưu phiên đăng nhập (`_saveSession()`, `restoreSession()`, `doLogout()`). Tiện thể sửa 1 lỗi liên quan phát hiện được: chỗ tự sửa hồ sơ cá nhân (User Management) đang lưu session sai định dạng (thiếu bọc `{user, token}`), sẽ làm hỏng phiên ở lần tải trang kế tiếp — đổi sang gọi đúng `_saveSession()`.

**Lưu ý vận hành:** đổi loại bộ nhớ lưu trữ nên mọi người cần đăng nhập lại 1 lần cuối sau khi bản này lên — từ đó phiên tự chia sẻ đúng giữa mọi tab, bấm link Zalo vào thẳng không cần đăng nhập lại (trong hạn 7 ngày).

---

### Task #109 — Dọn dữ liệu test (chưa hoàn tất — cần admin tự xoá)

**Yêu cầu:** "xóa hết công việc test cho anh nhé", đi kèm câu hỏi trước đó về tốc độ tải trang.

**Đã làm:** dò qua `getOrders` (GAS), lọc theo người gửi `Claude Test N` — tìm đúng 9 dòng test còn sót từ đợt debug Zalo (Task #101), toàn bộ đã tự gắn nhãn "[TEST]"/"có thể xoá" ngay từ lúc tạo:

| ID | Loại | Tên |
|---|---|---|
| KH-260806-153032 | Khác | [TEST] Kiểm tra thông báo Zalo |
| KH-260806-155254 | Khác | [TEST 2] Kiem tra lai thong bao Zalo |
| KH-260806-155547 | Khác | [TEST 2] Kiem tra lai thong bao Zalo (trùng) |
| KH-260806-164851 | Khác | [TEST 3] Test tren deployment moi |
| CT-260806-170215 | Content | [TEST 5] Kiem tra lai sau khi sua thongtinlead |
| MD-260806-171553 | Media | [TEST 6] Kiem tra URL dang live |
| KH-260806-172139 | Khác | [TEST 7] Debug Zalo |
| AD-260806-172438 | Chạy Ads | [TEST 8] Sau khi chay _testAuthExternalRequest |
| KH-260806-173630 | Khác | [TEST 10] Test lai URL that |

**Vì sao chưa xoá được:** action `deleteOrder` (GAS) bắt buộc có session token hợp lệ + quyền `canDelete` (chỉ admin) — theo đúng nguyên tắc đã thống nhất từ đầu buổi, không tự nhập mật khẩu/đăng nhập thay người dùng, nên không tự tạo được token để gọi API xoá. Người dùng tự xoá qua giao diện: gõ "TEST" vào ô tìm kiếm tab Danh sách → lọc đúng 9 dòng trên → bấm 🗑️ Xoá từng dòng.

---

### Task #110 — Go-live: dọn backend GAS vào git, đổi group Zalo, rà công việc trễ, viết hướng dẫn dùng

**Ghi lại `MIDU_MKT_Script.gs` vào git:** file này có 304 dòng thay đổi (session token + phân quyền theo vai trò qua sheet Sessions/Roles, xem Task #1-6 và fix hiển thị giờ Task #102) đã áp dụng thật trên GAS live từ trước nhưng chưa từng commit — không có lịch sử/backup qua git cho phần backend. Đã commit nguyên trạng, không đổi gì đang chạy.

**Đổi group Zalo nhận thông báo:** theo yêu cầu, đổi `ZALO_NOTIFY_CUSTOMER_ID` (Smax.ai) sang customer id mới `zlw1390913189117079730` — áp dụng cho cả `order.html` (order nộp qua form công khai) và `admin.html` (order tab "Order" trang Content, Task #105).

**Rà công việc đang trễ hạn — không phải bug:** kiểm tra qua API thật (loại trừ đúng các dòng "Sao lưu" mirror trong sheet Orders — dò ẩu ban đầu ra 134 dòng "trễ" toàn là trùng lặp mirror, sau khi lọc đúng còn **0 đơn GAS trễ, 0 bài Lịch Content trễ, 5 order tab "Order" (đều board Kim Oanh) trễ thật**. Kiểm tra chi tiết từng dòng (không chỉ trạng thái, cả `deliverableLink`) xác nhận cả 5 đều **chưa có kết quả nộp** — không phải lỗi đồng bộ hay hiển thị sai, mà là công việc thật sự đang đọng bên phía người phụ trách (Lê Ngọc Huy, Bùi Thành An, Đỗ Thùy Linh), cần nhắc trực tiếp.

**Thêm "Người phụ trách" vào tin Zalo cho Order Content:** order từ tab "Order" trang Content thường đã chọn sẵn người phụ trách ngay lúc tạo (field `person` bên Content, khác với order.html — chưa có ai lúc mới gửi). Thêm dòng `Người phụ trách: ...` vào `_notifyZaloContentOrder()` (đọc từ `order.assignedTo`), các dòng khác trong tin giữ nguyên không đổi.

**Viết thông báo + hướng dẫn sử dụng cho toàn team** (gửi thẳng qua chat, không lưu file riêng) — gồm 3 link chính (order.html/tracker.html/admin.html), cách gửi yêu cầu, cách xem tiến độ, cách đăng nhập admin cập nhật kết quả, và lưu ý vận hành lúc mới go-live (hard refresh 1 lần, đăng nhập lại 1 lần do đổi sessionStorage→localStorage, mở bằng trình duyệt ngoài nếu bấm link Zalo mà bị bắt đăng nhập lại).

**Quy tắc tài khoản (nhắc lại cho rõ, không phải thay đổi mới):** mật khẩu mặc định `Midu123!` khi tạo tài khoản mới (Task #82), tên đăng nhập theo mẫu *tên gọi thường ngày + họ*, viết thường không dấu không khoảng trắng (VD Lê Ngọc Huy → `huyle`). Danh sách đầy đủ ai username gì xem trực tiếp ở admin.html → Cài đặt → Quản lý người dùng (không lưu trong tài liệu này).

---

### Task #111 — Nhân viên không đăng xuất được: thêm nút Đăng xuất cho mọi vai trò

**Phản hồi thực tế sau go-live:** "cần thêm nút đăng xuất vào admin".

**Nguyên nhân:** nút Đăng xuất trước đây chỉ nằm trong màn Cài đặt, mà Cài đặt gắn `data-admin-only` — chỉ hiện khi `canSettings=true`, mà theo `PERM_LEVELS` chỉ **admin** có quyền này (`leader`/`employee` đều `canSettings:false`). Leader/employee vì vậy không có cách nào đăng xuất qua giao diện suốt từ lúc hệ thống có tính năng đăng nhập.

**Fix:** thêm nút 🚪 riêng ngay trong header, không gắn `data-admin-only`, hiện cho mọi vai trò.

**Chỉnh lại theo phản hồi tiếp theo — "chưa đẹp, vị trí chưa hợp lý":** ban đầu đặt ngay cạnh nút đổi mật khẩu (giữa luồng thao tác chính, dễ bấm nhầm). Chuyển ra **cuối hàng header**, thêm viền ngăn cách + tô màu đỏ nhạt + hiện chữ "Đăng xuất" thay vì chỉ icon, để tách biệt rõ khỏi các nút thao tác thường dùng.

---

### Task #112 — Nhân viên đăng nhập được nhưng không thấy việc: đổi logic hiển thị Content Order/Task theo người phụ trách

**Phản hồi thực tế:** tài khoản nhân viên (Đặng Ngọc Huy) báo "không vào được" (lỗi *Sai tên đăng nhập hoặc mật khẩu*) — rà code (client `doLogin()` + server `loginUserData()`/`hashPw()`) không thấy lỗi logic nào, kết luận là vấn đề dữ liệu tài khoản (username/mật khẩu lưu không khớp, hoặc tài khoản chưa kích hoạt) chứ không phải bug — **người dùng tự vào Quản lý người dùng sửa tay là xong**, xác nhận đúng giả thuyết.

**Vào được thì báo "chưa có công việc"** dù admin thấy có: kiểm tra dữ liệu thật phát hiện đơn GAS thường chỉ có đúng 1 dòng có gán người phụ trách trong toàn hệ thống — phần lớn khối lượng việc thật nằm ở Content Order/Content Task, mà 2 loại này **trước đây cố ý cho cả team nhìn thấy hết**, không lọc theo người phụ trách (nhóm Content tự quản lý riêng).

**Quyết định đổi hành vi:** "xử lý công việc từ trang content theo logic từ trang order nhé, người phụ trách là ai công việc sẽ hiển thị vào trang admin của nhân viên đó" — đổi `getFilteredRows()`: `contentOrders`/`contentTasks` giờ cũng lọc qua `_isAssignedToMe()` cho nhân viên (`viewAll:false`), giống hệt đơn GAS/Internal Task. Admin/leader (`viewAll:true`) không đổi gì, vẫn xem toàn bộ.

**Lưu ý chất lượng dữ liệu phát hiện kèm theo:** Content Order dùng field `person` (tên đầy đủ, VD "Bùi Thành An") khớp tốt với tên tài khoản. Content Task dùng field `coord` — khảo sát thực tế thấy nhiều giá trị viết tắt/không chuẩn (VD "A Huy thiết kế", "Huy AI") **không khớp chính xác** tên tài khoản đầy đủ — nhân viên có thể vẫn thiếu 1 số bài Lịch Content dù đã được phân công thật, cần chuẩn hoá lại cách ghi tên phụ trách bên trang Content mới khớp hoàn toàn (ngoài phạm vi sửa được ở QLCV).

**Xác nhận bằng dữ liệu thật:** order VA-260818-002 (Content Order, board Khánh Huyền) có `person:"Đặng Ngọc Huy"` khớp chính xác 13 ký tự, không khoảng trắng thừa — xác nhận sẽ hiển thị đúng sau khi fix có hiệu lực.

---

### Task #113 — Tối ưu tốc độ tải trang lần 2 + vá lỗ hổng nuốt lỗi im lặng

**Phản hồi:** "Cải thiện tốc độ load trang nhé", sau đó "Hơi chậm", rồi "Vẫn đứng hình mất khoảng 5s khi load lại trang" kèm ảnh chụp trang trắng hoàn toàn (chip lọc rỗng, số liệu "–", không cả spinner "Đang tải...").

**Nghi vấn ban đầu (không xác nhận được — trình duyệt tự động lỗi, không live-debug được):** trạng thái trong ảnh trùng khớp với kịch bản 1 lỗi JS bị nuốt âm thầm bởi `catch(e){}` rỗng — rà code phát hiện đúng 2 chỗ như vậy trong `showCached()` và lần render cuối của `loadAll()` (chỉ 1/3 chỗ tương tự có sẵn `console.error`). Thêm log lỗi vào cả 2 cho nhất quán, dù chưa xác nhận được đây có phải nguyên nhân thật hay không.

**Fix tốc độ thật sự (không liên quan lỗi nuốt log ở trên):** `_loadContentChannels()`/`_loadContentTasks()`/`_loadContentOrders()` (Cloudflare KV) trước đây chờ Channels tải xong HẲN mới bắt đầu Tasks/Orders — dù Tasks/Orders chỉ cần dữ liệu Channels ở đúng 1 bước cuối (map tên kênh), không phải toàn bộ quá trình fetch. Đổi sang chạy cả 3 song song ngay từ đầu, Tasks (và Content Orders bên tracker.html) tự `await` promise Channels **chỉ ngay trước dòng cần dùng**, không delay fetch của chính nó. Áp dụng ở `loadAll()`/`_autoSyncContent()`/`_periodicContentSync()` (admin.html) và `loadOrders()` (tracker.html).

**Kết quả xác nhận qua ảnh chụp thật + console (F12):** trang tải nhanh hơn, sau ~5 giây vào dữ liệu bình thường (78 đơn, đúng số liệu), console sạch — chỉ có đúng cảnh báo Tailwind CDN đã biết từ trước, không có lỗi đỏ nào. Kết luận ~5 giây đó là thời gian tải dữ liệu thật (Cloudflare KV + GAS) chứ không phải bug/treo.

---

### Task #114 — Đồng bộ bộ lọc Kỳ ở Báo cáo, thêm % vào các bảng, thêm bộ lọc Người phụ trách

**Yêu cầu:** "Trong màn báo cáo bộ lọc cũng thế nhé, và trong báo cáo tất cả cần có số lượng công việc và tỉ lệ % đi kèm, riêng trong admin có bộ lọc theo người phụ trách với những vai trò xem được tất cả công việc."

**Bộ lọc Kỳ ở tab Báo cáo:** hoá ra đã đồng bộ sẵn từ Task #113 (bộ lọc Kỳ ở tab Báo cáo dùng chung khối HTML với tab Danh sách đã sửa) — ảnh chụp anh gửi là do trang chưa tải lại bản mới (cache cũ), không phải chưa sửa. Không cần code thêm, chỉ cần hard refresh.

**Thêm % vào báo cáo:** 3/4 bảng trong "Phân tích chi tiết" (Theo loại order, Theo phòng ban, Theo người phụ trách) trước đây chỉ có số lượng, không có % — chỉ riêng "Theo trạng thái" có sẵn cột %. Thêm cột % cho cả 3 bảng còn lại, tính chung 1 mẫu số `reportOrders.length` cho toàn bộ 4 bảng để nhất quán.

**Bộ lọc "Phụ trách":** thêm hàng lọc mới (dạng chip, cùng kiểu với Phòng ban/Loại/Trạng thái) vào tab Danh sách — nhưng **chỉ hiện cho vai trò xem được tất cả** (admin/leader, `perm().viewAll`), ẩn hoàn toàn với nhân viên qua thuộc tính mới `data-viewall-only` + `applyRoleUI()` — nhân viên đã tự động chỉ thấy đúng việc của mình từ Task #112, lọc thêm theo người phụ trách sẽ vô nghĩa/gây rối cho họ. Danh sách tên lấy từ `getAssignableUsers()` (đã có sẵn, dùng chung với ô Phân công khi tạo/sửa việc). Lọc qua hàm mới `_hasAssignee()`, dùng chung `_normAssignee()` (bảng alias tên viết tắt bên Content Task, đã có sẵn cho báo cáo từ trước) để khớp đúng tên tài khoản đầy đủ dù dữ liệu gốc ghi tắt.

---

### Task #115 — Gọn bộ lọc tracker.html + tab "Order đã gửi" trong admin.html (xem + sửa giới hạn)

**Câu hỏi mở đầu:** trao đổi về việc order do chính nhân sự trong phòng tự gửi thì có hiện trong admin.html của người gửi không — xác nhận: chỉ hiện ở tracker.html (public, tra theo mã/từ khoá), KHÔNG hiện ở admin.html của người gửi (trừ khi họ cũng là người phụ trách) — vì sau Task #112, admin.html là "việc tôi cần làm", không phải "việc tôi đã yêu cầu". Tư vấn: đây là thiết kế hợp lý nên giữ, đề xuất thêm 1 tab riêng nếu muốn xem "đơn tôi đã gửi" ngay trong admin.html.

**Nhân tiện — phản hồi tracker.html "khó tìm, hơi loạn":** chẩn đoán đúng nguyên nhân: 4 hàng bộ lọc (Kỳ/Phòng ban/Loại/Trạng thái, ~30+ nút/chip) hiện HẾT cùng lúc, ngợp mắt trước cả khi thấy công việc nào.

**Fix tracker.html:** đưa ô Tìm kiếm lên đầu, nổi bật (đa số người vào tracker để tra 1 đơn cụ thể qua mã/link Zalo, không phải duyệt hết). Gộp Phòng ban/Loại/Trạng thái/"Ẩn hoàn thành" vào khối `#filter-detail` đóng mặc định, bấm nút "🔍 Bộ lọc chi tiết" mới bung ra (`toggleFilterDetail()`). Riêng Kỳ giữ hiện sẵn vì hay dùng nhất. Tự bung `filter-detail` nếu đang có bộ lọc phòng ban áp sẵn từ URL (`?dept=...`) để không giấu mất đang lọc theo gì.

**Thêm tab "📤 Order đã gửi" (admin.html), hiện cho MỌI vai trò:** liệt kê đơn (order.html) có "Người gửi" khớp tên tài khoản đang đăng nhập (`_isMyRequest()`, so khớp trực tiếp với `currentUser.displayName` — có cùng hạn chế lệch tên như `_isAssignedToMe()`/Task #112 vì "Người gửi" là ô nhập tự do, order.html không bắt buộc đăng nhập), bất kể ai đang phụ trách xử lý. Mỗi thẻ hiện mã đơn/loại/trạng thái/ngày gửi/deadline/người phụ trách/link kết quả — **chỉ xem**, không có nút đổi Trạng thái/Phân công/Link kết quả (không phải việc của người gửi).

**Cho sửa lại khi CHƯA có ai nhận:** đơn còn trạng thái "Chưa làm" mới có nút "✏️ Sửa yêu cầu", mở modal riêng gọn (`sent-edit-modal`, tách hẳn khỏi modal Sửa Order đầy đủ để không lỡ lộ trường Trạng thái/Phân công) — chỉ sửa được tên dự án/deadline/giờ deadline/độ ưu tiên/mô tả. Quyết định theo trao đổi: khoá sửa ngay khi có người nhận, tránh sửa "sau lưng" người đang xử lý gây lệch thông tin; đơn đã có người nhận hiện gợi ý liên hệ trực tiếp thay vì cho sửa ngầm.

**Lưu ý bảo mật đã nói rõ với người dùng:** giới hạn "chỉ sửa được khi chưa có ai nhận, chỉ vài trường" là **rào chắn phía giao diện**, chưa phải chặn ở server — action `updateOrder` (GAS) hiện không tách quyền theo từng người gọi, về mặt kỹ thuật ai có token hợp lệ cũng gọi thẳng API sửa đơn khác được. Chấp nhận rủi ro này giống các tính năng nội bộ khác trong hệ thống, chưa làm chặt hơn trừ khi được yêu cầu.

---

### Task #116 — Link tracker.html riêng cho từng phòng ban, gợi ý tự tìm, tạo skill lưu tài liệu

**Câu hỏi:** phòng ban khác có cần tạo tài khoản để xem tracker không → xác nhận KHÔNG cần: tracker.html vốn không cần đăng nhập, ô tìm kiếm đã hỗ trợ sẵn tra theo tên người gửi/phòng ban/mã đơn.

**Yêu cầu:** "làm sẵn link tự lọc theo phòng ban nhé, mỗi phòng ban sẽ có 1 link riêng còn tracker kia vẫn là chung". Lấy đúng danh sách 7 phòng ban thật qua GAS `getFormSchema` (không đoán từ ảnh chụp cũ): Phòng CSKH, Phòng Kế toán, Phòng HCNS, Phòng Vận hành, Phòng Marketing – Truyền thông, Ban Đào tạo, Ban Chuyên môn. Dùng cơ chế `?dept=...` có sẵn từ trước để tạo 7 link riêng.

**"Có thể lưu theo tên không dấu không, trông xấu quá"** — link ban đầu bị URL-encode ra chuỗi `%C3%B2ng...` dài xấu khó gửi tay. Nâng cấp `normDept()` (đồng bộ cả `tracker.html`/`admin.html`): bỏ thêm tiền tố "Ban " (trước chỉ bỏ "Phòng "), coi gạch ngang (`-`, en-dash, em-dash) như khoảng trắng, áp `normVN()` (bỏ dấu, về thường) trước khi so khớp. Nhờ vậy dùng được link gọn kiểu `?dept=cskh`, `?dept=ke-toan`, `?dept=marketing-truyen-thong`... — đã viết script đối chiếu cả 7 phòng ban thật, khớp đúng 100% trước khi push.

**"Cần có gợi ý gì ở màn tracker cho các phòng ban tự tìm được không"** — sau khi gộp Phòng ban vào khối "Bộ lọc chi tiết" đóng mặc định (Task #115), lo người lần đầu vào (đặc biệt phòng ban khác) không biết còn lọc được theo phòng mình. Thêm 1 dòng gợi ý ngắn ngay dưới ô tìm kiếm: gõ tên mình để tìm nhanh, hoặc bấm "Bộ lọc chi tiết" chọn đúng Phòng ban.

**"Làm cái skill lưu tài liệu cho anh nhé"** — tạo skill project-scoped `.claude/skills/luu-tai-lieu/SKILL.md`, mô tả đúng quy trình đã lặp lại thủ công suốt cả phiên: đọc tài liệu tìm số Task lớn nhất, viết entry mới theo đúng format (Yêu cầu/Nguyên nhân/Fix/Xác nhận, trích nguyên văn yêu cầu người dùng khi có thể), chèn trước "Liên kết nhanh", commit bằng PowerShell heredoc `@'...'@` (tránh lỗi dấu ngoặc kép trong `-m "..."` từng làm hỏng lệnh git nhiều lần trong phiên này), rồi push. Skill mới tạo cần phiên làm việc mới mới được nạp — lần này vẫn làm thủ công đúng theo các bước đó.

---

### Task #117 — Đồng bộ nút "Mở bài gốc", hoàn thiện tab "Order đã gửi", fix lặp tin Zalo

**"Sao nút dẫn sang trang content của 2 công việc lại khác nhau, đồng bộ lại 1 nơi cho anh"** — phát hiện đúng: card Content Order đặt nút trong hàng nút chung (cạnh "Xem chi tiết"), card Content Task (Lịch Content) lại tách riêng thành 1 thanh ở đáy card kèm dòng "🔄 Tự đồng bộ từ..." — thông tin đó thật ra đã trùng với "Tạo bởi"/"Người thực hiện" hiện sẵn phía trên. Gộp về 1 kiểu: nằm trong hàng nút chung, nhãn thống nhất "↗ Mở bài gốc trên Lịch Content", bỏ dòng trùng lặp — áp dụng cả admin.html và tracker.html.

**"Chưa thấy nút sửa khi chưa có người phân công" + "cho xem lại nội dung order đi em" (tab Order đã gửi):** 2 vấn đề riêng biệt được sửa cùng lúc:
- Card trước chỉ hiện tóm tắt (loại/trạng thái/deadline/phụ trách/link kết quả), thiếu nội dung brief thật (mô tả/kích thước/kịch bản/link tham khảo...) — dùng lại đúng logic `detHTML` của `renderCard()` để hiện đầy đủ, giống tracker.html đã làm cho đơn thường từ trước.
- Điều kiện hiện nút "✏️ Sửa yêu cầu" trước kiểm tra `status==='chua-lam'`, đổi sang kiểm tra thẳng `assignedTo` có rỗng không — đúng nghĩa đen "chưa có người phân công", không phụ thuộc suy diễn qua trạng thái.

**"Tất cả nội dung nhập từ order khi xem lại và sửa thì đều lưu và hiện hết ra, trong admin cũng thế"** — modal "Sửa yêu cầu" trước chỉ có 5 trường cố định (tên dự án/deadline/giờ deadline/độ ưu tiên/mô tả), thiếu hẳn các trường riêng theo loại việc. Thêm khu vực sinh động `#se-dynamic` dùng đúng `formSchema[type]`, cùng cơ chế với modal Sửa Order chính (`#e-dynamic`) — giờ sửa được đầy đủ mọi trường đã nhập lúc gửi. Đã kiểm tra: `clientNote` là field cũ order.html không còn dùng (bỏ qua), `projectCode` là field ẩn không phải người gửi tự nhập (không thêm vào).

**"Bị lặp tin thông báo này" (2 tin Zalo giống hệt, cách nhau 1 giây, cùng mã đơn):** nguyên nhân gốc — `addOrderData()` (GAS) không kiểm tra ID đã tồn tại trước khi `appendRow`, nên 2 trình duyệt cùng đồng bộ 1 order Content mới gần như đồng thời (VD 2 tab admin.html) đều "tưởng" order đó chưa từng ghi, cả 2 cùng ghi thành công (có thể ra 2 dòng trùng ID trong sheet) và cùng bắn thông báo. Fix 2 lớp:
- **GAS:** thêm `LockService` khoá tạm lúc kiểm tra+ghi, kiểm tra ID đã có dòng chưa trước khi `appendRow` — đã có thì trả `isNew:false` thay vì ghi thêm dòng (idempotent, chặn luôn cả lỗi ghi trùng dòng trong sheet).
- **admin.html:** `_mirrorOrderToSheet()` chỉ gọi `_notifyZaloContentOrder()` khi `data.isNew!==false` — tương thích ngược, GAS bản cũ (chưa deploy lại) không trả `isNew` vẫn coi là mới như trước, chỉ hết lỗi hẳn sau khi deploy lại GAS.

**Lưu ý vận hành:** phần fix GAS (chặn ghi trùng dòng + `isNew`) cần deploy lại Apps Script thủ công mới có hiệu lực đầy đủ — trước khi deploy, khả năng thấp vẫn có thể lặp tin nếu đúng lúc 2 tab cùng đua nhau.

---

### Task #118 — Fix giao diện chip "Phụ trách" + mở rộng ô tìm kiếm ở admin.html; nhắc quên push code

**Yêu cầu:** "Trong admin xem lại giao diện chỗ này, người phụ trách hiển thị xấu, chưa đều đẹp, ô tìm kiếm cần to rọng như tracker" (kèm ảnh chụp khu vực bộ lọc "Phụ trách" + ô tìm kiếm).

**Nguyên nhân/Phát hiện:** `buildAssigneeChips()` (admin.html) tạo chip theo đúng thứ tự trong `getAssignableUsers()` — tức thứ tự tạo tài khoản, không sắp xếp — nên chip tên dài/ngắn xen kẽ ngẫu nhiên, dòng chip so le trông lộn xộn. Ô tìm kiếm `#f-kw` (Row 5, tab Danh sách) đang bị giới hạn cứng `max-width:320px`, hẹp hơn hẳn ô tìm kiếm cùng vị trí bên tracker.html.

**Fix:** `buildAssigneeChips()` sắp tên theo abc tiếng Việt (`.sort((a,b)=>a.localeCompare(b,'vi'))`) trước khi tạo chip. Đổi style `#f-kw` từ `width:100%;max-width:320px` sang `flex:1;min-width:240px;font-size:.85rem;padding:9px 14px` — khớp đúng style ô tìm kiếm tracker.html.

**Xác nhận/Lưu ý:** Sau khi sửa xong, người dùng test thấy "Admin chưa được, tracker thì được" — hoá ra do quên `git commit`/`push` sau khi sửa file, bản online (GitHub Pages) vẫn là code cũ. Đã commit + push riêng (`e289a10`). Việc "link riêng theo phòng ban" ở tracker.html (Task #116) người dùng phản ánh vẫn khó tìm ("Vào tracker vẫn chưa biết lấy link riêng của phòng ở đâu") — đã xác nhận code hint/copy-link đã lên bản live đúng (kiểm qua `curl` trực tiếp trang deploy), nhưng flow hiện tại yêu cầu mở "Bộ lọc chi tiết" rồi chọn đúng 1 phòng mới hiện link — quá ẩn với người lần đầu vào, **chưa fix xong**, cần làm 1 UI dễ thấy hơn (không phụ thuộc mở bộ lọc/chọn chip) ở phiên sau.

---

### Task #119 — Fix tiếp Task #118: link riêng theo phòng ban ở tracker.html vẫn không ai tìm ra

**Yêu cầu:** "Ok làm đi em" (đồng ý làm tiếp phần link phòng ban còn tồn đọng từ Task #118).

**Nguyên nhân/Phát hiện:** Cơ chế cũ (Task #116) đặt link+nút copy (`#dept-link-hint`) nằm lồng bên trong khối "Bộ lọc chi tiết" — vốn đóng mặc định — và chỉ hiện lên sau khi bấm đúng 1 chip Phòng ban cụ thể. Người lần đầu vào tracker không có lý do gì để thực hiện đủ 2 bước đó trước, nên tính năng tồn tại đúng nhưng gần như không ai thấy.

**Fix:** Thêm hẳn 1 khối luôn hiện sẵn ngay dưới ô tìm kiếm (không nằm trong "Bộ lọc chi tiết", không cần mở panel): dropdown `#dept-link-select` liệt kê các phòng ban, chọn xong hiện ngay link + nút "📋 Copy" tại `#dept-link-out`. Dropdown dùng chung biến `deptFilter` với chip lọc cũ trong panel (hàm `onDeptLinkSelect()` gọi lại đúng `buildDeptChips()`), nên chọn ở dropdown hay ở chip đều đồng bộ 2 chiều — vừa lọc danh sách vừa cho link, không tạo 2 nguồn sự thật riêng biệt. Bỏ hẳn `#dept-link-hint` cũ (đã lồng trong panel, nay dư thừa).

**Xác nhận/Lưu ý:** Đã test trực tiếp trên trình duyệt (server tĩnh local) trước khi push: chọn phòng ban ở dropdown → link+nút copy hiện đúng định dạng `?dept=<slug>`, đồng thời chip "Phòng ban" trong Bộ lọc chi tiết cũng tự chuyển sang active đúng phòng vừa chọn — xác nhận đồng bộ 2 chiều hoạt động thật, không chỉ đọc code.

---

### Task #120 — Fix tiếp Task #118: nhãn "Phụ trách" vẫn lệch dòng + phát hiện bug leader không thấy đủ tên

**Yêu cầu:** "Vẫn thế mà, cho thẳng hàng với các bộ lọc khác đi em, dài quá thì xuống dòng ở cuối, k xuống dòng ở đầu như thế" — sau đó thêm ảnh chụp cho thấy hàng "Phụ trách" chỉ có "Tất cả" và "Lê Ngọc Huy" ("Bị mất luôn rồi"), rồi "Load phần phụ trách hơi chậm và lần 2 thì k hiện".

**Nguyên nhân/Phát hiện:** 3 lỗi riêng biệt, phát hiện lần lượt:
- Bản sửa trước (mb-2/label-trên-chip-dưới, coi như 1 fix tạm ở Task #118) khiến nhãn LUÔN nằm 1 dòng riêng bất kể có tràn hay không — không giống các hàng lọc khác (label + chip đầu cùng dòng, chỉ chip tràn mới xuống). Nguyên nhân gốc: `#assignee-chips` là 1 `<div class="flex flex-wrap">` LỒNG bên trong flex-wrap của hàng cha — khi đủ nhiều chip (14 tên), trình duyệt đẩy hẳn cái div con xuống dòng dưới thay vì để từng chip tự tràn dòng ở cấp cha.
- Bug thật (không liên quan CSS): tài khoản **leader** chỉ thấy 1-2 tên vì `allUsers` (danh sách nhân sự) chỉ được tải khi `perm().canUserMgmt` — chỉ đúng với admin. Leader có `viewAll:true` (thấy được bộ lọc này) nhưng `canUserMgmt:false` nên `allUsers` không bao giờ được tải, `getAssignableUsers()` rơi về cache `getAssignees()` (localStorage cụt, chỉ vài tên từng thấy).
- Sau khi sửa bug trên, phát sinh race condition: `loadAllUsers()` chạy nền không `await`, còn `buildAssigneeChips()` build ở nhiều mốc trong `loadAll()` — ai xong trước ai là ngẫu nhiên theo tốc độ mạng, nên có lúc hiện đủ có lúc không.

**Fix:**
- Đổi `#assignee-chips` sang `style="display:contents"` — bỏ nó khỏi cây flexbox, để từng nút chip trở thành flex-item NGANG HÀNG trực tiếp với nhãn trong CÙNG 1 flex-wrap của cha, giống hệt cơ chế Phòng ban/Loại/Trạng thái (JS `buildAssigneeChips()` không đổi, vẫn `appendChild` vào đúng div đó).
- `afterLogin()`: đổi điều kiện tải `allUsers` từ `perm().canUserMgmt` sang `perm().viewAll` (bao cả leader).
- Gọi `loadAllUsers().then(buildAssigneeChips)` — vẽ lại chip ngay khi tải xong, không phụ thuộc thứ tự với các lần build khác.

**Xác nhận/Lưu ý:** Đã test trên trình duyệt: label + chip đầu cùng 1 dòng (chênh lệch top vài px do line-height, chip tràn xuống đúng 1 dòng dưới). Bug leader không tải đủ tên là lỗi có từ Task #114 (lúc thêm bộ lọc này), không phải do các lần sửa layout gần đây gây ra — chỉ mới lộ ra vì người dùng test kỹ bằng tài khoản leader.

---

### Task #121 — Đổi nút "Đăng xuất" sang dạng icon tròn (nút nguồn)

**Yêu cầu:** "icon đăng xuất đang đẹp lại thay xấu thế" (khi test bằng leader, nhiều nút admin-only bị ẩn khiến đường viền ngăn cách bên trái nút Đăng xuất đứng lẻ loi) → "icon Đăng xuất là dạng nút nguồn đi em".

**Fix:** Bỏ hẳn kiểu nút chữ có viền ngăn cách (`border-left`) từng dùng ở Task #118 — thay bằng nút icon tròn gọn, cùng kiểu trình bày với 2 nút 🔒 (đổi mật khẩu)/⚙ (cài đặt) bên cạnh, chỉ icon "⏻" (ký hiệu nguồn), tô màu đỏ nhạt để phân biệt là hành động khác nhóm.

**Xác nhận/Lưu ý:** Ngay sau khi push, người dùng báo "Vẫn thế mà" kèm ảnh vẫn thấy nút chữ cũ — kiểm tra qua `curl` trực tiếp bản deploy thì xác nhận đây chỉ là **CDN GitHub Pages cập nhật trễ vài chục giây tới vài phút**, không phải lỗi code — kiểm tra lại ngay sau đó qua `curl` đã thấy đúng bản icon mới. Nhắc để lần sau gặp báo "vẫn như cũ" ngay sau khi vừa push, ưu tiên kiểm tra bằng `curl` bản deploy trước khi nghi code sai.

---

### Task #122 — Chuẩn bị khung nâng cấp thông báo Zalo: nhóm riêng theo phòng ban + thông báo đổi trạng thái

**Yêu cầu:** "Có việc mới là sắp tới anh sẽ nâng cấp hệ thống thông báo về group Zalo: lập các nhóm riêng với các phòng ban, check phòng nào gửi order thì bắn tin về nhóm với phòng đó. Và hiện chỉ thông báo về việc order, sau sẽ thông báo khi chuyển trạng thái nữa, khi chuyển trạng thái feedback, hoàn thành cũng cần thông báo" — sau đó gửi ảnh chụp automation Smax.ai đang dùng (khối "Set Attributes" gán `tgdk`=timestamp, khối "ZaloUser Message" ghép `{tgdk}` + chữ tĩnh "🧑 CÓ ORDER MỚI ANH EM ƠI" + `{thongtinlead}`), kèm yêu cầu: "em có thể thay luôn đoạn text ở đầu không, thì sẽ dùng chung trigger luôn, mỗi nhóm dùng 1 trigger và tự bắn tin theo các trạng thái, đoạn text ở đầu thì trao đổi thêm với anh để chốt".

**Bối cảnh kỹ thuật trước khi sửa:** Toàn bộ thông báo Zalo (order.html lúc gửi order mới, admin.html lúc mirror Content Order) đều gọi thẳng 1 trigger Smax.ai cố định (`SMAX_TRIGGER_URL/TOKEN` + `ZALO_NOTIFY_CUSTOMER_ID/PAGE_ID` hard-code), tức chỉ có đúng 1 đích Zalo duy nhất cho mọi phòng ban, và chưa có thông báo nào khi đổi trạng thái.

**Quyết định thiết kế (đã hỏi và chốt với người dùng qua AskUserQuestion):**
- Làm khung code trước, dùng data rỗng/placeholder — điền dữ liệu thật sau khi có nhóm Zalo, không cần sửa code lúc đó.
- Cấu trúc Smax đã chốt qua ảnh chụp: **mỗi phòng ban 1 automation/trigger riêng** (copy nguyên khối đang có, đổi đích nhóm Zalo) — không phải 1 trigger chung đổi customer/page.
- Tiêu đề tin nhắn (dòng "🧑 CÓ ORDER MỚI ANH EM ƠI") chuyển từ chữ tĩnh bên Smax vào code, để tự đổi theo loại sự kiện — đã thống nhất nội dung: "🆕 CÓ ORDER MỚI ANH EM ƠI" / "💬 ĐÃ CÓ KẾT QUẢ, CHỜ FEEDBACK" / "✅ ĐÃ HOÀN THÀNH".

**Fix/Đã dựng:**
- `ZALO_DEPT_GROUPS` (object, key = tên phòng ban) + `_zaloDestFor(department)` — thêm vào cả admin.html và order.html (2 file tách biệt, không có module dùng chung nên khai báo lặp lại). Phòng nào chưa có trong map thì tự rơi về đúng nhóm chung hiện tại (`SMAX_TRIGGER_URL`/`ZALO_NOTIFY_CUSTOMER_ID` mặc định) — **không đổi hành vi hiện tại cho tới khi điền dữ liệu thật**.
- `_notifyZaloContentOrder()` (admin.html) và `_notifyZaloNewOrder()` (order.html): thêm dòng tiêu đề "🆕 CÓ ORDER MỚI ANH EM ƠI" làm dòng đầu tin nhắn, định tuyến qua `_zaloDestFor(order.department)` thay vì gọi thẳng const cũ.
- `_notifyZaloStatusChange(order, newStatus)` (admin.html, mới) — chỉ bắn cho đúng 2 trạng thái `feedback`/`hoan-thanh`, khoá bằng cờ `ZALO_NOTIFY_STATUS_CHANGE = false` (tắt mặc định). Đã nối vào MỌI nơi đổi trạng thái: `saveRow()` (sửa nhanh trên card), `saveEdit()` (modal sửa), `_updateInternal()` (dùng chung cho Content Order/Content Task/việc nội bộ — 1 điểm chốt duy nhất), và `_autoCompleteFeedback24h()` (tự động hoàn thành sau 24h).

**Xác nhận/Lưu ý:**
- Đã test trên trình duyệt trước khi push: `_zaloDestFor()` trả đúng nhóm mặc định khi phòng chưa cấu hình, trả đúng override khi có cấu hình giả lập; gọi `_notifyZaloStatusChange()` khi cờ đang `false` xác nhận **không có request mạng nào được gửi** (chặn đúng, không sợ bắn nhầm khi test).
- Người dùng xác nhận thêm: hiện tại `ZALO_DEPT_GROUPS` rỗng nên **mọi thông báo order mới vẫn bắn về đúng 1 nhóm chung hiện tại như cũ** — an toàn, chưa đổi gì thật.
- Việc còn lại thuộc phía người dùng, không phải code: (1) xoá dòng chữ tĩnh "🧑 CÓ ORDER MỚI ANH EM ƠI" trong khối ZaloUser Message bên Smax (để không lặp tiêu đề với dòng code mới thêm) khi copy trigger cho từng phòng; (2) tạo xong trigger riêng từng phòng thì gửi `triggerUrl`/`token`/`customerId`/`pageId` để điền vào `ZALO_DEPT_GROUPS` (cả 2 file) và bật `ZALO_NOTIFY_STATUS_CHANGE = true`. Claude không có quyền đăng nhập/sửa trực tiếp giao diện Smax.ai.

---

### Task #123 — Bật thông báo Zalo cho Feedback/Hoàn thành + xác nhận đã xoá tiêu đề tĩnh trùng bên Smax

**Yêu cầu:** "Cho bắn hết về nhóm chung nhé, các feedback và hoàn thành cho đến khi tách nhóm riêng" — sau đó xác nhận đã xoá dòng tĩnh "🧑 CÓ ORDER MỚI ANH EM ƠI" bên khối ZaloUser Message của Smax ("Anh xóa rồi nhé", kèm ảnh chỉ còn `{tgdk}` + `{thongtinlead}`).

**Fix:** Đổi `ZALO_NOTIFY_STATUS_CHANGE` (admin.html) từ `false` sang `true` — mọi lần đổi trạng thái sang `feedback`/`hoan-thanh` giờ bắn tin thật, vẫn về đúng 1 nhóm chung hiện tại (do `ZALO_DEPT_GROUPS` còn rỗng).

**Xác nhận/Lưu ý:** Đã test bằng cách chặn `fetch` giả lập trước khi bật cờ để xác nhận payload/đích gửi đúng, không bắn nhầm. Xác nhận với người dùng: hiện đã bắn đủ 3 loại sự kiện (order mới/feedback/hoàn thành) về đúng 1 nhóm chung.

---

### Task #124 — Fix bug: người phụ trách tên viết tắt (VD "Huy AI") không thấy được việc của chính mình

**Nguyên nhân/Phát hiện:** `_isAssignedToMe()` (quyết định nhân viên có thấy 1 việc hay không) so khớp tên **chính xác từng chữ** với `currentUser.displayName`, không quy đổi qua bảng alias `_ASSIGNEE_ALIAS` (VD `'huy ai':'Đặng Ngọc Huy'`) như hàm `_hasAssignee()` (dùng cho bộ lọc "Phụ trách" của admin/leader) đã làm. Content Order/Task hay ghi tên tắt theo thói quen nhập liệu bên Lịch Content, nên đúng người phụ trách thật vẫn bị hệ thống coi là "không phải việc của tôi".

**Fix:** `_isAssignedToMe()` dùng `_normAssignee()` để chuẩn hoá cả 2 vế trước khi so khớp — khớp được cả tên đầy đủ lẫn alias.

**Xác nhận/Lưu ý:** Test trực tiếp trên bản live qua console: `_isAssignedToMe('Huy AI')` với `currentUser.displayName='Đặng Ngọc Huy'` trả về `true` sau fix (trước đó `false`).

---

### Task #125 — Fix triệt để: link "Xem chi tiết" từ thông báo Zalo không bao giờ tìm ra Content Order/Task

**Yêu cầu:** "Bấm từ link Zalo vào vẫn lỗi" → sau khi fix Task #124 vẫn báo "vào mấy lần đều không được" → người dùng gửi nguyên văn tin Zalo thật để đối chiếu.

**Nguyên nhân/Phát hiện:** Ngoài bug alias (Task #124), phát hiện thêm **2 lỗi liên hoàn** khiến deep-link `?id=<mã>` (điền sẵn ô tìm kiếm, cơ chế có từ trước — xem comment "DEEP LINK" trong admin.html) không bao giờ hoạt động cho Content Order/Task:
1. Bộ lọc "Kỳ" mặc định "Tháng này" vẫn áp dụng khi vào từ link — việc có deadline ngoài tháng hiện tại bị lọc mất dù tìm đúng ID (dù trong case cụ thể này deadline vẫn nằm trong tháng nên không phải nguyên nhân chính, nhưng vẫn là lỗi thật cần sửa).
2. **Nguyên nhân chính**: điều kiện so khớp từ khoá tìm kiếm cho Content Order/Content Task (trong `getFilteredRows()`, nhánh `intRows`) **hoàn toàn không có `t.id`** trong chuỗi so khớp — chỉ so tên dự án/người gửi/ghi chú/phòng ban... Nghĩa là tìm bằng đúng mã ID (kiểu link Zalo `?id=lco-...`) **không bao giờ** ra kết quả, bất kể đúng người, đúng quyền, đúng kỳ hay không. Bug này có từ trước, chỉ mới lộ ra vì thông báo Zalo (Task #122-123) bắt đầu gửi link `?id=` trỏ tới Content Order/Task (trước đó tính năng deep-link chủ yếu chỉ được dùng/test với đơn GAS thường, vốn có `o.id` trong chuỗi so khớp).

**Fix:**
- Deep-link `?id=`: tự chuyển `currentPeriod='all'` (bỏ lọc Kỳ) ngay khi phát hiện có `?id=` trong URL, cùng lúc với việc điền sẵn ô tìm kiếm — không gọi `render()`/`updateStats()` ngay (dữ liệu có thể chưa tải xong), để `loadAll()` tự vẽ lại đúng lúc.
- Thêm `t.id` vào chuỗi so khớp từ khoá của nhánh `intRows` (Content Order/Task) trong `getFilteredRows()`.

**Xác nhận/Lưu ý:** Test trực tiếp trên bản live (console, không cần đăng nhập) xác nhận cả 2 phần: điền đúng ID + tự chuyển kỳ "Tất cả". Test giả lập `getFilteredRows()` với dữ liệu mô phỏng đúng case thật (`lco-mt86qqh7y3ljth`, `assignedTo:'Đặng Ngọc Huy'`) xác nhận tìm ra đúng 1 kết quả sau khi có đủ cả 3 fix (Task #124 + 2 phần của Task #125). Người dùng xác nhận cuối cùng đã vào được ("Ok rồi em").

---

### Task #126 — Bắt đầu bàn tính năng tự động điền KPI theo mẫu công ty + thêm link "xem việc theo từ khoá + tháng" ở tracker.html

**Yêu cầu:** "Còn 1 việc quan trọng nữa anh muốn trao đổi là dựa vào các công việc trong tháng, anh và các bạn cần làm KPI theo mẫu của công ty như này" (kèm link thư mục Drive chứa file KPI `.xlsx` riêng từng người, mẫu "KẾ HOẠCH CÔNG VIỆC CÁ NHÂN" của Midu MenaQ7).

**Bối cảnh đã tìm hiểu (đọc trực tiếp nội dung file KPI thật qua Google Sheets, không cần đăng nhập — dùng cơ chế đọc network request `streamrows` của Sheets):**
- Mẫu gồm bảng "Danh mục Công việc" (STT/Danh mục/Phối hợp/Mục tiêu KPI/Tỷ trọng % hoàn thành/Nội dung triển khai/Kế hoạch tháng/Minh chứng kết quả/Đề xuất hỗ trợ/Ghi chú) + bảng quy đổi % hoàn thành → hệ số lương năng suất + chuỗi ký duyệt.
- Với **nhân viên**: đầu mục là mô tả công việc cố định theo vai trò — dễ khớp với order/task trong QLCV theo người phụ trách.
- Với **trưởng phòng** (file thật của người dùng): đầu mục là **tên Dự án/Kênh** (VD "Dự án Smax", "Fanpage Midu MenaQ7", "Digital marketing", "Web midu.vn"...), không phải theo Loại order — vì công việc thực tế là duyệt/kiểm soát nhiều kênh cùng lúc, không phải tự thực hiện.
- Xác nhận qua hỏi từng câu (theo yêu cầu người dùng — xem [[feedback-one-question-at-a-time]]): nhân viên tự bấm "Hoàn thành" trên hệ thống (không phải trưởng phòng), nên `completedBy` KHÔNG dùng được làm dấu vết "trưởng phòng đã duyệt".
- Quyết định tạm: nhóm báo cáo theo **Kênh/Dự án** (không theo Loại order) để tránh 1 bài viết (Content+Thiết kế+Ads) bị xé lẻ vào nhiều mục khác nhau; riêng **Chạy Ads tách thành 1 mục ngang hàng "Digital marketing"** (đúng theo file thật hiện tại, không lồng vào từng kênh); mỗi Kênh/Dự án chỉ nên **1 dòng tổng hợp** (không liệt kê từng bài viết) để tránh cồng kềnh — số liệu %+tóm tắt tự tính, "Minh chứng kết quả" là 1 link duy nhất trỏ sang QLCV lọc sẵn đúng kênh+tháng, không dán từng link.
- Việc ghi trực tiếp vào file Excel/Sheets cần quyền ghi (Google Sheets API/Apps Script) — người dùng sẽ tự quy chuẩn lại quyền chia sẻ các file KPI về 1 tài khoản trước khi làm bước này.
- **Chưa chốt xong thiết kế** — còn đang trao đổi dở phần ánh xạ Kênh/Dự án ↔ order thật trong QLCV.

**Đã làm (phần hạ tầng phục vụ ý tưởng "Minh chứng kết quả" = 1 link, làm trước để người dùng xem thử):**
- tracker.html: thêm URL param `?kw=<từ khoá>&month=YYYY-MM` — `kw` tái dùng ô tìm kiếm có sẵn (gạch ngang tự đổi thành khoảng trắng để link không bị mã hoá `%20` xấu), `month` ép kỳ về đúng 1 tháng cụ thể (khác `setPeriod()` chỉ có "Tháng này/Tháng trước").
- Thêm khối UI tự tạo link ngay trên trang (ô nhập từ khoá + chọn tháng + nút "Tạo link"/"Copy") — không cần nhờ ai tạo tay, mặc định sẵn tháng hiện tại.

**Xác nhận/Lưu ý:** Tính năng link theo từ khoá+tháng đã test và push, người dùng đã xem thử. Toàn bộ phần tự động điền KPI (ánh xạ Kênh/Dự án, cách tính %, cơ chế ghi vào Sheets) **CHƯA triển khai code**, mới dừng ở bàn thiết kế — xem [[project-kpi-auto-fill]] để nắm tiếp tình trạng ở phiên sau.

---

## 14. Liên kết nhanh

| Tên | URL |
|-----|-----|
| Gửi order | https://tuananhleo.github.io/midu-qlcv/order.html |
| Admin | https://tuananhleo.github.io/midu-qlcv/admin.html |
| Tracker | https://tuananhleo.github.io/midu-qlcv/tracker.html |
| GitHub repo | https://github.com/tuananhleo/midu-qlcv |
| GAS editor | https://script.google.com/home |
| GAS backend URL | https://script.google.com/macros/s/AKfycbyYgHkB8bngq9SQ23TACimx9svMpl1ZPZw8Yo3PC0YRYMoER5indo9ULZlAgldIKLMH/exec |
| Lịch Content — dữ liệu qua Cloudflare KV (`/api/kv`, `/api/img`), KHÔNG còn dùng Supabase từ 2026-08-11 (xem Task #106) | https://content-marketing.pages.dev/ |
| Lịch Content — board Khánh Huyền | https://content-marketing.pages.dev/#ws=khanh-huyen |
| Supabase dashboard (project cũ, đã ngừng dùng cho Lịch Content — có thể còn dữ liệu lịch sử) | https://supabase.com/dashboard/project/loqcqtuouagzaqwdmhji |

### Tracker — link riêng theo phòng ban (Task #116)

Gửi đúng link tương ứng cho từng phòng để họ bookmark, vào là tự lọc sẵn đúng việc của phòng — không cần đăng nhập, không cần chọn gì thêm.

| Phòng ban | Link |
|-----------|------|
| Phòng CSKH | https://tuananhleo.github.io/midu-qlcv/tracker.html?dept=cskh |
| Phòng Kế toán | https://tuananhleo.github.io/midu-qlcv/tracker.html?dept=ke-toan |
| Phòng HCNS | https://tuananhleo.github.io/midu-qlcv/tracker.html?dept=hcns |
| Phòng Vận hành | https://tuananhleo.github.io/midu-qlcv/tracker.html?dept=van-hanh |
| Phòng Marketing – Truyền thông | https://tuananhleo.github.io/midu-qlcv/tracker.html?dept=marketing-truyen-thong |
| Ban Đào tạo | https://tuananhleo.github.io/midu-qlcv/tracker.html?dept=dao-tao |
| Ban Chuyên môn | https://tuananhleo.github.io/midu-qlcv/tracker.html?dept=chuyen-mon |
| Xem tất cả (không lọc) | https://tuananhleo.github.io/midu-qlcv/tracker.html |

Nếu sau này đổi/thêm tên phòng ban (Cài đặt → Phòng ban trong admin.html), phải tạo lại slug tương ứng cho phòng đó — xem cách `normDept()` chuẩn hoá tên ở Task #116 để suy ra đúng slug (bỏ tiền tố Phòng/Ban, bỏ dấu, thay khoảng trắng bằng gạch ngang).
