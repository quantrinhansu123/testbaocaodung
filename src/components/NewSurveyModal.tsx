import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AuditRecord, CoSoItem, PhanKhucItem } from '../types';
import { Check, ChevronDown, ClipboardPlus, Save, X } from 'lucide-react';

export interface TrungBayJson {
  co_so: Array<{ id: string; ten_co_so: string }>;
}

export interface GioiThieuJson {
  co_so: Array<{ id: string; ten_co_so: string }>;
  phan_khuc: Array<{ id: string; ten_phan_khuc: string }>;
}

interface NewSurveyModalProps {
  isOpen: boolean;
  dealers: AuditRecord[];
  coSoList: CoSoItem[];
  phanKhucList: PhanKhucItem[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const MultiSelectDropdown: React.FC<{
  label: string;
  placeholder: string;
  options: Array<{ id: string; label: string }>;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  emptyHint?: string;
}> = ({ label, placeholder, options, selectedIds, onChange, emptyHint }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const selectedLabels = options
    .filter(option => selectedIds.includes(option.id))
    .map(option => option.label);

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter(item => item !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="relative" ref={ref}>
      <label className="mb-1 block font-bold text-slate-700">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        <span className={selectedLabels.length ? 'text-slate-900' : 'text-slate-400'}>
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {options.length === 0 ? (
            <p className="px-2 py-2 text-[11px] text-amber-700">{emptyHint || 'Chưa có dữ liệu'}</p>
          ) : (
            options.map(option => {
              const checked = selectedIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggle(option.id)}
                  className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-violet-50 ${
                    checked ? 'bg-violet-50 text-violet-900' : 'text-slate-700'
                  }`}
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${
                    checked ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                  <span className="font-semibold">{option.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export const NewSurveyModal: React.FC<NewSurveyModalProps> = ({
  isOpen,
  dealers,
  coSoList,
  phanKhucList,
  onClose,
  onSaved
}) => {
  const [dealer, setDealer] = useState('');
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [selectedDisplayCoSoIds, setSelectedDisplayCoSoIds] = useState<string[]>([]);
  const [selectedRecommendCoSoIds, setSelectedRecommendCoSoIds] = useState<string[]>([]);
  const [selectedPhanKhucIds, setSelectedPhanKhucIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coSoOptions = useMemo(
    () => coSoList.map(item => ({ id: item.id, label: item.ten_co_so || item.id })),
    [coSoList]
  );
  const phanKhucOptions = useMemo(
    () => phanKhucList.map(item => ({ id: item.id, label: item.ten_phan_khuc || item.id })),
    [phanKhucList]
  );

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const mapCoSoByIds = (ids: string[]) =>
    coSoList
      .filter(item => ids.includes(item.id))
      .map(item => ({ id: item.id, ten_co_so: item.ten_co_so }));

  const buildTrungBayJson = (): TrungBayJson => ({
    co_so: isDisplaying ? mapCoSoByIds(selectedDisplayCoSoIds) : []
  });

  const buildGioiThieuJson = (): GioiThieuJson => {
    if (!isRecommending) {
      return { co_so: [], phan_khuc: [] };
    }
    return {
      co_so: mapCoSoByIds(selectedRecommendCoSoIds),
      phan_khuc: phanKhucList
        .filter(item => selectedPhanKhucIds.includes(item.id))
        .map(item => ({ id: item.id, ten_phan_khuc: item.ten_phan_khuc }))
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isDisplaying && selectedDisplayCoSoIds.length === 0) {
      setError('Khi có trưng bày, hãy chọn ít nhất 1 Cơ sở từ danh sách Co_so.');
      return;
    }
    if (isRecommending && selectedRecommendCoSoIds.length === 0 && selectedPhanKhucIds.length === 0) {
      setError('Khi có giới thiệu, hãy chọn ít nhất 1 Cơ sở hoặc 1 Phân khúc.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/appsheet/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'Khao_sat',
          row: {
            id: Number(Date.now().toString().slice(-9)),
            dai_ly: dealer,
            trung_bay: JSON.stringify(buildTrungBayJson()),
            gioi_thieu: JSON.stringify(buildGioiThieuJson())
          }
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error || result.data || `HTTP ${response.status}`));
      }
      await onSaved();
      setDealer('');
      setIsDisplaying(false);
      setIsRecommending(false);
      setSelectedDisplayCoSoIds([]);
      setSelectedRecommendCoSoIds([]);
      setSelectedPhanKhucIds([]);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể thêm phiếu khảo sát.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <ClipboardPlus className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900">Thêm phiếu khảo sát</h3>
              <p className="text-xs text-slate-500">
                <code className="font-mono">trung_bay</code> / <code className="font-mono">gioi_thieu</code> dạng JSON
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 text-xs">
          {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div>}

          <div>
            <label className="mb-1 block font-bold text-slate-700">Đại lý *</label>
            <select
              required
              value={dealer}
              onChange={event => setDealer(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Chọn đại lý</option>
              {dealers.map(item => (
                <option key={item.id} value={item.dealerName}>{item.dealerName}</option>
              ))}
            </select>
            {dealers.length === 0 && (
              <p className="mt-1 text-[11px] text-amber-700">Bảng Dai_ly chưa có dữ liệu.</p>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50/50 p-3">
            <label className="flex cursor-pointer items-center gap-2 font-bold text-sky-900">
              <input
                type="checkbox"
                checked={isDisplaying}
                onChange={event => {
                  const checked = event.target.checked;
                  setIsDisplaying(checked);
                  if (!checked) setSelectedDisplayCoSoIds([]);
                }}
                className="h-4 w-4 rounded text-sky-600"
              />
              Có trưng bày — lưu JSON vào cột <code className="font-mono">trung_bay</code>
            </label>

            {isDisplaying && (
              <MultiSelectDropdown
                label="Cơ sở trưng bày (Co_so)"
                placeholder="Chọn cơ sở (tickbox)"
                options={coSoOptions}
                selectedIds={selectedDisplayCoSoIds}
                onChange={setSelectedDisplayCoSoIds}
                emptyHint="Bảng Co_so chưa có dữ liệu."
              />
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/40 p-3">
            <label className="flex cursor-pointer items-center gap-2 font-bold text-violet-900">
              <input
                type="checkbox"
                checked={isRecommending}
                onChange={event => {
                  const checked = event.target.checked;
                  setIsRecommending(checked);
                  if (!checked) {
                    setSelectedRecommendCoSoIds([]);
                    setSelectedPhanKhucIds([]);
                  }
                }}
                className="h-4 w-4 rounded text-violet-600"
              />
              Có giới thiệu — lưu JSON vào cột <code className="font-mono">gioi_thieu</code>
            </label>

            {isRecommending && (
              <div className="space-y-3">
                <MultiSelectDropdown
                  label="Cơ sở được giới thiệu"
                  placeholder="Chọn cơ sở (Co_so)"
                  options={coSoOptions}
                  selectedIds={selectedRecommendCoSoIds}
                  onChange={setSelectedRecommendCoSoIds}
                  emptyHint="Bảng Co_so chưa có dữ liệu."
                />
                <MultiSelectDropdown
                  label="Phân khúc được giới thiệu"
                  placeholder="Chọn phân khúc (tickbox)"
                  options={phanKhucOptions}
                  selectedIds={selectedPhanKhucIds}
                  onChange={setSelectedPhanKhucIds}
                  emptyHint="Bảng Phan_khuc chưa có dữ liệu."
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600">
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !dealer}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 font-bold text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Đang lưu...' : 'Thêm khảo sát'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
