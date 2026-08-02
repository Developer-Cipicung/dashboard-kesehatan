import { useState } from 'react'
import { SharedPatientList } from '@/features/warga/components/SharedPatientList'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { MapPin } from 'lucide-react'

interface AdminSharedPatientListProps {
  title: string
  kategori: string
}

export function AdminSharedPatientList({ title, kategori }: AdminSharedPatientListProps) {
  const [posyanduId, setPosyanduId] = useState<string>('ALL')

  const { data: posyandus } = useQuery({
    queryKey: ['admin', 'posyandu'],
    queryFn: async () => {
      const response = await api.get('/posyandu')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="flex flex-col space-y-4 max-w-full bg-slate-50/50 min-h-screen pb-10">
      <div className="flex items-center justify-end gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-200 self-end w-full md:w-auto mt-4 mb-2">
        <div className="pl-2 flex items-center text-slate-400">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="text-xs font-medium uppercase tracking-wider">Fokus Area</span>
        </div>
        <Select value={posyanduId} onValueChange={setPosyanduId}>
          <SelectTrigger className="w-full md:w-[200px] border-none shadow-none focus:ring-0 bg-slate-50 font-semibold text-slate-700 h-9">
            <SelectValue placeholder="Pilih Posyandu">
              {posyanduId === 'ALL' ? 'Semua Posyandu' : posyandus?.find((p: any) => p.id === posyanduId)?.nama || 'Pilih Posyandu'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="font-semibold text-primary">Semua Posyandu</SelectItem>
            {posyandus?.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SharedPatientList 
        title={title} 
        kategori={kategori} 
        posyanduIdOverride={posyanduId === 'ALL' ? 'all' : posyanduId} 
        isAdmin={true}
      />
    </div>
  )
}
