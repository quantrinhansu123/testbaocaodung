import React, { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';

interface NewDisplayDealerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export const NewDisplayDealerModal: React.FC<NewDisplayDealerModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
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
          tableName: 'Dai_ly',
          row: {
            id: `DL-${Date.now()}`,
            Ten_dai_ly: name.trim(),
            Dia_chi: address.trim()
          }
        })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        const message = typeof result.error === 'string'
          ? result.error
          : JSON.stringify(result.error || result.data || `HTTP ${response.status}`);
        throw new Error(message);
      }

      await onSaved();
      setName('');
      setAddress('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Không thể thêm đại lý vào AppSheet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Plus className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900">Thêm đại lý trưng bày</h3>
              <p className="text-xs text-slate-500">Lưu trực tiếp vào bảng Dai_ly</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 text-xs">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
              AppSheet không nhận dữ liệu: {error}
            </div>
          )}

          <div>
            <label className="mb-1 block font-bold text-slate-700">Tên đại lý *</label>
            <input
              required
              value={name}
              onChange={event => setName(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Ví dụ: Đại lý Nội thất Minh Anh"
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-slate-700">Địa chỉ *</label>
            <input
              required
              value={address}
              onChange={event => setAddress(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600">
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Đang lưu...' : 'Thêm đại lý'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
