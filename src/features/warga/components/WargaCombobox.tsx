import { useState, useMemo } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Check, ChevronsUpDown } from 'lucide-react'
import { Warga } from '../services/wargaService'

interface WargaComboboxProps {
  wargaList: Warga[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function WargaCombobox({ wargaList, value, onChange, placeholder = 'Pilih Warga...' }: WargaComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredWarga = useMemo(() => {
    if (!search) return wargaList
    return wargaList.filter(
      (w) =>
        w.nama.toLowerCase().includes(search.toLowerCase()) ||
        (w.nik && w.nik.includes(search))
    )
  }, [wargaList, search])

  const selectedWarga = wargaList.find((w) => w.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full min-w-0 justify-between overflow-hidden text-left"
        />
      }>
        <span className="min-w-0 truncate">
          {value === 'none' ? (
            '-- Ibu Belum Terdaftar --'
          ) : selectedWarga ? (
            `${selectedWarga.nama} (${selectedWarga.nik})`
          ) : (
            placeholder
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Cari nama atau NIK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-none focus-visible:ring-0 shadow-none"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          <button
            onClick={() => {
              onChange('none')
              setOpen(false)
            }}
            className={`relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 ${value === 'none' ? 'bg-slate-100' : ''}`}
          >
            <Check className={`mr-2 h-4 w-4 ${value === 'none' ? 'opacity-100' : 'opacity-0'}`} />
            -- Ibu Belum Terdaftar --
          </button>
          
          {filteredWarga.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Warga tidak ditemukan.</p>
          ) : (
            filteredWarga.map((warga) => (
              <button
                key={warga.id}
                onClick={() => {
                  onChange(warga.id)
                  setOpen(false)
                }}
                className={`relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100 ${value === warga.id ? 'bg-slate-100' : ''}`}
              >
                <Check className={`mr-2 h-4 w-4 ${value === warga.id ? 'opacity-100' : 'opacity-0'}`} />
                <div className="flex min-w-0 flex-col text-left">
                  <span className="truncate font-medium">{warga.nama}</span>
                  <span className="text-xs text-muted-foreground">NIK: {warga.nik}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
