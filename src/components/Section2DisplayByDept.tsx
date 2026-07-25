import React from 'react';
import { AuditRecord } from '../types';
import { Layers, CheckCircle, Package, Sparkles } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface Section2Props {
  records: AuditRecord[];
}

export const Section2DisplayByDept: React.FC<Section2Props> = ({ records }) => {
  // Filter dealers that display Hobi
  const displayingRecords = records.filter(r => r.isDisplayingHobi);
  const totalDisplaying = displayingRecords.length;

  // Specific categories
  const displayBothPure = displayingRecords.filter(r => r.displayDepartment === 'Cả 2 phòng').length;
  const displayNhuaOnly = displayingRecords.filter(r => r.displayDepartment === 'Hobi Nhựa').length;
  const displayGoOnly = displayingRecords.filter(r => r.displayDepartment === 'Hobi Gỗ').length;

  // The 3 REQUIRED metrics requested by user:
  // 1. Cả 2 phòng (Hobi nhựa + Hobi gỗ)
  const totalDisplayBoth = displayBothPure;

  // 2. Hobi nhựa có tổng bao nhiêu (Nhựa duy nhất + Cả 2 phòng)
  const totalDisplayNhua = displayNhuaOnly + displayBothPure;

  // 3. Hobi gỗ có tổng bao nhiêu (Gỗ duy nhất + Cả 2 phòng)
  const totalDisplayGo = displayGoOnly + displayBothPure;

  const pieData = [
    { name: 'Chỉ Hobi Nhựa', value: displayNhuaOnly, color: '#0284c7' },
    { name: 'Chỉ Hobi Gỗ', value: displayGoOnly, color: '#d97706' },
    { name: 'Cả 2 phòng (Nhựa + Gỗ)', value: displayBothPure, color: '#7c3aed' },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              2
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Đại Lý Trưng Bày - Thuộc Phòng Kinh Doanh Nào?
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Phân tích cơ cấu phòng kinh doanh (Hobi Nhựa / Hobi Gỗ) tại các đại lý có trưng bày mẫu sản phẩm Hobi.
          </p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-200">
          Tổng đại lý đã trưng bày: {totalDisplaying}
        </div>
      </div>

      {/* 3 REQUIRED KPI CARDS */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          3 Chỉ Số Trọng Yếu Theo Yêu Cầu
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Indicator 1: Cả 2 phòng */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50/30 to-white border border-purple-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                1. Cả 2 Phòng (Hobi Nhựa + Hobi Gỗ)
              </span>
              <Layers className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-900">{totalDisplayBoth}</span>
              <span className="text-xs font-semibold text-purple-700">đại lý</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Chiếm {totalDisplaying > 0 ? Math.round((totalDisplayBoth / totalDisplaying) * 100) : 0}% trên tổng số đại lý trưng bày
            </p>
          </div>

          {/* Indicator 2: Tổng Hobi Nhựa */}
          <div className="bg-gradient-to-br from-sky-50 via-blue-50/30 to-white border border-sky-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                2. Tổng Đại Lý Trưng Bày Hobi Nhựa
              </span>
              <Package className="w-5 h-5 text-sky-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-sky-900">{totalDisplayNhua}</span>
              <span className="text-xs font-semibold text-sky-700">đại lý</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Bao gồm: {displayNhuaOnly} đại lý chỉ trưng bày Nhựa + {displayBothPure} đại lý trưng bày cả 2 phòng
            </p>
          </div>

          {/* Indicator 3: Tổng Hobi Gỗ */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50/30 to-white border border-amber-200 rounded-xl p-4 shadow-2xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                3. Tổng Đại Lý Trưng Bày Hobi Gỗ
              </span>
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-900">{totalDisplayGo}</span>
              <span className="text-xs font-semibold text-amber-700">đại lý</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Bao gồm: {displayGoOnly} đại lý chỉ trưng bày Gỗ + {displayBothPure} đại lý trưng bày cả 2 phòng
            </p>
          </div>

        </div>
      </div>

      {/* Visual Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
        
        {/* Pie Chart */}
        <div className="lg:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Tỷ Lệ Phân Bổ Phòng Kinh Doanh Trưng Bày
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

        {/* Detailed Table Matrix */}
        <div className="lg:col-span-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Bảng Thống Kê Phân Phối Chi Tiết
          </h4>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Phòng Kinh Doanh</th>
                  <th className="p-3 text-center">Số Đại Lý Trưng Bày</th>
                  <th className="p-3 text-right">Tỷ Lệ (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-sky-50/50">
                  <td className="p-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                    <span className="font-semibold text-slate-800">Chỉ Hobi Nhựa</span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">{displayNhuaOnly}</td>
                  <td className="p-3 text-right text-slate-600">
                    {totalDisplaying > 0 ? Math.round((displayNhuaOnly / totalDisplaying) * 100) : 0}%
                  </td>
                </tr>
                <tr className="hover:bg-amber-50/50">
                  <td className="p-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-semibold text-slate-800">Chỉ Hobi Gỗ</span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900">{displayGoOnly}</td>
                  <td className="p-3 text-right text-slate-600">
                    {totalDisplaying > 0 ? Math.round((displayGoOnly / totalDisplaying) * 100) : 0}%
                  </td>
                </tr>
                <tr className="hover:bg-purple-50/50 bg-purple-50/20 font-semibold">
                  <td className="p-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                    <span className="font-bold text-purple-900">Cả 2 Phòng (Hobi Nhựa + Hobi Gỗ)</span>
                  </td>
                  <td className="p-3 text-center font-bold text-purple-900">{displayBothPure}</td>
                  <td className="p-3 text-right text-purple-800 font-bold">
                    {totalDisplaying > 0 ? Math.round((displayBothPure / totalDisplaying) * 100) : 0}%
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
