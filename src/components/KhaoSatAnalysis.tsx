import React, { useMemo } from 'react';
import { AuditRecord } from '../types';
import { ClipboardList, Store, Megaphone, CheckCircle2, AlertTriangle, RefreshCw, Plus } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Section1DisplayVsRecommend } from './Section1DisplayVsRecommend';

interface KhaoSatAnalysisProps {
  records: AuditRecord[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onAddSurvey?: () => void;
}

function parseJsonField(raw: unknown): any | null {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

/** Count flags directly from Khao_sat columns trung_bay / gioi_thieu */
function hasTrungBay(record: AuditRecord): boolean {
  const raw = record.rawAppSheetData?.trung_bay ?? record.rawAppSheetData?.Trung_bay;
  const parsed = parseJsonField(raw);
  if (parsed && typeof parsed === 'object') {
    const coSo = Array.isArray(parsed.co_so) ? parsed.co_so : [];
    return coSo.length > 0;
  }
  return record.isDisplayingHobi;
}

function hasGioiThieu(record: AuditRecord): boolean {
  const raw = record.rawAppSheetData?.gioi_thieu ?? record.rawAppSheetData?.Gioi_thieu;
  const parsed = parseJsonField(raw);
  if (parsed && typeof parsed === 'object') {
    const coSo = Array.isArray(parsed.co_so) ? parsed.co_so : [];
    const phanKhuc = Array.isArray(parsed.phan_khuc) ? parsed.phan_khuc : [];
    return coSo.length > 0 || phanKhuc.length > 0;
  }
  return record.isRecommendingHobi;
}

function summarizeTrungBay(record: AuditRecord): string {
  const raw = record.rawAppSheetData?.trung_bay;
  const parsed = parseJsonField(raw);
  if (parsed?.co_so?.length) {
    return parsed.co_so.map((c: any) => c.ten_co_so || c.id).join(', ');
  }
  return hasTrungBay(record) ? 'Có' : 'Không';
}

function summarizeGioiThieu(record: AuditRecord): string {
  const raw = record.rawAppSheetData?.gioi_thieu;
  const parsed = parseJsonField(raw);
  if (!parsed || typeof parsed !== 'object') {
    return hasGioiThieu(record) ? 'Có' : 'Không';
  }
  const parts: string[] = [];
  if (parsed.co_so?.length) {
    parts.push(`CS: ${parsed.co_so.map((c: any) => c.ten_co_so || c.id).join(', ')}`);
  }
  if (parsed.phan_khuc?.length) {
    parts.push(`PK: ${parsed.phan_khuc.map((p: any) => p.ten_phan_khuc || p.id).join(', ')}`);
  }
  return parts.length ? parts.join(' | ') : 'Không';
}

export const KhaoSatAnalysis: React.FC<KhaoSatAnalysisProps> = ({
  records,
  isLoading = false,
  error = null,
  onRefresh,
  onAddSurvey
}) => {
  const stats = useMemo(() => {
    const total = records.length;
    const displaying = records.filter(hasTrungBay).length;
    const recommending = records.filter(hasGioiThieu).length;
    const both = records.filter(r => hasTrungBay(r) && hasGioiThieu(r)).length;
    const neither = records.filter(r => !hasTrungBay(r) && !hasGioiThieu(r)).length;
    return { total, displaying, recommending, both, neither };
  }, [records]);

  const { total, displaying, recommending, both, neither } = stats;

  const chartData = [
    { name: 'Trưng bày', count: displaying, color: '#0284c7' },
    { name: 'Giới thiệu', count: recommending, color: '#059669' },
    { name: 'Cả hai', count: both, color: '#7c3aed' },
    { name: 'Chưa có', count: neither, color: '#94a3b8' },
  ];

  const sectionRecords = useMemo(
    () => records.map(r => ({
      ...r,
      isDisplayingHobi: hasTrungBay(r),
      isRecommendingHobi: hasGioiThieu(r)
    })),
    [records]
  );

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
            {onAddSurvey && (
              <button
                onClick={onAddSurvey}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm khảo sát
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
                      const displayingRow = hasTrungBay(r);
                      const recommendingRow = hasGioiThieu(r);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-slate-600">{r.id}</td>
                          <td className="p-3 font-semibold text-slate-900">
                            {r.dealerName || String(r.rawAppSheetData?.dai_ly || '—')}
                          </td>
                          <td className="p-3 text-center max-w-[220px]">
                            <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-left ${
                              displayingRow
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {summarizeTrungBay(r)}
                            </span>
                          </td>
                          <td className="p-3 text-center max-w-[260px]">
                            <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-left ${
                              recommendingRow
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              {summarizeGioiThieu(r)}
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

      {sectionRecords.length > 0 && (
        <Section1DisplayVsRecommend records={sectionRecords} />
      )}
    </div>
  );
};
