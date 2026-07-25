import React, { useEffect, useRef, useState } from 'react';
import { AuditRecord, AppSheetConfig } from '../types';
import { X, Save, Plus, Store, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

interface NewAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocalRecord: (record: AuditRecord) => void;
  onSaved?: () => Promise<void>;
  config: AppSheetConfig;
  dealers: AuditRecord[];
}

const DEPARTMENT_OPTIONS = ['Hobi Nhựa', 'Hobi Gỗ'] as const;

const toDepartmentValue = (selected: string[]): string =>
  selected.length === 2 ? 'Cả 2 phòng' : selected[0];

const DepartmentMultiSelect: React.FC<{
  label: string;
  selected: string[];
  onChange: (next: string[]) => void;
  options?: readonly string[];
  placeholder?: string;
}> = ({ label, selected, onChange, options = DEPARTMENT_OPTIONS, placeholder = 'Chọn phòng KD' }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    onChange(
      selected.includes(option)
        ? selected.filter(item => item !== option)
        : [...selected, option]
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block font-bold text-slate-600 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-left"
      >
        <span className={selected.length ? '' : 'text-slate-400 font-normal'}>
          {selected.length ? selected.join(', ') : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-2 space-y-1">
          {options.map(option => (
            <label
              key={option}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer font-semibold text-slate-700"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const NewAuditModal: React.FC<NewAuditModalProps> = ({
  isOpen,
  onClose,
  onAddLocalRecord,
  onSaved,
  config,
  dealers,
}) => {
  const [dealerName, setDealerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Hà Nội');
  const [mysteryShopperName, setMysteryShopperName] = useState('Phạm Văn Hùng');
  
  const [isDisplayingHobi, setIsDisplayingHobi] = useState(true);
  const [displayDepts, setDisplayDepts] = useState<string[]>(['Hobi Nhựa', 'Hobi Gỗ']);

  const [isRecommendingHobi, setIsRecommendingHobi] = useState(true);
  const [recommendDepts, setRecommendDepts] = useState<string[]>(['Hobi Nhựa', 'Hobi Gỗ']);
  
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [segmentOptions, setSegmentOptions] = useState<string[]>([]);
  const [otherBrands, setOtherBrands] = useState<string[]>([]);
  const [competitorOptions, setCompetitorOptions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const fetchTable = (tableName: string) => fetch('/api/appsheet/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName })
    }).then(response => response.json());

    void Promise.all([fetchTable('Co_so'), fetchTable('Phan_khuc')])
      .then(([coSoResult, segmentResult]) => {
        if (cancelled) return;
        const names = (Array.isArray(coSoResult.rows) ? coSoResult.rows : [])
          .map((row: Record<string, any>) => row.Ten_co_so || row.ten_co_so)
          .filter((name: unknown): name is string => typeof name === 'string' && name.trim().length > 0);
        setCompetitorOptions(Array.from(new Set(names)));
        const segments = (Array.isArray(segmentResult.rows) ? segmentResult.rows : [])
          .map((row: Record<string, any>) => row.Ten_phan_khuc || row.ten_phan_khuc)
          .filter((name: unknown): name is string => typeof name === 'string' && name.trim().length > 0);
        setSegmentOptions(Array.from(new Set(segments)));
      })
      .catch(() => {
        setCompetitorOptions([]);
        setSegmentOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerName.trim() || !address.trim()) {
      alert('Vui lòng chọn tên đại lý và nhập địa chỉ.');
      return;
    }
    if (isDisplayingHobi && displayDepts.length === 0) {
      alert('Vui lòng chọn ít nhất 1 phòng KD trưng bày.');
      return;
    }
    if (isRecommendingHobi && recommendDepts.length === 0) {
      alert('Vui lòng chọn ít nhất 1 phòng KD được giới thiệu.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    const numericId = Number(Date.now().toString().slice(-9));
    const newRecord: AuditRecord = {
      id: String(numericId),
      dealerId: `DL-${Math.floor(Math.random() * 90 + 10)}`,
      dealerName: dealerName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      region,
      auditDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      mysteryShopperName,
      isDisplayingHobi,
      displayDepartment: isDisplayingHobi ? (toDepartmentValue(displayDepts) as AuditRecord['displayDepartment']) : 'Không trưng bày',
      isRecommendingHobi,
      recommendDepartment: isRecommendingHobi ? (toDepartmentValue(recommendDepts) as AuditRecord['recommendDepartment']) : 'Không giới thiệu',
      hobiSegmentsRecommended: selectedSegments,
      otherBrands,
      nonHobiCompetitorsBySegment: [],
      notes: notes.trim()
    };

    const response = await fetch('/api/appsheet/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: config.appId,
        apiKey: config.apiKey,
        tableName: 'Khao_sat',
        row: {
          id: numericId,
          dai_ly: newRecord.dealerName,
          trung_bay: newRecord.isDisplayingHobi ? displayDepts.join(', ') : 'Không',
          gioi_thieu: newRecord.isRecommendingHobi ? recommendDepts.join(', ') : 'Không'
        }
      })
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      const message = typeof result.error === 'string'
        ? result.error
        : JSON.stringify(result.error || result.data || `HTTP ${response.status}`);
      setSubmitMessage(`Không thể lưu vào Khao_sat: ${message}`);
      setIsSubmitting(false);
      return;
    }

    setSubmitMessage('Đã thêm thành công vào bảng Khao_sat!');
    onAddLocalRecord(newRecord);
    if (onSaved) await onSaved();
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
                Gửi dữ liệu trực tiếp tới AppSheet API (Bảng: Khao_sat)
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
              <select
                required
                value={dealerName}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  setDealerName(selectedName);
                  const selectedDealer = dealers.find(item => item.dealerName === selectedName);
                  if (selectedDealer?.address) setAddress(selectedDealer.address);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn đại lý từ bảng Dai_ly</option>
                {dealers.map(item => (
                  <option key={item.id} value={item.dealerName}>
                    {item.dealerName}
                  </option>
                ))}
              </select>
              {dealers.length === 0 && (
                <p className="mt-1 text-[11px] text-amber-700">Bảng Dai_ly chưa có dữ liệu.</p>
              )}
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
              <DepartmentMultiSelect
                label="Phòng KD Trưng Bày:"
                selected={displayDepts}
                onChange={setDisplayDepts}
              />
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
              <DepartmentMultiSelect
                label="Phòng KD Được Giới Thiệu:"
                selected={recommendDepts}
                onChange={setRecommendDepts}
              />
            )}
          </div>

          {/* Phân khúc Hobi & Thương hiệu khác */}
          <div>
            <DepartmentMultiSelect
              label="Các Phân Khúc Hobi Được Giới Thiệu:"
              selected={selectedSegments}
              onChange={setSelectedSegments}
              options={segmentOptions}
              placeholder="Chọn từ bảng Phan_khuc"
            />
            {segmentOptions.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-700">Bảng Phan_khuc chưa có dữ liệu để lựa chọn.</p>
            )}
          </div>

          <div>
            <DepartmentMultiSelect
              label="Thương Hiệu Cạnh Tranh / Khác Tại Đại Lý:"
              selected={otherBrands}
              onChange={setOtherBrands}
              options={competitorOptions}
              placeholder="Chọn từ bảng Co_so"
            />
            {competitorOptions.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-700">Bảng Co_so chưa có dữ liệu để lựa chọn.</p>
            )}
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
