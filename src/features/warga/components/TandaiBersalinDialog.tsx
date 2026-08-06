import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTandaiBersalin, useTandaiAbortus } from '../hooks/useWarga'
import { Baby, Activity, ArrowLeft } from 'lucide-react'

interface TandaiBersalinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wargaId: string | null
  wargaPosyanduId?: string
  wargaName?: string
}

type StepMode = 'select' | 'bersalin' | 'abortus'

export function TandaiBersalinDialog({ open, onOpenChange, wargaId, wargaPosyanduId, wargaName }: TandaiBersalinDialogProps) {
  const { mutateAsync: tandaiBersalin, isPending: isBersalinPending } = useTandaiBersalin()
  const { mutateAsync: tandaiAbortus, isPending: isAbortusPending } = useTandaiAbortus()

  const [mode, setMode] = useState<StepMode>('select')
  
  // State for Melahirkan / Bersalin
  const [tanggalPersalinan, setTanggalPersalinan] = useState(new Date().toISOString().split('T')[0])
  const [tempatPersalinan, setTempatPersalinan] = useState('')
  const [hasNamaBayi, setHasNamaBayi] = useState(false)
  const [namaBayi, setNamaBayi] = useState('')
  const [jenisKelaminBayi, setJenisKelaminBayi] = useState<'L' | 'P'>('L')
  const [namaAyah, setNamaAyah] = useState('')

  // State for Abortus / Keguguran
  const [tanggalAbortus, setTanggalAbortus] = useState(new Date().toISOString().split('T')[0])
  const [tempatPenanganan, setTempatPenanganan] = useState('')
  const [catatanAbortus, setCatatanAbortus] = useState('')

  const handleReset = () => {
    setMode('select')
    setTanggalPersalinan(new Date().toISOString().split('T')[0])
    setTempatPersalinan('')
    setHasNamaBayi(false)
    setNamaBayi('')
    setJenisKelaminBayi('L')
    setNamaAyah('')
    setTanggalAbortus(new Date().toISOString().split('T')[0])
    setTempatPenanganan('')
    setCatatanAbortus('')
  }

  const handleSubmitBersalin = async () => {
    if (!wargaId || !tanggalPersalinan) return

    try {
      await tandaiBersalin({
        id: wargaId,
        payload: {
          tanggal_persalinan: tanggalPersalinan,
          tempat_persalinan: tempatPersalinan || '-',
          nama_bayi: hasNamaBayi ? (namaBayi || '-') : `Anak ${wargaName || 'Ibu'}`,
          jenis_kelamin_bayi: jenisKelaminBayi,
          nama_ayah: namaAyah || '-'
        },
        posyanduId: wargaPosyanduId
      })
      onOpenChange(false)
      handleReset()
    } catch (error) {
      console.error('Error menyimpan status bersalin:', (error as any).message || error)
    }
  }

  const handleSubmitAbortus = async () => {
    if (!wargaId || !tanggalAbortus) return

    try {
      await tandaiAbortus({
        id: wargaId,
        payload: {
          tanggal_abortus: tanggalAbortus,
          tempat_penanganan: tempatPenanganan || undefined,
          catatan: catatanAbortus || undefined
        },
        posyanduId: wargaPosyanduId
      })
      onOpenChange(false)
      handleReset()
    } catch (error) {
      console.error('Error menyimpan status abortus:', (error as any).message || error)
    }
  }

  const isPending = isBersalinPending || isAbortusPending

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) handleReset()
    }}>
      <DialogContent className="max-w-[420px] sm:max-w-md">
        {mode === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle>Selesai Masa Kehamilan</DialogTitle>
              <DialogDescription>
                Pilih kondisi penghentian kehamilan untuk ibu {wargaName ? <strong>{wargaName}</strong> : 'ini'}:
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 grid grid-cols-1 gap-2 sm:mt-4 sm:gap-3">
              <button
                onClick={() => setMode('bersalin')}
                className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-primary hover:bg-primary/5 sm:gap-4 sm:p-4 group"
              >
                <div className="bg-white shadow-sm p-2 rounded-full border border-slate-100 group-hover:bg-primary/10">
                  <Baby className="w-5 h-5 text-pink-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800 text-base">Melahirkan / Bersalin</span>
                  <span className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Bayi lahir selamat/hidup. Memindahkan ibu ke Pasca Persalinan & mendaftarkan data bayi.
                  </span>
                </div>
              </button>

              <button
                onClick={() => setMode('abortus')}
                className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-rose-300 hover:bg-rose-50/50 sm:gap-4 sm:p-4 group"
              >
                <div className="bg-white shadow-sm p-2 rounded-full border border-slate-100 group-hover:bg-rose-100">
                  <Activity className="w-5 h-5 text-rose-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800 text-base">Keguguran / Abortus</span>
                  <span className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Kehamilan terhenti sebelum waktunya. Menutup kehamilan & mencatat riwayat medis ibu.
                  </span>
                </div>
              </button>
            </div>

            <DialogFooter className="mt-4 border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
                Batal
              </Button>
            </DialogFooter>
          </>
        )}

        {mode === 'bersalin' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-slate-500 hover:text-slate-900" 
                  onClick={() => setMode('select')}
                  disabled={isPending}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle>Form Data Persalinan</DialogTitle>
              </div>
              <DialogDescription>
                Lengkapi data kelahiran bayi untuk ibu {wargaName ? <strong>{wargaName}</strong> : ''}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 sm:space-y-4 sm:py-4">
              <div className="space-y-2">
                <label htmlFor="tanggal_persalinan" className="text-sm font-medium leading-none">
                  Tanggal Persalinan <span className="text-red-500">*</span>
                </label>
                <input
                  id="tanggal_persalinan"
                  type="date"
                  value={tanggalPersalinan}
                  onChange={(e) => setTanggalPersalinan(e.target.value)}
                  className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tempat_persalinan" className="text-sm font-medium leading-none">
                  Tempat Persalinan
                </label>
                <input
                  id="tempat_persalinan"
                  type="text"
                  value={tempatPersalinan}
                  onChange={(e) => setTempatPersalinan(e.target.value)}
                  placeholder="Contoh: RSUD / Puskesmas / Rumah Bidan"
                  className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="has_nama_bayi"
                    checked={hasNamaBayi}
                    onChange={(e) => {
                      setHasNamaBayi(e.target.checked)
                      if (!e.target.checked) setNamaBayi('')
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <label htmlFor="has_nama_bayi" className="text-sm font-medium leading-none text-slate-700 cursor-pointer">
                    Apakah bayi sudah memiliki nama?
                  </label>
                </div>
                
                {hasNamaBayi && (
                  <div className="pt-1 space-y-2">
                    <label htmlFor="nama_bayi" className="text-sm font-medium leading-none">
                      Nama Bayi
                    </label>
                    <input
                      id="nama_bayi"
                      type="text"
                      value={namaBayi}
                      onChange={(e) => setNamaBayi(e.target.value)}
                      placeholder="Masukkan nama bayi..."
                      className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="jenis_kelamin_bayi" className="text-sm font-medium leading-none">
                  Jenis Kelamin Bayi
                </label>
                <select
                  id="jenis_kelamin_bayi"
                  value={jenisKelaminBayi}
                  onChange={(e) => setJenisKelaminBayi(e.target.value as 'L' | 'P')}
                  className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="nama_ayah" className="text-sm font-medium leading-none">
                  Nama Ayah
                </label>
                <input
                  id="nama_ayah"
                  type="text"
                  value={namaAyah}
                  onChange={(e) => setNamaAyah(e.target.value)}
                  placeholder="Kosongkan jika tidak tahu"
                  className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base"
                />
              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
              <Button variant="outline" onClick={() => setMode('select')} disabled={isPending}>
                Kembali
              </Button>
              <Button 
                onClick={handleSubmitBersalin}
                disabled={!tanggalPersalinan || isPending}
              >
                {isPending ? 'Menyimpan...' : 'Simpan & Pindahkan'}
              </Button>
            </DialogFooter>
          </>
        )}

        {mode === 'abortus' && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-slate-500 hover:text-slate-900" 
                  onClick={() => setMode('select')}
                  disabled={isPending}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <DialogTitle>Form Catatan Abortus / Keguguran</DialogTitle>
              </div>
              <DialogDescription>
                Catat riwayat kejadian abortus untuk ibu {wargaName ? <strong>{wargaName}</strong> : ''}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 sm:space-y-4 sm:py-4">
              <div className="space-y-2">
                <label htmlFor="tanggal_abortus" className="text-sm font-medium leading-none">
                  Tanggal Abortus / Kejadian <span className="text-red-500">*</span>
                </label>
                <input
                  id="tanggal_abortus"
                  type="date"
                  value={tanggalAbortus}
                  onChange={(e) => setTanggalAbortus(e.target.value)}
                  className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tempat_penanganan" className="text-sm font-medium leading-none">
                  Tempat Penanganan Medis
                </label>
                <input
                  id="tempat_penanganan"
                  type="text"
                  value={tempatPenanganan}
                  onChange={(e) => setTempatPenanganan(e.target.value)}
                  placeholder="Contoh: RSUD / Puskesmas / Klinik Mandiri"
                  className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="catatan_abortus" className="text-sm font-medium leading-none">
                  Catatan Medis / Keterangan Tambahan
                </label>
                <textarea
                  id="catatan_abortus"
                  rows={3}
                  value={catatanAbortus}
                  onChange={(e) => setCatatanAbortus(e.target.value)}
                  placeholder="Catatan kondisi ibu pasca abortus atau tindakan kuretase/konseling..."
                  className="flex w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
              <Button variant="outline" onClick={() => setMode('select')} disabled={isPending}>
                Kembali
              </Button>
              <Button 
                onClick={handleSubmitAbortus}
                disabled={!tanggalAbortus || isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isPending ? 'Menyimpan...' : 'Simpan Status Abortus'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
