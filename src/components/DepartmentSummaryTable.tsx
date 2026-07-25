import React from 'react';
import { AuditRecord } from '../types';
import { Building2, Package, Layers, Megaphone, Store, Sparkles, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

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
  // Top product segments by Dept
  const segmentCountNhua: Record<string, number> = {};
  const segmentCountGo: Record<string, number> = {};
  const compCountNhua: Record<string, number> = {};
  const compCountGo: Record<string, number> = {};

  records.forEach(r => {
    // Check if record relates to Hobi Nhựa
    const isNhuaDept = r.displayDepartment === 'Hobi Nhựa' || r.displayDepartment === 'Cả 2 phòng' ||
                       r.recommendDepartment === 'Hobi Nhựa' || r.recommendDepartment === 'Cả 2 phòng';
    
    // Check if record relates to Hobi Gỗ
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

        // Competitors
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

  // Comparison Bar Chart Data
  const chartData = [
    {
      name: 'Trưng Bày Mẫu',
      'Hobi Nhựa': totalDisplayNhua,
      'Hobi Gỗ': totalDisplayGo,
      'Cả 2 Phòng': displayBoth,
    },
    {
      name: 'Giới Thiệu Sản Phẩm',
      'Hobi Nhựa': totalRecNhua,
      'Hobi Gỗ': totalRecGo,
      'Cả 2 Phòng': recBoth,
    },
    {
      name: 'Vừa Trưng Bày Vừa Giới Thiệu',
      'Hobi Nhựa': bothDisplayAndRecNhua,
      'Hobi Gỗ': bothDisplayAndRecGo,
      'Cả 2 Phòng': Math.min(displayBoth, recBoth),
    }
  ];

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

      {/* MASTER COMPARISON TABLE */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Bảng Báo Cáo Tổng Hợp So Sánh 2 Phòng Kinh Doanh
          </h3>
          <span className="text-xs text-slate-500 italic">Cả 2 phòng = Hobi Nhựa + Hobi Gỗ</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3.5">Hạng Mục / Tiêu Chí Khảo Sát</th>
                <th className="p-3.5 text-center bg-blue-900/60">Phòng Hobi Nhựa</th>
                <th className="p-3.5 text-center bg-amber-900/60">Phòng Hobi Gỗ</th>
                <th className="p-3.5 text-center bg-purple-900/60">Cả 2 Phòng (Hợp Tác)</th>
                <th className="p-3.5 text-right bg-slate-800">Toàn Thị Trường</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              
              {/* Row 1: Trưng Bày Độc Quyền / Độc Lập */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-900">
                  Số Đại Lý Trưng Bày Độc Lập (Chỉ 1 phòng)
                </td>
                <td className="p-3 text-center font-bold text-sky-700">{displayNhuaOnly}</td>
                <td className="p-3 text-center font-bold text-amber-700">{displayGoOnly}</td>
                <td className="p-3 text-center text-slate-400">—</td>
                <td className="p-3 text-right font-bold text-slate-900">{displayNhuaOnly + displayGoOnly}</td>
              </tr>

              {/* Row 2: Trưng Bày Cả 2 Phòng */}
              <tr className="bg-purple-50/30 hover:bg-purple-50/60 font-semibold">
                <td className="p-3 font-bold text-purple-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  Số Đại Lý Trưng Bày Cả 2 Phòng (Nhựa + Gỗ)
                </td>
                <td className="p-3 text-center font-bold text-purple-800">{displayBoth}</td>
                <td className="p-3 text-center font-bold text-purple-800">{displayBoth}</td>
                <td className="p-3 text-center font-extrabold text-purple-900 bg-purple-100/60">{displayBoth}</td>
                <td className="p-3 text-right font-bold text-purple-900">{displayBoth}</td>
              </tr>

              {/* Row 3: TỔNG ĐẠI LÝ TRƯNG BÀY */}
              <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
                <td className="p-3 text-slate-900">
                  TỔNG SỐ ĐẠI LÝ TRƯNG BÀY MẪU SẢN PHẨM
                </td>
                <td className="p-3 text-center text-sm font-black text-sky-900">{totalDisplayNhua}</td>
                <td className="p-3 text-center text-sm font-black text-amber-900">{totalDisplayGo}</td>
                <td className="p-3 text-center text-sm font-black text-purple-900">{displayBoth}</td>
                <td className="p-3 text-right text-sm font-black text-slate-900">{totalDisplaying}</td>
              </tr>

              {/* Row 4: Tỷ lệ Trưng Bày / Tổng Đại Lý Trưng Bày */}
              <tr className="hover:bg-slate-50 text-slate-600">
                <td className="p-3 font-medium italic">
                  Tỷ lệ bao phủ trên tổng số đại lý có trưng bày Hobi
                </td>
                <td className="p-3 text-center font-bold text-sky-700">
                  {totalDisplaying > 0 ? Math.round((totalDisplayNhua / totalDisplaying) * 100) : 0}%
                </td>
                <td className="p-3 text-center font-bold text-amber-700">
                  {totalDisplaying > 0 ? Math.round((totalDisplayGo / totalDisplaying) * 100) : 0}%
                </td>
                <td className="p-3 text-center font-bold text-purple-800">
                  {totalDisplaying > 0 ? Math.round((displayBoth / totalDisplaying) * 100) : 0}%
                </td>
                <td className="p-3 text-right font-bold text-slate-900">100%</td>
              </tr>

              {/* Section Divider */}
              <tr className="bg-slate-200/60 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <td colSpan={5} className="px-3 py-1.5">
                  Phần 2: Giới Thiệu Sản Phẩm & Tư Vấn Khách Hàng
                </td>
              </tr>

              {/* Row 5: Giới Thiệu Độc Lập */}
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-900">
                  Số Đại Lý Giới Thiệu Độc Lập (Chỉ 1 phòng)
                </td>
                <td className="p-3 text-center font-bold text-sky-700">{recNhuaOnly}</td>
                <td className="p-3 text-center font-bold text-amber-700">{recGoOnly}</td>
                <td className="p-3 text-center text-slate-400">—</td>
                <td className="p-3 text-right font-bold text-slate-900">{recNhuaOnly + recGoOnly}</td>
              </tr>

              {/* Row 6: Giới Thiệu Cả 2 Phòng */}
              <tr className="bg-purple-50/30 hover:bg-purple-50/60 font-semibold">
                <td className="p-3 font-bold text-purple-900 flex items-center gap-1.5">
                  <Megaphone className="w-3.5 h-3.5 text-purple-600" />
                  Số Đại Lý Giới Thiệu Cả 2 Phòng (Nhựa + Gỗ)
                </td>
                <td className="p-3 text-center font-bold text-purple-800">{recBoth}</td>
                <td className="p-3 text-center font-bold text-purple-800">{recBoth}</td>
                <td className="p-3 text-center font-extrabold text-purple-900 bg-purple-100/60">{recBoth}</td>
                <td className="p-3 text-right font-bold text-purple-900">{recBoth}</td>
              </tr>

              {/* Row 7: TỔNG ĐẠI LÝ GIỚI THIỆU */}
              <tr className="bg-emerald-50/80 font-bold border-t-2 border-emerald-300">
                <td className="p-3 text-emerald-950">
                  TỔNG SỐ ĐẠI LÝ GIỚI THIỆU SẢN PHẨM HOBI
                </td>
                <td className="p-3 text-center text-sm font-black text-sky-900">{totalRecNhua}</td>
                <td className="p-3 text-center text-sm font-black text-amber-900">{totalRecGo}</td>
                <td className="p-3 text-center text-sm font-black text-purple-900">{recBoth}</td>
                <td className="p-3 text-right text-sm font-black text-emerald-900">{totalRecommending}</td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* COMPARISON CHART */}
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
          So Sánh Quy Mô Trưng Bày & Giới Thiệu Giữa Các Phòng
        </h3>
        <div className="h-64 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', pt: '10px' }} />
              <Bar dataKey="Hobi Nhựa" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Hobi Gỗ" fill="#d97706" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Cả 2 Phòng" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
