# MIDU QLCV — Tài liệu hệ thống
> Cập nhật lần cuối: 20/07/2026  
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

**Thư mục làm việc:** `Z:\DU LIEU MIDU\MIDU\KHOI KINH DOANH VA TIEP THI\MARKETING-TRUYEN THONG\PHAN MEM QLCV\`  
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

> ⚠️ File trang Lịch Content (hiện tại: `Content-Da-kenh-1-file.html`, nằm ngoài thư mục này tại `...\MARKETING-TRUYEN THONG\Content Oanh\`, deploy tại `content-kim-oanh.pages.dev`) **TUYỆT ĐỐI KHÔNG sửa** — chỉ đọc để hiểu cấu trúc dữ liệu, mọi tích hợp xử lý ở phía admin.html/tracker.html (mục 9).

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

Trang Content (`content-kim-oanh.pages.dev`, file cục bộ `Content-Da-kenh-1-file.html` — **không thuộc repo này, không sửa**) đã nâng cấp lên "mỗi người 1 board", chọn bằng dropdown "BẢNG CỦA" ngay trong trang. Từ đó **mọi key dữ liệu của board đều có hậu tố `--<workspaceId>`**, ví dụ `content-plan-orders-v1--kim-oanh`.

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

> Employee chỉ thấy đơn có `assignedTo` khớp với `displayName` của họ.

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
- Iframe nhúng thẳng `https://content-kim-oanh.pages.dev/` (link chung, đổi board bằng dropdown trong trang hoặc hash `#ws=<id>`)
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
const CONTENT_APP_URL = 'https://content-kim-oanh.pages.dev/'; // 1 link chung cho cả nhóm
const CONTENT_SOURCES = [
  { id:'kim-oanh',    name:'Kim Oanh',    url:CONTENT_APP_URL,                    idPrefix:'cont-'    },
  { id:'khanh-huyen', name:'Khánh Huyền', url:CONTENT_APP_URL+'#ws=khanh-huyen',  idPrefix:'cont-kh-' },
];
```

`id` chính là **workspace id** trong `content-plan-workspaces-v1` — mọi Supabase key của người đó được build động: `content-plan-tasks-v2--${id}`, `content-plan-orders-v1--${id}`, `content-plan-channels-v1--${id}`.

**Thêm content person mới:**
1. Xác nhận `id` board của họ (mở `content-kim-oanh.pages.dev`, chọn tên họ ở dropdown "BẢNG CỦA", xem trong `content-plan-workspaces-v1` trên Supabase, hoặc hỏi trực tiếp)
2. Thêm 1 dòng vào `CONTENT_SOURCES` (cả admin.html lẫn tracker.html): `{ id:'<workspaceId>', name:'<Tên>', url:CONTENT_APP_URL+'#ws=<workspaceId>', idPrefix:'cont-<viet-tat>-' }` — `idPrefix` phải unique để tránh trùng ID card
3. Save → push git → xong. Không cần sửa logic fetch/render nào khác — mọi hàm đều lặp qua mảng này.

> ⚠️ Link `#ws=<id>` chỉ hoạt động trên bản Content **đang triển khai thật** (`content-kim-oanh.pages.dev`). Domain cũ `content-kim-oanh.netlify.app` là bản lỗi thời, KHÔNG có dropdown nhiều board — đừng dùng lại domain đó.

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
| #62 | **Tìm kiếm bỏ qua dấu tiếng Việt** (`normVN()`) + bổ sung field `requester` còn thiếu cho Content Order/Task, để ô tìm kiếm thực sự tìm được theo "Người yêu cầu". Chi tiết bên dưới. | admin.html, tracker.html |
| #61 | **Fix nút "📋 Sao chép" không copy được** (đặc biệt link và đường dẫn ổ cứng). Chi tiết bên dưới. | admin.html, tracker.html |
| #60 | **Fix nghiêm trọng (2 lớp lồng nhau): bật filter "Loại công việc" bất kỳ làm biến mất TOÀN BỘ Lịch Content trong admin.html** — (1) công thức lọc thiếu nhánh cho content task, (2) `TYPE_MAP` thiếu hẳn `'internal'` nên không có chip nào để khớp. Chi tiết bên dưới. | admin.html |
| #59 | **Deep-link "Mở bài này"**: nút mở Lịch Content giờ nhảy thẳng vào đúng bài (tự chuyển board + tuần + highlight) thay vì chỉ mở trang chủ rồi phải tự tìm. Áp dụng cho cả content task và content order (nếu có `taskId` gốc). | admin.html, tracker.html |
| #58 | **Fix đồng bộ Lịch Content bị đứt + admin thiếu việc so với tracker (nghiêm trọng)**. Chi tiết bên dưới. | admin.html, tracker.html |
| #54 | ~~Báo cáo tách nguồn~~: thêm bộ lọc Nguồn (Tất cả / Từ phòng ban / Nội bộ MKT) vào tab Báo cáo. **⚠️ Đã kiểm tra 20/07/2026: `currentSource`/`setSource()` KHÔNG còn tồn tại trong admin.html hiện tại** — có thể đã bị revert hoặc chưa từng merge đầy đủ. Dòng lịch sử này giữ lại để tra cứu, không phản ánh code hiện tại. | admin.html |
| #53 | **Tăng tốc load**: kiến trúc cache-first 6 bước — đọc ALL cache trước (0ms), render ngay, song song GAS+Supabase (timeout 8s), render lại sau Supabase, render lại sau GAS. Áp dụng cả admin `loadAll()` và tracker `loadOrders()`. Thêm `KEY_CT_CACHE` cho contentTasks. | admin.html, tracker.html |
| #52 | **Báo cáo nâng cao**: (1) Không hiện "Không có order nào" khi đang tải, (2) Breakdown loại order hiện TẤT CẢ type kể cả count 0, (3) Thêm chart + bảng theo người phân công (click xem chi tiết). | admin.html |
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
| Lịch Content (link chung, đổi board bằng dropdown "BẢNG CỦA" hoặc `#ws=<id>`) | https://content-kim-oanh.pages.dev/ |
| Lịch Content — board Khánh Huyền | https://content-kim-oanh.pages.dev/#ws=khanh-huyen |
