import React from 'react';
import { AuditRecord } from '../types';
import { MapPin, Plus, Store } from 'lucide-react';

interface Section2Props {
  records: AuditRecord[];
  onAddDealer?: () => void;
}

export const Section2DisplayByDept: React.FC<Section2Props> = ({ records, onAddDealer }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
              2
            </span>
            <h2 className="text-lg font-bold text-slate-900">Đại lý trưng bày</h2>
          </div>
          <p className="mt-1 pl-9 text-xs text-slate-500">
            Danh sách lấy trực tiếp từ bảng Dai_ly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Tổng đại lý: {records.length}
          </span>
          {onAddDealer && (
            <button
              type="button"
              onClick={onAddDealer}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm đại lý
            </button>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
          <Store className="mb-2 h-8 w-8 text-slate-400" />
          <p className="font-semibold text-slate-700">Bảng Dai_ly chưa có dữ liệu</p>
          <p className="mt-1 text-xs text-slate-500">Nhấn “Thêm đại lý” để tạo bản ghi đầu tiên.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3 font-bold">id</th>
                <th className="p-3 font-bold">Tên đại lý</th>
                <th className="p-3 font-bold">Địa chỉ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-indigo-50/40">
                  <td className="p-3 font-mono font-semibold text-indigo-700">{record.id}</td>
                  <td className="p-3 font-bold text-slate-900">{record.dealerName}</td>
                  <td className="p-3 text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      {record.address}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
