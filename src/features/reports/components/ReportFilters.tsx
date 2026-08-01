import { Dispatch, SetStateAction } from 'react';

interface ReportFiltersProps {
  kategori: string;
  subFilters: Record<string, string>;
  setSubFilters: Dispatch<SetStateAction<Record<string, string>>>;
}

export function ReportFilters({ kategori, subFilters, setSubFilters }: ReportFiltersProps) {
  const handleChange = (key: string, value: string) => {
    setSubFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderSelect = (key: string, label: string, options: { value: string, label: string }[]) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
      <select
        value={subFilters[key] || ''}
        onChange={(e) => handleChange(key, e.target.value)}
        className="h-9 px-3 text-sm rounded-md border border-input bg-background"
      >
        <option value="">Semua</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  if (kategori === 'bumil') {
    return (
      <div className="flex flex-wrap gap-4 mt-4 bg-slate-50 p-4 rounded-lg border">
        {renderSelect('trimester', 'Trimester', [
          { value: '1', label: 'Trimester 1 (0-13 mgg)' },
          { value: '2', label: 'Trimester 2 (14-27 mgg)' },
          { value: '3', label: 'Trimester 3 (28+ mgg)' },
        ])}
        {renderSelect('anemia', 'Status Anemia', [
          { value: 'normal', label: 'Normal' },
          { value: 'anemia', label: 'Anemia (< 11 Hb)' },
        ])}
        {renderSelect('kek', 'Status KEK', [
          { value: 'normal', label: 'Normal' },
          { value: 'kek', label: 'Risiko KEK (< 23.5 cm)' },
        ])}
        {renderSelect('kie', 'KIE', [
          { value: 'ya', label: 'Diberikan' },
          { value: 'tidak', label: 'Tidak Diberikan' },
        ])}
      </div>
    );
  }

  if (kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan') {
    return (
      <div className="flex flex-wrap gap-4 mt-4 bg-slate-50 p-4 rounded-lg border">

        {renderSelect('tensi', 'Tekanan Darah', [
          { value: 'hipotensi', label: 'Hipotensi' },
          { value: 'normal', label: 'Normal' },
          { value: 'prahipertensi', label: 'Prahipertensi' },
          { value: 'hipertensi', label: 'Hipertensi' },
        ])}
        {renderSelect('kie', 'KIE', [
          { value: 'ya', label: 'Diberikan' },
          { value: 'tidak', label: 'Tidak Diberikan' },
        ])}
      </div>
    );
  }

  if (kategori === 'balita' || kategori === 'baduta') {
    return (
      <div className="flex flex-wrap gap-4 mt-4 bg-slate-50 p-4 rounded-lg border">
        {renderSelect('gizi', 'Status Gizi (BB/TB)', [
          { value: 'baik', label: 'Gizi Baik' },
          { value: 'kurang', label: 'Gizi Kurang/Buruk' },
          { value: 'lebih', label: 'Gizi Lebih/Obesitas' },
        ])}
        {renderSelect('tinggi', 'Tinggi (TB/U)', [
          { value: 'normal', label: 'Normal' },
          { value: 'pendek', label: 'Pendek (Stunting)' },
          { value: 'tinggi', label: 'Tinggi' },
        ])}
        {renderSelect('berat', 'Berat (BB/U)', [
          { value: 'normal', label: 'Normal' },
          { value: 'kurang', label: 'BB Kurang' },
          { value: 'lebih', label: 'BB Lebih' },
        ])}
      </div>
    );
  }

  if (kategori === 'lansia') {
    return (
      <div className="flex flex-wrap gap-4 mt-4 bg-slate-50 p-4 rounded-lg border">

        {renderSelect('tensi', 'Tekanan Darah', [
          { value: 'hipotensi', label: 'Hipotensi' },
          { value: 'normal', label: 'Normal' },
          { value: 'prahipertensi', label: 'Prahipertensi' },
          { value: 'hipertensi', label: 'Hipertensi' },
        ])}
      </div>
    );
  }

  return null;
}
