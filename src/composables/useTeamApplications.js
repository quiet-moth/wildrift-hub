import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export function useTeamApplications() {
  const applications = ref([])
  const loading = ref(true)

  async function fetchApplications(teamId) {
    loading.value = true
    const { data, error } = await supabase
      .from('team_applications')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })

    if (!error) applications.value = data || []
    loading.value = false
  }

  async function updateStatus(applicationId, status) {
    const { error } = await supabase
      .from('team_applications')
      .update({ status })
      .eq('id', applicationId)

    return !error
  }

  return { applications, loading, fetchApplications, updateStatus }
}