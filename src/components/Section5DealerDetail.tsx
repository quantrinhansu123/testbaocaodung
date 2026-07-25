import React, { useState, useMemo } from 'react';
import { AuditRecord } from '../types';
import { 
  Building2, Search, MapPin, Phone, Calendar, User, 
  Store, Megaphone, CheckCircle2, XCircle, Tag, 
  ChevronRight, Award, ShieldAlert, Sparkles, Filter
} from 'lucide-react';

interface Section5Props {
  records: AuditRecord[];
}

// Function to assign vibrant unique color badges to non-Hobi competitor brands
const NON_HOBI_BRAND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Kosmos': { bg: 'bg-rose-100', text: 'text-rose-800 font-extrabold', border: 'border-rose-300' },
  'An Cường': { bg: 'bg-emerald-100', text: 'text-emerald-800 font-extrabold', border: 'border-emerald-300' },
  'Inovar': { bg: 'bg-amber-100', text: 'text-amber-900 font-extrabold', border: 'border-amber-300' },
  'Glotex': { bg: 'bg-violet-100', text: 'text-violet-800 font-extrabold', border: 'border-violet-300' },
  'Robina': { bg: 'bg-pink-100', text: 'text-pink-800 font-extrabold', border: 'border-pink-300' },
  'Galamax': { bg: 'bg-cyan-100', text: 'text-cyan-800 font-extrabold', border: 'border-cyan-300' },
  'Janmi': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800 font-extrabold', border: 'border-fuchsia-300' },
  'Thiên Hà': { bg: 'bg-teal-100', text: 'text-teal-800 font-extrabold', border: 'border-teal-300' },
  'KronoOriginal': { bg: 'bg-orange-100', text: 'text-orange-800 font-extrabold', border: 'border-orange-300' },
};

export const Section5DealerDetail: React.FC<Section5Props> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(
    records.length > 0 ? records[0].id : null
  );

  // Get unique regions
  const regions = useMemo(() => {
    const list = Array.from(new Set(records.map(r => r.region).filter(Boolean)));
    return ['All', ...list];
  }, [records]);

  // Filter dealers
  const filteredDealers = useMemo(() => {
    return records.filter(r => {
      const matchSearch = 
        r.dealerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.otherBrands.some(b => b.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchRegion = selectedRegion === 'All' || r.region === selectedRegion;
      return matchSearch && matchRegion;
    });
  }, [records, searchTerm, selectedRegion]);

  // Currently selected dealer
  const selectedDealer = useMemo(() => {
    return records.find(r => r.id === selectedDealerId) || filteredDealers[0] || null;
  }, [records, selectedDealerId, filteredDealers]);

  const getBrandBadgeStyle = (brandName: string) => {
    const cleanName = brandName.trim();
    if (NON_HOBI_BRAND_COLORS[cleanName]) {
      return NON_HOBI_BRAND_COLORS[cleanName];
    }
    // Fallback vibrant color
    return { bg: 'bg-rose-50', text: 'text-rose-700 font-extrabold', border: 'border-rose-200' };
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
              5
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Xem Dữ Liệu Chi Tiết Tổng Quan Theo Từng Đại Lý
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Chọn đại lý bên dưới để xem Dashboard tổng quan chi tiết. <span className="text-rose-600 font-bold">Các thương hiệu đối thủ ngoài Hobi sẽ được làm nổi bật với màu sắc bắt mắt riêng biệt.</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Dealer Selector (Left 4 cols) + Overview Dashboard (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Dealer Selector & Search */}
        <div className="lg:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col h-[620px]">
          
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-600" />
            Danh Sách Đại Lý Khảo Sát ({filteredDealers.length})
          </h3>

          {/* Search Box */}
          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên đại lý, thương hiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-[11px]">
            <Filter className="w-3 h-3 text-slate-400 shrink-0" />
            {regions.map(reg => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedRegion === reg
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {reg === 'All' ? 'Tất cả' : reg}
              </button>
            ))}
          </div>

          {/* Scrollable Dealer List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredDealers.map((d) => {
              const isSelected = selectedDealer?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDealerId(d.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-amber-900' : 'text-slate-900'}`}>
                        {d.dealerName}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {d.address}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-amber-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10px]">
                    <span className={`px-1.5 py-0.5 rounded font-semibold ${
                      d.isDisplayingHobi ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {d.isDisplayingHobi ? `TB: ${d.displayDepartment}` : 'K.Trưng Bày'}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded font-semibold ${
                      d.isRecommendingHobi ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {d.isRecommendingHobi ? `GT: ${d.recommendDepartment}` : 'K.Giới Thiệu'}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredDealers.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">
                Không tìm thấy đại lý phù hợp.
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Selected Dealer Overview Dashboard Panel */}
        <div className="lg:col-span-8">
          {selectedDealer ? (
            <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-lg border border-slate-800 space-y-5">
              
              {/* Dealer Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded text-[11px] font-mono font-bold">
                      {selectedDealer.dealerId}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      {selectedDealer.dealerName}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> {selectedDealer.address}
                    </span>
                    {selectedDealer.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-blue-400" /> {selectedDealer.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-emerald-400" /> {selectedDealer.mysteryShopperName || 'KTV'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" /> {selectedDealer.auditDate}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                    selectedDealer.isDisplayingHobi && selectedDealer.isRecommendingHobi
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : selectedDealer.isDisplayingHobi
                      ? 'bg-blue-950 text-blue-300 border-blue-700'
                      : 'bg-rose-950 text-rose-300 border-rose-700'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    {selectedDealer.isDisplayingHobi && selectedDealer.isRecommendingHobi
                      ? 'Đại Lý Tiềm Năng Cao'
                      : selectedDealer.isDisplayingHobi
                      ? 'Đã Trưng Bày Hobi'
                      : 'Cần Khai Thác'}
                  </span>
                </div>
              </div>

              {/* Hobi Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Trưng Bày Status */}
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-blue-400" />
                      Tình Trạng Trưng Bày Hobi
                    </span>
                    {selectedDealer.isDisplayingHobi ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="text-base font-bold text-white mt-1">
                    {selectedDealer.isDisplayingHobi ? selectedDealer.displayDepartment : 'Chưa Trưng Bày Mẫu Hobi'}
                  </div>
                </div>

                {/* Giới Thiệu Status */}
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4 text-emerald-400" />
                      Tình Trạng Giới Thiệu Hobi
                    </span>
                    {selectedDealer.isRecommendingHobi ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                  <div className="text-base font-bold text-white mt-1">
                    {selectedDealer.isRecommendingHobi ? selectedDealer.recommendDepartment : 'Chưa Giới Thiệu Cho Khách'}
                  </div>
                </div>

              </div>

              {/* Hobi Segments Recommended */}
              {selectedDealer.hobiSegmentsRecommended.length > 0 && (
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/80">
                  <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">
                    Các Phân Khúc Hobi Được Đại Lý Tư Vấn:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDealer.hobiSegmentsRecommended.map((seg, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-900/60 text-blue-200 border border-blue-700/50">
                        ✓ {seg}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CRITICAL SECTION 5 REQUIREMENT: NON-HOBI COMPETITOR BRANDS HIGHLIGHTED PROMINENTLY */}
              <div className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-800/80 p-4 rounded-xl border-2 border-rose-500/40 relative shadow-inner">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                    Thương Hiệu Khác Cùng Trưng Bày / Tư Vấn (Không Phải Hobi)
                  </h4>
                  <span className="text-[10px] text-slate-400 italic">
                    Nổi bật với màu sắc riêng biệt
                  </span>
                </div>

                {selectedDealer.otherBrands.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5 mt-2">
                    {selectedDealer.otherBrands.map((brand, idx) => {
                      const style = getBrandBadgeStyle(brand);
                      return (
                        <span 
                          key={idx} 
                          className={`px-3 py-1.5 rounded-lg text-xs border shadow-md transition transform hover:scale-105 ${style.bg} ${style.text} ${style.border}`}
                        >
                          🏷️ {brand}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Không ghi nhận thương hiệu đối thủ khác tại đại lý này.</p>
                )}
              </div>

              {/* Competitors recommended by segment when Hobi was NOT recommended */}
              {selectedDealer.nonHobiCompetitorsBySegment.length > 0 && (
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    Thương Hiệu Đối Thủ Được Tư Vấn Thay Thế Hobi Theo Phân Khúc:
                  </h4>
                  <div className="space-y-2 text-xs">
                    {selectedDealer.nonHobiCompetitorsBySegment.map((comp, idx) => {
                      const style = getBrandBadgeStyle(comp.recommendedCompetitorBrand);
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-700">
                          <span className="text-slate-300 font-medium">{comp.segment}:</span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded text-xs border ${style.bg} ${style.text} ${style.border}`}>
                              {comp.recommendedCompetitorBrand}
                            </span>
                            {comp.reasonOrNote && (
                              <span className="text-[11px] text-slate-400 italic">({comp.reasonOrNote})</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Survey Notes */}
              {selectedDealer.notes && (
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-slate-400">Ghi chú thực địa:</span> {selectedDealer.notes}
                </div>
              )}

            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
              Vui lòng chọn một đại lý từ danh sách để xem tổng quan.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
