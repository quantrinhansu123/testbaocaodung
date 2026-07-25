/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuditRecord, SyncStatus, AppSheetConfig } from './types';
import { fetchAppSheetAudits, DEFAULT_APPSHEET_CONFIG } from './services/appsheetService';

// Header & Modal
import { Header } from './components/Header';
import { NewAuditModal } from './components/NewAuditModal';

// Analytics Sections (1 to 6)
import { Section1DisplayVsRecommend } from './components/Section1DisplayVsRecommend';
import { Section2DisplayByDept } from './components/Section2DisplayByDept';
import { Section3RecommendByDept } from './components/Section3RecommendByDept';
import { Section4SegmentShare } from './components/Section4SegmentShare';
import { Section5DealerDetail } from './components/Section5DealerDetail';
import { Section6CompetitorBySegment } from './components/Section6CompetitorBySegment';
import { DepartmentSummaryTable } from './components/DepartmentSummaryTable';
import { CoSoTable } from './components/CoSoTable';

import { 
  BarChart3, LayoutDashboard, Store, Megaphone, 
  Search, Filter, RefreshCw, Layers, ShieldAlert,
  ArrowUpRight, Sparkles, Database, Building2, Building
} from 'lucide-react';

export default function App() {
  const [config] = useState<AppSheetConfig>(DEFAULT_APPSHEET_CONFIG);
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // 30s default
  const [activeTab, setActiveTab] = useState<'all' | 'coso' | 'dept' | '1' | '2' | '3' | '4' | '5' | '6'>('all');

  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    isLoading: true,
    error: null,
    mode: 'appsheet',
    totalRecords: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Region Filter state
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('All');

  // Load Data from AppSheet API
  const loadData = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));
    const result = await fetchAppSheetAudits(config);

    setRecords(result.records);
    setSyncStatus({
      lastSyncTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isLoading: false,
      error: result.error || null,
      mode: result.isFallback ? 'fallback_sample' : 'appsheet',
      totalRecords: result.records.length
    });
  }, [config]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto Refresh Interval
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      loadData();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, loadData]);

  // Handle adding new local record immediately
  const handleAddLocalRecord = (newRec: AuditRecord) => {
    setRecords(prev => [newRec, ...prev]);
    setSyncStatus(prev => ({ ...prev, totalRecords: prev.totalRecords + 1 }));
  };

  // Filter records by region if selected
  const filteredRecords = selectedRegionFilter === 'All' 
    ? records 
    : records.filter(r => r.region === selectedRegionFilter);

  const availableRegions = Array.from(new Set(records.map(r => r.region).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        syncStatus={syncStatus}
        config={config}
        autoRefreshInterval={autoRefreshInterval}
        setAutoRefreshInterval={setAutoRefreshInterval}
        onRefresh={loadData}
        onOpenNewModal={() => setIsModalOpen(true)}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Global Filter Bar & Navigation Tabs */}
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs custom-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Tất Cả Phân Tích</span>
            </button>

            <button
              onClick={() => setActiveTab('coso')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'coso'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Bảng Cơ Sở (Co_so)</span>
            </button>

            <button
              onClick={() => setActiveTab('dept')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'dept'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Bảng Phòng Kinh Doanh</span>
            </button>

            <button
              onClick={() => setActiveTab('1')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === '1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] flex items-center justify-center">1</span>
              <span>Giới Thiệu vs Trưng Bày</span>
            </button>

            <button
              onClick={() => setActiveTab('2')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === '2'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-800 text-[10px] flex items-center justify-center">2</span>
              <span>Đại Lý Trưng Bày</span>
            </button>

            <button
              onClick={() => setActiveTab('3')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === '3'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] flex items-center justify-center">3</span>
              <span>Đại Lý Giới Thiệu</span>
            </button>

            <button
              onClick={() => setActiveTab('4')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === '4'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-800 text-[10px] flex items-center justify-center">4</span>
              <span>Phân Khúc Hobi</span>
            </button>

            <button
              onClick={() => setActiveTab('5')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === '5'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center">5</span>
              <span>Chi Tiết Đại Lý</span>
            </button>

            <button
              onClick={() => setActiveTab('6')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === '6'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-800 text-[10px] flex items-center justify-center">6</span>
              <span>Đối Thủ Phân Khúc</span>
            </button>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-2 text-xs shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Khu vực:</span>
            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="All">Tất cả khu vực ({records.length})</option>
              {availableRegions.map(reg => (
                <option key={reg} value={reg}>
                  {reg} ({records.filter(r => r.region === reg).length})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Sync Status Banner when using fallback sample dataset */}
        {syncStatus.error && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Thông báo kết nối AppSheet:</strong> {syncStatus.error}
              </span>
            </div>
            <button 
              onClick={loadData}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
            >
              Thử Lại
            </button>
          </div>
        )}

        {/* SECTIONS LAYOUT */}
        <div className="space-y-6">

          {/* CO_SO TABLE */}
          {(activeTab === 'all' || activeTab === 'coso') && (
            <CoSoTable records={filteredRecords} />
          )}

          {/* DEPARTMENT SUMMARY TABLE */}
          {(activeTab === 'all' || activeTab === 'dept') && (
            <DepartmentSummaryTable records={filteredRecords} />
          )}

          {/* SECTION 1 */}
          {(activeTab === 'all' || activeTab === '1') && (
            <Section1DisplayVsRecommend records={filteredRecords} />
          )}

          {/* SECTION 2 */}
          {(activeTab === 'all' || activeTab === '2') && (
            <Section2DisplayByDept records={filteredRecords} />
          )}

          {/* SECTION 3 */}
          {(activeTab === 'all' || activeTab === '3') && (
            <Section3RecommendByDept records={filteredRecords} />
          )}

          {/* SECTION 4 */}
          {(activeTab === 'all' || activeTab === '4') && (
            <Section4SegmentShare records={filteredRecords} />
          )}

          {/* SECTION 5 */}
          {(activeTab === 'all' || activeTab === '5') && (
            <Section5DealerDetail records={filteredRecords} />
          )}

          {/* SECTION 6 */}
          {(activeTab === 'all' || activeTab === '6') && (
            <Section6CompetitorBySegment records={filteredRecords} />
          )}

        </div>

      </main>

      {/* New Audit Survey Modal */}
      <NewAuditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddLocalRecord={handleAddLocalRecord}
        config={config}
      />

    </div>
  );
}
