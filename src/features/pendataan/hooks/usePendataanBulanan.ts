import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pendataanBulananService } from '../services/pendataanBulananService'
import { toast } from 'sonner'



export function useGetPendataanStatus(bulan: number, tahun: number, posyanduId?: string) {
  return useQuery({
    queryKey: ['pendataan', 'status', bulan, tahun, posyanduId],
    queryFn: () => pendataanBulananService.getStatus(bulan, tahun, posyanduId),
    enabled: !!bulan && !!tahun,
    staleTime: 60 * 1000,
  })
}

export function useGetPendataanSummary(bulan: number, tahun: number, posyanduId?: string) {
  return useQuery({
    queryKey: ['pendataan', 'summary', bulan, tahun, posyanduId],
    queryFn: () => pendataanBulananService.getSummary(bulan, tahun, posyanduId),
    enabled: !!bulan && !!tahun,
    staleTime: 60 * 1000,
  })
}

export function useGetPendataanGlobalStatus(bulan: number, tahun: number, posyanduId?: string) {
  return useQuery({
    queryKey: ['pendataan', 'global', bulan, tahun, posyanduId],
    queryFn: () => pendataanBulananService.getGlobalStatus(bulan, tahun, posyanduId),
    enabled: !!bulan && !!tahun,
    staleTime: 60 * 1000,
  })
}

export function useGetAdminStatusPendataan(tahun: number, enabled = true) {
  return useQuery({
    queryKey: ['pendataan', 'admin', 'status', tahun],
    queryFn: () => pendataanBulananService.getAdminStatus(tahun),
    enabled: !!tahun && enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubmitPendataan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string, tanggal_pelaksanaan: string }) => pendataanBulananService.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendataan'] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
      queryClient.invalidateQueries({ queryKey: ['pemeriksaan_list'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['warga'] })
      toast.success('Pendataan berhasil diselesaikan dan dikunci.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menyelesaikan pendataan.')
    },
  })
}

export function useBatalkanPendataan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pendataanBulananService.unsubmit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendataan'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Verifikasi dibatalkan. Status kembali ke Draft.')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membatalkan verifikasi.')
    },
  })
}
