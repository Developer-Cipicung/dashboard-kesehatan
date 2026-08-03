import { ArrowLeft, BookOpen, LogIn, LayoutDashboard, UserPlus, ClipboardList, Printer, CheckSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

export function TutorialPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link to="/login" className={buttonVariants({ variant: "ghost", size: "icon", className: "shrink-0 -ml-2 text-slate-600 hover:text-slate-900" })}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-bold text-slate-800 leading-tight">
              Panduan Penggunaan Sistem
            </h1>
            <p className="text-sm text-slate-500">
              Dokumen Standard Operating Procedure (SOP) Posyandu Cipicung
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="shrink-0 bg-primary/10 p-4 rounded-2xl border border-primary/20 shadow-inner">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-3">
              <div className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                Dokumen Resmi Desa
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Panduan Lengkap Penggunaan Sistem
              </h2>
              <p className="text-slate-600 text-base md:text-md leading-relaxed max-w-2xl">
                Dokumen ini merupakan panduan resmi langkah demi langkah (Standard Operating Procedure) dalam menggunakan seluruh fitur pada Dashboard Kesehatan Cipicung bagi Kader Posyandu.
              </p>
            </div>
          </div>
        </div>

        {/* Bab 1: Autentikasi (Login) */}
        <Card className="border-l-4 border-l-blue-600 shadow-md border-t-0 border-r-0 border-b-0">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LogIn className="h-5 w-5 text-blue-700" />
              </div>
              <CardTitle className="text-lg">1. Proses Autentikasi (Login)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>Untuk mengakses sistem, pengguna diwajibkan melakukan proses autentikasi guna memastikan keamanan data rekam medis.</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Buka tautan aplikasi melalui peramban (browser) web pada komputer atau perangkat seluler.</li>
              <li>Sistem akan mengarahkan pengguna ke Halaman Autentikasi secara otomatis.</li>
              <li>Masukkan <strong>Nama Pengguna</strong> yang telah terdaftar secara resmi di sistem.</li>
              <li>Masukkan <strong>Kata Sandi (Password)</strong> yang telah diberikan oleh Ibu Bidan.</li>
              <li>Klik tombol <strong>Masuk Sekarang</strong>.</li>
              <li>Apabila data yang dimasukkan valid, pengguna akan langsung dialihkan ke Halaman Beranda (Dashboard) yang disesuaikan dengan hak akses masing-masing.</li>
            </ol>
            <div className="mt-4 bg-slate-100 border p-3 rounded flex gap-3">
              <p className="text-xs text-slate-600">
                <strong>Catatan:</strong> Apabila pengguna mengalami kendala akses atau lupa kata sandi, harap segera melaporkan hal tersebut kepada Ibu Bidan untuk permohonan pengaturan ulang (reset) sandi.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bab 2: Navigasi & Beranda */}
        <Card className="border-l-4 border-l-emerald-600 shadow-md border-t-0 border-r-0 border-b-0">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-emerald-700" />
              </div>
              <CardTitle className="text-lg">2. Tinjauan Beranda (Dashboard) & Navigasi Utama</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>Halaman Beranda menyajikan ringkasan data demografis yang dikelola oleh masing-masing pengguna secara real-time.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Panel Statistik:</strong> Menampilkan jumlah kumulatif warga berdasarkan kelompok sasaran kesehatan (Ibu Hamil, Balita, Baduta, Lansia, dan Pasca Persalinan).</li>
              <li><strong>Navigasi Menu Utama (Desktop):</strong> Terletak pada panel sebelah kiri (Sidebar). Memuat tautan navigasi ke seluruh modul yang tersedia dalam sistem.</li>
              <li><strong>Navigasi Perangkat Seluler (Speed Dial):</strong> Khusus pada antarmuka perangkat pintar genggam, navigasi utama dapat dipanggil melalui tombol mengambang berlambang kisi (grid) pada sudut kanan bawah layar.</li>
              <li><strong>Daftar Keseluruhan Warga:</strong> Tabel interaktif pada layar utama yang menampilkan direktori warga. Dilengkapi dengan instrumen pencarian spesifik berbasis penamaan.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Bab 3: Pendaftaran Warga Baru */}
        <Card className="border-l-4 border-l-violet-600 shadow-md border-t-0 border-r-0 border-b-0">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <UserPlus className="h-5 w-5 text-violet-700" />
              </div>
              <CardTitle className="text-lg">3. Pendaftaran Data Warga (Pasien) Baru</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>Modul pendaftaran digunakan untuk mengintegrasikan warga baru ke dalam basis data sistem Posyandu secara terstruktur.</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Arahkan navigasi menuju modul pendaftaran atau tabel daftar warga, lalu klik tombol <strong>+ Input Data Baru</strong>.</li>
              <li>Sistem akan menyajikan antarmuka formulir pendaftaran.</li>
              <li>Tetapkan <strong>Kategori Warga</strong> (Balita, Ibu Hamil, dsb). Parameter ini akan mempengaruhi jenis data pemeriksaan yang relevan.</li>
              <li>Lengkapi seluruh instrumen wajib yang meliputi <strong>Nama Lengkap</strong>, <strong>Jenis Kelamin</strong>, dan <strong>Tanggal Lahir</strong>.</li>
              <li><em>Khusus Kategori Ibu Hamil:</em> Lengkapi metrik Hari Pertama Haid Terakhir (HPHT) guna kalkulasi masa gestasi.</li>
              <li>Pengguna didorong untuk melengkapi parameter pelengkap administrasi penduduk (opsional) seperti NIK, Nomor Kartu Keluarga, Nama Orang Tua, Alamat Domisili, dan Kontak Telepon untuk validitas pelaporan.</li>
              <li>Klik tombol <strong>Simpan</strong>. Entri data akan ditambahkan dan tersinkronisasi.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Bab 4: Pencatatan Rekam Medis Bulanan */}
        <Card className="border-l-4 border-l-rose-600 shadow-md border-t-0 border-r-0 border-b-0">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <ClipboardList className="h-5 w-5 text-rose-700" />
              </div>
              <CardTitle className="text-lg">4. Pencatatan Pemeriksaan & Penimbangan Bulanan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>Modul utama operasional Posyandu yang dirancang untuk merekam jejak aktivitas antropometri, intervensi medis dasar, serta asupan nutrisi berkala setiap sasaran.</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Manfaatkan fitur pencarian pada tabel warga guna mengidentifikasi warga sasaran.</li>
              <li>Klik indikator nama warga tersebut atau klik tombol ikon <strong>Riwayat</strong> (ikon berbentuk lembar data) yang terletak pada kolom aksi di barisan yang sama.</li>
              <li>Pengguna akan disalurkan pada antarmuka detail Profil & Rekam Medis.</li>
              <li>Arahkan penunjuk ke tabulasi <strong>Pendataan Bulanan</strong>.</li>
              <li>Inisiasi pencatatan dengan menekan instrumen <strong>+ Tambah Data</strong>.</li>
              <li>Masukkan indikator ukur berdasarkan pemeriksaan fisik: Berat Badan (kg), Tinggi/Panjang Badan (cm), Lingkar Kepala (cm), serta Lingkar Lengan Atas (cm).</li>
              <li>Input parameter intervensi spesifik jika dilaksanakan pada hari observasi, misal: Pemberian Vitamin, Administrasi Imunisasi, atau dokumentasi keluhan kesehatan klinis.</li>
              <li>Lakukan penekanan pada tombol <strong>Simpan</strong> untuk meregistrasikan histori pemeriksaan bulan berjalan.</li>
            </ol>
          </CardContent>
        </Card>

        {/* Bab 5: Verifikasi & Pemantauan Data */}
        <Card className="border-l-4 border-l-orange-600 shadow-md border-t-0 border-r-0 border-b-0">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckSquare className="h-5 w-5 text-orange-700" />
              </div>
              <CardTitle className="text-lg">5. Verifikasi Pemeriksaan & Status Pendataan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>Untuk memastikan kredibilitas agregat data kesehatan desa, sistem memformulasikan alur Quality Control (QC) bagi pendataan bulanan.</p>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-slate-900 border-b pb-1 mb-2">A. Modul Status Pendataan</h4>
                <ul className="list-disc pl-5">
                  <li>Akses menu <strong>Status Pendataan</strong> pada navigasi vertikal/speed dial.</li>
                  <li>Modul ini menerbitkan metrik performa operasional tiap Posyandu dengan menyoroti rasio warga sasaran yang telah berpartisipasi (terdata) berbanding lurus dengan warga yang belum mendapat penanganan pada satu siklus pelaporan (bulan) tertentu.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 border-b pb-1 mb-2">B. Modul Verifikasi Pendataan</h4>
                <ul className="list-disc pl-5">
                  <li>Akses menu <strong>Verifikasi Pendataan</strong>.</li>
                  <li>Diperuntukkan untuk proses kurasi; di mana entitas pengawas (Kader senior atau Ibu Bidan) diinstruksikan guna meninjau entri data yang baru diserahkan oleh Kader lain, menghindari input yang tidak lazim secara matematis, sebelum disetujui (verifikasi) ke dalam pelaporan resmi ke tingkat desa atau fasilitas kesehatan rujukan.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bab 6: Pelaporan & Kartu Medis */}
        <Card className="border-l-4 border-l-teal-600 shadow-md border-t-0 border-r-0 border-b-0 mb-10">
          <CardHeader className="pb-3 border-b bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Printer className="h-5 w-5 text-teal-700" />
              </div>
              <CardTitle className="text-lg">6. Modul Pelaporan dan Pembuatan Kartu Menuju Sehat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>Sistem ini mentransformasi birokrasi manual dengan mekanisme pelaporan otomatis serta percetakan dokumen yang berorientasi pada kemudahan diseminasi.</p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-slate-900 border-b pb-1 mb-2">A. Penerbitan Kartu Posyandu Individu</h4>
                <ol className="list-decimal pl-5">
                  <li>Buka halaman Profil dan Riwayat Rekam Medis milik partisipan terkait.</li>
                  <li>Klik tombol fungsi <strong>Cetak Kartu</strong> pada wilayah tajuk (header) nama warga.</li>
                  <li>Sistem menyuguhkan visualisasi tata letak Kartu Menuju Sehat (KMS) digital. Berkas ini siap untuk dicetak pada media kertas standar atau disimpan dalam ekstensi PDF untuk di-retribusi secara elektronik.</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 border-b pb-1 mb-2">B. Rekapitulasi Laporan Bulanan Terpadu</h4>
                <ol className="list-decimal pl-5">
                  <li>Akses direktori <strong>Laporan</strong>.</li>
                  <li>Tentukan rentang filter pada menu jatuh ke bawah (dropdown) untuk meninjau pencapaian pada suatu bulan historis.</li>
                  <li>Antarmuka secara langsung mengompilasi statistik krusial termasuk: Derajat Partisipasi, Deteksi Dini Gejala Stunting, maupun Distribusi Layanan Imunisasi.</li>
                  <li>Lakukan aktivasi tombol <strong>Cetak/Download</strong> untuk mengonversi data-data tersebut ke format lapor administratif yang formal.</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
