import React, { useState, useEffect, useMemo } from 'react';
import { PhanKhucItem } from '../types';
import {
  Layers, RefreshCw, Plus, Search,
  CheckCircle2, AlertCircle, Sparkles, Download,
  Key, X, Check
} from 'lucide-react';

export const PhanKhucTable: React.FC = () => {
  const [phanKhucList, setPhanKhucList] = useState<PhanKhucItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // AppSheet sync state
  const [isFetchingFromAppSheet, setIsFetchingFromAppSheet] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Modal Add / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PhanKhucItem | null>(null);

  const [formData, setFormData] = useState({
    id: '',
    ten_phan_khuc: ''
  });
  const [pushToAppSheetImmediately, setPushToAppSheetImmediately] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate ID helper (PK-001, PK-002...)
  const generateNextId = (list: PhanKhucItem[]) => {
    const existingNumIds = list
      .map(item => {
        const match = item.id.match(/^PK-?(\d+)$/i);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));

    const maxId = existingNumIds.length > 0 ? Math.max(...existingNumIds) : 0;
    const nextNum = maxId + 1;
    return `PK-${String(nextNum).padStart(3, '0')}`;
  };

  // Open modal for Adding new item
  const handleOpenAddModal = () => {
    const newId = generateNextId(phanKhucList);
    setEditingItem(null);
    setFormData({
      id: newId,
      ten_phan_khuc: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for Editing item
  const handleOpenEditModal = (item: PhanKhucItem) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      ten_phan_khuc: item.ten_phan_khuc
    });
    setIsModalOpen(true);
  };

  // Regenerate ID in form
  const handleRegenerateId = () => {
    const newId = `PK-${Date.now().toString().slice(-4)}`;
    setFormData(prev => ({ ...prev, id: newId }));
  };

  // AppSheet accepts the exact table schema; aliases sent as extra fields reject the Add action.
  // Phan_khuc columns: id | Ten_phan_khuc
  const pushRecordToAppSheet = async (
    item: PhanKhucItem
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const appSheetRow = {
        id: item.id,
        Ten_phan_khuc: item.ten_phan_khuc
      };

      const res = await fetch('/api/appsheet/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'Phan_khuc',
          row: appSheetRow
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: typeof data.error === 'string'
            ? data.error
            : JSON.stringify(data.error || data.data || `HTTP ${res.status}`)
        };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Push error:', err);
      return { success: false, error: err?.message || 'Không thể kết nối máy chủ' };
    }
  };

  // Fetch records directly from AppSheet Phan_khuc table
  const handleFetchFromAppSheet = async () => {
    setIsFetchingFromAppSheet(true);
    try {
      const res = await fetch('/api/appsheet/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: 'Phan_khuc' })
      });
      const result = await res.json();

      if (result.success && Array.isArray(result.rows) && result.rows.length > 0) {
        const fetchedItems: PhanKhucItem[] = result.rows.map((r: any, idx: number) => ({
          id: r.id || r.Id || r.ID || r['Mã Phân Khúc'] || `PK-${String(idx + 1).padStart(3, '0')}`,
          ten_phan_khuc: r.Ten_phan_khuc || r.ten_phan_khuc || r.TenPhanKhuc || r['Tên Phân Khúc'] || 'Phân khúc không tên',
          ngay_tao: r.ngay_tao || r['Ngày Tạo'] || new Date().toISOString().split('T')[0],
          trang_thai_dong_bo: 'Đã đổ data Phan_khuc'
        }));

        setPhanKhucList(fetchedItems);
      } else {
        setPhanKhucList([]);
      }
    } catch (err) {
      setPhanKhucList([]);
    } finally {
      setIsFetchingFromAppSheet(false);
    }
  };

  useEffect(() => {
    void handleFetchFromAppSheet();
  }, []);

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ten_phan_khuc.trim()) {
      alert('Vui lòng nhập tên phân khúc (Ten_phan_khuc)!');
      return;
    }

    setIsSubmitting(true);

    const newItem: PhanKhucItem = {
      id: formData.id.trim() || generateNextId(phanKhucList),
      ten_phan_khuc: formData.ten_phan_khuc.trim(),
      ngay_tao: editingItem ? editingItem.ngay_tao : new Date().toISOString().split('T')[0],
      trang_thai_dong_bo: 'Chờ đổ data'
    };

    if (pushToAppSheetImmediately) {
      const result = await pushRecordToAppSheet(newItem);
      newItem.trang_thai_dong_bo = result.success ? 'Đã đổ data Phan_khuc' : 'Lỗi đồng bộ';
      if (!result.success) {
        alert(`AppSheet không nhận bản ghi: ${result.error || 'Không rõ lỗi'}`);
      }
    }

    if (editingItem) {
      setPhanKhucList(prev => prev.map(i => i.id === editingItem.id ? newItem : i));
    } else {
      setPhanKhucList(prev => [newItem, ...prev]);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  // Export CSV function
  const handleExportCSV = () => {
    if (phanKhucList.length === 0) return;

    const headers = ['id', 'Ten_phan_khuc', 'ngay_tao', 'trang_thai_dong_bo'];
    const rows = filteredPhanKhuc.map(item => [
      `"${item.id}"`,
      `"${item.ten_phan_khuc.replace(/"/g, '""')}"`,
      `"${item.ngay_tao}"`,
      `"${item.trang_thai_dong_bo}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,﻿' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bang_Phan_khuc_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered List
  const filteredPhanKhuc = useMemo(() => {
    return phanKhucList.filter(item =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ten_phan_khuc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [phanKhucList, searchTerm]);

  // Statistics
  const totalCount = phanKhucList.length;
  const syncedCount = phanKhucList.filter(i => i.trang_thai_dong_bo === 'Đã đổ data Phan_khuc').length;
  const pendingCount = totalCount - syncedCount;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                Bảng Danh Sách Phân Khúc (Phan_khuc)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Mã hóa tự động <span className="font-bold text-slate-800 font-mono">id</span> (PK001, PK002...), lưu trữ <span className="font-bold text-slate-800">Ten_phan_khuc</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Phân Khúc Mới</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition"
            title="Xuất file CSV chuẩn id, Ten_phan_khuc"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Tổng Số Phân Khúc</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount} <span className="text-xs font-normal text-slate-500">phân khúc</span></div>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
            <span className="font-semibold">Đã Đổ Data Phan_khuc</span>
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
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo id (PK001), Ten_phan_khuc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
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

        <div className="text-xs text-slate-500 font-medium">
          Hiển thị: <span className="font-bold text-slate-900">{filteredPhanKhuc.length}</span> / {phanKhucList.length}
        </div>
      </div>

      {/* SYNC LOGS BANNER */}
      {syncLogs.length > 0 && (
        <div className="bg-slate-900 text-slate-200 rounded-xl p-3 text-xs space-y-1 font-mono max-h-36 overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] text-purple-400 font-bold border-b border-slate-800 pb-1 mb-1">
            <span>NHẬT KÝ ĐỔ DATA VỀ BẢNG PHAN_KHUC:</span>
            <button onClick={() => setSyncLogs([])} className="text-slate-400 hover:text-white">Xóa log</button>
          </div>
          {syncLogs.map((log, idx) => (
            <div key={idx} className="leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* PHAN_KHUC DATA TABLE */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-white font-bold">
            <tr>
              <th className="p-3.5 w-28">
                <span className="block text-[10px] text-purple-400 font-mono font-normal">Cột 1</span>
                id
              </th>
              <th className="p-3.5">
                <span className="block text-[10px] text-purple-400 font-mono font-normal">Cột 2</span>
                Ten_phan_khuc
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
            {filteredPhanKhuc.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-8 text-center text-slate-400 italic">
                  Không tìm thấy phân khúc nào phù hợp với bộ lọc tìm kiếm.
                </td>
              </tr>
            ) : (
              filteredPhanKhuc.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition cursor-pointer" onClick={() => handleOpenEditModal(item)}>

                  {/* Cột 1: id */}
                  <td className="p-3 font-mono font-bold text-slate-900">
                    <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-md inline-block">
                      {item.id}
                    </span>
                  </td>

                  {/* Cột 2: Ten_phan_khuc */}
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.ten_phan_khuc}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: THÊM / SỬA PHÂN KHÚC (Cột id, Ten_phan_khuc) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base">
                  {editingItem ? `Chỉnh Sửa Phân Khúc: ${editingItem.id}` : 'Thêm Phân Khúc Mới Đổ Về Phan_khuc'}
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
                  <span>Mã Phân Khúc (<code className="text-purple-700 font-mono">id</code>):</span>
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-sm text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Mã định danh primary key tương ứng cột <code className="font-bold text-slate-700">id</code> trong bảng Phan_khuc
                </p>
              </div>

              {/* Tên Phân Khúc (cột Ten_phan_khuc) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Phân Khúc (<code className="text-purple-700 font-mono">Ten_phan_khuc</code>) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Sàn nhựa hèm khóa 4mm"
                  value={formData.ten_phan_khuc}
                  onChange={(e) => setFormData({ ...formData, ten_phan_khuc: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-bold"
                />
              </div>

              {/* Immediate Push Checkbox */}
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pushImmediatelyPK"
                  checked={pushToAppSheetImmediately}
                  onChange={(e) => setPushToAppSheetImmediately(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded-sm focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="pushImmediatelyPK" className="text-xs font-bold text-purple-900 cursor-pointer">
                  Đổ dữ liệu về bảng Phan_khuc trên AppSheet ngay khi lưu
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
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang Lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingItem ? 'Lưu Thay Đổi' : 'Xác Nhận Tạo Phân Khúc'}</span>
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
