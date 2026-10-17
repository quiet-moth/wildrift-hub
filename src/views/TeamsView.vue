<template>
  <div>
    <h1>Equipos</h1>

    <RouterLink to="/mi-equipo" class="publish-btn">
      {{ hasOwnTeam ? 'MI EQUIPO' : '+ PUBLICAR MI EQUIPO' }}
    </RouterLink>

    <section class="filters-panel">
      <label class="search-field">
        <span>Buscar</span>
        <input v-model.trim="searchQuery" type="search" placeholder="Equipo, rol buscado o requisitos" />
      </label>

      <button type="button" class="toggle-filters" @click="filtersOpen = !filtersOpen">
        FILTROS
        <span v-if="activeCount > 0" class="active-count"> · {{ activeCount }} activos</span>
        <span class="toggle-icon">{{ filtersOpen ? '−' : '+' }}</span>
      </button>

      <div v-if="filtersOpen" class="filters-body">
        <div class="filter-group">
          <p class="filter-label">ESTADO</p>
          <div class="chip-row">
            <button
              v-for="s in STATUS_FILTERS" :key="s"
              type="button" class="chip" :class="{ active: statusFilter === s }"
              @click="statusFilter = s"
            >{{ s }}</button>
          </div>
        </div>

        <div class="filter-group">
          <p class="filter-label">ROL QUE BUSCAN</p>
          <div class="chip-row">
            <button
              v-for="r in ['Todos', ...ROLES]" :key="r"
              type="button" class="chip" :class="{ active: roleFilter === r }"
              @click="roleFilter = r"
            >{{ r }}</button>
          </div>
        </div>

        <div class="filter-group">
          <p class="filter-label">REGIÓN</p>
          <div class="chip-row">
            <button
              v-for="r in ['Todas', ...REGIONS]" :key="r"
              type="button" class="chip" :class="{ active: regionFilter === r }"
              @click="regionFilter = r"
            >{{ r }}</button>
          </div>
        </div>

        <div class="filter-group">
          <p class="filter-label">RANGO MÍNIMO</p>
          <div class="chip-row">
            <button
              v-for="r in ['Todos', ...RANKS]" :key="r"
              type="button" class="chip" :class="{ active: rankFilter === r }"
              @click="rankFilter = r"
            >{{ r }}</button>
          </div>
        </div>

        <div class="filter-group">
          <p class="filter-label">MODO DE JUEGO</p>
          <div class="chip-row">
            <button
              v-for="m in ['Todos', ...GAME_MODES]" :key="m"
              type="button" class="chip" :class="{ active: modeFilter === m }"
              @click="modeFilter = m"
            >{{ m }}</button>
          </div>
        </div>

        <button v-if="activeCount > 0" type="button" class="clear-link" @click="resetFilters">Limpiar filtros</button>
      </div>
    </section>

    <section class="results-header">
      <h2>Resultados</h2>
      <select v-model="sortBy">
        <option value="recent">Más recientes</option>
        <option value="newest">Más nuevos</option>
        <option value="openings">Más vacantes</option>
      </select>
    </section>

    <p v-if="loading">Cargando equipos...</p>

    <div v-else-if="filteredTeams.length === 0" class="empty-state hex-panel">
      <p>No encontramos equipos con esos filtros.</p>
      <RouterLink to="/mi-equipo">Publicá tu equipo para reclutar</RouterLink>
    </div>

    <TeamCard v-for="t in filteredTeams" :key="t.id" :team="t" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useSession } from '../composables/useSession'
import TeamCard from '../components/TeamCard.vue'

const REGIONS = ['LAN', 'LAS', 'BR', 'NA', 'EUW', 'EUNE', 'SEA', 'JP', 'KR']
const RANKS = ['Hierro', 'Bronce', 'Plata', 'Oro', 'Platino', 'Esmeralda', 'Diamante', 'Maestro', 'Gran Maestro', 'Challenger', 'Soberano']
const ROLES = ['Baron', 'Jungla', 'Mid', 'ADC', 'Support']
const GAME_MODES = ['Competitivo / Torneos', 'Ranked', 'Ranked Legendaria', 'PvP', 'ARAM', 'Modos de aventura', 'Otros modos']

const COMPLETED = 'Equipo completo'
const COMPLETED_FILTER = 'Equipos completados'
const STATUS_FILTERS = ['Todos', 'Reclutando', 'Busca sustitutos', COMPLETED_FILTER]

const { user } = useSession()
const teams = ref([])
const loading = ref(true)
const hasOwnTeam = ref(false)

const searchQuery = ref('')
const roleFilter = ref('Todos')
const regionFilter = ref('Todas')
const rankFilter = ref('Todos')
const modeFilter = ref('Todos')
const statusFilter = ref('Todos')
const sortBy = ref('recent')
const filtersOpen = ref(false)

async function fetchTeams() {
  loading.value = true
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('updated_at', { ascending: false })

  if (!error) teams.value = data || []
  loading.value = false
}

async function checkOwnTeam() {
  if (!user.value) {
    hasOwnTeam.value = false
    return
  }
  const { data } = await supabase
    .from('teams')
    .select('id')
    .eq('user_id', user.value.id)
    .maybeSingle()
  hasOwnTeam.value = !!data
}

onMounted(() => {
  fetchTeams()
  checkOwnTeam()
})

function teamOpenings(t) {
  return (t.openings || []).filter(o => o && (o.role || o.notes))
}

const activeCount = computed(() =>
  [roleFilter.value, regionFilter.value, rankFilter.value, modeFilter.value, statusFilter.value]
    .filter(v => v !== 'Todos' && v !== 'Todas').length
)

function resetFilters() {
  roleFilter.value = 'Todos'
  regionFilter.value = 'Todas'
  rankFilter.value = 'Todos'
  modeFilter.value = 'Todos'
  statusFilter.value = 'Todos'
}

const filteredTeams = computed(() => {
  const term = searchQuery.value.toLowerCase().trim()

  const filtered = teams.value.filter(t => {
    const openings = teamOpenings(t)

    if (statusFilter.value === COMPLETED_FILTER) {
      if (t.status !== COMPLETED) return false
    } else if (statusFilter.value === 'Todos') {
      if (t.status === COMPLETED) return false
    } else if (t.status !== statusFilter.value) return false

    if (roleFilter.value !== 'Todos' && !openings.some(o => o.role === roleFilter.value)) return false
    if (rankFilter.value !== 'Todos' && t.min_rank !== rankFilter.value && !openings.some(o => o.min_rank === rankFilter.value)) return false
    if (modeFilter.value !== 'Todos' && !(t.game_modes || []).includes(modeFilter.value)) return false
    if (
      regionFilter.value !== 'Todas' &&
      t.region !== regionFilter.value &&
      !(t.play_regions || []).includes(regionFilter.value)
    ) return false

    if (!term) return true
    return (
      t.name.toLowerCase().includes(term) ||
      t.tag.toLowerCase().includes(term) ||
      t.description.toLowerCase().includes(term) ||
      t.requirements.toLowerCase().includes(term) ||
      openings.some(o => (o.role + ' ' + o.notes).toLowerCase().includes(term))
    )
  })

  return filtered.slice().sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy.value === 'openings') {
      return teamOpenings(b).length - teamOpenings(a).length
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
})
</script>

<style scoped>
.publish-btn {
  display: block;
  text-align: center;
  background: var(--color-gold);
  color: var(--color-bg);
  font-weight: 600;
  text-decoration: none;
  padding: 0.7em;
  margin: 1em 0;
  border-radius: 4px;
}
.filters-panel {
  margin: 1.25em 0 1.5em;
  padding: 1em;
  border: 1px solid var(--color-border);
  background: var(--color-bg-panel-alt);
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}
.search-field {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.toggle-filters {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.85em;
}
.active-count {
  color: var(--color-gold);
}
.toggle-icon {
  color: var(--color-gold);
}
.filters-body {
  display: flex;
  flex-direction: column;
  gap: 1em;
  border: 1px solid var(--color-border);
  padding: 1em;
}
.filter-label {
  font-size: 0.75em;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  margin: 0 0 0.5em;
}
.chip-row {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
  overflow-x: auto;
}
.chip {
  flex-shrink: 0;
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
.clear-link {
  background: transparent;
  border: none;
  text-decoration: underline;
  color: var(--color-text-muted);
  font-size: 0.8em;
  align-self: flex-start;
}
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
}
.empty-state {
  text-align: center;
  padding: 2em;
}
.empty-state p {
  margin-bottom: 0.8em;
}
</style>