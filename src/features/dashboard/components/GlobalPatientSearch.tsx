import { useState, useEffect, useRef } from 'react'
import { Search, Plus, User, Baby, HeartPulse, PersonStanding, Activity, Loader2, Upload, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { wargaService, Warga } from '@/features/warga/services/wargaService'
import { useHamilKembali } from '@/features/warga/hooks/useWarga'
import { calculateAgeInMonths } from '@/utils/age'
import { MonthlyRecordForm } from '@/features/pemeriksaan/components/MonthlyRecordForm'
import { AddPatientDialog } from '@/features/warga/components/AddPatientDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ImportWargaModal } from '@/features/warga/components/ImportWargaModal'
import { useQueryClient } from '@tanstack/react-query'

export function GlobalPatientSearch() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Warga[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  
  const queryClient = useQueryClient()
  
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showAddWarga, setShowAddWarga] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showCategorySelect, setShowCategorySelect] = useState(false)
  const [selectedNewCategory, setSelectedNewCategory] = useState<string>('')
  const [detectedCategory, setDetectedCategory] = useState<string>('')

  const [showHamilKembaliModal, setShowHamilKembaliModal] = useState(false)
  const [wargaHamilKembali, setWargaHamilKembali] = useState<Warga | null>(null)
  const [hphtHamilKembali, setHphtHamilKembali] = useState('')
  const [htpHamilKembali, setHtpHamilKembali] = useState('')
  const [jumlahAnakHamilKembali, setJumlahAnakHamilKembali] = useState('')

  const { mutateAsync: hamilKembali, isPending: isHamilKembaliPending } = useHamilKembali()

  useEffect(() => {
    if (hphtHamilKembali) {
      try {
        const d = new Date(hphtHamilKembali)
        d.setDate(d.getDate() + 280)
        setHtpHamilKembali(d.toISOString().split('T')[0])
      } catch (e) {}
    }
  }, [hphtHamilKembali])

  const handleSaveHamilKembali = async () => {
    if (!wargaHamilKembali) return
    try {
      await hamilKembali({
        id: wargaHamilKembali.id,
        payload: {
          hpht: hphtHamilKembali || undefined,
          htp: htpHamilKembali || undefined,
          jumlah_anak: jumlahAnakHamilKembali ? parseInt(jumlahAnakHamilKembali, 10) : undefined,
        },
      })
      setShowHamilKembaliModal(false)
      setWargaHamilKembali(null)
    } catch (err: any) {
      console.error('Error saving Hamil Kembali:', err)
    }
  }

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length >= 2) {
        setLoading(true)
        try {
          const res = await wargaService.getWargaList({ search, limit: 10 })
          setResults(res.data)
          setIsOpen(true)
        } catch (error) {
          console.error("Failed to search", (error as any).message || error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const determineCategory = (warga: Warga) => {
    const ageMonths = calculateAgeInMonths(warga.tanggal_lahir)
    if (ageMonths < 24) return { id: 'baduta', label: 'Baduta', icon: <Baby className="w-4 h-4 text-sky-500" /> }
    if (ageMonths < 60) return { id: 'balita', label: 'Balita', icon: <Baby className="w-4 h-4 text-blue-500" /> }
    if (warga.status_kehamilan === 'HAMIL') return { id: 'bumil', label: 'Ibu Hamil', icon: <HeartPulse className="w-4 h-4 text-pink-500" /> }
    if (warga.status_kehamilan === 'PASCA_PERSALINAN') return { id: 'pasca_persalinan', label: 'Pasca Salin', icon: <Activity className="w-4 h-4 text-rose-500" /> }
    if (ageMonths >= 720) return { id: 'lansia', label: 'Lansia', icon: <PersonStanding className="w-4 h-4 text-amber-500" /> }
    
    return { id: 'lainnya', label: 'Warga Umum', icon: <User className="w-4 h-4 text-slate-500" /> }
  }

  const hasBeenExaminedThisMonth = (warga: Warga) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const checkDate = (dateStr?: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };

    if (checkDate(warga.pemeriksaan_balita_baduta?.[0]?.tanggal_kunjungan)) return true;
    if (checkDate(warga.pemeriksaan_bumil?.[0]?.tanggal_kunjungan)) return true;
    if (checkDate(warga.pemeriksaan_pasca_persalinan?.[0]?.tanggal_kunjungan)) return true;
    if (checkDate(warga.pemeriksaan_lansia?.[0]?.tanggal_kunjungan)) return true;

    return false;
  }

  const handleSelectWarga = (warga: Warga) => {
    setIsOpen(false)
    const cat = determineCategory(warga)

    if (cat.id === 'lainnya' && warga.jenis_kelamin === 'P') {
      setWargaHamilKembali(warga)
      setJumlahAnakHamilKembali(String((warga.jumlah_anak || 0) + 1))
      setHphtHamilKembali('')
      setHtpHamilKembali('')
      setShowHamilKembaliModal(true)
      return
    }

    setDetectedCategory(cat.id)
    setSelectedWarga(warga)
    setShowForm(true)
  }

  return (
    <div className="relative z-20 mb-8 w-full" ref={wrapperRef}>
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {loading ? <Loader2 className="h-5 w-5 text-slate-400 animate-spin" /> : <Search className="h-5 w-5 text-slate-400" />}
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner text-lg"
            placeholder="Cari nama pasien atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { if (search.length >= 2) setIsOpen(true) }}
          />
          
          {isOpen && results.length > 0 && (
            <div className="absolute w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden max-h-80 overflow-y-auto">
              {results.map((warga) => {
                const cat = determineCategory(warga)
                return (
                  <button
                    key={warga.id}
                    onClick={() => handleSelectWarga(warga)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 text-base">{warga.nama}</div>
                      <div className="text-xs text-slate-500 mt-0.5">NIK: {warga.nik}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasBeenExaminedThisMonth(warga) ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Selesai</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Belum</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-white shadow-sm border border-slate-100 px-3 py-1.5 rounded-full group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                        {cat.icon}
                        <span className="text-xs font-medium text-slate-700">{cat.label}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          
          {isOpen && results.length === 0 && search.length >= 2 && !loading && (
            <div className="absolute w-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 text-center">
              <p className="text-slate-500 text-sm">Warga tidak ditemukan.</p>
            </div>
          )}
        </div>
        
        <div className="flex shrink-0 gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowCategorySelect(true)} 
            className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 rounded-xl px-6 py-4 font-bold text-base flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Tambah Warga
          </button>
        </div>
      </div>

      <MonthlyRecordForm
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open)
          if (!open) {
            setTimeout(() => setSelectedWarga(null), 300)
          }
        }}
        kategori={detectedCategory}
        wargaId={selectedWarga?.id || ''}
        initialData={null}
      />

      <AddPatientDialog
        open={showAddWarga}
        onOpenChange={(open) => {
          setShowAddWarga(open)
          if (!open) setSelectedNewCategory('')
        }}
        defaultCategory={selectedNewCategory}
        onSuccess={() => {
          setShowAddWarga(false)
          setSelectedNewCategory('')
        }}
      />

      <Dialog open={showCategorySelect} onOpenChange={setShowCategorySelect}>
        <DialogContent className="max-w-[420px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pilih Jenis Warga</DialogTitle>
            <DialogDescription>
              Silakan pilih kategori warga yang ingin ditambahkan
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:mt-4 sm:gap-3">
            {[
              { id: 'balita', label: 'Balita (0 - 59 Bulan)', icon: <Activity className="w-5 h-5 text-orange-500" /> },
              { id: 'baduta', label: 'Baduta (0 - 23 Bulan)', icon: <Baby className="w-5 h-5 text-amber-500" /> },
              { id: 'bumil', label: 'Ibu Hamil', icon: <User className="w-5 h-5 text-pink-500" /> },
              { id: 'pasca_persalinan', label: 'Ibu Pasca Persalinan', icon: <Baby className="w-5 h-5 text-purple-500" /> },
              { id: 'lansia', label: 'Lansia', icon: <PersonStanding className="w-5 h-5 text-teal-500" /> }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedNewCategory(cat.id)
                  setShowCategorySelect(false)
                  setTimeout(() => setShowAddWarga(true), 150)
                }}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-primary hover:bg-primary/5 sm:gap-4 sm:p-4"
              >
                <div className="bg-white shadow-sm p-2 rounded-full border border-slate-100">
                  {cat.icon}
                </div>
                <span className="font-semibold text-slate-700">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setShowCategorySelect(false)
                setTimeout(() => setShowImportModal(true), 150)
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-center transition-all hover:bg-blue-100 hover:border-blue-300 sm:p-4 text-blue-700 font-medium"
            >
              <Upload className="w-5 h-5" />
              Import e-PPGBM
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <ImportWargaModal 
        open={showImportModal} 
        onOpenChange={setShowImportModal} 
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
          // Set timeout to invalidate again after API cache expires (1 minute)
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
          }, 65000)
        }}
      />

      <Dialog open={showHamilKembaliModal} onOpenChange={setShowHamilKembaliModal}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-[420px] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-pink-600">
              <RefreshCw className="w-5 h-5 text-pink-500" />
              Aktifkan Status Hamil Kembali
            </DialogTitle>
            <DialogDescription>
              Pasien ini berjenis kelamin perempuan dan saat ini berstatus Warga Umum. Daftarkan kembali sebagai Ibu Hamil.
            </DialogDescription>
          </DialogHeader>

          {wargaHamilKembali && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-3 text-sm space-y-1">
                <p className="font-semibold text-slate-800">{wargaHamilKembali.nama}</p>
                <p className="text-xs text-slate-500">NIK: {wargaHamilKembali.nik || '-'}</p>
                <p className="text-xs text-slate-500">Status Saat Ini: <span className="font-semibold text-pink-600">{wargaHamilKembali.status_kehamilan || 'TIDAK_HAMIL'}</span></p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  HPHT (Hari Pertama Haid Terakhir)
                </label>
                <input
                  type="date"
                  value={hphtHamilKembali}
                  onChange={(e) => setHphtHamilKembali(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  HPL (Hari Perkiraan Lahir)
                </label>
                <input
                  type="date"
                  value={htpHamilKembali}
                  onChange={(e) => setHtpHamilKembali(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Kehamilan Ke- / Anak Ke-
                </label>
                <input
                  type="number"
                  min={1}
                  value={jumlahAnakHamilKembali}
                  onChange={(e) => setJumlahAnakHamilKembali(e.target.value)}
                  placeholder="Contoh: 2"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 mt-4">
                <Button type="button" variant="outline" onClick={() => setShowHamilKembaliModal(false)}>
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveHamilKembali}
                  disabled={isHamilKembaliPending}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold"
                >
                  {isHamilKembaliPending ? 'Menyimpan...' : 'Simpan & Aktifkan Hamil'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
