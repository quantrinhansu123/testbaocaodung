import { AuditRecord, AppSheetConfig, AppSheetTablesResult, PhanKhucItem, CoSoItem } from '../types';
import { INITIAL_MOCK_AUDITS } from '../data/mockData';

export const DEFAULT_APPSHEET_CONFIG: AppSheetConfig = {
  appId: '2a2f82f8-f846-41fe-b74a-6c6144cd385e',
  apiKey: 'V2-PE81T-2jJcZ-Am0Kj-qMC8V-ZE6HR-V3cMc-aSO0M-Lx07l',
  appName: 'CopyofPhan_Tich_Thi_Truong-325045268',
  tableName: 'Trinhbay'
};

// Helper to normalize string matching
function getRawField(row: Record<string, any>, possibleKeys: string[]): any {
  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null) {
      return row[key];
    }
    // Case insensitive match
    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(row).find(k => k.toLowerCase() === lowerKey);
    if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null) {
      return row[foundKey];
    }
  }
  return undefined;
}

export function parseAppSheetRowToAudit(row: Record<string, any>, index: number): AuditRecord {
  const id = String(
    getRawField(row, ['ID', 'Id', '_RowNumber', 'Key', 'ID_DaiLy', 'ID_KhaoSat']) || `TRB-${100 + index}`
  );
  
  const dealerName = String(
    getRawField(row, ['dai_ly', 'Ten_DaiLy', 'Ten_dai_ly', 'Tên đại lý', 'Đại lý', 'DaiLy', 'DealerName', 'TenDaiLy']) || `Đại lý Khảo Sát ${index + 1}`
  );

  const address = String(
    getRawField(row, ['Dia_Chi', 'Địa chỉ', 'Address', 'DiaChi']) || 'Việt Nam'
  );

  const phone = String(
    getRawField(row, ['So_Dien_Thoai', 'SĐT', 'Điện thoại', 'Phone']) || ''
  );

  const region = String(
    getRawField(row, ['Region', 'Khu_Vuc', 'Khu vực', 'ThanhPho', 'Tỉnh/Thành']) || 'Miền Bắc'
  );

  const auditDate = String(
    getRawField(row, ['Thoi_Gian', 'Ngay_Khao_Sat', 'Ngày khảo sát', 'Date', 'CreatedDate']) || new Date().toISOString().slice(0, 16).replace('T', ' ')
  );

  const mysteryShopperName = String(
    getRawField(row, ['Nguoi_Khao_Sat', 'Người khảo sát', 'Shopper']) || 'KTV Khảo sát'
  );

  // Parsing Trưng bày / Giới thiệu for Khao_sat JSON + legacy text
  const parsePresenceFlag = (raw: any): boolean => {
    if (raw === undefined || raw === null) return false;
    if (typeof raw === 'boolean') return raw;
    if (typeof raw === 'number') return raw !== 0;

    if (typeof raw === 'object') {
      if (Array.isArray(raw)) return raw.length > 0;
      const coSo = Array.isArray(raw.co_so) ? raw.co_so : [];
      const phanKhuc = Array.isArray(raw.phan_khuc) ? raw.phan_khuc : [];
      return coSo.length > 0 || phanKhuc.length > 0;
    }

    if (typeof raw === 'string') {
      const val = raw.trim();
      if (!val) return false;
      const lower = val.toLowerCase();
      if (lower.includes('không') || lower === 'no' || lower === 'false' || lower === '0') {
        return false;
      }

      // JSON stored in AppSheet text/jsonb columns
      if (val.startsWith('{') || val.startsWith('[')) {
        try {
          return parsePresenceFlag(JSON.parse(val));
        } catch {
          return false;
        }
      }

      // Legacy plain text: "Có", department names, etc.
      return true;
    }

    return Boolean(raw);
  };

  // Parsing Trưng bày Hobi (Khao_sat uses trung_bay JSON { co_so: [...] })
  const rawTB = getRawField(row, ['trung_bay', 'Trung_Bay_Hobi', 'Trưng bày Hobi', 'DisplayHobi', 'Display']);
  const isDisplayingHobi = parsePresenceFlag(rawTB);

  // Display Department
  const rawDisplayDept = String(
    getRawField(row, ['Phong_KD_Trung_Bay', 'phong_kinh_doanh', 'Phòng KD Trưng bày', 'DisplayDepartment']) || ''
  );
  let displayDepartment: AuditRecord['displayDepartment'] = 'Cả 2 phòng';
  if (!isDisplayingHobi || rawDisplayDept.includes('Không')) {
    displayDepartment = 'Không trưng bày';
  } else if (rawDisplayDept.includes('Cả 2') || rawDisplayDept.includes('Cả hai') || (rawDisplayDept.includes('Nhựa') && rawDisplayDept.includes('Gỗ'))) {
    displayDepartment = 'Cả 2 phòng';
  } else if (rawDisplayDept.includes('Nhựa')) {
    displayDepartment = 'Hobi Nhựa';
  } else if (rawDisplayDept.includes('Gỗ')) {
    displayDepartment = 'Hobi Gỗ';
  }

  // Parsing Giới thiệu Hobi (Khao_sat uses gioi_thieu JSON { co_so, phan_khuc })
  const rawGT = getRawField(row, ['gioi_thieu', 'Gioi_Thieu_Hobi', 'Giới thiệu Hobi', 'RecommendHobi', 'Recommend']);
  const isRecommendingHobi = parsePresenceFlag(rawGT);

  // Recommend Department
  const rawRecommendDept = String(
    getRawField(row, ['Phong_KD_Gioi_Thieu', 'Phòng KD Giới thiệu', 'RecommendDepartment']) || ''
  );
  let recommendDepartment: AuditRecord['recommendDepartment'] = 'Cả 2 phòng';
  if (!isRecommendingHobi || rawRecommendDept.includes('Không')) {
    recommendDepartment = 'Không giới thiệu';
  } else if (rawRecommendDept.includes('Cả 2') || rawRecommendDept.includes('Cả hai') || (rawRecommendDept.includes('Nhựa') && rawRecommendDept.includes('Gỗ'))) {
    recommendDepartment = 'Cả 2 phòng';
  } else if (rawRecommendDept.includes('Nhựa')) {
    recommendDepartment = 'Hobi Nhựa';
  } else if (rawRecommendDept.includes('Gỗ')) {
    recommendDepartment = 'Hobi Gỗ';
  }

  // Hobi Segments Recommended
  const rawSegments = getRawField(row, ['Phan_Khuc_Gioi_Thieu', 'Phân khúc giới thiệu', 'HobiSegments']);
  let hobiSegmentsRecommended: string[] = [];
  if (Array.isArray(rawSegments)) {
    hobiSegmentsRecommended = rawSegments.map(s => String(s));
  } else if (typeof rawSegments === 'string' && rawSegments.trim()) {
    hobiSegmentsRecommended = rawSegments.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  }

  // Other Brands
  const rawOtherBrands = getRawField(row, ['Thuong_Hieu_Khac', 'Thương hiệu khác', 'OtherBrands']);
  let otherBrands: string[] = [];
  if (Array.isArray(rawOtherBrands)) {
    otherBrands = rawOtherBrands.map(b => String(b));
  } else if (typeof rawOtherBrands === 'string' && rawOtherBrands.trim()) {
    otherBrands = rawOtherBrands.split(/[,;\n]/).map(b => b.trim()).filter(Boolean);
  }

  // Competitor by Segment
  const rawNonHobiCompetitors = getRawField(row, ['nonHobiCompetitorsBySegment', 'CompetitorsBySegment', 'DoiThuTheoPhanKhuc']);
  let nonHobiCompetitorsBySegment: AuditRecord['nonHobiCompetitorsBySegment'] = [];
  if (Array.isArray(rawNonHobiCompetitors)) {
    nonHobiCompetitorsBySegment = rawNonHobiCompetitors;
  } else if (typeof rawNonHobiCompetitors === 'string') {
    try {
      const parsed = JSON.parse(rawNonHobiCompetitors);
      if (Array.isArray(parsed)) nonHobiCompetitorsBySegment = parsed;
    } catch {
      // String format parsing fallback
      nonHobiCompetitorsBySegment = rawNonHobiCompetitors.split(';').map(item => {
        const parts = item.split(':');
        return {
          segment: parts[0]?.trim() || 'Phân khúc chung',
          recommendedCompetitorBrand: parts[1]?.trim() || 'Thương hiệu khác',
        };
      });
    }
  }

  return {
    id,
    dealerId: String(getRawField(row, ['DealerId', 'Ma_Dai_Ly']) || id),
    dealerName,
    address,
    phone,
    region,
    auditDate,
    mysteryShopperName,
    isDisplayingHobi,
    displayDepartment,
    isRecommendingHobi,
    recommendDepartment,
    hobiSegmentsRecommended,
    otherBrands,
    nonHobiCompetitorsBySegment,
    notes: String(getRawField(row, ['Ghi_Chu', 'Ghi chú', 'Notes']) || ''),
    rawAppSheetData: row
  };
}

export async function fetchAppSheetAudits(
  config: AppSheetConfig = DEFAULT_APPSHEET_CONFIG,
  useSampleFallback = true
): Promise<{
  records: AuditRecord[];
  isFallback: boolean;
  error?: string;
}> {
  try {
    const res = await fetch('/api/appsheet/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    const result = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      throw new Error(
        typeof result.error === 'string'
          ? result.error
          : `API /appsheet/fetch lỗi HTTP ${res.status}`
      );
    }
    if (result.success && Array.isArray(result.rows) && result.rows.length > 0) {
      const parsed = result.rows.map((r: Record<string, any>, idx: number) => parseAppSheetRowToAudit(r, idx));
      return {
        records: parsed,
        isFallback: false
      };
    }

    if (!useSampleFallback) {
      return {
        records: [],
        isFallback: false,
        error: result.error
      };
    }

    // If AppSheet returned success but empty array or error, use the baseline sample.
    return {
      records: INITIAL_MOCK_AUDITS,
      isFallback: true,
      error: result.error || 'Bảng AppSheet chưa có dữ liệu hoặc phản hồi trống. Đã nạp dữ liệu mẫu chuẩn.'
    };
  } catch (err: any) {
    console.warn('AppSheet fetch error, using initial mock data:', err?.message);
    return {
      records: useSampleFallback ? INITIAL_MOCK_AUDITS : [],
      isFallback: useSampleFallback,
      error: err?.message || 'Không thể kết nối máy chủ API AppSheet'
    };
  }
}

export async function addAppSheetAudit(record: Partial<AuditRecord>, config: AppSheetConfig = DEFAULT_APPSHEET_CONFIG) {
  try {
    const rowPayload = {
      Ten_DaiLy: record.dealerName,
      Dia_Chi: record.address,
      So_Dien_Thoai: record.phone,
      Khu_Vuc: record.region,
      Trung_Bay_Hobi: record.isDisplayingHobi ? 'Có' : 'Không',
      Phong_KD_Trung_Bay: record.displayDepartment,
      Gioi_Thieu_Hobi: record.isRecommendingHobi ? 'Có' : 'Không',
      Phong_KD_Gioi_Thieu: record.recommendDepartment,
      Phan_Khuc_Gioi_Thieu: record.hobiSegmentsRecommended?.join(', '),
      Thuong_Hieu_Khac: record.otherBrands?.join(', '),
      Ghi_Chu: record.notes
    };

    const res = await fetch('/api/appsheet/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...config,
        row: rowPayload
      })
    });

    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function fetchAppSheetTables(config: AppSheetConfig = DEFAULT_APPSHEET_CONFIG): Promise<AppSheetTablesResult> {
  try {
    const res = await fetch('/api/appsheet/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: config.appId,
        apiKey: config.apiKey
      })
    });

    const result = await res.json().catch(() => ({} as any));
    if (!res.ok) {
      return {
        success: false,
        error: typeof result.error === 'string'
          ? result.error
          : `Không thể lấy danh sách bảng (HTTP ${res.status})`,
        tables: result.tables
      };
    }

    return result as AppSheetTablesResult;
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function fetchPhanKhucItems(): Promise<{ records: PhanKhucItem[]; error?: string }> {
  try {
    const res = await fetch('/api/appsheet/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName: 'Phan_khuc' })
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      return { records: [], error: result.error || `Server status ${res.status}` };
    }

    return {
      records: (Array.isArray(result.rows) ? result.rows : []).map((row: Record<string, any>) => ({
        id: String(row.id || row.ID || row._RowNumber),
        ten_phan_khuc: String(row.Ten_phan_khuc || row.ten_phan_khuc || ''),
        ngay_tao: ''
      }))
    };
  } catch (err: any) {
    return { records: [], error: err?.message || 'Không thể tải bảng Phan_khuc' };
  }
}

export async function fetchCoSoItems(): Promise<{ records: CoSoItem[]; error?: string }> {
  try {
    const res = await fetch('/api/appsheet/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName: 'Co_so' })
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      return { records: [], error: result.error || `Server status ${res.status}` };
    }

    return {
      records: (Array.isArray(result.rows) ? result.rows : []).map((row: Record<string, any>, idx: number) => ({
        id: String(row.id || row.ID || `CS-${idx + 1}`),
        ten_co_so: String(row.Ten_co_so || row.ten_co_so || ''),
        dia_chi: String(row.dia_chi || row.Dia_chi || ''),
        so_dien_thoai: String(row.so_dien_thoai || ''),
        khu_vuc: String(row.khu_vuc || ''),
        phong_kinh_doanh: String(row.phong_kinh_doanh || ''),
        ngay_tao: String(row.ngay_tao || '')
      }))
    };
  } catch (err: any) {
    return { records: [], error: err?.message || 'Không thể tải bảng Co_so' };
  }
}
