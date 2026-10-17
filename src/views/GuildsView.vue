<template>
  <div>
    <h1>Gremios</h1>

    <RouterLink to="/mi-gremio" class="publish-btn">
      {{ hasOwnGuild ? 'MI GREMIO' : '+ PUBLICAR MI GREMIO' }}
    </RouterLink>

    <section class="filters-panel">
      <label class="search-field">
        <span>Buscar</span>
        <input v-model.trim="searchQuery" type="search" placeholder="Nombre, idioma o requisitos" />
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
              v-for="s in ['Todos', 'Reclutando', 'Cerrado']" :key="s"
              type="button" class="chip" :class="{ active: statusFilter === s }"
              @click="statusFilter = s"
            >{{ s }}</button>
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
          <p class="filter-label">IDIOMA</p>
          <div class="chip-row">
            <button
              v-for="l in ['Todos', ...LANGUAGES]" :key="l"
              type="button" class="chip" :class="{ active: languageFilter === l }"
              @click="languageFilter = l"
            >{{ l }}</button>
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
      </select>
    </section>

    <p v-if="loading">Cargando gremios...</p>

    <div v-else-if="filteredGuilds.length === 0" class="empty-state hex-panel">
      <p>No encontramos gremios con esos filtros.</p>
      <RouterLink to="/mi-gremio">Publicá tu gremio para reclutar</RouterLink>
    </div>

    <GuildCard v-for="g in filteredGuilds" :key="g.id" :guild="g" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useSession } from '../composables/useSession'
import GuildCard from '../components/GuildCard.vue'

const REGIONS = ['LAN', 'LAS', 'BR', 'NA', 'EUW', 'EUNE', 'SEA', 'JP', 'KR']
const LANGUAGES = ['Español', 'Inglés', 'Portugués']

const { user } = useSession()
const guilds = ref([])
const loading = ref(true)
const hasOwnGuild = ref(false)

const searchQuery = ref('')
const regionFilter = ref('Todas')
const languageFilter = ref('Todos')
const statusFilter = ref('Todos')
const sortBy = ref('recent')
const filtersOpen = ref(false)

async function fetchGuilds() {
  loading.value = true
  const { data, error } = await supabase
    .from('guilds')
    .select('*')
    .eq('visible', true)
    .order('updated_at', { ascending: false })

  if (!error) guilds.value = data || []
  loading.value = false
}

async function checkOwnGuild() {
  if (!user.value) {
    hasOwnGuild.value = false
    return
  }
  const { data } = await supabase
    .from('guilds')
    .select('id')
    .eq('user_id', user.value.id)
    .maybeSingle()
  hasOwnGuild.value = !!data
}

onMounted(() => {
  fetchGuilds()
  checkOwnGuild()
})

const activeCount = computed(() =>
  [regionFilter.value, languageFilter.value, statusFilter.value]
    .filter(v => v !== 'Todos' && v !== 'Todas').length
)

function resetFilters() {
  regionFilter.value = 'Todas'
  languageFilter.value = 'Todos'
  statusFilter.value = 'Todos'
}

const filteredGuilds = computed(() => {
  const term = searchQuery.value.toLowerCase().trim()

  const filtered = guilds.value.filter(g => {
    if (statusFilter.value !== 'Todos' && g.status !== statusFilter.value) return false
    if (languageFilter.value !== 'Todos' && g.language !== languageFilter.value) return false
    if (
      regionFilter.value !== 'Todas' &&
      g.region !== regionFilter.value &&
      !(g.play_regions || []).includes(regionFilter.value)
    ) return false

    if (!term) return true
    return (
      g.name.toLowerCase().includes(term) ||
      (g.language || '').toLowerCase().includes(term) ||
      (g.requirements || '').toLowerCase().includes(term) ||
      (g.description || '').toLowerCase().includes(term)
    )
  })

  return filtered.slice().sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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