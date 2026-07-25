import React from 'react';
import { Layers, Plus } from 'lucide-react';
import { PhanKhucItem } from '../types';

interface Section4Props {
  records: PhanKhucItem[];
  onAddSegment?: () => void;
}

export const Section4SegmentShare: React.FC<Section4Props> = ({ records, onAddSegment }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">
              4
            </span>
            <h2 className="text-lg font-bold text-slate-900">Phân khúc Hobi</h2>
          </div>
          <p className="mt-1 pl-9 text-xs text-slate-500">
            Danh sách lấy trực tiếp từ bảng Phan_khuc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
            Tổng phân khúc: {records.length}
          </span>
          {onAddSegment && (
            <button
              type="button"
              onClick={onAddSegment}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm phân khúc
            </button>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
          <Layers className="mb-2 h-8 w-8 text-slate-400" />
          <p className="font-semibold text-slate-700">Bảng Phan_khuc chưa có dữ liệu</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3 font-bold">id</th>
                <th className="p-3 font-bold">Tên phân khúc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-purple-50/40">
                  <td className="p-3 font-mono font-semibold text-purple-700">{record.id}</td>
                  <td className="p-3 font-bold text-slate-900">{record.ten_phan_khuc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
