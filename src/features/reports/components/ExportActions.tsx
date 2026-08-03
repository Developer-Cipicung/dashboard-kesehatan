import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, Loader2 } from 'lucide-react'
import { exportWargaToExcel } from '../utils/exportExcel'
import { toast } from 'sonner'
import { ReportPemeriksaanItem } from '../types/reportPemeriksaan'

interface ExportActionsProps {
  isLoading: boolean
  kategoriFilter: string
  filteredData: ReportPemeriksaanItem[]
  fileNamePrefix?: string
}

export function ExportActions({ isLoading, kategoriFilter, filteredData, fileNamePrefix }: ExportActionsProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportExcel = async () => {
    try {
      setIsExporting(true)
      const now = new Date()
      const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
      const filename = fileNamePrefix ? `${fileNamePrefix}_${dateStr}.xlsx` : `Laporan_${kategoriFilter}_${dateStr}.xlsx`
      await exportWargaToExcel([], filename, filteredData, kategoriFilter)
      toast.success('Laporan Excel berhasil diunduh.')
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengekspor Excel.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row sm:gap-3">
      <Button 
        variant="default"
        onClick={handleExportExcel}
        disabled={isLoading || isExporting}
        className="w-full bg-green-600 text-xs text-white hover:bg-green-700 sm:w-auto sm:text-sm"
      >
        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
        {isExporting ? 'Memproses...' : 'Download Excel'}
      </Button>
    </div>
  )
}
