import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const MOCK_ORGS = [
  { id: 'org1', name: 'Snapscale', slug: 'snapscale', plan: 'pro', status: 'active', owner_email: 'nbush@snapscale.com', created_at: '2026-01-01T00:00:00Z', user_count: 4, campaign_count: 13 },
  { id: 'org2', name: 'Acme Marketing', slug: 'acme', plan: 'starter', status: 'active', owner_email: 'admin@acme.com', created_at: '2026-03-15T00:00:00Z', user_count: 2, campaign_count: 3 },
  { id: 'org3', name: 'BlueSky Agency', slug: 'bluesky', plan: 'pro', status: 'active', owner_email: 'cmo@bluesky.io', created_at: '2026-04-01T00:00:00Z', user_count: 6, campaign_count: 7 },
]

let mockOrgs = MOCK_ORGS.map(o => ({ ...o }))

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      if (!isSupabaseConfigured) return mockOrgs
      const { data, error } = await supabase.from('organizations').select('*').order('created_at')
      if (error) throw error
      return data
    },
  })
}

export function useCreateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      if (!isSupabaseConfigured) {
        const newOrg = { ...data, id: `org${Date.now()}`, created_at: new Date().toISOString(), user_count: 1, campaign_count: 0 }
        mockOrgs = [...mockOrgs, newOrg]
        return newOrg
      }
      const { data: result, error } = await supabase.from('organizations').insert(data).select().single()
      if (error) throw error
      return result
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  })
}

export function useUpdateOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      if (!isSupabaseConfigured) {
        mockOrgs = mockOrgs.map(o => o.id === id ? { ...o, ...data } : o)
        return mockOrgs.find(o => o.id === id)
      }
      const { data: result, error } = await supabase.from('organizations').update(data).eq('id', id).select().single()
      if (error) throw error
      return result
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  })
}

export function useDeleteOrganization() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      if (!isSupabaseConfigured) {
        mockOrgs = mockOrgs.filter(o => o.id !== id)
        return id
      }
      const { error } = await supabase.from('organizations').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  })
}
