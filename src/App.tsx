/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuditRecord, AppSheetTable, SyncStatus, AppSheetConfig, PhanKhucItem } from './types';
import { fetchAppSheetAudits, fetchAppSheetTables, fetchPhanKhucItems, DEFAULT_APPSHEET_CONFIG } from './services/appsheetService';

// Header & Modal
import { Header } from './components/Header';
import { NewAuditModal } from './components/NewAuditModal';
import { NewDisplayDealerModal } from './components/NewDisplayDealerModal';
import { NewSegmentModal } from './components/NewSegmentModal';

// Analytics Sections
import { Section2DisplayByDept } from './components/Section2DisplayByDept';
import { Section4SegmentShare } from './components/Section4SegmentShare';
import { DepartmentSummaryTable } from './components/DepartmentSummaryTable';
import { CoSoTable } from './components/CoSoTable';
import { PhanKhucTable } from './components/PhanKhucTable';
import { KhaoSatAnalysis } from './components/KhaoSatAnalysis';

import { 
  LayoutDashboard, Filter, Layers, Database, Building, ClipboardList
} from 'lucide-react';

export default function App() {
  const [config] = useState<AppSheetConfig>(DEFAULT_APPSHEET_CONFIG);
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [displayDealerRecords, setDisplayDealerRecords] = useState<AuditRecord[]>([]);
  const [segmentRecords, setSegmentRecords] = useState<PhanKhucItem[]>([]);
  const [khaoSatRecords, setKhaoSatRecords] = useState<AuditRecord[]>([]);
  const [khaoSatStatus, setKhaoSatStatus] = useState({ isLoading: false, error: null as string | null });
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30); // 30s default
  const [activeTab, setActiveTab] = useState<'all' | 'coso' | 'phankhuc' | 'phantich' | '2' | '4'>('all');

  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    isLoading: true,
    error: null,
    mode: 'appsheet',
    totalRecords: 0
  });

  const [appSheetTables, setAppSheetTables] = useState<AppSheetTable[]>([]);
  const [tableStatus, setTableStatus] = useState({
    isLoading: false,
    error: null as string | null,
    lastRefresh: null as string | null
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisplayDealerModalOpen, setIsDisplayDealerModalOpen] = useState(false);
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);

  // Region Filter state
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('All');

  // Load Data from AppSheet API
  const loadData = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));
    setKhaoSatStatus({ isLoading: true, error: null });
    const [result, displayDealerResult, khaoSatResult, segmentResult] = await Promise.all([
      fetchAppSheetAudits(config),
      fetchAppSheetAudits({ ...config, tableName: 'Dai_ly' }, false),
      fetchAppSheetAudits({ ...config, tableName: 'Khao_sat' }, false),
      fetchPhanKhucItems()
    ]);

    setRecords(result.records);
    setDisplayDealerRecords(displayDealerResult.records);
    setKhaoSatRecords(khaoSatResult.records);
    setSegmentRecords(segmentResult.records);
    setKhaoSatStatus({
      isLoading: false,
      error: khaoSatResult.error || null
    });
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

  const loadAppSheetTables = useCallback(async () => {
    setTableStatus(prev => ({ ...prev, isLoading: true, error: null }));
    const result = await fetchAppSheetTables(config);
    if (result.success) {
      setAppSheetTables(result.tables?.Tables || []);
      setTableStatus({
        isLoading: false,
        error: null,
        lastRefresh: new Date().toLocaleTimeString('vi-VN')
      });
    } else {
      setAppSheetTables(result.tables?.Tables || []);
      setTableStatus({
        isLoading: false,
        error: typeof result.error === 'string'
          ? result.error
          : 'Không thể lấy danh sách bảng AppSheet.',
        lastRefresh: null
      });
    }
  }, [config]);

  useEffect(() => {
    loadAppSheetTables();
  }, [loadAppSheetTables]);

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
  const filteredDisplayDealerRecords = selectedRegionFilter === 'All'
    ? displayDealerRecords
    : displayDealerRecords.filter(r => r.region === selectedRegionFilter);

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
        appSheetTableCount={appSheetTables.length}
        tableStatus={tableStatus}
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
              onClick={() => setActiveTab('phankhuc')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'phankhuc'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bảng Phân Khúc</span>
            </button>

            <button
              onClick={() => setActiveTab('phantich')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'phantich'
                  ? 'bg-violet-700 text-white shadow-xs'
                  : 'text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Phân tích (Khao_sat)</span>
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

        {/* AppSheet Connection Status */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Kết nối AppSheet</div>
              <p className="text-xs text-slate-500 mt-1">
                Ứng dụng đang kết nối tới <span className="font-semibold text-slate-700">{config.appName}</span>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full font-semibold ${tableStatus.error ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                {tableStatus.isLoading ? 'Đang kiểm tra...' : tableStatus.error ? 'Không kết nối' : 'Đã kết nối'}
              </span>
              <button
                onClick={() => {
                  loadData();
                  loadAppSheetTables();
                }}
                disabled={tableStatus.isLoading || syncStatus.isLoading}
                className="px-3 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 disabled:opacity-50"
              >
                Cập nhật kết nối
              </button>
              {tableStatus.lastRefresh && (
                <span className="text-slate-400">Cập nhật: {tableStatus.lastRefresh}</span>
              )}
            </div>
          </div>

          {tableStatus.error ? (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-xl p-3">
              {tableStatus.error}. Vui lòng kiểm tra `appId` / `apiKey` hoặc bảng AppSheet.
            </div>
          ) : (
            <div className="grid gap-2 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {appSheetTables.map(table => (
                <div key={table.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                  <div className="text-slate-500 text-[11px] uppercase tracking-[0.12em]">Bảng</div>
                  <div className="font-semibold text-slate-900">{table.name}</div>
                  <div className="text-slate-400 text-[11px]">id: {table.id}</div>
                </div>
              ))}
            </div>
          )}
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
            <CoSoTable />
          )}

          {/* PHÂN KHÚC TABLE */}
          {(activeTab === 'all' || activeTab === 'phankhuc') && (
            <PhanKhucTable />
          )}

          {/* PHÂN TÍCH TỪ BẢNG KHAO_SAT */}
          {activeTab === 'phantich' && (
            <KhaoSatAnalysis
              records={khaoSatRecords}
              isLoading={khaoSatStatus.isLoading}
              error={khaoSatStatus.error}
              onRefresh={loadData}
            />
          )}

          {/* DEPARTMENT SUMMARY TABLE */}
          {activeTab === 'all' && (
            <DepartmentSummaryTable records={filteredRecords} />
          )}

          {/* SECTION 2 */}
          {(activeTab === 'all' || activeTab === '2') && (
            <Section2DisplayByDept
              records={filteredDisplayDealerRecords}
              onAddDealer={() => setIsDisplayDealerModalOpen(true)}
            />
          )}

          {/* SECTION 4 */}
          {(activeTab === 'all' || activeTab === '4') && (
            <Section4SegmentShare
              records={segmentRecords}
              onAddSegment={() => setIsSegmentModalOpen(true)}
            />
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
      <NewDisplayDealerModal
        isOpen={isDisplayDealerModalOpen}
        onClose={() => setIsDisplayDealerModalOpen(false)}
        onSaved={loadData}
      />
      <NewSegmentModal
        isOpen={isSegmentModalOpen}
        onClose={() => setIsSegmentModalOpen(false)}
        onSaved={loadData}
      />

    </div>
  );
}
