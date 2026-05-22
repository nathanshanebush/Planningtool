import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  currentOrgId: 'org1',
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  setCurrentOrgId: (id) => set({ currentOrgId: id }),
  logout: () => set({ user: null, session: null, currentOrgId: 'org1' }),
}))

export default useAuthStore
