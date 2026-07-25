import React from 'react';
import { AuditRecord } from '../types';
import { Megaphone, Layers, Package, Sparkles } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Section3Props {
  records: AuditRecord[];
}

export const Section3RecommendByDept: React.FC<Section3Props> = ({ records }) => {
  // Filter dealers that recommend Hobi
  const recommendingRecords = records.filter(r => r.isRecommendingHobi);
  const totalRecommending = recommendingRecords.length;

  // Specific categories
  const recommendBothPure = recommendingRecords.filter(r => r.recommendDepartment === 'Cả 2 phòng').length;
  const recommendNhuaOnly = recommendingRecords.filter(r => r.recommendDepartment === 'Hobi Nhựa').length;
  const recommendGoOnly = recommendingRecords.filter(r => r.recommendDepartment === 'Hobi Gỗ').length;

  // The 3 REQUIRED metrics requested by user:
  // 1. Cả 2 phòng (Hobi nhựa + Hobi gỗ)
  const totalRecommendBoth = recommendBothPure;

  // 2. Hobi nhựa có tổng bao nhiêu (Nhựa duy nhất + Cả 2 phòng)
  const totalRecommendNhua = recommendNhuaOnly + recommendBothPure;

  // 3. Hobi gỗ có tổng bao nhiêu (Gỗ duy nhất + Cả 2 phòng)
  const totalRecommendGo = recommendGoOnly + recommendBothPure;

  const pieData = [
    { name: 'Chỉ Hobi Nhựa', value: recommendNhuaOnly, color: '#0369a1' },
    { name: 'Chỉ Hobi Gỗ', value: recommendGoOnly, color: '#b45309' },
    { name: 'Cả 2 phòng (Nhựa + Gỗ)', value: recommendBothPure, color: '#6d28d9' },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              3
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Đại Lý Giới Thiệu - Thuộc Phòng Kinh Doanh Nào?
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Phân tích chi tiết các sản phẩm thuộc phòng kinh doanh được đại lý chủ động tư vấn giới thiệu cho khách mua hàng.
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
          Tổng đại lý đã giới thiệu: {totalRecommending}
        </div>
      </div>

      {/* 3 REQUIRED KPI CARDS */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          3 Chỉ Số Trọng Yếu Theo Yêu Cầu
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Indicator 1: Cả 2 phòng */}
          <div className="bg-gradient-to-br from-violet-50 via-purple-50/30 to-white border border-violet-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                1. Cả 2 Phòng (Hobi Nhựa + Hobi Gỗ)
              </span>
              <Layers className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-violet-900">{totalRecommendBoth}</span>
              <span className="text-xs font-semibold text-violet-700">đại lý</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Chiếm {totalRecommending > 0 ? Math.round((totalRecommendBoth / totalRecommending) * 100) : 0}% trên tổng số đại lý giới thiệu
            </p>
          </div>

          {/* Indicator 2: Tổng Hobi Nhựa */}
          <div className="bg-gradient-to-br from-cyan-50 via-sky-50/30 to-white border border-cyan-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">
                2. Tổng Đại Lý Giới Thiệu Hobi Nhựa
              </span>
              <Package className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-cyan-950">{totalRecommendNhua}</span>
              <span className="text-xs font-semibold text-cyan-700">đại lý</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Bao gồm: {recommendNhuaOnly} đại lý chỉ giới thiệu Nhựa + {recommendBothPure} đại lý giới thiệu cả 2 phòng
            </p>
          </div>

          {/* Indicator 3: Tổng Hobi Gỗ */}
          <div className="bg-gradient-to-br from-orange-50 via-amber-50/30 to-white border border-orange-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
                3. Tổng Đại Lý Giới Thiệu Hobi Gỗ
              </span>
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-orange-950">{totalRecommendGo}</span>
              <span className="text-xs font-semibold text-orange-700">đại lý</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Bao gồm: {recommendGoOnly} đại lý chỉ giới thiệu Gỗ + {recommendBothPure} đại lý giới thiệu cả 2 phòng
            </p>
          </div>

        </div>
      </div>

      {/* Visual Chart & Detailed Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
        
        {/* Pie Chart */}
        <div className="lg:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Tỷ Lệ Phân Bổ Phòng Kinh Doanh Giới Thiệu
          </h4>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} đại lý`, 'Số lượng']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="lg:col-span-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Bảng Thống Kê Giới Thiệu Chi Tiết
          </h4>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Phòng Kinh Doanh</th>
                  <th className="p-3 text-center">Số Đại Lý Giới Thiệu</th>
                  <th className="p-3 text-right">Tỷ Lệ (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-cyan-50/50">
                  <td className="p-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
                    <span className="font-semibold text-slate-800">Chỉ Hobi Nhựa</span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">{recommendNhuaOnly}</td>
                  <td className="p-3 text-right text-slate-600">
                    {totalRecommending > 0 ? Math.round((recommendNhuaOnly / totalRecommending) * 100) : 0}%
                  </td>
                </tr>
                <tr className="hover:bg-amber-50/50">
                  <td className="p-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <span className="font-semibold text-slate-800">Chỉ Hobi Gỗ</span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">{recommendGoOnly}</td>
                  <td className="p-3 text-right text-slate-600">
                    {totalRecommending > 0 ? Math.round((recommendGoOnly / totalRecommending) * 100) : 0}%
                  </td>
                </tr>
                <tr className="hover:bg-violet-50/50 bg-violet-50/20 font-semibold">
                  <td className="p-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span>
                    <span className="font-bold text-violet-900">Cả 2 Phòng (Hobi Nhựa + Hobi Gỗ)</span>
                  </td>
                  <td className="p-3 text-center font-bold text-violet-900">{recommendBothPure}</td>
                  <td className="p-3 text-right text-violet-800 font-bold">
                    {totalRecommending > 0 ? Math.round((recommendBothPure / totalRecommending) * 100) : 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
