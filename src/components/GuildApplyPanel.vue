<template>
  <div v-if="!user" class="panel-box">
    <p>
      <RouterLink to="/auth" class="link-accent">Iniciá sesión</RouterLink>
      para postularte a este gremio.
    </p>
  </div>

  <div v-else-if="user.id === guild.user_id" class="panel-box">
    <p>Este es tu gremio. Podés ver las postulaciones en "Mi gremio".</p>
  </div>

  <div v-else-if="existingApplication" class="panel-box">
    <p>Ya enviaste una postulación. Estado: <span class="accent-text">{{ existingApplication.status }}</span>.</p>
  </div>

  <button v-else-if="!formOpen" type="button" class="apply-btn" @click="formOpen = true">
    QUIERO UNIRME
  </button>

  <div v-else class="panel-box apply-form">
    <textarea v-model="message" rows="3" placeholder="Contanos un poco de vos (opcional)..."></textarea>
    <div class="form-actions">
      <button type="button" :disabled="sending" @click="handleApply">
        {{ sending ? 'ENVIANDO...' : 'ENVIAR POSTULACIÓN' }}
      </button>
      <button type="button" class="cancel-btn" @click="formOpen = false">CANCELAR</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useSession } from '../composables/useSession'

const props = defineProps({
  guild: { type: Object, required: true },
})

const { user } = useSession()
const existingApplication = ref(null)
const formOpen = ref(false)
const sending = ref(false)
const message = ref('')

async function fetchExisting() {
  if (!user.value || user.value.id === props.guild.user_id) return
  const { data } = await supabase
    .from('guild_applications')
    .select('*')
    .eq('guild_id', props.guild.id)
    .eq('sender_user_id', user.value.id)
    .maybeSingle()
  existingApplication.value = data
}

onMounted(fetchExisting)

async function handleApply() {
  sending.value = true
  const { error } = await supabase.from('guild_applications').insert({
    guild_id: props.guild.id,
    sender_user_id: user.value.id,
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