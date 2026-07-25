import React from 'react';
import { AuditRecord } from '../types';
import { Building2, Megaphone, Store } from 'lucide-react';

interface DepartmentSummaryTableProps {
  records: AuditRecord[];
}

export const DepartmentSummaryTable: React.FC<DepartmentSummaryTableProps> = ({ records }) => {
  const totalRecords = records.length;

  // 1. Displaying stats
  const displayingRecords = records.filter(r => r.isDisplayingHobi);
  const totalDisplaying = displayingRecords.length;
  const displayNhuaOnly = displayingRecords.filter(r => r.displayDepartment === 'Hobi Nhựa').length;
  const displayGoOnly = displayingRecords.filter(r => r.displayDepartment === 'Hobi Gỗ').length;
  const displayBoth = displayingRecords.filter(r => r.displayDepartment === 'Cả 2 phòng').length;

  const totalDisplayNhua = displayNhuaOnly + displayBoth;
  const totalDisplayGo = displayGoOnly + displayBoth;

  // 2. Recommending stats
  const recommendingRecords = records.filter(r => r.isRecommendingHobi);
  const totalRecommending = recommendingRecords.filter(r => r.recommendDepartment !== 'Không').length;
  const recNhuaOnly = recommendingRecords.filter(r => r.recommendDepartment === 'Hobi Nhựa').length;
  const recGoOnly = recommendingRecords.filter(r => r.recommendDepartment === 'Hobi Gỗ').length;
  const recBoth = recommendingRecords.filter(r => r.recommendDepartment === 'Cả 2 phòng').length;

  const totalRecNhua = recNhuaOnly + recBoth;
  const totalRecGo = recGoOnly + recBoth;

  // 3. Both Display & Recommend by Department
  const bothDisplayAndRecNhua = records.filter(r => 
    r.isDisplayingHobi && (r.displayDepartment === 'Hobi Nhựa' || r.displayDepartment === 'Cả 2 phòng') &&
    r.isRecommendingHobi && (r.recommendDepartment === 'Hobi Nhựa' || r.recommendDepartment === 'Cả 2 phòng')
  ).length;

  const bothDisplayAndRecGo = records.filter(r => 
    r.isDisplayingHobi && (r.displayDepartment === 'Hobi Gỗ' || r.displayDepartment === 'Cả 2 phòng') &&
    r.isRecommendingHobi && (r.recommendDepartment === 'Hobi Gỗ' || r.recommendDepartment === 'Cả 2 phòng')
  ).length;

  // 4. Products & Competitors breakdown by Dept
  const segmentCountNhua: Record<string, number> = {};
  const segmentCountGo: Record<string, number> = {};
  const compCountNhua: Record<string, number> = {};
  const compCountGo: Record<string, number> = {};

  records.forEach(r => {
    const isNhuaDept = r.displayDepartment === 'Hobi Nhựa' || r.displayDepartment === 'Cả 2 phòng' ||
                       r.recommendDepartment === 'Hobi Nhựa' || r.recommendDepartment === 'Cả 2 phòng';
    
    const isGoDept = r.displayDepartment === 'Hobi Gỗ' || r.displayDepartment === 'Cả 2 phòng' ||
                     r.recommendDepartment === 'Hobi Gỗ' || r.recommendDepartment === 'Cả 2 phòng';

    if (r.segments) {
      r.segments.forEach(seg => {
        if (seg.name.toLowerCase().includes('nhựa') || seg.name.toLowerCase().includes('pvc') || isNhuaDept) {
          segmentCountNhua[seg.name] = (segmentCountNhua[seg.name] || 0) + 1;
        }
        if (seg.name.toLowerCase().includes('gỗ') || seg.name.toLowerCase().includes('công nghiệp') || isGoDept) {
          segmentCountGo[seg.name] = (segmentCountGo[seg.name] || 0) + 1;
        }

        if (seg.mainCompetitors) {
          const comps = seg.mainCompetitors.split(/[,;\n]+/).map(c => c.trim()).filter(Boolean);
          comps.forEach(c => {
            if (seg.name.toLowerCase().includes('nhựa') || seg.name.toLowerCase().includes('pvc')) {
              compCountNhua[c] = (compCountNhua[c] || 0) + 1;
            } else {
              compCountGo[c] = (compCountGo[c] || 0) + 1;
            }
          });
        }
      });
    }
  });

  const topSegmentsNhua = Object.entries(segmentCountNhua).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topSegmentsGo = Object.entries(segmentCountGo).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const topCompsNhua = Object.entries(compCountNhua).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topCompsGo = Object.entries(compCountGo).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Bảng Thống Kê & Phân Tích Các Phòng Kinh Doanh
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu phân bổ chi tiết cho 2 Phòng Kinh Doanh chính: <span className="font-bold text-blue-700">Phòng Hobi Nhựa</span> và <span className="font-bold text-amber-700">Phòng Hobi Gỗ</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
          <span className="text-slate-500">Tổng mẫu khảo sát:</span>
          <span className="font-bold text-slate-900 text-sm">{totalRecords} Đại lý</span>
        </div>
      </div>

      {/* 2 MAIN DEPARTMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* DEPARTMENT 1: PHÒNG HOBI NHỰA */}
        <div className="bg-gradient-to-br from-sky-50/70 via-blue-50/30 to-white border-2 border-sky-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-sky-500 animate-pulse"></span>
              <h3 className="text-base font-black text-sky-950 uppercase tracking-wide">
                Phòng Hobi Nhựa
              </h3>
            </div>
            <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-300">
              Sản phẩm chính: Sàn nhựa & Ốp tường
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1 font-semibold text-sky-800">
                  <Store className="w-3.5 h-3.5 text-sky-600" /> Trưng Bày
                </span>
                <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-1.5 py-0.5 rounded">
                  {totalDisplaying > 0 ? Math.round((totalDisplayNhua / totalDisplaying) * 100) : 0}% Trưng bày
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{totalDisplayNhua} <span className="text-xs font-medium text-slate-500">đại lý</span></div>
              <p className="text-[11px] text-slate-500 mt-1">
                ({displayNhuaOnly} chỉ Nhựa + {displayBoth} cả 2 phòng)
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1 font-semibold text-emerald-800">
                  <Megaphone className="w-3.5 h-3.5 text-emerald-600" /> Giới Thiệu
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                  {totalRecommending > 0 ? Math.round((totalRecNhua / totalRecommending) * 100) : 0}% Giới thiệu
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{totalRecNhua} <span className="text-xs font-medium text-slate-500">đại lý</span></div>
              <p className="text-[11px] text-slate-500 mt-1">
                ({recNhuaOnly} chỉ Nhựa + {recBoth} cả 2 phòng)
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Vừa Trưng Bày + Giới Thiệu Hobi Nhựa:</span>
              <span className="font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded">{bothDisplayAndRecNhua} đại lý</span>
            </div>

            {topSegmentsNhua.length > 0 && (
              <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100">
                <span className="text-slate-500 font-medium block mb-1">Phân khúc sản phẩm phổ biến nhất:</span>
                <div className="flex flex-wrap gap-1.5">
                  {topSegmentsNhua.map(([seg, count]) => (
                    <span key={seg} className="bg-sky-50 text-sky-800 font-semibold text-[11px] px-2 py-0.5 rounded-md border border-sky-200">
                      {seg} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {topCompsNhua.length > 0 && (
              <div className="bg-white/80 p-2.5 rounded-xl border border-sky-100">
                <span className="text-slate-500 font-medium block mb-1">Đối thủ cạnh tranh trực tiếp:</span>
                <div className="flex flex-wrap gap-1.5">
                  {topCompsNhua.map(([comp, count]) => (
                    <span key={comp} className="bg-rose-50 text-rose-800 font-semibold text-[11px] px-2 py-0.5 rounded-md border border-rose-200">
                      {comp} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DEPARTMENT 2: PHÒNG HOBI GỖ */}
        <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white border-2 border-amber-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="text-base font-black text-amber-950 uppercase tracking-wide">
                Phòng Hobi Gỗ
              </h3>
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">
              Sản phẩm chính: Sàn gỗ công nghiệp
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1 font-semibold text-amber-800">
                  <Store className="w-3.5 h-3.5 text-amber-600" /> Trưng Bày
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded">
                  {totalDisplaying > 0 ? Math.round((totalDisplayGo / totalDisplaying) * 100) : 0}% Trưng bày
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{totalDisplayGo} <span className="text-xs font-medium text-slate-500">đại lý</span></div>
              <p className="text-[11px] text-slate-500 mt-1">
                ({displayGoOnly} chỉ Gỗ + {displayBoth} cả 2 phòng)
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1 font-semibold text-emerald-800">
                  <Megaphone className="w-3.5 h-3.5 text-emerald-600" /> Giới Thiệu
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                  {totalRecommending > 0 ? Math.round((totalRecGo / totalRecommending) * 100) : 0}% Giới thiệu
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900">{totalRecGo} <span className="text-xs font-medium text-slate-500">đại lý</span></div>
              <p className="text-[11px] text-slate-500 mt-1">
                ({recGoOnly} chỉ Gỗ + {recBoth} cả 2 phòng)
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Vừa Trưng Bày + Giới Thiệu Hobi Gỗ:</span>
              <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">{bothDisplayAndRecGo} đại lý</span>
            </div>

            {topSegmentsGo.length > 0 && (
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span className="text-slate-500 font-medium block mb-1">Phân khúc sản phẩm phổ biến nhất:</span>
                <div className="flex flex-wrap gap-1.5">
                  {topSegmentsGo.map(([seg, count]) => (
                    <span key={seg} className="bg-amber-50 text-amber-800 font-semibold text-[11px] px-2 py-0.5 rounded-md border border-amber-200">
                      {seg} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {topCompsGo.length > 0 && (
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                <span className="text-slate-500 font-medium block mb-1">Đối thủ cạnh tranh trực tiếp:</span>
                <div className="flex flex-wrap gap-1.5">
                  {topCompsGo.map(([comp, count]) => (
                    <span key={comp} className="bg-rose-50 text-rose-800 font-semibold text-[11px] px-2 py-0.5 rounded-md border border-rose-200">
                      {comp} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
