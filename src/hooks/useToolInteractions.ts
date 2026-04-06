import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type InteractionType = 'is_bookmarked' | 'is_liked' | 'is_saved'

export interface ToolInteraction {
  tool_slug: string
  tool_name: string
  tool_logo?: string
  tool_category?: string
  is_bookmarked: boolean
  is_liked: boolean
  is_saved: boolean
}

// Hook dùng trên từng tool card — toggle bookmark/like/save
export function useToolInteraction(tool: {
  slug: string
  name: string
  logo?: string
  category?: string
}) {
  const { user } = useAuth()
  const [state, setState] = useState({
    is_bookmarked: false,
    is_liked: false,
    is_saved: false,
  })
  const [loading, setLoading] = useState(false)

  // Load trạng thái hiện tại của tool này
  useEffect(() => {
    if (!user) return
    supabase
      .from('tool_interactions')
      .select('is_bookmarked, is_liked, is_saved')
      .eq('user_id', user.id)
      .eq('tool_slug', tool.slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setState({
          is_bookmarked: data.is_bookmarked,
          is_liked: data.is_liked,
          is_saved: data.is_saved,
        })
      })
  }, [user, tool.slug])

  const toggle = useCallback(async (type: InteractionType) => {
    if (!user) {
      alert('Please log in to use this feature!')
      return
    }
    const newValue = !state[type]
    setState(prev => ({ ...prev, [type]: newValue }))
    setLoading(true)

    const { error } = await supabase
      .from('tool_interactions')
      .upsert({
        user_id: user.id,
        tool_slug: tool.slug,
        tool_name: tool.name,
        tool_logo: tool.logo,
        tool_category: tool.category,
        [type]: newValue,
      }, {
        onConflict: 'user_id,tool_slug',
        ignoreDuplicates: false,
      })

    if (error) {
      // Rollback nếu lỗi
      setState(prev => ({ ...prev, [type]: !newValue }))
      console.error(error)
    }
    setLoading(false)
  }, [user, tool, state])

  return { ...state, toggle, loading, isLoggedIn: !!user }
}

// Hook dùng trong trang Dashboard — lấy toàn bộ tools đã tương tác
export function useUserLibrary() {
  const { user } = useAuth()
  const [interactions, setInteractions] = useState<ToolInteraction[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('tool_interactions')
      .select('*')
      .eq('user_id', user.id)
      .or('is_bookmarked.eq.true,is_liked.eq.true,is_saved.eq.true')
      .order('updated_at', { ascending: false })

    setInteractions(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const bookmarked = interactions.filter(i => i.is_bookmarked)
  const liked      = interactions.filter(i => i.is_liked)
  const saved      = interactions.filter(i => i.is_saved)

  return { bookmarked, liked, saved, loading, refresh: fetch }
}