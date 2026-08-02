import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PatientToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onAddPatient: () => void
  title: string
  totalPatients: number
  isReadOnly?: boolean
  onImportHealth?: () => void
}

export function PatientToolbar({
  searchQuery,
  onSearchChange,
  onAddPatient,
  title,
  totalPatients,
  isReadOnly,
  onImportHealth,
}: PatientToolbarProps) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[28px] font-bold text-slate-800 leading-tight">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{totalPatients} pasien terdaftar</p>
        </div>
        {!isReadOnly && (
          <div className="flex flex-col min-[400px]:flex-row gap-2 w-full md:w-auto shrink-0">
            <Button onClick={onAddPatient} className="bg-primary hover:bg-primary/90 text-white rounded-lg shadow-sm flex-1 h-9 md:h-10 text-xs md:text-sm">
              <Plus className="mr-1.5 h-3.5 w-3.5 md:h-4 md:w-4" />
              Input Baru
            </Button>
            <Button onClick={onImportHealth} variant="outline" className="text-xs h-9 md:h-10 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg shadow-sm flex-1 whitespace-nowrap px-3">
              Import e-PPGBM
            </Button>
          </div>
        )}
      </div>

      <div className="relative w-full md:w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Cari nama atau NIK..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 py-6 border-slate-200 rounded-xl shadow-sm text-base focus-visible:ring-primary"
        />
      </div>
    </div>
  )
}
