import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const MOCK_DROPDOWNS = {
  'Target Market': [
    'Physical Therapy',
    'Audiology',
    'Ophthalmology',
    'Direct Primary Care (DPC)',
    'Medical Group Management',
    'Oral Surgery',
    'Optometry',
    'Chiropractic',
    'ENT / Hearing',
    'Dental',
    'Veterinary',
    'All Markets',
  ],
  'Budget Category': [
    'Tradeshows / Events',
    'Digital & Online Marketing',
    'Broadcast Media',
    'Outreach & Direct Sales',
    'Affiliate Referrals',
    'Print Media / Direct Mail',
    'Corporate & Brand Initiatives',
    'Admin',
  ],
  'Campaign Type': ['Podcast/Webinar', 'Trade Show', 'Blog', 'Email/SMS', 'Paid Ads', 'Organic Social'],
  'Traffic Source': ['Paid Ads', 'Social Media Organic', 'Email/SMS'],
  'Funnel Step': ['Landing Page', 'Thank You Page', 'Retargeting Page'],
  'Asset Status': ['Not Started', 'In Progress', 'Needs Review', 'Approved', 'Published', 'On Hold'],
  'Priority': ['Low', 'Medium', 'High', 'Urgent'],
  'Tactic Type': [
    'Social Media Post', 'Email', 'SMS', 'Ad Creative', 'Landing Page Copy',
    'Thank You Page Copy', 'Retargeting Page Copy', 'Blog Post', 'Podcast Script',
    'Webinar Slide Deck', 'Video Script', 'Quote Graphic', 'LinkedIn Carousel',
    'Podcast Thumbnail', 'Webinar Thumbnail',
  ],
  'Platform': [
    'LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'Email (GHL)', 'SMS (GHL)',
    'Meta Ads', 'Google Ads', 'Buzzsprout', 'Website',
  ],
  'Content Pillar': [
    'Pain/Problem Awareness', 'Social Proof / Case Study', 'Education / How-To',
    'Myth-Bust', 'Offer / CTA', 'Team / Culture',
  ],
}

async function fetchDropdowns() {
  if (!isSupabaseConfigured) return MOCK_DROPDOWNS
  const { data, error } = await supabase
    .from('dropdown_registry')
    .select('id, name, dropdown_options(id, label, display_order, is_active)')
    .order('created_at')
  if (error) throw error
  const result = {}
  data.forEach((d) => {
    result[d.name] = d.dropdown_options
      .filter((o) => o.is_active)
      .sort((a, b) => a.display_order - b.display_order)
      .map((o) => o.label)
  })
  return result
}

export function useDropdowns() {
  return useQuery({ queryKey: ['dropdowns'], queryFn: fetchDropdowns })
}

export function useDropdownOptions(name) {
  const query = useDropdowns()
  return {
    ...query,
    data: query.data?.[name] ?? [],
  }
}

export function useUpdateDropdownOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ categoryName, oldLabel, newLabel }) => {
      if (!isSupabaseConfigured) {
        if (MOCK_DROPDOWNS[categoryName]) {
          const idx = MOCK_DROPDOWNS[categoryName].indexOf(oldLabel)
          if (idx >= 0) MOCK_DROPDOWNS[categoryName][idx] = newLabel
        }
        return { categoryName, oldLabel, newLabel }
      }
      const { data: reg } = await supabase.from('dropdown_registry').select('id').eq('name', categoryName).single()
      if (!reg) throw new Error('Category not found')
      const { error } = await supabase.from('dropdown_options').update({ label: newLabel }).eq('registry_id', reg.id).eq('label', oldLabel)
      if (error) throw error
      return { categoryName, oldLabel, newLabel }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dropdowns'] }),
  })
}

export function useAddDropdownOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ categoryName, label }) => {
      if (!isSupabaseConfigured) {
        if (MOCK_DROPDOWNS[categoryName] && !MOCK_DROPDOWNS[categoryName].includes(label)) {
          MOCK_DROPDOWNS[categoryName] = [...MOCK_DROPDOWNS[categoryName], label]
        }
        return { categoryName, label }
      }
      const { data: reg } = await supabase.from('dropdown_registry').select('id').eq('name', categoryName).single()
      if (!reg) throw new Error('Category not found')
      const maxOrder = MOCK_DROPDOWNS[categoryName]?.length ?? 99
      const { error } = await supabase.from('dropdown_options').insert({ registry_id: reg.id, label, display_order: maxOrder, is_active: true })
      if (error) throw error
      return { categoryName, label }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dropdowns'] }),
  })
}

export function useDeleteDropdownOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ categoryName, label }) => {
      if (!isSupabaseConfigured) {
        if (MOCK_DROPDOWNS[categoryName]) {
          MOCK_DROPDOWNS[categoryName] = MOCK_DROPDOWNS[categoryName].filter((o) => o !== label)
        }
        return { categoryName, label }
      }
      const { data: reg } = await supabase.from('dropdown_registry').select('id').eq('name', categoryName).single()
      if (!reg) throw new Error('Category not found')
      const { error } = await supabase.from('dropdown_options').update({ is_active: false }).eq('registry_id', reg.id).eq('label', label)
      if (error) throw error
      return { categoryName, label }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dropdowns'] }),
  })
}
