import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PosyanduForm } from '../components/PosyanduForm'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'

export interface Posyandu {
  id: string
  nama: string
  rw: string
}

export function PosyanduManagementPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingData, setEditingData] = useState<Posyandu | null>(null)

  const { data: posyandus, isLoading } = useQuery({
    queryKey: ['admin', 'posyandu'],
    queryFn: async () => {
      const response = await api.get('/posyandu')
      return response.data.data as Posyandu[]
    },
  })

  const { mutate: deletePosyandu } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/posyandu/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posyandu'] })
      toast.success('Posyandu berhasil dihapus.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus posyandu.')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Anda yakin ingin menghapus posyandu ini?')) {
      deletePosyandu(id)
    }
  }

  const handleEdit = (data: Posyandu) => {
    setEditingData(data)
    setIsFormOpen(true)
  }

  if (isLoading) return <SkeletonCard />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Posyandu</h2>
          <p className="text-muted-foreground">Kelola fasilitas Posyandu dalam sistem.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Tambah Posyandu
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr className="border-b transition-colors">
                  <th className="h-12 px-4 text-left align-middle font-medium">Nama Posyandu</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">RW</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {posyandus?.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{item.nama}</td>
                    <td className="p-4 align-middle">{item.rw}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posyandus?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Belum ada data posyandu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <PosyanduForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setTimeout(() => setEditingData(null), 200)
        }}
        initialData={editingData}
      />
    </div>
  )
}
