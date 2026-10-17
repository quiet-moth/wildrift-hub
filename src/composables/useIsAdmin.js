import { ref, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useSession } from './useSession'

export function useIsAdmin() {
  const { user } = useSession()
  const isAdmin = ref(false)

  async function check() {
    if (!user.value) {
      isAdmin.value = false
      return
    }
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.value.id)
      .eq('role', 'admin')
      .maybeSingle()
    isAdmin.value = !!data
  }

  watch(user, check, { immediate: true })

  return { isAdmin }
}