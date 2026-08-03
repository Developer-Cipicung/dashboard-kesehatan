import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/forms/FormField'
import { FormProvider } from 'react-hook-form'
import { useAddWarga } from '../hooks/useWarga'
import { AddWargaPayload } from '../services/wargaService'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormControl, FormItem, FormLabel, FormMessage, FormField as RHFFormField } from '@/components/ui/form'
import { pemeriksaanService } from '../../pemeriksaan/services/pemeriksaanService'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { calculateAgeInMonths } from '@/utils/age'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/services/api'
import { useQuery } from '@tanstack/react-query'

const formSchema = z.object({
  posyandu_id: z.string().optional(),
  nik: z.string().optional(),
  nomor: z.string().optional(),
  nama: z.string().min(1, 'Nama wajib diisi'),
  tanggal_lahir: z.string().optional(),
  tempat_lahir: z.string().optional(),
  jenis_kelamin: z.enum(['L', 'P']).optional(),
  kategori: z.string().min(1, 'Kategori wajib diisi'),
  nama_ayah: z.string().optional(),
  nama_ibu: z.string().optional(),
  tanggal_persalinan: z.string().optional(),
  alamat: z.string().optional(),
  rt: z.string().max(3, 'Maksimal 3 karakter').optional(),
  rw: z.string().max(3, 'Maksimal 3 karakter').optional(),
  tempat_persalinan: z.string().optional(),
  penggunaan_kontrasepsi: z.string().optional(),
  jumlah_anak: z.string().optional(),
  hpht: z.string().optional(),
  htp: z.string().optional(),
  ibu_id: z.string().optional(),
})

type PatientCategory = 'balita' | 'baduta' | 'bumil' | 'pasca_persalinan' | 'lansia'

interface PatientFormConfig {
  categoryLabel: string
  nameLabel: string
  phoneLabel: string
  genderDefault: 'L' | 'P'
  lockGender?: boolean
  showParents?: boolean
  showHpht?: boolean
  showDelivery?: boolean
  showContraception?: boolean
  showAnakKe?: boolean
}

const patientFormConfig: Record<PatientCategory, PatientFormConfig> = {
  balita: {
    categoryLabel: 'Balita',
    nameLabel: 'Nama Anak',
    phoneLabel: 'Nomor Telepon Orang Tua/Keluarga',
    genderDefault: 'L',
    showParents: true,
  },
  baduta: {
    categoryLabel: 'Baduta',
    nameLabel: 'Nama Anak',
    phoneLabel: 'Nomor Telepon Orang Tua/Keluarga',
    genderDefault: 'L',
    showParents: true,
  },
  bumil: {
    categoryLabel: 'Ibu Hamil',
    nameLabel: 'Nama Ibu Hamil',
    phoneLabel: 'Nomor Telepon',
    genderDefault: 'P',
    lockGender: true,
    showHpht: true,
    showContraception: true,
    showAnakKe: true,
  },
  pasca_persalinan: {
    categoryLabel: 'Ibu Pasca Persalinan',
    nameLabel: 'Nama Ibu',
    phoneLabel: 'Nomor Telepon',
    genderDefault: 'P',
    lockGender: true,
    showDelivery: true,
  },
  lansia: {
    categoryLabel: 'Lansia',
    nameLabel: 'Nama Lansia',
    phoneLabel: 'Nomor Telepon',
    genderDefault: 'L',
  },
}

const normalizeCategory = (category?: string): PatientCategory | '' => {
  if (category === 'pasca-persalinan') return 'pasca_persalinan'
  if (
    category === 'balita' ||
    category === 'baduta' ||
    category === 'bumil' ||
    category === 'pasca_persalinan' ||
    category === 'lansia'
  ) {
    return category
  }
  return ''
}

const todayInputValue = () => new Date().toISOString().split('T')[0]

const getDefaultValues = (category: PatientCategory | ''): z.infer<typeof formSchema> => {
  const config = category ? patientFormConfig[category] : undefined
  return {
    nik: '',
    nomor: '',
    nama: '',
    tanggal_lahir: '',
    jenis_kelamin: config?.genderDefault || 'L',
    kategori: category,
    nama_ayah: '',
    nama_ibu: '',
    tanggal_persalinan: todayInputValue(),
    tempat_lahir: '',
    alamat: '',
    rt: '',
    rw: '',
    tempat_persalinan: '',
    penggunaan_kontrasepsi: '',
    jumlah_anak: '',
    hpht: '',
    htp: '',
    ibu_id: 'none',
    posyandu_id: '',
  }
}

type PatientFormValues = z.infer<typeof formSchema>
type PregnancyStatus = NonNullable<AddWargaPayload['status_kehamilan']>
type PatientSubmitPayload = Partial<PatientFormValues> & {
  status_kehamilan: PregnancyStatus
}
type InitialPascaRecord = Parameters<typeof pemeriksaanService.create>[1] & {
  tanggal_kunjungan: string
  tanggal_persalinan: string
  bb: number
  tekanan_darah_sistolik: number
  tekanan_darah_diastolik: number
  suhu_tubuh: number
}
type ApiValidationError = {
  response?: {
    data?: {
      message?: string
      errors?: Array<{ message?: string }>
    }
  }
  message?: string
}

interface AddPatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultCategory?: string
  onSuccess?: () => void
}

export function AddPatientDialog({ open, onOpenChange, defaultCategory, onSuccess }: AddPatientDialogProps) {
  const { user } = useAuthStore()
  const isAdmin = (user as any)?.role === 'admin'
  const { data: posyandus } = useQuery({
    queryKey: ['admin', 'posyandu'],
    queryFn: async () => {
      const response = await api.get('/posyandu')
      return response.data.data
    },
    enabled: isAdmin && open,
    staleTime: 5 * 60 * 1000,
  })

  const { mutateAsync: addWarga, isPending } = useAddWarga()
  const queryClient = useQueryClient()
  const normalizedDefaultCategory = normalizeCategory(defaultCategory)

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(normalizedDefaultCategory),
  })

  const watchKategori = useWatch({
    control: methods.control,
    name: 'kategori',
  })
  const watchTanggalLahir = useWatch({
    control: methods.control,
    name: 'tanggal_lahir',
  })
  const watchHpht = useWatch({
    control: methods.control,
    name: 'hpht',
  })
  const isIbuIbu = watchKategori === 'bumil' || watchKategori === 'pasca_persalinan' || watchKategori === 'wus_pus'
  const currentCategory = normalizeCategory(watchKategori)
  const currentConfig = currentCategory ? patientFormConfig[currentCategory] : undefined

  useEffect(() => {
    if (!open) return
    methods.reset(getDefaultValues(normalizedDefaultCategory))
  }, [open, normalizedDefaultCategory, methods])

  useEffect(() => {
    if (currentConfig?.lockGender) {
      methods.setValue('jenis_kelamin', currentConfig.genderDefault)
    }
  }, [currentConfig, methods])

  useEffect(() => {
    if (watchHpht) {
      try {
        const hphtDate = new Date(watchHpht)
        hphtDate.setDate(hphtDate.getDate() + 280)
        methods.setValue('htp', hphtDate.toISOString().split('T')[0])
      } catch (e) {}
    }
  }, [watchHpht, methods])

  useEffect(() => {
    if (watchTanggalLahir) {
      const ageInMonths = calculateAgeInMonths(watchTanggalLahir)
      if (watchKategori === 'baduta' && ageInMonths >= 24) {
        methods.setValue('kategori', 'balita')
        toast.info('Bayi berusia 2 tahun ke atas otomatis masuk ke kategori Balita', { id: 'age-auto-switch-balita' })
      } else if (watchKategori === 'balita' && ageInMonths < 24) {
        methods.setValue('kategori', 'baduta')
        toast.info('Bayi berusia di bawah 2 tahun otomatis masuk ke kategori Baduta', { id: 'age-auto-switch-baduta' })
      }
    }
  }, [watchKategori, watchTanggalLahir, methods])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isAdmin && (!values.posyandu_id || values.posyandu_id.trim() === '')) {
        toast.error('Posyandu tujuan harus dipilih!')
        return
      }

      let status_kehamilan: PregnancyStatus = 'TIDAK_HAMIL'
      if (values.kategori === 'bumil') status_kehamilan = 'HAMIL'
      if (values.kategori === 'pasca_persalinan') status_kehamilan = 'PASCA_PERSALINAN'

      const payload: PatientSubmitPayload = { ...values, status_kehamilan }
      if (values.ibu_id === 'none') {
        delete payload.ibu_id
      }
      if (isIbuIbu) {
        payload.jenis_kelamin = 'P'
      }
      
      const submitPayload: any = { ...payload }
      if (submitPayload.jumlah_anak) {
        submitPayload.jumlah_anak = parseInt(submitPayload.jumlah_anak, 10)
      }

      ;(Object.keys(submitPayload)).forEach((key) => {
        if (submitPayload[key] === '') {
          delete submitPayload[key]
        }
      })
      
      submitPayload.kategori_terdaftar = values.kategori
      if (isAdmin && values.posyandu_id) {
        submitPayload.posyandu_id = values.posyandu_id
      }

      const created = await addWarga({ payload: submitPayload as AddWargaPayload, posyanduId: values.posyandu_id })
      if (values.kategori === 'pasca_persalinan' && values.tanggal_persalinan && created?.id) {
        try {
          const initialPascaRecord: InitialPascaRecord = {
            warga_id: created.id,
            tanggal_kunjungan: new Date().toISOString().split('T')[0],
            tanggal_persalinan: values.tanggal_persalinan,
            bb: 0.1,
            tekanan_darah_sistolik: 120,
            tekanan_darah_diastolik: 80,
            suhu_tubuh: 36.5,
          }
          await pemeriksaanService.create('pasca_persalinan', initialPascaRecord)
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })
          queryClient.invalidateQueries({ queryKey: ['pendataan'] })
          queryClient.invalidateQueries({ queryKey: ['pemeriksaan_list', 'pasca_persalinan'] })
        } catch (err) {
          console.error('Gagal membuat data pasca persalinan awal', (err as any).message || err)
        }
      }

      methods.reset(getDefaultValues(normalizedDefaultCategory))
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error menyimpan form:', (error as any).message || error)
      const apiError = error as ApiValidationError
      let errorMessage = apiError.response?.data?.message || apiError.message || 'Gagal menyimpan data'
      const validationErrors = apiError.response?.data?.errors
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        errorMessage = validationErrors.map((e) => e.message).filter(Boolean).join(', ')
      }
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[420px] overflow-x-hidden overflow-y-auto sm:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Pasien Baru</DialogTitle>
          <DialogDescription>
            Masukkan data pasien sesuai dengan KTP/KK. Field selain "Nama Lengkap" bersifat opsional dan dapat dikosongkan.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            <div className="space-y-5 sm:space-y-6">
              {/* Grup Data Diri */}
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-800 sm:text-sm">Data Diri</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {isAdmin && (
                    <RHFFormField
                      control={methods.control}
                      name="posyandu_id"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2 mb-2">
                          <FormLabel>Posyandu <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 text-sm sm:h-10 sm:text-base border-primary/20 bg-primary/5">
                                <SelectValue placeholder="Pilih Posyandu tujuan pasien">
                                  {posyandus?.find((p: any) => p.id === field.value)?.nama || 'Pilih Posyandu tujuan pasien'}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {posyandus?.map((p: any) => (
                                <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <RHFFormField
                    control={methods.control}
                    name="nik"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-sm leading-snug sm:text-[15px]">
                            NIK
                          </FormLabel>
                          <span className="text-[10px] text-slate-500 font-medium">Kosongkan jika tidak membawa KK/KTP</span>
                        </div>
                        <FormControl>
                          <Input
                            placeholder="Masukkan 16 digit NIK"
                            type="text"
                            className="h-9 px-3 text-sm sm:h-10 sm:text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name="nama"
                    label={<>{currentConfig?.nameLabel || 'Nama Lengkap'} <span className="text-red-500">*</span></>}
                    placeholder="Masukkan nama lengkap"
                    type="text"
                  />
                  <FormField
                    control={methods.control}
                    name="nomor"
                    label={<>{currentConfig?.phoneLabel || 'Nomor Telepon'}</>}
                    placeholder="Contoh: 08123456789"
                    type="text"
                  />
                  {!isIbuIbu && (
                    <RHFFormField
                      control={methods.control}
                      name="jenis_kelamin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Kelamin</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 text-sm sm:h-10 sm:text-base">
                                <SelectValue placeholder="Pilih jenis kelamin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="L">Laki-laki</SelectItem>
                              <SelectItem value="P">Perempuan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {isIbuIbu && (
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="block text-sm font-medium leading-snug sm:text-[15px]">
                        Jenis Kelamin
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-slate-700">Perempuan</span>
                    </div>
                  )}
                  {!defaultCategory && (
                    <RHFFormField
                      control={methods.control}
                      name="kategori"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 text-sm sm:h-10 sm:text-base">
                                <SelectValue placeholder="Pilih kategori pasien" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="baduta">Baduta</SelectItem>
                              <SelectItem value="balita">Balita</SelectItem>
                              <SelectItem value="bumil">Ibu Hamil</SelectItem>
                              <SelectItem value="pasca_persalinan">Ibu Pasca Persalinan</SelectItem>
                              <SelectItem value="lansia">Lansia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Grup Tempat Tanggal Lahir */}
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-800 sm:text-sm">Kelahiran</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <FormField
                    control={methods.control}
                    name="tempat_lahir"
                    label={<>Tempat Lahir</>}
                    placeholder="Contoh: Jakarta"
                    type="text"
                  />
                  <FormField
                    control={methods.control}
                    name="tanggal_lahir"
                    label={<>Tanggal Lahir</>}
                    type="date"
                  />
                </div>
              </div>

              {(currentConfig?.showDelivery || currentConfig?.showHpht || currentConfig?.showParents || currentConfig?.showContraception) && (
                <hr className="border-slate-200" />
              )}

              {/* Detail Kategori Tambahan */}
              {(currentConfig?.showDelivery || currentConfig?.showHpht || currentConfig?.showParents || currentConfig?.showContraception) && (
                <div>
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-800 sm:text-sm">Detail Tambahan</h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {currentConfig?.showDelivery && (
                      <>
                        <FormField
                          control={methods.control}
                          name="tanggal_persalinan"
                          label={<>Tanggal Persalinan</>}
                          type="date"
                        />
                        <FormField
                          control={methods.control}
                          name="tempat_persalinan"
                          label={<>Tempat Persalinan</>}
                          placeholder="Contoh: RSUD / Bidan"
                          type="text"
                        />
                      </>
                    )}
                    {currentConfig?.showHpht && (
                      <>
                        <FormField
                          control={methods.control}
                          name="hpht"
                          label={<>HPHT (Hari Pertama Haid Terakhir)</>}
                          type="date"
                        />
                        <FormField
                          control={methods.control}
                          name="htp"
                          label={<>HPL (Hari Perkiraan Lahir)</>}
                          type="date"
                        />
                      </>
                    )}
                    {currentConfig?.showParents && (
                      <>
                        <FormField
                          control={methods.control}
                          name="nama_ayah"
                          label={<>Nama Ayah</>}
                          placeholder="Contoh: Budi"
                          type="text"
                        />
                        <FormField
                          control={methods.control}
                          name="nama_ibu"
                          label={<>Nama Ibu</>}
                          placeholder="Contoh: Siti"
                          type="text"
                        />
                      </>
                    )}
                    {currentConfig?.showContraception && (
                      <FormField
                        control={methods.control}
                        name="penggunaan_kontrasepsi"
                        label="Penggunaan Kontrasepsi"
                        placeholder="Contoh: Pil / IUD / Tidak Pakai"
                        type="text"
                      />
                    )}
                    {currentConfig?.showAnakKe && (
                      <FormField
                        control={methods.control}
                        name="jumlah_anak"
                        label="Anak Ke"
                        placeholder="Contoh: 2 (kehamilan ke-berapa)"
                        type="number"
                      />
                    )}
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <FormField
                          control={methods.control}
                          name="alamat"
                          label="Alamat Lengkap"
                          placeholder="Contoh: Jl. Mawar No. 12"
                          type="text"
                        />
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <FormField
                            control={methods.control}
                            name="rt"
                            label="RT"
                            placeholder="Contoh: 01"
                            type="text"
                          />
                          <FormField
                            control={methods.control}
                            name="rw"
                            label="RW"
                            placeholder="Contoh: 02"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(!currentCategory || currentCategory === 'lansia') && (
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <FormField
                    control={methods.control}
                    name="alamat"
                    label="Alamat Lengkap"
                    placeholder="Contoh: Jl. Mawar No. 12"
                    type="text"
                  />
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      control={methods.control}
                      name="rt"
                      label="RT"
                      placeholder="Contoh: 01"
                      type="text"
                    />
                    <FormField
                      control={methods.control}
                      name="rw"
                      label="RW"
                      placeholder="Contoh: 02"
                      type="text"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 -mx-3 -mb-3 grid grid-cols-2 gap-2 border-t bg-popover/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-popover/80 sm:-mx-4 sm:-mb-4 sm:flex sm:justify-end sm:p-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-8 w-full text-xs sm:h-9 sm:w-auto sm:text-sm">
                Batal
              </Button>
              <Button type="submit" disabled={isPending} className="h-8 w-full text-xs sm:h-9 sm:w-auto sm:text-sm">
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
