import { useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/forms/FormField'
import { toast } from 'sonner'
import { Posyandu } from '../pages/PosyanduManagementPage'

const posyanduSchema = z.object({
  nama: z.string().trim().min(1, 'Nama wajib diisi'),
  rw: z.string().trim().min(1, 'RW wajib diisi'),
})

interface PosyanduFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: Posyandu | null
}

export function PosyanduForm({ open, onOpenChange, initialData }: PosyanduFormProps) {
  const queryClient = useQueryClient()

  const methods = useForm<z.infer<typeof posyanduSchema>>({
    resolver: zodResolver(posyanduSchema),
    defaultValues: {
      nama: initialData?.nama || '',
      rw: initialData?.rw || '',
    },
  })

  useEffect(() => {
    if (open) {
      methods.reset({
        nama: initialData?.nama || '',
        rw: initialData?.rw || '',
      })
    }
  }, [open, initialData, methods])

  const { mutate: submitPosyandu, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof posyanduSchema>) => {
      if (initialData) {
        await api.put(`/posyandu/${initialData.id}`, data)
      } else {
        await api.post('/posyandu', data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posyandu'] })
      toast.success(`Posyandu berhasil ${initialData ? 'diperbarui' : 'ditambahkan'}.`)
      methods.reset()
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan.')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Posyandu' : 'Tambah Posyandu'}</DialogTitle>
          <DialogDescription>
            Masukkan data profil fasilitas Posyandu baru atau ubah data yang sudah ada.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit((data) => submitPosyandu(data as any))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={methods.control as any}
                name="nama"
                label="Nama Posyandu"
                placeholder="Contoh: Mawar 1"
              />
              <FormField
                control={methods.control as any}
                name="rw"
                label="RW"
                placeholder="Contoh: 01"
              />
            </div>

            <div className="flex justify-end pt-4 space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
