import { api } from '@/services/api'
import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export type LoginRequest = z.infer<typeof loginSchema>

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: Record<string, unknown>
    session: {
      access_token: string
    }
  }
}

export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    return response.data
  },
  getMe: async (token?: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    const response = await api.get('/auth/me', { headers })
    return response.data
  },
}
