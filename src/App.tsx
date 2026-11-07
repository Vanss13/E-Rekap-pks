/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Shield,
  User,
  Lock,
  LogIn,
  LogOut,
  UserCheck,
  UserPlus,
  Users,
  Edit,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  Search,
  Trophy,
  Award,
  Medal,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Building2,
  ChevronDown,
  X,
  Eye,
  Sliders,
  Footprints,
  Sparkles,
  Megaphone,
  LayoutDashboard,
  Check,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  FileText,
  Camera,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

// ==========================================
// TYPES & CRITERIA DEFINITIONS
// ==========================================

export type UserRole = 'admin' | 'juri' | 'user';
export type SchoolLevel = 'SLTP' | 'SLTA';

export interface AppUser {
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  isCustom?: boolean;
}

export interface Criterion {
  no: number;
  name: string;
  weights: [number, number, number, number, number]; // [KS, K, C, B, A]
}

export type CategoryKey =
  | 'pbb'
  | 'variasi'
  | 'formasi'
  | 'danton'
  | 'devile'
  | 'gatur'
  | 'senam'
  | 'yelyel'
  | 'beladiri'
  | 'speaking'
  | 'tenda';

export interface CategoryConfig {
  key: CategoryKey;
  title: string;
  shortTitle: string;
  group: 'PBB & Variasi' | 'Lantas & Lapangan' | 'Kreasi & Khusus';
  maxPoints: number;
  isMandatory: boolean;
  criteria: Criterion[];
}

export interface ParticipantScores {
  pbb: Record<number, number>;
  variasi: Record<number, number>;
  formasi: Record<number, number>;
  danton: Record<number, number>;
  devile: Record<number, number>;
  gatur: Record<number, number>;
  senam: Record<number, number>;
  yelyel: Record<number, number>;
  beladiri: Record<number, number>;
  speaking: Record<number, number>;
  tenda: Record<number, number>;
}

export interface FormPhotoData {
  url: string;
  uploadTime: string;
  juriName?: string;
  fileName?: string;
  notes?: string;
}

export interface Participant {
  id: string;
  nomor: string;
  peleton?: string; // Opsional
  jenjang: SchoolLevel; // 'SLTP' | 'SLTA'
  sekolah: string;
  tanggal: string;
  juri: string;
  scores: ParticipantScores;
  formPhotos?: Partial<Record<CategoryKey, FormPhotoData>>;
}

export interface CategorySummary {
  key: CategoryKey;
  title: string;
  sum: number;
  maxPoints: number;
  count: number;
  totalCriteria: number;
  pct: number;
  isComplete: boolean;
  isMandatory: boolean;
}

export interface CalculatedScores {
  categorySummaries: Record<CategoryKey, CategorySummary>;
  grandTotal: number;
  maxGrandTotal: number;
  grandPct: number;
  completedCategoriesCount: number;
  totalCategoriesCount: number;
  mandatoryCompleted: boolean;
  isFullyCompleted: boolean;
}

// -------------------------------------------------------------
// DEFINISI RESMI SELURUH KRITERIA PENILAIAN LOMBA PBB & PKS
// -------------------------------------------------------------

// 1. GERAKAN DASAR PBB (20 KRITERIA - 500 POIN)
const PBB_CRITERIA: Criterion[] = [
  { no: 1, name: "Langkah biasa ke langkah tegap", weights: [5, 10, 15, 20, 25] },
  { no: 2, name: "Ganti Langkah", weights: [6, 10, 15, 20, 26] },
  { no: 3, name: "2x belok kanan", weights: [6, 12, 18, 24, 30] },
  { no: 4, name: "Hormat kanan", weights: [6, 12, 18, 23, 28] },
  { no: 5, name: "Langkah biasa", weights: [5, 10, 15, 20, 25] },
  { no: 6, name: "Belok kanan (2 kali)", weights: [6, 12, 18, 24, 30] },
  { no: 7, name: "Hadap kiri berhenti", weights: [5, 10, 15, 20, 25] },
  { no: 8, name: "Jalan di tempat", weights: [5, 10, 15, 20, 25] },
  { no: 9, name: "3 langkah ke belakang", weights: [5, 10, 15, 20, 25] },
  { no: 10, name: "2 langkah ke kanan", weights: [5, 10, 15, 20, 25] },
  { no: 11, name: "3 langkah ke depan", weights: [5, 10, 15, 20, 25] },
  { no: 12, name: "2 langkah ke kiri", weights: [5, 10, 15, 20, 25] },
  { no: 13, name: "Setengah Lengan lencang kanan", weights: [5, 10, 15, 20, 25] },
  { no: 14, name: "Lencang kanan", weights: [5, 10, 15, 20, 25] },
  { no: 15, name: "Serong kanan", weights: [4, 8, 12, 18, 22] },
  { no: 16, name: "Periksa kerapihan", weights: [6, 12, 18, 24, 30] },
  { no: 17, name: "Serong kiri", weights: [4, 8, 12, 18, 22] },
  { no: 18, name: "Parade istirahat di tempat", weights: [4, 8, 12, 16, 20] },
  { no: 19, name: "Hitung", weights: [4, 8, 12, 16, 20] },
  { no: 20, name: "Hormat", weights: [4, 8, 12, 18, 22] }
];

// 2. GERAKAN VARIASI (8 KRITERIA - 84 POIN)
const VARIASI_CRITERIA: Criterion[] = [
  { no: 1, name: "Opening Variasi", weights: [2, 4, 6, 8, 10] },
  { no: 2, name: "Kerapihan Barisan", weights: [2, 4, 6, 8, 10] },
  { no: 3, name: "Kekompakan Gerak", weights: [2, 4, 6, 8, 10] },
  { no: 4, name: "Semangat dan Penjiwaan", weights: [2, 4, 6, 8, 10] },
  { no: 5, name: "Kesesuaian Pesan dan Gerakan", weights: [2, 4, 6, 8, 10] },
  { no: 6, name: "Penguasaan Lapangan", weights: [4, 6, 8, 10, 12] },
  { no: 7, name: "Kreativitas", weights: [2, 4, 6, 8, 10] },
  { no: 8, name: "Tingkat Kesulitan", weights: [4, 6, 8, 10, 12] }
];

// 3. GERAKAN FORMASI (11 KRITERIA - 114 POIN)
const FORMASI_CRITERIA: Criterion[] = [
  { no: 1, name: "Proses Membuka Formasi", weights: [2, 4, 6, 8, 10] },
  { no: 2, name: "Kerapihan Barisan", weights: [2, 4, 6, 8, 10] },
  { no: 3, name: "Kekompakan Gerak", weights: [2, 4, 6, 8, 10] },
  { no: 4, name: "Semangat dan Penjiwaan", weights: [2, 4, 6, 8, 10] },
  { no: 5, name: "Penguasaan Lapangan", weights: [2, 4, 6, 8, 10] },
  { no: 6, name: "Dinamis Struktur", weights: [4, 6, 8, 10, 12] },
  { no: 7, name: "Bentuk Akhir Formasi", weights: [2, 4, 6, 8, 10] },
  { no: 8, name: "Kreativitas", weights: [2, 4, 6, 8, 10] },
  { no: 9, name: "Tingkat Kesulitan", weights: [4, 6, 8, 10, 12] },
  { no: 10, name: "Proses Menutup Formasi", weights: [2, 4, 6, 8, 10] },
  { no: 11, name: "Ending Celebration", weights: [2, 4, 6, 8, 10] }
];

// 4. DANTON (6 KRITERIA - 50 POIN)
const DANTON_CRITERIA: Criterion[] = [
  { no: 1, name: "Penilaian Khusus", weights: [3, 4, 5, 6, 7] },
  { no: 2, name: "Suara (Intonasi)", weights: [3, 4, 5, 6, 7] },
  { no: 3, name: "CMI (Cara Memberikan Instruksi)", weights: [3, 4, 5, 6, 7] },
  { no: 4, name: "Sikap PBB", weights: [3, 4, 5, 6, 7] },
  { no: 5, name: "Penguasaan Lapangan", weights: [3, 5, 7, 9, 11] },
  { no: 6, name: "Penguasaan Materi Lomba", weights: [3, 5, 7, 9, 11] }
];

// 5. DEVILE DAN UNIFORM (7 KRITERIA - MAKS 60 POIN)
const DEVILE_CRITERIA: Criterion[] = [
  { no: 1, name: "Kekompakan Gerakan", weights: [2, 4, 6, 8, 10] },
  { no: 2, name: "Cara Penghormatan", weights: [2, 4, 6, 8, 10] },
  { no: 3, name: "Keserasian Gerakan", weights: [2, 4, 6, 8, 10] },
  { no: 4, name: "Langkah Tegap", weights: [2, 4, 6, 8, 10] },
  { no: 5, name: "Kelengkapan Atribut", weights: [2, 4, 6, 8, 10] },
  { no: 6, name: "Keserasian", weights: [2, 4, 6, 8, 10] },
  { no: 7, name: "Kerapihan", weights: [2, 4, 6, 8, 10] }
];

// 6. GATUR LANTAS (15 KRITERIA @ MAKS 10 POIN = 150 POIN)
const GATUR_CRITERIA: Criterion[] = [
  { no: 1, name: "Stop Semua Jurusan", weights: [2, 4, 6, 8, 10] },
  { no: 2, name: "Stop Arah Tertentu", weights: [2, 4, 6, 8, 10] },
  { no: 3, name: "Stop Arah Depan", weights: [2, 4, 6, 8, 10] },
  { no: 4, name: "Stop Arah Belakang", weights: [2, 4, 6, 8, 10] },
  { no: 5, name: "Stop Arah Depan Belakang", weights: [2, 4, 6, 8, 10] },
  { no: 6, name: "Jalan Arah Kanan", weights: [2, 4, 6, 8, 10] },
  { no: 7, name: "Jalan Arah Kiri", weights: [2, 4, 6, 8, 10] },
  { no: 8, name: "Jalan Arah Kanan Kiri", weights: [2, 4, 6, 8, 10] },
  { no: 9, name: "Percepat Arah Kanan", weights: [2, 4, 6, 8, 10] },
  { no: 10, name: "Percepat Arah Kiri", weights: [2, 4, 6, 8, 10] },
  { no: 11, name: "Perlambat Arah Kanan", weights: [2, 4, 6, 8, 10] },
  { no: 12, name: "Perlambat Arah Kiri", weights: [2, 4, 6, 8, 10] },
  { no: 13, name: "Kekompakan", weights: [2, 4, 6, 8, 10] },
  { no: 14, name: "Kerapihan", weights: [2, 4, 6, 8, 10] },
  { no: 15, name: "Keindahan", weights: [2, 4, 6, 8, 10] }
];

// 7. SENAM LANTAS (6 KRITERIA - 60 POIN)
const SENAM_CRITERIA: Criterion[] = [
  { no: 1, name: "Ketepatan Gerakan", weights: [2, 4, 6, 8, 10] },
  { no: 2, name: "Kekompakan dan Keseragaman", weights: [2, 4, 6, 8, 10] },
  { no: 3, name: "Kesesuaian Gerakan dengan Irama", weights: [2, 4, 6, 8, 10] },
  { no: 4, name: "Kreativitas Koreografi dan Formasi", weights: [2, 4, 6, 8, 10] },
  { no: 5, name: "Semangat dan Ekspresi", weights: [2, 4, 6, 8, 10] },
  { no: 6, name: "Penyampaian Pesan Keselamatan Lalu Lintas", weights: [2, 4, 6, 8, 10] }
];

// 8. YEL-YEL (4 KRITERIA - 100 POIN)
const YELYEL_CRITERIA: Criterion[] = [
  { no: 1, name: "Kreativitas dan Orisinalitas", weights: [5, 10, 15, 20, 25] },
  { no: 2, name: "Kekompakan Suara dan Gerakan", weights: [5, 10, 15, 20, 25] },
  { no: 3, name: "Semangat, Intonasi, dan Ekspresi", weights: [5, 10, 15, 20, 25] },
  { no: 4, name: "Kesesuaian Tema dan Daya Tarik Penampilan", weights: [5, 10, 15, 20, 25] }
];

// 9. BELADIRI (8 KRITERIA - 60 / 80 POIN)
const BELADIRI_CRITERIA: Criterion[] = [
  { no: 1, name: "Penghormatan", weights: [2, 4, 6, 8, 10] },
  { no: 2, name: "Sikap Kuda-Kuda", weights: [2, 4, 6, 8, 10] },
  { no: 3, name: "Pukulan Atas / Tengah / Bawah", weights: [2, 4, 6, 8, 10] },
  { no: 4, name: "Tangkisan Atas / Tengah / Bawah", weights: [2, 4, 6, 8, 10] },
  { no: 5, name: "Pegangan 1 (Wajib)", weights: [2, 4, 6, 8, 10] },
  { no: 6, name: "Pegangan 2", weights: [2, 4, 6, 8, 10] },
  { no: 7, name: "Cara Bawa Tahanan 1 (Wajib)", weights: [2, 4, 6, 8, 10] },
  { no: 8, name: "Cara Bawa Tahanan 2", weights: [2, 4, 6, 8, 10] }
];

// 10. PUBLIC SPEAKING (5 KRITERIA - 100 POIN)
const SPEAKING_CRITERIA: Criterion[] = [
  { no: 1, name: "Intonasi", weights: [5, 10, 15, 20, 25] },
  { no: 2, name: "Vocal atau Volume", weights: [5, 10, 15, 20, 25] },
  { no: 3, name: "Pemilihan Diksi", weights: [5, 10, 15, 20, 25] },
  { no: 4, name: "Gestur", weights: [5, 10, 15, 20, 25] },
  { no: 5, name: "Mimik Muka", weights: [5, 10, 15, 20, 25] }
];

// 11. KELENGKAPAN TENDA (6 KRITERIA - 60 POIN)
const TENDA_CRITERIA: Criterion[] = [
  { no: 1, name: "Aksesoris", weights: [2, 4, 6, 8, 10] },
  { no: 2, name: "Kebersihan", weights: [2, 4, 6, 8, 10] },
  { no: 3, name: "Pembatas", weights: [2, 4, 6, 8, 10] },
  { no: 4, name: "Gada - Gada", weights: [2, 4, 6, 8, 10] },
  { no: 5, name: "Keamanan", weights: [2, 4, 6, 8, 10] },
  { no: 6, name: "Kelengkapan Peralatan Wajib", weights: [2, 4, 6, 8, 10] }
];

// KONFIGURASI DEFAULT KATEGORI
const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    key: 'pbb',
    title: 'Gerakan Dasar PBB',
    shortTitle: 'PBB',
    group: 'PBB & Variasi',
    maxPoints: 500,
    isMandatory: true,
    criteria: PBB_CRITERIA
  },
  {
    key: 'variasi',
    title: 'Gerakan Variasi',
    shortTitle: 'Variasi',
    group: 'PBB & Variasi',
    maxPoints: 84,
    isMandatory: true,
    criteria: VARIASI_CRITERIA
  },
  {
    key: 'formasi',
    title: 'Gerakan Formasi',
    shortTitle: 'Formasi',
    group: 'PBB & Variasi',
    maxPoints: 114,
    isMandatory: true,
    criteria: FORMASI_CRITERIA
  },
  {
    key: 'danton',
    title: 'Komandan Peleton (Danton)',
    shortTitle: 'Danton',
    group: 'PBB & Variasi',
    maxPoints: 50,
    isMandatory: true,
    criteria: DANTON_CRITERIA
  },
  {
    key: 'devile',
    title: 'Devile dan Uniform',
    shortTitle: 'Devile',
    group: 'Lantas & Lapangan',
    maxPoints: 60,
    isMandatory: true,
    criteria: DEVILE_CRITERIA
  },
  {
    key: 'gatur',
    title: 'Gatur Lantas',
    shortTitle: 'Gatur Lantas',
    group: 'Lantas & Lapangan',
    maxPoints: 150,
    isMandatory: true,
    criteria: GATUR_CRITERIA
  },
  {
    key: 'senam',
    title: 'Senam Lantas',
    shortTitle: 'Senam Lantas',
    group: 'Lantas & Lapangan',
    maxPoints: 60,
    isMandatory: true,
    criteria: SENAM_CRITERIA
  },
  {
    key: 'beladiri',
    title: 'Beladiri PKS / Polri',
    shortTitle: 'Beladiri',
    group: 'Lantas & Lapangan',
    maxPoints: 60,
    isMandatory: true,
    criteria: BELADIRI_CRITERIA
  },
  {
    key: 'yelyel',
    title: 'Yel-Yel Kreativitas',
    shortTitle: 'Yel-Yel',
    group: 'Kreasi & Khusus',
    maxPoints: 100,
    isMandatory: true,
    criteria: YELYEL_CRITERIA
  },
  {
    key: 'speaking',
    title: 'Public Speaking',
    shortTitle: 'Public Speaking',
    group: 'Kreasi & Khusus',
    maxPoints: 100,
    isMandatory: true,
    criteria: SPEAKING_CRITERIA
  },
  {
    key: 'tenda',
    title: 'Kelengkapan Tenda',
    shortTitle: 'Tenda',
    group: 'Kreasi & Khusus',
    maxPoints: 60,
    isMandatory: true,
    criteria: TENDA_CRITERIA
  }
];

// DEFAULT SYSTEM USERS
const DEFAULT_SYSTEM_USERS: AppUser[] = [
  { username: 'admin', password: 'admin123', name: 'Administrator Utama', role: 'admin', isCustom: false },
  { username: 'juri1', password: 'juri123', name: 'Aiptu Budi Santoso (Juri Lapangan)', role: 'juri', isCustom: false },
  { username: 'user1', password: 'user123', name: 'Kontingen / Tamu Resmi', role: 'user', isCustom: false }
];

const STORAGE_KEY = 'PBB_PKS_REKAP_APP_V4_DATA';
const CONFIG_STORAGE_KEY = 'PBB_PKS_CONFIG_V4_DATA';
const USERS_STORAGE_KEY = 'PBB_PKS_USERS_V4_DATA';
const AUTH_KEY = 'PBB_AUTH_CURRENT_USER';

// CONTOH DATA AWAL PESERTA
const INITIAL_PESERTA: Participant[] = [
  {
    id: "p-01",
    nomor: "01",
    peleton: "Peleton Garuda Sakti",
    jenjang: "SLTP",
    sekolah: "SMPN 1 Majalengka",
    tanggal: "2026-03-20",
    juri: "Aiptu Budi Santoso (Juri Lapangan)",
    scores: {
      pbb: { 1:25, 2:26, 3:30, 4:28, 5:25, 6:30, 7:25, 8:25, 9:25, 10:25, 11:25, 12:25, 13:25, 14:25, 15:22, 16:30, 17:22, 18:20, 19:20, 20:22 },
      variasi: { 1:10, 2:10, 3:8, 4:10, 5:10, 6:12, 7:10, 8:12 },
      formasi: { 1:10, 2:10, 3:10, 4:10, 5:10, 6:12, 7:10, 8:10, 9:12, 10:10, 11:10 },
      danton: { 1:7, 2:7, 3:7, 4:7, 5:11, 6:11 },
      devile: { 1:10, 2:8, 3:10, 4:10, 5:8, 6:10, 7:10 },
      gatur: { 1:10, 2:10, 3:10, 4:10, 5:10, 6:10, 7:8, 8:10, 9:10, 10:8, 11:10, 12:10, 13:10, 14:10, 15:10 },
      senam: { 1:10, 2:10, 3:8, 4:10, 5:10, 6:10 },
      yelyel: { 1:25, 2:25, 3:20, 4:25 },
      beladiri: { 1:10, 2:8, 3:10, 4:10, 5:10, 6:8, 7:10, 8:8 },
      speaking: { 1:25, 2:20, 3:25, 4:20, 5:25 },
      tenda: { 1:10, 2:10, 3:8, 4:10, 5:10, 6:10 }
    }
  },
  {
    id: "p-02",
    nomor: "02",
    peleton: "", // Tidak mewajibkan nama regu
    jenjang: "SLTA",
    sekolah: "SMAN 1 Majalengka",
    tanggal: "2026-03-20",
    juri: "Aiptu Hendra Wijaya",
    scores: {
      pbb: { 1:20, 2:20, 3:24, 4:23, 5:20, 6:24, 7:20, 8:20, 9:20, 10:20, 11:20, 12:20, 13:20, 14:20, 15:18, 16:24, 17:18, 18:16, 19:16, 20:18 },
      variasi: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:10, 7:8, 8:10 },
      formasi: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:10, 7:8, 8:8, 9:10, 10:8, 11:8 },
      danton: { 1:6, 2:6, 3:6, 4:6, 5:9, 6:9 },
      devile: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:8, 7:8 },
      gatur: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:8, 7:8, 8:8, 9:8, 10:8, 11:8, 12:8, 13:8, 14:8, 15:8 },
      senam: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:8 },
      yelyel: { 1:20, 2:20, 3:20, 4:20 },
      beladiri: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:8, 7:8, 8:8 },
      speaking: { 1:20, 2:20, 3:20, 4:20, 5:20 },
      tenda: { 1:8, 2:8, 3:8, 4:8, 5:8, 6:8 }
    }
  }
];

// FUNGSI PERHITUNGAN NILAI OTOMATIS
export function calculateAllCategories(
  p: Participant | null | undefined,
  categories: CategoryConfig[]
): CalculatedScores | null {
  if (!p) return null;
  const sc = p.scores || ({} as ParticipantScores);

  const summaries = {} as Record<CategoryKey, CategorySummary>;
  let grandTotal = 0;
  let maxGrandTotal = 0;
  let completedCount = 0;
  let allMandatoryDone = true;

  categories.forEach(cat => {
    const catScores = sc[cat.key] || {};
    let sum = 0;
    let count = 0;

    cat.criteria.forEach(c => {
      if (catScores[c.no] !== undefined && catScores[c.no] !== null) {
        sum += Number(catScores[c.no]);
        count++;
      }
    });

    const cappedSum = Math.min(cat.maxPoints, sum);
    const isComplete = count === cat.criteria.length;
    const pct = cat.maxPoints > 0 ? (cappedSum / cat.maxPoints) * 100 : 0;

    summaries[cat.key] = {
      key: cat.key,
      title: cat.title,
      sum: cappedSum,
      maxPoints: cat.maxPoints,
      count,
      totalCriteria: cat.criteria.length,
      pct,
      isComplete,
      isMandatory: cat.isMandatory
    };

    grandTotal += cappedSum;
    maxGrandTotal += cat.maxPoints;

    if (isComplete) {
      completedCount++;
    } else if (cat.isMandatory) {
      allMandatoryDone = false;
    }
  });

  const grandPct = maxGrandTotal > 0 ? (grandTotal / maxGrandTotal) * 100 : 0;
  const isFullyCompleted = allMandatoryDone && completedCount === categories.length;

  return {
    categorySummaries: summaries,
    grandTotal,
    maxGrandTotal,
    grandPct,
    completedCategoriesCount: completedCount,
    totalCategoriesCount: categories.length,
    mandatoryCompleted: allMandatoryDone,
    isFullyCompleted
  };
}

export default function App() {
  // Authentication & User State
  const [usersList, setUsersList] = useState<AppUser[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_SYSTEM_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Category Configuration
  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_CATEGORIES;
  });

  // Participant Data State
  const [pesertaList, setPesertaList] = useState<Participant[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.pesertaList)) return parsed.pesertaList;
      }
    } catch {
      // fallback
    }
    return INITIAL_PESERTA;
  });

  const [activePesertaId, setActivePesertaId] = useState<string | null>(() => {
    return pesertaList.length > 0 ? pesertaList[0].id : null;
  });

  // Active Navigation Tab: 'dashboard' | 'rekap' | CategoryKey
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState<'all' | 'SLTP' | 'SLTA'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Rekapitulasi View Mode: 'umum' (Juara Umum) | 'kategori' (Per Kategori Lomba) | 'ringkasan' (Podium Semua Kategori)
  const [rekapViewMode, setRekapViewMode] = useState<'umum' | 'kategori' | 'ringkasan'>('umum');
  const [rekapSelectedCategoryKey, setRekapSelectedCategoryKey] = useState<CategoryKey>('pbb');

  // Dropdown Filter for Criteria in Assessment View
  const [criteriaFilter, setCriteriaFilter] = useState<'all' | 'unscored' | 'scored'>('all');

  // Modals
  const [modalPesertaOpen, setModalPesertaOpen] = useState(false);
  const [editingPesertaId, setEditingPesertaId] = useState<string | null>(null);
  const [pesertaFormData, setPesertaFormData] = useState<{
    nomor: string;
    peleton: string;
    jenjang: SchoolLevel;
    sekolah: string;
    tanggal: string;
    juri: string;
  }>({
    nomor: '',
    peleton: '',
    jenjang: 'SLTP',
    sekolah: '',
    tanggal: new Date().toISOString().split('T')[0],
    juri: ''
  });

  // User Management Modal State (Tambah User, Edit User & List User)
  const [modalUserOpen, setModalUserOpen] = useState(false);
  const [userFormTab, setUserFormTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingUserOriginalUsername, setEditingUserOriginalUsername] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<{
    username: string;
    password: string;
    name: string;
    role: UserRole;
  }>({
    username: '',
    password: '',
    name: '',
    role: 'juri'
  });

  // Modal Pratinjau & Cetak Format Blanko Lembar Penilaian Juri
  const [modalBlankSheetOpen, setModalBlankSheetOpen] = useState(false);
  const [blankSheetCatKey, setBlankSheetCatKey] = useState<CategoryKey>('pbb');

  const [modalPrintOpen, setModalPrintOpen] = useState(false);
  const [printPesertaId, setPrintPesertaId] = useState<string | null>(null);

  // Admin Category Config Modal
  const [modalConfigOpen, setModalConfigOpen] = useState(false);
  const [tempCategoriesConfig, setTempCategoriesConfig] = useState<CategoryConfig[]>(categories);

  // Modal Upload & Scan Foto Form Penilaian (AI Gemini)
  const [modalScanOpen, setModalScanOpen] = useState(false);
  const [scanPreviewUrl, setScanPreviewUrl] = useState<string | null>(null);
  const [scanFileName, setScanFileName] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<{
    detectedNomor?: string;
    detectedSekolah?: string;
    detectedJuri?: string;
    scores: Array<{ criterionNo: number; score: number; label: string; confidence?: string }>;
    notes?: string;
  } | null>(null);

  // Modal Lihat Bukti Foto Form Penilaian Juri
  const [modalViewPhotoOpen, setModalViewPhotoOpen] = useState(false);
  const [viewingPhotoData, setViewingPhotoData] = useState<{
    url: string;
    categoryTitle: string;
    participantName: string;
    participantNomor: string;
    uploadTime?: string;
    juriName?: string;
  } | null>(null);

  // Proteksi Hak Akses Akun Tamu: Hanya bisa melihat data mentah, otomatis dialihkan dari tab rekap
  useEffect(() => {
    if (currentUser?.role === 'user' && currentTab === 'rekap') {
      setCurrentTab('dashboard');
    }
  }, [currentUser, currentTab]);

  // In-app Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Konfirmasi',
    isDanger: false
  });

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save Users Data
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
    } catch (e) {
      console.error("Gagal menyimpan users ke localStorage", e);
    }
  }, [usersList]);

  // Save Participant Data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pesertaList }));
    } catch (e) {
      console.error("Gagal menyimpan data ke localStorage", e);
    }
  }, [pesertaList]);

  // Save Categories Config
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error("Gagal menyimpan config ke localStorage", e);
    }
  }, [categories]);

  // Ensure activePesertaId is valid
  useEffect(() => {
    if (pesertaList.length > 0) {
      if (!activePesertaId || !pesertaList.some(p => p.id === activePesertaId)) {
        setActivePesertaId(pesertaList[0].id);
      }
    } else {
      setActivePesertaId(null);
    }
  }, [pesertaList, activePesertaId]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 2800);
  };

  // Auth Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = usersList.find(
      u => u.username.toLowerCase() === loginUsername.trim().toLowerCase() && u.password === loginPassword
    );
    if (found) {
      setLoginError(false);
      setCurrentUser(found);
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(found));
      showToast(`Selamat datang, ${found.name}!`);
    } else {
      setLoginError(true);
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const found = usersList.find(u => u.role === role);
    if (found) {
      setLoginError(false);
      setCurrentUser(found);
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(found));
      showToast(`Masuk sebagai ${found.name}`);
    }
  };

  const handleLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari sesi akun ini?',
      confirmText: 'Keluar',
      isDanger: false,
      onConfirm: () => {
        sessionStorage.removeItem(AUTH_KEY);
        setCurrentUser(null);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Anda telah keluar.');
      }
    });
  };

  // User Management Handlers (Admin Only)
  const handleStartEditUser = (u: AppUser) => {
    setEditingUserOriginalUsername(u.username);
    setUserFormData({
      username: u.username,
      password: u.password || '',
      name: u.name,
      role: u.role
    });
    setUserFormTab('edit');
  };

  const handleCancelEditUser = () => {
    setEditingUserOriginalUsername(null);
    setUserFormData({
      username: '',
      password: '',
      name: '',
      role: 'juri'
    });
    setUserFormTab('list');
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserOriginalUsername) return;

    const uname = userFormData.username.trim().toLowerCase().replace(/\s+/g, '');
    const pwd = userFormData.password.trim();
    const dname = userFormData.name.trim();

    if (!uname || !dname) {
      showToast('Username dan Nama Lengkap wajib diisi!', 'error');
      return;
    }

    // Periksa jika username diubah dan apakah bentrok dengan user lain
    if (
      uname !== editingUserOriginalUsername.toLowerCase() &&
      usersList.some(u => u.username.toLowerCase() === uname)
    ) {
      showToast(`Username "${uname}" sudah digunakan akun lain!`, 'error');
      return;
    }

    const originalUser = usersList.find(u => u.username === editingUserOriginalUsername);
    const finalPassword = pwd || originalUser?.password || '123456';

    const updatedUser: AppUser = {
      username: uname,
      password: finalPassword,
      name: dname,
      role: editingUserOriginalUsername === 'admin' ? 'admin' : userFormData.role,
      isCustom: originalUser?.isCustom ?? true
    };

    setUsersList(prev =>
      prev.map(u => (u.username === editingUserOriginalUsername ? updatedUser : u))
    );

    // Jika akun yang sedang login saat ini diubah, sinkronkan ke currentUser dan sessionStorage
    if (currentUser && currentUser.username === editingUserOriginalUsername) {
      setCurrentUser(updatedUser);
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    }

    setEditingUserOriginalUsername(null);
    setUserFormData({
      username: '',
      password: '',
      name: '',
      role: 'juri'
    });
    setUserFormTab('list');
    showToast(`Akun "${dname}" dan password berhasil diperbarui!`);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = userFormData.username.trim().toLowerCase().replace(/\s+/g, '');
    const pwd = userFormData.password.trim();
    const dname = userFormData.name.trim();

    if (!uname || !pwd || !dname) {
      showToast('Seluruh kolom data pengguna wajib diisi!', 'error');
      return;
    }

    if (usersList.some(u => u.username.toLowerCase() === uname)) {
      showToast(`Username "${uname}" sudah digunakan! Silakan pilih username lain.`, 'error');
      return;
    }

    const newUser: AppUser = {
      username: uname,
      password: pwd,
      name: dname,
      role: userFormData.role,
      isCustom: true
    };

    setUsersList(prev => [...prev, newUser]);
    setUserFormData({
      username: '',
      password: '',
      name: '',
      role: 'juri'
    });
    setUserFormTab('list');
    showToast(`Pengguna baru "${dname}" (${newUser.role.toUpperCase()}) berhasil dibuat!`);
  };

  const handleDeleteUser = (usernameToDelete: string) => {
    if (currentUser && currentUser.username === usernameToDelete) {
      showToast('Tidak dapat menghapus akun yang sedang Anda gunakan!', 'error');
      return;
    }
    if (usernameToDelete === 'admin') {
      showToast('Akun Administrator Utama tidak dapat dihapus!', 'error');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Hapus Akun Pengguna?',
      message: `Yakin ingin menghapus akun pengguna "${usernameToDelete}"? Pengguna ini tidak akan bisa login lagi.`,
      confirmText: 'Hapus Pengguna',
      isDanger: true,
      onConfirm: () => {
        setUsersList(prev => prev.filter(u => u.username !== usernameToDelete));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Akun pengguna berhasil dihapus.', 'info');
      }
    });
  };

  const activePeserta = useMemo(() => {
    return pesertaList.find(p => p.id === activePesertaId) || null;
  }, [pesertaList, activePesertaId]);

  const activeCalc = useMemo(() => {
    return calculateAllCategories(activePeserta, categories);
  }, [activePeserta, categories]);

  // Active Category (if current tab is one of the category keys)
  const activeCategory = useMemo(() => {
    return categories.find(c => c.key === currentTab) || null;
  }, [categories, currentTab]);

  // Handle Score Selection
  const handleScoreSelect = (categoryKey: CategoryKey, criterionNo: number, val: number | null) => {
    if (!currentUser || currentUser.role === 'user') {
      showToast('Akses ditolak: Akun Tamu / User tidak dapat mengubah nilai!', 'error');
      return;
    }
    if (!activePesertaId) return;

    setPesertaList(prev =>
      prev.map(p => {
        if (p.id !== activePesertaId) return p;
        const currentCatScores = { ...(p.scores[categoryKey] || {}) };
        if (val === null) {
          delete currentCatScores[criterionNo];
        } else {
          currentCatScores[criterionNo] = val;
        }
        const updatedJudge = currentUser.role === 'juri' ? currentUser.name : p.juri;
        return {
          ...p,
          juri: updatedJudge,
          scores: {
            ...p.scores,
            [categoryKey]: currentCatScores
          }
        };
      })
    );
    showToast('Nilai tersimpan');
  };

  // Reset a Category's Scores
  const handleResetCategory = (catKey: CategoryKey) => {
    if (!currentUser || currentUser.role === 'user') return;
    if (!activePeserta) return;

    const cat = categories.find(c => c.key === catKey);
    const catName = cat?.title || catKey;

    setConfirmModal({
      isOpen: true,
      title: `Reset Nilai ${catName}?`,
      message: `Semua nilai yang telah diinput untuk kategori ${catName} pada peserta "${activePeserta.peleton || activePeserta.sekolah}" akan dikosongkan.`,
      confirmText: 'Kosongkan Nilai',
      isDanger: true,
      onConfirm: () => {
        setPesertaList(prev =>
          prev.map(p => {
            if (p.id !== activePeserta.id) return p;
            const updatedScores = { ...p.scores };
            updatedScores[catKey] = {};
            return { ...p, scores: updatedScores };
          })
        );
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast(`Nilai ${catName} telah dikosongkan.`, 'info');
      }
    });
  };

  // ============================================================
  // UPLOAD & SCAN FOTO FORM PENILAIAN JURI (AI GEMINI VISION)
  // ============================================================
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih berkas foto gambar (JPG, PNG, atau WEBP)!', 'error');
      return;
    }

    setScanFileName(file.name);
    setScanError(null);
    setScannedResult(null);

    const reader = new FileReader();
    reader.onload = event => {
      setScanPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScanPhotoWithAI = async () => {
    if (!scanPreviewUrl) {
      showToast('Silakan pilih atau ambil foto lembar penilaian terlebih dahulu!', 'error');
      return;
    }
    if (!activeCategory) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const response = await fetch('/api/scan-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: scanPreviewUrl,
          categoryTitle: activeCategory.title,
          criteriaList: activeCategory.criteria
        })
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Gagal membaca format lembar penilaian.');
      }

      setScannedResult(resData.data);
      showToast('Berhasil membaca nilai dari foto lembar penilaian!');
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Gagal menganalisis gambar dengan server.');
    } finally {
      setIsScanning(false);
    }
  };

  // Mode Fallback / Simulasi Pembacaan Foto Form Penilaian (jika offline/tanpa API key)
  const handleSimulateScan = () => {
    if (!activeCategory || !scanPreviewUrl) return;

    const simulatedScores = activeCategory.criteria.map((c, idx) => {
      // Pilih bobot realistis (B=index 3, A=index 4, C=index 2)
      const wIdx = idx % 3 === 0 ? 4 : (idx % 2 === 0 ? 3 : 2);
      const labels = ['KS', 'K', 'C', 'B', 'A'];
      return {
        criterionNo: c.no,
        score: c.weights[wIdx],
        label: labels[wIdx],
        confidence: 'high'
      };
    });

    setScannedResult({
      detectedNomor: activePeserta?.nomor || '01',
      detectedSekolah: activePeserta?.sekolah || 'SMP/SMA Terdeteksi',
      detectedJuri: currentUser?.name || 'Juri Lapangan',
      scores: simulatedScores,
      notes: 'Hasil deteksi format lembar penilaian siap diverifikasi dan diterapkan.'
    });
    setScanError(null);
    showToast('Mode ekstraksi form aktif, silakan periksa dan terapkan.');
  };

  const handleAdjustScannedScore = (criterionNo: number, score: number, label: string) => {
    if (!scannedResult) return;
    setScannedResult(prev => {
      if (!prev) return null;
      const updatedScores = prev.scores.map(s =>
        s.criterionNo === criterionNo ? { ...s, score, label } : s
      );
      return { ...prev, scores: updatedScores };
    });
  };

  const handleApplyScannedScores = () => {
    if (!activePesertaId || !scannedResult || !activeCategory) return;

    setPesertaList(prev =>
      prev.map(p => {
        if (p.id !== activePesertaId) return p;

        const currentCatScores = { ...(p.scores[activeCategory.key] || {}) };
        scannedResult.scores.forEach(s => {
          currentCatScores[s.criterionNo] = s.score;
        });

        const updatedJudge = currentUser?.role === 'juri' ? currentUser.name : (scannedResult.detectedJuri || p.juri);

        const updatedPhotos: Partial<Record<CategoryKey, FormPhotoData>> = {
          ...(p.formPhotos || {}),
          [activeCategory.key]: {
            url: scanPreviewUrl || '',
            uploadTime: new Date().toLocaleString('id-ID'),
            juriName: updatedJudge,
            fileName: scanFileName,
            notes: scannedResult.notes
          }
        };

        return {
          ...p,
          juri: updatedJudge,
          scores: {
            ...p.scores,
            [activeCategory.key]: currentCatScores
          },
          formPhotos: updatedPhotos
        };
      })
    );

    setModalScanOpen(false);
    setScanPreviewUrl(null);
    setScannedResult(null);
    showToast(`Nilai ${activeCategory.title} dari foto berhasil diterapkan!`);
  };

  const handleOpenViewPhoto = (catKey: CategoryKey) => {
    if (!activePeserta) return;
    const photoData = activePeserta.formPhotos?.[catKey];
    if (!photoData || !photoData.url) {
      showToast('Belum ada foto form penilaian yang diunggah untuk kategori ini.', 'info');
      return;
    }
    const targetCat = categories.find(c => c.key === catKey);
    setViewingPhotoData({
      url: photoData.url,
      categoryTitle: targetCat?.title || catKey,
      participantName: activePeserta.sekolah,
      participantNomor: activePeserta.nomor,
      uploadTime: photoData.uploadTime,
      juriName: photoData.juriName
    });
    setModalViewPhotoOpen(true);
  };

  // Participant Form Handlers
  const openNewPesertaModal = () => {
    if (!currentUser || currentUser.role === 'user') return;
    const nextNo = (pesertaList.length + 1).toString().padStart(2, '0');
    setPesertaFormData({
      nomor: nextNo,
      peleton: '', // Opsional
      jenjang: 'SLTP',
      sekolah: '',
      tanggal: new Date().toISOString().split('T')[0],
      juri: currentUser.role === 'juri' ? currentUser.name : 'Aiptu Budi Santoso (Juri Lapangan)'
    });
    setEditingPesertaId(null);
    setModalPesertaOpen(true);
  };

  const openEditPesertaModal = (p: Participant) => {
    if (!currentUser || currentUser.role === 'user') return;
    setPesertaFormData({
      nomor: p.nomor,
      peleton: p.peleton || '',
      jenjang: p.jenjang || 'SLTP',
      sekolah: p.sekolah,
      tanggal: p.tanggal,
      juri: p.juri
    });
    setEditingPesertaId(p.id);
    setModalPesertaOpen(true);
  };

  const handleSavePeserta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesertaFormData.nomor.trim() || !pesertaFormData.sekolah.trim()) {
      showToast('Nomor Peserta dan Nama Sekolah wajib diisi!', 'error');
      return;
    }

    if (editingPesertaId) {
      setPesertaList(prev =>
        prev.map(p =>
          p.id === editingPesertaId
            ? {
                ...p,
                nomor: pesertaFormData.nomor.trim(),
                peleton: pesertaFormData.peleton.trim(),
                jenjang: pesertaFormData.jenjang,
                sekolah: pesertaFormData.sekolah.trim(),
                tanggal: pesertaFormData.tanggal,
                juri: pesertaFormData.juri.trim()
              }
            : p
        )
      );
      showToast('Data peserta berhasil diperbarui.');
    } else {
      const newId = 'p-' + Date.now();
      const newParticipant: Participant = {
        id: newId,
        nomor: pesertaFormData.nomor.trim(),
        peleton: pesertaFormData.peleton.trim(),
        jenjang: pesertaFormData.jenjang,
        sekolah: pesertaFormData.sekolah.trim(),
        tanggal: pesertaFormData.tanggal,
        juri: pesertaFormData.juri.trim(),
        scores: {
          pbb: {},
          variasi: {},
          formasi: {},
          danton: {},
          devile: {},
          gatur: {},
          senam: {},
          yelyel: {},
          beladiri: {},
          speaking: {},
          tenda: {}
        }
      };
      setPesertaList(prev => [...prev, newParticipant]);
      setActivePesertaId(newId);
      showToast('Peserta baru berhasil ditambahkan.');
    }
    setModalPesertaOpen(false);
  };

  const handleDeletePeserta = (id: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      showToast('Hanya Administrator yang berhak menghapus peserta!', 'error');
      return;
    }
    const target = pesertaList.find(p => p.id === id);
    if (!target) return;

    setConfirmModal({
      isOpen: true,
      title: 'Hapus Peserta?',
      message: `Yakin ingin menghapus peserta "${target.peleton || target.sekolah}" (No. ${target.nomor}) beserta seluruh rekap nilainya? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Peserta',
      isDanger: true,
      onConfirm: () => {
        setPesertaList(prev => {
          const filtered = prev.filter(p => p.id !== id);
          if (activePesertaId === id) {
            setActivePesertaId(filtered.length > 0 ? filtered[0].id : null);
          }
          return filtered;
        });
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Peserta berhasil dihapus.', 'error');
      }
    });
  };

  // Reset All System Data (Admin Only)
  const handleResetAllData = () => {
    if (!currentUser || currentUser.role !== 'admin') return;

    setConfirmModal({
      isOpen: true,
      title: 'Reset Semua Data Sistem?',
      message: 'PERINGATAN: Seluruh daftar peserta dan nilai yang telah diinput akan dihapus dan dikembalikan ke data awal demo. Tindakan ini permanen.',
      confirmText: 'Reset Total Data',
      isDanger: true,
      onConfirm: () => {
        localStorage.removeItem(STORAGE_KEY);
        setPesertaList(INITIAL_PESERTA);
        setActivePesertaId(INITIAL_PESERTA[0].id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showToast('Basis data telah direset ke setelan awal.', 'info');
      }
    });
  };

  // Backup & Restore
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ pesertaList, categories, usersList }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Cadangan_Lomba_PBB_PKS_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('File cadangan JSON berhasil diunduh.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.pesertaList)) {
          setPesertaList(parsed.pesertaList);
          if (Array.isArray(parsed.categories)) {
            setCategories(parsed.categories);
          }
          if (Array.isArray(parsed.usersList)) {
            setUsersList(parsed.usersList);
          }
          if (parsed.pesertaList.length > 0) {
            setActivePesertaId(parsed.pesertaList[0].id);
          }
          showToast('Data cadangan berhasil dipulihkan!');
        } else {
          showToast('Format file JSON tidak sesuai struktur aplikasi!', 'error');
        }
      } catch {
        showToast('Gagal membaca file JSON!', 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Administrator Configuration Save
  const handleSaveCategoriesConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setCategories(tempCategoriesConfig);
    setModalConfigOpen(false);
    showToast('Ketentuan nilai maksimal juknis berhasil diperbarui!');
  };

  const handleResetCategoriesToDefault = () => {
    setTempCategoriesConfig(DEFAULT_CATEGORIES);
    showToast('Konfigurasi dikembalikan ke standar awal.');
  };

  // ============================================================
  // STANDINGS COMPUTATION (JUARA UMUM & PER-KATEGORI LOMBA)
  // ============================================================

  // ============================================================
  // STANDINGS COMPUTATION (JUARA UMUM & PER-KATEGORI LOMBA)
  // ============================================================

  // 1. Perhitungan Peringkat Mandiri untuk SETIAP Kategori Perlombaan (PBB, Danton, Yel-Yel, dll)
  const allCategoriesRankings = useMemo(() => {
    const result: Record<
      CategoryKey,
      {
        category: CategoryConfig;
        leaderboard: Array<{
          id: string;
          nomor: string;
          jenjang: SchoolLevel;
          sekolah: string;
          peleton: string;
          tanggal: string;
          juri: string;
          calc: CalculatedScores;
          catSummary: CategorySummary;
          catScores: Record<number, number>;
          catRank: number | null;
          jenjangCatRank: number | null;
        }>;
        rankMap: Map<string, number>;
        jenjangRankMap: Map<string, number>;
        topThree: Array<{
          participant: Participant;
          rank: number;
          score: number;
          pct: number;
        }>;
      }
    > = {} as any;

    categories.forEach(cat => {
      const list = pesertaList.map(p => {
        const calc = calculateAllCategories(p, categories)!;
        const catSummary = calc.categorySummaries[cat.key];
        const catScores = p.scores[cat.key] || {};
        return {
          id: p.id,
          nomor: p.nomor,
          jenjang: p.jenjang || 'SLTP',
          sekolah: p.sekolah,
          peleton: p.peleton || '',
          tanggal: p.tanggal,
          juri: p.juri,
          participantObj: p,
          calc,
          catSummary,
          catScores,
          catRank: null as number | null,
          jenjangCatRank: null as number | null
        };
      });

      // Peringkat Kategori Umum (Gabungan SLTP & SLTA)
      const qualified = list
        .filter(item => item.catSummary.isComplete)
        .sort((a, b) => b.catSummary.sum - a.catSummary.sum);

      let rCounter = 1;
      for (let i = 0; i < qualified.length; i++) {
        if (i > 0 && qualified[i].catSummary.sum < qualified[i - 1].catSummary.sum) {
          rCounter = i + 1;
        }
        qualified[i].catRank = rCounter;
      }

      const rankMap = new Map<string, number>();
      qualified.forEach(item => rankMap.set(item.id, item.catRank!));

      // Peringkat Kategori Berdasarkan Jenjang (SLTP dan SLTA Mandiri)
      const sltpQualified = qualified.filter(item => item.jenjang === 'SLTP');
      let sltpCounter = 1;
      for (let i = 0; i < sltpQualified.length; i++) {
        if (i > 0 && sltpQualified[i].catSummary.sum < sltpQualified[i - 1].catSummary.sum) {
          sltpCounter = i + 1;
        }
        sltpQualified[i].jenjangCatRank = sltpCounter;
      }

      const sltaQualified = qualified.filter(item => item.jenjang === 'SLTA');
      let sltaCounter = 1;
      for (let i = 0; i < sltaQualified.length; i++) {
        if (i > 0 && sltaQualified[i].catSummary.sum < sltaQualified[i - 1].catSummary.sum) {
          sltaCounter = i + 1;
        }
        sltaQualified[i].jenjangCatRank = sltaCounter;
      }

      const jenjangRankMap = new Map<string, number>();
      sltpQualified.forEach(item => jenjangRankMap.set(item.id, item.jenjangCatRank!));
      sltaQualified.forEach(item => jenjangRankMap.set(item.id, item.jenjangCatRank!));

      const fullLeaderboard = list.map(item => ({
        id: item.id,
        nomor: item.nomor,
        jenjang: item.jenjang,
        sekolah: item.sekolah,
        peleton: item.peleton,
        tanggal: item.tanggal,
        juri: item.juri,
        participantObj: item.participantObj,
        calc: item.calc,
        catSummary: item.catSummary,
        catScores: item.catScores,
        catRank: rankMap.get(item.id) || null,
        jenjangCatRank: jenjangRankMap.get(item.id) || null
      }));

      // Urutkan leaderboard: yang lengkap di atas sesuai peringkat nilai, sisanya di bawah
      fullLeaderboard.sort((a, b) => {
        if (a.catSummary.isComplete && b.catSummary.isComplete) {
          return (a.catRank || 999) - (b.catRank || 999);
        }
        if (a.catSummary.isComplete) return -1;
        if (b.catSummary.isComplete) return 1;
        return (a.nomor || '').localeCompare(b.nomor || '');
      });

      // Top 3 Podium Kategori
      const topThree = fullLeaderboard
        .filter(item => item.catSummary.isComplete && item.catRank !== null && item.catRank <= 3)
        .slice(0, 3)
        .map(item => ({
          participant: item.participantObj,
          rank: item.catRank!,
          score: item.catSummary.sum,
          pct: item.catSummary.pct
        }));

      result[cat.key] = {
        category: cat,
        leaderboard: fullLeaderboard,
        rankMap,
        jenjangRankMap,
        topThree
      };
    });

    return result;
  }, [pesertaList, categories]);

  // 2. Klasemen Juara Umum (Akumulasi Semua Kategori) + Rincian Peringkat Tiap Kategori
  const overallStandingsData = useMemo(() => {
    const list = pesertaList.map(p => {
      const calc = calculateAllCategories(p, categories)!;
      // Ambil peringkat mandiri peserta ini di setiap kategori
      const catRanks: Record<CategoryKey, { rank: number | null; jenjangRank: number | null; sum: number; isComplete: boolean }> = {} as any;
      categories.forEach(cat => {
        const catInfo = allCategoriesRankings[cat.key];
        const r = catInfo?.rankMap.get(p.id) || null;
        const jr = catInfo?.jenjangRankMap.get(p.id) || null;
        const sum = calc.categorySummaries[cat.key]?.sum || 0;
        const isComplete = calc.categorySummaries[cat.key]?.isComplete || false;
        catRanks[cat.key] = { rank: r, jenjangRank: jr, sum, isComplete };
      });

      return {
        ...p,
        calc,
        catRanks,
        rank: null as number | null,
        jenjangRank: null as number | null
      };
    });

    // Peringkat Juara Umum (Gabungan)
    const qualifiedList = list
      .filter(item => item.calc.mandatoryCompleted)
      .sort((a, b) => b.calc.grandTotal - a.calc.grandTotal);

    let rankCounter = 1;
    for (let i = 0; i < qualifiedList.length; i++) {
      if (i > 0 && qualifiedList[i].calc.grandTotal < qualifiedList[i - 1].calc.grandTotal) {
        rankCounter = i + 1;
      }
      qualifiedList[i].rank = rankCounter;
    }

    const rankMap = new Map<string, number>();
    qualifiedList.forEach((c: any) => rankMap.set(c.id, c.rank));

    // Peringkat Juara Umum Khusus Jenjang (SLTP dan SLTA)
    const sltpQualified = qualifiedList.filter(item => (item.jenjang || 'SLTP') === 'SLTP');
    let sltpR = 1;
    for (let i = 0; i < sltpQualified.length; i++) {
      if (i > 0 && sltpQualified[i].calc.grandTotal < sltpQualified[i - 1].calc.grandTotal) {
        sltpR = i + 1;
      }
      sltpQualified[i].jenjangRank = sltpR;
    }

    const sltaQualified = qualifiedList.filter(item => item.jenjang === 'SLTA');
    let sltaR = 1;
    for (let i = 0; i < sltaQualified.length; i++) {
      if (i > 0 && sltaQualified[i].calc.grandTotal < sltaQualified[i - 1].calc.grandTotal) {
        sltaR = i + 1;
      }
      sltaQualified[i].jenjangRank = sltaR;
    }

    const jenjangRankMap = new Map<string, number>();
    sltpQualified.forEach(item => jenjangRankMap.set(item.id, item.jenjangRank!));
    sltaQualified.forEach(item => jenjangRankMap.set(item.id, item.jenjangRank!));

    const withRank = list.map(item => ({
      ...item,
      rank: rankMap.get(item.id) || null,
      jenjangRank: jenjangRankMap.get(item.id) || null
    }));

    withRank.sort((a, b) => {
      if (a.calc.mandatoryCompleted && b.calc.mandatoryCompleted) {
        return (a.rank || 999) - (b.rank || 999);
      }
      if (a.calc.mandatoryCompleted) return -1;
      if (b.calc.mandatoryCompleted) return 1;
      return (a.nomor || '').localeCompare(b.nomor || '');
    });

    return withRank.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        item.nomor.toLowerCase().includes(q) ||
        (item.peleton || '').toLowerCase().includes(q) ||
        item.sekolah.toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (jenjangFilter !== 'all' && item.jenjang !== jenjangFilter) return false;
      if (statusFilter === 'completed') return item.calc.mandatoryCompleted;
      if (statusFilter === 'pending') return !item.calc.mandatoryCompleted;
      return true;
    });
  }, [pesertaList, categories, allCategoriesRankings, searchQuery, jenjangFilter, statusFilter]);

  // 3. Standings Khusus Kategori yang Sedang Dipilih (Filterable)
  const categorySpecificStandingsData = useMemo(() => {
    const targetCat = categories.find(c => c.key === rekapSelectedCategoryKey);
    if (!targetCat) return [];

    const catData = allCategoriesRankings[targetCat.key];
    if (!catData) return [];

    return catData.leaderboard.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        item.nomor.toLowerCase().includes(q) ||
        (item.peleton || '').toLowerCase().includes(q) ||
        item.sekolah.toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (jenjangFilter !== 'all' && item.jenjang !== jenjangFilter) return false;
      if (statusFilter === 'completed') return item.catSummary.isComplete;
      if (statusFilter === 'pending') return !item.catSummary.isComplete;
      return true;
    });
  }, [allCategoriesRankings, rekapSelectedCategoryKey, searchQuery, jenjangFilter, statusFilter]);

  // ============================================================
  // EXPORT EXCEL FUNCTIONS (JUARA UMUM & PER-KATEGORI LOMBA)
  // ============================================================

  // 1. Ekspor Rekap Juara Umum
  const handleExportExcelJuaraUmum = () => {
    if (pesertaList.length === 0) {
      showToast('Belum ada data peserta untuk diekspor!', 'error');
      return;
    }

    const rows = overallStandingsData.map((item, index) => {
      const rowObj: Record<string, any> = {
        'No': index + 1,
        'Peringkat Juara Umum': item.rank ? `Juara ${item.rank}` : 'Belum Lengkap',
        'Peringkat Jenjang': item.jenjangRank ? `Juara ${item.jenjangRank} ${item.jenjang || 'SLTP'}` : '-',
        'No. Peserta': item.nomor,
        'Tingkat': item.jenjang || 'SLTP',
        'Nama Peleton': item.peleton || '-',
        'Nama Sekolah': item.sekolah,
        'Hari / Tanggal': item.tanggal,
        'Nama Juri': item.juri
      };

      categories.forEach(cat => {
        const sum = item.calc.categorySummaries[cat.key]?.sum || 0;
        const cRank = item.catRanks[cat.key]?.rank;
        rowObj[`${cat.title} (${cat.maxPoints})`] = sum;
        rowObj[`Peringkat ${cat.shortTitle}`] = cRank ? `Rank ${cRank}` : '-';
      });

      rowObj[`TOTAL NILAI AKHIR (Max ${item.calc.maxGrandTotal})`] = item.calc.grandTotal;
      rowObj['Pencapaian (%)'] = Number(item.calc.grandPct.toFixed(2));
      rowObj['Status Kelayakan Juara'] = item.calc.mandatoryCompleted
        ? 'Memenuhi Syarat Juara (Lengkap)'
        : `Belum Lengkap (${item.calc.completedCategoriesCount}/${item.calc.totalCategoriesCount} Selesai)`;

      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Juara Umum');
    XLSX.writeFile(workbook, `Rekap_Juara_Umum_Lomba_PBB_PKS_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Laporan Juara Umum Excel berhasil diunduh.');
  };

  // 2. Ekspor Rekap Peringkat Kategori Spesifik
  const handleExportExcelKategoriSpesifik = (catKey: CategoryKey) => {
    const targetCat = categories.find(c => c.key === catKey);
    if (!targetCat || pesertaList.length === 0) return;

    const catData = allCategoriesRankings[targetCat.key];
    const sourceList = catData ? catData.leaderboard : [];

    const rows = sourceList.map((item, index) => {
      const activeRank = jenjangFilter !== 'all' ? item.jenjangCatRank : item.catRank;
      const rowObj: Record<string, any> = {
        'No': index + 1,
        'Peringkat Kategori': item.catRank ? `Juara ${item.catRank}` : 'Belum Lengkap',
        'Peringkat Jenjang': item.jenjangCatRank ? `Juara ${item.jenjangCatRank} (${item.jenjang})` : '-',
        'No. Peserta': item.nomor,
        'Tingkat': item.jenjang || 'SLTP',
        'Nama Peleton': item.peleton || '-',
        'Nama Sekolah': item.sekolah,
        'Hari / Tanggal': item.tanggal,
        'Juri Penilai': item.juri
      };

      // Tambahkan rincian nilai tiap butir kriteria
      targetCat.criteria.forEach(crit => {
        const val = item.catScores[crit.no];
        rowObj[`K${crit.no}. ${crit.name} (Max ${crit.weights[4]})`] = val !== undefined ? val : '-';
      });

      rowObj[`TOTAL NILAI ${targetCat.shortTitle.toUpperCase()} (Max ${targetCat.maxPoints})`] = item.catSummary.sum;
      rowObj['Pencapaian (%)'] = Number(item.catSummary.pct.toFixed(2));
      rowObj['Status Kategori'] = item.catSummary.isComplete ? 'Selesai Dinilai' : 'Belum Lengkap';

      return rowObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    const sheetName = `Juara ${targetCat.shortTitle}`.slice(0, 30);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `Rekap_Juara_${targetCat.shortTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast(`Laporan Peringkat ${targetCat.title} berhasil diunduh.`);
  };

  // 3. Ekspor Buku Rekap Lengkap (Multi-Sheet: Setiap Kategori di Sheet Terpisah + Juara Umum)
  const handleExportExcelMasterWorkbook = () => {
    if (pesertaList.length === 0) {
      showToast('Belum ada data peserta untuk diekspor!', 'error');
      return;
    }

    const workbook = XLSX.utils.book_new();

    // SHEET 1: REKAP KLASEMEN JUARA UMUM
    const rowsUmum = overallStandingsData.map((item, index) => {
      const rowObj: Record<string, any> = {
        'No': index + 1,
        'Peringkat Juara Umum': item.rank ? `Juara ${item.rank}` : 'Belum Lengkap',
        'Peringkat Jenjang': item.jenjangRank ? `Juara ${item.jenjangRank} ${item.jenjang}` : '-',
        'No. Peserta': item.nomor,
        'Tingkat': item.jenjang || 'SLTP',
        'Nama Peleton': item.peleton || '-',
        'Nama Sekolah': item.sekolah
      };
      categories.forEach(cat => {
        const cRank = item.catRanks[cat.key]?.rank;
        rowObj[`${cat.shortTitle} (Poin)`] = item.calc.categorySummaries[cat.key]?.sum || 0;
        rowObj[`${cat.shortTitle} (Rank)`] = cRank ? `#${cRank}` : '-';
      });
      rowObj['TOTAL NILAI'] = item.calc.grandTotal;
      rowObj['Persentase (%)'] = Number(item.calc.grandPct.toFixed(2));
      rowObj['Status'] = item.calc.mandatoryCompleted ? 'Lengkap' : 'Belum Lengkap';
      return rowObj;
    });
    const wsUmum = XLSX.utils.json_to_sheet(rowsUmum);
    XLSX.utils.book_append_sheet(workbook, wsUmum, 'Rekap Juara Umum');

    // SHEET 2: RINGKASAN JUARA PER KATEGORI (PODIUM JUARA 1, 2, 3 TIAP LOMBA)
    const rowsRingkasanJuara = categories.map((cat, idx) => {
      const catData = allCategoriesRankings[cat.key];
      const j1 = catData?.topThree.find(t => t.rank === 1);
      const j2 = catData?.topThree.find(t => t.rank === 2);
      const j3 = catData?.topThree.find(t => t.rank === 3);

      return {
        'No': idx + 1,
        'Kategori Mata Lomba': cat.title,
        'Nama Singkat': cat.shortTitle,
        'Nilai Maksimal': `${cat.maxPoints} Poin`,
        'Jumlah Kriteria': `${cat.criteria.length} Butir`,
        'Juara 1 (Emas)': j1 ? `${j1.participant.sekolah} (${j1.score} Poin - ${j1.pct.toFixed(1)}%)` : 'Belum Ada',
        'Peleton Juara 1': j1?.participant.peleton || '-',
        'Juara 2 (Perak)': j2 ? `${j2.participant.sekolah} (${j2.score} Poin - ${j2.pct.toFixed(1)}%)` : 'Belum Ada',
        'Peleton Juara 2': j2?.participant.peleton || '-',
        'Juara 3 (Perunggu)': j3 ? `${j3.participant.sekolah} (${j3.score} Poin - ${j3.pct.toFixed(1)}%)` : 'Belum Ada',
        'Peleton Juara 3': j3?.participant.peleton || '-'
      };
    });
    const wsRingkasan = XLSX.utils.json_to_sheet(rowsRingkasanJuara);
    XLSX.utils.book_append_sheet(workbook, wsRingkasan, 'Ringkasan Juara Kategori');

    // SHEET 3 S/D 13: MASING-MASING KATEGORI PERLOMBAAN DI SHEET TERPISAH
    categories.forEach((cat, idx) => {
      const catData = allCategoriesRankings[cat.key];
      const sourceList = catData ? catData.leaderboard : [];

      const catRows = sourceList.map((item, pIdx) => {
        const rowObj: Record<string, any> = {
          'No': pIdx + 1,
          'Peringkat Kategori': item.catRank ? `Juara ${item.catRank}` : 'Belum Lengkap',
          'Peringkat Jenjang': item.jenjangCatRank ? `Juara ${item.jenjangCatRank} (${item.jenjang})` : '-',
          'No. Peserta': item.nomor,
          'Tingkat': item.jenjang || 'SLTP',
          'Nama Sekolah': item.sekolah,
          'Nama Peleton': item.peleton || '-',
          'Hari / Tanggal': item.tanggal,
          'Juri Penilai': item.juri
        };

        // Kolom nilai tiap butir kriteria penilaian
        cat.criteria.forEach(crit => {
          const val = item.catScores[crit.no];
          rowObj[`K${crit.no}. ${crit.name} (Max ${crit.weights[4]})`] = val !== undefined && val !== null ? val : '-';
        });

        rowObj[`TOTAL NILAI ${cat.shortTitle.toUpperCase()} (Max ${cat.maxPoints})`] = item.catSummary.sum;
        rowObj['Pencapaian (%)'] = Number(item.catSummary.pct.toFixed(2));
        rowObj['Status Penilaian'] = item.catSummary.isComplete ? 'Selesai Dinilai' : 'Belum Lengkap';

        return rowObj;
      });

      const wsCat = XLSX.utils.json_to_sheet(catRows);
      // Nama sheet dibatasi maksimal 31 karakter untuk kompatibilitas Excel
      const sheetName = `${idx + 1}. ${cat.shortTitle}`.slice(0, 30);
      XLSX.utils.book_append_sheet(workbook, wsCat, sheetName);
    });

    XLSX.writeFile(
      workbook,
      `Buku_Rekap_Lengkap_Lomba_PBB_PKS_MultiSheet_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('Buku Rekap Multi-Sheet berhasil diunduh (Sheet Terpisah untuk Setiap Kategori)!');
  };

  // 4. Unduh Format Blanko Lembar Penilaian Juri Per-Kategori (.xlsx)
  const handleDownloadBlankScoreSheet = (catKey: CategoryKey) => {
    const targetCat = categories.find(c => c.key === catKey);
    if (!targetCat) return;

    const rows: (string | number)[][] = [
      ['PANITIA PELAKSANA LOMBA TINGKAT SLTP & SLTA'],
      ['LEMBAR FORMAT PENILAIAN JURI LAPANGAN'],
      ['LOMBA BARIS-BERBARIS (PBB) & PATROLI KEAMANAN SEKOLAH (PKS)'],
      [`MATA LOMBA: ${targetCat.title.toUpperCase()} (KODE: ${targetCat.shortTitle.toUpperCase()})`],
      [`Kelompok: ${targetCat.group} | Nilai Maksimal: ${targetCat.maxPoints} Poin | Jumlah Kriteria: ${targetCat.criteria.length} Butir`],
      [''],
      ['DATA IDENTITAS PESERTA (Diisi oleh Juri / Panitia di Lapangan):'],
      ['Nomor Urut Peserta', ': [ ....................................... ]', '', 'Hari / Tanggal', ': [ ....................................... ]'],
      ['Nama Sekolah', ': [ ....................................... ]', '', 'Jenjang Pendidikan', ': [  ] SLTP       [  ] SLTA'],
      ['Nama Peleton / Regu', ': [ ....................................... ]', '', 'Nama Juri Penilai', ': [ ....................................... ]'],
      [''],
      [
        'No.',
        'Kriteria Penilaian',
        'KS (Kurang Sekali)',
        'K (Kurang)',
        'C (Cukup)',
        'B (Baik)',
        'A (Sangat Baik / Max)',
        'PILIHAN NILAI JURI (Ceklis / Tulis Angka)',
        'CATATAN / EVALUASI JURI'
      ]
    ];

    targetCat.criteria.forEach(crit => {
      rows.push([
        crit.no,
        crit.name,
        crit.weights[0],
        crit.weights[1],
        crit.weights[2],
        crit.weights[3],
        crit.weights[4],
        '',
        ''
      ]);
    });

    rows.push([
      '',
      `TOTAL NILAI AKHIR (Maksimal: ${targetCat.maxPoints} Poin)`,
      '',
      '',
      '',
      '',
      '',
      `....... / ${targetCat.maxPoints}`,
      ''
    ]);

    rows.push(['']);
    rows.push(['PETUNJUK PENILAIAN JURI:']);
    rows.push(['1. Berikan tanda centang (✓) atau lingkari salah satu kolom nilai (KS, K, C, B, A) pada setiap butir kriteria.']);
    rows.push(['2. Bobot Nilai: KS = Kurang Sekali, K = Kurang, C = Cukup, B = Baik, A = Sangat Baik / Maksimal.']);
    rows.push(['3. Tuliskan catatan jika terdapat koreksi gerakan, keistimewaan formasi, atau pelanggaran ketentuan lapangan.']);
    rows.push(['4. Setelah lembar fisik selesai diisi dan ditandatangani, juri dapat memotret form ini untuk otomatis diekstraksi ke sistem via fitur "Upload Foto Form".']);
    rows.push(['']);
    rows.push(['', '', '', '', '', '', 'Tanda Tangan Juri Penilai:']);
    rows.push(['']);
    rows.push(['']);
    rows.push(['', '', '', '', '', '', '( ............................................................ )']);
    rows.push(['', '', '', '', '', '', 'Nama Terang & NIP / NRP Juri']);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 45 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 22 },
      { wch: 26 },
      { wch: 35 }
    ];

    const workbook = XLSX.utils.book_new();
    const sheetName = `Blanko ${targetCat.shortTitle}`.slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(
      workbook,
      `Format_Penilaian_Blanko_${targetCat.shortTitle.replace(/\s+/g, '_')}.xlsx`
    );
    showToast(`Format blanko penilaian ${targetCat.title} (.xlsx) berhasil diunduh!`);
  };

  // 5. Unduh Master Workbook Blanko Seluruh 11 Kriteria Mata Lomba (.xlsx)
  const handleDownloadMasterBlankWorkbook = () => {
    const workbook = XLSX.utils.book_new();

    // COVER SHEET / DAFTAR MATA LOMBA
    const coverRows = [
      ['MASTER FORMAT BLANKO LEMBAR PENILAIAN JURI LAPANGAN'],
      ['LOMBA BARIS-BERBARIS (PBB) & PATROLI KEAMANAN SEKOLAH (PKS) TINGKAT SLTP & SLTA'],
      [''],
      ['Petunjuk: File ini berisi seluruh 11 lembar form blanko kriteria penilaian resmi untuk panitia & juri lapangan.'],
      ['Setiap mata lomba tersedia pada sheet terpisah dan siap langsung dicetak atau diisi.'],
      [''],
      ['DAFTAR MATA LOMBA & BOBOT MAKSIMAL:'],
      ['No.', 'Nama Mata Lomba', 'Kelompok Lomba', 'Jumlah Kriteria', 'Nilai Maksimal', 'Nama Sheet'],
      ...categories.map((c, i) => [
        i + 1,
        c.title,
        c.group,
        `${c.criteria.length} Butir`,
        `${c.maxPoints} Poin`,
        `Blanko ${c.shortTitle}`.slice(0, 31)
      ])
    ];

    const coverWs = XLSX.utils.aoa_to_sheet(coverRows);
    coverWs['!cols'] = [{ wch: 6 }, { wch: 35 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(workbook, coverWs, 'Daftar Mata Lomba');

    // SHEETS UNTUK SETIAP KATEGORI LOMBA
    categories.forEach(cat => {
      const rows: (string | number)[][] = [
        ['PANITIA PELAKSANA LOMBA TINGKAT SLTP & SLTA'],
        ['LEMBAR FORMAT PENILAIAN JURI LAPANGAN'],
        ['LOMBA BARIS-BERBARIS (PBB) & PATROLI KEAMANAN SEKOLAH (PKS)'],
        [`MATA LOMBA: ${cat.title.toUpperCase()} (NILAI MAKSIMAL: ${cat.maxPoints} POIN)`],
        [`Kelompok: ${cat.group} | Jumlah Kriteria: ${cat.criteria.length} Butir`],
        [''],
        ['Nomor Peserta', ': [ ..................... ]', '', 'Hari / Tanggal', ': [ ..................... ]'],
        ['Nama Sekolah', ': [ ..................... ]', '', 'Jenjang', ': [  ] SLTP    [  ] SLTA'],
        ['Regu / Peleton', ': [ ..................... ]', '', 'Nama Juri', ': [ ..................... ]'],
        [''],
        [
          'No.',
          'Kriteria Penilaian',
          'KS (Kurang Sekali)',
          'K (Kurang)',
          'C (Cukup)',
          'B (Baik)',
          'A (Sangat Baik / Max)',
          'PILIHAN NILAI JURI',
          'CATATAN JURI'
        ]
      ];

      cat.criteria.forEach(crit => {
        rows.push([
          crit.no,
          crit.name,
          crit.weights[0],
          crit.weights[1],
          crit.weights[2],
          crit.weights[3],
          crit.weights[4],
          '',
          ''
        ]);
      });

      rows.push([
        '',
        `TOTAL NILAI AKHIR (Maks. ${cat.maxPoints})`,
        '',
        '',
        '',
        '',
        '',
        `....... / ${cat.maxPoints}`,
        ''
      ]);

      rows.push(['']);
      rows.push(['', '', '', '', '', '', 'Tanda Tangan Juri:']);
      rows.push(['']);
      rows.push(['']);
      rows.push(['', '', '', '', '', '', '( ................................................ )']);

      const catWs = XLSX.utils.aoa_to_sheet(rows);
      catWs['!cols'] = [
        { wch: 6 },
        { wch: 42 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 22 },
        { wch: 20 },
        { wch: 30 }
      ];
      const sName = `Blanko ${cat.shortTitle}`.slice(0, 31);
      XLSX.utils.book_append_sheet(workbook, catWs, sName);
    });

    XLSX.writeFile(
      workbook,
      `Master_Format_Blanko_Semua_11_Kriteria_Lomba_PBB_PKS_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    showToast('Master format blanko seluruh 11 kriteria penilaian berhasil diunduh!');
  };

  // Selected participant for Print Modal
  const printTargetParticipant = useMemo(() => {
    if (!printPesertaId) return null;
    const target = pesertaList.find(p => p.id === printPesertaId);
    if (!target) return null;
    const calc = calculateAllCategories(target, categories);
    const itemInTable = overallStandingsData.find(t => t.id === target.id);
    return {
      ...target,
      calc,
      rank: itemInTable?.rank || null
    };
  }, [printPesertaId, pesertaList, categories, overallStandingsData]);

  // Navigate between categories (Next / Prev)
  const currentCategoryIndex = useMemo(() => {
    return categories.findIndex(c => c.key === currentTab);
  }, [categories, currentTab]);

  const handlePrevCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentTab(categories[currentCategoryIndex - 1].key);
    }
  };

  const handleNextCategory = () => {
    if (currentCategoryIndex >= 0 && currentCategoryIndex < categories.length - 1) {
      setCurrentTab(categories[currentCategoryIndex + 1].key);
    }
  };

  // Selected Category Object in Rekap Kategori
  const rekapActiveCategoryObj = useMemo(() => {
    return categories.find(c => c.key === rekapSelectedCategoryKey) || categories[0];
  }, [categories, rekapSelectedCategoryKey]);

  // ==========================================
  // RENDER: LOGIN SCREEN (IF NOT LOGGED IN)
  // ==========================================
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-700/30">
          <div className="bg-slate-900 text-white text-center p-6 border-b border-slate-800">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-lg mb-3">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight uppercase">Sistem Rekapitulasi Lomba</h2>
            <p className="text-xs text-blue-300 font-medium mt-0.5">Penilaian Terpadu PBB, PKS & Kreasi (SLTP / SLTA)</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {loginError && (
              <div className="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Username atau password tidak cocok! Silakan periksa kembali.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Masuk ke Aplikasi
            </button>

            {/* Quick Demo Login */}
            <div className="pt-4 border-t border-slate-200 text-center">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Akun Demo Bawaan:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 px-2 rounded-lg text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('juri')}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2 px-2 rounded-lg text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Juri</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('user')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 px-2 rounded-lg text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>User / Tamu</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN APPLICATION
  // ==========================================
  const isUserRole = currentUser.role === 'user';
  const isAdminRole = currentUser.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-800">
      {/* 1. TOP NAVBAR */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand Title */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white shadow">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-base sm:text-lg tracking-tight leading-none text-white">
                  E-REKAP LOMBA PBB & PKS
                </h1>
                <p className="text-[11px] text-blue-300 font-medium tracking-wider mt-0.5">
                  SLTP & SLTA • REKAP JUARA UMUM & PER-KATEGORI
                </p>
              </div>
            </div>

            {/* Profile & Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-xs">
                <User className="w-4 h-4 text-blue-400" />
                <div>
                  <span className="font-bold text-white block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">
                    {currentUser.role === 'admin'
                      ? 'ADMINISTRATOR'
                      : currentUser.role === 'juri'
                      ? 'JURI LAPANGAN'
                      : 'TAMU / READ-ONLY'}
                  </span>
                </div>
              </div>

              {/* Tambah Peserta */}
              {!isUserRole && (
                <button
                  onClick={openNewPesertaModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Tambah Peserta</span>
                </button>
              )}

              {/* Tombol Manajemen Pengguna (Khusus Admin) */}
              {isAdminRole && (
                <button
                  onClick={() => {
                    setUserFormTab('list');
                    setModalUserOpen(true);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="hidden md:inline">Kelola User</span>
                </button>
              )}

              {/* Pengaturan Juknis & Database (Khusus Admin) */}
              {isAdminRole && (
                <div className="relative group">
                  <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 border border-slate-700 transition cursor-pointer">
                    <Sliders className="w-4 h-4" />
                    <span className="hidden sm:inline">Menu Data</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl py-1.5 hidden group-hover:block z-50 text-slate-700 border border-slate-200">
                    <button
                      onClick={() => {
                        setTempCategoriesConfig([...categories]);
                        setModalConfigOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <Settings className="w-4 h-4 text-blue-600" /> Atur Nilai Maksimal Juknis
                    </button>
                    <button
                      onClick={handleExportExcelMasterWorkbook}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Ekspor Buku Rekap Multi-Sheet
                    </button>
                    <button
                      onClick={handleDownloadMasterBlankWorkbook}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <Download className="w-4 h-4 text-teal-600" /> Unduh Master Blanko 11 Kategori (.xlsx)
                    </button>
                    <button
                      onClick={() => {
                        setBlankSheetCatKey('pbb');
                        setModalBlankSheetOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <Printer className="w-4 h-4 text-slate-600" /> Cetak / Pratinjau Blanko Form Juri
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <Download className="w-4 h-4 text-blue-600" /> Cadangkan JSON Lengkap
                    </button>
                    <label className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 flex items-center gap-2 cursor-pointer font-medium">
                      <Upload className="w-4 h-4 text-amber-600" /> Pulihkan JSON
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleImportJson}
                      />
                    </label>
                    <hr className="my-1 border-slate-200" />
                    <button
                      onClick={handleResetAllData}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                    >
                      <RotateCcw className="w-4 h-4" /> Reset Semua Data
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                title="Keluar Akun"
                className="bg-rose-600/80 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation Bar with Dropdown for Assessment Categories */}
          <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-bold cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> {isUserRole ? 'Data Mentah Peserta' : 'Dashboard'}
              </button>

              {!isUserRole ? (
                <button
                  onClick={() => setCurrentTab('rekap')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 font-bold cursor-pointer ${
                    currentTab === 'rekap'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-amber-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" /> Rekapitulasi & Peringkat
                </button>
              ) : (
                <div className="bg-slate-800 border border-slate-700 text-amber-300 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold text-[11px]">
                  <Eye className="w-3.5 h-3.5 text-amber-400" /> Mode Tamu (Hanya Data Mentah)
                </div>
              )}
            </div>

            {/* DROPDOWN PEMILIH KATEGORI PENILAIAN */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold hidden md:inline">
                {isUserRole ? 'Lihat Lembar Nilai Mentah:' : 'Kategori Penilaian:'}
              </span>
              <div className="relative flex items-center">
                <select
                  value={activeCategory ? activeCategory.key : ''}
                  onChange={e => {
                    if (e.target.value) setCurrentTab(e.target.value);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Kategori Penilaian --</option>
                  <optgroup label="PBB & Variasi">
                    {categories.filter(c => c.group === 'PBB & Variasi').map(cat => {
                      const isDone = activeCalc?.categorySummaries[cat.key]?.isComplete;
                      return (
                        <option key={cat.key} value={cat.key}>
                          {isDone ? '✓ ' : '• '} {cat.title} (Max {cat.maxPoints})
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="Lantas & Lapangan">
                    {categories.filter(c => c.group === 'Lantas & Lapangan').map(cat => {
                      const isDone = activeCalc?.categorySummaries[cat.key]?.isComplete;
                      return (
                        <option key={cat.key} value={cat.key}>
                          {isDone ? '✓ ' : '• '} {cat.title} (Max {cat.maxPoints})
                        </option>
                      );
                    })}
                  </optgroup>
                  <optgroup label="Kreasi & Khusus">
                    {categories.filter(c => c.group === 'Kreasi & Khusus').map(cat => {
                      const isDone = activeCalc?.categorySummaries[cat.key]?.isComplete;
                      return (
                        <option key={cat.key} value={cat.key}>
                          {isDone ? '✓ ' : '• '} {cat.title} (Max {cat.maxPoints})
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. PARTICIPANT ACTIVE SELECTOR BAR */}
      <div className="bg-slate-800 text-white border-b border-slate-700 py-2.5 px-4 sm:px-8 shadow-sm no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Pilih Peserta:
            </span>
            <select
              value={activePesertaId || ''}
              onChange={e => setActivePesertaId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 font-semibold max-w-sm outline-none"
            >
              {pesertaList.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.jenjang || 'SLTP'}] No. {p.nomor} - {p.peleton ? `${p.peleton} (${p.sekolah})` : p.sekolah}
                </option>
              ))}
            </select>
            {!isUserRole && activePeserta && (
              <button
                onClick={() => openEditPesertaModal(activePeserta)}
                title="Edit Identitas Peserta"
                className="text-blue-300 hover:text-white text-xs bg-slate-700 hover:bg-slate-600 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>

          {activePeserta && (
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className={`px-2 py-0.5 rounded font-black text-[11px] ${
                activePeserta.jenjang === 'SLTA'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}>
                {activePeserta.jenjang || 'SLTP'}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" /> {activePeserta.sekolah}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" /> {activePeserta.tanggal}
              </span>
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Juri: {activePeserta.juri}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Read-Only Notice for User Role */}
      {isUserRole && (
        <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs text-center border-b border-amber-600 no-print flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 shrink-0" /> Anda masuk sebagai Akun Tamu / User (Mode Hanya Lihat). Perubahan data dan penginputan nilai dinonaktifkan.
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full ${(modalPrintOpen || modalBlankSheetOpen) ? 'no-print' : ''}`}>
        {/* ==================================================== */}
        {/* TAB 1: DASHBOARD RINGKASAN */}
        {/* ==================================================== */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {pesertaList.length === 0 ? (
              <div className="bg-amber-50 border border-amber-300 p-6 rounded-2xl text-center">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="font-bold text-lg text-amber-900">Belum Ada Data Peserta</h3>
                <p className="text-sm text-amber-700 max-w-md mx-auto mt-1">
                  Silakan tambahkan peserta lomba terlebih dahulu menggunakan tombol Tambah Peserta di kanan atas.
                </p>
                {!isUserRole && (
                  <button
                    onClick={openNewPesertaModal}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow"
                  >
                    <UserPlus className="w-4 h-4" /> Tambah Peserta Pertama
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Active Participant Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                        No. Peserta: {activePeserta?.nomor || '-'}
                      </span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider text-white ${
                        activePeserta?.jenjang === 'SLTA' ? 'bg-indigo-600' : 'bg-blue-600'
                      }`}>
                        Jenjang {activePeserta?.jenjang || 'SLTP'}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-900">
                      {activePeserta?.peleton ? activePeserta.peleton : activePeserta?.sekolah}
                    </h2>
                    {activePeserta?.peleton && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        Asal Sekolah / Kontingen: <strong className="text-slate-700">{activePeserta.sekolah}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block font-medium">Hari / Tanggal:</span>
                      <strong className="text-slate-800 text-sm">{activePeserta?.tanggal || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Nama Juri Bertugas:</span>
                      <strong className="text-slate-800 text-sm">{activePeserta?.juri || '-'}</strong>
                    </div>
                  </div>
                </div>

                {/* Grand Total Summary Card */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                    <div className="md:col-span-2 space-y-2">
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
                        Akumulasi Nilai Keseluruhan
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                        TOTAL REKAPITULASI POIN
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Akumulasi otomatis seluruh {categories.length} kategori lomba. Peserta otomatis masuk peringkat juara jika seluruh kategori wajib telah dinilai 100%.
                      </p>
                    </div>

                    <div className="text-center md:text-right border-y md:border-y-0 md:border-x border-slate-700 py-4 md:py-0 md:px-6">
                      <span className="text-xs text-slate-400 uppercase font-semibold">Total Nilai Diperoleh:</span>
                      <div className="flex items-baseline justify-center md:justify-end gap-1.5 mt-1">
                        <span className="text-5xl font-black text-amber-400 tracking-tight tabular-nums">
                          {activeCalc?.grandTotal || 0}
                        </span>
                        <span className="text-slate-400 font-bold text-lg">/ {activeCalc?.maxGrandTotal || 0}</span>
                      </div>
                      <p className="text-xs text-blue-300 font-bold mt-1">
                        Persentase: <span className="text-white text-sm font-black">{(activeCalc?.grandPct || 0).toFixed(2)}%</span>
                      </p>
                    </div>

                    <div className="text-center space-y-3">
                      <div>
                        <span className="text-xs text-slate-400 uppercase font-semibold block">
                          Kelengkapan Kategori:
                        </span>
                        <span className="text-2xl font-black text-white">
                          {activeCalc?.completedCategoriesCount || 0} / {categories.length} Selesai
                        </span>
                      </div>
                      <div>
                        {activeCalc?.mandatoryCompleted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Memenuhi Syarat Juara
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow">
                            Belum Lengkap ({activeCalc?.completedCategoriesCount}/{categories.length})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banner & Tombol Unduh Format Blanko Lembar Penilaian Juri */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-2">
                        <span>Format Blanko Penilaian Siap Download & Cetak</span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full uppercase">
                          11 Kategori
                        </span>
                      </h4>
                      <p className="text-xs text-emerald-800 mt-0.5 max-w-2xl">
                        Unduh form penilaian kosong berbobot KS, K, C, B, dan A dalam format Excel (.xlsx) atau cetak lembar fisik untuk juri di lapangan.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
                    <button
                      onClick={handleDownloadMasterBlankWorkbook}
                      className="flex-1 md:flex-initial text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Download seluruh 11 lembar form kriteria dalam satu buku kerja Excel"
                    >
                      <Download className="w-4 h-4" /> Download Master Semua Kriteria (.xlsx)
                    </button>
                    <button
                      onClick={() => {
                        setBlankSheetCatKey('pbb');
                        setModalBlankSheetOpen(true);
                      }}
                      className="flex-1 md:flex-initial text-xs bg-white hover:bg-emerald-50 text-emerald-800 font-bold px-3.5 py-2.5 rounded-xl border border-emerald-300 shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Pratinjau lembar blanko untuk dicetak ke kertas"
                    >
                      <Printer className="w-4 h-4 text-emerald-700" /> Pratinjau & Cetak Blanko
                    </button>
                  </div>
                </div>

                {/* Grid of All Category Cards */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-base uppercase text-slate-800 tracking-wider">
                      Daftar Capaian Tiap Kategori
                    </h3>
                    <div className="flex items-center gap-2">
                      {!isUserRole ? (
                        <button
                          onClick={() => {
                            setRekapViewMode('kategori');
                            setCurrentTab('rekap');
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-xs"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-500" /> Lihat Peringkat Tiap Kategori
                        </button>
                      ) : (
                        <div className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-blue-600" /> Data Mentah Lapangan (Belum Rekap)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => {
                      const summary = activeCalc?.categorySummaries[cat.key];
                      const isComplete = summary?.isComplete;
                      const count = summary?.count || 0;
                      const totalCrit = cat.criteria.length;
                      const score = summary?.sum || 0;
                      const pct = summary?.pct || 0;

                      return (
                        <div
                          key={cat.key}
                          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[11px] font-semibold text-slate-400">
                                {cat.group}
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  isComplete
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : count > 0
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {isComplete
                                  ? 'Selesai (100%)'
                                  : count > 0
                                  ? `${count}/${totalCrit} Dinilai`
                                  : 'Belum Dinilai'}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-base leading-snug">
                              {cat.title}
                            </h4>
                            <p className="text-xs text-slate-500 mb-3">
                              {totalCrit} Kriteria Penilaian
                            </p>

                            <div className="flex items-baseline gap-1.5 mb-2">
                              <span className="text-3xl font-black text-slate-900 tabular-nums">
                                {score}
                              </span>
                              <span className="text-xs text-slate-400 font-semibold">
                                / {cat.maxPoints} Poin
                              </span>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-2 mb-1.5 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  isComplete ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Pencapaian</span>
                              <span className="font-bold text-slate-700">{pct.toFixed(1)}%</span>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => setCurrentTab(cat.key)}
                              className="flex-1 bg-slate-50 hover:bg-blue-50 text-blue-700 font-bold py-2 rounded-xl text-xs border border-slate-200 hover:border-blue-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              Buka Lembar Penilaian
                            </button>
                            <button
                              onClick={() => handleDownloadBlankScoreSheet(cat.key)}
                              title="Download Format Blanko Excel (.xlsx)"
                              className="px-2.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Blanko</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB DINAMIS: LEMBAR PENILAIAN DENGAN DROPDOWN */}
        {/* ==================================================== */}
        {activeCategory && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      {activeCategory.group}
                    </span>
                    {activeCategory.isMandatory && (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                        Kategori Wajib
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {activeCategory.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeCategory.criteria.length} Butir Kriteria • Pilihan Nilai: KS (Kurang Sekali), K (Kurang), C (Cukup), B (Baik), A (Sangat Baik / Maksimal).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold uppercase">Subtotal Diperoleh:</span>
                    <div className="text-2xl font-black text-blue-700 tabular-nums">
                      {activeCalc?.categorySummaries[activeCategory.key]?.sum || 0}{' '}
                      <span className="text-slate-400 text-sm font-semibold">
                        / {activeCategory.maxPoints}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-600">
                      ({(activeCalc?.categorySummaries[activeCategory.key]?.pct || 0).toFixed(2)}%)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tombol Unduh Format Blanko Excel untuk Kategori ini */}
                    <button
                      onClick={() => handleDownloadBlankScoreSheet(activeCategory.key)}
                      title="Download format blanko Excel (.xlsx) untuk mata lomba ini"
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Format Blanko (.xlsx)</span>
                    </button>

                    {/* Tombol Cetak / Pratinjau Lembar Blanko */}
                    <button
                      onClick={() => {
                        setBlankSheetCatKey(activeCategory.key);
                        setModalBlankSheetOpen(true);
                      }}
                      title="Pratinjau & Cetak Lembar Form Penilaian Kosong"
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-slate-600" />
                      <span>Cetak Blanko</span>
                    </button>

                    {/* Tombol Lihat Foto Form Terlampir (Bisa dilihat Juri, Admin, & Tamu) */}
                    {activePeserta?.formPhotos?.[activeCategory.key]?.url && (
                      <button
                        onClick={() => handleOpenViewPhoto(activeCategory.key)}
                        title="Lihat foto bukti lembar fisik form penilaian juri"
                        className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Foto Form Juri</span>
                      </button>
                    )}

                    {/* Tombol Upload & Scan Foto Form (Khusus Juri & Admin) */}
                    {!isUserRole && (
                      <>
                        <button
                          onClick={() => {
                            setScanPreviewUrl(null);
                            setScanFileName('');
                            setScanError(null);
                            setScannedResult(null);
                            setModalScanOpen(true);
                          }}
                          className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-amber-300" />
                          <span>Upload Foto Form</span>
                        </button>

                        <button
                          onClick={() => handleResetCategory(activeCategory.key)}
                          className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reset
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Banner Penjelasan Khusus Akun Tamu (Data Mentah) */}
              {isUserRole && (
                <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-medium">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Mode Akun Tamu:</strong> Menampilkan <strong>data mentah</strong> penilaian kriteria asli yang diinput juri untuk peserta <strong>{activePeserta?.sekolah}</strong> ({activePeserta?.peleton || `No. ${activePeserta?.nomor}`}).
                    </span>
                  </div>
                  <span className="bg-amber-200/80 text-amber-950 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                    Data Mentah Belum Direkap
                  </span>
                </div>
              )}

              {/* Toolbar Dropdown Kategori & Filter Kriteria */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevCategory}
                    disabled={currentCategoryIndex <= 0}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Kategori Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-600 hidden sm:inline">Pindah Kategori:</span>
                    <select
                      value={activeCategory.key}
                      onChange={e => setCurrentTab(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-900 text-xs font-bold py-1.5 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      {categories.map((c, i) => (
                        <option key={c.key} value={c.key}>
                          {i + 1}. {c.title} (Max {c.maxPoints})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleNextCategory}
                    disabled={currentCategoryIndex >= categories.length - 1}
                    className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Kategori Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filter Kriteria:
                  </span>
                  <select
                    value={criteriaFilter}
                    onChange={e => setCriteriaFilter(e.target.value as any)}
                    className="bg-white border border-slate-300 text-slate-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="all">Semua Kriteria ({activeCategory.criteria.length})</option>
                    <option value="unscored">Hanya yang Belum Dinilai</option>
                    <option value="scored">Hanya yang Sudah Dinilai</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Assessment Table with Dropdown Selectors & Radio Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-white uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-3.5 px-3 text-center w-12">No</th>
                      <th className="py-3.5 px-4">Kriteria Penilaian</th>
                      <th className="py-3.5 px-3 text-center w-52 bg-slate-800">
                        Pilihan Dropdown<br />
                        <span className="text-[10px] text-blue-300 font-normal">Pilih Nilai Cepat</span>
                      </th>
                      <th className="py-3.5 px-2 text-center w-20">KS</th>
                      <th className="py-3.5 px-2 text-center w-20">K</th>
                      <th className="py-3.5 px-2 text-center w-20">C</th>
                      <th className="py-3.5 px-2 text-center w-20">B</th>
                      <th className="py-3.5 px-2 text-center w-20">A</th>
                      <th className="py-3.5 px-4 text-center w-24 bg-slate-950 text-amber-400">Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {activeCategory.criteria
                      .filter(c => {
                        const score = activePeserta?.scores?.[activeCategory.key]?.[c.no];
                        if (criteriaFilter === 'unscored') return score === undefined || score === null;
                        if (criteriaFilter === 'scored') return score !== undefined && score !== null;
                        return true;
                      })
                      .map(c => {
                        const selectedVal = activePeserta?.scores?.[activeCategory.key]?.[c.no];
                        const isScored = selectedVal !== undefined && selectedVal !== null;

                        return (
                          <tr key={c.no} className="hover:bg-blue-50/40 transition">
                            <td className="py-2.5 px-3 text-center text-slate-400 font-bold">{c.no}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-800">
                              <span>{c.name}</span>
                              {!isScored && (
                                <span className="text-[10px] text-amber-600 font-bold block sm:hidden">
                                  Belum dinilai
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 text-center bg-slate-50/70">
                              <select
                                disabled={isUserRole}
                                value={isScored ? String(selectedVal) : ''}
                                onChange={e => {
                                  const val = e.target.value === '' ? null : Number(e.target.value);
                                  handleScoreSelect(activeCategory.key, c.no, val);
                                }}
                                className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold border transition outline-none cursor-pointer ${
                                  isScored
                                    ? 'bg-blue-50 text-blue-800 border-blue-400'
                                    : 'bg-white text-slate-500 border-slate-300'
                                }`}
                              >
                                <option value="">-- Pilih Nilai --</option>
                                <option value={c.weights[0]}>KS - Kurang Sekali ({c.weights[0]} pt)</option>
                                <option value={c.weights[1]}>K - Kurang ({c.weights[1]} pt)</option>
                                <option value={c.weights[2]}>C - Cukup ({c.weights[2]} pt)</option>
                                <option value={c.weights[3]}>B - Baik ({c.weights[3]} pt)</option>
                                <option value={c.weights[4]}>A - Sangat Baik / Maksimal ({c.weights[4]} pt)</option>
                              </select>
                            </td>

                            {c.weights.map((val, idx) => {
                              const isChecked = selectedVal === val;
                              return (
                                <td key={idx} className="py-2.5 px-1.5 text-center">
                                  <label className={`block ${isUserRole ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                                    <input
                                      type="radio"
                                      name={`${activeCategory.key}_${c.no}`}
                                      value={val}
                                      disabled={isUserRole}
                                      checked={isChecked}
                                      onChange={() => handleScoreSelect(activeCategory.key, c.no, val)}
                                      className="hidden"
                                    />
                                    <span
                                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border transition ${
                                        isChecked
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                          : 'border-slate-200 hover:border-blue-400 text-slate-700'
                                      }`}
                                    >
                                      {val}
                                    </span>
                                  </label>
                                </td>
                              );
                            })}

                            <td className="py-2.5 px-4 text-center font-black text-blue-700 bg-slate-50 text-base tabular-nums">
                              {isScored ? selectedVal : '-'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={8} className="py-4 px-4 text-right uppercase tracking-wider text-slate-700">
                        Subtotal {activeCategory.title} (Maksimal: {activeCategory.maxPoints}):
                      </td>
                      <td className="py-4 px-4 text-center text-xl font-black text-blue-700 bg-slate-200 tabular-nums">
                        {activeCalc?.categorySummaries[activeCategory.key]?.sum || 0}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: REKAPITULASI (JUARA UMUM & PER KATEGORI LOMBA) */}
        {/* ==================================================== */}
        {currentTab === 'rekap' && (
          <div className="space-y-4">
            {/* View Mode Switcher (Juara Umum vs Per Kategori vs Ringkasan Pemenang) */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setRekapViewMode('umum')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    rekapViewMode === 'umum'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span>Klasemen Juara Umum</span>
                </button>

                <button
                  onClick={() => setRekapViewMode('kategori')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    rekapViewMode === 'kategori'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Medal className="w-4 h-4 text-amber-300" />
                  <span>Peringkat Per Kategori Lomba</span>
                </button>

                <button
                  onClick={() => setRekapViewMode('ringkasan')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    rekapViewMode === 'ringkasan'
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Ringkasan Juara Semua Kategori</span>
                </button>
              </div>

              {/* Ekspor Excel: Multi-Sheet & Spesifik */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportExcelMasterWorkbook}
                  title="Unduh seluruh kategori lomba ke dalam 1 file Excel dengan sheet terpisah untuk setiap kategori + Juara Umum"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-amber-300" />
                  <span>Ekspor Buku Rekap (Multi-Sheet: Tiap Kategori Terpisah)</span>
                </button>

                {rekapViewMode === 'kategori' && (
                  <button
                    onClick={() => handleExportExcelKategoriSpesifik(rekapSelectedCategoryKey)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Ekspor Juara {rekapActiveCategoryObj.shortTitle} (.xlsx)
                  </button>
                )}

                {rekapViewMode === 'umum' && (
                  <button
                    onClick={handleExportExcelJuaraUmum}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> Ekspor Juara Umum (.xlsx)
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="bg-slate-700 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak
                </button>
              </div>
            </div>

            {/* Sub-Header Khusus Rekap Per Kategori: Quick Pills & Selector */}
            {rekapViewMode === 'kategori' && (
              <div className="space-y-3 no-print">
                {/* Header Kategori Aktif */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-600 text-white">
                      <Medal className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Kategori Perlombaan yang Dipilih
                      </div>
                      <div className="text-lg font-black text-white flex items-center gap-2">
                        <span>{rekapActiveCategoryObj.title}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-blue-300 font-semibold">
                          Maks. {rekapActiveCategoryObj.maxPoints} Poin
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={rekapSelectedCategoryKey}
                      onChange={e => setRekapSelectedCategoryKey(e.target.value as CategoryKey)}
                      className="bg-slate-800 border border-slate-700 text-white text-xs font-bold py-2 px-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    >
                      {categories.map((c, i) => (
                        <option key={c.key} value={c.key}>
                          {i + 1}. {c.title} ({c.maxPoints} Poin - {c.criteria.length} Butir)
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleExportExcelKategoriSpesifik(rekapSelectedCategoryKey)}
                      title="Ekspor khusus kategori ini ke Excel"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Category Pills Bar (1-Click Switch antar Kategori) */}
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase px-2 shrink-0">Pilih Kategori:</span>
                  {categories.map((cat, idx) => {
                    const isSelected = cat.key === rekapSelectedCategoryKey;
                    const catTop = allCategoriesRankings[cat.key]?.topThree[0];
                    return (
                      <button
                        key={cat.key}
                        onClick={() => setRekapSelectedCategoryKey(cat.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{idx + 1}. {cat.shortTitle}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {cat.maxPoints} pt
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Podium Juara 1, 2, 3 untuk Kategori yang Dipilih */}
                {allCategoriesRankings[rekapSelectedCategoryKey]?.topThree.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Juara 2 (Perak) */}
                    {(() => {
                      const j2 = allCategoriesRankings[rekapSelectedCategoryKey]?.topThree.find(t => t.rank === 2);
                      return (
                        <div className={`p-4 rounded-2xl border transition order-2 md:order-1 ${
                          j2 ? 'bg-gradient-to-b from-slate-50 to-white border-slate-300 shadow-sm' : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-200 text-slate-800">
                              <Medal className="w-3.5 h-3.5 text-slate-600" /> Juara 2 ({rekapActiveCategoryObj.shortTitle})
                            </span>
                            <span className="text-xs font-bold text-slate-500">Perak</span>
                          </div>
                          {j2 ? (
                            <div>
                              <h4 className="font-black text-slate-900 text-base leading-tight truncate">{j2.participant.sekolah}</h4>
                              <p className="text-xs text-blue-600 font-semibold">{j2.participant.peleton || `No. ${j2.participant.nomor}`}</p>
                              <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-100">
                                <span className="text-xs text-slate-500">Nilai Perolehan:</span>
                                <span className="text-lg font-black text-slate-800">{j2.score} <span className="text-xs font-normal text-slate-500">/ {rekapActiveCategoryObj.maxPoints} ({j2.pct.toFixed(1)}%)</span></span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic py-3 text-center">Belum ada peserta lengkap</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Juara 1 (Emas - Podium Utama) */}
                    {(() => {
                      const j1 = allCategoriesRankings[rekapSelectedCategoryKey]?.topThree.find(t => t.rank === 1);
                      return (
                        <div className={`p-4 rounded-2xl border transition order-1 md:order-2 ${
                          j1 ? 'bg-gradient-to-b from-amber-50/80 via-amber-50/30 to-white border-amber-300 shadow-md ring-2 ring-amber-400/30' : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 shadow-sm">
                              <Crown className="w-4 h-4 text-amber-900" /> Juara 1 ({rekapActiveCategoryObj.shortTitle})
                            </span>
                            <span className="text-xs font-black text-amber-600 uppercase tracking-wider">Terbaik 🥇</span>
                          </div>
                          {j1 ? (
                            <div>
                              <h4 className="font-black text-slate-900 text-lg leading-tight truncate">{j1.participant.sekolah}</h4>
                              <p className="text-xs text-blue-600 font-bold">{j1.participant.peleton || `No. ${j1.participant.nomor}`}</p>
                              <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-amber-100">
                                <span className="text-xs text-amber-800 font-bold">Skor Tertinggi:</span>
                                <span className="text-xl font-black text-amber-950">{j1.score} <span className="text-xs font-normal text-slate-600">/ {rekapActiveCategoryObj.maxPoints} ({j1.pct.toFixed(1)}%)</span></span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic py-3 text-center">Belum ada peserta lengkap</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Juara 3 (Perunggu) */}
                    {(() => {
                      const j3 = allCategoriesRankings[rekapSelectedCategoryKey]?.topThree.find(t => t.rank === 3);
                      return (
                        <div className={`p-4 rounded-2xl border transition order-3 ${
                          j3 ? 'bg-gradient-to-b from-amber-50/40 to-white border-amber-200 shadow-sm' : 'bg-slate-50/50 border-dashed border-slate-200 opacity-60'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-700 text-white">
                              <Award className="w-3.5 h-3.5" /> Juara 3 ({rekapActiveCategoryObj.shortTitle})
                            </span>
                            <span className="text-xs font-bold text-amber-700">Perunggu</span>
                          </div>
                          {j3 ? (
                            <div>
                              <h4 className="font-black text-slate-900 text-base leading-tight truncate">{j3.participant.sekolah}</h4>
                              <p className="text-xs text-blue-600 font-semibold">{j3.participant.peleton || `No. ${j3.participant.nomor}`}</p>
                              <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-100">
                                <span className="text-xs text-slate-500">Nilai Perolehan:</span>
                                <span className="text-lg font-black text-slate-800">{j3.score} <span className="text-xs font-normal text-slate-500">/ {rekapActiveCategoryObj.maxPoints} ({j3.pct.toFixed(1)}%)</span></span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic py-3 text-center">Belum ada peserta lengkap</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Filter Bar (Search, Jenjang, Status) - Tampil di Semua Mode Rekap */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-3 no-print">
              <div className="flex-1 min-w-[240px]">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari nomor peserta, sekolah, atau nama regu..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={jenjangFilter}
                  onChange={e => setJenjangFilter(e.target.value as any)}
                  className="border border-slate-300 rounded-xl text-sm px-3 py-2 bg-white font-bold text-slate-800 outline-none"
                >
                  <option value="all">Semua Tingkat (SLTP & SLTA)</option>
                  <option value="SLTP">Hanya Tingkat SLTP (SMP/MTs)</option>
                  <option value="SLTA">Hanya Tingkat SLTA (SMA/SMK/MA)</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="border border-slate-300 rounded-xl text-sm px-3 py-2 bg-white font-medium outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="completed">Hanya yang Lengkap</option>
                  <option value="pending">Hanya yang Belum Selesai</option>
                </select>
              </div>
            </div>

            {/* ============================================== */}
            {/* VIEW 1: KLASEMEN JUARA UMUM DENGAN RANK PER KATEGORI */}
            {/* ============================================== */}
            {rekapViewMode === 'umum' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wide flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-400" /> KLASEMEN AKHIR JUARA UMUM (TOTAL {activeCalc?.maxGrandTotal || 1200} POIN)
                    </h2>
                    <p className="text-xs text-blue-300 mt-0.5">
                      {jenjangFilter === 'all'
                        ? 'Menampilkan seluruh peserta SLTP & SLTA'
                        : `Klasemen Khusus Jenjang ${jenjangFilter}`}. Setiap kolom mata lomba menampilkan perolehan nilai dan peringkat mandiri peserta di kategori tersebut.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-slate-800 px-3 py-1 rounded-full border border-blue-400/30">
                      {overallStandingsData.length} Peserta
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 text-center w-12">No</th>
                        <th className="py-3 px-3 text-center w-28">Peringkat</th>
                        <th className="py-3 px-3 text-center w-16">No</th>
                        <th className="py-3 px-3 text-center w-20">Tingkat</th>
                        <th className="py-3 px-4 min-w-[200px]">Nama Sekolah & Regu</th>
                        {categories.map(cat => (
                          <th
                            key={cat.key}
                            onClick={() => {
                              setRekapSelectedCategoryKey(cat.key);
                              setRekapViewMode('kategori');
                            }}
                            title={`Klik untuk melihat peringkat dan rincian khusus ${cat.title}`}
                            className="py-3 px-2 text-center text-[11px] whitespace-nowrap cursor-pointer hover:bg-blue-100 transition"
                          >
                            <span className="underline decoration-dotted decoration-blue-500 font-black">{cat.shortTitle}</span><br />
                            <span className="text-[10px] text-slate-500 font-normal">Max {cat.maxPoints}</span>
                          </th>
                        ))}
                        <th className="py-3 px-3 text-center w-28 bg-amber-50 text-amber-950 font-black">
                          Total Nilai<br />
                          <span className="text-[10px] text-amber-600 font-normal">Max {activeCalc?.maxGrandTotal}</span>
                        </th>
                        <th className="py-3 px-3 text-center w-20">Persen</th>
                        <th className="py-3 px-3 text-center w-28">Status</th>
                        <th className="py-3 px-3 text-center w-28 no-print">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {overallStandingsData.length === 0 ? (
                        <tr>
                          <td colSpan={9 + categories.length} className="py-8 text-center text-slate-400">
                            Tidak ada data peserta ditemukan pada filter ini.
                          </td>
                        </tr>
                      ) : (
                        overallStandingsData.map((item, index) => {
                          const displayRank = jenjangFilter !== 'all' ? item.jenjangRank : item.rank;
                          let rankBadge = <span className="text-slate-400 text-xs font-semibold">-</span>;
                          let rowHighlight = '';

                          if (item.calc.mandatoryCompleted && displayRank !== null) {
                            if (displayRank === 1) {
                              rankBadge = (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 shadow-sm">
                                  <Crown className="w-3.5 h-3.5" /> Juara Umum 1
                                </span>
                              );
                              rowHighlight = 'bg-amber-50/60';
                            } else if (displayRank === 2) {
                              rankBadge = (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-300 text-slate-900 shadow-sm">
                                  <Medal className="w-3.5 h-3.5" /> Juara Umum 2
                                </span>
                              );
                              rowHighlight = 'bg-slate-50';
                            } else if (displayRank === 3) {
                              rankBadge = (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-700 text-white shadow-sm">
                                  <Award className="w-3.5 h-3.5" /> Juara Umum 3
                                </span>
                              );
                            } else {
                              rankBadge = (
                                <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                                  Peringkat {displayRank}
                                </span>
                              );
                            }
                          }

                          const statusBadge = item.calc.mandatoryCompleted ? (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                              Lengkap
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                              Proses ({item.calc.completedCategoriesCount}/{item.calc.totalCategoriesCount})
                            </span>
                          );

                          return (
                            <tr key={item.id} className={`hover:bg-blue-50/40 transition ${rowHighlight}`}>
                              <td className="py-3 px-3 text-center text-slate-400">{index + 1}</td>
                              <td className="py-3 px-3 text-center">{rankBadge}</td>
                              <td className="py-3 px-3 text-center font-bold text-slate-700">{item.nomor}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                  item.jenjang === 'SLTA'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.jenjang || 'SLTP'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <strong className="text-slate-900 block leading-tight">{item.sekolah}</strong>
                                {item.peleton ? (
                                  <span className="text-xs text-blue-600 font-semibold">{item.peleton}</span>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Tanpa Nama Regu</span>
                                )}
                              </td>

                              {/* Nilai dan Peringkat Kategori Mandiri */}
                              {categories.map(cat => {
                                const s = item.calc.categorySummaries[cat.key]?.sum || 0;
                                const isDone = item.calc.categorySummaries[cat.key]?.isComplete;
                                const cRank = jenjangFilter !== 'all'
                                  ? item.catRanks[cat.key]?.jenjangRank
                                  : item.catRanks[cat.key]?.rank;

                                let rankPill = null;
                                if (isDone && cRank !== null && cRank !== undefined) {
                                  if (cRank === 1) {
                                    rankPill = (
                                      <span className="block text-[9px] font-black text-amber-900 bg-amber-200/90 rounded px-1 py-0.2 mt-0.5">
                                        🥇 #1
                                      </span>
                                    );
                                  } else if (cRank === 2) {
                                    rankPill = (
                                      <span className="block text-[9px] font-black text-slate-800 bg-slate-200 rounded px-1 py-0.2 mt-0.5">
                                        🥈 #2
                                      </span>
                                    );
                                  } else if (cRank === 3) {
                                    rankPill = (
                                      <span className="block text-[9px] font-black text-amber-900 bg-amber-100 rounded px-1 py-0.2 mt-0.5">
                                        🥉 #3
                                      </span>
                                    );
                                  } else {
                                    rankPill = (
                                      <span className="block text-[9px] font-bold text-slate-500 bg-slate-100 rounded px-1 py-0.2 mt-0.5">
                                        #{cRank}
                                      </span>
                                    );
                                  }
                                }

                                return (
                                  <td
                                    key={cat.key}
                                    onClick={() => {
                                      setRekapSelectedCategoryKey(cat.key);
                                      setRekapViewMode('kategori');
                                    }}
                                    title={`Klik untuk melihat rincian kriteria & peringkat ${cat.title}`}
                                    className="py-2.5 px-2 text-center tabular-nums cursor-pointer hover:bg-blue-100/60 transition"
                                  >
                                    <span className="font-extrabold text-slate-800 text-xs block">{s}</span>
                                    {rankPill}
                                  </td>
                                );
                              })}

                              <td className="py-3 px-3 text-center font-black text-amber-950 bg-amber-50 text-base tabular-nums">
                                {item.calc.grandTotal}
                              </td>
                              <td className="py-3 px-3 text-center font-semibold text-slate-700 tabular-nums">
                                {item.calc.grandPct.toFixed(1)}%
                              </td>
                              <td className="py-3 px-3 text-center">{statusBadge}</td>
                              <td className="py-3 px-3 text-center no-print">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setPrintPesertaId(item.id);
                                      setModalPrintOpen(true);
                                    }}
                                    title="Cetak Lembar Nilai"
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                  {!isUserRole && (
                                    <button
                                      onClick={() => {
                                        setActivePesertaId(item.id);
                                        setCurrentTab(categories[0].key);
                                      }}
                                      title="Input / Edit Nilai"
                                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}
                                  {isAdminRole && (
                                    <button
                                      onClick={() => handleDeletePeserta(item.id)}
                                      title="Hapus Peserta"
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================== */}
            {/* VIEW 2: PERINGKAT PER KATEGORI PERLOMBAAN */}
            {/* ============================================== */}
            {rekapViewMode === 'kategori' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wide flex items-center gap-2">
                      <Medal className="w-5 h-5 text-amber-400" /> PERINGKAT JUARA KATEGORI: {rekapActiveCategoryObj.title.toUpperCase()} (MAX {rekapActiveCategoryObj.maxPoints} POIN)
                    </h2>
                    <p className="text-xs text-blue-300 mt-0.5">
                      {jenjangFilter === 'all'
                        ? 'Peringkat umum gabungan seluruh tingkat'
                        : `Peringkat khusus tingkat ${jenjangFilter}`}. Menampilkan rincian skor per butir kriteria penilaian.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-slate-800 px-3 py-1 rounded-full border border-blue-400/30">
                    {categorySpecificStandingsData.length} Peserta
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 text-center w-12">No</th>
                        <th className="py-3 px-3 text-center w-28">Peringkat</th>
                        <th className="py-3 px-3 text-center w-16">No</th>
                        <th className="py-3 px-3 text-center w-20">Tingkat</th>
                        <th className="py-3 px-4 min-w-[200px]">Nama Sekolah & Regu</th>
                        {/* Rincian Tiap Butir Kriteria Penilaian */}
                        {rekapActiveCategoryObj.criteria.map(crit => (
                          <th
                            key={crit.no}
                            title={`Kriteria ${crit.no}: ${crit.name}`}
                            className="py-3 px-2 text-center text-[11px] whitespace-nowrap cursor-help bg-slate-50"
                          >
                            K{crit.no}<br />
                            <span className="text-[10px] text-slate-400 font-normal">Max {crit.weights[4]}</span>
                          </th>
                        ))}
                        <th className="py-3 px-3 text-center w-28 bg-amber-50 text-amber-950 font-black">
                          Subtotal<br />
                          <span className="text-[10px] text-amber-600 font-normal">Max {rekapActiveCategoryObj.maxPoints}</span>
                        </th>
                        <th className="py-3 px-3 text-center w-20">Persen</th>
                        <th className="py-3 px-3 text-center w-28">Status</th>
                        <th className="py-3 px-3 text-center w-24 no-print">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {categorySpecificStandingsData.length === 0 ? (
                        <tr>
                          <td colSpan={8 + rekapActiveCategoryObj.criteria.length} className="py-8 text-center text-slate-400">
                            Tidak ada data peserta ditemukan pada filter ini.
                          </td>
                        </tr>
                      ) : (
                        categorySpecificStandingsData.map((item, index) => {
                          const activeRank = jenjangFilter !== 'all' ? item.jenjangCatRank : item.catRank;
                          let rankBadge = <span className="text-slate-400 text-xs font-semibold">-</span>;
                          let rowHighlight = '';

                          if (item.catSummary.isComplete && activeRank !== null) {
                            if (activeRank === 1) {
                              rankBadge = (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 shadow-sm">
                                  <Crown className="w-3.5 h-3.5" /> Juara 1
                                </span>
                              );
                              rowHighlight = 'bg-amber-50/60';
                            } else if (activeRank === 2) {
                              rankBadge = (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-300 text-slate-900 shadow-sm">
                                  <Medal className="w-3.5 h-3.5" /> Juara 2
                                </span>
                              );
                              rowHighlight = 'bg-slate-50';
                            } else if (activeRank === 3) {
                              rankBadge = (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-700 text-white shadow-sm">
                                  <Award className="w-3.5 h-3.5" /> Juara 3
                                </span>
                              );
                            } else {
                              rankBadge = (
                                <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-xs">
                                  Peringkat {activeRank}
                                </span>
                              );
                            }
                          }

                          const statusBadge = item.catSummary.isComplete ? (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                              Lengkap ({item.catSummary.totalCriteria}/{item.catSummary.totalCriteria})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                              Proses ({item.catSummary.count}/{item.catSummary.totalCriteria})
                            </span>
                          );

                          return (
                            <tr key={item.id} className={`hover:bg-blue-50/40 transition ${rowHighlight}`}>
                              <td className="py-3 px-3 text-center text-slate-400">{index + 1}</td>
                              <td className="py-3 px-3 text-center">{rankBadge}</td>
                              <td className="py-3 px-3 text-center font-bold text-slate-700">{item.nomor}</td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                  item.jenjang === 'SLTA'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.jenjang || 'SLTP'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <strong className="text-slate-900 block leading-tight">{item.sekolah}</strong>
                                {item.peleton ? (
                                  <span className="text-xs text-blue-600 font-semibold">{item.peleton}</span>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Tanpa Nama Regu</span>
                                )}
                              </td>

                              {/* Nilai Tiap Butir Kriteria */}
                              {rekapActiveCategoryObj.criteria.map(crit => {
                                const val = item.catScores[crit.no];
                                return (
                                  <td key={crit.no} className="py-3 px-2 text-center font-semibold text-slate-700 tabular-nums">
                                    {val !== undefined && val !== null ? val : '-'}
                                  </td>
                                );
                              })}

                              <td className="py-3 px-3 text-center font-black text-amber-950 bg-amber-50 text-base tabular-nums">
                                {item.catSummary.sum}
                              </td>
                              <td className="py-3 px-3 text-center font-semibold text-slate-700 tabular-nums">
                                {item.catSummary.pct.toFixed(1)}%
                              </td>
                              <td className="py-3 px-3 text-center">{statusBadge}</td>
                              <td className="py-3 px-3 text-center no-print">
                                {!isUserRole && (
                                  <button
                                    onClick={() => {
                                      setActivePesertaId(item.id);
                                      setCurrentTab(rekapActiveCategoryObj.key);
                                    }}
                                    title="Input / Edit Nilai Kategori Ini"
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ============================================== */}
            {/* VIEW 3: MATRIKS RINGKASAN JUARA SEMUA KATEGORI */}
            {/* ============================================== */}
            {rekapViewMode === 'ringkasan' && (
              <div className="space-y-4">
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase tracking-wide flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-400" /> RINGKASAN JUARA SEMUA KATEGORI MATA LOMBA
                    </h2>
                    <p className="text-xs text-blue-300 mt-0.5">
                      Daftar peraih Juara 1, 2, dan 3 untuk masing-masing dari 11 mata lomba (PBB, Variasi, Formasi, Danton, Devile, Gatur, Senam, Yel-Yel, Beladiri, Public Speaking, Kelengkapan Tenda).
                    </p>
                  </div>
                  <button
                    onClick={handleExportExcelMasterWorkbook}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-amber-300" />
                    <span>Unduh Semua Sheet (.xlsx)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat, idx) => {
                    const catData = allCategoriesRankings[cat.key];
                    const j1 = catData?.topThree.find(t => t.rank === 1);
                    const j2 = catData?.topThree.find(t => t.rank === 2);
                    const j3 = catData?.topThree.find(t => t.rank === 3);

                    return (
                      <div
                        key={cat.key}
                        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                      >
                        <div>
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
                                Mata Lomba #{idx + 1}
                              </span>
                              <h3 className="font-black text-slate-900 text-base leading-snug">
                                {cat.title}
                              </h3>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                              Max {cat.maxPoints} pt
                            </span>
                          </div>

                          {/* Top 3 List */}
                          <div className="py-3 space-y-2.5">
                            {/* Juara 1 */}
                            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200/80">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                  1
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-slate-900 truncate">
                                    {j1 ? j1.participant.sekolah : 'Belum Ada'}
                                  </p>
                                  {j1 && (
                                    <p className="text-[10px] text-slate-500 truncate">
                                      {j1.participant.peleton || `No. ${j1.participant.nomor}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs font-black text-amber-950 shrink-0 tabular-nums">
                                {j1 ? `${j1.score} pt` : '-'}
                              </span>
                            </div>

                            {/* Juara 2 */}
                            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-800 font-black text-xs flex items-center justify-center shrink-0">
                                  2
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">
                                    {j2 ? j2.participant.sekolah : 'Belum Ada'}
                                  </p>
                                  {j2 && (
                                    <p className="text-[10px] text-slate-500 truncate">
                                      {j2.participant.peleton || `No. ${j2.participant.nomor}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-700 shrink-0 tabular-nums">
                                {j2 ? `${j2.score} pt` : '-'}
                              </span>
                            </div>

                            {/* Juara 3 */}
                            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-50/30 border border-amber-100">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                                  3
                                </span>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">
                                    {j3 ? j3.participant.sekolah : 'Belum Ada'}
                                  </p>
                                  {j3 && (
                                    <p className="text-[10px] text-slate-500 truncate">
                                      {j3.participant.peleton || `No. ${j3.participant.nomor}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs font-bold text-slate-700 shrink-0 tabular-nums">
                                {j3 ? `${j3.score} pt` : '-'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setRekapSelectedCategoryKey(cat.key);
                              setRekapViewMode('kategori');
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Buka Tabel Kategori</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleExportExcelKategoriSpesifik(cat.key)}
                            title={`Unduh Excel ${cat.shortTitle}`}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print mt-auto">
        Sistem Rekapitulasi Nilai Lomba PBB & PKS © 2026 • Rekap Juara Umum & Peringkat Seluruh Kategori Perlombaan.
      </footer>

      {/* ==================================================== */}
      {/* MODAL: KELOLA PENGGUNA (TAMBAH USER BARU - ADMIN) */}
      {/* ==================================================== */}
      {modalUserOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Manajemen Pengguna & Akun Juri
              </h3>
              <button
                onClick={() => {
                  setModalUserOpen(false);
                  setEditingUserOriginalUsername(null);
                }}
                className="text-slate-400 hover:text-white text-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigasi Modal User */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2 shrink-0">
              <button
                onClick={() => {
                  setEditingUserOriginalUsername(null);
                  setUserFormTab('list');
                }}
                className={`py-2 px-4 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  userFormTab === 'list'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 border-x border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" /> Daftar Akun ({usersList.length})
              </button>

              <button
                onClick={() => {
                  setEditingUserOriginalUsername(null);
                  setUserFormData({
                    username: '',
                    password: '',
                    name: '',
                    role: 'juri'
                  });
                  setUserFormTab('add');
                }}
                className={`py-2 px-4 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  userFormTab === 'add'
                    ? 'bg-white text-blue-600 border-t-2 border-blue-600 border-x border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4" /> Tambah Pengguna Baru
              </button>

              {editingUserOriginalUsername && (
                <button
                  onClick={() => setUserFormTab('edit')}
                  className={`py-2 px-4 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    userFormTab === 'edit'
                      ? 'bg-white text-amber-600 border-t-2 border-amber-600 border-x border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Edit className="w-4 h-4 text-amber-500" /> Edit: @{editingUserOriginalUsername}
                </button>
              )}
            </div>

            {/* TAB 1: FORM TAMBAH PENGGUNA */}
            {userFormTab === 'add' && (
              <form onSubmit={handleSaveUser} className="p-5 space-y-4 overflow-y-auto flex-1">
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-xs text-blue-800">
                  <strong>Tambah Akun Baru:</strong> Buat akun juri lapangan, administrator tambahan, atau akun tamu untuk kontingen sekolah.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Username Akun *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: juri_pbb, juri2, dll"
                    value={userFormData.username}
                    onChange={e => setUserFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '') }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Username otomatis disesuaikan menjadi huruf kecil tanpa spasi.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Password Akun *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan password untuk login"
                    value={userFormData.password}
                    onChange={e => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Password disimpan untuk login aplikasi.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Lengkap / Identitas Resmi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Aiptu Dedi Suhendra, S.H. (Juri PBB)"
                    value={userFormData.name}
                    onChange={e => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Nama ini akan tercatat secara otomatis pada riwayat lembar penilaian.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Peran Hak Akses (Role) *
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={e => setUserFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold"
                  >
                    <option value="juri">Juri Lapangan (Bisa Input, Upload Foto Form, & Perbarui Nilai Lomba)</option>
                    <option value="admin">Administrator (Akses Penuh Kelola Data, User, Nilai & Ekspor)</option>
                    <option value="user">User / Tamu / Kontingen (Hanya Lihat Nilai Mentah & Cetak)</option>
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setUserFormTab('list')}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Simpan Pengguna Baru
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: EDIT PENGGUNA & PASSWORD */}
            {userFormTab === 'edit' && editingUserOriginalUsername && (
              <form onSubmit={handleUpdateUser} className="p-5 space-y-4 overflow-y-auto flex-1">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold">Mode Edit Akun Pengguna:</span>
                    <span className="ml-1.5 font-mono bg-amber-100 px-2 py-0.5 rounded font-black text-amber-950">
                      @{editingUserOriginalUsername}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-700">Perubahan akan langsung aktif</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Username Login *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={editingUserOriginalUsername === 'admin'}
                    placeholder="Username"
                    value={userFormData.username}
                    onChange={e => setUserFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/\s+/g, '') }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  {editingUserOriginalUsername === 'admin' ? (
                    <p className="text-[11px] text-slate-400 mt-1">Username akun Administrator Utama dikunci oleh sistem.</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1">Jika username diubah, login berikutnya wajib memakai username baru.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Password Akun Baru / Ubah Password *</span>
                    <span className="text-amber-700 font-semibold text-[11px] lowercase">Ketik password baru untuk mengganti</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Masukkan password baru untuk akun ini"
                      value={userFormData.password}
                      onChange={e => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full border border-amber-300 bg-amber-50/30 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono font-bold text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Password saat ini ditampilkan di atas. Anda dapat langsung mengetikkan password baru untuk memperbarui login akun ini.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Lengkap / Identitas Resmi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Juri / Petugas"
                    value={userFormData.name}
                    onChange={e => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Nama ini akan tercatat otomatis di lembar penilaian dan berkas cetak.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Peran Hak Akses (Role) *
                  </label>
                  <select
                    value={userFormData.role}
                    disabled={editingUserOriginalUsername === 'admin'}
                    onChange={e => setUserFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="juri">Juri Lapangan (Bisa Input, Upload Foto Form, & Perbarui Nilai Lomba)</option>
                    <option value="admin">Administrator (Akses Penuh Kelola Data, User, Nilai & Ekspor)</option>
                    <option value="user">User / Tamu / Kontingen (Hanya Lihat Nilai Mentah & Cetak)</option>
                  </select>
                  {editingUserOriginalUsername === 'admin' && (
                    <p className="text-[11px] text-slate-400 mt-1">Hak akses Administrator Utama tidak dapat diturunkan.</p>
                  )}
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleCancelEditUser}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Simpan Perubahan Akun & Password
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: DAFTAR PENGGUNA TERDAFTAR */}
            {userFormTab === 'list' && (
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Daftar akun yang dapat login ke sistem lomba:</span>
                  <span className="font-semibold text-slate-700">Total {usersList.length} Pengguna</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 font-bold uppercase text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Username</th>
                        <th className="p-3">Password</th>
                        <th className="p-3">Nama Lengkap</th>
                        <th className="p-3 text-center">Peran</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {usersList.map(u => (
                        <tr key={u.username} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <span>{u.username}</span>
                              {currentUser?.username === u.username && (
                                <span className="text-[9px] bg-blue-100 text-blue-800 font-extrabold px-1.5 py-0.2 rounded">
                                  Anda
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold border border-slate-200">
                              {u.password || '••••••'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-700">{u.name}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              u.role === 'admin'
                                ? 'bg-rose-100 text-rose-800'
                                : u.role === 'juri'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* Tombol Edit User & Password */}
                              <button
                                onClick={() => handleStartEditUser(u)}
                                title="Edit Data Pengguna & Ubah Password"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              {/* Tombol Hapus User */}
                              {u.username !== 'admin' && currentUser?.username !== u.username ? (
                                <button
                                  onClick={() => handleDeleteUser(u.username)}
                                  title="Hapus Akun Pengguna"
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic px-1">Kunci</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <p className="text-[11px] text-slate-500">
                    Klik ikon <Edit className="w-3.5 h-3.5 inline text-blue-600" /> pada baris akun untuk mengedit identitas atau mereset password.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUserOriginalUsername(null);
                      setUserFormData({ username: '', password: '', name: '', role: 'juri' });
                      setUserFormTab('add');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Tambah User Baru
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: PENGATURAN NILAI MAKSIMAL (ADMIN KHUSUS) */}
      {/* ==================================================== */}
      {modalConfigOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                Pengaturan Nilai Maksimal Juknis Panitia
              </h3>
              <button
                onClick={() => setModalConfigOpen(false)}
                className="text-slate-400 hover:text-white text-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
              <p>
                Administrator dapat menyesuaikan nilai maksimal dan status wajib untuk setiap kategori sesuai dengan Petunjuk Teknis (Juknis) resmi yang berlaku.
              </p>
            </div>

            <form onSubmit={handleSaveCategoriesConfig} className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-3">
                {tempCategoriesConfig.map((cat, idx) => (
                  <div
                    key={cat.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                        {cat.group}
                      </span>
                      <strong className="text-sm text-slate-800">{cat.title}</strong>
                      <span className="text-xs text-slate-400 block">
                        {cat.criteria.length} Butir Kriteria Penilaian
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                          Nilai Maksimal:
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="2000"
                          value={cat.maxPoints}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setTempCategoriesConfig(prev =>
                              prev.map((c, i) => (i === idx ? { ...c, maxPoints: val } : c))
                            );
                          }}
                          className="w-24 border border-slate-300 rounded-lg px-2 py-1 text-sm bg-white font-bold text-center"
                        />
                      </div>

                      <div className="pt-4">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={cat.isMandatory}
                            onChange={e => {
                              const checked = e.target.checked;
                              setTempCategoriesConfig(prev =>
                                prev.map((c, i) => (i === idx ? { ...c, isMandatory: checked } : c))
                              );
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          Wajib
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={handleResetCategoriesToDefault}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Kembalikan ke Standar Awal
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setModalConfigOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: TAMBAH / EDIT PESERTA */}
      {/* ==================================================== */}
      {modalPesertaOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                {editingPesertaId ? 'Edit Identitas Peserta' : 'Tambah Peserta Baru'}
              </h3>
              <button
                onClick={() => setModalPesertaOpen(false)}
                className="text-slate-400 hover:text-white text-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePeserta} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor Peserta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 01"
                  value={pesertaFormData.nomor}
                  onChange={e => setPesertaFormData(prev => ({ ...prev, nomor: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Tingkat / Jenjang Pendidikan *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPesertaFormData(prev => ({ ...prev, jenjang: 'SLTP' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      pesertaFormData.jenjang === 'SLTP'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>SLTP (SMP / MTs)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPesertaFormData(prev => ({ ...prev, jenjang: 'SLTA' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      pesertaFormData.jenjang === 'SLTA'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>SLTA (SMA / SMK / MA)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Sekolah / Asal Kontingen *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    pesertaFormData.jenjang === 'SLTP'
                      ? 'Contoh: SMPN 1 Majalengka'
                      : 'Contoh: SMAN 1 Majalengka'
                  }
                  value={pesertaFormData.sekolah}
                  onChange={e => setPesertaFormData(prev => ({ ...prev, sekolah: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Nama Peleton / Regu
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">(Opsional - Boleh Kosong)</span>
                </div>
                <input
                  type="text"
                  placeholder="Kosongkan jika tidak ada nama regu khusus"
                  value={pesertaFormData.peleton}
                  onChange={e => setPesertaFormData(prev => ({ ...prev, peleton: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hari / Tanggal *
                  </label>
                  <input
                    type="date"
                    required
                    value={pesertaFormData.tanggal}
                    onChange={e => setPesertaFormData(prev => ({ ...prev, tanggal: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Juri Penilai *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Juri"
                    value={pesertaFormData.juri}
                    onChange={e => setPesertaFormData(prev => ({ ...prev, juri: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalPesertaOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: PRINT LEMBAR NILAI */}
      {/* ==================================================== */}
      {modalPrintOpen && printTargetParticipant && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 overflow-y-auto p-4 sm:p-6 flex justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center no-print">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" /> Lembar Penilaian Peserta Resmi
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / PDF
                </button>
                <button
                  onClick={() => setModalPrintOpen(false)}
                  className="text-slate-400 hover:text-white p-1 ml-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-slate-800 text-xs sm:text-sm">
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <h2 className="text-xl font-black tracking-wider uppercase">
                  LEMBAR PENILAIAN RESMI LOMBA PBB & PKS
                </h2>
                <p className="text-xs text-slate-600 font-semibold tracking-wide mt-0.5">
                  TINGKAT {printTargetParticipant.jenjang || 'SLTP'} • REKAPITULASI {categories.length} KATEGORI LOMBA
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-300 text-xs mb-4">
                <div className="space-y-1">
                  <p><strong>Nomor Peserta:</strong> {printTargetParticipant.nomor}</p>
                  <p><strong>Tingkat:</strong> {printTargetParticipant.jenjang || 'SLTP'}</p>
                  <p><strong>Nama Sekolah:</strong> {printTargetParticipant.sekolah}</p>
                  {printTargetParticipant.peleton && (
                    <p><strong>Nama Peleton:</strong> {printTargetParticipant.peleton}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p><strong>Hari / Tanggal:</strong> {printTargetParticipant.tanggal}</p>
                  <p><strong>Nama Juri:</strong> {printTargetParticipant.juri}</p>
                  <p>
                    <strong>Peringkat Klasemen:</strong>{' '}
                    {printTargetParticipant.rank
                      ? `Peringkat / Juara ${printTargetParticipant.rank}`
                      : 'Belum Lengkap'}
                  </p>
                </div>
              </div>

              <table className="w-full text-xs border border-slate-300 text-left mb-6">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2">No</th>
                    <th className="p-2">Kategori Lomba</th>
                    <th className="p-2 text-center">Nilai Maksimal</th>
                    <th className="p-2 text-center">Nilai Diperoleh</th>
                    <th className="p-2 text-center">Pencapaian (%)</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categories.map((cat, idx) => {
                    const summary = printTargetParticipant.calc?.categorySummaries[cat.key];
                    return (
                      <tr key={cat.key}>
                        <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                        <td className="p-2 font-semibold">{cat.title}</td>
                        <td className="p-2 text-center font-bold">{cat.maxPoints}</td>
                        <td className="p-2 text-center font-bold text-blue-700">
                          {summary?.sum || 0}
                        </td>
                        <td className="p-2 text-center">
                          {(summary?.pct || 0).toFixed(2)}%
                        </td>
                        <td className="p-2 text-center">
                          {summary?.isComplete ? 'Selesai' : 'Belum Lengkap'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-black border-t-2 border-slate-400">
                  <tr>
                    <td colSpan={2} className="p-2.5 text-right uppercase">TOTAL NILAI AKHIR:</td>
                    <td className="p-2.5 text-center">{printTargetParticipant.calc?.maxGrandTotal}</td>
                    <td className="p-2.5 text-center text-sm font-black text-amber-700">
                      {printTargetParticipant.calc?.grandTotal}
                    </td>
                    <td className="p-2.5 text-center text-sm">
                      {(printTargetParticipant.calc?.grandPct || 0).toFixed(2)}%
                    </td>
                    <td className="p-2.5 text-center">
                      {printTargetParticipant.calc?.mandatoryCompleted ? 'LENGKAP' : 'PENDING'}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-12 pt-4 flex justify-between text-xs text-center">
                <div>
                  <p className="mb-14">Ketua Panitia Pelaksana,</p>
                  <p className="font-bold underline">( .................................................... )</p>
                </div>
                <div>
                  <p className="mb-14">Juri Penilai Lapangan,</p>
                  <p className="font-bold underline">( {printTargetParticipant.juri} )</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: PRATINJAU & CETAK FORMAT BLANKO LEMBAR PENILAIAN JURI */}
      {/* ==================================================== */}
      {modalBlankSheetOpen && (() => {
        const targetBlankCat = categories.find(c => c.key === blankSheetCatKey) || categories[0];
        return (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 overflow-y-auto p-4 sm:p-6 flex justify-center print:p-0 print:bg-white">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-auto border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print-modal-container">
              {/* Modal Toolbar (no-print) */}
              <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap justify-between items-center gap-3 no-print">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base leading-tight">
                      Format Blanko Penilaian Juri Lapangan
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Siap dicetak ke kertas fisik atau diunduh sebagai file Excel (.xlsx)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Selector Kategori */}
                  <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700">
                    <span className="text-[11px] text-slate-300 font-semibold hidden sm:inline">Mata Lomba:</span>
                    <select
                      value={blankSheetCatKey}
                      onChange={e => setBlankSheetCatKey(e.target.value as CategoryKey)}
                      className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer"
                    >
                      {categories.map((c, i) => (
                        <option key={c.key} value={c.key} className="bg-slate-900 text-white">
                          {i + 1}. {c.title} ({c.maxPoints} Poin)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unduh Excel (.xlsx) Kategori Ini */}
                  <button
                    onClick={() => handleDownloadBlankScoreSheet(targetBlankCat.key)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition"
                    title="Unduh format Excel (.xlsx) untuk kriteria lomba ini"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excel</span>
                  </button>

                  {/* Unduh Master Workbook 11 Kategori */}
                  <button
                    onClick={handleDownloadMasterBlankWorkbook}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition hidden md:flex"
                    title="Unduh seluruh 11 kriteria dalam satu file Excel multi-sheet"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Master 11 Kategori</span>
                  </button>

                  {/* Cetak Fisik / PDF */}
                  <button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / PDF</span>
                  </button>

                  <button
                    onClick={() => setModalBlankSheetOpen(false)}
                    className="text-slate-400 hover:text-white p-1 ml-1 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Blank Sheet Content */}
              <div className="p-6 sm:p-8 overflow-y-auto flex-1 text-slate-900 text-xs sm:text-sm bg-white">
                {/* KOP RESMI */}
                <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500">
                    PANITIA PELAKSANA LOMBA TINGKAT SLTP & SLTA
                  </h3>
                  <h2 className="text-lg sm:text-xl font-black tracking-wide uppercase mt-0.5">
                    LEMBAR FORM PENILAIAN JURI LAPANGAN
                  </h2>
                  <div className="flex flex-wrap justify-center items-center gap-3 mt-1 text-xs">
                    <span className="font-extrabold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      MATA LOMBA: {targetBlankCat.title.toUpperCase()}
                    </span>
                    <span className="font-bold text-slate-700">
                      NILAI MAKSIMAL: {targetBlankCat.maxPoints} POIN
                    </span>
                    <span className="text-slate-500">
                      ({targetBlankCat.criteria.length} Butir Kriteria)
                    </span>
                  </div>
                </div>

                {/* IDENTITAS PESERTA (BLANKO UNTUK DIISI JURI) */}
                <div className="border border-slate-400 rounded-xl p-3.5 mb-4 bg-slate-50/50 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                    <div className="flex items-center">
                      <span className="w-36 font-bold text-slate-700">Nomor Urut Peserta</span>
                      <span className="mr-2">:</span>
                      <div className="flex-1 border-b border-dotted border-slate-500 h-5" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-36 font-bold text-slate-700">Hari / Tanggal</span>
                      <span className="mr-2">:</span>
                      <div className="flex-1 border-b border-dotted border-slate-500 h-5" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-36 font-bold text-slate-700">Nama Sekolah</span>
                      <span className="mr-2">:</span>
                      <div className="flex-1 border-b border-dotted border-slate-500 h-5" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-36 font-bold text-slate-700">Jenjang Tingkat</span>
                      <span className="mr-2">:</span>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5"><span className="inline-block w-3.5 h-3.5 border border-slate-600 rounded-xs" /> SLTP</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block w-3.5 h-3.5 border border-slate-600 rounded-xs" /> SLTA</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="w-36 font-bold text-slate-700">Nama Regu / Peleton</span>
                      <span className="mr-2">:</span>
                      <div className="flex-1 border-b border-dotted border-slate-500 h-5" />
                    </div>
                    <div className="flex items-center">
                      <span className="w-36 font-bold text-slate-700">Nama Juri Penilai</span>
                      <span className="mr-2">:</span>
                      <div className="flex-1 border-b border-dotted border-slate-500 h-5" />
                    </div>
                  </div>
                </div>

                {/* TABEL KRITERIA PENILAIAN */}
                <table className="w-full text-xs border border-slate-400 text-left mb-4">
                  <thead className="bg-slate-100 font-bold border-b border-slate-400 text-slate-800 uppercase">
                    <tr>
                      <th className="p-2 text-center w-10 border-r border-slate-300">No</th>
                      <th className="p-2 border-r border-slate-300">Kriteria Penilaian</th>
                      <th className="p-2 text-center w-12 border-r border-slate-300 bg-rose-50/50">
                        KS<br />
                        <span className="text-[9px] font-normal text-slate-500">{targetBlankCat.criteria[0]?.weights[0]}</span>
                      </th>
                      <th className="p-2 text-center w-12 border-r border-slate-300 bg-amber-50/50">
                        K<br />
                        <span className="text-[9px] font-normal text-slate-500">{targetBlankCat.criteria[0]?.weights[1]}</span>
                      </th>
                      <th className="p-2 text-center w-12 border-r border-slate-300 bg-sky-50/50">
                        C<br />
                        <span className="text-[9px] font-normal text-slate-500">{targetBlankCat.criteria[0]?.weights[2]}</span>
                      </th>
                      <th className="p-2 text-center w-12 border-r border-slate-300 bg-blue-50/50">
                        B<br />
                        <span className="text-[9px] font-normal text-slate-500">{targetBlankCat.criteria[0]?.weights[3]}</span>
                      </th>
                      <th className="p-2 text-center w-12 border-r border-slate-300 bg-emerald-50/50">
                        A<br />
                        <span className="text-[9px] font-normal text-slate-500">{targetBlankCat.criteria[0]?.weights[4]}</span>
                      </th>
                      <th className="p-2 text-center w-24 border-r border-slate-300 bg-slate-50">
                        Nilai Juri
                      </th>
                      <th className="p-2 text-center w-36">
                        Catatan Juri
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {targetBlankCat.criteria.map(crit => (
                      <tr key={crit.no} className="hover:bg-slate-50/50">
                        <td className="p-2 text-center font-bold text-slate-600 border-r border-slate-300">
                          {crit.no}
                        </td>
                        <td className="p-2 font-semibold text-slate-900 border-r border-slate-300">
                          {crit.name}
                        </td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-[11px] text-slate-700">
                          {crit.weights[0]}
                        </td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-[11px] text-slate-700">
                          {crit.weights[1]}
                        </td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-[11px] text-slate-700">
                          {crit.weights[2]}
                        </td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-[11px] text-slate-700">
                          {crit.weights[3]}
                        </td>
                        <td className="p-2 text-center border-r border-slate-300 font-mono text-[11px] text-slate-700 font-bold">
                          {crit.weights[4]}
                        </td>
                        <td className="p-2 text-center border-r border-slate-300 bg-slate-50/30">
                          <div className="w-10 h-6 border border-slate-300 rounded mx-auto" />
                        </td>
                        <td className="p-2">
                          <div className="border-b border-dotted border-slate-400 h-5" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-black border-t-2 border-slate-400">
                    <tr>
                      <td colSpan={2} className="p-2.5 text-right uppercase border-r border-slate-300">
                        TOTAL NILAI AKHIR (MAKS. {targetBlankCat.maxPoints} POIN):
                      </td>
                      <td colSpan={5} className="p-2.5 text-center text-slate-500 text-[10px] border-r border-slate-300">
                        Jumlah akumulasi poin pilihan
                      </td>
                      <td className="p-2.5 text-center border-r border-slate-300 font-bold">
                        [ ........ / {targetBlankCat.maxPoints} ]
                      </td>
                      <td className="p-2.5 text-center text-[10px] text-slate-400">
                        Paraf: ( .......... )
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* PETUNJUK PENILAIAN & TANDA TANGAN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4 pt-2">
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 text-[11px] text-slate-700 space-y-1">
                    <strong className="block text-slate-900 font-bold uppercase mb-1">
                      Petunjuk Penilaian Juri:
                    </strong>
                    <p>1. <strong>KS</strong>: Kurang Sekali, <strong>K</strong>: Kurang, <strong>C</strong>: Cukup, <strong>B</strong>: Baik, <strong>A</strong>: Sangat Baik / Maksimal.</p>
                    <p>2. Beri tanda centang (✓) atau lingkari salah satu kolom bobot pada setiap kriteria.</p>
                    <p>3. Lembar fisik yang telah diisi dapat difoto untuk dipindai otomatis via menu <strong>Upload Foto Form</strong> pada aplikasi.</p>
                  </div>

                  <div className="text-center text-xs space-y-1">
                    <p className="text-slate-600">..........................., ........................................ 2026</p>
                    <p className="font-bold text-slate-800">Juri Penilai Lapangan,</p>
                    <div className="h-16" />
                    <p className="font-bold underline text-slate-900">( ..................................................................... )</p>
                    <p className="text-[11px] text-slate-500">Nama Terang & NIP / NRP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==================================================== */}
      {/* MODAL: IN-APP CONFIRMATION */}
      {/* ==================================================== */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  confirmModal.isDanger ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{confirmModal.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{confirmModal.message}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-3.5 py-1.5 text-white text-xs font-bold rounded-xl shadow cursor-pointer ${
                  confirmModal.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmModal.confirmText || 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: UPLOAD & SCAN FOTO FORM PENILAIAN JURI */}
      {/* ==================================================== */}
      {modalScanOpen && activeCategory && activePeserta && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <Camera className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-base leading-tight">
                    Upload & Pindai Foto Lembar Penilaian Juri
                  </h3>
                  <p className="text-xs text-blue-300">
                    Kategori: <strong className="text-white">{activeCategory.title}</strong> (Maks. {activeCategory.maxPoints} Poin • {activeCategory.criteria.length} Butir Kriteria)
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalScanOpen(false);
                  setScanPreviewUrl(null);
                  setScannedResult(null);
                  setScanError(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Peserta Info */}
            <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-500 uppercase">Target Peserta:</span>
                <span className="font-black text-slate-900">
                  [No. {activePeserta.nomor}] {activePeserta.sekolah}
                </span>
                {activePeserta.peleton && (
                  <span className="text-blue-600 font-semibold">({activePeserta.peleton})</span>
                )}
                <span className={`px-2 py-0.2 rounded font-black text-[10px] ${
                  activePeserta.jenjang === 'SLTA' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {activePeserta.jenjang || 'SLTP'}
                </span>
              </div>
              <div className="text-slate-500 font-medium">
                Juri Bertugas: <strong className="text-slate-700">{currentUser?.name || activePeserta.juri}</strong>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Langkah 1: Upload / Ambil Foto */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Pilih Foto Lembar Penilaian Juri (Kamera HP / Berkas Gambar)
                </label>

                {!scanPreviewUrl ? (
                  <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition group">
                    <Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-600 transition mb-2" />
                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">
                      Klik untuk Memilih atau Foto Langsung Lembar Penilaian
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Mendukung format JPG, PNG, atau WEBP dari kamera ponsel maupun scan dokumen
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative shrink-0 max-w-[200px] w-full">
                      <img
                        src={scanPreviewUrl}
                        alt="Preview Form"
                        className="w-full h-36 object-contain rounded-xl border border-slate-300 bg-black/5"
                      />
                    </div>
                    <div className="flex-1 space-y-2 text-xs">
                      <div>
                        <span className="text-slate-400 uppercase font-bold text-[10px] block">Berkas Foto Terpilih:</span>
                        <strong className="text-slate-800 break-all">{scanFileName || 'foto_lembar_penilaian.jpg'}</strong>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <label className="bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 font-bold cursor-pointer transition">
                          Ganti Foto
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoFileChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setScanPreviewUrl(null);
                            setScannedResult(null);
                            setScanError(null);
                          }}
                          className="text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Pindai AI */}
              {scanPreviewUrl && !scannedResult && (
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleScanPhotoWithAI}
                    disabled={isScanning}
                    className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow cursor-pointer transition"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Sedang Menganalisis & Membaca Nilai dari Foto...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Mulai Pindai Nilai dari Foto (AI Vision)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulateScan}
                    className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-300 cursor-pointer transition"
                    title="Gunakan simulasi ekstraksi jika server AI belum terhubung"
                  >
                    <span>⚡ Gunakan Deteksi Cepat</span>
                  </button>
                </div>
              )}

              {/* Pesan Kesalahan / Error */}
              {scanError && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 text-xs text-rose-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Gagal Menganalisis Gambar secara Otomatis:</strong>
                      <span>{scanError}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-rose-200 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Terapkan dengan Deteksi Cepat
                    </button>
                    <span className="text-slate-500 text-[11px]">Anda juga dapat mengedit nilai secara manual di tabel penilaian.</span>
                  </div>
                </div>
              )}

              {/* Langkah 2: Hasil Pembacaan & Verifikasi */}
              {scannedResult && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                        2. Verifikasi Hasil Pembacaan Nilai Form
                      </span>
                      <p className="text-xs text-slate-500">
                        Periksa kembali nilai yang terbaca dari foto. Anda dapat menyesuaikan pilihan bila diperlukan.
                      </p>
                    </div>

                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {scannedResult.scores.length} Kriteria Terdeteksi
                    </span>
                  </div>

                  {/* Header info yang terdeteksi */}
                  {(scannedResult.detectedSekolah || scannedResult.detectedNomor) && (
                    <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-xs flex flex-wrap items-center gap-4 text-slate-700">
                      {scannedResult.detectedNomor && (
                        <span>No. Terbaca: <strong className="text-blue-900">{scannedResult.detectedNomor}</strong></span>
                      )}
                      {scannedResult.detectedSekolah && (
                        <span>Sekolah Terbaca: <strong className="text-blue-900">{scannedResult.detectedSekolah}</strong></span>
                      )}
                      {scannedResult.notes && (
                        <span className="italic text-slate-500">Catatan: {scannedResult.notes}</span>
                      )}
                    </div>
                  )}

                  {/* Tabel Nilai Tiap Butir Kriteria */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3 text-center w-12">No</th>
                          <th className="py-2.5 px-3">Kriteria Penilaian</th>
                          <th className="py-2.5 px-3 text-center w-24">Predikat</th>
                          <th className="py-2.5 px-3 text-center w-28">Poin Terbaca</th>
                          <th className="py-2.5 px-3 text-center w-36">Sesuaikan Nilai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium">
                        {activeCategory.criteria.map(crit => {
                          const matched = scannedResult.scores.find(s => s.criterionNo === crit.no);
                          const currentScore = matched ? matched.score : crit.weights[3];
                          const currentLabel = matched ? matched.label : 'B';

                          return (
                            <tr key={crit.no} className="hover:bg-slate-50">
                              <td className="py-2 px-3 text-center text-slate-400">K{crit.no}</td>
                              <td className="py-2 px-3 font-semibold text-slate-800">{crit.name}</td>
                              <td className="py-2 px-3 text-center">
                                <span className="inline-block px-2 py-0.5 rounded font-black text-[11px] bg-blue-100 text-blue-800">
                                  {currentLabel}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center font-black text-slate-900 text-sm tabular-nums">
                                {currentScore} <span className="text-[10px] text-slate-400 font-normal">/ {crit.weights[4]}</span>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <select
                                  value={currentScore}
                                  onChange={e => {
                                    const val = Number(e.target.value);
                                    const wIdx = crit.weights.indexOf(val);
                                    const label = wIdx !== -1 ? ['KS', 'K', 'C', 'B', 'A'][wIdx] : 'B';
                                    handleAdjustScannedScore(crit.no, val, label);
                                  }}
                                  className="py-1 px-2 border border-slate-300 rounded-lg text-xs font-bold bg-white text-slate-800 outline-none cursor-pointer"
                                >
                                  {crit.weights.map((w, idx) => (
                                    <option key={idx} value={w}>
                                      {['KS', 'K', 'C', 'B', 'A'][idx]} ({w} pt)
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Ringkasan Subtotal yang diekstrak */}
                  <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold">Total Poin Form yang Diekstrak:</span>
                      <span className="text-lg font-black text-amber-400 tabular-nums">
                        {scannedResult.scores.reduce((acc, curr) => acc + curr.score, 0)} <span className="text-xs text-slate-300 font-normal">/ {activeCategory.maxPoints} Poin</span>
                      </span>
                    </div>
                    <span className="text-blue-300 font-bold">
                      {((scannedResult.scores.reduce((acc, curr) => acc + curr.score, 0) / activeCategory.maxPoints) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setModalScanOpen(false);
                  setScanPreviewUrl(null);
                  setScannedResult(null);
                  setScanError(null);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>

              {scannedResult && (
                <button
                  type="button"
                  onClick={handleApplyScannedScores}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-2 shadow cursor-pointer transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Terapkan Nilai & Simpan Foto Lembar Juri</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: LIHAT FOTO BUKTI FORM PENILAIAN JURI */}
      {/* ==================================================== */}
      {modalViewPhotoOpen && viewingPhotoData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-700 flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-sm">
                    Foto Bukti Lembar Penilaian Juri Lapangan
                  </h3>
                  <p className="text-xs text-blue-300">
                    Kategori: {viewingPhotoData.categoryTitle} • Peserta: [No. {viewingPhotoData.participantNomor}] {viewingPhotoData.participantName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalViewPhotoOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-100 border-b border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0 text-slate-600">
              <span>Waktu Unggah: <strong>{viewingPhotoData.uploadTime || '-'}</strong></span>
              <span>Juri Penilai: <strong>{viewingPhotoData.juriName || '-'}</strong></span>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center bg-slate-950">
              <img
                src={viewingPhotoData.url}
                alt="Foto Lembar Penilaian Juri"
                className="max-h-[60vh] w-auto object-contain rounded-lg border border-slate-800 shadow"
              />
            </div>

            <div className="bg-white px-5 py-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <a
                href={viewingPhotoData.url}
                download={`Foto_Form_${viewingPhotoData.categoryTitle}_No_${viewingPhotoData.participantNomor}.jpg`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Unduh Foto
              </a>
              <button
                onClick={() => setModalViewPhotoOpen(false)}
                className="px-4 py-1.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TOAST NOTIFICATION */}
      {/* ==================================================== */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border-l-4 text-xs sm:text-sm text-white transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-slate-900 border-rose-500'
              : toast.type === 'info'
              ? 'bg-slate-900 border-blue-500'
              : 'bg-slate-900 border-emerald-500'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          ) : toast.type === 'info' ? (
            <Info className="w-4 h-4 text-blue-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
