import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export function useTeams() {
  const team = ref(null)
  const loading = ref(true)
  const saving = ref(false)
  const errorMsg = ref('')

  async function fetchMyTeam() {
    loading.value = true
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      loading.value = false
      return
    }

    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) errorMsg.value = error.message
    else team.value = data
    loading.value = false
  }

  async function saveTeam(formData) {
    saving.value = true
    errorMsg.value = ''

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      errorMsg.value = 'Sesión expirada'
      saving.value = false
      return false
    }

    const payload = { ...formData, user_id: auth.user.id }

    const { error } = team.value
      ? await supabase.from('teams').update(payload).eq('id', team.value.id)
      : await supabase.from('teams').insert(payload)

    saving.value = false
    if (error) {
      errorMsg.value = error.message
      return false
    }
    return true
  }

  async function deleteTeam() {
    if (!team.value) return false
    const { error } = await supabase.from('teams').delete().eq('id', team.value.id)
    if (error) {
      errorMsg.value = error.message
      return false
    }
    team.value = null
    return true
  }

  async function uploadLogo(file) {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return null

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${auth.user.id}/team-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (error) {
      errorMsg.value = error.message
      return null
    }
    return path
  }

  return { team, loading, saving, errorMsg, fetchMyTeam, saveTeam, deleteTeam, uploadLogo }
}