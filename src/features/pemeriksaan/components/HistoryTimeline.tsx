import { Pemeriksaan } from '../services/pemeriksaanService'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import { calculateHplRange, calculateTDStatus, calculateKolesterolStatus, calculateAsamUratStatus, calculateGdsStatus, calculateAge } from '../../warga/components/PatientTable'
import { formatDateID } from '@/utils/dateFormatter'

interface HistoryTimelineProps {
  history: Pemeriksaan[]
  warga?: any
  kategori: string
  isLocked: boolean
  onEdit: (record: Pemeriksaan) => void
  onDelete: (id: string) => void
}

export function HistoryTimeline({ history, warga, kategori, isLocked, onEdit, onDelete }: HistoryTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground border rounded-lg bg-card">
        Belum ada riwayat pemeriksaan.
      </div>
    )
  }

  const isBumil = kategori === 'bumil'
  
  if (isBumil) {
    return <BumilTimelineTable history={history} warga={warga} isLocked={isLocked} onEdit={onEdit} onDelete={onDelete} />
  }

  const isBalita = kategori === 'balita' || kategori === 'baduta'
  if (isBalita) {
    return <BalitaTimelineTable history={history} warga={warga} isLocked={isLocked} onEdit={onEdit} onDelete={onDelete} kategori={kategori} />
  }

  const isLansia = kategori === 'lansia'
  const isPasca = kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan'

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50">
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs whitespace-nowrap">Tanggal Kunjungan</th>
            
            {/* Dynamic Headers */}
            {isBumil && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Usia Kandungan</th>}
            
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">BB (kg)</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">TB (cm)</th>
            

            
            {isBumil && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">HPHT / HTP</th>}
            
            {isLansia && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Tekanan Darah</th>}
            {isLansia && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">GDS</th>}
            {isLansia && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Kolesterol</th>}
            {isLansia && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Asam Urat</th>}
            {isPasca && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Kondisi Ibu</th>}


            {isBumil && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Detail Kehamilan</th>}
            {isPasca && <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Detail Bayi & Layanan</th>}

            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Catatan</th>
            {!isLocked && (
              <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right sticky right-0 z-10 bg-slate-50/95 backdrop-blur-sm shadow-[-8px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100/80">Aksi</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {history.map((record: any) => {
            const dateRaw = record.tanggal_kunjungan || record.tanggal_pemeriksaan || record.created_at
            const date = dateRaw ? formatDateID(dateRaw) : 'Tanggal Tidak Diketahui'

            const bb = record.bb || record.berat_badan
            const tb = record.tb || record.tinggi_badan
            const td = (record.tekanan_darah_sistolik && record.tekanan_darah_diastolik) 
              ? `${record.tekanan_darah_sistolik}/${record.tekanan_darah_diastolik} mmHg` 
              : (record.tekanan_darah || '-')

            const renderHphtHtp = () => {
              if (!warga?.hpht) return <div className="text-slate-400 italic">Belum diset</div>
              return (
                <div className="text-xs whitespace-nowrap">
                  <div><span className="text-muted-foreground">HPHT:</span> {formatDateID(warga.hpht)}</div>
                  <div className="mt-0.5"><span className="text-muted-foreground">HPL:</span> {calculateHplRange(warga.hpht)}</div>
                </div>
              )
            }



            return (
              <tr key={record.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">{date}</td>
                
                {isBumil && (
                  <td className="px-4 py-3 text-slate-600">
                    {record.usia_kehamilan_minggu !== undefined ? `${record.usia_kehamilan_minggu} Minggu` : '-'}
                  </td>
                )}
                
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {bb !== undefined && bb !== null ? <span className="font-medium">{bb}</span> : <span className="text-slate-400">-</span>}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {tb !== undefined && tb !== null ? <span className="font-medium">{tb}</span> : <span className="text-slate-400">-</span>}
                </td>
                

                
                {isBumil && (
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {renderHphtHtp()}
                  </td>
                )}

                {isLansia && (
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{td}</span>
                      {isLansia && record.tekanan_darah_sistolik && (
                        (() => {
                          const status = calculateTDStatus(`${record.tekanan_darah_sistolik}/${record.tekanan_darah_diastolik}`);
                          return status ? <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${status.color}`}>{status.status}</span> : null;
                        })()
                      )}
                    </div>
                  </td>
                )}

                {isLansia && (
                  <>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {record.gula_darah_sewaktu !== undefined && record.gula_darah_sewaktu !== null ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-medium">{record.gula_darah_sewaktu}</span>
                          {(() => {
                            const st = calculateGdsStatus(record.gula_darah_sewaktu);
                            return st ? <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${st.color}`}>{st.status}</span> : null;
                          })()}
                        </div>
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {record.kolesterol !== undefined && record.kolesterol !== null ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-medium">{record.kolesterol}</span>
                          {(() => {
                            const st = calculateKolesterolStatus(record.kolesterol);
                            return st ? <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${st.color}`}>{st.status}</span> : null;
                          })()}
                        </div>
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {record.asam_urat !== undefined && record.asam_urat !== null ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-medium">{record.asam_urat}</span>
                          {(() => {
                            const st = calculateAsamUratStatus(record.asam_urat, warga?.jenis_kelamin);
                            return st ? <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${st.color}`}>{st.status}</span> : null;
                          })()}
                        </div>
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                  </>
                )}

                {isPasca && (
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {record.kondisi_ibu ? <div className="text-xs mt-0.5"><span className="text-muted-foreground">Kondisi:</span> {record.kondisi_ibu}</div> : '-'}
                  </td>
                )}



                {isBumil && (
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {record.jumlah_anak !== undefined && record.jumlah_anak !== null && <div className="text-xs"><span className="text-muted-foreground">Anak Ke-:</span> {record.jumlah_anak}</div>}
                    {record.kadar_hemoglobin !== undefined && record.kadar_hemoglobin !== null && Number(record.kadar_hemoglobin) > 0 && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground w-16">Hb:</span>
                        <span>{record.kadar_hemoglobin}</span>
                        {parseFloat(record.kadar_hemoglobin) < 11 ? (
                          <span className="text-[9px] px-1 py-0.5 rounded border font-bold text-red-700 bg-red-50 border-red-200">
                            Risiko Anemia
                          </span>
                        ) : (
                          <span className="text-[9px] px-1 py-0.5 rounded border font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
                            Normal
                          </span>
                        )}
                      </div>
                    )}
                    {record.berat_janin !== undefined && record.berat_janin !== null && <div className="text-xs"><span className="text-muted-foreground">Berat Janin:</span> {record.berat_janin} kg</div>}
                    <div className="text-xs"><span className="text-muted-foreground">Rokok:</span> {record.terpapar_rokok ? 'Ya' : 'Tidak'}</div>
                    <div className="text-xs"><span className="text-muted-foreground">KIE:</span> {record.kie ? 'Ya' : 'Tidak'}</div>
                    <div className="text-xs"><span className="text-muted-foreground">TTD:</span> {record.suplemen_tambah_darah ? 'Ya' : 'Tidak'}</div>
                  </td>
                )}

                {isPasca && (
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {record.tinggi_badan_bayi !== undefined && record.tinggi_badan_bayi !== null && <div className="text-xs"><span className="text-muted-foreground">Tinggi Bayi:</span> {record.tinggi_badan_bayi} cm</div>}
                    {record.berat_badan_bayi !== undefined && record.berat_badan_bayi !== null && <div className="text-xs"><span className="text-muted-foreground">Berat Bayi:</span> {record.berat_badan_bayi} kg</div>}
                    <div className="text-xs"><span className="text-muted-foreground">KIE:</span> {record.kie ? 'Ya' : 'Tidak'}</div>
                    <div className="text-xs"><span className="text-muted-foreground">Rujukan:</span> {record.fasilitasi_rujukan ? 'Ya' : 'Tidak'}</div>
                    <div className="text-xs"><span className="text-muted-foreground">Bansos:</span> {record.fasilitasi_bantuan_sosial ? 'Ya' : 'Tidak'}</div>
                  </td>
                )}

                <td className="px-4 py-3 text-slate-600 max-w-[200px]">
                  {record.catatan
                    ? <span className="text-xs">{record.catatan}</span>
                    : <span className="text-slate-300">-</span>
                  }
                </td>
                
                {!isLocked && (
                  <td className="px-4 py-3 sticky right-0 z-10 bg-white/95 backdrop-blur-sm shadow-[-8px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100/80">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-white" onClick={() => onEdit(record)}>
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive bg-white hover:bg-destructive/10 border-destructive/20"
                        onClick={() => onDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function BumilTimelineTable({ history, warga, isLocked, onEdit, onDelete }: { history: Pemeriksaan[], warga?: any, isLocked: boolean, onEdit: any, onDelete: any }) {
  const getBadgeColor = (status: string) => {
    if (status?.includes('KEK & Anemia')) return 'bg-red-100 text-red-800 border-red-200'
    if (status?.includes('KEK') || status?.includes('Anemia')) return 'bg-amber-100 text-amber-800 border-amber-200'
    return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }

  const getHplRange = (hphtStr?: string) => {
    if (!hphtStr) return '-'
    const hpht = new Date(hphtStr)
    const start = new Date(hpht)
    start.setDate(start.getDate() + 259)
    const end = new Date(hpht)
    end.setDate(end.getDate() + 294)
    return `${formatDateID(start.toISOString())} - ${formatDateID(end.toISOString())}`
  }



  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50">
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Tgl Kunj.</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">HPHT / HPL</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Jml Anak</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Usia Hamil</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">TB (cm)</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">BB (kg)</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Tekanan Darah</th>

            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">L. Perut</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">T. Fundus</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Riw. Penyakit</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Hb</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">LiLA</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Janin (kg)</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Rokok / KIE / TTD / MMS</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Rujukan & Bansos</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Status Medis</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Tgl Berikut</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Catatan</th>
            {!isLocked && <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right sticky right-0 z-10 bg-slate-50/95 backdrop-blur-sm shadow-[-8px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100/80">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {history.map((record: any) => {
            
            return (
              <tr key={record.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap text-xs">{formatDateID(record.tanggal_kunjungan || record.created_at)}</td>
                <td className="px-4 py-3 text-slate-600 text-[11px] whitespace-nowrap">
                  <div><span className="text-muted-foreground">HPHT:</span> {formatDateID(warga?.hpht)}</div>
                  <div className="mt-0.5"><span className="text-muted-foreground">HPL:</span> {getHplRange(warga?.hpht)}</div>
                </td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">{record.jumlah_anak ?? '-'}</td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">
                  {record.usia_kehamilan_minggu ?? '-'} Mg
                  {record.usia_kehamilan_minggu && record.usia_kehamilan_minggu > 42 && (
                    <div className="text-[9px] text-red-500 font-bold mt-1 leading-tight">Lewat<br/>Waktu!</div>
                  )}
                </td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">{record.tb ?? '-'}</td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">{record.bb ?? '-'}</td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">
                  {(record.tekanan_darah_sistolik && record.tekanan_darah_diastolik) ? <span className="font-medium">{`${record.tekanan_darah_sistolik}/${record.tekanan_darah_diastolik}`}</span> : <span className="text-slate-400">-</span>}
                </td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">{record.lingkar_perut ?? '-'}</td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">{record.tinggi_fundus ?? '-'}</td>
                <td className="px-4 py-3 text-slate-600 text-xs max-w-[120px] truncate" title={record.riwayat_penyakit}>{record.riwayat_penyakit || '-'}</td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">
                  {(() => {
                    const val = record.kadar_hemoglobin;
                    if (!val || Number(val) <= 0) return '-';
                    const isRisk = parseFloat(val) > 0 && parseFloat(val) < 11;
                    if (!isRisk) return val;
                    return (
                      <div className="text-[11px] font-bold px-1.5 py-1 rounded border text-center leading-tight whitespace-nowrap text-red-600 bg-red-50 border-red-200">
                        {val}<br/>
                        <span className="font-medium text-[9px] uppercase tracking-wider">Risiko Anemia</span>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">
                  {(() => {
                    const val = record.lingkar_lengan_atas;
                    if (!val) return '-';
                    const isRisk = parseFloat(val) > 0 && parseFloat(val) < 23.5;
                    if (!isRisk) return val;
                    return (
                      <div className="text-[11px] font-bold px-1.5 py-1 rounded border text-center leading-tight whitespace-nowrap text-red-600 bg-red-50 border-red-200">
                        {val}<br/>
                        <span className="font-medium text-[9px] uppercase tracking-wider">Risiko KEK</span>
                      </div>
                    );
                  })()}
                </td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">{record.berat_janin ?? '-'}</td>
                
                <td className="px-4 py-3 text-slate-600 text-[11px] whitespace-nowrap">
                  <div>Rokok: {record.terpapar_rokok ? 'Ya' : 'Tidak'}</div>
                  <div>KIE: {record.kie ? 'Ya' : 'Tidak'}</div>
                  <div>TTD: {record.suplemen_tambah_darah ?? '-'}</div>
                  <div>MMS: {record.mms ?? '-'}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-[11px] whitespace-nowrap">
                  <div>Rujukan: {record.fasilitasi_rujukan ? 'Ya' : 'Tidak'}</div>
                  <div>Bansos: {record.fasilitasi_bantuan_sosial ? 'Ya' : 'Tidak'}</div>
                </td>
                
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getBadgeColor(record.status_medis)}`}>
                    {record.status_medis || '-'}
                  </span>
                </td>
                
                <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">
                  {formatDateID(record.tanggal_kunjungan_berikut)}
                </td>

                <td className="px-4 py-3 text-slate-600 max-w-[150px]">
                  {record.catatan ? <span className="text-xs truncate block" title={record.catatan}>{record.catatan}</span> : <span className="text-slate-300">-</span>}
                </td>
                
                {!isLocked && (
                  <td className="px-3 py-3 sticky right-0 z-10 bg-white/95 backdrop-blur-sm shadow-[-8px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100/80">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-white" onClick={() => onEdit(record)}>
                        <Edit className="h-3 w-3 text-slate-500" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-destructive bg-white hover:bg-destructive/10 border-destructive/20" onClick={() => onDelete(record.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function BalitaTimelineTable({ history, warga, isLocked, onEdit, onDelete, kategori }: { history: Pemeriksaan[], warga?: any, isLocked: boolean, onEdit: any, onDelete: any, kategori: string }) {
  const getZScoreColor = (kategori: string) => {
    if (!kategori) return 'bg-slate-100 text-slate-700'
    const k = kategori.toLowerCase()
    if (k.includes('sangat kurang') || k.includes('sangat pendek') || k.includes('buruk') || k.includes('obesitas')) return 'bg-red-100 text-red-700 font-bold'
    if (k.includes('kurang') || k.includes('pendek') || k.includes('risiko') || k.includes('lebih')) return 'bg-amber-100 text-amber-700 font-semibold'
    if (k.includes('normal') || k.includes('baik')) return 'bg-emerald-100 text-emerald-700 font-semibold'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50">
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Tgl Kunj.</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Usia</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">BB (kg)</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">TB (cm)</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap min-w-[120px]">Status Gizi (WHO)</th>
            <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap text-center">ASI Eksklusif</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Nama Ibu</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">KB</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Kondisi / Bansos</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] whitespace-nowrap">Catatan</th>
            {!isLocked && <th className="px-3 py-4 font-bold text-slate-500 uppercase tracking-wider text-[10px] text-right sticky right-0 z-10 bg-slate-50/95 backdrop-blur-sm shadow-[-8px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100/80">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {history.map((record: any) => {
            const dateRaw = record.tanggal_kunjungan || record.tanggal_pemeriksaan || record.created_at

            return (
              <tr key={record.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap text-xs">{formatDateID(dateRaw)}</td>
                <td className="px-3 py-3 text-slate-600 text-xs whitespace-nowrap">
                  {warga?.tanggal_lahir ? calculateAge(warga.tanggal_lahir, dateRaw, kategori) : '-'}
                </td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">{record.bb || record.berat_badan || '-'}</td>
                <td className="px-3 py-3 text-slate-600 text-xs text-center">{record.tb || record.tinggi_badan || '-'}</td>
                
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {record.status_gizi ? (
                    <div className="flex flex-col gap-1.5">
                      {record.status_gizi.kategori_bb_u && (
                         <span className={`text-[10px] px-1.5 py-0.5 rounded-md w-max ${getZScoreColor(record.status_gizi.kategori_bb_u)}`}>
                           BB/U: {record.status_gizi.kategori_bb_u}
                         </span>
                      )}
                      {record.status_gizi.kategori_tb_u && (
                         <span className={`text-[10px] px-1.5 py-0.5 rounded-md w-max ${getZScoreColor(record.status_gizi.kategori_tb_u)}`}>
                           TB/U: {record.status_gizi.kategori_tb_u}
                         </span>
                      )}
                      {record.status_gizi.kategori_bb_tb && (
                         <span className={`text-[10px] px-1.5 py-0.5 rounded-md w-max ${getZScoreColor(record.status_gizi.kategori_bb_tb)}`}>
                           BB/TB: {record.status_gizi.kategori_bb_tb}
                         </span>
                      )}
                    </div>
                  ) : '-'}
                </td>
                
                <td className="px-3 py-3 text-slate-600 text-xs text-center">
                  {record.asi_eksklusif ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold text-emerald-700 bg-emerald-50 border-emerald-200">Ya</span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold text-slate-600 bg-slate-50 border-slate-200">Tidak</span>
                  )}
                </td>
                
                <td className="px-4 py-3 text-slate-600 text-xs max-w-[120px] truncate" title={record.nama_ibu}>{record.nama_ibu || '-'}</td>
                <td className="px-4 py-3 text-slate-600 text-xs max-w-[100px] truncate" title={record.penggunaan_kontrasepsi}>{record.penggunaan_kontrasepsi || '-'}</td>
                
                <td className="px-4 py-3 text-slate-600 text-[11px] whitespace-nowrap">
                  <div>Kondisi: {record.kondisi || '-'}</div>
                  <div>Bansos: {record.fasilitasi_bantuan_sosial ? 'Ya' : 'Tidak'}</div>
                </td>
                
                <td className="px-4 py-3 text-slate-600 max-w-[150px]">
                  {record.catatan ? <span className="text-xs truncate block" title={record.catatan}>{record.catatan}</span> : <span className="text-slate-300">-</span>}
                </td>
                
                {!isLocked && (
                  <td className="px-3 py-3 sticky right-0 z-10 bg-white/95 backdrop-blur-sm shadow-[-8px_0_15px_-3px_rgba(0,0,0,0.05)] border-l border-slate-100/80">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-white" onClick={() => onEdit(record)}>
                        <Edit className="h-3 w-3 text-slate-500" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-destructive bg-white hover:bg-destructive/10 border-destructive/20" onClick={() => onDelete(record.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
