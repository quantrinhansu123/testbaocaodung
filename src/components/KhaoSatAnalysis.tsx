import React from 'react';
import { AuditRecord } from '../types';
import { ClipboardList, Store, Megaphone, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Section1DisplayVsRecommend } from './Section1DisplayVsRecommend';

interface KhaoSatAnalysisProps {
  records: AuditRecord[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const KhaoSatAnalysis: React.FC<KhaoSatAnalysisProps> = ({
  records,
  isLoading = false,
  error = null,
  onRefresh
}) => {
  const total = records.length;
  const displaying = records.filter(r => r.isDisplayingHobi).length;
  const recommending = records.filter(r => r.isRecommendingHobi).length;
  const both = records.filter(r => r.isDisplayingHobi && r.isRecommendingHobi).length;
  const neither = records.filter(r => !r.isDisplayingHobi && !r.isRecommendingHobi).length;

  const chartData = [
    { name: 'Trưng bày', count: displaying, color: '#0284c7' },
    { name: 'Giới thiệu', count: recommending, color: '#059669' },
    { name: 'Cả hai', count: both, color: '#7c3aed' },
    { name: 'Chưa có', count: neither, color: '#94a3b8' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600 text-white rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Phân Tích Khảo Sát</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nguồn dữ liệu từ bảng AppSheet <span className="font-bold text-violet-700">Khao_sat</span>
                {' '}(cột: <code className="font-mono text-[11px]">id</code>, <code className="font-mono text-[11px]">dai_ly</code>, <code className="font-mono text-[11px]">trung_bay</code>, <code className="font-mono text-[11px]">gioi_thieu</code>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-violet-50 text-violet-800 border border-violet-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              {total} phiếu khảo sát
            </span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && records.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">Đang tải dữ liệu từ bảng Khao_sat...</div>
        ) : total === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center">
            Bảng Khao_sat chưa có dữ liệu. Hãy thêm phiếu khảo sát trên AppSheet rồi nhấn Làm mới.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-sky-700 text-xs font-bold uppercase mb-1">
                  <span>Trưng bày</span>
                  <Store className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900">{displaying}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {total > 0 ? Math.round((displaying / total) * 100) : 0}% phiếu khảo sát
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase mb-1">
                  <span>Giới thiệu</span>
                  <Megaphone className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900">{recommending}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {total > 0 ? Math.round((recommending / total) * 100) : 0}% phiếu khảo sát
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-violet-700 text-xs font-bold uppercase mb-1">
                  <span>Cả hai</span>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900">{both}</div>
                <div className="text-[11px] text-slate-500 mt-1">Trưng bày + giới thiệu</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase mb-1">
                  <span>Chưa có</span>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="text-2xl font-black text-slate-900">{neither}</div>
                <div className="text-[11px] text-slate-500 mt-1">Chưa trưng bày & chưa GT</div>
              </div>
            </div>

            <div className="h-56 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map(item => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Chi tiết phiếu khảo sát (Khao_sat)
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Đại lý (dai_ly)</th>
                      <th className="p-3 text-center">Trưng bày</th>
                      <th className="p-3 text-center">Giới thiệu</th>
                      <th className="p-3">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map(r => {
                      const raw = r.rawAppSheetData || {};
                      return (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-slate-600">{r.id}</td>
                          <td className="p-3 font-semibold text-slate-900">
                            {r.dealerName || String(raw.dai_ly || '—')}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full font-bold ${
                              r.isDisplayingHobi
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {String(raw.trung_bay || (r.isDisplayingHobi ? 'Có' : 'Không'))}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full font-bold ${
                              r.isRecommendingHobi
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {String(raw.gioi_thieu || (r.isRecommendingHobi ? 'Có' : 'Không'))}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{r.notes || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {records.length > 0 && (
        <Section1DisplayVsRecommend records={records} />
      )}
    </div>
  );
};
