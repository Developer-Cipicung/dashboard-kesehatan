import { LogOut, User, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function Header() {
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const posyandu = useAuthStore((state) => state.posyandu)
  const userRole = typeof user?.role === 'string' ? user.role : 'Kader'
  const userEmail = typeof user?.email === 'string' ? user.email : 'user@cipicung.com'
  

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-3 md:h-16 md:px-6">
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        {posyandu ? (
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-slate-800 text-sm leading-tight">
                {posyandu.nama}
              </span>
              {posyandu.rw && (
                <span className="text-xs text-muted-foreground leading-tight">
                  RW {posyandu.rw}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate font-semibold text-slate-800 text-sm">Cipicung</span>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-4">
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            }
          />
          <PopoverContent className="w-56" align="end">
            <div className="flex flex-col space-y-2 p-2">
              <div className="flex flex-col space-y-1 gap-2">
                <p className="text-sm font-medium leading-none capitalize">{userEmail.split("@")[0]}</p>
                {posyandu && (
                  <p className="text-xs leading-none text-primary mt-1">
                    {posyandu.nama}
                  </p>
                )}
              </div>
              <div className="border-t my-1" />
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}
