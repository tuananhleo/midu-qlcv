# MIDU QLCV — Tài liệu hệ thống
> Cập nhật lần cuối: 23/07/2026  
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

## 14. Liên kết nhanh

| Tên | URL |
|-----|-----|
| Gửi order | https://tuananhleo.github.io/midu-qlcv/order.html |
| Admin | https://tuananhleo.github.io/midu-qlcv/admin.html |
| Tracker | https://tuananhleo.github.io/midu-qlcv/tracker.html |
| GitHub repo | https://github.com/tuananhleo/midu-qlcv |
| GAS editor | https://script.google.com/home |
| GAS backend URL | https://script.google.com/macros/s/AKfycbw5klIN8zAsl6cYSfIYDu8GNol4tCR4KQt8-fvldq_SZC1DDgUeK6bk73jF-ZoMdCjF/exec |
| Supabase dashboard | https://supabase.com/dashboard/project/loqcqtuouagzaqwdmhji |
| Lịch Content (link chung, đổi board bằng dropdown "BẢNG CỦA" hoặc `#ws=<id>`) | https://content-marketing.pages.dev/ |
| Lịch Content — board Khánh Huyền | https://content-marketing.pages.dev/#ws=khanh-huyen |
