import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wargaService, GetWargaParams, AddWargaPayload } from '../services/wargaService'
import { toast } from 'sonner'

export function useGetWargaList(params?: GetWargaParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['warga', 'list', params],
    queryFn: () => wargaService.getWargaList(params),
    enabled: options?.enabled ?? true,
    staleTime: 2 * 60 * 1000,
  })
}

export function useGetWargaById(id: string, posyanduId?: string) {
  return useQuery({
    queryKey: ['warga', 'detail', id, posyanduId],
    queryFn: () => wargaService.getWargaById(id, posyanduId),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAddWarga() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddWargaPayload) => wargaService.addWarga(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warga'] })
      toast.success('Pasien berhasil ditambahkan.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan pasien.')
    },
  })
}

export function useDeleteWarga() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => wargaService.deleteWarga(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warga'] })
      toast.success('Pasien berhasil dihapus.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus pasien.')
    },
  })
}

export function useUpdateWarga() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: Partial<AddWargaPayload> }) => wargaService.updateWarga(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warga'] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
      queryClient.invalidateQueries({ queryKey: ['pemeriksaan_list'] })
    },
    onError: (error: any) => {
      console.error(error)
    },
  })
}

export function useTandaiBersalin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: { tanggal_persalinan: string; tempat_persalinan?: string; nama_bayi?: string; jenis_kelamin_bayi: 'L' | 'P'; nama_ayah?: string } }) => wargaService.tandaiBersalin(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warga'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Pasien berhasil ditandai telah bersalin dan data bayi didaftarkan.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menandai bersalin.')
    },
  })
}
