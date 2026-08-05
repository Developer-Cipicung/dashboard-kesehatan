import { useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/forms/FormField'
import { toast } from 'sonner'
import { User } from '../pages/UserManagementPage'
import { Posyandu } from '../pages/PosyanduManagementPage'

const userSchema = z.object({
  nama: z.string().trim().min(1, 'Nama wajib diisi'),
  username: z.string().trim().min(1, 'Username wajib diisi'),
  password: z.string().optional(),
  role: z.enum(['kader', 'bidan', 'admin']),
  posyandu_id: z.string().trim().optional(),
  is_active: z.boolean(),
}).superRefine((data, ctx) => {
  if (data.role !== 'admin' && (!data.posyandu_id || data.posyandu_id.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Posyandu wajib dipilih',
      path: ['posyandu_id'],
    })
  }
  // Validate password manually if needed (done in UI or we can just pass it).
})

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData: User | null
}

export function UserForm({ open, onOpenChange, initialData }: UserFormProps) {
  const queryClient = useQueryClient()

  const { data: posyandus } = useQuery({
    queryKey: ['admin', 'posyandu'],
    queryFn: async () => {
      const response = await api.get('/posyandu')
      return response.data.data as Posyandu[]
    },
  })

  const methods = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nama: initialData?.nama || '',
      username: initialData?.username || '',
      password: '',
      role: initialData?.role || 'kader',
      posyandu_id: initialData?.posyandu_id || '',
      is_active: initialData?.is_active ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      methods.reset({
        nama: initialData?.nama || '',
        username: initialData?.username || '',
        password: '',
        role: initialData?.role || 'kader',
        posyandu_id: initialData?.posyandu_id || '',
        is_active: initialData?.is_active ?? true,
      })
    }
  }, [open, initialData, methods])

  const { mutate: submitUser, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof userSchema>) => {
      const payload = data
      if (initialData) {
        await api.put(`/users/${initialData.id}`, payload)
      } else {
        await api.post('/users', payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success(`User berhasil ${initialData ? 'diperbarui' : 'ditambahkan'}.`)
      methods.reset()
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan user.')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit User' : 'Tambah User'}</DialogTitle>
          <DialogDescription>
            Atur akun pengguna dan assign ke fasilitas Posyandu.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit((data) => submitUser(data as any))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={methods.control as any}
                name="nama"
                label="Nama Lengkap"
                placeholder="Contoh: Siti Aminah"
              />
              <FormField
                control={methods.control as any}
                name="username"
                label="Username"
                placeholder="Contoh: kader_cipicung"
              />
            </div>

            <FormField
              control={methods.control as any}
              name="password"
              label="Password"
              type="password"
              placeholder={initialData ? "Biarkan kosong jika tidak ingin mengubah" : "Password untuk login akun"}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                {...methods.register('role')}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="kader">Kader</option>
                <option value="bidan">Bidan</option>
                <option value="admin">Admin (Super Admin)</option>
              </select>
            </div>

            {methods.watch('role') !== 'admin' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Posyandu</label>
                <select
                  {...methods.register('posyandu_id')}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">-- Pilih Posyandu --</option>
                  {posyandus?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} {p.rw ? `(RW ${p.rw})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <input type="checkbox" id="is_active" {...methods.register('is_active')} />
              <label htmlFor="is_active" className="text-sm font-medium">
                Akun Aktif
              </label>
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
