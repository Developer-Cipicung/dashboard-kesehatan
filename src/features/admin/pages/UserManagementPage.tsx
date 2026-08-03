import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { UserForm } from '../components/UserForm'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { Badge } from '@/components/ui/badge'

export interface User {
  id: string
  auth_id: string
  posyandu_id: string
  nama: string
  username: string
  role: 'kader' | 'bidan' | 'admin'
  is_active: boolean
  posyandu: {
    nama: string
  }
}

export function UserManagementPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingData, setEditingData] = useState<User | null>(null)

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data.data as User[]
    },
  })

  const { mutate: deleteUser } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User berhasil dihapus.')
    },
    onError: () => {
      toast.error('Gagal menghapus user.')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Anda yakin ingin menghapus user ini?')) {
      deleteUser(id)
    }
  }

  const handleEdit = (data: User) => {
    setEditingData(data)
    setIsFormOpen(true)
  }

  if (isLoading) return <SkeletonCard />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen User</h2>
          <p className="text-muted-foreground">Kelola akun dan role (Kader/Bidan/Admin) dalam sistem.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Tambah User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nama</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Username</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Posyandu Assignment</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {users?.map((item) => (
                  <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle font-medium">{item.nama}</td>
                    <td className="p-4 align-middle">{item.username}</td>
                    <td className="p-4 align-middle uppercase text-xs tracking-wider font-semibold">
                      {item.role}
                    </td>
                    <td className="p-4 align-middle font-medium text-primary">
                      {item.posyandu?.nama || '-'}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Aktif' : 'Non-Aktif'}
                      </Badge>
                    </td>
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
                {users?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Belum ada data user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <UserForm
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
