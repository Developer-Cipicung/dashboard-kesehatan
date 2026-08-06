import { useState } from 'react'
import { Warga } from '../services/wargaService'
import { ActivitySquare, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { TandaiBersalinDialog } from './TandaiBersalinDialog'
import { formatDateID } from '@/utils/dateFormatter'
import { ImunisasiCell } from './ImunisasiCell'
import { MonthlyRecordForm } from '@/features/pemeriksaan/components/MonthlyRecordForm'
import { Plus } from 'lucide-react'
import { classifyZScore } from './PatientCard'
interface PatientTableProps {
  data: Warga[]
  kategori: string
  onView: (id: string, posyanduId?: string) => void
  isReadOnly?: boolean
}

export function calculateAge(birthDate: string | Date, checkDate: string | Date, _kategori?: string): string {
  if (!birthDate || !checkDate) return '-'
  const dob = new Date(birthDate)
  const check = new Date(checkDate)
  
  let months = (check.getFullYear() - dob.getFullYear()) * 12 + (check.getMonth() - dob.getMonth())
  if (check.getDate() < dob.getDate()) {
    months--
  }
  
  months = Math.max(0, months)
  
  if (months < 60) {
    return `${months} bln`
  }
  
  const years = Math.floor(months / 12)
  return `${years} thn`
}

export function calculateUsiaKandungan(hphtStr?: string, kunjunganStr?: string): string {
  if (!hphtStr || !kunjunganStr) return ''
  const hpht = new Date(hphtStr)
  const kunjungan = new Date(kunjunganStr)
  const diffTime = kunjungan.getTime() - hpht.getTime()
  if (diffTime >= 0) {
    const weeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    if (weeks <= 45) return weeks.toString()
  }
  return ''
}

export function calculateHpl(hphtStr?: string): string {
  if (!hphtStr) return ''
  const hpht = new Date(hphtStr)
  hpht.setDate(hpht.getDate() + 280)
  return hpht.toISOString().split('T')[0]
}

export function calculateHplRange(hphtStr?: string): string {
  if (!hphtStr) return '-'
  const hpht = new Date(hphtStr)
  
  const start = new Date(hpht)
  start.setDate(start.getDate() + 259) // 37 weeks
  
  const end = new Date(hpht)
  end.setDate(end.getDate() + 294) // 42 weeks
  
  return `${formatDateID(start.toISOString())} - ${formatDateID(end.toISOString())}`
}

export const calculateBMI = (bbStr?: string | number, tbStr?: string | number) => {
  if (!bbStr || !tbStr) return null;
  const bb = typeof bbStr === 'string' ? parseFloat(bbStr) : bbStr;
  const tb = typeof tbStr === 'string' ? parseFloat(tbStr) : tbStr;
  if (bb > 0 && tb > 0) {
    const tbMeters = tb / 100;
    const bmi = bb / (tbMeters * tbMeters);
    let status = '';
    let color = '';
    if (bmi < 18.5) {
      status = 'Kurus';
      color = 'text-amber-600 bg-amber-50 border-amber-200';
    } else if (bmi < 25.0) {
      status = 'Normal';
      color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    } else if (bmi <= 27.0) {
      status = 'Gemuk';
      color = 'text-amber-600 bg-amber-50 border-amber-200';
    } else {
      status = 'Obesitas';
      color = 'text-red-600 bg-red-50 border-red-200';
    }
    return { value: bmi.toFixed(1), status, color };
  }
  return null;
}

export const calculateTDStatus = (tdStr?: string) => {
  if (!tdStr || !tdStr.includes('/')) return null;
  const parts = tdStr.split('/');
  const sys = parseInt(parts[0]);
  const dia = parseInt(parts[1]);
  if (isNaN(sys) || isNaN(dia)) return null;
  
  if (sys >= 140 || dia >= 90) return { status: 'Hipertensi', color: 'text-red-600 bg-red-50 border-red-200' };
  if (sys <= 90 || dia <= 60) return { status: 'Hipotensi', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { status: 'Normal', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
}

export const calculateKolesterolStatus = (valStr?: string | number) => {
  if (!valStr) return null;
  const val = typeof valStr === 'string' ? parseFloat(valStr) : valStr;
  if (isNaN(val)) return null;
  
  if (val >= 240) return { status: 'Tinggi', color: 'text-red-600 bg-red-50 border-red-200' };
  if (val >= 200) return { status: 'Batas Tinggi', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { status: 'Normal', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
}

export const calculateAsamUratStatus = (valStr?: string | number, jk?: string) => {
  if (!valStr) return null;
  const val = typeof valStr === 'string' ? parseFloat(valStr) : valStr;
  if (isNaN(val)) return null;
  
  const isMale = jk === 'L';
  const maxNormal = isMale ? 7.0 : 6.0;
  
  if (val > maxNormal) return { status: 'Tinggi', color: 'text-red-600 bg-red-50 border-red-200' };
  return { status: 'Normal', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
}

export const calculateGdsStatus = (valStr?: string | number) => {
  if (!valStr) return null;
  const val = typeof valStr === 'string' ? parseFloat(valStr) : valStr;
  if (isNaN(val)) return null;
  if (val >= 200) return { status: 'Tinggi', color: 'text-red-600 bg-red-50 border-red-200' };
  return { status: 'Normal', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
}

interface RowState {
  tanggal: string
  usia: string
  bb: string
  td: string
  tfuTb: string
  djj: string
  lilaGds: string
  hb: string
  tb: string
  lingkar_perut: string
  tinggi_fundus: string
  hpht: string
  htp: string
  catatan: string
  lingkar_kepala: string
  nama_ayah: string
  nama_ibu: string
  penggunaan_kontrasepsi: string
  tanggal_persalinan: string
  suhu_tubuh: string
  kondisi_ibu: string
  kondisi: string
  asi_eksklusif: boolean
  fasilitasi_bantuan_sosial: boolean
  jumlah_anak: string
  riwayat_penyakit: string
  kadar_hemoglobin: string
  berat_janin: string
  terpapar_rokok: boolean
  kie: boolean
  suplemen_tambah_darah: string
  mms: string
  tinggi_badan_bayi: string
  berat_badan_bayi: string
  fasilitasi_rujukan: boolean
  tanggal_kunjungan_berikut: string
  kolesterol: string
  asam_urat: string
}

const emptyRow = (): RowState => ({
  tanggal: new Date().toISOString().split('T')[0],
  usia: '',
  bb: '',
  td: '',
  tfuTb: '',
  djj: '',
  lilaGds: '',
  hb: '',
  tb: '',
  lingkar_perut: '',
  tinggi_fundus: '',
  hpht: '',
  htp: '',
  catatan: '',
  lingkar_kepala: '',
  nama_ayah: '',
  nama_ibu: '',
  tanggal_persalinan: new Date().toISOString().slice(0, 10),
  suhu_tubuh: '',
  kondisi_ibu: '',
  kondisi: '',
  asi_eksklusif: false,
  fasilitasi_bantuan_sosial: false,
  jumlah_anak: '',
  riwayat_penyakit: '',
  kadar_hemoglobin: '',
  berat_janin: '',
  terpapar_rokok: false,
  kie: false,
  suplemen_tambah_darah: '',
  mms: '',
  tinggi_badan_bayi: '',
  berat_badan_bayi: '',
  kolesterol: '',
  asam_urat: '',
  fasilitasi_rujukan: false,
  tanggal_kunjungan_berikut: (() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().split('T')[0]
  })(),
  penggunaan_kontrasepsi: '',
})



function Cell({
  value,
  onChange,
  placeholder,
  type = 'text',
  width = 'w-[80px]',
  disabled,
  min,
  max,
  options,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  width?: string
  disabled?: boolean
  min?: number
  max?: number
  options?: string[]
}) {
  if (disabled) {
    if (type === 'checkbox') {
      return <div className={`flex items-center justify-center ${width}`}><span className="text-sm font-medium text-slate-700">{value ? 'Ya' : 'Tidak'}</span></div>
    }
    if (type === 'textarea') {
      return <div className={`flex items-center ${width}`}><span className="text-sm font-medium text-slate-700">{value || '-'}</span></div>
    }
    
    // For text, number, select, td
    const displayValue = value || placeholder || '—'
    const isPlaceholder = !value && !!placeholder

    return (
      <div className={`flex items-center ${width} ${type === 'td' ? 'justify-center' : ''}`}>
        <span className={`text-sm font-medium ${isPlaceholder ? 'text-slate-500' : 'text-slate-700'}`}>
          {displayValue}
        </span>
      </div>
    )
  }

  if (type === 'select' && options) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${width} px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 transition-colors`}
      >
        <option value="" disabled>{placeholder || '—'}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    )
  }

  if (type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '—'}
        rows={1}
        className={`${width} px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 placeholder:text-slate-300 transition-colors resize-y min-h-[34px]`}
      />
    )
  }

  if (type === 'td') {
    const parts = value.split('/')
    const s = parts[0] || ''
    const d = parts[1] || ''
    return (
      <div className={`flex items-center gap-1 ${width}`}>
        <input
          type="number"
          value={s}
          onChange={(e) => onChange(`${e.target.value}${d ? '/' + d : ''}`)}
          placeholder="120"
          className="w-full min-w-0 px-1 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-center text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 placeholder:text-slate-300"
        />
        <span className="text-slate-400 font-medium">/</span>
        <input
          type="number"
          value={d}
          onChange={(e) => onChange(`${s || '0'}/${e.target.value}`)}
          placeholder="80"
          className="w-full min-w-0 px-1 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-center text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 placeholder:text-slate-300"
        />
      </div>
    )
  }

  if (type === 'checkbox') {
    return (
      <div className={`flex items-center justify-center ${width}`}>
        <input
          type="checkbox"
          checked={value as unknown as boolean}
          onChange={(e) => onChange(e.target.checked as unknown as string)}
          className="w-4 h-4 rounded border-gray-300 text-primary"
        />
      </div>
    )
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => {
        let val = e.target.value
        if (type === 'number' && val !== '' && max !== undefined) {
          if (parseFloat(val) > max) val = max.toString()
        }
        onChange(val)
      }}
      min={min}
      max={max}
      placeholder={placeholder || '—'}
      className={`${width} px-2 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10 placeholder:text-slate-300 transition-colors`}
    />
  )
}

export function PatientTable({ data, kategori, onView, isReadOnly }: PatientTableProps) {
  const [rows, setRows] = useState<Record<string, RowState>>({})
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [addRecordWargaId, setAddRecordWargaId] = useState<string | null>(null)
  const [addRecordPosyanduId, setAddRecordPosyanduId] = useState<string | null>(null)

  const getRow = (id: string): RowState => rows[id] ?? emptyRow()

  const set = (id: string, field: keyof RowState, value: any) => {
    setRows((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyRow()), [field]: value },
    }))
  }


  const isBumil = kategori === 'bumil'
  const isLansia = kategori === 'lansia'
  const isPasca = kategori === 'pasca_persalinan'
  const isBalita = kategori === 'balita' || kategori === 'baduta'

  return (
    <>
      <div className="w-full overflow-x-auto bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 pb-4">
      <table className="w-full min-w-[1400px] text-sm text-left">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs align-middle sticky left-0 z-20 bg-white min-w-[160px] max-w-[160px] w-[160px]" rowSpan={2}>NIK</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs align-middle sticky left-[160px] z-20 bg-white min-w-[190px] max-w-[190px] w-[190px] border-r border-slate-200 shadow-[1px_0_3px_rgba(0,0,0,0.05)]" rowSpan={2}>Nama</th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs align-middle bg-white min-w-[140px] max-w-[180px]" rowSpan={2}>Posyandu</th>
            <th colSpan={isBalita ? 12 : isBumil ? 23 : isPasca ? 15 : 9} className="px-4 py-3 border-l border-slate-100 bg-primary/5">
              <div className="flex items-center text-primary font-bold text-xs uppercase tracking-wider">
                <ActivitySquare className="w-4 h-4 mr-2" />
                Record Pemeriksaan Terakhir
              </div>
            </th>
            <th className="px-4 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs border-l border-slate-200 w-[180px] align-middle sticky right-0 z-20 bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]" rowSpan={2}>Aksi</th>
          </tr>
          <tr className="border-b-2 border-primary bg-primary/5">

            <th className="px-3 py-3 font-semibold text-primary text-xs">Tgl Periksa</th>
            <th className="px-3 py-3 font-semibold text-primary text-xs">Usia</th>
            {isBalita && (
              <th className="px-3 py-3 font-semibold text-primary text-xs">
                Berat Badan Anak (kg)
              </th>
            )}

            {isBalita && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi/Panjang Badan (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs min-w-[140px]">Status Gizi (WHO)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">ASI<br/>Eksklusif</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Imunisasi</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs w-[160px]">Nama Ibu</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs w-[140px]">Penggunaan<br/>Kontrasepsi</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">Bantuan<br/>Sosial</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
            )}

            {isBumil && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Jumlah<br/>Anak</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">HPHT</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Rentang HPL</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Usia Kandungan (mgg)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi Badan Ibu (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Berat Badan Ibu (kg)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tekanan Darah (mmHg)</th>

                <th className="px-3 py-3 font-semibold text-primary text-xs">Lingkar Perut (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi<br/>Fundus (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Riwayat<br/>Penyakit</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Kadar<br/>Hb</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">LILA (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Berat<br/>Janin (kg)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">Rokok</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">KIE</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">TTD</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">MMS</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">Rujukan</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">Bansos</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
            )}

            {isLansia && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi Badan Lansia (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Berat Badan Lansia (kg)</th>

                <th className="px-3 py-3 font-semibold text-primary text-xs">Tekanan Darah (mmHg)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Gula Darah Sewaktu (mg/dL)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Kolesterol (mg/dL)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Asam Urat (mg/dL)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
            )}

            {isPasca && (
              <>
                <th className="px-3 py-3 font-semibold text-primary text-xs min-w-[130px]">Tempat<br/>Persalinan</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs min-w-[140px]">Tgl Persalinan</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi Badan Ibu (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Berat Badan Ibu (kg)</th>

                <th className="px-3 py-3 font-semibold text-primary text-xs">Tekanan Darah (mmHg)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Kondisi Ibu</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Tinggi<br/>Bayi (cm)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Berat<br/>Bayi (kg)</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">KIE</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">Rujukan</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs text-center">Bansos</th>
                <th className="px-3 py-3 font-semibold text-primary text-xs">Catatan</th>
              </>
            )}

            {!isLansia && (
              <th className="px-3 py-3 font-semibold text-primary text-xs">Tgl Kunjungan<br/>Berikutnya</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((warga) => {
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
            
            const latestBumil = sortCheckups(warga.pemeriksaan_bumil)

            
            const latestBalita = sortCheckups(warga.pemeriksaan_balita_baduta)
            const latestLansia = sortCheckups(warga.pemeriksaan_lansia)
            const latestPasca = sortCheckups(warga.pemeriksaan_pasca_persalinan)

            let lastTgl = ''
            let lastBb = ''
            let lastTfuTb = ''
            let lastLingkarPerut = ''
            let lastLilaGds = ''
            let lastJmlAnak = ''
            let lastRiwPen = ''
            let lastTd = ''
            let lastTinggiFundus = ''
            let lastKadarHb = ''
            let lastBeratJanin = ''
            let lastRokok: boolean | undefined = undefined
            let lastKie: boolean | undefined = undefined
            let lastSuplemen = ''
            let lastMms = ''
            let lastRujukan: boolean | undefined = undefined
            let lastBansos: boolean | undefined = undefined
            let lastCatatan = ''
            let lastZScores: any = null
            let lastAsiEksklusif: boolean | undefined = undefined
            let lastKolesterol = ''
            let lastAsamUrat = ''
            let lastKondisiIbu = ''
            let lastTinggiBayi = ''
            let lastBeratBayi = ''

            if (latestBumil) {
              lastTgl = latestBumil.tanggal_kunjungan ? new Date(latestBumil.tanggal_kunjungan).toISOString().split('T')[0] : ''
              lastBb = latestBumil.bb?.toString()
              lastTfuTb = latestBumil.tb?.toString()
              lastLingkarPerut = latestBumil.lingkar_perut?.toString()
              lastLilaGds = latestBumil.lingkar_lengan_atas?.toString()
              lastJmlAnak = latestBumil.jumlah_anak?.toString() || ''
              lastRiwPen = latestBumil.riwayat_penyakit || ''
              lastTd = (latestBumil.tekanan_darah_sistolik && latestBumil.tekanan_darah_diastolik) ? `${latestBumil.tekanan_darah_sistolik}/${latestBumil.tekanan_darah_diastolik}` : ''
              lastTinggiFundus = latestBumil.tinggi_fundus?.toString() || ''
              lastKadarHb = (latestBumil.kadar_hemoglobin && Number(latestBumil.kadar_hemoglobin) > 0) ? latestBumil.kadar_hemoglobin.toString() : ''
              lastBeratJanin = latestBumil.berat_janin?.toString() || ''
              lastRokok = latestBumil.terpapar_rokok ?? undefined
              lastKie = latestBumil.kie ?? undefined
              lastSuplemen = latestBumil.suplemen_tambah_darah?.toString() || ''
              lastMms = latestBumil.mms?.toString() || ''
              lastRujukan = latestBumil.fasilitasi_rujukan ?? undefined
              lastBansos = latestBumil.fasilitasi_bantuan_sosial ?? undefined
              lastCatatan = latestBumil.catatan || ''
            } else if (latestBalita) {
              lastTgl = latestBalita.tanggal_kunjungan ? new Date(latestBalita.tanggal_kunjungan).toISOString().split('T')[0] : ''
              lastBb = latestBalita.bb?.toString()
              lastTfuTb = latestBalita.tb?.toString()
              lastLilaGds = latestBalita.lingkar_lengan_atas?.toString()
              
              const zScores = classifyZScore(
                latestBalita.zscore_bb_u != null ? Number(latestBalita.zscore_bb_u) : null,
                latestBalita.zscore_tb_u != null ? Number(latestBalita.zscore_tb_u) : null,
                latestBalita.zscore_bb_tb != null ? Number(latestBalita.zscore_bb_tb) : null,
                latestBalita.bb,
                latestBalita.tb
              )
              lastZScores = zScores
              
              lastAsiEksklusif = latestBalita.asi_eksklusif ?? undefined
              lastBansos = latestBalita.fasilitasi_bantuan_sosial ?? undefined
              lastCatatan = latestBalita.catatan || ''
            } else if (latestLansia) {
              lastTgl = latestLansia.tanggal_kunjungan ? new Date(latestLansia.tanggal_kunjungan).toISOString().split('T')[0] : ''
              lastBb = latestLansia.bb?.toString()
              lastTfuTb = latestLansia.tb?.toString()
              lastLilaGds = latestLansia.gula_darah_sewaktu?.toString()
              lastTd = (latestLansia.tekanan_darah_sistolik && latestLansia.tekanan_darah_diastolik) ? `${latestLansia.tekanan_darah_sistolik}/${latestLansia.tekanan_darah_diastolik}` : ''
              lastKolesterol = latestLansia.kolesterol?.toString() || ''
              lastAsamUrat = latestLansia.asam_urat?.toString() || ''
              lastCatatan = latestLansia.catatan || ''
            } else if (latestPasca) {
              lastTgl = latestPasca.tanggal_kunjungan ? new Date(latestPasca.tanggal_kunjungan).toISOString().split('T')[0] : ''
              lastBb = latestPasca.bb?.toString()
              lastTfuTb = latestPasca.tb?.toString() || latestBumil?.tb?.toString()
              lastTd = (latestPasca.tekanan_darah_sistolik && latestPasca.tekanan_darah_diastolik) ? `${latestPasca.tekanan_darah_sistolik}/${latestPasca.tekanan_darah_diastolik}` : ''
              lastKondisiIbu = latestPasca.kondisi_ibu || ''
              lastTinggiBayi = latestPasca.tinggi_badan_bayi?.toString() || ''
              lastBeratBayi = latestPasca.berat_badan_bayi?.toString() || ''
              lastKie = latestPasca.kie ?? undefined
              lastRujukan = latestPasca.fasilitasi_rujukan ?? undefined
              lastBansos = latestPasca.fasilitasi_bantuan_sosial ?? undefined
              lastCatatan = latestPasca.catatan || ''
            }

            const row = getRow(warga.id)
            // Provide disabled rendering explicitly for table

            return (
              <tr key={warga.id} className="hover:bg-primary/5 transition-colors group">
                <td className="px-4 py-3 text-slate-500 font-mono text-xs sticky left-0 z-10 bg-white group-hover:bg-slate-50 min-w-[160px] max-w-[160px] w-[160px]">{warga.nik || '-'}</td>
                <td className="px-4 py-3 sticky left-[160px] z-10 bg-white group-hover:bg-slate-50 min-w-[190px] max-w-[190px] w-[190px] border-r border-slate-100 shadow-[1px_0_3px_rgba(0,0,0,0.03)]">
                  <div className="font-semibold text-slate-800 text-sm truncate" title={warga.nama}>{warga.nama}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                </td>
                <td className="px-4 py-3 min-w-[140px] max-w-[180px]">
                  <div className="text-xs font-medium text-slate-700 truncate" title={warga.posyandu?.nama}>
                    {warga.posyandu?.nama || '-'}
                  </div>
                </td>

                <td className="px-3 py-3">
                  <div className="text-xs font-medium text-slate-700 min-w-[90px] px-2 py-1.5 bg-slate-50 rounded-md border border-slate-100 text-center whitespace-nowrap">
                    {lastTgl ? formatDateID(lastTgl) : '-'}
                  </div>
                </td>

                <td className="px-3 py-3">
                  <span className="text-sm font-medium text-slate-700 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 whitespace-nowrap inline-block min-w-[70px] text-center">
                    {calculateAge(warga.tanggal_lahir, lastTgl || row.tanggal, kategori)}
                  </span>
                </td>

                  {isBalita && (
                    <td className="px-3 py-3">
                      <Cell type="number" value={row.bb} onChange={(v) => set(warga.id, 'bb', v)} placeholder={lastBb || '-'} width="w-[70px]" disabled={true} />
                    </td>
                  )}

                  {isBalita && (
                    <>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.tfuTb} onChange={(v) => set(warga.id, 'tfuTb', v)} placeholder={lastTfuTb || '-'} width="w-[70px]" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        {lastZScores ? (
                          <div className="flex flex-col gap-1.5">
                            {lastZScores.kategori_bb_u && (
                               <span className={`text-[10px] px-2 py-0.5 rounded-md w-max ${lastZScores.kategori_bb_u.includes('Kurang') || lastZScores.kategori_bb_u.includes('Lebih') ? 'bg-red-50 text-red-600 border border-red-200 font-bold' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'}`}>
                                 BB/U: {lastZScores.kategori_bb_u}
                               </span>
                            )}
                            {lastZScores.kategori_tb_u && (
                               <span className={`text-[10px] px-2 py-0.5 rounded-md w-max ${lastZScores.kategori_tb_u.includes('Pendek') || lastZScores.kategori_tb_u.includes('Tinggi') ? 'bg-red-50 text-red-600 border border-red-200 font-bold' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'}`}>
                                 TB/U: {lastZScores.kategori_tb_u}
                               </span>
                            )}
                            {lastZScores.kategori_bb_tb && (
                               <span className={`text-[10px] px-2 py-0.5 rounded-md w-max ${lastZScores.kategori_bb_tb.includes('Buruk') || lastZScores.kategori_bb_tb.includes('Kurang') || lastZScores.kategori_bb_tb.includes('Obesitas') ? 'bg-red-50 text-red-600 border border-red-200 font-bold' : lastZScores.kategori_bb_tb.includes('Risiko') ? 'bg-amber-50 text-amber-600 border border-amber-200 font-bold' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'}`}>
                                 BB/TB: {lastZScores.kategori_bb_tb}
                               </span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={lastAsiEksklusif as any} onChange={(v) => set(warga.id, 'asi_eksklusif', v)} width="w-full" disabled={true} />
                    </td>
                    <td className="px-3 py-3">
                      <ImunisasiCell wargaId={warga.id} disabled={true} />
                    </td>
                      <td className="px-3 py-3">
                        <Cell value={row.nama_ibu} onChange={(v) => set(warga.id, 'nama_ibu', v)} placeholder={warga.ibu?.nama || warga.nama_ibu || "-"} width="w-[140px]" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell 
                          type="select"
                          options={['Pil', 'Suntik', 'IUD', 'Implan', 'Kondom', 'MOW', 'MOP', 'Tidak Pakai']}
                          value={row.penggunaan_kontrasepsi} 
                          onChange={(v) => set(warga.id, 'penggunaan_kontrasepsi', v)} 
                          placeholder={warga.penggunaan_kontrasepsi || "-"} 
                          width="w-[120px]" 
                          disabled={true} 
                        />
                      </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={lastBansos as any} onChange={(v) => set(warga.id, 'fasilitasi_bantuan_sosial', v)} width="w-full" disabled={true} />
                    </td>
                      <td className="px-3 py-3">
                        <Cell type="textarea" value={row.catatan} onChange={(v) => set(warga.id, 'catatan', v)} placeholder={lastCatatan || "-"} width="w-[110px]" disabled={true} />
                      </td>
                    </>
                  )}

                  {isBumil && (
                    <>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.jumlah_anak || lastJmlAnak} onChange={(v) => set(warga.id, 'jumlah_anak', v)} placeholder="-" width="w-[60px]" disabled={true} max={20} min={0} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs font-medium text-slate-700 min-w-[100px] px-2 py-1.5 bg-slate-50 rounded-md border border-slate-100 text-center whitespace-nowrap">
                          {warga.hpht ? formatDateID(warga.hpht) : '-'}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs font-medium text-slate-700 min-w-[120px] px-2 py-1.5 bg-slate-50 rounded-md border border-slate-100 text-center whitespace-nowrap">
                          {calculateHplRange(warga.hpht)}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Cell
                          type="number"
                          value={row.usia || calculateUsiaKandungan(warga.hpht, row.tanggal)}
                          onChange={(v) => set(warga.id, 'usia', v)}
                          placeholder="-"
                          width="w-[80px]"
                          disabled={true}
                          max={45} min={0}
                        />
                        {parseInt(row.usia || calculateUsiaKandungan(warga.hpht, row.tanggal) || '0') > 42 && (
                          <div className="text-[10px] text-red-500 font-bold mt-1 text-center leading-tight">Lewat<br/>Waktu!</div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.tfuTb || lastTfuTb} onChange={(v) => set(warga.id, 'tfuTb', v)} placeholder="-" width="w-[70px]" disabled={true} max={250} min={0} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.bb} onChange={(v) => set(warga.id, 'bb', v)} placeholder={lastBb || '-'} width="w-[70px]" disabled={true} max={200} min={0} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="text" value={row.td} onChange={(v) => set(warga.id, 'td', v)} placeholder={lastTd || '-'} width="w-[90px]" disabled={true} />
                      </td>

                      <td className="px-3 py-3">
                        <Cell type="number" value={row.lingkar_perut} onChange={(v) => set(warga.id, 'lingkar_perut', v)} placeholder={lastLingkarPerut || '-'} width="w-[70px]" disabled={true} max={200} min={0} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.tinggi_fundus} onChange={(v) => set(warga.id, 'tinggi_fundus', v)} placeholder={lastTinggiFundus || "-"} width="w-[70px]" disabled={true} max={100} min={0} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell value={row.riwayat_penyakit || lastRiwPen} onChange={(v) => set(warga.id, 'riwayat_penyakit', v)} placeholder="-" width="w-[120px]" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        {(() => {
                          const val = (row.kadar_hemoglobin && Number(row.kadar_hemoglobin) > 0) ? row.kadar_hemoglobin : lastKadarHb;
                          const isRisk = parseFloat(val) > 0 && parseFloat(val) < 11;
                          if (!isRisk) return <Cell type="number" value={row.kadar_hemoglobin} onChange={(v) => set(warga.id, 'kadar_hemoglobin', v)} placeholder={lastKadarHb || "-"} width="w-[60px]" disabled={true} max={30} min={0} />;
                          return (
                            <div className="text-[11px] font-bold px-1.5 py-1 rounded border text-center leading-tight whitespace-nowrap text-red-600 bg-red-50 border-red-200">
                              {val}<br/>
                              <span className="font-medium text-[9px] uppercase tracking-wider">Risiko Anemia</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3">
                        {(() => {
                          const val = row.lilaGds || lastLilaGds;
                          const isRisk = parseFloat(val) > 0 && parseFloat(val) < 23.5;
                          if (!isRisk) return <Cell type="number" value={row.lilaGds} onChange={(v) => set(warga.id, 'lilaGds', v)} placeholder={lastLilaGds || '-'} width="w-[70px]" disabled={true} max={60} min={0} />;
                          return (
                            <div className="text-[11px] font-bold px-1.5 py-1 rounded border text-center leading-tight whitespace-nowrap text-red-600 bg-red-50 border-red-200">
                              {val}<br/>
                              <span className="font-medium text-[9px] uppercase tracking-wider">Risiko KEK</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.berat_janin} onChange={(v) => set(warga.id, 'berat_janin', v)} placeholder={lastBeratJanin || "-"} width="w-[70px]" disabled={true} max={10} min={0} />
                      </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={lastRokok as any} onChange={(v) => set(warga.id, 'terpapar_rokok', v)} width="w-full" disabled={true} />
                    </td>
                    <td className="px-3 py-3">
                      <Cell type="checkbox" value={lastKie as any} onChange={(v) => set(warga.id, 'kie', v)} width="w-full" disabled={true} />
                    </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.suplemen_tambah_darah} onChange={(v) => set(warga.id, 'suplemen_tambah_darah', v)} placeholder={lastSuplemen || "-"} width="w-[70px]" disabled={true} min={0} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.mms} onChange={(v) => set(warga.id, 'mms', v)} placeholder={lastMms || "-"} width="w-[70px]" disabled={true} min={0} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="checkbox" value={lastRujukan as any} onChange={(v) => set(warga.id, 'fasilitasi_rujukan', v)} width="w-full" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="checkbox" value={lastBansos as any} onChange={(v) => set(warga.id, 'fasilitasi_bantuan_sosial', v)} width="w-full" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="textarea" value={row.catatan} onChange={(v) => set(warga.id, 'catatan', v)} placeholder={lastCatatan || "-"} width="w-[110px]" disabled={true} />
                      </td>
                  </>
                )}

                  {isLansia && (
                    <>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.tfuTb} onChange={(v) => set(warga.id, 'tfuTb', v)} placeholder={lastTfuTb || '-'} width="w-[70px]" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.bb} onChange={(v) => set(warga.id, 'bb', v)} placeholder={lastBb || '-'} width="w-[70px]" disabled={true} />
                      </td>

                      <td className="px-3 py-3">
                        {(() => {
                          const val = row.td || lastTd;
                          const status = calculateTDStatus(val);
                          if (!status || status.status === 'Normal') return <Cell type="td" value={row.td} onChange={(v) => set(warga.id, 'td', v)} placeholder={lastTd || '-'} width="w-[140px]" disabled={true} />;
                          return (
                            <div className={`text-[11px] font-bold px-1.5 py-1 rounded border text-center leading-tight whitespace-nowrap ${status.color}`}>
                              {val}<br/>
                              <span className="font-medium text-[9px] uppercase tracking-wider">{status.status}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3">
                        {(() => {
                          const val = row.lilaGds || lastLilaGds;
                          const status = calculateGdsStatus(val);
                          if (!status || status.status === 'Normal') return <Cell type="number" value={row.lilaGds} onChange={(v) => set(warga.id, 'lilaGds', v)} placeholder={lastLilaGds || '-'} width="w-[70px]" disabled={true} />;
                          return (
                            <div className={`text-[11px] font-bold px-1.5 py-1 rounded border text-center leading-tight whitespace-nowrap ${status.color}`}>
                              {val}<br/>
                              <span className="font-medium text-[9px] uppercase tracking-wider">{status.status}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3">
                        {(() => {
                          const val = row.kolesterol || lastKolesterol;
                          const status = calculateKolesterolStatus(val);
                          if (!status || status.status === 'Normal') return <Cell type="number" value={row.kolesterol} onChange={(v) => set(warga.id, 'kolesterol', v)} placeholder={lastKolesterol || "-"} width="w-[70px]" disabled={true} />;
                          return (
                            <div className={`text-[11px] font-bold px-1.5 py-1 rounded border text-center leading-tight whitespace-nowrap ${status.color}`}>
                              {val}<br/>
                              <span className="font-medium text-[9px] uppercase tracking-wider">{status.status}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3">
                        {(() => {
                          const val = row.asam_urat || lastAsamUrat;
                          const status = calculateAsamUratStatus(val, warga.jenis_kelamin);
                          if (!status || status.status === 'Normal') return <Cell type="number" value={row.asam_urat} onChange={(v) => set(warga.id, 'asam_urat', v)} placeholder={lastAsamUrat || "-"} width="w-[70px]" disabled={true} />;
                          return (
                            <div className={`text-[11px] font-bold px-1.5 py-1 rounded border text-center leading-tight whitespace-nowrap ${status.color}`}>
                              {val}<br/>
                              <span className="font-medium text-[9px] uppercase tracking-wider">{status.status}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="textarea" value={row.catatan} onChange={(v) => set(warga.id, 'catatan', v)} placeholder={lastCatatan || "-"} width="w-[110px]" disabled={true} />
                      </td>
                  </>
                )}

                  {isPasca && (
                    <>
                      <td className="px-3 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {warga.tempat_persalinan || '-'}
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="date" value={row.tanggal_persalinan ? formatDateID(row.tanggal_persalinan) : ''} onChange={(v) => set(warga.id, 'tanggal_persalinan', v)} width="w-[130px]" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.tfuTb || lastTfuTb} onChange={(v) => set(warga.id, 'tfuTb', v)} placeholder="-" width="w-[70px]" disabled={true} max={250} min={0} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.bb} onChange={(v) => set(warga.id, 'bb', v)} placeholder={lastBb || '-'} width="w-[70px]" disabled={true} max={200} min={0} />
                      </td>

                      <td className="px-3 py-3">
                        {(() => {
                          const val = row.td || lastTd;
                          const status = calculateTDStatus(val);
                          if (!status || status.status === 'Normal') return <Cell type="td" value={row.td} onChange={(v) => set(warga.id, 'td', v)} placeholder={lastTd || '-'} width="w-[140px]" disabled={true} />;
                          return (
                            <div className={`text-[11px] font-bold px-1.5 py-1 rounded border text-center leading-tight whitespace-nowrap ${status.color}`}>
                              {val}<br/>
                              <span className="font-medium text-[9px] uppercase tracking-wider">{status.status}</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 py-3">
                        <Cell value={row.kondisi_ibu} onChange={(v) => set(warga.id, 'kondisi_ibu', v)} placeholder={lastKondisiIbu || "-"} width="w-[150px]" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.tinggi_badan_bayi} onChange={(v) => set(warga.id, 'tinggi_badan_bayi', v)} placeholder={lastTinggiBayi || "-"} width="w-[70px]" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="number" value={row.berat_badan_bayi} onChange={(v) => set(warga.id, 'berat_badan_bayi', v)} placeholder={lastBeratBayi || "-"} width="w-[70px]" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="checkbox" value={lastKie as any} onChange={(v) => set(warga.id, 'kie', v)} width="w-full" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="checkbox" value={lastRujukan as any} onChange={(v) => set(warga.id, 'fasilitasi_rujukan', v)} width="w-full" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="checkbox" value={lastBansos as any} onChange={(v) => set(warga.id, 'fasilitasi_bantuan_sosial', v)} width="w-full" disabled={true} />
                      </td>
                      <td className="px-3 py-3">
                        <Cell type="textarea" value={row.catatan} onChange={(v) => set(warga.id, 'catatan', v)} placeholder={lastCatatan || "-"} width="w-[110px]" disabled={true} />
                      </td>
                  </>
                )}

                {!isLansia && (
                  <td className="px-3 py-3">
                    <Cell type="date" value={row.tanggal_kunjungan_berikut} onChange={(v) => set(warga.id, 'tanggal_kunjungan_berikut', v)} width="w-[130px]" disabled={true} />
                  </td>
                )}

                <td className="px-4 py-3 border-l border-slate-100 sticky right-0 z-10 bg-white shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
                  <div className="flex flex-col gap-2">
                    {!isReadOnly && (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary-dark text-white h-8 px-3 text-xs w-full flex items-center justify-center gap-1"
                        onClick={() => {
                          setAddRecordWargaId(warga.id)
                          setAddRecordPosyanduId(warga.posyandu_id || null)
                        }}
                      >
                        <Plus className="w-3 h-3" /> Tambah Catatan
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs border-slate-200 text-slate-500 hover:bg-slate-50 w-full flex items-center justify-center gap-1"
                      onClick={() => onView(warga.id, warga.posyandu_id)}
                    >
                      <Edit3 className="w-3 h-3" /> Profil Lengkap
                    </Button>
                    {isBumil && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700 font-semibold w-full mt-1"
                        onClick={() => setConfirmId(warga.id)}
                      >
                        Selesai Kehamilan
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
          {data.length === 0 && (
            <tr>
              <td colSpan={12} className="px-4 py-10 text-center text-slate-400 text-sm">
                Tidak ada pasien ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
      <TandaiBersalinDialog 
        open={!!confirmId} 
        onOpenChange={(open) => {
          if (!open) setConfirmId(null)
        }} 
        wargaId={confirmId} 
        wargaPosyanduId={confirmId ? data.find(x => x.id === confirmId)?.posyandu_id : undefined}
        wargaName={confirmId ? data.find(x => x.id === confirmId)?.nama : undefined}
      />

      
      <MonthlyRecordForm
        open={!!addRecordWargaId}
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => {
              setAddRecordWargaId(null)
              setAddRecordPosyanduId(null)
            }, 300)
          }
        }}
        kategori={kategori}
        wargaId={addRecordWargaId || ''}
        wargaPosyanduId={addRecordPosyanduId || undefined}
        initialData={null}
      />
    </>
  )
}
