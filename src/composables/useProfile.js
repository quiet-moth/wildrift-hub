import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export function useProfile() {
  const profile = ref(null)
  const loading = ref(true)
  const saving = ref(false)
  const errorMsg = ref('')

  async function fetchMyProfile() {
    loading.value = true
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      loading.value = false
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', auth.user.id)
      .maybeSingle()

    if (error) {
      errorMsg.value = error.message
    } else {
      profile.value = data
    }
    loading.value = false
  }

  async function saveProfile(formData) {
    saving.value = true
    errorMsg.value = ''

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      errorMsg.value = 'Sesión expirada'
      saving.value = false
      return false
    }

    const payload = { ...formData, user_id: auth.user.id }

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'user_id' })

    saving.value = false
    if (error) {
      errorMsg.value = error.message
      return false
    }
    return true
  }

  async function deleteProfile() {
    if (!profile.value) return false
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profile.value.id)

    if (error) {
      errorMsg.value = error.message
      return false
    }
    profile.value = null
    return true
  }

  async function uploadAvatar(file) {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return null

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${auth.user.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (error) {
      errorMsg.value = error.message
      return null
    }
    return path
  }

  return { profile, loading, saving, errorMsg, fetchMyProfile, saveProfile, deleteProfile, uploadAvatar }
}