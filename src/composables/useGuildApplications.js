import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export function useGuildApplications() {
  const applications = ref([])
  const loading = ref(true)

  async function fetchApplications(guildId) {
    loading.value = true
    const { data, error } = await supabase
      .from('guild_applications')
      .select('*')
      .eq('guild_id', guildId)
      .order('created_at', { ascending: false })

    if (!error) applications.value = data || []
    loading.value = false
  }

  async function updateStatus(applicationId, status) {
    const { error } = await supabase
      .from('guild_applications')
      .update({ status })
      .eq('id', applicationId)

    return !error
  }

  return { applications, loading, fetchApplications, updateStatus }
}