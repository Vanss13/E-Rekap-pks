import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Activity,
  Search,
  MapPin,
  Download,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Users,
  Check,
  AlertTriangle,
  RefreshCw,
  Copy,
  FileSpreadsheet,
  ChevronRight,
  X
} from 'lucide-react';
import {
  ActivityCategory,
  ActivityLogEntry,
  deleteActivityLogsBatchFromCloud,
  deleteAllActivityLogsFromCloud
} from '../lib/firebase';
import { persistCachedActivityLogs } from '../lib/activityLogger';
import { AppUser } from '../App';

interface ActivityLogsAdminViewProps {
  logs: ActivityLogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<ActivityLogEntry[]>>;
  usersList: AppUser[];
  currentUser: AppUser | null;
  isSuperAdmin: boolean;
  onRefreshLocation?: () => Promise<void>;
  onLogExport?: (title: string, details: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  initialSelectedUsername?: string | null;
}

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  auth: 'Login & Sesi',
  navigation: 'Navigasi Menu',
  scoring: 'Penilaian Lomba',
  registration: 'Pendaftaran & Bayar',
  data_edit: 'Edit & Pengaturan',
  data_delete: 'Hapus Data',
  export: 'Ekspor & Cetak',
  system: 'Sistem'
};

const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin Panitia',
  juri: 'Juri Lapangan',
  sekolah: 'Perwakilan Sekolah',
  pembina_polres: 'Pembina Polres',
  user: 'Tamu / User'
};

const LOCATION_STATUS_LABELS: Record<string, string> = {
  granted: 'GPS Aktif',
  denied: 'Lokasi ditolak pengguna',
  timeout: 'Deteksi lokasi timeout',
  unavailable: 'GPS tidak tersedia'
};

export const ActivityLogsAdminView: React.FC<ActivityLogsAdminViewProps> = ({
  logs,
  setLogs,
  usersList,
  currentUser,
  isSuperAdmin,
  onRefreshLocation,
  onLogExport,
  showToast,
  initialSelectedUsername
}) => {
  const [selectedUsername, setSelectedUsername] = useState<string>(initialSelectedUsername || '__ALL__');
  const [accountSearch, setAccountSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    if (initialSelectedUsername !== undefined) {
      setSelectedUsername(initialSelectedUsername || '__ALL__');
      setVisibleLimit(50);
    }
  }, [initialSelectedUsername]);

  const [logSearch, setLogSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ActivityCategory>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(50);

  const [confirmClearTarget, setConfirmClearTarget] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Group logs by account username so every account is isolated cleanly
  const accountSummaries = useMemo(() => {
    const map = new Map<
      string,
      {
        username: string;
        userName: string;
        userRole: string;
        totalLogs: number;
        lastTimestamp: string;
        lastDate: string;
        lastTime: string;
        lastLocationStatus: string;
        lastLat: number | null;
        lastLng: number | null;
      }
    >();

    // Seed with registered accounts so accounts with 0 logs are also visible
    usersList.forEach(u => {
      const uname = (u.username || '').trim().toLowerCase();
      if (!uname) return;
      map.set(uname, {
        username: uname,
        userName: u.name || uname,
        userRole: u.role || 'user',
        totalLogs: 0,
        lastTimestamp: '',
        lastDate: '-',
        lastTime: '-',
        lastLocationStatus: 'none',
        lastLat: null,
        lastLng: null
      });
    });

    // Aggregate log entries (logs are assumed newest first, but we compare timestampIso safely)
    logs.forEach(entry => {
      const uname = (entry.username || '').trim().toLowerCase();
      if (!uname) return;
      const existing = map.get(uname);
      if (!existing) {
        map.set(uname, {
          username: uname,
          userName: entry.userName || uname,
          userRole: entry.userRole || 'user',
          totalLogs: 1,
          lastTimestamp: entry.timestampIso || '',
          lastDate: entry.dateLabel || '-',
          lastTime: entry.timeLabel || '-',
          lastLocationStatus: entry.locationStatus || 'unavailable',
          lastLat: entry.latitude ?? null,
          lastLng: entry.longitude ?? null
        });
      } else {
        existing.totalLogs += 1;
        if ((entry.timestampIso || '') >= existing.lastTimestamp) {
          existing.lastTimestamp = entry.timestampIso || '';
          existing.lastDate = entry.dateLabel || '-';
          existing.lastTime = entry.timeLabel || '-';
          existing.userName = entry.userName || existing.userName;
          existing.userRole = entry.userRole || existing.userRole;
          existing.lastLocationStatus = entry.locationStatus || existing.lastLocationStatus;
          existing.lastLat = entry.latitude ?? null;
          existing.lastLng = entry.longitude ?? null;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.lastTimestamp !== a.lastTimestamp) {
        return b.lastTimestamp.localeCompare(a.lastTimestamp);
      }
      return b.totalLogs - a.totalLogs;
    });
  }, [logs, usersList]);

  const filteredAccounts = useMemo(() => {
    const q = accountSearch.trim().toLowerCase();
    return accountSummaries.filter(acc => {
      if (roleFilter !== 'all' && acc.userRole !== roleFilter) return false;
      if (!q) return true;
      return (
        acc.username.toLowerCase().includes(q) ||
        acc.userName.toLowerCase().includes(q) ||
        (ROLE_LABELS[acc.userRole] || acc.userRole).toLowerCase().includes(q)
      );
    });
  }, [accountSummaries, accountSearch, roleFilter]);

  const selectedAccountSummary = useMemo(() => {
    if (selectedUsername === '__ALL__') return null;
    return accountSummaries.find(a => a.username === selectedUsername) || null;
  }, [accountSummaries, selectedUsername]);

  const filteredLogs = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    return logs.filter(item => {
      const uname = (item.username || '').trim().toLowerCase();
      if (selectedUsername !== '__ALL__' && uname !== selectedUsername) return false;
      if (categoryFilter !== 'all' && item.actionCategory !== categoryFilter) return false;
      if (dateFilter && item.dateLabel !== dateFilter) return false;
      if (!q) return true;
      return (
        (item.actionTitle || '').toLowerCase().includes(q) ||
        (item.details || '').toLowerCase().includes(q) ||
        (item.tabContext || '').toLowerCase().includes(q) ||
        (item.userName || '').toLowerCase().includes(q) ||
        uname.includes(q)
      );
    });
  }, [logs, selectedUsername, categoryFilter, dateFilter, logSearch]);

  const displayedLogs = useMemo(() => {
    return filteredLogs.slice(0, visibleLimit);
  }, [filteredLogs, visibleLimit]);

  const handleSelectAccount = (uname: string) => {
    setSelectedUsername(uname);
    setVisibleLimit(50);
    setConfirmClearTarget(null);
  };

  const handleCopyCoords = (id: string, lat: number, lng: number) => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(prev => (prev === id ? null : prev)), 1800);
    showToast(`Koordinat ${text} disalin.`, 'info');
  };

  const handleRefreshAdminGps = async () => {
    if (!onRefreshLocation || isRefreshingGps) return;
    setIsRefreshingGps(true);
    try {
      await onRefreshLocation();
      showToast('Status GPS & log posisi admin diperbarui.', 'success');
    } finally {
      setIsRefreshingGps(false);
    }
  };

  const buildSheetRows = (entries: ActivityLogEntry[]) => {
    return entries.map((item, idx) => ({
      No: idx + 1,
      Tanggal: item.dateLabel,
      Waktu: item.timeLabel,
      Username: item.username,
      'Nama Akun': item.userName,
      Peran: ROLE_LABELS[item.userRole] || item.userRole,
      Kategori: CATEGORY_LABELS[item.actionCategory] || item.actionCategory,
      Aktivitas: item.actionTitle,
      Rincian: item.details,
      'Konteks Menu': item.tabContext,
      'Status Lokasi': LOCATION_STATUS_LABELS[item.locationStatus] || item.locationStatus,
      Latitude: item.latitude ?? '',
      Longitude: item.longitude ?? '',
      'Akurasi (m)': item.accuracy ?? '',
      'Tautan Google Maps':
        item.latitude != null && item.longitude != null
          ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}`
          : '',
      Perangkat: item.userAgent || ''
    }));
  };

  const handleExportSelectedExcel = () => {
    if (filteredLogs.length === 0) {
      showToast('Tidak ada data log untuk diekspor.', 'info');
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(buildSheetRows(filteredLogs));
    ws['!cols'] = [
      { wch: 5 },
      { wch: 12 },
      { wch: 10 },
      { wch: 18 },
      { wch: 26 },
      { wch: 18 },
      { wch: 18 },
      { wch: 30 },
      { wch: 44 },
      { wch: 22 },
      { wch: 24 },
      { wch: 13 },
      { wch: 13 },
      { wch: 12 },
      { wch: 44 },
      { wch: 20 }
    ];
    const sheetTitle =
      selectedUsername === '__ALL__'
        ? 'Semua_Akun'
        : selectedUsername.replace(/[\\/*?:[\]]/g, '').slice(0, 28) || 'Akun';
    XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName =
      selectedUsername === '__ALL__'
        ? `Log_Aktivitas_Semua_Akun_${dateStamp}.xlsx`
        : `Log_Aktivitas_${selectedUsername}_${dateStamp}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast(`Berhasil mengunduh ${fileName}`, 'success');
    if (onLogExport) {
      onLogExport(
        'Ekspor Log Aktivitas Excel',
        `Mengunduh ${filteredLogs.length} baris log (${selectedUsername === '__ALL__' ? 'Semua Akun' : `@${selectedUsername}`}).`
      );
    }
  };

  // Export separated by account into individual Excel sheets
  const handleExportSeparatedWorkbook = () => {
    if (logs.length === 0) {
      showToast('Belum ada log aktivitas yang tersimpan.', 'info');
      return;
    }
    const wb = XLSX.utils.book_new();

    const summaryRows = accountSummaries.map((acc, idx) => ({
      No: idx + 1,
      Username: acc.username,
      'Nama Akun': acc.userName,
      Peran: ROLE_LABELS[acc.userRole] || acc.userRole,
      'Total Aktivitas': acc.totalLogs,
      'Tanggal Terakhir': acc.lastDate,
      'Waktu Terakhir': acc.lastTime,
      'Status Lokasi Terakhir':
        acc.lastLocationStatus === 'none'
          ? 'Belum Ada Log'
          : LOCATION_STATUS_LABELS[acc.lastLocationStatus] || acc.lastLocationStatus,
      'Latitude Terakhir': acc.lastLat ?? '',
      'Longitude Terakhir': acc.lastLng ?? ''
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan_Akun');

    const groupedByUser = new Map<string, ActivityLogEntry[]>();
    logs.forEach(entry => {
      const uname = (entry.username || 'unknown').toLowerCase();
      const arr = groupedByUser.get(uname) || [];
      arr.push(entry);
      groupedByUser.set(uname, arr);
    });

    const usedSheetNames = new Set<string>(['Ringkasan_Akun']);
    groupedByUser.forEach((entries, uname) => {
      const baseName = `Akun_${uname}`.replace(/[\\/*?:[\]]/g, '_').slice(0, 28);
      let sheetName = baseName;
      let counter = 2;
      while (usedSheetNames.has(sheetName)) {
        sheetName = `${baseName.slice(0, 25)}_${counter}`;
        counter++;
      }
      usedSheetNames.add(sheetName);
      const wsUser = XLSX.utils.json_to_sheet(buildSheetRows(entries));
      XLSX.utils.book_append_sheet(wb, wsUser, sheetName);
    });

    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = `Log_Aktivitas_Terpisah_Per_Akun_${dateStamp}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showToast(`Workbook log terpisah per akun berhasil diunduh.`, 'success');
    if (onLogExport) {
      onLogExport(
        'Ekspor Workbook Log Terpisah Per Akun',
        `Mengunduh ${logs.length} log dalam ${groupedByUser.size} sheet akun terpisah.`
      );
    }
  };

  const handleConfirmClearLogs = async () => {
    if (!isSuperAdmin || !confirmClearTarget) return;
    setIsClearing(true);
    try {
      const targetEntries =
        confirmClearTarget === '__ALL__'
          ? logs
          : logs.filter(l => (l.username || '').toLowerCase() === confirmClearTarget);

      if (confirmClearTarget === '__ALL__') {
        await deleteAllActivityLogsFromCloud();
        setLogs([]);
        persistCachedActivityLogs([]);
        showToast(`Seluruh ${targetEntries.length} log aktivitas berhasil dibersihkan.`, 'info');
      } else {
        await deleteActivityLogsBatchFromCloud(targetEntries.map(l => l.id));
        const remaining = logs.filter(l => (l.username || '').toLowerCase() !== confirmClearTarget);
        setLogs(remaining);
        persistCachedActivityLogs(remaining);
        showToast(
          `${targetEntries.length} log milik akun @${confirmClearTarget} berhasil dihapus.`,
          'info'
        );
      }
      setConfirmClearTarget(null);
    } finally {
      setIsClearing(false);
    }
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
    return null;
  }

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Log Aktivitas Pengguna (Terpisah Per Akun)
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Rekaman otomatis tanggal, waktu, jenis aktivitas, dan koordinat GPS perangkat untuk setiap akun pengguna. Hanya dapat diakses Administrator.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onRefreshLocation && (
            <button
              type="button"
              onClick={handleRefreshAdminGps}
              disabled={isRefreshingGps}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingGps ? 'animate-spin' : ''}`} />
              <span>Perbarui GPS</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleExportSelectedExcel}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Ekspor Pilihan (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={handleExportSeparatedWorkbook}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Ekspor Semua (Sheet Per Akun)</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Account-Separated Audit Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Account List Separator */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-500" />
                <span>Pilih Akun ({accountSummaries.length})</span>
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                Total {logs.length} log
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={accountSearch}
                onChange={e => setAccountSearch(e.target.value)}
                placeholder="Cari username atau nama akun..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'superadmin', label: 'Superadmin' },
                { key: 'admin', label: 'Admin' },
                { key: 'juri', label: 'Juri' },
                { key: 'sekolah', label: 'Sekolah' },
                { key: 'pembina_polres', label: 'Pembina Polres' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRoleFilter(tab.key)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                    roleFilter === tab.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {/* All Accounts Option */}
            <button
              type="button"
              onClick={() => handleSelectAccount('__ALL__')}
              className={`w-full text-left px-4 py-3 transition flex items-center justify-between gap-2 cursor-pointer ${
                selectedUsername === '__ALL__'
                  ? 'bg-blue-50/80 text-blue-950'
                  : 'hover:bg-slate-50 text-slate-800'
              }`}
            >
              <div className="min-w-0">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>Semua Akun (Gabungan)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Tampilkan kronologi seluruh aktivitas sistem
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-mono tabular-nums font-bold text-slate-700">
                  {logs.length}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </button>

            {filteredAccounts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Tidak ada akun yang cocok dengan pencarian.
              </div>
            ) : (
              filteredAccounts.map(acc => {
                const isSelected = selectedUsername === acc.username;
                return (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleSelectAccount(acc.username)}
                    className={`w-full text-left px-4 py-3 transition flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {acc.userName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono">@{acc.username}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ROLE_LABELS[acc.userRole] || acc.userRole}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono tabular-nums">
                        {acc.totalLogs > 0 ? (
                          <>
                            <span>{acc.lastDate} {acc.lastTime}</span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                acc.lastLocationStatus === 'granted'
                                  ? 'text-emerald-700 font-sans font-medium'
                                  : acc.lastLocationStatus === 'denied'
                                  ? 'text-rose-700 font-sans font-medium'
                                  : 'text-amber-700 font-sans font-medium'
                              }
                            >
                              {acc.lastLocationStatus === 'granted'
                                ? 'GPS Aktif'
                                : acc.lastLocationStatus === 'denied'
                                ? 'Lokasi Ditolak'
                                : 'GPS Terbatas'}
                            </span>
                          </>
                        ) : (
                          <span className="font-sans text-slate-400">Belum ada aktivitas</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <span
                        className={`text-xs font-mono tabular-nums font-bold ${
                          isSelected ? 'text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {acc.totalLogs}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Isolated Log Feed for Selected Account */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Selected Account Context Header */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedAccountSummary
                    ? `Riwayat Aktivitas: ${selectedAccountSummary.userName}`
                    : 'Riwayat Aktivitas Semua Akun'}
                </h3>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                  {selectedAccountSummary ? (
                    <>
                      <span className="font-mono">@{selectedAccountSummary.username}</span>
                      <span aria-hidden="true">·</span>
                      <span>{ROLE_LABELS[selectedAccountSummary.userRole] || selectedAccountSummary.userRole}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {filteredLogs.length} entri ditampilkan
                      </span>
                      {selectedAccountSummary.lastLat != null && selectedAccountSummary.lastLng != null && (
                        <>
                          <span aria-hidden="true">·</span>
                          <a
                            href={`https://www.google.com/maps?q=${selectedAccountSummary.lastLat},${selectedAccountSummary.lastLng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Lokasi Terakhir ({selectedAccountSummary.lastLat.toFixed(4)}, {selectedAccountSummary.lastLng.toFixed(4)})</span>
                          </a>
                        </>
                      )}
                    </>
                  ) : (
                    <span>
                      Menampilkan gabungan {filteredLogs.length} aktivitas dari {accountSummaries.filter(a => a.totalLogs > 0).length} akun aktif. Pilih akun di panel kiri untuk memisahkan log per akun.
                    </span>
                  )}
                </div>
              </div>

              {isSuperAdmin && filteredLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmClearTarget(selectedUsername)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {selectedUsername === '__ALL__' ? 'Bersihkan Semua Log' : 'Hapus Log Akun Ini'}
                  </span>
                </button>
              )}
            </div>

            {/* Inline Clear Confirmation */}
            {confirmClearTarget && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-rose-900 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {confirmClearTarget === '__ALL__'
                      ? `Hapus permanen seluruh ${logs.length} log aktivitas dari Cloud?`
                      : `Hapus permanen semua log aktivitas milik akun @${confirmClearTarget}?`}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmClearTarget(null)}
                    disabled={isClearing}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClearLogs}
                    disabled={isClearing}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700 cursor-pointer disabled:opacity-60"
                  >
                    {isClearing ? 'Menghapus...' : 'Ya, Hapus Permanen'}
                  </button>
                </div>
              </div>
            )}

            {/* Search, Date & Category Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-7 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={e => {
                    setLogSearch(e.target.value);
                    setVisibleLimit(50);
                  }}
                  placeholder="Cari aktivitas, rincian, atau konteks menu..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>
              <div className="sm:col-span-5 flex items-center gap-1.5">
                <div className="relative flex-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={e => {
                      setDateFilter(e.target.value);
                      setVisibleLimit(50);
                    }}
                    className="w-full pl-8 pr-2 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                  />
                </div>
                {dateFilter && (
                  <button
                    type="button"
                    onClick={() => setDateFilter('')}
                    title="Reset filter tanggal"
                    className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'auth', label: 'Login & Sesi' },
                { key: 'navigation', label: 'Navigasi' },
                { key: 'scoring', label: 'Penilaian' },
                { key: 'registration', label: 'Pendaftaran & Bayar' },
                { key: 'data_edit', label: 'Edit' },
                { key: 'data_delete', label: 'Hapus' },
                { key: 'export', label: 'Ekspor & Cetak' }
              ].map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setCategoryFilter(cat.key as 'all' | ActivityCategory);
                    setVisibleLimit(50);
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition whitespace-nowrap shrink-0 cursor-pointer ${
                    categoryFilter === cat.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Table */}
          {displayedLogs.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Activity className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">
                Belum Ada Catatan Aktivitas
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {selectedAccountSummary
                  ? `Akun ${selectedAccountSummary.userName} (@${selectedAccountSummary.username}) belum memiliki log aktivitas yang sesuai dengan filter saat ini.`
                  : 'Aktivitas penggunaan aplikasi dari setiap akun akan tercatat otomatis di sini lengkap dengan tanggal, jam, dan koordinat GPS.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-2.5 px-4 whitespace-nowrap">Tanggal & Waktu</th>
                      {selectedUsername === '__ALL__' && (
                        <th className="py-2.5 px-3 whitespace-nowrap">Akun</th>
                      )}
                      <th className="py-2.5 px-3">Aktivitas & Rincian</th>
                      <th className="py-2.5 px-4 whitespace-nowrap">Koordinat Lokasi (GPS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {displayedLogs.map(item => {
                      const hasCoords =
                        item.locationStatus === 'granted' &&
                        item.latitude != null &&
                        item.longitude != null;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors align-top">
                          <td className="py-3 px-4 whitespace-nowrap font-mono tabular-nums">
                            <div className="font-semibold text-slate-900">{item.dateLabel}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{item.timeLabel}</span>
                            </div>
                          </td>

                          {selectedUsername === '__ALL__' && (
                            <td className="py-3 px-3 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleSelectAccount((item.username || '').toLowerCase())}
                                className="text-left group cursor-pointer"
                                title="Klik untuk memisahkan log akun ini"
                              >
                                <div className="font-semibold text-slate-900 group-hover:text-blue-600">
                                  {item.userName}
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  @{item.username} · {ROLE_LABELS[item.userRole] || item.userRole}
                                </div>
                              </button>
                            </td>
                          )}

                          <td className="py-3 px-3 min-w-[240px]">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
                              <span
                                className={`font-semibold ${
                                  item.actionCategory === 'data_delete'
                                    ? 'text-rose-700'
                                    : item.actionCategory === 'scoring' || item.actionCategory === 'registration'
                                    ? 'text-emerald-700'
                                    : item.actionCategory === 'auth'
                                    ? 'text-blue-700'
                                    : 'text-slate-700'
                                }`}
                              >
                                {CATEGORY_LABELS[item.actionCategory] || item.actionCategory}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-[200px]">{item.tabContext}</span>
                            </div>
                            <div className="font-semibold text-slate-900">{item.actionTitle}</div>
                            {item.details && (
                              <div className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                {item.details}
                              </div>
                            )}
                            {item.userAgent && (
                              <div className="text-[10px] text-slate-400 mt-1">{item.userAgent}</div>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {hasCoords ? (
                              <div className="space-y-1">
                                <div className="font-mono tabular-nums text-[11px] font-semibold text-slate-900">
                                  {item.latitude!.toFixed(6)}, {item.longitude!.toFixed(6)}
                                </div>
                                <div className="flex items-center gap-2 text-[11px]">
                                  <span className="text-emerald-700 font-medium">
                                    GPS Aktif{item.accuracy != null ? ` (±${item.accuracy}m)` : ''}
                                  </span>
                                  <span aria-hidden="true" className="text-slate-300">·</span>
                                  <a
                                    href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-semibold"
                                  >
                                    <span>Peta</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCoords(item.id, item.latitude!, item.longitude!)}
                                    title="Salin koordinat"
                                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                  >
                                    {copiedId === item.id ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <div
                                  className={`text-[11px] font-semibold ${
                                    item.locationStatus === 'denied'
                                      ? 'text-rose-700'
                                      : 'text-amber-700'
                                  }`}
                                >
                                  {LOCATION_STATUS_LABELS[item.locationStatus] || 'Koordinat tidak tersedia'}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {item.locationStatus === 'denied'
                                    ? 'Izin lokasi ditolak di browser'
                                    : 'Perangkat tidak mengirim koordinat'}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredLogs.length > visibleLimit && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleLimit(prev => prev + 50)}
                    className="px-4 py-1.5 text-xs font-semibold text-blue-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Tampilkan 50 Log Berikutnya ({filteredLogs.length - visibleLimit} tersisa)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
