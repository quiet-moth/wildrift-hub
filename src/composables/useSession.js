import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const user = ref(null)
const loading = ref(true)
let initialized = false

async function init() {
  if (initialized) return
  initialized = true

  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user ?? null
  loading.value = false

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })
}

export function useSession() {
  init()
  return { user, loading }
}