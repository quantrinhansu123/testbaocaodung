import React, { useState } from 'react';
import { AuditRecord } from '../types';
import { ClipboardPlus, Save, X } from 'lucide-react';

interface NewSurveyModalProps {
  isOpen: boolean;
  dealers: AuditRecord[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export const NewSurveyModal: React.FC<NewSurveyModalProps> = ({ isOpen, dealers, onClose, onSaved }) => {
  const [dealer, setDealer] = useState('');
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
            trung_bay: isDisplaying ? 'Có' : 'Không',
            gioi_thieu: isRecommending ? 'Có' : 'Không'
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
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể thêm phiếu khảo sát.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
              <ClipboardPlus className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900">Thêm phiếu khảo sát</h3>
              <p className="text-xs text-slate-500">Lưu trực tiếp vào bảng Khao_sat</p>
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
              {dealers.map(item => <option key={item.id} value={item.dealerName}>{item.dealerName}</option>)}
            </select>
            {dealers.length === 0 && <p className="mt-1 text-[11px] text-amber-700">Bảng Dai_ly chưa có dữ liệu.</p>}
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 font-semibold">
              <input type="checkbox" checked={isDisplaying} onChange={event => setIsDisplaying(event.target.checked)} className="h-4 w-4 rounded text-violet-600" />
              Có trưng bày
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 font-semibold">
              <input type="checkbox" checked={isRecommending} onChange={event => setIsRecommending(event.target.checked)} className="h-4 w-4 rounded text-violet-600" />
              Có giới thiệu
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600">Hủy</button>
            <button type="submit" disabled={isSubmitting || !dealer} className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 font-bold text-white disabled:opacity-50">
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Đang lưu...' : 'Thêm khảo sát'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
