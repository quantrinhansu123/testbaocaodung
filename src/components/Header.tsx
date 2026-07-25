import React from 'react';
import { RefreshCw, Radio, Plus, Database, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { SyncStatus, AppSheetConfig } from '../types';

interface TableStatus {
  isLoading: boolean;
  error: string | null;
  lastRefresh: string | null;
}

interface HeaderProps {
  syncStatus: SyncStatus;
  config: AppSheetConfig;
  appSheetTableCount: number;
  tableStatus: TableStatus;
  autoRefreshInterval: number;
  setAutoRefreshInterval: (seconds: number) => void;
  onRefresh: () => void;
  onOpenNewModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  syncStatus,
  config,
  appSheetTableCount,
  tableStatus,
  autoRefreshInterval,
  setAutoRefreshInterval,
  onRefresh,
  onOpenNewModal,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Title & AppSheet Identifiers */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center shrink-0 shadow-lg font-bold text-lg tracking-wider text-white">
              H
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-100">
                  Phân Tích Thị Trường Hobi
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  <Database className="w-3 h-3" /> AppSheet API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Bảng điều khiển khảo sát đại lý theo thời gian thực | <span className="text-slate-300 font-medium">Thêm khảo sát → Khao_sat</span>
              </p>
            </div>
          </div>

          {/* Real-time Controls & Status */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Real-time status indicator */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              {syncStatus.isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              ) : syncStatus.error ? (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}

              <span className="text-slate-300">
                {syncStatus.isLoading
                  ? 'Đang đồng bộ...'
                  : syncStatus.mode === 'appsheet'
                  ? 'AppSheet Trực Tuyến'
                  : 'Chế độ Mẫu Chuẩn'}
              </span>

              {syncStatus.lastSyncTime && (
                <span className="text-slate-400 border-l border-slate-700 pl-2 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {syncStatus.lastSyncTime}
                </span>
              )}
            </div>

            {/* AppSheet table connection summary */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              {tableStatus.isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              ) : tableStatus.error ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}

              <span className="text-slate-300">
                {tableStatus.isLoading
                  ? 'Kiểm tra bảng...'
                  : tableStatus.error
                  ? 'Không kết nối bảng'
                  : `Đã tìm ${appSheetTableCount} bảng`}
              </span>

              {tableStatus.lastRefresh && (
                <span className="text-slate-400 border-l border-slate-700 pl-2 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {tableStatus.lastRefresh}
                </span>
              )}
            </div>

            {/* Auto refresh interval selector */}
            <div className="flex items-center gap-1 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
              <Radio className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Tự động:</span>
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value={0} className="bg-slate-800 text-slate-200">Tắt</option>
                <option value={10} className="bg-slate-800 text-slate-200">10s</option>
                <option value={30} className="bg-slate-800 text-slate-200">30s</option>
                <option value={60} className="bg-slate-800 text-slate-200">60s</option>
              </select>
            </div>

            {/* Refresh button */}
            <button
              onClick={onRefresh}
              disabled={syncStatus.isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50 cursor-pointer"
              title="Cập nhật dữ liệu từ AppSheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Làm mới</span>
            </button>

            {/* New Audit Modal Trigger */}
            <button
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-sm transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm khảo sát (Khao_sat)</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
