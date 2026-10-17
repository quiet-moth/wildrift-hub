<template>
  <div v-if="!user" class="panel-box">
    <p>
      <RouterLink to="/auth" class="link-accent">Iniciá sesión</RouterLink>
      para postularte a este equipo.
    </p>
  </div>

  <div v-else-if="user.id === team.user_id" class="panel-box">
    <p>Este es tu equipo. Podés ver las postulaciones en "Mi equipo".</p>
  </div>

  <div v-else-if="existingApplication" class="panel-box">
    <p>Ya enviaste una postulación. Estado: <span class="accent-text">{{ existingApplication.status }}</span>.</p>
  </div>

  <button v-else-if="!formOpen" type="button" class="apply-btn" @click="formOpen = true">
    QUIERO POSTULARME
  </button>

  <div v-else class="panel-box apply-form">
    <p class="form-label">ROL AL QUE TE POSTULÁS</p>
    <div class="chip-row">
      <button
        v-for="o in roleOptions" :key="o"
        type="button" class="chip" :class="{ active: selectedRole === o }"
        @click="selectedRole = o"
      >{{ o || 'Cualquiera' }}</button>
    </div>

    <textarea v-model="message" rows="3" placeholder="Mensaje opcional para el equipo..."></textarea>

    <div class="form-actions">
      <button type="button" :disabled="sending" @click="handleApply">
        {{ sending ? 'ENVIANDO...' : 'ENVIAR POSTULACIÓN' }}
      </button>
      <button type="button" class="cancel-btn" @click="formOpen = false">CANCELAR</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useSession } from '../composables/useSession'

const props = defineProps({
  team: { type: Object, required: true },
  openings: { type: Array, default: () => [] },
})

const ROLES = ['Baron', 'Jungla', 'Mid', 'ADC', 'Support']

const { user } = useSession()
const existingApplication = ref(null)
const formOpen = ref(false)
const sending = ref(false)

const roleOptions = computed(() =>
  props.openings.length ? props.openings.map(o => o.role) : ROLES
)
const selectedRole = ref('')
const message = ref('')

async function fetchExisting() {
  if (!user.value || user.value.id === props.team.user_id) return
  const { data } = await supabase
    .from('team_applications')
    .select('*')
    .eq('team_id', props.team.id)
    .eq('sender_user_id', user.value.id)
    .maybeSingle()
  existingApplication.value = data
}

onMounted(() => {
  selectedRole.value = roleOptions.value[0] || ''
  fetchExisting()
})

async function handleApply() {
  sending.value = true
  const { error } = await supabase.from('team_applications').insert({
    team_id: props.team.id,
    sender_user_id: user.value.id,
    opening_role: selectedRole.value,
    message: message.value.trim(),
    status: 'Pendiente',
  })
  sending.value = false

  if (!error) {
    formOpen.value = false
    fetchExisting()
  }
}
</script>

<style scoped>
.panel-box {
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-border);
  padding: 0.9em;
  font-size: 0.85em;
  color: var(--color-text-muted);
}
.link-accent, .accent-text {
  color: var(--color-teal);
}
.apply-btn {
  width: 100%;
  background: var(--color-gold);
  color: var(--color-bg);
  font-weight: 600;
  padding: 0.7em;
  border-radius: 4px;
}
.apply-form {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}
.form-label {
  font-size: 0.75em;
  color: var(--color-text-muted);
  margin: 0;
}
.chip-row {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}
.chip {
  font-size: 0.8em;
  padding: 0.35em 0.8em;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: transparent;
  border-radius: 999px;
}
.chip.active {
  background: var(--color-gold);
  color: var(--color-bg);
  border-color: var(--color-gold);
}
.form-actions {
  display: flex;
  gap: 0.6em;
}
.cancel-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}
</style>