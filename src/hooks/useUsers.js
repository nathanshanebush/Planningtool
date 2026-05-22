import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const MOCK_USERS_DATA = [
  { id: 'u1', first_name: 'Jordan', last_name: 'Lee', email: 'jordan@example.com', role: 'super_admin', status: 'active', created_at: '2026-01-01T00:00:00Z' },
  { id: 'u2', first_name: 'Alex', last_name: 'Kim', email: 'alex@example.com', role: 'editor', status: 'active', created_at: '2026-02-10T00:00:00Z' },
  { id: 'u3', first_name: 'Morgan', last_name: 'Taylor', email: 'morgan@example.com', role: 'contributor', status: 'active', created_at: '2026-03-15T00:00:00Z' },
  { id: 'u4', first_name: 'Casey', last_name: 'Rivera', email: 'casey@example.com', role: 'viewer', status: 'deactivated', created_at: '2026-04-01T00:00:00Z' },
]

let mockUsers = MOCK_USERS_DATA.map((u) => ({ ...u }))

async function fetchUsers() {
  if (!isSupabaseConfigured) return mockUsers
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: fetchUsers })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      if (!isSupabaseConfigured) {
        const user = mockUsers.find((u) => u.id === id)
        if (user) Object.assign(user, updates)
        return mockUsers.find((u) => u.id === id)
      }
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useAddUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userData) => {
      if (!isSupabaseConfigured) {
        const newUser = { ...userData, id: userData.id ?? `u${Date.now()}`, created_at: userData.created_at ?? new Date().toISOString() }
        mockUsers.push(newUser)
        return newUser
      }
      const { data, error } = await supabase.from('profiles').insert(userData).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      if (!isSupabaseConfigured) {
        const user = mockUsers.find((u) => u.id === id)
        if (user) user.status = 'deactivated'
        return mockUsers.find((u) => u.id === id)
      }
      const { data, error } = await supabase.from('profiles').update({ status: 'deactivated' }).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
}
