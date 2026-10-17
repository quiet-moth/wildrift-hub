<template>
  <div class="my-team">
    <div class="header-row">
      <h1>{{ team ? 'Editar equipo' : 'Crear equipo' }}</h1>
      <RouterLink to="/equipos">Ver equipos</RouterLink>
    </div>

    <p v-if="loading">Cargando...</p>

    <template v-else>
      <section v-if="team" class="applications-section">
        <h2>Postulaciones</h2>
        <p v-if="appsLoading">Cargando postulaciones...</p>
        <div v-else-if="applications.length === 0" class="hex-panel empty-box">
          <p>Aún no recibiste postulaciones.</p>
        </div>
        <div v-else class="applications-list">
          <div v-for="app in applications" :key="app.id" class="app-card hex-panel">
            <div class="app-top">
              <div>
                <p class="app-label">ROL</p>
                <p class="app-role">{{ app.opening_role || 'Cualquiera' }}</p>
              </div>
              <span class="app-status" :class="statusClass(app.status)">{{ app.status }}</span>
            </div>
            <p v-if="app.message" class="app-message">{{ app.message }}</p>
            <p class="app-date">{{ formatDate(app.created_at) }}</p>
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

      <form @submit.prevent="handleSave" class="team-form hex-panel">
        <div class="logo-row">
          <AvatarDisplay :path="form.logo_url" :name="form.name || 'TF'" :size="80" />
          <div>
            <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="handleLogoChange" />
            <button type="button" @click="fileInput.click()" :disabled="uploading">
              {{ uploading ? 'Subiendo...' : 'Subir logo' }}
            </button>
            <button v-if="form.logo_url" type="button" class="text-link" @click="form.logo_url = null">Quitar logo</button>
          </div>
        </div>

        <label>
          Nombre del equipo
          <input v-model="form.name" required />
        </label>

        <label>
          Tag (ej. NXS)
          <input v-model="form.tag" />
        </label>

        <fieldset>
          <legend>Estado</legend>
          <div class="chip-row">
            <button
              v-for="s in TEAM_STATUS" :key="s"
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
          <legend>Rango mínimo del equipo</legend>
          <div class="chip-row">
            <button
              v-for="r in ['Sin mínimo', ...RANKS]" :key="r"
              type="button" class="chip"
              :class="{ active: r === 'Sin mínimo' ? form.min_rank === '' : form.min_rank === r }"
              @click="form.min_rank = r === 'Sin mínimo' ? '' : r"
            >{{ r }}</button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Modos de juego</legend>
          <div class="chip-row">
            <button
              v-for="m in GAME_MODES" :key="m"
              type="button" class="chip" :class="{ active: form.game_modes.includes(m) }"
              @click="toggleIn('game_modes', m)"
            >{{ m }}</button>
          </div>
        </fieldset>

        <div class="list-block">
          <p class="list-title">Integrantes</p>
          <div v-for="(m, i) in form.members" :key="i" class="list-row">
            <div class="row-line">
              <input v-model="m.name" placeholder="Nombre / Riot ID" />
              <button type="button" class="remove-btn" @click="form.members.splice(i, 1)">✕</button>
            </div>
            <div class="row-line">
              <select v-model="m.role">
                <option v-for="r in ROLES" :key="r" :value="r">{{ r }}</option>
              </select>
              <select v-model="m.rank">
                <option v-for="r in RANKS" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
          </div>
          <button type="button" @click="form.members.push({ name: '', role: ROLES[0], rank: RANKS[0] })">
            + Agregar integrante
          </button>
        </div>

        <div class="list-block">
          <p class="list-title">Vacantes (lo que falta)</p>
          <div v-for="(o, i) in form.openings" :key="i" class="list-row">
            <div class="row-line">
              <select v-model="o.role">
                <option v-for="r in ['Cualquier rol', ...ROLES]" :key="r" :value="r === 'Cualquier rol' ? '' : r">{{ r }}</option>
              </select>
              <button type="button" class="remove-btn" @click="form.openings.splice(i, 1)">✕</button>
            </div>
            <select v-model="o.type">
              <option v-for="t in OPENING_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
            <select v-model="o.min_rank">
              <option value="">Sin rango mínimo</option>
              <option v-for="r in RANKS" :key="r" :value="r">Mínimo {{ r }}</option>
            </select>
            <textarea v-model="o.notes" rows="2" placeholder="Requisitos de la vacante"></textarea>
          </div>
          <button type="button" @click="form.openings.push({ role: ROLES[0], min_rank: '', type: OPENING_TYPES[0], notes: '' })">
            + Agregar vacante
          </button>
        </div>

        <label>
          Sobre el equipo
          <textarea v-model="form.description" rows="3" placeholder="Objetivos, horarios, torneos"></textarea>
        </label>

        <label>
          Requisitos generales
          <textarea v-model="form.requirements" rows="3" placeholder="Ej. mayor de 16, micrófono, 3 días por semana"></textarea>
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

        <p v-if="errorMsg" class="no-result">{{ errorMsg }}</p>

        <button type="submit" :disabled="saving">{{ saving ? 'Guardando...' : 'Guardar equipo' }}</button>
        <button v-if="team" type="button" class="remove-btn full-width" @click="handleDelete">Eliminar equipo</button>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useTeams } from '../composables/useTeams'
import { useTeamApplications } from '../composables/useTeamApplications'
import AvatarDisplay from '../components/AvatarDisplay.vue'

const REGIONS = ['LAN', 'LAS', 'BR', 'NA', 'EUW', 'EUNE', 'SEA', 'JP', 'KR']
const RANKS = ['Hierro', 'Bronce', 'Plata', 'Oro', 'Platino', 'Esmeralda', 'Diamante', 'Maestro', 'Gran Maestro', 'Challenger', 'Soberano']
const ROLES = ['Baron', 'Jungla', 'Mid', 'ADC', 'Support']
const GAME_MODES = ['Competitivo / Torneos', 'Ranked', 'Ranked Legendaria', 'PvP', 'ARAM', 'Modos de aventura', 'Otros modos']
const TEAM_STATUS = ['Reclutando', 'Busca sustitutos', 'Equipo completo']
const OPENING_TYPES = ['Titular', 'Sustituto temporal', 'Sustituto permanente']

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

const { team, loading, saving, errorMsg, fetchMyTeam, saveTeam, deleteTeam, uploadLogo } = useTeams()
const { applications, loading: appsLoading, fetchApplications, updateStatus } = useTeamApplications()

const fileInput = ref(null)
const uploading = ref(false)

const form = reactive({
  name: '',
  tag: '',
  logo_url: null,
  region: REGIONS[0],
  play_regions: [],
  game_modes: [],
  status: TEAM_STATUS[0],
  min_rank: '',
  description: '',
  requirements: '',
  members: [{ name: '', role: ROLES[0], rank: RANKS[0] }],
  openings: [{ role: ROLES[0], min_rank: '', type: OPENING_TYPES[0], notes: '' }],
  contacts: [{ label: 'Discord', value: '' }],
})

watch(team, (t) => {
  if (!t) return
  form.name = t.name
  form.tag = t.tag || ''
  form.logo_url = t.logo_url
  form.region = t.region
  form.play_regions = t.play_regions || []
  form.game_modes = t.game_modes || []
  form.status = t.status
  form.min_rank = t.min_rank || ''
  form.description = t.description || ''
  form.requirements = t.requirements || ''
  form.members = (t.members || []).length ? t.members.map(m => ({ ...m })) : [{ name: '', role: ROLES[0], rank: RANKS[0] }]
  form.openings = (t.openings || []).length ? t.openings.map(o => ({ ...o })) : [{ role: ROLES[0], min_rank: '', type: OPENING_TYPES[0], notes: '' }]
  form.contacts = (t.contacts || []).length ? t.contacts.map(c => ({ ...c })) : [{ label: 'Discord', value: '' }]

  fetchApplications(t.id)
})

const sameServerOptions = computed(() => {
  const group = regionGroupOf(form.region)
  if (group) return REGION_GROUPS[group].filter(r => r !== form.region)
  return REGIONS.filter(r => r !== form.region)
})

fetchMyTeam()

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
    region: form.region,
    play_regions: form.play_regions,
    game_modes: form.game_modes,
    status: form.status,
    min_rank: form.min_rank,
    description: form.description.trim(),
    requirements: form.requirements.trim(),
    members: form.members.map(m => ({ ...m, name: m.name.trim() })).filter(m => m.name),
    openings: form.openings.filter(o => o.role || o.notes.trim()),
    contacts: form.contacts.map(c => ({ label: c.label.trim() || 'Contacto', value: c.value.trim() })).filter(c => c.value),
  }
  const ok = await saveTeam(payload)
  if (ok) await fetchMyTeam()
}

async function handleDelete() {
  if (!confirm('¿Eliminar tu equipo definitivamente?')) return
  await deleteTeam()
}

async function handleUpdateStatus(appId, status) {
  const ok = await updateStatus(appId, status)
  if (ok && team.value) await fetchApplications(team.value.id)
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
.my-team {
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
  align-items: flex-start;
}
.app-label {
  font-size: 0.7em;
  color: var(--color-text-muted);
  margin: 0;
}
.app-role {
  margin: 0.2em 0 0;
  font-weight: 600;
}
.app-status {
  font-size: 0.7em;
  padding: 0.2em 0.6em;
  border-radius: 999px;
  border: 1px solid;
}
.status-pending {
  color: var(--color-gold);
  border-color: var(--color-gold);
}
.status-accepted {
  color: #8ee7b4;
  border-color: #8ee7b4;
}
.status-rejected {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
.app-message {
  margin: 0.6em 0 0;
  font-size: 0.85em;
  color: var(--color-text);
}
.app-date {
  margin: 0.4em 0 0;
  font-size: 0.7em;
  color: var(--color-text-muted);
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
.team-form {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
.team-form label {
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
.list-row {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  border: 1px solid var(--color-border);
  padding: 0.8em;
  border-radius: 4px;
}
.row-line {
  display: flex;
  gap: 0.5em;
}
.row-line input, .row-line select {
  flex: 1;
}
.remove-btn {
  flex-shrink: 0;
  color: var(--color-danger);
  border-color: var(--color-danger);
}
.full-width {
  width: 100%;
}
</style>