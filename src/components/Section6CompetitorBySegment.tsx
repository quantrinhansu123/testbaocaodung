import React from 'react';
import { AuditRecord } from '../types';
import { ShieldAlert, Award, Layers, AlertCircle, HelpCircle } from 'lucide-react';

interface Section6Props {
  records: AuditRecord[];
}

interface SegmentCompetitorSummary {
  segment: string;
  totalInstances: number;
  competitorCounts: Record<string, number>;
  reasons: string[];
}

export const Section6CompetitorBySegment: React.FC<Section6Props> = ({ records }) => {
  // Aggregate competitor brand recommendations when Hobi was NOT introduced
  const segmentMap: Record<string, SegmentCompetitorSummary> = {};

  records.forEach(r => {
    if (Array.isArray(r.nonHobiCompetitorsBySegment)) {
      r.nonHobiCompetitorsBySegment.forEach(comp => {
        const seg = comp.segment?.trim() || 'Phân khúc chung';
        const brand = comp.recommendedCompetitorBrand?.trim() || 'Thương hiệu khác';

        if (!segmentMap[seg]) {
          segmentMap[seg] = {
            segment: seg,
            totalInstances: 0,
            competitorCounts: {},
            reasons: []
          };
        }

        segmentMap[seg].totalInstances += 1;
        segmentMap[seg].competitorCounts[brand] = (segmentMap[seg].competitorCounts[brand] || 0) + 1;

        if (comp.reasonOrNote && !segmentMap[seg].reasons.includes(comp.reasonOrNote)) {
          segmentMap[seg].reasons.push(comp.reasonOrNote);
        }
      });
    }
  });

  const segmentList = Object.values(segmentMap).sort((a, b) => b.totalInstances - a.totalInstances);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm">
              6
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Thương Hiệu Cạnh Tranh Theo Phân Khúc (Khi Không Giới Thiệu Hobi)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Thống kê các thương hiệu đối thủ được đại lý ưu tiên tư vấn cho khách hàng ở từng phân khúc khi đại lý không chọn thương hiệu Hobi.
          </p>
        </div>
        <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200">
          Thiết kế đơn giản & trực quan
        </div>
      </div>

      {segmentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {segmentList.map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition">
              
              {/* Segment Title */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-3">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-600" />
                  Phân Khúc: {item.segment}
                </span>
                <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {item.totalInstances} lần thay thế Hobi
                </span>
              </div>

              {/* Competitor Brands List */}
              <div className="space-y-2 mb-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Thương hiệu đối thủ chiếm ưu thế:
                </p>
                {Object.entries(item.competitorCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([brand, count], bIdx) => {
                    const percentage = Math.round((count / item.totalInstances) * 100);
                    return (
                      <div key={bIdx} className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                            {brand}
                          </span>
                          <span className="text-slate-600 font-mono">
                            {count} đại lý ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-slate-700 h-1.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Reasons / Field Observations */}
              {item.reasons.length > 0 && (
                <div className="bg-slate-100/80 p-2.5 rounded-lg text-xs text-slate-600 border border-slate-200/60">
                  <span className="font-bold text-slate-700 block mb-1">Lý do đại lý phản hồi:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    {item.reasons.map((r, rIdx) => (
                      <li key={rIdx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
          Chưa ghi nhận dữ liệu thương hiệu đối thủ thay thế Hobi.
        </div>
      )}

    </div>
  );
};
