import React from 'react';
import { AuditRecord } from '../types';
import { BarChart3, PieChart as PieIcon, Layers, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';

interface Section4Props {
  records: AuditRecord[];
}

export const Section4SegmentShare: React.FC<Section4Props> = ({ records }) => {
  // Filter dealers that recommend Hobi
  const recommendingRecords = records.filter(r => r.isRecommendingHobi);

  // Map segment frequencies
  const segmentCounts: Record<string, number> = {};
  let totalHobiSegmentRecommendations = 0;

  recommendingRecords.forEach(r => {
    if (Array.isArray(r.hobiSegmentsRecommended) && r.hobiSegmentsRecommended.length > 0) {
      r.hobiSegmentsRecommended.forEach(seg => {
        const cleanSeg = seg.trim();
        if (cleanSeg) {
          segmentCounts[cleanSeg] = (segmentCounts[cleanSeg] || 0) + 1;
          totalHobiSegmentRecommendations++;
        }
      });
    }
  });

  // Color palette for segments
  const COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#4b5563'];

  // Convert to sorted array
  const segmentData = Object.entries(segmentCounts)
    .map(([segment, count], index) => {
      const sharePercentage = totalHobiSegmentRecommendations > 0
        ? Number(((count / totalHobiSegmentRecommendations) * 100).toFixed(1))
        : 0;
      return {
        segment,
        count,
        sharePercentage,
        color: COLORS[index % COLORS.length]
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
              4
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              So Sánh Các Phân Khúc Sản Phẩm Hobi Được Đại Lý Giới Thiệu
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Tỷ lệ số lần mỗi phân khúc sản phẩm Hobi được tư vấn so với tổng số lần sản phẩm Hobi được các đại lý giới thiệu.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">
          Tổng lượt giới thiệu phân khúc: {totalHobiSegmentRecommendations} lần
        </div>
      </div>

      {/* Segment Cards Row */}
      {segmentData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {segmentData.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 relative overflow-hidden transition hover:border-blue-300 shadow-2xs"
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-1" 
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[170px]" title={item.segment}>
                    {item.segment}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    Top #{idx + 1}
                  </span>
                </div>
                
                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-2xl font-black text-slate-900">{item.count}</span>
                  <span className="text-xs font-semibold text-slate-500">lượt tư vấn</span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ width: `${item.sharePercentage}%`, backgroundColor: item.color }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mt-1.5">
                  <span>Tỷ trọng giới thiệu:</span>
                  <span style={{ color: item.color }}>{item.sharePercentage}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Bar Chart */}
            <div className="lg:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Số Lần Giới Thiệu Theo Phân Khúc (Lượt)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segmentData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="segment" type="category" tick={{ fontSize: 10, fill: '#334155' }} width={120} />
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value} lượt (${props.payload.sharePercentage}% tổng giới thiệu)`,
                        'Số lượt tư vấn'
                      ]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart Share */}
            <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                Cơ Cấu % Tỷ Trọng Phân Khúc Hobi
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      dataKey="sharePercentage"
                      nameKey="segment"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, sharePercentage }) => `${sharePercentage}%`}
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [
                        `${value}% (${props.payload.count} lượt)`,
                        props.payload.segment
                      ]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
          Chưa ghi nhận lượt giới thiệu phân khúc Hobi nào.
        </div>
      )}

    </div>
  );
};
