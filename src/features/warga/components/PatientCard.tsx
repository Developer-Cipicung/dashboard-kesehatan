import { useState } from 'react'
import { Plus, Printer, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Warga } from '../services/wargaService'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useUpdateWarga } from '../hooks/useWarga'
import { toast } from 'sonner'
import { MonthlyRecordForm } from '@/features/pemeriksaan/components/MonthlyRecordForm'
import { pemeriksaanService } from '../services/pemeriksaanService'
import { calculateBMI, calculateTDStatus, calculateKolesterolStatus, calculateAsamUratStatus, calculateGdsStatus } from './PatientTable'

interface PatientCardProps {
  data: Warga
  kategori: string
  onView: (id: string) => void
  isReadOnly?: boolean
}

export function classifyZScore(bb_u: number | null, tb_u: number | null, bb_tb: number | null) {
  let kategori_bb_u = null;
  let kategori_tb_u = null;
  let kategori_bb_tb = null;

  if (bb_u !== null) {
    if (bb_u < -3) kategori_bb_u = 'Sangat Kurang';
    else if (bb_u < -2) kategori_bb_u = 'Kurang';
    else if (bb_u <= 1) kategori_bb_u = 'Normal';
    else kategori_bb_u = 'Risiko Berat Badan Lebih';
  }

  if (tb_u !== null) {
    if (tb_u < -3) kategori_tb_u = 'Sangat Pendek';
    else if (tb_u < -2) kategori_tb_u = 'Pendek (Stunted)';
    else if (tb_u <= 3) kategori_tb_u = 'Normal';
    else kategori_tb_u = 'Tinggi';
  }

  if (bb_tb !== null) {
    if (bb_tb < -3) kategori_bb_tb = 'Gizi Buruk';
    else if (bb_tb < -2) kategori_bb_tb = 'Gizi Kurang';
    else if (bb_tb <= 1) kategori_bb_tb = 'Gizi Baik';
    else if (bb_tb <= 2) kategori_bb_tb = 'Risiko Gizi Lebih';
    else if (bb_tb <= 3) kategori_bb_tb = 'Gizi Lebih';
    else kategori_bb_tb = 'Obesitas';
  }

  return { kategori_bb_u, kategori_tb_u, kategori_bb_tb };
}

export function PatientCard({ data, kategori, onView, isReadOnly }: PatientCardProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [tanggalPersalinan, setTanggalPersalinan] = useState(new Date().toISOString().split('T')[0])
  const [tempatPersalinan, setTempatPersalinan] = useState('')
  const [addRecordWargaId, setAddRecordWargaId] = useState<string | null>(null)
  
  const { mutateAsync: updateWarga } = useUpdateWarga()

  const isBumil = kategori === 'bumil'

  const sortCheckups = (arr: any[] | undefined) => {
    if (!arr || arr.length === 0) return undefined;
    return [...arr].sort((a, b) => {
      const bDateStr = b.tanggal_kunjungan || b.tanggal_pemeriksaan || b.created_at || 0;
      const aDateStr = a.tanggal_kunjungan || a.tanggal_pemeriksaan || a.created_at || 0;
      const db = new Date(bDateStr).getTime();
      const da = new Date(aDateStr).getTime();
      if (db === da) {
        const cb = b.created_at ? new Date(b.created_at).getTime() : 0;
        const ca = a.created_at ? new Date(a.created_at).getTime() : 0;
        return cb - ca;
      }
      return db - da;
    })[0];
  };

  // Last checkup summary
  const latestBumil = sortCheckups(data.pemeriksaan_bumil)
  const latestLansia = sortCheckups(data.pemeriksaan_lansia)
  const latestPasca = sortCheckups(data.pemeriksaan_pasca_persalinan)
  const latestBalita = sortCheckups(data.pemeriksaan_balita_baduta)

  const lastDate = latestBumil?.tanggal_kunjungan
    || latestLansia?.tanggal_kunjungan
    || latestPasca?.tanggal_kunjungan
    || latestBalita?.tanggal_kunjungan

  const displayLastDate = lastDate
    ? new Date(lastDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-3 overflow-hidden transition-all hover:shadow-md">
      <div className="flex flex-col p-4 gap-3">
        <div>
          <div className="font-bold text-slate-800 text-lg">{data.nama}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-mono">NIK: {data.nik}</div>
          {displayLastDate && (
            <div className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md mt-2 border border-emerald-100">
              Terakhir diperiksa: {displayLastDate}
            </div>
          )}
          
          {(kategori === 'balita' || kategori === 'baduta') && latestBalita && (
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Berat & Tinggi</span>
                <span className="text-sm font-semibold text-slate-800">{latestBalita.bb || '-'} kg / {latestBalita.tb || '-'} cm</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status Gizi (WHO)</span>
                {(() => {
                  const zScores = classifyZScore(
                    latestBalita.zscore_bb_u != null ? Number(latestBalita.zscore_bb_u) : null,
                    latestBalita.zscore_tb_u != null ? Number(latestBalita.zscore_tb_u) : null,
                    latestBalita.zscore_bb_tb != null ? Number(latestBalita.zscore_bb_tb) : null
                  )
                  
                  if (!zScores.kategori_bb_u && !zScores.kategori_tb_u && !zScores.kategori_bb_tb) {
                    return <span className="text-sm font-semibold text-slate-800">-</span>
                  }
                  
                  return (
                    <div className="flex flex-col gap-1.5 mt-1">
                      {zScores.kategori_bb_u && (
                         <span className={`text-[10px] px-2 py-0.5 rounded-md w-max ${zScores.kategori_bb_u.includes('Kurang') || zScores.kategori_bb_u.includes('Lebih') ? 'bg-red-50 text-red-600 border border-red-200 font-bold' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'}`}>
                           BB/U: {zScores.kategori_bb_u}
                         </span>
                      )}
                      {zScores.kategori_tb_u && (
                         <span className={`text-[10px] px-2 py-0.5 rounded-md w-max ${zScores.kategori_tb_u.includes('Pendek') || zScores.kategori_tb_u.includes('Tinggi') ? 'bg-red-50 text-red-600 border border-red-200 font-bold' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'}`}>
                           TB/U: {zScores.kategori_tb_u}
                         </span>
                      )}
                      {zScores.kategori_bb_tb && (
                         <span className={`text-[10px] px-2 py-0.5 rounded-md w-max ${zScores.kategori_bb_tb.includes('Buruk') || zScores.kategori_bb_tb.includes('Kurang') || zScores.kategori_bb_tb.includes('Obesitas') ? 'bg-red-50 text-red-600 border border-red-200 font-bold' : zScores.kategori_bb_tb.includes('Risiko') ? 'bg-amber-50 text-amber-600 border border-amber-200 font-bold' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'}`}>
                           BB/TB: {zScores.kategori_bb_tb}
                         </span>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {isBumil && latestBumil && (
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Berat & Tinggi</span>
                  <span className="text-sm font-semibold text-slate-800">{latestBumil.bb || '-'} kg / {latestBumil.tb || '-'} cm</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">IMT</span>
                  {(() => {
                    const bmiData = calculateBMI(latestBumil.bb?.toString(), latestBumil.tb?.toString());
                    return bmiData ? (
                      <span className={`text-sm font-semibold ${bmiData.color.split(' ')[0]}`}>{bmiData.value} ({bmiData.status})</span>
                    ) : <span className="text-sm font-semibold text-slate-800">-</span>;
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kadar Hb</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-slate-800">{(latestBumil.kadar_hemoglobin && parseFloat(latestBumil.kadar_hemoglobin) > 0) ? latestBumil.kadar_hemoglobin : '-'}</span>
                    {latestBumil.kadar_hemoglobin && parseFloat(latestBumil.kadar_hemoglobin) > 0 && parseFloat(latestBumil.kadar_hemoglobin) < 11 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold bg-red-100 text-red-600 border-red-200">Risiko Anemia</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">LiLA</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-slate-800">{latestBumil.lingkar_lengan_atas || '-'}</span>
                    {latestBumil.lingkar_lengan_atas && parseFloat(latestBumil.lingkar_lengan_atas) > 0 && parseFloat(latestBumil.lingkar_lengan_atas) < 23.5 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold bg-red-100 text-red-600 border-red-200">Risiko KEK</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {kategori === 'pasca_persalinan' && latestPasca && (
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Berat & Tinggi</span>
                  <span className="text-sm font-semibold text-slate-800">{latestPasca.bb || '-'} kg / {latestPasca.tb || latestBumil?.tb || '-'} cm</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">IMT</span>
                  {(() => {
                    const bmiData = calculateBMI(latestPasca.bb?.toString(), (latestPasca.tb || latestBumil?.tb)?.toString());
                    return bmiData ? (
                      <span className={`text-sm font-semibold ${bmiData.color.split(' ')[0]}`}>{bmiData.value} ({bmiData.status})</span>
                    ) : <span className="text-sm font-semibold text-slate-800">-</span>;
                  })()}
                </div>
              </div>
            </div>
          )}

          {kategori === 'lansia' && latestLansia && (
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Berat & Tinggi</span>
                  <span className="text-sm font-semibold text-slate-800">{latestLansia.bb || '-'} kg / {latestLansia.tb || '-'} cm</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">IMT</span>
                  {(() => {
                    const bmiData = calculateBMI(latestLansia.bb?.toString(), latestLansia.tb?.toString());
                    return bmiData ? (
                      <span className={`text-sm font-semibold ${bmiData.color.split(' ')[0]}`}>{bmiData.value} ({bmiData.status})</span>
                    ) : <span className="text-sm font-semibold text-slate-800">-</span>;
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tekanan Darah</span>
                  {(() => {
                    const tdStr = (latestLansia.tekanan_darah_sistolik && latestLansia.tekanan_darah_diastolik) 
                      ? `${latestLansia.tekanan_darah_sistolik}/${latestLansia.tekanan_darah_diastolik}` : '';
                    const status = calculateTDStatus(tdStr);
                    return (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-slate-800">{tdStr || '-'}</span>
                        {status && <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${status.color}`}>{status.status}</span>}
                      </div>
                    )
                  })()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gula Darah</span>
                  {(() => {
                    const status = calculateGdsStatus(latestLansia.gula_darah_sewaktu?.toString());
                    return (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-slate-800">{latestLansia.gula_darah_sewaktu || '-'}</span>
                        {status && <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${status.color}`}>{status.status}</span>}
                      </div>
                    )
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kolesterol</span>
                  {(() => {
                    const status = calculateKolesterolStatus(latestLansia.kolesterol?.toString());
                    return (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-slate-800">{latestLansia.kolesterol || '-'}</span>
                        {status && <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${status.color}`}>{status.status}</span>}
                      </div>
                    )
                  })()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Asam Urat</span>
                  {(() => {
                    const status = calculateAsamUratStatus(latestLansia.asam_urat?.toString(), data.jenis_kelamin);
                    return (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-slate-800">{latestLansia.asam_urat || '-'}</span>
                        {status && <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${status.color}`}>{status.status}</span>}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 mt-2">
          {!isReadOnly && (
            <Button
              className="w-full bg-primary hover:bg-primary-dark text-white h-10 text-sm flex items-center justify-center gap-1 shadow-sm"
              onClick={() => setAddRecordWargaId(data.id)}
            >
              <Plus className="w-4 h-4" /> Tambah Catatan Baru
            </Button>
          )}
          
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 h-10 text-sm border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center shadow-sm font-medium"
              onClick={() => onView(data.id)}
            >
              <Eye className="w-4 h-4 mr-1.5" /> Lihat Profil
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-10 text-sm border-blue-200 text-blue-600 flex items-center justify-center gap-1 hover:bg-blue-50"
              onClick={() => window.open(`/warga/${data.id}/kartu`, '_blank')}
            >
              <Printer className="w-4 h-4" /> Cetak Kartu
            </Button>
          </div>
          
          {isBumil && !isReadOnly && (
            <Button
              variant="outline"
              className="w-full h-10 text-sm border-pink-200 text-pink-600 hover:bg-pink-50 font-semibold mt-1"
              onClick={() => setShowConfirm(true)}
            >
              Tandai Telah Bersalin
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={(open) => {
        if (!open) {
          setShowConfirm(false)
          setTempatPersalinan('')
        }
      }}>
        <DialogContent className="max-w-[420px] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tandai Telah Bersalin</DialogTitle>
            <DialogDescription>
              Tandai ibu ini telah bersalin? Masukkan tanggal dan tempat persalinan untuk memindahkan data pasien ke Pasca Persalinan.
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
                Tempat Persalinan <span className="text-red-500">*</span>
              </label>
              <input
                id="tempat_persalinan"
                type="text"
                value={tempatPersalinan}
                onChange={(e) => setTempatPersalinan(e.target.value)}
                placeholder="Contoh: RSUD / Bidan"
                className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base"
              />
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => {
              setShowConfirm(false)
              setTempatPersalinan('')
            }}>
              Batal
            </Button>
            <Button 
              className="w-full sm:w-auto"
              onClick={async () => {
                if (!tanggalPersalinan || !tempatPersalinan) return;
                try {
                  await updateWarga({ id: data.id, payload: { status_kehamilan: 'PASCA_PERSALINAN', tempat_persalinan: tempatPersalinan } })
                  await pemeriksaanService.createPasca({
                    warga_id: data.id,
                    tanggal_kunjungan: new Date().toISOString().split('T')[0],
                    tanggal_persalinan: tanggalPersalinan,
                    bb: latestBumil?.bb || 0,
                    catatan: 'Data otomatis dari perubahan status Ibu Hamil ke Pasca Persalinan',
                  })
                  toast.success('Pasien berhasil ditandai telah bersalin')
                  window.location.reload()
                } catch (error) {
                  toast.error('Gagal memproses data')
                  console.error(error)
                }
                setShowConfirm(false)
                setTempatPersalinan('')
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MonthlyRecordForm
        open={!!addRecordWargaId}
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => setAddRecordWargaId(null), 300)
          }
        }}
        kategori={kategori}
        wargaId={addRecordWargaId || ''}
        initialData={null}
      />
    </div>
  )
}
