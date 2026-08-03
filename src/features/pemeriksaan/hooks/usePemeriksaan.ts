import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pemeriksaanService, Pemeriksaan } from '../services/pemeriksaanService'
import { toast } from 'sonner'

export function useGetHistory(kategori: string, wargaId: string, posyanduId?: string) {
  return useQuery({
    queryKey: ['history', kategori, wargaId, posyanduId],
    queryFn: () => pemeriksaanService.getHistory(kategori, wargaId, posyanduId),
    enabled: !!kategori && !!wargaId,
    staleTime: 60 * 1000,
  })
}

export function useGetPemeriksaanList(kategori: string, params: { bulan?: number; tahun?: number; startDate?: string; endDate?: string; limit?: number; posyanduId?: string }) {
  return useQuery({
    queryKey: ['pemeriksaan_list', kategori, params],
    queryFn: () => pemeriksaanService.getAll(kategori, params),
    enabled: !!kategori,
    staleTime: 60 * 1000,
  })
}

export function useGetPemeriksaanById(kategori: string, id: string, posyanduId?: string) {
  return useQuery({
    queryKey: ['pemeriksaan', kategori, id, posyanduId],
    queryFn: () => pemeriksaanService.getById(kategori, id, posyanduId),
    enabled: !!kategori && !!id,
    staleTime: 60 * 1000,
  })
}

export function useCreatePemeriksaan(posyanduId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ kategori, payload }: { kategori: string; payload: Partial<Pemeriksaan> }) =>
      pemeriksaanService.create(kategori, payload, posyanduId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['history', variables.kategori] })
      queryClient.invalidateQueries({ queryKey: ['pemeriksaan_list', variables.kategori] })
      queryClient.invalidateQueries({ queryKey: ['warga'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['pendataan'] })
    },
  })
}

export function useUpdatePemeriksaan(posyanduId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, kategori, payload }: { id: string; kategori: string; payload: Partial<Pemeriksaan> }) =>
      pemeriksaanService.update(kategori, id, payload, posyanduId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['history', variables.kategori] })
      queryClient.invalidateQueries({ queryKey: ['pemeriksaan', variables.kategori, variables.id] })
      queryClient.invalidateQueries({ queryKey: ['pemeriksaan_list', variables.kategori] })
      queryClient.invalidateQueries({ queryKey: ['warga'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['pendataan'] })
    },
  })
}

export function useDeletePemeriksaan(posyanduId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, kategori }: { id: string; kategori: string }) =>
      pemeriksaanService.delete(kategori, id, posyanduId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['history', variables.kategori] })
      queryClient.invalidateQueries({ queryKey: ['pemeriksaan_list', variables.kategori] })
      queryClient.invalidateQueries({ queryKey: ['warga'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['pendataan'] })
      toast.success('Pemeriksaan berhasil dihapus.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus pemeriksaan.')
    },
  })
}
