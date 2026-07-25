import React from 'react';
import { AuditRecord } from '../types';
import { Store, Megaphone, CheckCircle2, AlertTriangle, ArrowUpRight, Percent } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface Section1Props {
  records: AuditRecord[];
}

export const Section1DisplayVsRecommend: React.FC<Section1Props> = ({ records }) => {
  const totalAudits = records.length;
  
  // Total displaying Hobi
  const totalDisplaying = records.filter(r => r.isDisplayingHobi).length;
  
  // Total recommending Hobi
  const totalRecommending = records.filter(r => r.isRecommendingHobi).length;

  // Breakdown overlap
  const displayAndRecommend = records.filter(r => r.isDisplayingHobi && r.isRecommendingHobi).length;
  const displayButNotRecommend = records.filter(r => r.isDisplayingHobi && !r.isRecommendingHobi).length;
  const recommendWithoutDisplay = records.filter(r => !r.isDisplayingHobi && r.isRecommendingHobi).length;
  const neitherDisplayNorRecommend = records.filter(r => !r.isDisplayingHobi && !r.isRecommendingHobi).length;

  // Conversion rate (Recommending among displaying)
  const conversionRate = totalDisplaying > 0 
    ? Math.round((displayAndRecommend / totalDisplaying) * 100) 
    : 0;

  // Recommendation vs Display Ratio
  const ratio = totalDisplaying > 0 
    ? (totalRecommending / totalDisplaying).toFixed(2) 
    : '0';

  const chartData = [
    { name: 'Đã trưng bày', count: totalDisplaying, color: '#2563eb' },
    { name: 'Đã giới thiệu', count: totalRecommending, color: '#10b981' },
    { name: 'Cả 2 (Trưng bày & GT)', count: displayAndRecommend, color: '#8b5cf6' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              1
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              So Sánh Đại Lý Giới Thiệu vs Đại Lý Trưng Bày Hobi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Tỷ lệ đại lý chủ động tư vấn giới thiệu sản phẩm Hobi so với số đại lý đã có kệ trưng bày mẫu tại cửa hàng.
          </p>
        </div>
        <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
          Tổng số đại lý khảo sát: {totalAudits}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Card 1: Displaying */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Đã Trưng Bày Hobi</span>
            <Store className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-900">{totalDisplaying}</span>
            <span className="text-xs font-medium text-slate-500">/ {totalAudits} đại lý</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-blue-700 flex items-center gap-1">
            <span>Chiếm {Math.round((totalDisplaying / (totalAudits || 1)) * 100)}% tổng khảo sát</span>
          </div>
        </div>

        {/* Card 2: Recommending */}
        <div className="bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Đã Giới Thiệu Hobi</span>
            <Megaphone className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-900">{totalRecommending}</span>
            <span className="text-xs font-medium text-slate-500">/ {totalAudits} đại lý</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <span>Chiếm {Math.round((totalRecommending / (totalAudits || 1)) * 100)}% tổng khảo sát</span>
          </div>
        </div>

        {/* Card 3: Conversion rate */}
        <div className="bg-gradient-to-br from-purple-50 to-slate-50 border border-purple-200/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tỷ Lệ Giới Thiệu Khi Trưng Bày</span>
            <Percent className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-purple-900">{conversionRate}%</span>
          </div>
          <p className="mt-2 text-xs text-purple-800 font-medium">
            {displayAndRecommend} trên {totalDisplaying} đại lý trưng bày có tư vấn Hobi
          </p>
        </div>

        {/* Card 4: Displayed but NOT Recommended (Alert metric) */}
        <div className="bg-gradient-to-br from-amber-50 to-slate-50 border border-amber-200/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Trưng Bày Nhưng Không GT</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-900">{displayButNotRecommend}</span>
            <span className="text-xs font-medium text-slate-500">đại lý</span>
          </div>
          <p className="mt-2 text-xs text-amber-800 font-medium">
            Cần thúc đẩy salesman hỗ trợ & đào tạo nhân viên
          </p>
        </div>

      </div>

      {/* Visual Chart & Breakdown Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Chart Column */}
        <div className="lg:col-span-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Biểu Đồ So Sánh Số Lượng Đại Lý
          </h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: any) => [`${value} đại lý`, 'Số lượng']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overlap Matrix Breakdown */}
        <div className="lg:col-span-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Phân Tích Chi Tiết Mối Tương Quan
          </h3>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="font-semibold text-slate-800">Cả Trưng Bày & Giới Thiệu Hobi</span>
            </div>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
              {displayAndRecommend} đại lý ({Math.round((displayAndRecommend / (totalAudits || 1)) * 100)}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span className="font-semibold text-slate-800">Trưng Bày Nhưng KHÔNG Giới Thiệu Hobi</span>
            </div>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
              {displayButNotRecommend} đại lý ({Math.round((displayButNotRecommend / (totalAudits || 1)) * 100)}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
              <span className="font-semibold text-slate-800">Giới Thiệu Hobi Dù CHƯA Có Kệ Trưng Bày</span>
            </div>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
              {recommendWithoutDisplay} đại lý ({Math.round((recommendWithoutDisplay / (totalAudits || 1)) * 100)}%)
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0"></span>
              <span className="font-semibold text-slate-800">Chưa Trưng Bày & Chưa Giới Thiệu</span>
            </div>
            <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
              {neitherDisplayNorRecommend} đại lý ({Math.round((neitherDisplayNorRecommend / (totalAudits || 1)) * 100)}%)
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
