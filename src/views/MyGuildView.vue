<template>
  <div class="my-guild">
    <div class="header-row">
      <h1>{{ guild ? 'Editar gremio' : 'Crear gremio' }}</h1>
      <RouterLink to="/gremios">Ver gremios</RouterLink>
    </div>

    <p v-if="loading">Cargando...</p>

    <template v-else>
      <section v-if="guild" class="applications-section">
        <h2>Postulaciones</h2>
        <p v-if="appsLoading">Cargando postulaciones...</p>
        <div v-else-if="applications.length === 0" class="hex-panel empty-box">
          <p>Aún no recibiste postulaciones.</p>
        </div>
        <div v-else class="applications-list">
          <div v-for="app in applications" :key="app.id" class="app-card hex-panel">
            <div class="app-top">
              <span class="app-status" :class="statusClass(app.status)">{{ app.status }}</span>
              <span class="app-date">{{ formatDate(app.created_at) }}</span>
            </div>
            <p v-if="app.message" class="app-message">{{ app.message }}</p>
            <div class="app-actions">
              <button v-if="app.status !== 'Aceptada'" type="button" class="accept-btn" @click="handleUpdateStatus(app.id, 'Aceptada')">
                ACEPTAR
              </button>
              <button v-if="app.status !== 'Rechazada'" type="button" class="reject-btn" @click="handleUpdateStatus(app.id, 'Rechazada')">
                RECHAZAR
              </button>
            </div>
          </div>
        </div>
      </section>

      <form @submit.prevent="handleSave" class="guild-form hex-panel">
        <div class="logo-row">
          <AvatarDisplay :path="form.logo_url" :name="form.name || 'GR'" :size="80" />
          <div>
            <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="handleLogoChange" />
            <button type="button" @click="fileInput.click()" :disabled="uploading">
              {{ uploading ? 'Subiendo...' : 'Subir logo' }}
            </button>
            <button v-if="form.logo_url" type="button" class="text-link" @click="form.logo_url = null">Quitar logo</button>
          </div>
        </div>

        <label>
          Nombre del gremio
          <input v-model="form.name" required />
        </label>

        <label>
          Tag (ej. NXS)
          <input v-model="form.tag" />
        </label>

        <label>
          Nombre del líder (opcional, si es distinto a tu nick)
          <input v-model="form.leader_name" />
        </label>

        <fieldset>
          <legend>Estado</legend>
          <div class="chip-row">
            <button
              v-for="s in ['Reclutando', 'Cerrado']" :key="s"
              type="button" class="chip" :class="{ active: form.status === s }"
              @click="form.status = s"
            >{{ s }}</button>
          </div>
        </fieldset>

        <label>
          Región
          <select v-model="form.region">
            <option v-for="r in REGIONS" :key="r" :value="r">{{ r }}</option>
          </select>
        </label>

        <fieldset>
          <legend>Aceptamos jugar con</legend>
          <div class="chip-row">
            <button
              v-for="r in sameServerOptions" :key="r"
              type="button" class="chip" :class="{ active: form.play_regions.includes(r) }"
              @click="toggleIn('play_regions', r)"
            >{{ r }}</button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Idioma</legend>
          <div class="chip-row">
            <button
              v-for="l in LANGUAGES" :key="l"
              type="button" class="chip" :class="{ active: form.language === l }"
              @click="form.language = l"
            >{{ l }}</button>
          </div>
        </fieldset>

        <label>
          Partidas mínimas esperadas (opcional)
          <input v-model="form.min_games_week" placeholder="Ej. 3 partidas por semana" />
        </label>

        <label>
          Sobre el gremio
          <textarea v-model="form.description" rows="3" placeholder="Objetivos, ambiente, actividades"></textarea>
        </label>

        <label>
          Requisitos
          <textarea v-model="form.requirements" rows="3" placeholder="Ej. ser activo, tener micrófono, mayor de 16 años"></textarea>
        </label>

        <div class="list-block">
          <p class="list-title">Contactos</p>
          <div v-for="(c, i) in form.contacts" :key="i" class="row-line">
            <input v-model="c.label" placeholder="Red social (ej. Discord)" />
            <input v-model="c.value" placeholder="Usuario o link" />
            <button type="button" class="remove-btn" @click="form.contacts.splice(i, 1)">✕</button>
          </div>
          <button type="button" @click="form.contacts.push({ label: '', value: '' })">+ Agregar contacto</button>
        </div>

        <div class="field-block">
          <p class="field-label">Visibilidad</p>
          <p class="field-hint">Si lo desactivas, tu gremio no aparece en el listado. No se borra.</p>
          <div class="chip-row">
            <button type="button" class="chip" :class="{ active: form.visible }" @click="form.visible = true">Visible</button>
            <button type="button" class="chip" :class="{ active: !form.visible }" @click="form.visible = false">Oculto</button>
          </div>
        </div>

        <p v-if="errorMsg" class="no-result">{{ errorMsg }}</p>

        <button type="submit" :disabled="saving">{{ saving ? 'Guardando...' : 'Guardar gremio' }}</button>
        <button v-if="guild" type="button" class="remove-btn full-width" @click="handleDelete">Eliminar gremio</button>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useGuilds } from '../composables/useGuilds'
import { useGuildApplications } from '../composables/useGuildApplications'
import AvatarDisplay from '../components/AvatarDisplay.vue'

const REGIONS = ['LAN', 'LAS', 'BR', 'NA', 'EUW', 'EUNE', 'SEA', 'JP', 'KR']
const LANGUAGES = ['Español', 'Inglés', 'Portugués']

const REGION_GROUPS = {
  'América': ['LAN', 'LAS', 'NA', 'BR'],
  'Europa': ['EUW', 'EUNE'],
  'Asia': ['SEA', 'JP', 'KR'],
}
function regionGroupOf(region) {
  for (const [group, list] of Object.entries(REGION_GROUPS)) {
    if (list.includes(region)) return group
  }
  return null
}

const { guild, loading, saving, errorMsg, fetchMyGuild, saveGuild, deleteGuild, uploadLogo } = useGuilds()
const { applications, loading: appsLoading, fetchApplications, updateStatus } = useGuildApplications()

const fileInput = ref(null)
const uploading = ref(false)

const form = reactive({
  name: '',
  tag: '',
  logo_url: null,
  leader_name: '',
  region: REGIONS[0],
  play_regions: [],
  language: '',
  min_games_week: '',
  status: 'Reclutando',
  description: '',
  requirements: '',
  contacts: [{ label: 'Discord', value: '' }],
  visible: true,
})

watch(guild, (g) => {
  if (!g) return
  form.name = g.name
  form.tag = g.tag || ''
  form.logo_url = g.logo_url
  form.leader_name = g.leader_name || ''
  form.region = g.region
  form.play_regions = g.play_regions || []
  form.language = g.language || ''
  form.min_games_week = g.min_games_week || ''
  form.status = g.status
  form.description = g.description || ''
  form.requirements = g.requirements || ''
  form.contacts = (g.contacts || []).length ? g.contacts.map(c => ({ ...c })) : [{ label: 'Discord', value: '' }]
  form.visible = g.visible !== false

  fetchApplications(g.id)
})

const sameServerOptions = computed(() => {
  const group = regionGroupOf(form.region)
  if (group) return REGION_GROUPS[group].filter(r => r !== form.region)
  return REGIONS.filter(r => r !== form.region)
})

fetchMyGuild()

function toggleIn(key, value) {
  const list = form[key]
  const idx = list.indexOf(value)
  if (idx === -1) list.push(value)
  else list.splice(idx, 1)
}

async function handleLogoChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  const path = await uploadLogo(file)
  if (path) form.logo_url = path
  uploading.value = false
}

async function handleSave() {
  const payload = {
    name: form.name.trim(),
    tag: form.tag.trim(),
    logo_url: form.logo_url,
    leader_name: form.leader_name.trim(),
    region: form.region,
    play_regions: form.play_regions,
    language: form.language,
    min_games_week: form.min_games_week.trim(),
    status: form.status,
    description: form.description.trim(),
    requirements: form.requirements.trim(),
    visible: form.visible,
    contacts: form.contacts.map(c => ({ label: c.label.trim() || 'Contacto', value: c.value.trim() })).filter(c => c.value),
  }
  const ok = await saveGuild(payload)
  if (ok) await fetchMyGuild()
}

async function handleDelete() {
  if (!confirm('¿Eliminar tu gremio definitivamente?')) return
  await deleteGuild()
}

async function handleUpdateStatus(appId, status) {
  const ok = await updateStatus(appId, status)
  if (ok && guild.value) await fetchApplications(guild.value.id)
}

function statusClass(status) {
  if (status === 'Aceptada') return 'status-accepted'
  if (status === 'Rechazada') return 'status-rejected'
  return 'status-pending'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CL')
}
</script>

<style scoped>
.my-guild {
  max-width: 600px;
  margin: 0 auto;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
}
.header-row a {
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.85em;
}
.applications-section {
  margin-bottom: 2em;
}
.empty-box {
  padding: 1.2em;
}
.applications-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
.app-card {
  padding: 1em;
}
.app-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.app-status {
  font-size: 0.7em;
  padding: 0.2em 0.6em;
  border-radius: 999px;
  border: 1px solid;
}
.status-pending { color: var(--color-gold); border-color: var(--color-gold); }
.status-accepted { color: #8ee7b4; border-color: #8ee7b4; }
.status-rejected { color: var(--color-danger); border-color: var(--color-danger); }
.app-date {
  font-size: 0.7em;
  color: var(--color-text-muted);
}
.app-message {
  margin: 0.6em 0 0;
  font-size: 0.85em;
  color: var(--color-text);
}
.app-actions {
  display: flex;
  gap: 0.6em;
  margin-top: 0.8em;
}
.accept-btn {
  flex: 1;
  background: #8ee7b4;
  color: var(--color-bg);
  border-color: #8ee7b4;
}
.reject-btn {
  flex: 1;
  border-color: var(--color-danger);
  color: var(--color-danger);
}
.guild-form {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
.guild-form label {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.logo-row {
  display: flex;
  align-items: center;
  gap: 1em;
}
.hidden-input {
  display: none;
}
.text-link {
  display: block;
  background: transparent;
  border: none;
  text-decoration: underline;
  color: var(--color-text-muted);
  font-size: 0.85em;
  margin-top: 0.3em;
}
fieldset {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.8em;
}
legend {
  color: var(--color-text-muted);
  font-size: 0.85em;
  padding: 0 0.4em;
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
.list-block {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}
.list-title {
  font-size: 0.8em;
  color: var(--color-text-muted);
  margin: 0;
}
.row-line {
  display: flex;
  gap: 0.5em;
}
.row-line input {
  flex: 1;
}
.remove-btn {
  flex-shrink: 0;
  color: var(--color-danger);
  border-color: var(--color-danger);
}
.field-block {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}
.field-label {
  font-size: 0.8em;
  color: var(--color-text-muted);
  margin: 0;
}
.field-hint {
  font-size: 0.75em;
  color: var(--color-text-muted);
  margin: -0.2em 0 0;
}
.full-width {
  width: 100%;
}
</style>