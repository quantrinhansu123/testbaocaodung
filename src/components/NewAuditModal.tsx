import React, { useState } from 'react';
import { AuditRecord, AppSheetConfig } from '../types';
import { addAppSheetAudit } from '../services/appsheetService';
import { X, Save, Plus, Store, CheckCircle2, AlertCircle } from 'lucide-react';

interface NewAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocalRecord: (record: AuditRecord) => void;
  config: AppSheetConfig;
}

export const NewAuditModal: React.FC<NewAuditModalProps> = ({
  isOpen,
  onClose,
  onAddLocalRecord,
  config,
}) => {
  const [dealerName, setDealerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Hà Nội');
  const [mysteryShopperName, setMysteryShopperName] = useState('Phạm Văn Hùng');
  
  const [isDisplayingHobi, setIsDisplayingHobi] = useState(true);
  const [displayDepartment, setDisplayDepartment] = useState<AuditRecord['displayDepartment']>('Cả 2 phòng');
  
  const [isRecommendingHobi, setIsRecommendingHobi] = useState(true);
  const [recommendDepartment, setRecommendDepartment] = useState<AuditRecord['recommendDepartment']>('Cả 2 phòng');
  
  const [segmentsInput, setSegmentsInput] = useState('Sàn nhựa hèm khóa 4mm, Sàn gỗ công nghiệp 8mm');
  const [otherBrandsInput, setOtherBrandsInput] = useState('Kosmos, An Cường');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerName.trim() || !address.trim()) {
      alert('Vui lòng nhập tên đại lý và địa chỉ.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    const newRecord: AuditRecord = {
      id: `TRB-${Date.now().toString().slice(-4)}`,
      dealerId: `DL-${Math.floor(Math.random() * 90 + 10)}`,
      dealerName: dealerName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      region,
      auditDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      mysteryShopperName,
      isDisplayingHobi,
      displayDepartment: isDisplayingHobi ? displayDepartment : 'Không trưng bày',
      isRecommendingHobi,
      recommendDepartment: isRecommendingHobi ? recommendDepartment : 'Không giới thiệu',
      hobiSegmentsRecommended: segmentsInput.split(',').map(s => s.trim()).filter(Boolean),
      otherBrands: otherBrandsInput.split(',').map(b => b.trim()).filter(Boolean),
      nonHobiCompetitorsBySegment: [],
      notes: notes.trim()
    };

    // Push to AppSheet API
    const res = await addAppSheetAudit(newRecord, config);
    if (res.success) {
      setSubmitMessage('Đã thêm thành công vào AppSheet API!');
    } else {
      setSubmitMessage('Đã thêm vào dữ liệu thời gian thực ứng dụng!');
    }

    onAddLocalRecord(newRecord);
    setIsSubmitting(false);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Thêm Phiếu Khảo Sát Thị Trường Mới
              </h3>
              <p className="text-xs text-slate-500">
                Gửi dữ liệu trực tiếp tới AppSheet API (Bảng: {config.tableName})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Dealer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên Đại Lý *</label>
              <input
                type="text"
                required
                placeholder="VD: Đại lý Sàn Gỗ An Tâm"
                value={dealerName}
                onChange={(e) => setDealerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Khu Vực / Tỉnh Thành</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP.HCM">TP.HCM</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Cần Thơ">Cần Thơ</option>
                <option value="Bình Dương">Bình Dương</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Địa Chỉ Chi Tiết *</label>
              <input
                type="text"
                required
                placeholder="VD: 123 Lê Lợi, Q.1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại</label>
              <input
                type="text"
                placeholder="0912..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Trưng bày Hobi */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Trưng Bày Mẫu Hobi:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDisplayingHobi}
                  onChange={(e) => setIsDisplayingHobi(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">Đã Trưng Bày</span>
              </label>
            </div>

            {isDisplayingHobi && (
              <div>
                <label className="block font-bold text-slate-600 mb-1">Phòng KD Trưng Bày:</label>
                <select
                  value={displayDepartment}
                  onChange={(e) => setDisplayDepartment(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="Cả 2 phòng">Cả 2 phòng (Hobi Nhựa + Hobi Gỗ)</option>
                  <option value="Hobi Nhựa">Hobi Nhựa</option>
                  <option value="Hobi Gỗ">Hobi Gỗ</option>
                </select>
              </div>
            )}
          </div>

          {/* Giới thiệu Hobi */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Giới Thiệu Sản Phẩm Hobi:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecommendingHobi}
                  onChange={(e) => setIsRecommendingHobi(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-700">Đã Giới Thiệu</span>
              </label>
            </div>

            {isRecommendingHobi && (
              <div>
                <label className="block font-bold text-slate-600 mb-1">Phòng KD Được Giới Thiệu:</label>
                <select
                  value={recommendDepartment}
                  onChange={(e) => setRecommendDepartment(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="Cả 2 phòng">Cả 2 phòng (Hobi Nhựa + Hobi Gỗ)</option>
                  <option value="Hobi Nhựa">Hobi Nhựa</option>
                  <option value="Hobi Gỗ">Hobi Gỗ</option>
                </select>
              </div>
            )}
          </div>

          {/* Phân khúc Hobi & Thương hiệu khác */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Các Phân Khúc Hobi Được Giới Thiệu (Phẩy cách nhau):</label>
            <input
              type="text"
              placeholder="Sàn nhựa hèm khóa 4mm, Sàn gỗ công nghiệp 8mm, Tấm ốp tường PVC"
              value={segmentsInput}
              onChange={(e) => setSegmentsInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Thương Hiệu Cạnh Tranh / Khác Tại Đại Lý:</label>
            <input
              type="text"
              placeholder="Kosmos, An Cường, Glotex, Inovar"
              value={otherBrandsInput}
              onChange={(e) => setOtherBrandsInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi Chú Khảo Sát:</label>
            <textarea
              rows={2}
              placeholder="Thái độ tư vấn của nhân viên, vị trí đặt kệ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Đang lưu...' : 'Lưu Phiếu Khảo Sát'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
