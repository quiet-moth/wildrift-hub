<template>
  <div>
    <h1>Jugadores</h1>

    <section class="filters-panel">
      <label class="search-field">
        <span>Buscar</span>
        <input v-model.trim="searchQuery" type="search" placeholder="Nombre, Riot ID o campeón" />
      </label>

      <button type="button" class="toggle-filters" @click="filtersOpen = !filtersOpen">
        FILTROS
        <span v-if="activeCount > 0" class="active-count"> · {{ activeCount }} activos</span>
        <span class="toggle-icon">{{ filtersOpen ? '−' : '+' }}</span>
      </button>

      <div v-if="filtersOpen" class="filters-body">
        <div class="filter-group">
          <p class="filter-label">ROL</p>
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
          <p class="filter-label">RANGO</p>
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
        <option value="rank">Mayor rango</option>
      </select>
    </section>

    <p v-if="loading">Cargando jugadores...</p>

    <div v-else-if="filteredProfiles.length === 0" class="empty-state hex-panel">
      <p>No encontramos jugadores con esos filtros.</p>
      <RouterLink to="/mi-perfil">Creá tu perfil para que te encuentren</RouterLink>
    </div>

    <PlayerCard v-for="p in filteredProfiles" :key="p.id" :profile="p" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import PlayerCard from '../components/PlayerCard.vue'

const REGIONS = ['LAN', 'LAS', 'BR', 'NA', 'EUW', 'EUNE', 'SEA', 'JP', 'KR']
const RANKS = ['Hierro', 'Bronce', 'Plata', 'Oro', 'Platino', 'Esmeralda', 'Diamante', 'Maestro', 'Gran Maestro', 'Challenger', 'Soberano']
const ROLES = ['Baron', 'Jungla', 'Mid', 'ADC', 'Support']
const GAME_MODES = ['Competitivo / Torneos', 'Ranked', 'Ranked Legendaria', 'PvP', 'ARAM', 'Modos de aventura', 'Otros modos']

const profiles = ref([])
const loading = ref(true)

const searchQuery = ref('')
const roleFilter = ref('Todos')
const regionFilter = ref('Todas')
const rankFilter = ref('Todos')
const modeFilter = ref('Todos')
const sortBy = ref('recent')
const filtersOpen = ref(false)

async function fetchProfiles() {
  loading.value = true
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('visible', true)
    .order('updated_at', { ascending: false })

  if (!error) profiles.value = data || []
  loading.value = false
}

onMounted(fetchProfiles)

const activeCount = computed(() =>
  [roleFilter.value, regionFilter.value, rankFilter.value, modeFilter.value]
    .filter(v => v !== 'Todos' && v !== 'Todas').length
)

function resetFilters() {
  roleFilter.value = 'Todos'
  regionFilter.value = 'Todas'
  rankFilter.value = 'Todos'
  modeFilter.value = 'Todos'
}

function displayName(p) {
  return p.display_name?.trim() || p.riot_id.split('#')[0] || p.riot_id
}

const filteredProfiles = computed(() => {
  const term = searchQuery.value.toLowerCase().trim()

  const filtered = profiles.value.filter(p => {
    if (roleFilter.value !== 'Todos' && !p.roles.includes(roleFilter.value)) return false
    if (rankFilter.value !== 'Todos' && p.rank !== rankFilter.value) return false
    if (modeFilter.value !== 'Todos' && !(p.game_modes || []).includes(modeFilter.value)) return false
    if (
      regionFilter.value !== 'Todas' &&
      p.region !== regionFilter.value &&
      !(p.play_regions || []).includes(regionFilter.value)
    ) return false

    if (!term) return true
    return (
      p.riot_id.toLowerCase().includes(term) ||
      displayName(p).toLowerCase().includes(term) ||
      p.champions.some(c => c.toLowerCase().includes(term)) ||
      (p.game_modes || []).some(m => m.toLowerCase().includes(term)) ||
      p.rank.toLowerCase().includes(term)
    )
  })

  return filtered.slice().sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy.value === 'rank') {
      const aIdx = RANKS.indexOf(a.rank)
      const bIdx = RANKS.indexOf(b.rank)
      if (aIdx !== bIdx) return bIdx - aIdx
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })
})
</script>

<style scoped>
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