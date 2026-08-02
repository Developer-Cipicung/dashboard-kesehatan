import { useEffect, useState, type ChangeEvent } from 'react'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pemeriksaan, pemeriksaanService } from '../services/pemeriksaanService'
import { useCreatePemeriksaan, useUpdatePemeriksaan } from '../hooks/usePemeriksaan'
import { useGetWargaById } from '@/features/warga/hooks/useWarga'
import { imunisasiService, VAKSIN_OPTIONS } from '@/features/warga/services/imunisasiService'
import { calculateTDStatus, calculateGdsStatus, calculateKolesterolStatus, calculateAsamUratStatus } from '@/features/warga/components/PatientTable'

interface MonthlyRecordFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kategori: string
  wargaId: string
  initialData?: Pemeriksaan | null
  previousRecord?: Pemeriksaan | null
  defaultTanggalPersalinan?: string
}

interface OptionalImunisasiValues {
  tambah_imunisasi?: boolean
  imunisasi_jenis_vaksin?: string
  imunisasi_tanggal_pemberian?: string
  tanggal_kunjungan?: string
}

function Field({ label, required, children }: { label: React.ReactNode; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-snug text-slate-700 sm:text-[15px]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ register, name, type = 'text', placeholder, min, max, step, required }: { register: any; name: string; type?: string; placeholder?: string; min?: number; max?: number; step?: string; required?: boolean }) {
  const { formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string
  return (
    <div>
      <input
        {...register(name, { valueAsNumber: type === 'number' ? true : false, required: required ? 'Field ini wajib diisi' : false })}
        type={type}
        min={min}
        max={max}
        step={step || (type === 'number' ? 'any' : undefined)}
        placeholder={placeholder}
        required={required}
        className={`flex h-9 w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground sm:h-10 sm:text-base ${error ? 'border-red-500' : 'border-input'}`}
      />
      {error && <p className="text-[10px] text-red-500 font-bold mt-1 leading-tight">{error}</p>}
    </div>
  )
}

function TdInput({ name }: { name: string }) {
  const { formState: { errors }, register, setValue, watch, clearErrors } = useFormContext()
  const error = (errors[name]?.message || errors['tekanan_darah_sistolik']?.message || errors['tekanan_darah_diastolik']?.message) as string
  
  // Pastikan val selalu string untuk menghindari error split
  const val = (watch(name) || '') as string
  const parts = typeof val === 'string' ? val.split('/') : []
  const s = parts[0] || ''
  const d = parts[1] || ''
  
  const handleChange = (newS: string, newD: string) => {
    let newVal = ''
    if (newS || newD) newVal = `${newS}/${newD}`
    
    setValue(name, newVal, { shouldDirty: true, shouldValidate: true })
    clearErrors(name)
    clearErrors('tekanan_darah_sistolik')
    clearErrors('tekanan_darah_diastolik')
  }

  return (
    <div>
      <input type="hidden" {...register(name)} />
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <input
          type="number"
          value={s}
          onChange={e => handleChange(e.target.value, d)}
          placeholder="Contoh: 120"
          className={`h-9 w-full min-w-0 rounded-md border bg-background px-2 py-2 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base ${error ? 'border-red-500' : 'border-input'}`}
        />
        <span className="text-slate-400 font-bold">/</span>
        <input
          type="number"
          value={d}
          onChange={e => handleChange(s, e.target.value)}
          placeholder="Contoh: 80"
          className={`h-9 w-full min-w-0 rounded-md border bg-background px-2 py-2 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10 sm:text-base ${error ? 'border-red-500' : 'border-input'}`}
        />
      </div>
      {error && <p className="text-[10px] text-red-500 font-bold mt-1 leading-tight">{error}</p>}
    </div>
  )
}

const toDateInputValue = (value?: string | Date | null) => {
  if (!value) return ''
  return new Date(value).toISOString().split('T')[0]
}

const parseNum = (val: any, isInt = false) => {
  if (val === '' || val === null || val === undefined) return undefined;
  const num = isInt ? parseInt(val, 10) : parseFloat(val);
  return isNaN(num) ? undefined : num;
}

export function MonthlyRecordForm({ open, onOpenChange, kategori, wargaId, initialData, previousRecord, defaultTanggalPersalinan }: MonthlyRecordFormProps) {
  const { mutateAsync: createRecord, isPending: isCreating } = useCreatePemeriksaan()
  const { mutateAsync: updateRecord, isPending: isUpdating } = useUpdatePemeriksaan()
  const queryClient = useQueryClient()

  const isBumil = kategori === 'bumil'
  const isLansia = kategori === 'lansia'
  const isPasca = kategori === 'pasca_persalinan' || kategori === 'pasca-persalinan'
  const isBalita = kategori === 'balita' || kategori === 'baduta'
  const isEdit = !!initialData
  
  const { data: wargaResponse } = useGetWargaById(wargaId, undefined)
  const warga = wargaResponse
  const mutationPending = isCreating || isUpdating

  const methods = useForm<any>()
  const { register, handleSubmit, watch, setValue, reset } = methods
  const isPending = mutationPending || methods.formState.isSubmitting
  const [pemeriksaanAlreadySaved, setPemeriksaanAlreadySaved] = useState(false)

  useEffect(() => {
    if (open) {
      const isNew = !initialData;
      const rec: any = initialData || {}
      const prev: any = previousRecord || {}
      const tanggalKunjungan = rec.tanggal_kunjungan ? toDateInputValue(rec.tanggal_kunjungan) : new Date().toISOString().split('T')[0]

      reset({
        tanggal_kunjungan: tanggalKunjungan,
        tanggal_persalinan: toDateInputValue(rec.tanggal_persalinan || defaultTanggalPersalinan) || new Date().toISOString().split('T')[0],
        bb: rec.bb ?? '',
        tb: rec.tb ?? (isNew ? (prev.tb ?? '') : ''),
        lingkar_kepala: rec.lingkar_kepala ?? '',
        lingkar_lengan_atas: rec.lingkar_lengan_atas ?? '',
        lingkar_perut: rec.lingkar_perut ?? '',
        tinggi_fundus: rec.tinggi_fundus ?? '',
        usia_kehamilan_minggu: rec.usia_kehamilan_minggu ?? '',
        td: (rec.tekanan_darah_sistolik && rec.tekanan_darah_diastolik) ? `${rec.tekanan_darah_sistolik}/${rec.tekanan_darah_diastolik}` : '',
        gula_darah_sewaktu: rec.gula_darah_sewaktu ?? '',
        kolesterol: rec.kolesterol ?? '',
        asam_urat: rec.asam_urat ?? '',
        suhu_tubuh: rec.suhu_tubuh ?? '',
        kondisi_ibu: rec.kondisi_ibu ?? '',
        catatan: rec.catatan ?? '',
        kondisi: rec.kondisi ?? '',
        asi_eksklusif: rec.asi_eksklusif ?? false,
        fasilitasi_bantuan_sosial: rec.fasilitasi_bantuan_sosial ?? false,
        jumlah_anak: rec.jumlah_anak ?? (isNew ? (prev.jumlah_anak ?? '') : ''),
        riwayat_penyakit: rec.riwayat_penyakit ?? (isNew ? (prev.riwayat_penyakit ?? '') : ''),
        kadar_hemoglobin: rec.kadar_hemoglobin ?? (isNew ? (prev.kadar_hemoglobin ?? '') : ''),
        berat_janin: rec.berat_janin ?? '',
        terpapar_rokok: rec.terpapar_rokok ?? (isNew ? (prev.terpapar_rokok ?? false) : false),
        kie: rec.kie ?? false,
        suplemen_tambah_darah: rec.suplemen_tambah_darah ?? '',
        mms: rec.mms ?? '',
        tinggi_badan_bayi: rec.tinggi_badan_bayi ?? '',
        berat_badan_bayi: rec.berat_badan_bayi ?? '',
        fasilitasi_rujukan: rec.fasilitasi_rujukan ?? false,
        nama_ibu: rec.nama_ibu ?? (isNew ? (prev.nama_ibu ?? warga?.nama_ibu ?? '') : ''),
        nama_ayah: rec.nama_ayah ?? (isNew ? (prev.nama_ayah ?? warga?.nama_ayah ?? '') : ''),
        penggunaan_kontrasepsi: rec.penggunaan_kontrasepsi ?? (isNew ? (prev.penggunaan_kontrasepsi ?? warga?.penggunaan_kontrasepsi ?? '') : ''),
        tambah_imunisasi: false,
        imunisasi_jenis_vaksin: '',
        imunisasi_tanggal_pemberian: tanggalKunjungan,
        tanggal_kunjungan_berikut: rec.tanggal_kunjungan_berikut ? toDateInputValue(rec.tanggal_kunjungan_berikut) : (isNew ? (() => {
          const d = new Date()
          d.setMonth(d.getMonth() + 1)
          return d.toISOString().split('T')[0]
        })() : ''),
      })
      setPemeriksaanAlreadySaved(false)
    }
  }, [open, initialData, previousRecord, defaultTanggalPersalinan, reset, isBumil])

  const tglWatch = watch('tanggal_kunjungan')
  const bbWatch = watch('bb')
  const tbWatch = watch('tb')
  const lkWatch = watch('lingkar_kepala')
  const tambahImunisasiWatch = watch('tambah_imunisasi')
  const [zscoreData, setZscoreData] = useState<any>(null)

  useEffect(() => {
    const bbVal = parseNum(bbWatch);
    const tbVal = parseNum(tbWatch);
    const lkVal = parseNum(lkWatch);

    if (isBalita && warga && (bbVal !== undefined || tbVal !== undefined || lkVal !== undefined) && tglWatch) {
      const timer = setTimeout(async () => {
        try {
          const res = await pemeriksaanService.calculateZscore({
            jenis_kelamin: warga.jenis_kelamin,
            tanggal_lahir: warga.tanggal_lahir,
            tanggal_kunjungan: tglWatch,
            bb: bbVal,
            tb: tbVal,
            lingkar_kepala: lkVal
          })
          setZscoreData(res)
        } catch (e) {
          console.error(e)
        }
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setZscoreData(null)
    }
  }, [isBalita, warga, bbWatch, tbWatch, lkWatch, tglWatch])

  useEffect(() => {
    if (isBumil && warga?.hpht && tglWatch) {
      const hphtDate = new Date(warga.hpht)
      const tglDate = new Date(tglWatch)
      const diffTime = tglDate.getTime() - hphtDate.getTime()
      if (diffTime >= 0) {
        const weeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
        if (weeks <= 45 && !(initialData as any)?.usia_kehamilan_minggu) {
          setValue('usia_kehamilan_minggu', weeks)
        }
      }
    }
  }, [warga?.hpht, tglWatch, isBumil, setValue, initialData])

  const parseTd = (td: any) => {
    if (typeof td !== 'string') return null
    const p = td.split('/')
    if (p.length !== 2) return null
    const s = parseInt(p[0])
    const d = parseInt(p[1])
    if (isNaN(s) || isNaN(d)) return null
    return { s, d }
  }

  const invalidateImunisasiRelatedQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['imunisasi', wargaId] }),
      queryClient.invalidateQueries({ queryKey: ['warga'] }),
      queryClient.invalidateQueries({ queryKey: ['pemeriksaan_list'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      queryClient.invalidateQueries({ queryKey: ['pendataan'] }),
    ])
  }

  const createOptionalImunisasi = async (values: OptionalImunisasiValues) => {
    const jenisVaksin = values.imunisasi_jenis_vaksin?.trim()
    if (!isBalita || !values.tambah_imunisasi || !jenisVaksin) return

    await imunisasiService.create({
      warga_id: wargaId,
      jenis_vaksin: jenisVaksin,
      tanggal_pemberian: values.imunisasi_tanggal_pemberian || values.tanggal_kunjungan || new Date().toISOString().split('T')[0],
    })
    void invalidateImunisasiRelatedQueries()
  }

  const onSubmit = async (values: any) => {
    try {
      let payload: any = {
        tanggal_kunjungan: values.tanggal_kunjungan,
        catatan: values.catatan || undefined,
        tanggal_kunjungan_berikut: values.tanggal_kunjungan_berikut || undefined,
      }

      if (isBalita) {
        payload = {
          ...payload,
          bb: parseNum(values.bb),
          tb: parseNum(values.tb),
          lingkar_kepala: parseNum(values.lingkar_kepala),
          lingkar_lengan_atas: parseNum(values.lingkar_lengan_atas),
          kondisi: values.kondisi || undefined,
          asi_eksklusif: values.asi_eksklusif ?? undefined,
          fasilitasi_bantuan_sosial: values.fasilitasi_bantuan_sosial ?? undefined,
          nama_ibu: values.nama_ibu || undefined,
          nama_ayah: values.nama_ayah || undefined,
        }
      } else if (isBumil) {
        payload = {
          ...payload,
          bb: parseNum(values.bb),
          tb: parseNum(values.tb),
          lingkar_perut: parseNum(values.lingkar_perut),
          lingkar_lengan_atas: parseNum(values.lingkar_lengan_atas),
          tinggi_fundus: parseNum(values.tinggi_fundus),
          usia_kehamilan_minggu: parseNum(values.usia_kehamilan_minggu, true),
          jumlah_anak: parseNum(values.jumlah_anak, true),
          riwayat_penyakit: values.riwayat_penyakit || undefined,
          kadar_hemoglobin: (() => { const v = parseNum(values.kadar_hemoglobin); return (v && v > 0) ? v : undefined; })(),
          berat_janin: parseNum(values.berat_janin),
          terpapar_rokok: values.terpapar_rokok ?? undefined,
          kie: values.kie ?? undefined,
          suplemen_tambah_darah: parseNum(values.suplemen_tambah_darah, true),
          mms: parseNum(values.mms, true),
          fasilitasi_rujukan: values.fasilitasi_rujukan ?? undefined,
          fasilitasi_bantuan_sosial: values.fasilitasi_bantuan_sosial ?? undefined,
        }
      } else if (isLansia) {
        const td = parseTd(values.td)
        payload = {
          ...payload,
          bb: parseNum(values.bb),
          tb: parseNum(values.tb),
          tekanan_darah_sistolik: td?.s,
          tekanan_darah_diastolik: td?.d,
          gula_darah_sewaktu: parseNum(values.gula_darah_sewaktu),
          kolesterol: parseNum(values.kolesterol),
          asam_urat: parseNum(values.asam_urat),
        }
      } else if (isPasca) {
        const td = parseTd(values.td)
        payload = {
          ...payload,
          tanggal_persalinan: values.tanggal_persalinan || undefined,
          bb: parseNum(values.bb),
          tekanan_darah_sistolik: td?.s,
          tekanan_darah_diastolik: td?.d,
          suhu_tubuh: parseNum(values.suhu_tubuh),
          kondisi_ibu: values.kondisi_ibu || undefined,
          tinggi_badan_bayi: parseNum(values.tinggi_badan_bayi),
          berat_badan_bayi: parseNum(values.berat_badan_bayi),
          kie: values.kie ?? undefined,
          fasilitasi_rujukan: values.fasilitasi_rujukan ?? undefined,
          fasilitasi_bantuan_sosial: values.fasilitasi_bantuan_sosial ?? undefined,
        }
      }

      if (!pemeriksaanAlreadySaved) {
        if (isEdit && initialData) {
          await updateRecord({ kategori, id: initialData.id, payload })
        } else {
          await createRecord({ kategori, payload: { ...payload, warga_id: wargaId } })
        }
      }

      try {
        await createOptionalImunisasi(values)
      } catch (imunisasiError) {
        console.error('Pemeriksaan tersimpan, tetapi imunisasi gagal disimpan', imunisasiError)
        setPemeriksaanAlreadySaved(true)
        toast.error('Pemeriksaan tersimpan, tetapi imunisasi gagal disimpan. Periksa data imunisasi lalu coba simpan lagi.')
        return
      }

      setPemeriksaanAlreadySaved(false)
      reset()
      onOpenChange(false)
      toast.success('Data berhasil disimpan')
    } catch (err: any) {
      console.error(err)
      if (err.response?.data?.errors?.length > 0) {
        err.response.data.errors.forEach((error: any) => {
          if (error.path && error.path.length > 0) {
            let fieldName = error.path[0] as string;
            if (fieldName === 'tekanan_darah_sistolik' || fieldName === 'tekanan_darah_diastolik') {
              fieldName = 'td';
            }
            methods.setError(fieldName as any, { type: 'server', message: error.message });
          }
        });
        toast.error('Gagal menyimpan: periksa kembali isian formulir')
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message)
      } else {
        toast.error('Terjadi kesalahan saat menyimpan data')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!isPending) onOpenChange(nextOpen)
    }}>
      <DialogContent className="max-h-[calc(100dvh-1rem)] max-w-[420px] overflow-x-hidden overflow-y-auto sm:max-w-xl md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Pemeriksaan' : 'Tambah Riwayat Pemeriksaan'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Perbarui data hasil pemeriksaan. Kosongkan kolom jika data tidak diisi.' : 'Tambahkan data hasil pemeriksaan baru. Kosongkan kolom jika data tidak diisi.'}
            {!isEdit && (previousRecord as any)?.tanggal_kunjungan && (
              <span className="mt-2 block rounded-md border border-amber-200 bg-amber-50 p-2 text-xs font-medium text-amber-700">
                Terakhir diperiksa pada: {new Date((previousRecord as any).tanggal_kunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}. Beberapa data sebelumnya disalin secara otomatis.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1 sm:space-y-4 sm:pt-2">
            <Field label="Tanggal Kunjungan">
              <Input register={register} name="tanggal_kunjungan" type="date" />
            </Field>

            {/* Balita / Baduta */}
            {isBalita && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={<>Berat Badan Anak (kg) <span className="text-red-500">*</span></>}><Input register={register} name="bb" type="number" placeholder="Contoh: 8.5" /></Field>
                <Field label={<>Tinggi/Panjang Badan Anak (cm) <span className="text-red-500">*</span></>}><Input register={register} name="tb" type="number" placeholder="Contoh: 72" /></Field>
                <Field label="Lingkar Kepala (cm)"><Input register={register} name="lingkar_kepala" type="number" placeholder="Contoh: 45" /></Field>
                <Field label="Lingkar Lengan Atas / LILA (cm)"><Input register={register} name="lingkar_lengan_atas" type="number" placeholder="Contoh: 15" /></Field>
                <Field label="Kondisi Bayi"><Input register={register} name="kondisi" placeholder="Contoh: Sehat" /></Field>
                <div className="flex min-h-9 items-center gap-2 rounded-md border border-input/60 px-3 py-2 sm:mt-6">
                  <input type="checkbox" id="asi_eksklusif" {...register('asi_eksklusif')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <label htmlFor="asi_eksklusif" className="text-sm font-medium text-slate-700">ASI Eksklusif</label>
                </div>
                <div className="flex min-h-9 items-center gap-2 rounded-md border border-input/60 px-3 py-2 sm:mt-6">
                  <input type="checkbox" id="fasilitasi_bantuan_sosial" {...register('fasilitasi_bantuan_sosial')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <label htmlFor="fasilitasi_bantuan_sosial" className="text-sm font-medium text-slate-700">Bantuan Sosial</label>
                </div>
                {zscoreData && (
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">BB/U (Berat/Umur)</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-800">{zscoreData.bb_u !== null ? zscoreData.bb_u : '-'}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white font-medium text-slate-600">{zscoreData.categories?.kategori_bb_u || '-'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">TB/U (Tinggi/Umur)</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-800">{zscoreData.tb_u !== null ? zscoreData.tb_u : '-'}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white font-medium text-slate-600">{zscoreData.categories?.kategori_tb_u || '-'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">BB/TB (Berat/Tinggi)</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-800">{zscoreData.bb_tb !== null ? zscoreData.bb_tb : '-'}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-200 bg-white font-medium text-slate-600">{zscoreData.categories?.kategori_bb_tb || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/60 p-3 sm:col-span-2 sm:p-4">
                  <div>
                    <h4 className="text-sm font-semibold leading-snug text-slate-800 sm:text-base">Imunisasi</h4>
                    <p className="mt-0.5 text-xs leading-snug text-slate-500 sm:text-sm">
                      Tambahkan riwayat imunisasi jika ada pada kunjungan ini.
                    </p>
                  </div>
                  <div className="flex min-h-9 items-center gap-2 rounded-md border border-input/60 bg-white px-3 py-2">
                    <input
                      type="checkbox"
                      id="tambah_imunisasi"
                      {...register('tambah_imunisasi', {
                        onChange: (event: ChangeEvent<HTMLInputElement>) => {
                          if (event.target.checked) {
                            setValue('imunisasi_tanggal_pemberian', tglWatch || new Date().toISOString().split('T')[0])
                          }
                        },
                      })}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="tambah_imunisasi" className="text-xs font-medium text-slate-700 sm:text-sm">
                      Tambahkan imunisasi pada kunjungan ini
                    </label>
                  </div>

                  {tambahImunisasiWatch && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                      <Field label="Jenis Vaksin">
                        <select
                          {...register('imunisasi_jenis_vaksin')}
                          className="flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:text-base"
                        >
                          <option value="">Pilih vaksin...</option>
                          {VAKSIN_OPTIONS.map((vaksin) => (
                            <option key={vaksin} value={vaksin}>{vaksin}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Tanggal Pemberian">
                        <Input register={register} name="imunisasi_tanggal_pemberian" type="date" />
                      </Field>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ibu Hamil */}
            {isBumil && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Usia Kandungan (Minggu)">
                  <Input register={register} name="usia_kehamilan_minggu" type="number" placeholder="Contoh: 28" max={45} min={0} />
                  {watch('usia_kehamilan_minggu') > 42 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 leading-tight">⚠️ Lewat Waktu (Normal 37-42 mgg)</p>
                  )}
                </Field>
                <Field label={<>Berat Badan (kg) <span className="text-red-500">*</span></>}><Input register={register} name="bb" type="number" placeholder="Contoh: 60.5" max={200} min={0} /></Field>
                <Field label="Tinggi Badan (cm)"><Input register={register} name="tb" type="number" placeholder="Contoh: 155" max={250} min={0} /></Field>

                <Field label="Lingkar Perut (cm)"><Input register={register} name="lingkar_perut" type="number" placeholder="Contoh: 85" max={200} min={0} /></Field>
                <Field label="Tinggi Fundus (cm)"><Input register={register} name="tinggi_fundus" type="number" placeholder="Contoh: 20" max={100} min={0} /></Field>
                <Field label="LILA (cm)">
                  <Input register={register} name="lingkar_lengan_atas" type="number" placeholder="Contoh: 24" max={60} min={0} />
                  {watch('lingkar_lengan_atas') > 0 && watch('lingkar_lengan_atas') < 23.5 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 leading-tight">⚠️ Risiko KEK</p>
                  )}
                </Field>
                <Field label="Riwayat Penyakit"><Input register={register} name="riwayat_penyakit" placeholder="Contoh: Tidak ada" /></Field>
                <Field label="Kadar HB">
                  <Input register={register} name="kadar_hemoglobin" type="number" placeholder="Contoh: 12" max={30} min={0} />
                  {watch('kadar_hemoglobin') > 0 && watch('kadar_hemoglobin') < 11 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 leading-tight">⚠️ Risiko Anemia</p>
                  )}
                </Field>
                <Field label="Berat Janin (kg)"><Input register={register} name="berat_janin" type="number" placeholder="Contoh: 1.5" max={10} min={0} /></Field>
                <div className="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2 sm:gap-3 sm:mt-2">
                  <div className="flex min-h-9 items-center gap-2 rounded-md border border-input/60 px-3 py-2">
                    <input type="checkbox" id="terpapar_rokok" {...register('terpapar_rokok')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="terpapar_rokok" className="text-sm font-medium text-slate-700">Terpapar Rokok</label>
                  </div>
                  <div className="flex min-h-9 items-center gap-2 rounded-md border border-input/60 px-3 py-2">
                    <input type="checkbox" id="kie" {...register('kie')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="kie" className="text-sm font-medium text-slate-700">KIE</label>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:col-span-2 sm:grid-cols-2 sm:mt-2">
                  <Field label="TTD (Tablet)"><Input register={register} name="suplemen_tambah_darah" type="number" placeholder="Contoh: 30" min={0} /></Field>
                  <Field label="MMS (Tablet)"><Input register={register} name="mms" type="number" placeholder="Contoh: 30" min={0} /></Field>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2 sm:gap-3 sm:mt-2">
                  <div className="flex min-h-9 items-center gap-2 rounded-md border border-input/60 px-3 py-2">
                    <input type="checkbox" id="bumil_rujukan" {...register('fasilitasi_rujukan')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="bumil_rujukan" className="text-sm font-medium text-slate-700">Rujukan</label>
                  </div>
                  <div className="flex min-h-9 items-center gap-2 rounded-md border border-input/60 px-3 py-2">
                    <input type="checkbox" id="bumil_bansos" {...register('fasilitasi_bantuan_sosial')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="bumil_bansos" className="text-sm font-medium text-slate-700">Bansos</label>
                  </div>
                </div>
              </div>
            )}

            {/* Lansia */}
            {isLansia && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={<>Berat Badan Lansia (kg) <span className="text-red-500">*</span></>}><Input register={register} name="bb" type="number" placeholder="Contoh: 58" /></Field>
                <Field label="Tinggi Badan Lansia (cm)"><Input register={register} name="tb" type="number" placeholder="Contoh: 160" /></Field>

                <Field label="Tekanan Darah (mmHg)">
                  <div>
                    <TdInput name="td" />
                    {(() => {
                      const td = watch('td')
                      if (td) {
                        const st = calculateTDStatus(td)
                        if (st) {
                          return <div className={`mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded font-bold border ${st.color}`}>{st.status}</div>
                        }
                      }
                      return null
                    })()}
                  </div>
                </Field>
                <Field label="Gula Darah Sewaktu (mg/dL)">
                  <div>
                    <Input register={register} name="gula_darah_sewaktu" type="number" placeholder="Contoh: 120" />
                    {(() => {
                      const gds = watch('gula_darah_sewaktu')
                      if (gds) {
                        const st = calculateGdsStatus(gds)
                        if (st) {
                          return <div className={`mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded font-bold border ${st.color}`}>{st.status}</div>
                        }
                      }
                      return null
                    })()}
                  </div>
                </Field>
                <Field label="Kolesterol (mg/dL)">
                  <div>
                    <Input register={register} name="kolesterol" type="number" placeholder="Contoh: 150" />
                    {(() => {
                      const kol = watch('kolesterol')
                      if (kol) {
                        const st = calculateKolesterolStatus(kol)
                        if (st) {
                          return <div className={`mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded font-bold border ${st.color}`}>{st.status}</div>
                        }
                      }
                      return null
                    })()}
                  </div>
                </Field>
                <Field label="Asam Urat (mg/dL)">
                  <div>
                    <Input register={register} name="asam_urat" type="number" placeholder="Contoh: 5.5" step="0.1" />
                    {(() => {
                      const au = watch('asam_urat')
                      if (au) {
                        const st = calculateAsamUratStatus(au, warga?.jenis_kelamin)
                        if (st) {
                          return <div className={`mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded font-bold border ${st.color}`}>{st.status}</div>
                        }
                      }
                      return null
                    })()}
                  </div>
                </Field>
              </div>
            )}

            {/* Pasca Persalinan */}
            {isPasca && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Tanggal Persalinan"><Input register={register} name="tanggal_persalinan" type="date" /></Field>
                <Field label="Tinggi Badan Ibu (cm)"><Input register={register} name="tb" type="number" placeholder="Contoh: 155" /></Field>
                <Field label="Berat Badan Ibu (kg)" required><Input register={register} name="bb" type="number" placeholder="Contoh: 62" required /></Field>

                <div className="sm:col-span-2">
                  <Field label="Kondisi Ibu"><Input register={register} name="kondisi_ibu" placeholder="Contoh: Baik, tidak ada keluhan" /></Field>
                </div>
                <Field label="Tinggi Bayi (cm)"><Input register={register} name="tinggi_badan_bayi" type="number" placeholder="Contoh: 50" /></Field>
                <Field label="Berat Bayi (kg)"><Input register={register} name="berat_badan_bayi" type="number" placeholder="Contoh: 3.2" /></Field>
                
                <div className="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2 sm:gap-3 sm:mt-2">
                  <div className="flex min-h-9 items-center gap-2 rounded-md border border-input/60 px-3 py-2">
                    <input type="checkbox" id="kie_pasca" {...register('kie')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="kie_pasca" className="text-sm font-medium text-slate-700">KIE</label>
                  </div>
                  <div className="flex min-h-9 items-center gap-2 rounded-md border border-input/60 px-3 py-2">
                    <input type="checkbox" id="fasilitasi_rujukan" {...register('fasilitasi_rujukan')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="fasilitasi_rujukan" className="text-sm font-medium text-slate-700">Fasilitasi Rujukan</label>
                  </div>
                  <div className="flex min-h-9 items-center gap-2 rounded-md border border-input/60 px-3 py-2">
                    <input type="checkbox" id="fasilitasi_bantuan_sosial_pasca" {...register('fasilitasi_bantuan_sosial')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="fasilitasi_bantuan_sosial_pasca" className="text-sm font-medium text-slate-700">Bantuan Sosial</label>
                  </div>
                </div>
              </div>
            )}

            {!isLansia && (
              <Field label="Tgl Kunjungan Berikutnya">
                <Input register={register} name="tanggal_kunjungan_berikut" type="date" />
              </Field>
            )}

            <Field label="Catatan">
              <textarea
                {...register('catatan')}
                rows={2}
                placeholder="Catatan pemeriksaan..."
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground resize-none sm:text-base"
              />
            </Field>

            <div className="sticky bottom-0 -mx-3 -mb-3 grid grid-cols-2 gap-2 border-t bg-popover/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-popover/80 sm:-mx-4 sm:-mb-4 sm:flex sm:justify-end sm:p-4">
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)} className="h-8 w-full text-xs sm:h-9 sm:w-auto sm:text-sm">Batal</Button>
              <Button type="submit" disabled={isPending} className="h-8 w-full text-xs sm:h-9 sm:w-auto sm:text-sm">{isPending ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
