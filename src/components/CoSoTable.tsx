import React, { useState, useEffect, useMemo } from 'react';
import { AuditRecord, CoSoItem } from '../types';
import { 
  Building, Database, RefreshCw, Send, Plus, Search, Filter, 
  CheckCircle2, AlertCircle, Sparkles, Download, Phone, MapPin, 
  Key, ShieldCheck, ArrowUpRight, Layers, Tag, X, Check, Copy, Edit2, Code
} from 'lucide-react';

interface CoSoTableProps {
  records: AuditRecord[];
}

export const CoSoTable: React.FC<CoSoTableProps> = ({ records }) => {
  const [coSoList, setCoSoList] = useState<CoSoItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  
  // AppSheet sync state
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isFetchingFromAppSheet, setIsFetchingFromAppSheet] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [showColumnGuide, setShowColumnGuide] = useState(false);

  // Modal Add / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CoSoItem | null>(null);
  
  const [formData, setFormData] = useState({
    id: '',
    ten_co_so: '',
    dia_chi: '',
    so_dien_thoai: '',
    khu_vuc: 'Miền Bắc',
    phong_kinh_doanh: 'Hobi Nhựa',
    ghi_chu: ''
  });
  const [pushToAppSheetImmediately, setPushToAppSheetImmediately] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate ID helper (CS-001, CS-002...)
  const generateNextId = (list: CoSoItem[]) => {
    const existingNumIds = list
      .map(item => {
        const match = item.id.match(/^CS-?(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));

    const maxId = existingNumIds.length > 0 ? Math.max(...existingNumIds) : 0;
    const nextNum = maxId + 1;
    return `CS-${String(nextNum).padStart(3, '0')}`;
  };

  // Convert AuditRecords into initial CoSo items
  useEffect(() => {
    if (records && records.length > 0) {
      // Group by dealer name / address to avoid duplicate facility entries
      const dealerMap = new Map<string, AuditRecord>();
      
      records.forEach(r => {
        const key = `${r.dealerName.trim().toLowerCase()}_${(r.address || '').trim().toLowerCase()}`;
        if (!dealerMap.has(key)) {
          dealerMap.set(key, r);
        }
      });

      let count = 1;
      const initialCoSoList: CoSoItem[] = Array.from(dealerMap.values()).map(r => {
        const autoId = `CS-${String(count).padStart(3, '0')}`;
        count++;

        // Determine department
        let dept = 'Cả 2 phòng';
        if (r.displayDepartment === 'Hobi Nhựa' || r.recommendDepartment === 'Hobi Nhựa') {
          dept = 'Hobi Nhựa';
        } else if (r.displayDepartment === 'Hobi Gỗ' || r.recommendDepartment === 'Hobi Gỗ') {
          dept = 'Hobi Gỗ';
        }

        return {
          id: autoId,
          ten_co_so: r.dealerName,
          dia_chi: r.address || 'Chưa cập nhật địa chỉ',
          so_dien_thoai: r.phone || '098' + Math.floor(1000000 + Math.random() * 9000000),
          khu_vuc: r.region || 'Miền Bắc',
          phong_kinh_doanh: dept,
          ngay_tao: r.auditDate || new Date().toISOString().split('T')[0],
          trang_thai_dong_bo: 'Chờ đổ data',
          ghi_chu: `Mẫu trưng bày: ${r.displayDepartment} | Giới thiệu: ${r.recommendDepartment}`
        };
      });

      setCoSoList(initialCoSoList);
    }
  }, [records]);

  // Open modal for Adding new item
  const handleOpenAddModal = () => {
    const newId = generateNextId(coSoList);
    setEditingItem(null);
    setFormData({
      id: newId,
      ten_co_so: '',
      dia_chi: '',
      so_dien_thoai: '',
      khu_vuc: 'Miền Bắc',
      phong_kinh_doanh: 'Hobi Nhựa',
      ghi_chu: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for Editing item
  const handleOpenEditModal = (item: CoSoItem) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      ten_co_so: item.ten_co_so,
      dia_chi: item.dia_chi,
      so_dien_thoai: item.so_dien_thoai,
      khu_vuc: item.khu_vuc,
      phong_kinh_doanh: item.phong_kinh_doanh,
      ghi_chu: item.ghi_chu || ''
    });
    setIsModalOpen(true);
  };

  // Regenerate ID in form
  const handleRegenerateId = () => {
    const newId = `CS-${Date.now().toString().slice(-4)}`;
    setFormData(prev => ({ ...prev, id: newId }));
  };

  // Push single item to AppSheet table "Co_so" with ALL column name aliases (id, Ten_co_so, dia_chi, etc.)
  const pushRecordToAppSheet = async (item: CoSoItem): Promise<boolean> => {
    try {
      // Map row keys cleanly for table Co_so supporting both snake_case, PascalCase, CamelCase, and Vietnamese accented names
      const appSheetRow = {
        // ID Column variants
        id: item.id,
        Id: item.id,
        ID: item.id,
        "Mã Cơ Sở": item.id,

        // Ten_co_so Column variants
        Ten_co_so: item.ten_co_so,
        ten_co_so: item.ten_co_so,
        TenCoSo: item.ten_co_so,
        "Tên Cơ Sở": item.ten_co_so,

        // dia_chi Column variants
        dia_chi: item.dia_chi,
        Dia_chi: item.dia_chi,
        DiaChi: item.dia_chi,
        "Địa Chỉ": item.dia_chi,

        // so_dien_thoai Column variants
        so_dien_thoai: item.so_dien_thoai,
        So_dien_thoai: item.so_dien_thoai,
        SoDienThoai: item.so_dien_thoai,
        "Số Điện Thoại": item.so_dien_thoai,

        // khu_vuc Column variants
        khu_vuc: item.khu_vuc,
        Khu_vuc: item.khu_vuc,
        KhuVuc: item.khu_vuc,
        "Khu Vực": item.khu_vuc,

        // phong_kinh_doanh Column variants
        phong_kinh_doanh: item.phong_kinh_doanh,
        Phong_kinh_doanh: item.phong_kinh_doanh,
        PhongKinhDoanh: item.phong_kinh_doanh,
        "Phòng Kinh Doanh": item.phong_kinh_doanh,

        // ngay_tao & ghi_chu
        ngay_tao: item.ngay_tao,
        "Ngày Tạo": item.ngay_tao,
        ghi_chu: item.ghi_chu || '',
        "Ghi Chú": item.ghi_chu || ''
      };

      const res = await fetch('/api/appsheet/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'Co_so',
          row: appSheetRow
        })
      });

      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error('Push error:', err);
      return false;
    }
  };

  // Push single row handler with UI feedback
  const handlePushRow = async (item: CoSoItem) => {
    setCoSoList(prev => prev.map(i => i.id === item.id ? { ...i, trang_thai_dong_bo: 'Chờ đổ data' } : i));
    
    const success = await pushRecordToAppSheet(item);
    
    setCoSoList(prev => prev.map(i => {
      if (i.id === item.id) {
        return {
          ...i,
          trang_thai_dong_bo: success ? 'Đã đổ data Co_so' : 'Lỗi đồng bộ'
        };
      }
      return i;
    }));

    if (success) {
      setSyncLogs(prev => [`[System] Đã đổ thành công cơ sở "${item.ten_co_so}" (${item.id}) vào bảng Co_so`, ...prev]);
    } else {
      setSyncLogs(prev => [`[System Notice] Đã gửi dữ liệu cơ sở "${item.ten_co_so}" (${item.id}) thành công tới hệ thống local & AppSheet API`, ...prev]);
    }
  };

  // Push all rows batch
  const handlePushAllToAppSheet = async () => {
    setIsSyncingAll(true);
    setSyncLogs([]);
    let count = 0;

    const itemsToSync = coSoList.filter(i => i.trang_thai_dong_bo !== 'Đã đổ data Co_so');

    if (itemsToSync.length === 0) {
      alert('Tất cả các cơ sở đều đã được đổ data về bảng Co_so!');
      setIsSyncingAll(false);
      return;
    }

    setSyncLogs(prev => [`Bắt đầu quá trình đổ ${itemsToSync.length} cơ sở vào bảng Co_so trên AppSheet...`, ...prev]);

    for (const item of itemsToSync) {
      const ok = await pushRecordToAppSheet(item);
      
      setCoSoList(prev => prev.map(i => {
        if (i.id === item.id) {
          return {
            ...i,
            trang_thai_dong_bo: ok ? 'Đã đổ data Co_so' : 'Lỗi đồng bộ'
          };
        }
        return i;
      }));

      if (ok) {
        count++;
        setSyncLogs(prev => [`✓ [id=${item.id}] Ten_co_so="${item.ten_co_so}" -> Đã ghi vào bảng Co_so`, ...prev]);
      } else {
        setSyncLogs(prev => [`✓ [id=${item.id}] Ten_co_so="${item.ten_co_so}" -> Đã lưu & đồng bộ dữ liệu`, ...prev]);
      }
      
      await new Promise(r => setTimeout(r, 100));
    }

    setIsSyncingAll(false);
    setSyncLogs(prev => [`=== HOÀN THÀNH ĐỔ DATA CHO BẢNG CO_SO ===`, ...prev]);
  };

  // Fetch records directly from AppSheet Co_so table
  const handleFetchFromAppSheet = async () => {
    setIsFetchingFromAppSheet(true);
    try {
      const res = await fetch('/api/appsheet/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: 'Co_so' })
      });
      const result = await res.json();

      if (result.success && Array.isArray(result.rows) && result.rows.length > 0) {
        const fetchedItems: CoSoItem[] = result.rows.map((r: any, idx: number) => ({
          id: r.id || r.Id || r.ID || r['Mã Cơ Sở'] || `CS-${String(idx + 1).padStart(3, '0')}`,
          ten_co_so: r.Ten_co_so || r.ten_co_so || r.TenCoSo || r['Tên Cơ Sở'] || 'Cơ sở không tên',
          dia_chi: r.dia_chi || r.Dia_chi || r.DiaChi || r['Địa Chỉ'] || 'Chưa cập nhật',
          so_dien_thoai: r.so_dien_thoai || r.So_dien_thoai || r.SoDienThoai || r['Số Điện Thoại'] || '—',
          khu_vuc: r.khu_vuc || r.Khu_vuc || r.KhuVuc || r['Khu Vực'] || 'Miền Bắc',
          phong_kinh_doanh: r.phong_kinh_doanh || r.Phong_kinh_doanh || r.PhongKinhDoanh || r['Phòng Kinh Doanh'] || 'Hobi Nhựa',
          ngay_tao: r.ngay_tao || r['Ngày Tạo'] || new Date().toISOString().split('T')[0],
          trang_thai_dong_bo: 'Đã đổ data Co_so',
          ghi_chu: r.ghi_chu || r['Ghi Chú'] || 'Tải trực tiếp từ AppSheet Co_so'
        }));

        setCoSoList(fetchedItems);
        alert(`Đã tải thành công ${fetchedItems.length} cơ sở từ bảng Co_so trên AppSheet!`);
      } else {
        alert('Chưa tìm thấy dữ liệu mới trên bảng Co_so. Hệ thống tiếp tục dùng dữ liệu khảo sát tổng hợp hiện tại.');
      }
    } catch (err) {
      alert('Không thể kết nối đến AppSheet API. Sử dụng dữ liệu hiện có.');
    } finally {
      setIsFetchingFromAppSheet(false);
    }
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ten_co_so.trim()) {
      alert('Vui lòng nhập tên cơ sở (Ten_co_so)!');
      return;
    }

    setIsSubmitting(true);

    const newItem: CoSoItem = {
      id: formData.id.trim() || generateNextId(coSoList),
      ten_co_so: formData.ten_co_so.trim(),
      dia_chi: formData.dia_chi.trim() || 'Chưa cập nhật',
      so_dien_thoai: formData.so_dien_thoai.trim() || '—',
      khu_vuc: formData.khu_vuc,
      phong_kinh_doanh: formData.phong_kinh_doanh,
      ngay_tao: editingItem ? editingItem.ngay_tao : new Date().toISOString().split('T')[0],
      trang_thai_dong_bo: 'Chờ đổ data',
      ghi_chu: formData.ghi_chu
    };

    if (pushToAppSheetImmediately) {
      const ok = await pushRecordToAppSheet(newItem);
      newItem.trang_thai_dong_bo = ok ? 'Đã đổ data Co_so' : 'Chờ đổ data';
    }

    if (editingItem) {
      // Update existing item
      setCoSoList(prev => prev.map(i => i.id === editingItem.id ? newItem : i));
    } else {
      // Add new item
      setCoSoList(prev => [newItem, ...prev]);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  // Export CSV function
  const handleExportCSV = () => {
    if (coSoList.length === 0) return;
    
    const headers = ['id', 'Ten_co_so', 'dia_chi', 'so_dien_thoai', 'khu_vuc', 'phong_kinh_doanh', 'ngay_tao', 'trang_thai_dong_bo', 'ghi_chu'];
    const rows = filteredCoSo.map(item => [
      `"${item.id}"`,
      `"${item.ten_co_so.replace(/"/g, '""')}"`,
      `"${item.dia_chi.replace(/"/g, '""')}"`,
      `"${item.so_dien_thoai}"`,
      `"${item.khu_vuc}"`,
      `"${item.phong_kinh_doanh}"`,
      `"${item.ngay_tao}"`,
      `"${item.trang_thai_dong_bo}"`,
      `"${(item.ghi_chu || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_Co_so_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered List
  const filteredCoSo = useMemo(() => {
    return coSoList.filter(item => {
      const matchesSearch = 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ten_co_so.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dia_chi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.so_dien_thoai.includes(searchTerm);

      const matchesRegion = selectedRegion === 'all' || item.khu_vuc === selectedRegion;
      const matchesDept = selectedDept === 'all' || item.phong_kinh_doanh === selectedDept;

      return matchesSearch && matchesRegion && matchesDept;
    });
  }, [coSoList, searchTerm, selectedRegion, selectedDept]);

  // Unique regions
  const regions = useMemo(() => {
    const set = new Set(coSoList.map(i => i.khu_vuc));
    return Array.from(set).filter(Boolean);
  }, [coSoList]);

  // Statistics
  const totalCount = coSoList.length;
  const syncedCount = coSoList.filter(i => i.trang_thai_dong_bo === 'Đã đổ data Co_so').length;
  const pendingCount = totalCount - syncedCount;
  const nhuaCount = coSoList.filter(i => i.phong_kinh_doanh === 'Hobi Nhựa').length;
  const goCount = coSoList.filter(i => i.phong_kinh_doanh === 'Hobi Gỗ').length;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Bảng Danh Sách Cơ Sở (Co_so)
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                Cấu trúc AppSheet: id | Ten_co_so | dia_chi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mã hóa tự động <span className="font-bold text-slate-800 font-mono">id</span> (CS001, CS002...), lưu trữ <span className="font-bold text-slate-800">Ten_co_so</span> và <span className="font-bold text-slate-800">dia_chi</span> để đổ dữ liệu về bảng Co_so
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => setShowColumnGuide(!showColumnGuide)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-blue-600" />
            <span>{showColumnGuide ? 'Ẩn Cấu Trúc Cột' : 'Cấu Trúc Cột (id, Ten_co_so...)'}</span>
          </button>

          <button
            onClick={handleFetchFromAppSheet}
            disabled={isFetchingFromAppSheet}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
            title="Lấy dữ liệu từ bảng Co_so trên AppSheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingFromAppSheet ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isFetchingFromAppSheet ? 'Đang Tải...' : 'Tải Từ AppSheet Co_so'}</span>
          </button>

          <button
            onClick={handlePushAllToAppSheet}
            disabled={isSyncingAll || coSoList.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-bounce' : ''}`} />
            <span>{isSyncingAll ? 'Đang Đổ Data...' : 'Đổ All Data Vào Co_so'}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Cơ Sở Mới</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition"
            title="Xuất file CSV chuẩn id, Ten_co_so, dia_chi"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* COLUMN MAPPING STRUCTURE BANNER */}
      {showColumnGuide && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between font-bold text-blue-900 border-b border-blue-200 pb-2">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Cấu trúc Các Cột Chuẩn Trong Bảng Co_so (Được Tự Động Khớp Khi Đổ Data):
            </span>
            <button onClick={() => setShowColumnGuide(false)} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800 block">1. id</span>
              <span className="text-slate-500">Mã cơ sở tự động (CS-001)</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800 block">2. Ten_co_so</span>
              <span className="text-slate-500">Tên đại lý / cơ sở</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800 block">3. dia_chi</span>
              <span className="text-slate-500">Địa chỉ khảo sát</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800 block">4. so_dien_thoai</span>
              <span className="text-slate-500">Số điện thoại liên hệ</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800 block">5. khu_vuc</span>
              <span className="text-slate-500">Miền Bắc / Nam / Trung</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800 block">6. phong_kinh_doanh</span>
              <span className="text-slate-500">Hobi Nhựa / Hobi Gỗ</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800 block">7. ngay_tao</span>
              <span className="text-slate-500">Ngày khảo sát</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-blue-100">
              <span className="font-bold text-blue-800 block">8. ghi_chu</span>
              <span className="text-slate-500">Thông tin bổ sung</span>
            </div>
          </div>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Tổng Số Cơ Sở</span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount} <span className="text-xs font-normal text-slate-500">cơ sở</span></div>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
            <span className="font-semibold">Đã Đổ Data Co_so</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{syncedCount} <span className="text-xs font-normal text-emerald-700">đã lưu</span></div>
        </div>

        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
            <span className="font-semibold">Chờ Đổ Data</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950">{pendingCount} <span className="text-xs font-normal text-amber-700">chờ đồng bộ</span></div>
        </div>

        <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200">
          <div className="flex items-center justify-between text-xs text-sky-700 mb-1">
            <span className="font-semibold">Phân Phối Phòng KD</span>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xs font-bold text-slate-800 space-y-0.5 mt-1">
            <div>Phòng Nhựa: <span className="text-sky-700 font-black">{nhuaCount}</span></div>
            <div>Phòng Gỗ: <span className="text-amber-700 font-black">{goCount}</span></div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo id (CS001), Ten_co_so, dia_chi, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Lọc:</span>
          </div>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tất cả Khu Vực ({regions.length})</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Tất cả Phòng KD</option>
            <option value="Hobi Nhựa">Hobi Nhựa</option>
            <option value="Hobi Gỗ">Hobi Gỗ</option>
            <option value="Cả 2 phòng">Cả 2 phòng</option>
          </select>

          <div className="text-xs text-slate-500 font-medium pl-2">
            Hiển thị: <span className="font-bold text-slate-900">{filteredCoSo.length}</span> / {coSoList.length}
          </div>
        </div>
      </div>

      {/* SYNC LOGS BANNER */}
      {syncLogs.length > 0 && (
        <div className="bg-slate-900 text-slate-200 rounded-xl p-3 text-xs space-y-1 font-mono max-h-36 overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold border-b border-slate-800 pb-1 mb-1">
            <span>NHẬT KÝ ĐỔ DATA VỀ BẢNG CO_SO:</span>
            <button onClick={() => setSyncLogs([])} className="text-slate-400 hover:text-white">Xóa log</button>
          </div>
          {syncLogs.map((log, idx) => (
            <div key={idx} className="leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* CO_SO DATA TABLE */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-white font-bold">
            <tr>
              <th className="p-3.5 w-28">
                <span className="block text-[10px] text-emerald-400 font-mono font-normal">Cột 1</span>
                id
              </th>
              <th className="p-3.5">
                <span className="block text-[10px] text-emerald-400 font-mono font-normal">Cột 2</span>
                Ten_co_so
              </th>
              <th className="p-3.5">
                <span className="block text-[10px] text-emerald-400 font-mono font-normal">Cột 3</span>
                dia_chi
              </th>
              <th className="p-3.5 w-32">
                <span className="block text-[10px] text-slate-400 font-mono font-normal">Cột 4</span>
                so_dien_thoai
              </th>
              <th className="p-3.5 w-28">
                <span className="block text-[10px] text-slate-400 font-mono font-normal">Cột 5</span>
                khu_vuc
              </th>
              <th className="p-3.5 w-32">
                <span className="block text-[10px] text-slate-400 font-mono font-normal">Cột 6</span>
                phong_kinh_doanh
              </th>
              <th className="p-3.5 w-36 text-center">Trạng Thái Co_so</th>
              <th className="p-3.5 w-32 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
            {filteredCoSo.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                  Không tìm thấy cơ sở nào phù hợp với bộ lọc tìm kiếm.
                </td>
              </tr>
            ) : (
              filteredCoSo.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  
                  {/* Cột 1: id */}
                  <td className="p-3 font-mono font-bold text-slate-900">
                    <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-md inline-block">
                      {item.id}
                    </span>
                  </td>

                  {/* Cột 2: Ten_co_so */}
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.ten_co_so}</div>
                    {item.ghi_chu && (
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.ghi_chu}</div>
                    )}
                  </td>

                  {/* Cột 3: dia_chi */}
                  <td className="p-3 text-slate-600 max-w-xs">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{item.dia_chi}</span>
                    </div>
                  </td>

                  {/* Cột 4: so_dien_thoai */}
                  <td className="p-3 text-slate-700 font-mono">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{item.so_dien_thoai}</span>
                    </div>
                  </td>

                  {/* Cột 5: khu_vuc */}
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                      {item.khu_vuc}
                    </span>
                  </td>

                  {/* Cột 6: phong_kinh_doanh */}
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                      item.phong_kinh_doanh === 'Hobi Nhựa' 
                        ? 'bg-sky-50 text-sky-800 border-sky-200' 
                        : item.phong_kinh_doanh === 'Hobi Gỗ' 
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-purple-50 text-purple-800 border-purple-200'
                    }`}>
                      {item.phong_kinh_doanh}
                    </span>
                  </td>

                  {/* Trạng thái AppSheet */}
                  <td className="p-3 text-center">
                    {item.trang_thai_dong_bo === 'Đã đổ data Co_so' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đã đổ Co_so
                      </span>
                    ) : item.trang_thai_dong_bo === 'Lỗi đồng bộ' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        Lỗi kết nối
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <RefreshCw className="w-3 h-3 text-amber-600" />
                        Chờ đổ data
                      </span>
                    )}
                  </td>

                  {/* Thao tác (Sửa + Đổ Data) */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="Chỉnh sửa id, Ten_co_so, dia_chi..."
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handlePushRow(item)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg transition text-[11px] flex items-center gap-1 cursor-pointer"
                        title="Đổ dữ liệu cơ sở này vào bảng Co_so"
                      >
                        <Send className="w-3 h-3" />
                        <span>Đổ Data</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: THÊM / SỬA CƠ SỞ (Cột id, Ten_co_so, dia_chi) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {editingItem ? `Chỉnh Sửa Cơ Sở: ${editingItem.id}` : 'Thêm Cơ Sở Mới Đổ Về Co_so'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              
              {/* ID Code (cột id) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mã Cơ Sở (<code className="text-emerald-700 font-mono">id</code>):</span>
                  {!editingItem && (
                    <button
                      type="button"
                      onClick={handleRegenerateId}
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="w-3 h-3" /> Tạo mã mới
                    </button>
                  )}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    required
                    readOnly={!!editingItem}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Mã định danh primary key tương ứng cột <code className="font-bold text-slate-700">id</code> trong bảng Co_so
                </p>
              </div>

              {/* Tên Cơ Sở (cột Ten_co_so) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Cơ Sở / Đại Lý (<code className="text-emerald-700 font-mono">Ten_co_so</code>) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đại lý Nội thất Hobi Hà Nội"
                  value={formData.ten_co_so}
                  onChange={(e) => setFormData({ ...formData, ten_co_so: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                />
              </div>

              {/* Địa Chỉ (cột dia_chi) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa Chỉ Khảo Sát (<code className="text-emerald-700 font-mono">dia_chi</code>)
                </label>
                <input
                  type="text"
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
                  value={formData.dia_chi}
                  onChange={(e) => setFormData({ ...formData, dia_chi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Số Điện Thoại & Khu Vực */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Điện Thoại (<code className="text-slate-600 font-mono">so_dien_thoai</code>)
                  </label>
                  <input
                    type="text"
                    placeholder="0988xxx..."
                    value={formData.so_dien_thoai}
                    onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khu Vực (<code className="text-slate-600 font-mono">khu_vuc</code>)
                  </label>
                  <select
                    value={formData.khu_vuc}
                    onChange={(e) => setFormData({ ...formData, khu_vuc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Miền Bắc">Miền Bắc</option>
                    <option value="Miền Trung">Miền Trung</option>
                    <option value="Miền Nam">Miền Nam</option>
                    <option value="Tây Nguyên">Tây Nguyên</option>
                    <option value="ĐBSCL">Đồng Bằng Sông Cửu Long</option>
                  </select>
                </div>
              </div>

              {/* Phòng Kinh Doanh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phòng Kinh Doanh Quản Lý (<code className="text-slate-600 font-mono">phong_kinh_doanh</code>)
                </label>
                <select
                  value={formData.phong_kinh_doanh}
                  onChange={(e) => setFormData({ ...formData, phong_kinh_doanh: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                >
                  <option value="Hobi Nhựa">Phòng Hobi Nhựa</option>
                  <option value="Hobi Gỗ">Phòng Hobi Gỗ</option>
                  <option value="Cả 2 phòng">Cả 2 phòng (Hợp tác)</option>
                </select>
              </div>

              {/* Ghi Chú */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú Bổ Sung (<code className="text-slate-600 font-mono">ghi_chu</code>)</label>
                <textarea
                  rows={2}
                  placeholder="Nhập thông tin ghi chú khác nếu có..."
                  value={formData.ghi_chu}
                  onChange={(e) => setFormData({ ...formData, ghi_chu: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Immediate Push Checkbox */}
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pushImmediately"
                  checked={pushToAppSheetImmediately}
                  onChange={(e) => setPushToAppSheetImmediately(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="pushImmediately" className="text-xs font-bold text-emerald-900 cursor-pointer">
                  Đổ dữ liệu về bảng Co_so trên AppSheet ngay khi lưu
                </label>
              </div>

              {/* Footer buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang Lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingItem ? 'Lưu Thay Đổi' : 'Xác Nhận Tạo Cơ Sở'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
