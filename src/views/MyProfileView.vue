<template>
  <div class="my-profile">
    <h1>{{ profile ? 'Editar perfil' : 'Crear perfil' }}</h1>

    <p v-if="loading">Cargando...</p>

    <form v-else @submit.prevent="handleSave" class="profile-form hex-panel">
      <div class="avatar-row">
        <AvatarDisplay :path="form.avatar_url" :name="form.display_name" round />
        <div>
          <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="handleAvatarChange" />
          <button type="button" @click="fileInput.click()" :disabled="uploading">
            {{ uploading ? 'Subiendo...' : 'Subir imagen' }}
          </button>
        </div>
      </div>

      <label>
        Nombre para mostrar
        <input v-model="form.display_name" required />
      </label>

      <label>
        Riot ID (ej. Nokturne#LAN)
        <input v-model="form.riot_id" required />
      </label>

      <div class="field-block">
        <p class="field-label">Región</p>
        <div class="chip-row">
          <button
            v-for="r in REGIONS" :key="r" type="button"
            class="chip" :class="{ active: form.region === r }"
            @click="form.region = r"
            >{{ r }}
          </button>
        </div>
      </div>

      <div class="field-block">
        <p class="field-label">Roles</p>
        <div class="chip-row">
          <button
            v-for="r in ROLES" :key="r" type="button"
            class="chip" :class="{ active: form.roles.includes(r) }"
            @click="toggleIn('roles', r)"
            >{{ r }}
          </button>
        </div>
      </div>

      <div class="field-block">
        <p class="field-label">Acepto jugar con</p>
        <div class="chip-row">
          <button
            v-for="r in sameServerOptions" :key="r" type="button"
            class="chip" :class="{ active: form.play_regions.includes(r) }"
            @click="toggleIn('play_regions', r)"
            >{{ r }}
          </button>
        </div>
      </div>

      <div class="field-block">
        <p class="field-label">Rango</p>
        <div class="chip-row">
          <button
            v-for="r in RANKS" :key="r" type="button"
            class="chip" :class="{ active: form.rank === r }"
            @click="form.rank = r"
            >{{ r }}
          </button>
        </div>
      </div>

      <div class="field-block">
        <p class="field-label">Modos de juego</p>
        <div class="chip-row">
          <button
            v-for="m in GAME_MODES" :key="m" type="button"
            class="chip" :class="{ active: form.game_modes.includes(m) }"
            @click="toggleIn('game_modes', m)"
            >{{ m }}
          </button>
        </div>
      </div>

      <label>
        Campeones (separados por coma)
        <input v-model="form.championsText" placeholder="Ahri, Yasuo, Lee Sin" />
      </label>

      <label>
        Descripción
        <textarea v-model="form.description" rows="3" placeholder="Horarios, objetivos, estilo de juego"></textarea>
      </label>

      <div class="contacts-block">
  <p class="contacts-title">Contactos</p>
  <div v-for="(c, i) in form.contacts" :key="i" class="contact-row">
    <input v-model="c.label" placeholder="Red social (ej. Telegram)" class="contact-label" />
    <input v-model="c.value" placeholder="Usuario o link" class="contact-value" />
    <button type="button" @click="removeContact(i)" class="remove-btn">✕</button>
  </div>
  <button type="button" @click="addContact">+ Agregar contacto</button>
</div>

      <p v-if="errorMsg" class="no-result">{{ errorMsg }}</p>

      <div class="field-block">
  <p class="field-label">Visibilidad</p>
  <p class="field-hint">Si lo desactivas, tu perfil no aparece en el listado de Jugadores. Tu cuenta y tus datos no se borran.</p>
  <div class="chip-row">
    <button
      type="button" class="chip" :class="{ active: form.visible }"
      @click="form.visible = true"
    >Visible</button>
    <button
      type="button" class="chip" :class="{ active: !form.visible }"
      @click="form.visible = false"
    >Oculto</button>
  </div>
</div>

      <button type="submit" :disabled="saving">{{ saving ? 'Guardando...' : 'Guardar perfil' }}</button>
      <button v-if="profile" type="button" class="remove-btn" @click="handleDelete">Eliminar perfil</button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useProfile } from '../composables/useProfile'
import AvatarDisplay from '../components/AvatarDisplay.vue'

const REGIONS = ['LAN', 'LAS', 'BR', 'NA', 'EUW', 'EUNE', 'SEA', 'JP', 'KR']
const RANKS = ['Hierro', 'Bronce', 'Plata', 'Oro', 'Platino', 'Esmeralda', 'Diamante', 'Maestro', 'Gran Maestro', 'Challenger', 'Soberano']
const ROLES = ['Baron', 'Jungla', 'Mid', 'ADC', 'Support']
const GAME_MODES = ['Competitivo / Torneos', 'Ranked', 'Ranked Legendaria', 'PvP', 'ARAM', 'Modos de aventura', 'Otros modos']

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

const { profile, loading, saving, errorMsg, fetchMyProfile, saveProfile, deleteProfile, uploadAvatar } = useProfile()

const fileInput = ref(null)
const uploading = ref(false)

const form = reactive({
  display_name: '',
  riot_id: '',
  avatar_url: null,
  region: REGIONS[0],
  play_regions: [],
  roles: [],
  rank: RANKS[0],
  game_modes: [],
  championsText: '',
  description: '',
  contacts: [{ label: '', value: '' }],
  visible: true,
})

function toggleIn(key, value) {
  const list = form[key]
  const idx = list.indexOf(value)
  if (idx === -1) list.push(value)
  else list.splice(idx, 1)
}

watch(profile, (p) => {
  if (!p) return
  form.display_name = p.display_name || ''
  form.riot_id = p.riot_id || ''
  form.avatar_url = p.avatar_url
  form.region = p.region || REGIONS[0]
  form.play_regions = p.play_regions || []
  form.roles = p.roles || []
  form.rank = p.rank || RANKS[0]
  form.game_modes = p.game_modes || []
  form.championsText = (p.champions || []).join(', ')
  form.description = p.description || ''
  form.contacts = (p.contacts && p.contacts.length) ? p.contacts.map(c => ({ ...c })) : [{ label: '', value: '' }]
  form.visible = p.visible !== false
})

watch(() => form.region, () => {
  form.play_regions = []
})

const sameServerOptions = computed(() => {
  const group = regionGroupOf(form.region)
  if (group) return REGION_GROUPS[group].filter(r => r !== form.region)
  return REGIONS.filter(r => r !== form.region)
})

// 3. Recién ahora se dispara la carga de datos
fetchMyProfile()

async function handleAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  const path = await uploadAvatar(file)
  if (path) form.avatar_url = path
  uploading.value = false
}

function addContact() {
  form.contacts.push({ label: '', value: '' })
}
function removeContact(i) {
  form.contacts.splice(i, 1)
}

async function handleSave() {
  const payload = {
    display_name: form.display_name.trim(),
    riot_id: form.riot_id.trim(),
    avatar_url: form.avatar_url,
    region: form.region,
    play_regions: form.play_regions,
    roles: form.roles,
    rank: form.rank,
    game_modes: form.game_modes,
    champions: form.championsText.split(',').map(c => c.trim()).filter(Boolean),
    description: form.description.trim(),
    visible: form.visible,
    contacts: form.contacts
      .map(c => ({ label: c.label.trim() || 'Contacto', value: c.value.trim() }))
      .filter(c => c.value),
  }
  const ok = await saveProfile(payload)
  if (ok) await fetchMyProfile()
}

async function handleDelete() {
  if (!confirm('¿Eliminar tu perfil definitivamente?')) return
  await deleteProfile()
}
</script>

<style scoped>
.my-profile {
  max-width: 600px;
  margin: 0 auto;
}
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.2em;
  margin-top: 1em;
}
.profile-form label {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.avatar-row {
  display: flex;
  align-items: center;
  gap: 1em;
}
.hidden-input {
  display: none;
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
.checkbox-label {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4em;
  margin-right: 1em;
  color: var(--color-text);
}

.contacts-block {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}
.contacts-title {
  color: var(--color-text-muted);
  font-size: 0.9em;
  margin: 0;
}
.contact-row {
  display: flex;
  gap: 0.5em;
}
.contact-label {
  flex: 1;
}
.contact-value {
  flex: 2;
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
.chip-row {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}
.chip {
  font-size: 0.8em;
  padding: 0.4em 0.9em;
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
</style>