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
import { useTandaiBersalin } from '../hooks/useWarga'

interface TandaiBersalinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wargaId: string | null
  wargaName?: string
}

export function TandaiBersalinDialog({ open, onOpenChange, wargaId, wargaName }: TandaiBersalinDialogProps) {
  const { mutateAsync: tandaiBersalin, isPending } = useTandaiBersalin()
  
  const [tanggalPersalinan, setTanggalPersalinan] = useState(new Date().toISOString().split('T')[0])
  const [tempatPersalinan, setTempatPersalinan] = useState('')
  const [hasNamaBayi, setHasNamaBayi] = useState(false)
  const [namaBayi, setNamaBayi] = useState('')
  const [jenisKelaminBayi, setJenisKelaminBayi] = useState<'L' | 'P'>('L')
  const [namaAyah, setNamaAyah] = useState('')

  const handleReset = () => {
    setTanggalPersalinan(new Date().toISOString().split('T')[0])
    setTempatPersalinan('')
    setHasNamaBayi(false)
    setNamaBayi('')
    setJenisKelaminBayi('L')
    setNamaAyah('')
  }

  const handleSubmit = async () => {
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
        }
      })
      onOpenChange(false)
      handleReset()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val)
      if (!val) handleReset()
    }}>
      <DialogContent className="max-w-[420px] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tandai Telah Bersalin</DialogTitle>
          <DialogDescription>
            {wargaName ? `Tandai ibu ${wargaName} telah bersalin?` : 'Tandai ibu ini telah bersalin?'} Masukkan data persalinan untuk memindahkan pasien ke Pasca Persalinan dan mendaftarkan data bayi.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 sm:space-y-4 sm:py-4">
          <div className="space-y-2">
            <label htmlFor="tanggal_persalinan" className="text-sm font-medium leading-none">
              Tanggal Persalinan
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
              placeholder="Contoh: RSUD / Bidan / -"
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
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="has_nama_bayi" className="text-sm font-medium leading-none text-slate-700">
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
              placeholder="Isi '-' jika tidak tahu"
              className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base"
            />
          </div>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!tanggalPersalinan || isPending}
          >
            {isPending ? 'Menyimpan...' : 'Ya, Pindahkan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
