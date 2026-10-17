import { ref, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useSession } from './useSession'

export function useSyncedStore(key, defaultValue) {
  const stored = localStorage.getItem(key)
  const value = ref(stored ? JSON.parse(stored) : defaultValue)

  let suppressPush = false
  let pushTimeout = null

  async function pushToSupabase(userId, val) {
    await supabase.from('user_data').upsert(
      { user_id: userId, key, data: val },
      { onConflict: 'user_id,key' }
    )
  }

  async function pullFromSupabase(userId) {
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', userId)
      .eq('key', key)
      .maybeSingle()

    if (error) return

    if (data) {
      suppressPush = true
      value.value = data.data
    } else {
      await pushToSupabase(userId, value.value)
    }
  }

  watch(value, (val) => {
    localStorage.setItem(key, JSON.stringify(val))

    if (suppressPush) {
      suppressPush = false
      return
    }

    const { user } = useSession()
    if (!user.value) return

    clearTimeout(pushTimeout)
    pushTimeout = setTimeout(() => pushToSupabase(user.value.id, val), 800)
  }, { deep: true })

  const { user } = useSession()
  watch(user, (u) => {
    if (u) pullFromSupabase(u.id)
  }, { immediate: true })

  return value
}