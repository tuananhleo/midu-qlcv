// ============================================================
// MIDU MKT - Google Apps Script Backend v8
// ============================================================

const SHEET_NAME = 'Orders';

// Cột cố định — KHÔNG thay đổi thứ tự các trường admin ở cuối
const COLS = [
  // Người order
  'id', 'type', 'submittedAt',
  'requester', 'department', 'projectName', 'projectCode', 'deadline', 'priority', 'note',
  // Thiết kế
  'd_objective', 'd_size', 'd_qty', 'd_text_content', 'd_ref', 'd_note_design',
  // Video AI
  'd_script', 'd_duration', 'd_voice', 'd_ref_video', 'd_note_video',
  // Media
  'd_media_types', 'd_ratio', 'd_script_link', 'd_location', 'd_note_media',
  // Chạy Ads
  'd_platform', 'd_budget', 'd_audience', 'd_creative', 'd_note_ads',
  // Content
  'd_content_type', 'd_channel', 'd_topic', 'd_keywords', 'd_tone', 'd_outline', 'd_ref_content',
  // Khác
  'd_desc', 'd_ref_khac',
  // Bắn Bot
  'd_gio_ban_bot', 'd_chuong_trinh', 'd_doi_tuong', 'd_page', 'd_cong_cu', 'd_noi_dung_bot', 'd_hinh_anh',
  // Admin (luôn ở cuối)
  'status', 'assignedTo', 'linkResult', 'adminNote', 'clientNote', 'completedAt', 'completedBy',
  'resultBy', 'resultAt',
];

const HEADERS = [
  'ID', 'Loại yêu cầu', 'Ngày gửi',
  'Người yêu cầu', 'Phòng ban', 'Tên dự án', 'Mã dự án', 'Deadline', 'Độ ưu tiên', 'Ghi chú',
  // Thiết kế
  'Mục tiêu thiết kế', 'Kích thước/Tỉ lệ (TK)', 'Số lượng (TK)', 'Nội dung chữ', 'Link tham khảo (TK)', 'Ghi chú (TK)',
  // Video AI
  'Kịch bản chi tiết', 'Thời lượng dự kiến', 'Yêu cầu giọng đọc', 'Link video tham khảo', 'Lưu ý (Video)',
  // Media
  'Hình thức (Media)', 'Kích thước/Tỉ lệ (Media)', 'Link kịch bản/Brief', 'Địa điểm quay/chụp', 'Ghi chú (Media)',
  // Chạy Ads
  'Nền tảng Ads', 'Ngân sách (VNĐ)', 'Đối tượng mục tiêu', 'Link creative', 'Lưu ý (Ads)',
  // Content
  'Loại content', 'Kênh đăng', 'Chủ đề/Tiêu đề', 'Từ khóa SEO', 'Tone giọng văn', 'Outline/Nội dung', 'Link tài liệu (Content)',
  // Khác
  'Mô tả yêu cầu (Khác)', 'Link tham khảo (Khác)',
  // Bắn Bot
  'Giờ bán bot', 'Tên chương trình', 'Đối tượng', 'Page/Tài khoản', 'Công cụ', 'Nội dung tin nhắn', 'Link hình ảnh (Bot)',
  // Admin
  'Trạng thái', 'Người phụ trách', 'Kết quả', 'Ghi chú admin', 'Phản hồi cho người yêu cầu', 'Ngày hoàn thành', 'Người hoàn thành',
  'Người nhập kết quả', 'Thời gian nhập kết quả',
];

// Cột admin — cố định ở cuối
const ADMIN_KEYS = ['status', 'assignedTo', 'linkResult', 'adminNote', 'clientNote', 'completedAt', 'completedBy', 'resultBy', 'resultAt'];

// ── Phòng ban và Form Schema mặc định ────────────────────────
const DEFAULT_DEPARTMENTS = [
  'Kinh doanh', 'Kế toán – Tài chính', 'Nhân sự', 'Vận hành',
  'Ban Giám đốc', 'Marketing – Truyền thông', 'Kho – Logistics', 'Khác',
];

const DEFAULT_FORM_SCHEMA = {
  departments: DEFAULT_DEPARTMENTS,
  'thiet-ke': [
    { id:'d_objective',    label:'Mục tiêu thiết kế',          type:'text',     placeholder:'VD: Banner quảng cáo sản phẩm tháng 7', span:2 },
    { id:'d_size',         label:'Kích thước / Tỉ lệ',          type:'text',     placeholder:'VD: 1080x1080, A4, 9:16', span:1 },
    { id:'d_qty',          label:'Số lượng',                     type:'number',   placeholder:'VD: 3', span:1 },
    { id:'d_text_content', label:'Nội dung chữ cần có',          type:'textarea', placeholder:'Các chữ cần xuất hiện trong thiết kế, tagline, CTA...', span:2 },
    { id:'d_ref',          label:'Link tham khảo / Brief',       type:'url',      placeholder:'Link Google Drive, NAS hoặc website tham khảo...', span:2 },
    { id:'d_note_design',  label:'Ý tưởng / Ghi chú / Lưu ý',  type:'textarea', placeholder:'Màu sắc, phong cách, font, yêu cầu đặc biệt...', span:2 },
  ],
  'video-ai': [
    { id:'d_objective',  label:'Mục tiêu / Tên nội dung video', type:'text',     placeholder:'VD: Video sản phẩm 360mcg, Hướng dẫn tập luyện...', span:2 },
    { id:'d_script',     label:'Kịch bản chi tiết',             type:'textarea', placeholder:'Viết kịch bản hoặc dán link file/NAS. Bôi đỏ keyword hoặc nội dung cần làm nổi bật.', span:2, rows:6 },
    { id:'d_duration',   label:'Thời lượng dự kiến',            type:'text',     placeholder:'VD: 30s, 60s, 2 phút', span:1 },
    { id:'d_voice',      label:'Yêu cầu giọng đọc',             type:'text',     placeholder:'VD: Nữ – nhẹ nhàng, Nam – chuyên nghiệp, theo content', span:1 },
    { id:'d_ref_video',  label:'Link video tham khảo',          type:'url',      placeholder:'https://...', span:2 },
    { id:'d_note_video', label:'Lưu ý thêm',                    type:'textarea', placeholder:'Yêu cầu về hình ảnh, âm nhạc, hiệu ứng...', span:2 },
  ],
  'media': [
    { id:'d_objective',   label:'Mục tiêu chiến dịch / Dự án', type:'text',           placeholder:'VD: Xây kênh Doctor Mama, Hướng dẫn sản phẩm...', span:2 },
    { id:'d_media_types', label:'Hình thức',                    type:'checkbox-group', placeholder:'Chụp ảnh + hậu kỳ,Chụp ảnh + trả file gốc,Dựng video,Quay,Thu Voice,Livestream,Thiết kế thumbnail', span:2 },
    { id:'d_ratio',       label:'Kích thước / Tỉ lệ',           type:'text',           placeholder:'VD: Dọc 9:16, Ngang 16:9, Vuông 1:1', span:1 },
    { id:'d_qty',         label:'Số lượng',                     type:'number',         placeholder:'VD: 5', span:1 },
    { id:'d_script_link', label:'Link kịch bản / Brief',        type:'url',            placeholder:'Link Google Docs, Drive hoặc NAS...', span:2 },
    { id:'d_location',    label:'Địa điểm quay / chụp',         type:'text',           placeholder:'VD: Văn phòng HCM, Studio, Ngoài trời', span:1 },
    { id:'d_note_media',  label:'Ý tưởng / Ghi chú / Lưu ý',  type:'textarea',       placeholder:'Yêu cầu đặc biệt về màu sắc, phong cách, đạo cụ...', span:2 },
  ],
  'chay-ads': [
    { id:'d_platform',  label:'Nền tảng',                    type:'text',     placeholder:'VD: Facebook, Google Ads, TikTok', span:1 },
    { id:'d_budget',    label:'Ngân sách (VNĐ)',             type:'number',   placeholder:'VD: 5000000', span:1 },
    { id:'d_objective', label:'Mục tiêu chiến dịch',         type:'text',     placeholder:'VD: Lead, Doanh thu, Reach, Traffic', span:2 },
    { id:'d_audience',  label:'Đối tượng mục tiêu',          type:'textarea', placeholder:'Độ tuổi, giới tính, sở thích, khu vực...', span:2 },
    { id:'d_creative',  label:'Link creative / nội dung QC', type:'url',      placeholder:'https://...', span:2 },
    { id:'d_note_ads',  label:'Lưu ý thêm',                  type:'textarea', placeholder:'...', span:2 },
  ],
  'content': [
    { id:'d_content_type', label:'Loại content',               type:'text',     placeholder:'VD: Bài viết, Caption, Script, Email marketing', span:1 },
    { id:'d_channel',      label:'Kênh đăng',                  type:'text',     placeholder:'VD: Facebook Fanpage, Zalo OA, Website', span:1 },
    { id:'d_topic',        label:'Chủ đề / Tiêu đề dự kiến',  type:'text',     placeholder:'VD: Flash Sale tháng 7, Ra mắt sản phẩm mới', span:2 },
    { id:'d_keywords',     label:'Từ khóa SEO',                type:'text',     placeholder:'VD: thực phẩm chức năng, canxi cho bé', span:1 },
    { id:'d_tone',         label:'Tone giọng văn',             type:'text',     placeholder:'VD: Thân thiện, Chuyên gia, Trẻ trung', span:1 },
    { id:'d_outline',      label:'Outline / Nội dung cần có',  type:'textarea', placeholder:'Các ý chính cần đề cập...', span:2 },
    { id:'d_ref_content',  label:'Link tài liệu / tham khảo', type:'url',      placeholder:'https://...', span:2 },
  ],
  'khac': [
    { id:'d_desc',     label:'Mô tả yêu cầu chi tiết',      type:'textarea', placeholder:'Mô tả đầy đủ yêu cầu của bạn...', span:2, rows:5 },
    { id:'d_ref_khac', label:'Link tài liệu / tham khảo',   type:'url',      placeholder:'https://...', span:2 },
  ],
  'lich-truyen-thong': [
    { id:'d_gio_ban_bot',  label:'Giờ bắn bot',          type:'text',     placeholder:'VD: 8h, 10h30, 19h...', span:1 },
    { id:'d_chuong_trinh', label:'Tên chương trình',      type:'text',     placeholder:'VD: Flash Sale 30/6, Ra mắt sản phẩm...', span:1 },
    { id:'d_doi_tuong',    label:'Đối tượng',             type:'text',     placeholder:'VD: Khách cũ, Lead tháng 6, Tất cả...', span:1 },
    { id:'d_page',         label:'Page / Tài khoản',      type:'text',     placeholder:'VD: MIDU Official, Học viện Midu...', span:1 },
    { id:'d_cong_cu',      label:'Công cụ',               type:'text',     placeholder:'VD: Fchat, ManyChat, Zalo OA...', span:1 },
    { id:'d_noi_dung_bot', label:'Nội dung tin nhắn',     type:'textarea', placeholder:'Nội dung cần bắn bot...', span:2, rows:4 },
    { id:'d_hinh_anh',     label:'Link hình ảnh / media', type:'url',      placeholder:'https://...', span:2 },
  ],
};

function loadFormSchema() {
  const json = PropertiesService.getScriptProperties().getProperty('formSchema');
  if (!json) return DEFAULT_FORM_SCHEMA;
  try {
    const s = JSON.parse(json);
    if (!s.departments || !s.departments.length) s.departments = DEFAULT_DEPARTMENTS;
    return s;
  } catch(e) { return DEFAULT_FORM_SCHEMA; }
}
function saveFormSchemaData(schema) {
  const sheet = getOrCreateSheet();
  const oldSchema = loadFormSchema();
  const fixedIds = new Set(COLS); // Các cột cố định — không bao giờ tự xóa

  // Build map fieldId → label từ schema (bỏ qua types, departments, fixedIds)
  function buildMeta(s) {
    const meta = {};
    Object.entries(s).forEach(([key, fields]) => {
      if (!Array.isArray(fields)) return;
      fields.forEach(f => { if (f.id && !fixedIds.has(f.id)) meta[f.id] = f.label; });
    });
    return meta;
  }

  const oldMeta = buildMeta(oldSchema);
  const newMeta = buildMeta(schema);
  const fieldSchemaMap = loadSchema();

  // Vị trí chèn cột mới (trước các cột Admin)
  function getInsertAt(hm) {
    const adminHdrs = new Set(ADMIN_KEYS.map(k => HEADERS[COLS.indexOf(k)]).filter(Boolean));
    const adminPos = [...adminHdrs].map(h => hm[h]).filter(i => i !== undefined);
    return (adminPos.length ? Math.min(...adminPos) : sheet.getLastColumn()) + 1;
  }

  let headerMap = getHeaderMap(sheet);
  let changed = false;

  // 1. Thêm mới / đổi tên cột
  Object.entries(newMeta).forEach(([fieldId, newLabel]) => {
    const currentLabel = fieldSchemaMap[fieldId] || oldMeta[fieldId];
    if (currentLabel) {
      // Field đã tồn tại — đổi tên nếu label thay đổi
      if (currentLabel !== newLabel) {
        const colIdx = headerMap[currentLabel];
        if (colIdx !== undefined) {
          sheet.getRange(1, colIdx + 1).setValue(newLabel);
          headerMap[newLabel] = colIdx;
          delete headerMap[currentLabel];
        }
        fieldSchemaMap[fieldId] = newLabel;
        changed = true;
      }
    } else {
      // Field mới — thêm cột trước phần Admin
      if (headerMap[newLabel] === undefined) {
        const insertAt = getInsertAt(headerMap);
        sheet.insertColumnBefore(insertAt);
        sheet.getRange(1, insertAt)
          .setValue(newLabel)
          .setBackground('#fce7f3')
          .setFontWeight('bold')
          .setFontColor('#9d174d');
        // Rebuild headerMap sau khi chèn
        headerMap = getHeaderMap(sheet);
      }
      fieldSchemaMap[fieldId] = newLabel;
      changed = true;
    }
  });

  // 2. Xóa cột bị loại bỏ (chỉ custom fields, không xóa COLS cố định)
  const toDelete = Object.entries(oldMeta)
    .filter(([fieldId]) => newMeta[fieldId] === undefined && !fixedIds.has(fieldId));

  // Xóa từ cột có index cao nhất xuống thấp nhất để index không bị lệch
  const deleteIndices = toDelete
    .map(([fieldId, label]) => {
      const lbl = fieldSchemaMap[fieldId] || label;
      return { fieldId, colIdx: headerMap[lbl] };
    })
    .filter(x => x.colIdx !== undefined)
    .sort((a, b) => b.colIdx - a.colIdx);

  deleteIndices.forEach(({ fieldId, colIdx }) => {
    sheet.deleteColumn(colIdx + 1);
    delete fieldSchemaMap[fieldId];
    changed = true;
  });

  if (changed) saveSchema(fieldSchemaMap);

  // Lưu form schema
  PropertiesService.getScriptProperties().setProperty('formSchema', JSON.stringify(schema));
  return { success: true };
}

// ── Field schema (fieldId → tên header hiện tại) ─────────────
function loadSchema() {
  const json = PropertiesService.getScriptProperties().getProperty('fieldSchema') || '{}';
  return JSON.parse(json);
}
function saveSchema(schema) {
  PropertiesService.getScriptProperties().setProperty('fieldSchema', JSON.stringify(schema));
}
function getFieldHeader(fieldId, schema) {
  if (schema[fieldId]) return schema[fieldId];
  const idx = COLS.indexOf(fieldId);
  return idx >= 0 ? HEADERS[idx] : null;
}

// ── Tự động thêm/đổi tên cột ─────────────────────────────────
function syncColumns(sheet, meta) {
  if (!meta || Object.keys(meta).length === 0) return;
  const adminHdrs = new Set(ADMIN_KEYS.map(k => HEADERS[COLS.indexOf(k)]));
  let headerMap = getHeaderMap(sheet);
  const schema = loadSchema();
  let changed = false;
  const adminPos = [...adminHdrs].map(h => headerMap[h]).filter(i => i !== undefined);
  let insertAt = (adminPos.length ? Math.min(...adminPos) : sheet.getLastColumn()) + 1;

  Object.entries(meta).forEach(([fieldId, newLabel]) => {
    if (ADMIN_KEYS.includes(fieldId)) return;
    const currentLabel = getFieldHeader(fieldId, schema);
    if (currentLabel !== null) {
      if (currentLabel !== newLabel) {
        if (headerMap[currentLabel] !== undefined) {
          sheet.getRange(1, headerMap[currentLabel] + 1).setValue(newLabel);
          headerMap = getHeaderMap(sheet);
        } else {
          sheet.insertColumnBefore(insertAt);
          sheet.getRange(1, insertAt).setValue(newLabel).setBackground('#fce7f3').setFontWeight('bold').setFontColor('#9d174d');
          insertAt++; headerMap = getHeaderMap(sheet);
        }
        schema[fieldId] = newLabel; changed = true;
      }
    } else {
      if (headerMap[newLabel] === undefined) {
        sheet.insertColumnBefore(insertAt);
        sheet.getRange(1, insertAt).setValue(newLabel).setBackground('#fce7f3').setFontWeight('bold').setFontColor('#9d174d');
        insertAt++; headerMap = getHeaderMap(sheet);
      }
      schema[fieldId] = newLabel; changed = true;
    }
  });
  if (changed) saveSchema(schema);
}

// ── GET ───────────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = (e.parameter || {}).action;
    if (action === 'getOrders')    return respond(getOrdersData());
    if (action === 'getSchema')    return respond({ schema: loadSchema() });
    if (action === 'getFormSchema') return respond({ schema: loadFormSchema() });
    if (action === 'getUsers')     return respond(getUsersData());
    if (action === 'getLichTT')    return respond(getLichTTData());
    if (action === 'ping')         return respond({ ok: true, time: new Date().toISOString() });
    return respond({ error: 'Unknown action: ' + action });
  } catch (ex) { return respond({ error: ex.toString() }); }
}

// ── POST ──────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    if (action === 'submitOrders')  return respond(submitOrdersData(data.orders));
    if (action === 'addOrder')      return respond(addOrderData(data.order));
    if (action === 'updateOrder')   return respond(updateOrderData(data.id, data.updates));
    if (action === 'deleteOrder')   return respond(deleteOrderData(data.id));
    if (action === 'updateLichTT')  return respond(updateLichTTEntryData(data.id, data.updates));
    if (action === 'saveFormSchema') return respond(saveFormSchemaData(data.schema));
    if (action === 'loginUser')     return respond(loginUserData(data.username, data.password));
    if (action === 'createUser')    return respond(createUserData(data.user));
    if (action === 'updateUser')    return respond(updateUserData(data.id, data.updates));
    if (action === 'deleteUser')    return respond(deleteUserData(data.id));
    return respond({ error: 'Unknown action: ' + action });
  } catch (ex) { return respond({ error: ex.toString() }); }
}

// ── Submit nhiều orders cùng lúc ─────────────────────────────
// Order loại 'lich-truyen-thong' được tách ghi riêng vào sheet Lịch T.Thông
// (không ghi vào sheet Orders) — xem mục LỊCH TRUYỀN THÔNG bên dưới.
function submitOrdersData(orders) {
  if (!Array.isArray(orders) || orders.length === 0) return { error: 'Không có order nào' };
  const ids = [];
  orders.forEach(order => {
    const id = generateId(order.type);
    order.id = id;
    if (!order.status) order.status = 'chua-lam';
    if (order.type === 'lich-truyen-thong') addLichTTEntryData(order);
    else addOrderData(order);
    ids.push(id);
  });
  return { success: true, ids };
}

function generateId(type) {
  const PREFIX = { 'thiet-ke':'TK','video-ai':'VA','media':'MD','chay-ads':'AD','content':'CT','lich-truyen-thong':'LT','khac':'KH' };
  const p = PREFIX[type] || 'OR';
  const ts = new Date();
  const pad = n => String(n).padStart(2,'0');
  return `${p}-${ts.getFullYear().toString().slice(-2)}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}`;
}

// ── Helper: header → col index (0-based) ─────────────────────
function getHeaderMap(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return {};
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  headers.forEach((h, i) => { if (h) map[String(h)] = i; });
  return map;
}

// ── CRUD ──────────────────────────────────────────────────────
function getOrdersData() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  const schema = loadSchema();
  if (lastRow <= 1) return { orders: [], schema };

  const headerMap = getHeaderMap(sheet);
  const numCols = sheet.getLastColumn();
  const values = sheet.getRange(2, 1, lastRow - 1, numCols).getValues();
  const idIdx = headerMap['ID'];

  // Hàm chuyển giá trị ô Sheets thành string: Date → YYYY-MM-DD, khác → String()
  const fmtCell = val => {
    if (val instanceof Date && !isNaN(val)) {
      const p = n => String(n).padStart(2,'0');
      return `${val.getFullYear()}-${p(val.getMonth()+1)}-${p(val.getDate())}`;
    }
    return String(val ?? '');
  };

  const orders = values
    .filter(row => idIdx !== undefined ? row[idIdx] : row[0])
    .map(row => {
      const obj = {};
      COLS.forEach((col, i) => {
        const header = schema[col] || HEADERS[i];
        const colIdx = headerMap[header];
        obj[col] = (colIdx !== undefined && row[colIdx] !== undefined) ? fmtCell(row[colIdx]) : '';
      });
      Object.keys(schema).forEach(fieldId => {
        if (COLS.includes(fieldId)) return;
        const colIdx = headerMap[schema[fieldId]];
        if (colIdx !== undefined) obj[fieldId] = fmtCell(row[colIdx] || '');
      });
      return obj;
    });
  return { orders, schema };
}

function addOrderData(order) {
  const sheet = getOrCreateSheet();
  const meta = order._meta || {};
  delete order._meta;
  syncColumns(sheet, meta);

  // Auto ID nếu chưa có
  if (!order.id) order.id = generateId(order.type || 'khac');

  const schema = loadSchema();
  const headerMap = getHeaderMap(sheet);
  const numCols = sheet.getLastColumn();
  const row = new Array(numCols).fill('');

  COLS.forEach((col, i) => {
    const header = schema[col] || HEADERS[i];
    const colIdx = headerMap[header];
    if (colIdx !== undefined) {
      const val = order[col];
      row[colIdx] = (val !== undefined && val !== null) ? String(val) : '';
    }
  });
  Object.keys(order).forEach(key => {
    if (COLS.includes(key)) return;
    const label = meta[key] || schema[key];
    if (!label) return;
    const colIdx = headerMap[label];
    if (colIdx !== undefined) row[colIdx] = String(order[key] || '');
  });

  sheet.appendRow(row);
  sheet.autoResizeColumns(1, numCols);
  return { success: true, id: order.id };
}

function updateOrderData(id, updates) {
  const sheet = getOrCreateSheet();
  const headerMap = getHeaderMap(sheet);
  const schema = loadSchema();

  const idColIdx = headerMap['ID'];
  if (idColIdx === undefined) return { error: 'Không tìm thấy cột ID' };

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { error: 'Không có dữ liệu' };

  const idValues = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getValues().flat();
  const rowIdx = idValues.indexOf(id);
  if (rowIdx < 0) return { error: 'Không tìm thấy order: ' + id };

  const sheetRow = rowIdx + 2;
  Object.keys(updates).forEach(key => {
    const colsIdx = COLS.indexOf(key);
    const header = schema[key] || (colsIdx >= 0 ? HEADERS[colsIdx] : null);
    if (!header) return;
    const colIdx = headerMap[header];
    if (colIdx === undefined) return;
    let val = updates[key];
    if (val === null || val === undefined) val = '';
    else val = String(val);
    sheet.getRange(sheetRow, colIdx + 1).setValue(val);
  });
  return { success: true };
}

function deleteOrderData(id) {
  const sheet = getOrCreateSheet();
  const headerMap = getHeaderMap(sheet);
  const idColIdx = headerMap['ID'];
  if (idColIdx === undefined) return { error: 'Không tìm thấy cột ID' };

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { error: 'Không có dữ liệu' };

  const idValues = sheet.getRange(2, idColIdx + 1, lastRow - 1, 1).getValues().flat();
  const rowIdx = idValues.indexOf(id);
  if (rowIdx < 0) return { error: 'Không tìm thấy order: ' + id };

  sheet.deleteRow(rowIdx + 2);
  return { success: true };
}

// ── Sheet Setup ───────────────────────────────────────────────
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  const firstCell = sheet.getRange(1, 1).getValue();
  if (firstCell !== HEADERS[0] || sheet.getLastColumn() < HEADERS.length) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    styleHeaders(sheet);
  }
  return sheet;
}

function styleHeaders(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setBackground('#fce7f3').setFontWeight('bold').setFontColor('#9d174d');
  ADMIN_KEYS.forEach(col => {
    const idx = COLS.indexOf(col);
    if (idx >= 0) sheet.getRange(1, idx + 1).setBackground('#ccfbf1').setFontColor('#115e59');
  });
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(COLS.indexOf('id') + 1, 130);
  sheet.setColumnWidth(COLS.indexOf('projectName') + 1, 180);
  sheet.setColumnWidth(COLS.indexOf('linkResult') + 1, 200);
  sheet.setColumnWidth(COLS.indexOf('clientNote') + 1, 200);
  sheet.setColumnWidth(COLS.indexOf('adminNote') + 1, 180);
}

// ── Response ──────────────────────────────────────────────────
function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// ── Migration ─────────────────────────────────────────────────
function migrateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { Logger.log('Không tìm thấy sheet Orders'); return; }

  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const lastRow = sheet.getLastRow();
  const oldHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);
  const oldMap = {};
  oldHeaders.forEach((h, i) => { if (h) oldMap[h] = i; });

  let existingData = [];
  if (lastRow > 1) existingData = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const rows = existingData.map(row => {
    const obj = {};
    COLS.forEach((col, i) => {
      const oldIdx = oldMap[HEADERS[i]];
      if (oldIdx !== undefined) obj[col] = String(row[oldIdx] || '');
      // Map các tên cũ → mới
      const aliasMap = {
        'd_objective': ['Mục tiêu chiến dịch','Mục tiêu thiết kế'],
        'd_script':    ['Kịch bản chi tiết','Nội dung chính (Video)','Kịch bản (Media)'],
        'd_voice':     ['Yêu cầu giọng đọc','Âm nhạc/Giọng đọc'],
        'd_media_types': ['Hình thức (Media)','Loại media'],
        'd_text_content': ['Nội dung chữ','Mô tả (Thiết kế)'],
        'd_note_design': ['Ghi chú (TK)','Ghi chú Thiết kế'],
        'd_note_video':  ['Lưu ý (Video)'],
        'd_note_media':  ['Ghi chú (Media)'],
        'd_note_ads':    ['Lưu ý (Ads)'],
        'd_script_link': ['Link kịch bản/Brief','Link nội dung kịch bản'],
        'd_ref_video':   ['Link video tham khảo','Link tham khảo (Video)'],
        'd_ref_content': ['Link tài liệu (Content)','Link tham khảo (Content)'],
        'clientNote':    ['Phản hồi cho người yêu cầu'],
      };
      if (!obj[col] || obj[col] === '') {
        const aliases = aliasMap[col] || [];
        for (const alias of aliases) {
          if (oldMap[alias] !== undefined) { obj[col] = String(row[oldMap[alias]] || ''); break; }
        }
      }
    });
    return obj;
  });

  sheet.clearContents();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  styleHeaders(sheet);
  if (rows.length > 0) {
    const newData = rows.map(obj => COLS.map(col => obj[col] || ''));
    sheet.getRange(2, 1, newData.length, COLS.length).setValues(newData);
  }
  Logger.log('Migration xong! ' + rows.length + ' rows.');
}

// ═══════════════════════════════════════════════════════════════
// QUẢN LÝ NGƯỜI DÙNG (Users sheet)
// ═══════════════════════════════════════════════════════════════
const SHEET_USERS = 'Users';
// Cột: id | username | passwordHash | role | displayName | dept | active | createdAt
const ROLE_LABELS_GAS = {
  admin:           'Quản trị viên',
  leader_thiet_ke: 'Trưởng nhóm Thiết Kế',
  leader_media:    'Trưởng nhóm Media',
  nv_thiet_ke:     'Nhân viên Thiết Kế',
  nv_media:        'Nhân viên Media',
};

function hashPw(pw) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(pw), Utilities.Charset.UTF_8);
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

// Cột 9-10 mở rộng: quyền tuỳ chỉnh theo TỪNG NGƯỜI DÙNG (không theo vai trò chung) +
// hạng mục công việc được phép xem. Thêm ở cuối, không đụng 8 cột gốc.
const USERS_NUM_COLS = 10;
function _ensureUsersExtraCols(sh) {
  const existing = sh.getRange(1, 9, 1, 2).getValues()[0];
  let changed = false;
  ['Quyền tuỳ chỉnh (JSON)', 'Hạng mục được xem (để trống = tất cả)'].forEach((h, i) => {
    if (!existing[i]) { sh.getRange(1, 9 + i).setValue(h).setFontWeight('bold'); changed = true; }
  });
  if (changed) sh.getRange(1, 9, 1, 2).setBackground('#e0f2fe').setFontColor('#0c4a6e');
}

function getOrCreateUsersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_USERS);
  if (!sh) {
    sh = ss.insertSheet(SHEET_USERS);
    sh.getRange(1,1,1,8).setValues([['ID','Tên đăng nhập','Mật khẩu (hash)','Vai trò','Tên hiển thị','Nhóm','Kích hoạt','Ngày tạo']]);
    sh.getRange(1,1,1,8).setBackground('#e0f2fe').setFontWeight('bold').setFontColor('#0c4a6e');
    sh.setFrozenRows(1);
    sh.setColumnWidth(1,120); sh.setColumnWidth(3,240); sh.setColumnWidth(5,160);
  }
  _ensureUsersExtraCols(sh);
  // Tự tạo tài khoản admin mặc định nếu chưa có
  if (sh.getLastRow() <= 1) {
    sh.appendRow(['u_admin','admin',hashPw('Midu123'),'admin','Quản trị viên','','true',new Date().toISOString()]);
    Logger.log('Đã tạo tài khoản admin mặc định (admin/admin123)');
  }
  return sh;
}

// Đọc quyền tuỳ chỉnh JSON an toàn — trả về {} nếu trống/lỗi (nghĩa là không override
// gì, dùng nguyên quyền mặc định theo vai trò).
function _parsePermOverrides(val) {
  if (!val) return {};
  try { const o = JSON.parse(val); return (o && typeof o === 'object') ? o : {}; } catch(e) { return {}; }
}

function loginUserData(username, password) {
  try {
    const sh = getOrCreateUsersSheet();
    const last = sh.getLastRow();
    if (last <= 1) return { error: 'Chưa có tài khoản. Vui lòng liên hệ quản trị viên.' };
    const rows = sh.getRange(2,1,last-1,USERS_NUM_COLS).getValues();
    const hash = hashPw(password);
    const r = rows.find(row =>
      row[0] &&
      row[1].toString().toLowerCase() === username.toLowerCase() &&
      row[2] === hash &&
      row[6].toString() === 'true'
    );
    if (!r) return { error: 'Sai tên đăng nhập hoặc mật khẩu' };
    return { user: {
      id:String(r[0]), username:String(r[1]), role:String(r[3]), displayName:String(r[4]), dept:String(r[5]),
      permOverrides: _parsePermOverrides(r[8]),
      allowedTypes: String(r[9]||'').split(',').map(s=>s.trim()).filter(Boolean),
    } };
  } catch(e) { return { error: e.toString() }; }
}

function getUsersData() {
  try {
    const sh = getOrCreateUsersSheet();
    const last = sh.getLastRow();
    if (last <= 1) return { users: [] };
    const rows = sh.getRange(2,1,last-1,USERS_NUM_COLS).getValues();
    const users = rows.filter(r=>r[0]).map(r=>({
      id: String(r[0]), username: String(r[1]),
      role: String(r[3]), roleLabel: ROLE_LABELS_GAS[r[3]] || r[3],
      displayName: String(r[4]), dept: String(r[5]),
      active: r[6].toString()==='true',
      createdAt: r[7] ? new Date(r[7]).toLocaleDateString('vi-VN') : '',
      permOverrides: _parsePermOverrides(r[8]),
      allowedTypes: String(r[9]||'').split(',').map(s=>s.trim()).filter(Boolean),
    }));
    return { users };
  } catch(e) { return { error: e.toString() }; }
}

function createUserData(user) {
  try {
    const sh = getOrCreateUsersSheet();
    const last = sh.getLastRow();
    // Kiểm tra trùng username
    if (last > 1) {
      const unames = sh.getRange(2,2,last-1,1).getValues().flat().map(s=>s.toString().toLowerCase());
      if (unames.includes((user.username||'').toLowerCase())) return { error: 'Tên đăng nhập đã tồn tại' };
    }
    const id = 'u_' + Date.now().toString(36);
    const permJson = user.permOverrides ? JSON.stringify(user.permOverrides) : '';
    const allowedTypes = Array.isArray(user.allowedTypes) ? user.allowedTypes.join(',') : '';
    sh.appendRow([id, user.username, hashPw(user.password||'Midu123'), user.role||'nv_thiet_ke',
                  user.displayName||user.username, user.dept||'', 'true', new Date().toISOString(),
                  permJson, allowedTypes]);
    return { success:true, id };
  } catch(e) { return { error: e.toString() }; }
}

function updateUserData(id, updates) {
  try {
    const sh = getOrCreateUsersSheet();
    const last = sh.getLastRow();
    if (last <= 1) return { error: 'Không tìm thấy' };
    const ids = sh.getRange(2,1,last-1,1).getValues().flat().map(String);
    const idx = ids.indexOf(String(id));
    if (idx < 0) return { error: 'Không tìm thấy người dùng: ' + id };
    const row = idx + 2;
    if (updates.displayName !== undefined) sh.getRange(row,5).setValue(updates.displayName);
    if (updates.role        !== undefined) sh.getRange(row,4).setValue(updates.role);
    if (updates.dept        !== undefined) sh.getRange(row,6).setValue(updates.dept);
    if (updates.active      !== undefined) sh.getRange(row,7).setValue(String(updates.active));
    if (updates.password    !== undefined) sh.getRange(row,3).setValue(hashPw(updates.password));
    if (updates.permOverrides !== undefined) sh.getRange(row,9).setValue(JSON.stringify(updates.permOverrides||{}));
    if (updates.allowedTypes  !== undefined) sh.getRange(row,10).setValue((updates.allowedTypes||[]).join(','));
    return { success:true };
  } catch(e) { return { error: e.toString() }; }
}

function deleteUserData(id) {
  try {
    if (id === 'u_admin') return { error: 'Không thể xóa tài khoản admin gốc' };
    const sh = getOrCreateUsersSheet();
    const last = sh.getLastRow();
    if (last <= 1) return { error: 'Không tìm thấy' };
    const ids = sh.getRange(2,1,last-1,1).getValues().flat().map(String);
    const idx = ids.indexOf(String(id));
    if (idx < 0) return { error: 'Không tìm thấy người dùng' };
    sh.deleteRow(idx + 2);
    return { success:true };
  } catch(e) { return { error: e.toString() }; }
}

// ═══════════════════════════════════════════════════════════════
// LỊCH TRUYỀN THÔNG (sheet ngoài — nay là nguồn ghi/đọc chính thức
// cho loại order 'lich-truyen-thong', TÁCH RIÊNG khỏi sheet Orders
// để tránh sheet Orders phình to theo tần suất lịch bắn bot)
// ═══════════════════════════════════════════════════════════════
// Sheet: https://docs.google.com/spreadsheets/d/1viTfNbzImR6nCXvp5Z5Ez345uRM5beXcTw19jaP1xWc
// Cấu trúc: Hàng 3-4 = header, dữ liệu từ hàng 5
// Cột gốc: A=STT, B=Ngày order, C=Giờ bán bot, D=Ngày bán bot,
//          E=Tên chương trình, F=Đối tượng, G=Page, H=Công cụ,
//          I=Nội dung, J=Hình ảnh, K=Trạng thái
// Cột mới thêm (L–Q) để quản lý được như order bình thường trong admin.html:
//          L=ID, M=Người yêu cầu, N=Phòng ban, O=Độ ưu tiên,
//          P=Người phụ trách, Q=Link kết quả
const LICH_TT_SHEET_ID = '1viTfNbzImR6nCXvp5Z5Ez345uRM5beXcTw19jaP1xWc';
const LICH_TT_NUM_COLS = 17; // A–Q
const LICH_TT_EXTRA_HEADERS = ['ID', 'Người yêu cầu', 'Phòng ban', 'Độ ưu tiên', 'Người phụ trách', 'Link kết quả'];

// Trạng thái nội bộ (giống order thường) ↔ nhãn tiếng Việt trong cột K.
// Trước đây cột này chỉ dùng "Đã bắn" như 1 nhật ký (ghi sau khi đã bắn xong) —
// giờ dùng thêm các trạng thái khác để theo dõi được cả việc CHƯA bắn.
const LICH_TT_STATUS_TO_LABEL = { 'chua-lam':'Chưa làm', 'dang-xu-ly':'Đang làm', 'feedback':'Chờ feedback', 'hoan-thanh':'Đã bắn', 'huy':'Huỷ' };
const LICH_TT_LABEL_TO_STATUS = { 'chưa làm':'chua-lam', 'đang làm':'dang-xu-ly', 'chờ feedback':'feedback', 'đã bắn':'hoan-thanh', 'huỷ':'huy', 'hủy':'huy' };

function _lichTTSheet() {
  const ss = SpreadsheetApp.openById(LICH_TT_SHEET_ID);
  return ss.getSheets()[0]; // Tab đầu tiên: Lịch TT
}

// Đảm bảo có đủ 6 cột mở rộng L–Q (idempotent — gọi nhiều lần không sao,
// chỉ ghi header nếu ô đó đang trống, không đụng dữ liệu cũ ở A–K).
function _ensureLichTTExtraCols(sheet) {
  const headerRow = 3; // hàng 3 là header chính (theo cấu trúc sheet hiện tại)
  const existing = sheet.getRange(headerRow, 12, 1, 6).getValues()[0]; // L3:Q3
  let changed = false;
  LICH_TT_EXTRA_HEADERS.forEach((h, i) => {
    if (!existing[i]) {
      sheet.getRange(headerRow, 12 + i).setValue(h).setFontWeight('bold');
      changed = true;
    }
  });
  if (changed) sheet.getRange(headerRow, 12, 1, 6).setBackground('#fce7f3').setFontColor('#9d174d');
}

function getLichTTData() {
  try {
    const sheet = _lichTTSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow < 5) return { entries: [] };

    const allRows = sheet.getRange(1, 1, lastRow, LICH_TT_NUM_COLS).getValues();

    // Tìm hàng header (có chữ "STT" ở cột A)
    let dataStartIdx = 4; // mặc định bắt đầu từ hàng 5 (index 4)
    for (let i = 0; i < Math.min(8, allRows.length); i++) {
      if (String(allRows[i][0]).trim().toUpperCase() === 'STT') {
        dataStartIdx = i + 2; // bỏ qua hàng sub-header (hàng 4)
        break;
      }
    }

    const fmtDate = val => {
      if (val instanceof Date && !isNaN(val)) {
        const p = n => String(n).padStart(2,'0');
        return `${val.getFullYear()}-${p(val.getMonth()+1)}-${p(val.getDate())}`;
      }
      return String(val || '');
    };

    const entries = allRows.slice(dataStartIdx)
      .map((row, i) => ({ _row: dataStartIdx + i + 1, row })) // _row = số dòng thật trên sheet (1-based)
      .filter(({row}) => row[3] || row[4]) // có Ngày bán bot hoặc Tên chương trình
      .map(({_row, row}) => {
        const rawStatus = String(row[10] || '').trim().toLowerCase();
        return {
          _row,
          stt:         String(row[0] || ''),
          ngayOrder:   fmtDate(row[1]),
          gioBot:      String(row[2] || ''),
          ngayBot:     fmtDate(row[3]),   // cột D — ngày phát sóng, dùng để check conflict
          chuongTrinh: String(row[4] || ''),
          doiTuong:    String(row[5] || ''),
          page:        String(row[6] || ''),
          congCu:      String(row[7] || ''),
          noiDung:     String(row[8] || '').slice(0, 120),
          trangThai:   String(row[10] || ''),
          status:      LICH_TT_LABEL_TO_STATUS[rawStatus] || (rawStatus ? 'hoan-thanh' : 'chua-lam'),
          id:          String(row[11] || ''),
          requester:   String(row[12] || ''),
          department:  String(row[13] || ''),
          priority:    String(row[14] || ''),
          assignedTo:  String(row[15] || ''),
          linkResult:  String(row[16] || ''),
        };
      })
      .filter(e => e.ngayBot || e.chuongTrinh);

    return { entries };
  } catch(ex) {
    return { error: ex.toString() };
  }
}

// Ghi 1 order Lịch T.Thông mới (gọi từ submitOrdersData khi type==='lich-truyen-thong')
function addLichTTEntryData(order) {
  try {
    const sheet = _lichTTSheet();
    _ensureLichTTExtraCols(sheet);

    const lastRow = sheet.getLastRow();
    let nextStt = 1;
    if (lastRow >= 5) {
      const sttCol = sheet.getRange(5, 1, lastRow - 4, 1).getValues().flat();
      const nums = sttCol.map(v => parseInt(v, 10)).filter(n => !isNaN(n));
      if (nums.length) nextStt = Math.max(...nums) + 1;
    }

    const id = order.id || generateId('lich-truyen-thong');
    const label = LICH_TT_STATUS_TO_LABEL[order.status] || 'Chưa làm';
    const now = new Date();
    const p = n => String(n).padStart(2,'0');
    const ngayOrder = `${p(now.getDate())}/${p(now.getMonth()+1)}/${now.getFullYear()}`;

    const row = [
      nextStt, ngayOrder, order.d_gio_ban_bot || '', order.deadline || '',
      order.d_chuong_trinh || order.projectName || '', order.d_doi_tuong || '',
      order.d_page || '', order.d_cong_cu || '', order.d_noi_dung_bot || '',
      order.d_hinh_anh || '', label,
      id, order.requester || '', order.department || '', order.priority || '', '', '',
    ];
    sheet.appendRow(row);
    return { success: true, id };
  } catch(ex) {
    return { error: ex.toString() };
  }
}

// Cập nhật trạng thái / người phụ trách / link kết quả (gọi từ admin.html)
function updateLichTTEntryData(id, updates) {
  try {
    const sheet = _lichTTSheet();
    _ensureLichTTExtraCols(sheet);
    const lastRow = sheet.getLastRow();
    if (lastRow < 5) return { error: 'Không có dữ liệu' };

    const ids = sheet.getRange(5, 12, lastRow - 4, 1).getValues().flat().map(String);
    const idx = ids.indexOf(String(id));
    if (idx < 0) return { error: 'Không tìm thấy lịch: ' + id };
    const sheetRow = 5 + idx;

    if (updates.status !== undefined) {
      sheet.getRange(sheetRow, 11).setValue(LICH_TT_STATUS_TO_LABEL[updates.status] || updates.status);
    }
    if (updates.assignedTo !== undefined) sheet.getRange(sheetRow, 16).setValue(updates.assignedTo);
    if (updates.linkResult !== undefined) sheet.getRange(sheetRow, 17).setValue(updates.linkResult);
    return { success: true };
  } catch(ex) {
    return { error: ex.toString() };
  }
}
