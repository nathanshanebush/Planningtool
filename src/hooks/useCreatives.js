import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

let mockAssets = [
  {
    id: 'a1', tactic_id: 't1', file_name: 'podcast-email-header.png',
    file_url: null, file_type: 'image/png', uploaded_by: 'Jordan Lee',
    status: 'needs_revision', created_at: '2026-05-10T10:00:00Z',
    feedback: [
      { id: 'f1', asset_id: 'a1', author: 'Alex Kim', type: 'revision', comment: 'Please increase font size on the CTA button and make the background gradient darker.', created_at: '2026-05-11T09:00:00Z' },
    ]
  },
  {
    id: 'a2', tactic_id: 't4', file_name: 'google-ad-v1.jpg',
    file_url: null, file_type: 'image/jpeg', uploaded_by: 'Morgan Taylor',
    status: 'approved', created_at: '2026-05-12T14:00:00Z',
    feedback: [
      { id: 'f2', asset_id: 'a2', author: 'Jordan Lee', type: 'approve', comment: 'Looks great, approved for launch!', created_at: '2026-05-13T11:00:00Z' },
    ]
  },
]

export function useCreatives(tacticId) {
  return useQuery({
    queryKey: ['creatives', tacticId],
    queryFn: async () => {
      if (!isSupabaseConfigured) return mockAssets.filter(a => a.tactic_id === tacticId)
      const { data, error } = await supabase
        .from('creative_assets')
        .select('*, creative_feedback(*)')
        .eq('tactic_id', tacticId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!tacticId,
  })
}

export function useUploadCreative() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ tacticId, file, uploadedBy }) => {
      if (!isSupabaseConfigured) {
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
        const newAsset = {
          id: `a${Date.now()}`,
          tactic_id: tacticId,
          file_name: file.name,
          file_url: dataUrl,
          file_type: file.type,
          uploaded_by: uploadedBy ?? 'You',
          status: 'pending',
          created_at: new Date().toISOString(),
          feedback: [],
        }
        mockAssets = [...mockAssets, newAsset]
        return newAsset
      }
      const path = `${tacticId}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('creatives').upload(path, file)
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('creatives').getPublicUrl(path)
      const { data, error } = await supabase.from('creative_assets').insert({
        tactic_id: tacticId, file_name: file.name, file_url: publicUrl,
        file_type: file.type, uploaded_by: uploadedBy ?? 'Unknown', status: 'pending',
      }).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['creatives', data.tactic_id] }),
  })
}

export function useAddCreativeFeedback() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ assetId, tacticId, author, type, comment }) => {
      if (!isSupabaseConfigured) {
        const newFeedback = { id: `f${Date.now()}`, asset_id: assetId, author, type, comment, created_at: new Date().toISOString() }
        mockAssets = mockAssets.map(a => {
          if (a.id !== assetId) return a
          const statusMap = { approve: 'approved', revision: 'needs_revision', reject: 'rejected' }
          return { ...a, status: statusMap[type] ?? a.status, feedback: [...(a.feedback ?? []), newFeedback] }
        })
        return newFeedback
      }
      const { data, error } = await supabase.from('creative_feedback').insert({ asset_id: assetId, author, type, comment }).select().single()
      if (error) throw error
      const statusMap = { approve: 'approved', revision: 'needs_revision', reject: 'rejected' }
      await supabase.from('creative_assets').update({ status: statusMap[type] }).eq('id', assetId)
      return data
    },
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['creatives', vars.tacticId] }),
  })
}

export function useDeleteCreative() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ assetId, tacticId }) => {
      if (!isSupabaseConfigured) {
        mockAssets = mockAssets.filter(a => a.id !== assetId)
        return assetId
      }
      const { error } = await supabase.from('creative_assets').delete().eq('id', assetId)
      if (error) throw error
      return assetId
    },
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['creatives', vars.tacticId] }),
  })
}
