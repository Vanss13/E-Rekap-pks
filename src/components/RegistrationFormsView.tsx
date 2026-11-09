import React from 'react';
import {
  FileText,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  Shield,
  UserCheck,
  Award,
  Star,
  Building2,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export type SchoolLevel = 'SLTP' | 'SLTA';

interface RegistrationFormsViewProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  appLogo: string | null;
  formPolisiPelajar: {
    nama: string;
    nisn: string;
    sekolah: string;
    jenjang: SchoolLevel;
    kelas: string;
    ttl: string;
    jk: string;
    agama: string;
    alamat: string;
    noHp: string;
    namaOrtu: string;
    pekerjaanOrtu: string;
    tinggiBadan: string;
    beratBadan: string;
    golDarah: string;
    riwayatPenyakit: string;
    prestasi: string;
    alasan: string;
  };
  setFormPolisiPelajar: React.Dispatch<React.SetStateAction<any>>;
  handleExportFormPolisiPelajarExcel: () => void;

  formCalonPks: {
    nama: string;
    nisn: string;
    sekolah: string;
    jenjang: SchoolLevel;
    kelas: string;
    ttl: string;
    jk: string;
    agama: string;
    alamat: string;
    noHp: string;
    namaPembina: string;
    divisiMinat: string;
    tinggiBadan: string;
    beratBadan: string;
    golDarah: string;
    riwayatOrganisasi: string;
    izinOrtu: boolean;
  };
  setFormCalonPks: React.Dispatch<React.SetStateAction<any>>;
  handleExportFormCalonPksExcel: () => void;

  formBalok1: {
    namaRegu: string;
    sekolah: string;
    jenjang: SchoolLevel;
    namaKetua: string;
    jumlahAnggota: string;
    namaPembina: string;
    noHpPembina: string;
    kategoriKemah: string;
    lokasiPerkemahan: string;
    tanggalKegiatan: string;
    statusKesehatan: string;
    suratIzinKepsek: string;
  };
  setFormBalok1: React.Dispatch<React.SetStateAction<any>>;
  handleExportFormBalok1Excel: () => void;

  formBalok2: {
    namaPeserta: string;
    sekolah: string;
    jenjang: SchoolLevel;
    kelas: string;
    noSertifikatBalok1: string;
    tahunKelulusanBalok1: string;
    jabatanPleton: string;
    namaPembina: string;
    materiUji: string;
    rekomendasiSatlantas: string;
  };
  setFormBalok2: React.Dispatch<React.SetStateAction<any>>;
  handleExportFormBalok2Excel: () => void;

  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const RegistrationFormsView: React.FC<RegistrationFormsViewProps> = ({
  currentTab,
  setCurrentTab,
  appLogo,
  formPolisiPelajar,
  setFormPolisiPelajar,
  handleExportFormPolisiPelajarExcel,
  formCalonPks,
  setFormCalonPks,
  handleExportFormCalonPksExcel,
  formBalok1,
  setFormBalok1,
  handleExportFormBalok1Excel,
  formBalok2,
  setFormBalok2,
  handleExportFormBalok2Excel,
  showToast
}) => {
  const handlePrint = () => {
    window.print();
  };

  // 1. Reset or Fill Demo Data Handlers
  const handleResetPolisiPelajar = () => {
    setFormPolisiPelajar({
      nama: '',
      nisn: '',
      sekolah: '',
      jenjang: 'SLTP',
      kelas: '',
      ttl: '',
      jk: 'Laki-Laki',
      agama: 'Islam',
      alamat: '',
      noHp: '',
      namaOrtu: '',
      pekerjaanOrtu: '',
      tinggiBadan: '',
      beratBadan: '',
      golDarah: 'O',
      riwayatPenyakit: 'Tidak Ada',
      prestasi: '',
      alasan: ''
    });
    showToast('Formulir Polisi Pelajar dikosongkan (siap cetak blanko).', 'info');
  };

  const handleDemoPolisiPelajar = () => {
    setFormPolisiPelajar({
      nama: 'Bintang Pratama',
      nisn: '0089123456',
      sekolah: 'SMP Negeri 1 Majalengka',
      jenjang: 'SLTP',
      kelas: 'VIII-A',
      ttl: 'Majalengka, 15 Januari 2012',
      jk: 'Laki-Laki',
      agama: 'Islam',
      alamat: 'Jl. Pemuda No. 45, Majalengka',
      noHp: '081234567890',
      namaOrtu: 'Hendra Gunawan',
      pekerjaanOrtu: 'Wiraswasta',
      tinggiBadan: '165',
      beratBadan: '52',
      golDarah: 'O',
      riwayatPenyakit: 'Tidak Ada',
      prestasi: 'Juara 2 PBB Tingkat Kabupaten',
      alasan: 'Ingin mengabdi dan menegakkan ketertiban dan keselamatan lalu lintas di sekolah.'
    });
    showToast('Contoh data Polisi Pelajar berhasil dimuat.');
  };

  const handleResetCalonPks = () => {
    setFormCalonPks({
      nama: '',
      nisn: '',
      sekolah: '',
      jenjang: 'SLTA',
      kelas: '',
      ttl: '',
      jk: 'Perempuan',
      agama: 'Islam',
      alamat: '',
      noHp: '',
      namaPembina: '',
      divisiMinat: 'Gatur Lantas & Keselamatan Jalan',
      tinggiBadan: '',
      beratBadan: '',
      golDarah: 'A',
      riwayatOrganisasi: '',
      izinOrtu: true
    });
    showToast('Formulir Calon Anggota PKS dikosongkan.', 'info');
  };

  const handleDemoCalonPks = () => {
    setFormCalonPks({
      nama: 'Aisyah Putri Rahmadani',
      nisn: '0078129845',
      sekolah: 'SMA Negeri 1 Majalengka',
      jenjang: 'SLTA',
      kelas: 'X-MIPA 2',
      ttl: 'Majalengka, 22 April 2010',
      jk: 'Perempuan',
      agama: 'Islam',
      alamat: 'Jl. Kartini No. 12, Majalengka',
      noHp: '085712348900',
      namaPembina: 'Drs. Supriyadi, M.Pd',
      divisiMinat: 'Gatur Lantas & Keselamatan Jalan',
      tinggiBadan: '160',
      beratBadan: '48',
      golDarah: 'A',
      riwayatOrganisasi: 'Pramuka Penggalang Inti',
      izinOrtu: true
    });
    showToast('Contoh data Calon PKS berhasil dimuat.');
  };

  const handleResetBalok1 = () => {
    setFormBalok1({
      namaRegu: '',
      sekolah: '',
      jenjang: 'SLTP',
      namaKetua: '',
      jumlahAnggota: '12 Orang',
      namaPembina: '',
      noHpPembina: '',
      kategoriKemah: 'Balok 1 (Tingkat Dasar / Calon Kader PKS)',
      lokasiPerkemahan: '',
      tanggalKegiatan: '',
      statusKesehatan: 'Semua anggota sehat dan siap kegiatan lapangan',
      suratIzinKepsek: ''
    });
    showToast('Formulir Perkemahan Balok 1 dikosongkan.', 'info');
  };

  const handleDemoBalok1 = () => {
    setFormBalok1({
      namaRegu: 'Regu Elang Sakti',
      sekolah: 'SMP Negeri 1 Majalengka',
      jenjang: 'SLTP',
      namaKetua: 'Fajar Nugraha',
      jumlahAnggota: '12 Orang',
      namaPembina: 'Ahmad Fauzi, S.Pd',
      noHpPembina: '081398765432',
      kategoriKemah: 'Balok 1 (Tingkat Dasar / Calon Kader PKS)',
      lokasiPerkemahan: 'Bumi Perkemahan Sindangkasih, Majalengka',
      tanggalKegiatan: '12 - 14 Juni 2026',
      statusKesehatan: 'Semua anggota sehat dan siap kegiatan lapangan',
      suratIzinKepsek: 'No. 421.3/089/SMPN1/2026'
    });
    showToast('Contoh data Kemah Balok 1 berhasil dimuat.');
  };

  const handleResetBalok2 = () => {
    setFormBalok2({
      namaPeserta: '',
      sekolah: '',
      jenjang: 'SLTA',
      kelas: '',
      noSertifikatBalok1: '',
      tahunKelulusanBalok1: '',
      jabatanPleton: '',
      namaPembina: '',
      materiUji: '',
      rekomendasiSatlantas: ''
    });
    showToast('Formulir PKS Balok 2 dikosongkan.', 'info');
  };

  const handleDemoBalok2 = () => {
    setFormBalok2({
      namaPeserta: 'Rizky Ramadhan',
      sekolah: 'SMA Negeri 1 Majalengka',
      jenjang: 'SLTA',
      kelas: 'XI-IPS 1',
      noSertifikatBalok1: 'PKS-B1/POLRES-MJL/2025/084',
      tahunKelulusanBalok1: '2025',
      jabatanPleton: 'Komandan Pleton (Danton)',
      namaPembina: 'Iptu Agus Salim',
      materiUji: 'Penguasaan 12 Gerakan Gatur Lantas, PBB Tongkat, Senam Lantas, Bela Diri Praktis Polri',
      rekomendasiSatlantas: 'Memenuhi Syarat Kualifikasi Instruktur PKS Balok 2'
    });
    showToast('Contoh data PKS Balok 2 berhasil dimuat.');
  };

  // Shared Official Kop Surat Header
  const renderKopSurat = () => (
    <div className="border-b-4 border-double border-slate-900 pb-3 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left Emblem */}
        <div className="w-20 h-20 flex items-center justify-center shrink-0">
          {appLogo ? (
            <img src={appLogo} alt="Logo PKS" className="w-18 h-18 object-contain" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow">
              <Shield className="w-10 h-10 text-amber-400" />
            </div>
          )}
        </div>

        {/* Center Kop Details */}
        <div className="text-center flex-1">
          <h4 className="font-extrabold text-xs sm:text-sm tracking-widest text-slate-900 uppercase">
            KEPOLISIAN NEGARA REPUBLIK INDONESIA
          </h4>
          <h4 className="font-extrabold text-xs sm:text-sm tracking-wider text-slate-900 uppercase">
            DAERAH JAWA BARAT - RESOR MAJALENGKA
          </h4>
          <h3 className="font-black text-sm sm:text-base tracking-wide text-blue-950 uppercase mt-0.5">
            SATUAN LALU LINTAS • UNIT KAMSEL
          </h3>
          <h2 className="font-black text-base sm:text-lg tracking-tight text-slate-950 uppercase">
            KORPS PATROLI KEAMANAN SEKOLAH (PKS)
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium mt-1">
            Sekretariat: Jl. K.H. Abdul Halim No. 518 Majalengka 45418 • Telp: (0233) 281110 • Email: pks.resmajalengka@gmail.com
          </p>
        </div>

        {/* Right Emblem Placeholder / Watermark */}
        <div className="w-20 h-20 flex items-center justify-center shrink-0">
          <div className="w-16 h-16 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400 text-center uppercase leading-tight p-1">
            PASUKAN PKS
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ACTION TOOLBAR (Hidden in Print) */}
      <div className="no-print bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Form Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setCurrentTab('form_polisi_pelajar')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'form_polisi_pelajar'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>1. Polisi Pelajar</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('form_calon_pks')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'form_calon_pks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>2. Calon PKS</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('form_perkemahan_balok1')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'form_perkemahan_balok1'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>3. Kemah Balok 1</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('form_perkemahan_balok2')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'form_perkemahan_balok2'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>4. PKS Balok 2</span>
          </button>
        </div>

        {/* Action Buttons: Demo, Blank, Print, Excel */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Demo Button */}
          <button
            type="button"
            onClick={() => {
              if (currentTab === 'form_polisi_pelajar') handleDemoPolisiPelajar();
              if (currentTab === 'form_calon_pks') handleDemoCalonPks();
              if (currentTab === 'form_perkemahan_balok1') handleDemoBalok1();
              if (currentTab === 'form_perkemahan_balok2') handleDemoBalok2();
            }}
            className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Isi</span> Contoh Data
          </button>

          {/* Blank Button */}
          <button
            type="button"
            onClick={() => {
              if (currentTab === 'form_polisi_pelajar') handleResetPolisiPelajar();
              if (currentTab === 'form_calon_pks') handleResetCalonPks();
              if (currentTab === 'form_perkemahan_balok1') handleResetBalok1();
              if (currentTab === 'form_perkemahan_balok2') handleResetBalok2();
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kosongkan</span> (Blanko)
          </button>

          {/* Excel Export Button */}
          <button
            type="button"
            onClick={() => {
              if (currentTab === 'form_polisi_pelajar') handleExportFormPolisiPelajarExcel();
              if (currentTab === 'form_calon_pks') handleExportFormCalonPksExcel();
              if (currentTab === 'form_perkemahan_balok1') handleExportFormBalok1Excel();
              if (currentTab === 'form_perkemahan_balok2') handleExportFormBalok2Excel();
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel</span>
          </button>

          {/* Print A4 Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Cetak A4 (PDF)</span>
          </button>
        </div>
      </div>

      {/* A4 PRINTABLE CONTAINER */}
      <div className="bg-white max-w-4xl mx-auto rounded-2xl shadow-md border border-slate-200 p-6 sm:p-10 text-slate-800 print:shadow-none print:border-none print:p-0 print:max-w-none">
        {renderKopSurat()}

        {/* ========================================================= */}
        {/* FORM 1: FORMULIR PENDAFTARAN POLISI PELAJAR (POLJAR) */}
        {/* ========================================================= */}
        {currentTab === 'form_polisi_pelajar' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                FORMULIR PENDAFTARAN ANGGOTA POLISI PELAJAR (POLJAR)
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Nomor Registrasi: POLJAR/2026/01-REG
              </p>
            </div>

            {/* Bagian A: Data Identitas Siswa */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-300 pb-1">
                A. Identitas Calon Anggota Polisi Pelajar
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.nama}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, nama: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                    placeholder="Nama lengkap..."
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">NISN (Nomor Induk Siswa Nasional)</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.nisn}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, nisn: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    placeholder="Contoh: 0089123456"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Asal Sekolah</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.sekolah}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, sekolah: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                    placeholder="Nama sekolah..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Jenjang</label>
                    <select
                      value={formPolisiPelajar.jenjang}
                      onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, jenjang: e.target.value as SchoolLevel })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white font-bold"
                    >
                      <option value="SLTP">SLTP (SMP/MTs)</option>
                      <option value="SLTA">SLTA (SMA/SMK)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Kelas</label>
                    <input
                      type="text"
                      value={formPolisiPelajar.kelas}
                      onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, kelas: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                      placeholder="VIII-A / X-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tempat, Tanggal Lahir</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.ttl}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, ttl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    placeholder="Majalengka, 15 Januari 2012"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Jenis Kelamin</label>
                    <select
                      value={formPolisiPelajar.jk}
                      onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, jk: e.target.value })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white"
                    >
                      <option value="Laki-Laki">Laki-Laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Agama</label>
                    <input
                      type="text"
                      value={formPolisiPelajar.agama}
                      onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, agama: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                      placeholder="Islam / Kristen / dsb"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">Alamat Lengkap Tempat Tinggal</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.alamat}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, alamat: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    placeholder="Alamat lengkap siswa..."
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">No. Handphone / WhatsApp</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.noHp}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, noHp: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none font-mono"
                    placeholder="081234567890"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.namaOrtu}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, namaOrtu: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    placeholder="Nama orang tua / wali..."
                  />
                </div>
              </div>
            </div>

            {/* Bagian B: Data Fisik & Riwayat Kesehatan */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-300 pb-1">
                B. Keterangan Fisik & Kesehatan
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tinggi Badan (cm)</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.tinggiBadan}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, tinggiBadan: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none font-mono"
                    placeholder="165"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Berat Badan (kg)</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.beratBadan}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, beratBadan: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none font-mono"
                    placeholder="52"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Golongan Darah</label>
                  <select
                    value={formPolisiPelajar.golDarah}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, golDarah: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white font-bold"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                    <option value="-">-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Riwayat Alergi/Sakit</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.riwayatPenyakit}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, riwayatPenyakit: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    placeholder="Tidak ada"
                  />
                </div>
              </div>
            </div>

            {/* Bagian C: Motivasi & Prestasi */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-300 pb-1">
                C. Prestasi & Motivasi
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Prestasi yang Pernah Diraih</label>
                  <input
                    type="text"
                    value={formPolisiPelajar.prestasi}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, prestasi: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    placeholder="Prestasi akademik / non-akademik..."
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Alasan Ingin Bergabung Menjadi Polisi Pelajar</label>
                  <textarea
                    rows={2}
                    value={formPolisiPelajar.alasan}
                    onChange={e => setFormPolisiPelajar({ ...formPolisiPelajar, alasan: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none resize-none"
                    placeholder="Alasan motivasi..."
                  />
                </div>
              </div>
            </div>

            {/* Blok Tanda Tangan Resmi */}
            <div className="pt-6 border-t border-slate-300 text-xs text-center">
              <div className="text-right text-[11px] text-slate-500 mb-6">
                Majalengka, {new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold text-slate-600">Menyetujui,</p>
                  <p className="font-bold text-slate-800">Orang Tua / Wali Siswa</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Materai / Tanda Tangan)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {formPolisiPelajar.namaOrtu || '...........................................'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-800">Pembina PKS Sekolah</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Stempel Sekolah)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    ...........................................
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600">Pemohon,</p>
                  <p className="font-bold text-slate-800">Calon Anggota Polisi Pelajar</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Tanda Tangan Siswa)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {formPolisiPelajar.nama || '...........................................'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FORM 2: FORMULIR PENDAFTARAN CALON ANGGOTA PKS */}
        {/* ========================================================= */}
        {currentTab === 'form_calon_pks' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                FORMULIR PENDAFTARAN CALON ANGGOTA PATROLI KEAMANAN SEKOLAH (PKS)
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                KORPS PKS RESOR MAJALENGKA • TAHUN AJARAN 2026/2027
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-slate-300 pb-1">
                A. Data Biodata Calon Anggota PKS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    value={formCalonPks.nama}
                    onChange={e => setFormCalonPks({ ...formCalonPks, nama: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">NISN</label>
                  <input
                    type="text"
                    value={formCalonPks.nisn}
                    onChange={e => setFormCalonPks({ ...formCalonPks, nisn: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Pangkalan Sekolah</label>
                  <input
                    type="text"
                    value={formCalonPks.sekolah}
                    onChange={e => setFormCalonPks({ ...formCalonPks, sekolah: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Tingkat</label>
                    <select
                      value={formCalonPks.jenjang}
                      onChange={e => setFormCalonPks({ ...formCalonPks, jenjang: e.target.value as SchoolLevel })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                    >
                      <option value="SLTP">SLTP</option>
                      <option value="SLTA">SLTA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Kelas</label>
                    <input
                      type="text"
                      value={formCalonPks.kelas}
                      onChange={e => setFormCalonPks({ ...formCalonPks, kelas: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tempat, Tanggal Lahir</label>
                  <input
                    type="text"
                    value={formCalonPks.ttl}
                    onChange={e => setFormCalonPks({ ...formCalonPks, ttl: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Divisi Minat PKS</label>
                  <select
                    value={formCalonPks.divisiMinat}
                    onChange={e => setFormCalonPks({ ...formCalonPks, divisiMinat: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                  >
                    <option value="Gatur Lantas & Keselamatan Jalan">Gatur Lantas & Keselamatan Jalan</option>
                    <option value="PBB & Tata Upacara Bendera">PBB & Tata Upacara Bendera</option>
                    <option value="Keamanan & Ketertiban Lingkungan Sekolah">Keamanan & Ketertiban Lingkungan Sekolah</option>
                    <option value="Pertolongan Pertama (P3K) & SAR">Pertolongan Pertama (P3K) & SAR</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">Alamat Rumah Lengkap</label>
                  <input
                    type="text"
                    value={formCalonPks.alamat}
                    onChange={e => setFormCalonPks({ ...formCalonPks, alamat: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">No. WhatsApp Siswa</label>
                  <input
                    type="text"
                    value={formCalonPks.noHp}
                    onChange={e => setFormCalonPks({ ...formCalonPks, noHp: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Guru Pembina PKS</label>
                  <input
                    type="text"
                    value={formCalonPks.namaPembina}
                    onChange={e => setFormCalonPks({ ...formCalonPks, namaPembina: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Surat Pernyataan / Izin Ortu */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formCalonPks.izinOrtu}
                  onChange={e => setFormCalonPks({ ...formCalonPks, izinOrtu: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300"
                />
                <span className="text-slate-700 leading-relaxed">
                  <strong>Pernyataan Kesiapan:</strong> Dengan ini saya menyatakan bersedia mengikuti seluruh tahapan latihan dasar disiplin, mentaati Tri Siap dan Panca PKS, serta telah mendapatkan izin tertulis dari orang tua/wali untuk bergabung aktif dalam Korps PKS.
                </span>
              </label>
            </div>

            {/* Signature Block */}
            <div className="pt-6 border-t border-slate-300 text-xs text-center">
              <div className="text-right text-[11px] text-slate-500 mb-6">
                Majalengka, .................................... 2026
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold text-slate-600">Mengetahui Orang Tua,</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Tanda Tangan)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    ...........................................
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600">Pembina PKS Sekolah,</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Stempel & TTD)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {formCalonPks.namaPembina || '...........................................'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600">Calon Anggota PKS,</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Tanda Tangan)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {formCalonPks.nama || '...........................................'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FORM 3: FORMULIR PENDAFTARAN PERKEMAHAN PKS BALOK 1 */}
        {/* ========================================================= */}
        {currentTab === 'form_perkemahan_balok1' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                FORMULIR PENDAFTARAN PERKEMAHAN PKS BALOK 1
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                DIKLAT KADERISASI DASAR KEPOLISIAN SEKOLAH TINGKAT BALOK 1
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-slate-300 pb-1">
                A. Data Regu / Kontingen Sekolah
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Regu / Pleton</label>
                  <input
                    type="text"
                    value={formBalok1.namaRegu}
                    onChange={e => setFormBalok1({ ...formBalok1, namaRegu: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                    placeholder="Contoh: Regu Elang Sakti"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Pangkalan Asal Sekolah</label>
                  <input
                    type="text"
                    value={formBalok1.sekolah}
                    onChange={e => setFormBalok1({ ...formBalok1, sekolah: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Ketua Regu (Pinru)</label>
                  <input
                    type="text"
                    value={formBalok1.namaKetua}
                    onChange={e => setFormBalok1({ ...formBalok1, namaKetua: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Jumlah Anggota Regu</label>
                  <input
                    type="text"
                    value={formBalok1.jumlahAnggota}
                    onChange={e => setFormBalok1({ ...formBalok1, jumlahAnggota: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                    placeholder="12 Orang"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Pembina Pendamping</label>
                  <input
                    type="text"
                    value={formBalok1.namaPembina}
                    onChange={e => setFormBalok1({ ...formBalok1, namaPembina: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">No. Kontak WhatsApp Pembina</label>
                  <input
                    type="text"
                    value={formBalok1.noHpPembina}
                    onChange={e => setFormBalok1({ ...formBalok1, noHpPembina: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Lokasi Bumi Perkemahan</label>
                  <input
                    type="text"
                    value={formBalok1.lokasiPerkemahan}
                    onChange={e => setFormBalok1({ ...formBalok1, lokasiPerkemahan: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Jadwal Tanggal Pelaksanaan</label>
                  <input
                    type="text"
                    value={formBalok1.tanggalKegiatan}
                    onChange={e => setFormBalok1({ ...formBalok1, tanggalKegiatan: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">No. Surat Mandat / Izin Kepala Sekolah</label>
                  <input
                    type="text"
                    value={formBalok1.suratIzinKepsek}
                    onChange={e => setFormBalok1({ ...formBalok1, suratIzinKepsek: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none font-mono"
                    placeholder="Contoh: No. 421.3/089/SMPN1/2026"
                  />
                </div>
              </div>
            </div>

            {/* Checklist Kelengkapan Regu */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-1.5">
              <span className="font-bold text-emerald-950 block">Kelengkapan Wajib Peserta Kemah Balok 1:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Seragam Lengkap PKS & Rompi Gatur Lantas
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Perlengkapan Tenda & Kebersihan Regu
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Peluit & Tongkat Morse/PBB Lapangan
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Kotak P3K Regu Standar
                </span>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-6 border-t border-slate-300 text-xs text-center">
              <div className="text-right text-[11px] text-slate-500 mb-6">
                Majalengka, .................................... 2026
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold text-slate-600">Ketua Regu PKS,</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Tanda Tangan)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {formBalok1.namaKetua || '...........................................'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600">Pembina Pendamping,</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Tanda Tangan)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {formBalok1.namaPembina || '...........................................'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600">Mengetahui Kepala Sekolah,</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Stempel & TTD Kepsek)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    ...........................................
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* FORM 4: FORMULIR PENDAFTARAN PKS BALOK 2 */}
        {/* ========================================================= */}
        {currentTab === 'form_perkemahan_balok2' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">
                FORMULIR PENDAFTARAN PKS BALOK 2 (UJIAN INSTRUKTUR)
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                KUALIFIKASI INSTRUKTUR & PELATIH MUDA POLISI PELAJAR
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 border-b border-slate-300 pb-1">
                A. Data Calon Instruktur PKS Balok 2
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Nama Lengkap Peserta</label>
                  <input
                    type="text"
                    value={formBalok2.namaPeserta}
                    onChange={e => setFormBalok2({ ...formBalok2, namaPeserta: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Asal Sekolah</label>
                  <input
                    type="text"
                    value={formBalok2.sekolah}
                    onChange={e => setFormBalok2({ ...formBalok2, sekolah: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Jenjang</label>
                    <select
                      value={formBalok2.jenjang}
                      onChange={e => setFormBalok2({ ...formBalok2, jenjang: e.target.value as SchoolLevel })}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                    >
                      <option value="SLTA">SLTA (SMA/SMK)</option>
                      <option value="SLTP">SLTP (Tingkat Lanjut)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Kelas</label>
                    <input
                      type="text"
                      value={formBalok2.kelas}
                      onChange={e => setFormBalok2({ ...formBalok2, kelas: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Jabatan di Pleton / Unit</label>
                  <input
                    type="text"
                    value={formBalok2.jabatanPleton}
                    onChange={e => setFormBalok2({ ...formBalok2, jabatanPleton: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                    placeholder="Komandan Pleton / Senior"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">No. Sertifikat / Piagam Balok 1</label>
                  <input
                    type="text"
                    value={formBalok2.noSertifikatBalok1}
                    onChange={e => setFormBalok2({ ...formBalok2, noSertifikatBalok1: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                    placeholder="Contoh: PKS-B1/POLRES/2025/084"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Tahun Kelulusan Balok 1</label>
                  <input
                    type="text"
                    value={formBalok2.tahunKelulusanBalok1}
                    onChange={e => setFormBalok2({ ...formBalok2, tahunKelulusanBalok1: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono outline-none"
                    placeholder="2025"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">Materi Uji Kualifikasi yang Diajukan</label>
                  <input
                    type="text"
                    value={formBalok2.materiUji}
                    onChange={e => setFormBalok2({ ...formBalok2, materiUji: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-bold mb-1">Rekomendasi Satlantas / Unit Dikmas</label>
                  <input
                    type="text"
                    value={formBalok2.rekomendasiSatlantas}
                    onChange={e => setFormBalok2({ ...formBalok2, rekomendasiSatlantas: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-6 border-t border-slate-300 text-xs text-center">
              <div className="text-right text-[11px] text-slate-500 mb-6">
                Majalengka, .................................... 2026
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="font-semibold text-slate-600">Peserta Ujian Balok 2,</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Tanda Tangan)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {formBalok2.namaPeserta || '...........................................'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600">Pembina PKS Pangkalan,</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Stempel & TTD)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {formBalok2.namaPembina || '...........................................'}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-600">Tim Penguji Satlantas Polri,</p>
                  <div className="h-16 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Tanda Tangan Penguji)
                  </div>
                  <p className="font-bold underline text-slate-900">
                    ...........................................
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
