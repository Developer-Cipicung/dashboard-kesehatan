import { create } from 'zustand'

interface LoginTransitionState {
  showWelcome: boolean
  setShowWelcome: (value: boolean) => void
}

export const useLoginTransitionStore = create<LoginTransitionState>((set) => ({
  showWelcome: false,
  setShowWelcome: (value) => set({ showWelcome: value }),
}))
