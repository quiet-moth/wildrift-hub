import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export function useGuilds() {
  const guild = ref(null)
  const loading = ref(true)
  const saving = ref(false)
  const errorMsg = ref('')

  async function fetchMyGuild() {
    loading.value = true
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      loading.value = false
      return
    }

    const { data, error } = await supabase
      .from('guilds')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) errorMsg.value = error.message
    else guild.value = data
    loading.value = false
  }

  async function saveGuild(formData) {
    saving.value = true
    errorMsg.value = ''

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      errorMsg.value = 'Sesión expirada'
      saving.value = false
      return false
    }

    const payload = { ...formData, user_id: auth.user.id }

    const { error } = guild.value
      ? await supabase.from('guilds').update(payload).eq('id', guild.value.id)
      : await supabase.from('guilds').insert(payload)

    saving.value = false
    if (error) {
      errorMsg.value = error.message
      return false
    }
    return true
  }

  async function deleteGuild() {
    if (!guild.value) return false
    const { error } = await supabase.from('guilds').delete().eq('id', guild.value.id)
    if (error) {
      errorMsg.value = error.message
      return false
    }
    guild.value = null
    return true
  }

  async function uploadLogo(file) {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return null

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${auth.user.id}/guild-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (error) {
      errorMsg.value = error.message
      return null
    }
    return path
  }

  return { guild, loading, saving, errorMsg, fetchMyGuild, saveGuild, deleteGuild, uploadLogo }
}