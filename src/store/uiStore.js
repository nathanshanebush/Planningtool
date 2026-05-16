import { create } from 'zustand'

const useUiStore = create((set) => ({
  sidebarOpen: true,
  activePanel: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActivePanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),
}))

export default useUiStore
