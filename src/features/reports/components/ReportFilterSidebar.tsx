import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  kategori: string;
  subFilters: Record<string, string>;
  setSubFilters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function ReportFilterSidebar({ isOpen, onClose, kategori, subFilters, setSubFilters }: ReportFilterSidebarProps) {
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleChange = (key: string, value: string) => {
    setSubFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderSelect = (key: string, label: string, options: { value: string, label: string }[]) => (
    <div className="mb-3 flex flex-col gap-1.5 sm:mb-4 sm:gap-2">
      <label className="text-xs font-semibold text-slate-700 sm:text-sm">{label}</label>
      <select
        value={subFilters[key] || ''}
        onChange={(e) => handleChange(key, e.target.value)}
        className="h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary sm:h-10"
      >
        <option value="">Semua Status</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  let filtersContent = null;

  const globalFilters = (
    <>
      {renderSelect('status_periksa', 'Status Pemeriksaan', [
        { value: 'sudah', label: 'Sudah Diperiksa' },
        { value: 'belum', label: 'Belum Diperiksa' },
      ])}
      <hr className="my-4 border-slate-200" />
    </>
  );

  if (kategori === 'bumil') {
    filtersContent = (
      <>
        {renderSelect('trimester', '1. Trimester', [
          { value: '1', label: 'Trimester 1 (0-13 mgg)' },
          { value: '2', label: 'Trimester 2 (14-27 mgg)' },
          { value: '3', label: 'Trimester 3 (28+ mgg)' },
        ])}
        {renderSelect('anemia', '2. Status Anemia', [
          { value: 'normal', label: 'Normal' },
          { value: 'ringan', label: 'Anemia Ringan' },
          { value: 'berat', label: 'Anemia Berat' },
        ])}
        {renderSelect('kek', '3. Status KEK', [
          { value: 'normal', label: 'Normal' },
          { value: 'kek', label: 'Risiko KEK (< 23.5 cm)' },
        ])}
        {renderSelect('kie', '4. KIE', [
          { value: 'ya', label: 'Diberikan' },
          { value: 'tidak', label: 'Tidak Diberikan' },
        ])}

      </>
    );
  } else if (kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan') {
    filtersContent = (
      <>

        {renderSelect('tensi', '2. Tekanan Darah', [
          { value: 'hipotensi', label: 'Hipotensi' },
          { value: 'normal', label: 'Normal' },
          { value: 'prahipertensi', label: 'Prahipertensi' },
          { value: 'hipertensi', label: 'Hipertensi' },
        ])}
        {renderSelect('kie', '3. KIE', [
          { value: 'ya', label: 'Diberikan' },
          { value: 'tidak', label: 'Tidak Diberikan' },
        ])}
      </>
    );
  } else if (kategori === 'balita' || kategori === 'baduta') {
    filtersContent = (
      <>
        {renderSelect('gizi', '1. Status Gizi (BB/TB)', [
          { value: 'baik', label: 'Gizi Baik' },
          { value: 'kurang', label: 'Gizi Kurang/Buruk' },
          { value: 'lebih', label: 'Gizi Lebih/Obesitas' },
        ])}
        {renderSelect('tinggi', '2. Tinggi (TB/U)', [
          { value: 'normal', label: 'Normal' },
          { value: 'pendek', label: 'Pendek (Stunting)' },
          { value: 'tinggi', label: 'Tinggi' },
        ])}
        {renderSelect('berat', '3. Berat (BB/U)', [
          { value: 'normal', label: 'Normal' },
          { value: 'kurang', label: 'BB Kurang' },
          { value: 'lebih', label: 'BB Lebih' },
        ])}
        {renderSelect('imunisasi', '4. Imunisasi', [
          { value: 'HB0', label: 'HB0' },
          { value: 'BCG', label: 'BCG' },
          { value: 'POLIO1', label: 'POLIO 1' },
          { value: 'POLIO2', label: 'POLIO 2' },
          { value: 'POLIO3', label: 'POLIO 3' },
          { value: 'POLIO4', label: 'POLIO 4' },
          { value: 'ROTAVIRUS 1', label: 'ROTAVIRUS 1' },
          { value: 'ROTAVIRUS 2', label: 'ROTAVIRUS 2' },
          { value: 'ROTAVIRUS 3', label: 'ROTAVIRUS 3' },
          { value: 'DPT 1', label: 'DPT 1' },
          { value: 'DPT 2', label: 'DPT 2' },
          { value: 'DPT 3', label: 'DPT 3' },
          { value: 'PCV 1', label: 'PCV 1' },
          { value: 'PCV 2', label: 'PCV 2' },
          { value: 'PCV 3', label: 'PCV 3' },
          { value: 'IPV 1', label: 'IPV 1' },
          { value: 'IPV 2', label: 'IPV 2' },
          { value: 'MR(CAMPAK)', label: 'MR(CAMPAK)' },
          { value: 'BOSTER DPT', label: 'BOSTER DPT' },
          { value: 'BOSTER MR(CAMPAK)', label: 'BOSTER MR(CAMPAK)' },
        ])}
      </>
    );
  } else if (kategori === 'lansia') {
    filtersContent = (
      <>
        {renderSelect('tensi', '1. Status Tekanan Darah', [
          { value: 'hipotensi', label: 'Hipotensi' },
          { value: 'normal', label: 'Normal' },
          { value: 'prahipertensi', label: 'Prahipertensi' },
          { value: 'hipertensi', label: 'Hipertensi' },
        ])}
        {renderSelect('gula_darah', '2. Gula Darah Sewaktu', [
          { value: 'normal', label: 'Normal' },
          { value: 'tinggi', label: 'Tinggi' },
        ])}

        {renderSelect('kolesterol', '4. Kolesterol', [
          { value: 'normal', label: 'Normal' },
          { value: 'tinggi', label: 'Tinggi' },
        ])}
        {renderSelect('asam_urat', '5. Asam Urat', [
          { value: 'normal', label: 'Normal' },
          { value: 'tinggi', label: 'Tinggi' },
        ])}
      </>
    );
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 transition-opacity" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Panel */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`fixed inset-x-2 bottom-2 z-[60] flex max-h-[calc(100dvh-1rem)] w-auto flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:bottom-auto sm:h-dvh sm:max-h-dvh sm:w-[420px] sm:max-w-[calc(100vw-2rem)] sm:rounded-none sm:border-l md:w-[440px] lg:w-[460px] ${
          isOpen ? 'translate-y-0 sm:translate-x-0' : 'translate-y-[calc(100%+1rem)] sm:translate-y-0 sm:translate-x-full'
        }`}
      >
        <div className="shrink-0 border-b px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold leading-tight sm:text-xl">Filter Data {kategori.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
            <p className="mt-1 text-xs leading-snug text-slate-500 sm:text-sm">Atur filter untuk menampilkan data yang dibutuhkan.</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-100 sm:h-9 sm:w-9">
            <X className="h-4 w-4 text-slate-500 sm:h-5 sm:w-5" />
          </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6">
          <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/70 p-3 text-xs leading-snug text-emerald-800">
            Filter ini akan berlaku untuk tabel, Cetak Visum, dan Download Excel.
          </div>
          {globalFilters}
        {filtersContent}
          
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 border-t bg-white px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
          <Button variant="outline" className="w-full text-xs sm:text-sm" onClick={onClose}>
            Batal
          </Button>
          <Button className="w-full bg-green-600 text-xs text-white hover:bg-green-700 sm:text-sm" onClick={onClose}>
            Terapkan Filter
          </Button>
        </div>
      </div>
    </>
  );
}
