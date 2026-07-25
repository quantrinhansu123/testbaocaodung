export interface AuditRecord {
  id: string;
  dealerId: string;
  dealerName: string;
  address: string;
  phone?: string;
  region: string;
  auditDate: string;
  mysteryShopperName?: string;
  
  // Trưng bày Hobi
  isDisplayingHobi: boolean;
  displayDepartment: 'Hobi Nhựa' | 'Hobi Gỗ' | 'Cả 2 phòng' | 'Không trưng bày';
  
  // Giới thiệu Hobi
  isRecommendingHobi: boolean;
  recommendDepartment: 'Hobi Nhựa' | 'Hobi Gỗ' | 'Cả 2 phòng' | 'Không giới thiệu';
  
  // Phân khúc Hobi được giới thiệu
  hobiSegmentsRecommended: string[]; // e.g. ['Sàn nhựa hèm khóa 4mm', 'Sàn gỗ công nghiệp 8mm', 'Tấm ốp tường PVC']
  
  // Các thương hiệu khác xuất hiện / được giới thiệu
  otherBrands: string[]; // e.g. ['An Cường', 'Kosmos', 'Inovar', 'Glotex', 'Robina']
  
  // Chi tiết thương hiệu đối thủ giới thiệu theo phân khúc khi KHÔNG giới thiệu Hobi
  nonHobiCompetitorsBySegment: Array<{
    segment: string;
    recommendedCompetitorBrand: string;
    reasonOrNote?: string;
  }>;
  
  notes?: string;
  rawAppSheetData?: Record<string, any>;
}

export interface AppSheetConfig {
  appId: string;
  apiKey: string;
  appName: string;
  tableName: string;
}

export interface AppSheetTable {
  id: string;
  name: string;
}

export interface AppSheetTablesResult {
  success: boolean;
  tables?: {
    Tables: AppSheetTable[];
  };
  error?: string;
}

export interface SyncStatus {
  lastSyncTime: string | null;
  isLoading: boolean;
  error: string | null;
  mode: 'appsheet' | 'fallback_sample';
  totalRecords: number;
}

export interface CoSoItem {
  id: string; // Mã tự tạo CS001, CS002...
  ten_co_so: string; // Tên cơ sở / đại lý
  dia_chi: string; // Địa chỉ
  so_dien_thoai: string; // Số điện thoại
  khu_vuc: string; // Khu vực (Miền Bắc, Miền Nam, Miền Trung...)
  phong_kinh_doanh: string; // Phòng kinh doanh phụ trách (Hobi Nhựa, Hobi Gỗ, Cả 2 phòng)
  ngay_tao: string; // Ngày khởi tạo / khảo sát
  trang_thai_dong_bo?: 'Chờ đổ data' | 'Đã đổ data Co_so' | 'Lỗi đồng bộ';
  ghi_chu?: string;
}

export interface PhanKhucItem {
  id: string; // Mã tự tạo PK001, PK002...
  ten_phan_khuc: string; // Tên phân khúc (VD: Sàn nhựa hèm khóa 4mm)
  ngay_tao: string; // Ngày khởi tạo
  trang_thai_dong_bo?: 'Chờ đổ data' | 'Đã đổ data Phan_khuc' | 'Lỗi đồng bộ';
}

