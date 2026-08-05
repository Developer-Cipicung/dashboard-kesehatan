import { Warga } from '@/features/warga/services/wargaService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetImunisasiByWarga } from '@/features/warga/hooks/useImunisasi'
import { useGetWargaList } from '@/features/warga/hooks/useWarga'
import { EditPatientDialog } from '@/features/warga/components/EditPatientDialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatDateID } from '@/utils/dateFormatter'
import { Edit2 } from 'lucide-react'
import { calculateAge } from '../../warga/components/PatientTable'
import { isBadutaByBirthDate, isBalitaByBirthDate } from '@/utils/age'

interface PatientProfileCardProps {
  warga: Warga
  kategori?: string
}

export function PatientProfileCard({ warga, kategori }: PatientProfileCardProps) {
  const isBalita = kategori === 'balita' || kategori === 'baduta'
  const isPasca = kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan'
  const isBumil = kategori === 'bumil'
  const isIbu = isBumil || isPasca
  const { data: imunisasiList = [] } = useGetImunisasiByWarga(isBalita ? warga.id : '')
  
  // Fetch anak terkait hanya saat profil ibu/pasca dibuka.
  const { data: wargaListRes } = useGetWargaList(
    { posyanduId: warga.posyandu_id, limit: 1000 },
    { enabled: isIbu && !!warga.posyandu_id },
  )
  const allWarga = wargaListRes?.data || []
  const listAnak = allWarga.filter(a => {
    const isAnak = a.tanggal_lahir && (isBadutaByBirthDate(a.tanggal_lahir) || isBalitaByBirthDate(a.tanggal_lahir))
    if (!isAnak) return false
    if (a.ibu_id === warga.id) return true
    return !a.ibu_id && (a.nama_ibu === warga.nama || a.pemeriksaan_balita_baduta?.[0]?.nama_ibu === warga.nama)
  })

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <span>{warga.nama}</span>
            <Button variant="outline" size="sm" className="h-6 p-2 text-[10px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm rounded-md" onClick={() => setIsEditDialogOpen(true)}>
              <Edit2 className="w-3 h-3 mr-1" />
              Edit Profil
            </Button>
          </CardTitle>
        </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs">NIK</span>
            <span className="font-medium">{warga.nik}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Tempat Lahir</span>
            <span className="font-medium">{warga.tempat_lahir || '-'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Tanggal Lahir</span>
            <span className="font-medium">
              {warga.tanggal_lahir ? formatDateID(warga.tanggal_lahir) : '-'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">Jenis Kelamin</span>
            <span className="font-medium">{warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">No. HP</span>
            <span className="font-medium">{warga.nomor || 'Tidak ada'}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs">BPJS</span>
            <span className="font-medium">
              {warga.memiliki_bpjs ? (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">Terdaftar</span>
              ) : (
                <span className="text-muted-foreground">Tidak Terdaftar</span>
              )}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-muted-foreground block text-xs">Alamat</span>
            <span className="font-medium">
              {warga.alamat || '-'}
              {(warga.rt || warga.rw) ? `, RT ${warga.rt || '-'} RW ${warga.rw || '-'}` : ''}
            </span>
          </div>

          {(isPasca || warga.pemeriksaan_pasca_persalinan?.[0]?.tanggal_persalinan) && (
            <div>
              <span className="text-muted-foreground block text-xs">Tanggal Persalinan</span>
              <span className="font-medium">
                {warga.pemeriksaan_pasca_persalinan?.[0]?.tanggal_persalinan ? formatDateID(warga.pemeriksaan_pasca_persalinan[0].tanggal_persalinan) : '-'}
              </span>
            </div>
          )}
          
          {isPasca && (
            <div>
              <span className="text-muted-foreground block text-xs">Tempat Persalinan</span>
              <span className="font-medium">{warga.tempat_persalinan || '-'}</span>
            </div>
          )}

          {isBumil && (
            <>
              <div>
                <span className="text-muted-foreground block text-xs">HPHT (Hari Pertama Haid Terakhir)</span>
                <span className="font-medium">
                  {warga.hpht ? formatDateID(warga.hpht) : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">HPL (Hari Perkiraan Lahir)</span>
                <span className="font-medium">
                  {(() => {
                    if (!warga.hpht) return '-'
                    const hpht = new Date(warga.hpht)
                    const start = new Date(hpht)
                    start.setDate(start.getDate() + 280 - 7)
                    const end = new Date(hpht)
                    end.setDate(end.getDate() + 280 + 7)
                    const fmt = (d: Date) => formatDateID(d.toISOString())
                    return `${fmt(start)} - ${fmt(end)}`
                  })()}
                </span>
              </div>
            </>
          )}

          {isBalita && (
            <>
              <div>
                <span className="text-muted-foreground block text-xs">Penggunaan Kontrasepsi Ibu</span>
                <span className="font-medium">{warga.penggunaan_kontrasepsi || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Nama Ayah</span>
                <span className="font-medium">{warga.nama_ayah || '-'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Nama Ibu</span>
                <span className="font-medium">
                  {warga.ibu ? (
                    <span>{warga.ibu.nama}</span>
                  ) : (
                    warga.nama_ibu || '-'
                  )}
                </span>
              </div>
            </>
          )}

          {isIbu && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground block text-xs">Daftar Anak (Balita/Baduta)</span>
              <div className="flex flex-col gap-1 mt-1">
                {listAnak.length > 0 ? (
                  listAnak.map((anak) => (
                    <div key={anak.id} className="text-sm border border-slate-100 bg-slate-50 rounded px-3 py-2 flex items-center justify-between">
                      <span className="font-medium">{anak.nama}</span>
                      <span className="text-xs text-slate-500">
                        {anak.tanggal_lahir ? calculateAge(anak.tanggal_lahir, new Date()) : ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm font-medium text-slate-400">Tidak ada data anak yang terdaftar di posyandu ini</span>
                )}
              </div>
            </div>
          )}

          {isBalita && (
            <div className="md:col-span-2">
              <span className="text-muted-foreground block text-xs mb-1">Riwayat Imunisasi</span>
              <div className="flex flex-wrap gap-1">
                {imunisasiList.length > 0 ? (
                  imunisasiList.map((item: any) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20"
                    >
                      {item.jenis_vaksin}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 font-medium text-xs md:text-md">Belum ada data imunisasi</span>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <EditPatientDialog
      warga={warga}
      kategori={kategori}
      open={isEditDialogOpen}
      onOpenChange={setIsEditDialogOpen}
    />
    </>
  )
}