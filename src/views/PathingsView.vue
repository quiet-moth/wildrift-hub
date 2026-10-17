<template>
  <div>
    <h1>Pathings de Jungla</h1>

    <section v-if="!selectedChampion" class="filters-panel">
      <div class="filters-header">
        <div>
          <h2>Buscar campeón</h2>
          <p>Filtra por nombre, rol y estado antes de elegir el pathing.</p>
        </div>
        <button type="button" class="ghost-button" @click="resetFilters">Limpiar filtros</button>
      </div>

      <div class="filters-row">
        <label class="search-field search-field-main">
          <span>Buscar</span>
          <input v-model.trim="searchQuery" type="search" placeholder="Nombre del campeón" />
        </label>

        <label>
          <span>Rol</span>
            <select v-model="roleFilter">
              <option value="all">Todos</option>
              <option v-for="role in availableRoles" :key="role" :value="role">
                {{ roleLabel(role) }}
              </option>
            </select>
        </label>

        <label>
          <span>Estado</span>
          <select v-model="ownershipFilter">
            <option value="all">Todos</option>
            <option value="owned">Solo mis campeones</option>
            <option value="missing">Solo pendientes</option>
          </select>
        </label>
      </div>

      <div class="filters-summary">
        <p>Mostrando {{ filteredChampions.length }} de {{ champions.length }} campeones.</p>
      </div>
    </section>

    <ul v-if="!selectedChampion" class="champion-grid">
      <li v-for="champ in filteredChampions" :key="champ.id" class="champion-card">
        <button
          type="button"
          class="champion-toggle"
          :class="{ active: selectedChampionId === champ.id }"
          @click="handleSelectChampion(champ.id)"
          >
          <img class="champion-image" :src="championImage(champ.id)" :alt="champ.name" />
          <div class="champion-copy">
            <div class="champion-title-row">
              <h3>{{ champ.name }}</h3>
              <span v-if="pathingCountFor(champ.id) > 0" class="build-count-pill">
                {{ pathingCountFor(champ.id) }} pathing{{ pathingCountFor(champ.id) > 1 ? 's' : '' }}
              </span>
            </div>
            <p class="roles">{{ champ.roles.map(roleLabel).join(' · ') }}</p>
          </div>
        </button>
      </li>
    </ul>

    <section v-if="selectedChampion">
      <div class="champion-header">
        <h2>{{ selectedChampion.name }}</h2>
        <button @click="selectedChampionId = ''">← Cambiar campeón</button>
      </div>

      <button @click="handleCreatePathing">+ Nuevo pathing</button>

      <div v-for="pathing in championPathings" :key="pathing.id" class="pathing-card hex-panel">
        <div class="pathing-header">
          <input v-model="pathing.name" class="pathing-name-input" />
          <select v-model="pathing.mapSide">
            <option value="normal">Mapa normal</option>
            <option value="inverted">Mapa invertido</option>
          </select>
          <button @click="togglePreview(pathing.id)">
            {{ previewMode[pathing.id] ? 'Editar' : 'Vista previa' }}
          </button>
          <button @click="deletePathing(pathing.id)" class="remove-btn">Eliminar</button>
        </div>

        <template v-if="previewMode[pathing.id]">
          <PathingMapPreview :pathing="pathing" />
        </template>

        <template v-else>
          <div class="steps-list">
            <PathingStepNode
              v-for="step in pathing.steps"
              :key="step.id"
              :node="step"
              @remove="removeStep(pathing, step.id)"
            />
          </div>

          <button @click="addStep(pathing)" class="add-step-btn">+ Agregar paso</button>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import championsData from '../data/champions.json'
import { usePathings } from '../composables/usePathings'
import PathingStepNode from '../components/PathingStepNode.vue'
import PathingMapPreview from '../components/PathingMapPreview.vue'
import { championImage } from '../utils/images'
import { useOwnedChampions } from '../composables/useOwnedChampions'

const previewMode = ref({})
function togglePreview(pathingId) {
  previewMode.value[pathingId] = !previewMode.value[pathingId]
}

const { getPathingsForChampion, createPathing, deletePathing, addStep, removeStep } = usePathings()

const champions = championsData
const selectedChampionId = ref('')

const { ownedChampions } = useOwnedChampions()

const searchQuery = ref('')
const roleFilter = ref('all')
const ownershipFilter = ref('all')

const availableRoles = computed(() => {
  const roles = new Set()
  for (const champion of champions) {
    for (const role of champion.roles) {
      roles.add(role)
    }
  }
  return Array.from(roles).sort()
})

const filteredChampions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return champions
    .filter((champion) => {
      const matchesName = !query || champion.name.toLowerCase().includes(query)
      const matchesRole = roleFilter.value === 'all' || champion.roles.includes(roleFilter.value)
      const owned = ownedChampions.value.includes(champion.id)
      const matchesOwnership = ownershipFilter.value === 'all'
        || (ownershipFilter.value === 'owned' && owned)
        || (ownershipFilter.value === 'missing' && !owned)

      return matchesName && matchesRole && matchesOwnership
    })
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
})

function handleSelectChampion(id) {
  selectedChampionId.value = id
}

function roleLabel(role) {
  const labels = { top: 'Top', jungle: 'Jungla', mid: 'Mid', adc: 'ADC', support: 'Support' }
  return labels[role] || role
}

function resetFilters() {
  searchQuery.value = ''
  roleFilter.value = 'all'
  ownershipFilter.value = 'all'
}

function pathingCountFor(championId) {
  return getPathingsForChampion(championId).length
}

const selectedChampion = computed(() =>
  champions.find(c => c.id === selectedChampionId.value) || null
)

const championPathings = computed(() => {
  if (!selectedChampion.value) return []
  return getPathingsForChampion(selectedChampion.value.id)
})

function handleCreatePathing() {
  createPathing(selectedChampion.value.id, `Pathing de ${selectedChampion.value.name}`)
}
</script>

<style scoped>
.pathing-card {
  margin: 1.5em 0;
  padding: 1.5em;
}
.pathing-header {
  display: flex;
  gap: 1em;
  align-items: center;
  margin-bottom: 1.2em;
  flex-wrap: wrap;
}
.pathing-name-input {
  flex: 1;
  min-width: 200px;
  font-weight: bold;
}
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}
.add-step-btn {
  margin-top: 1em;
}
.filters-panel {
  margin: 1.25em 0 1.5em;
  padding: 1.15em 1.15em 1em;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
}
.filters-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1em;
  margin-bottom: 0.95em;
}
.filters-header h2 {
  margin-bottom: 0.15em;
}
.filters-header p {
  margin: 0;
}
.filters-row {
  display: grid;
  grid-template-columns: minmax(260px, 2fr) repeat(2, minmax(150px, 1fr));
  gap: 1em;
  align-items: end;
}
.filters-row label {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  color: var(--color-text-muted);
  font-size: 0.92em;
}
.search-field input,
.filters-row select {
  width: 100%;
}
.search-field-main input {
  min-height: 46px;
  font-size: 1.02em;
}
.filters-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1em;
  margin-top: 0.9em;
  color: var(--color-text-muted);
  flex-wrap: wrap;
}
.ghost-button {
  border: 1px solid var(--color-border);
  background: transparent;
}
.champion-grid {
  list-style: none;
  padding: 0;
  margin: 1.25em 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 0.75em;
}
.champion-card {
  margin: 0;
}
.champion-toggle {
  width: 100%;
  display: grid;
  grid-template-columns: 58px 1fr auto;
  gap: 0.65em;
  align-items: center;
  text-align: left;
  padding: 0.68em;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
}
.champion-toggle:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
}
.champion-toggle.active {
  border-color: var(--color-gold);
  background: rgba(200, 155, 60, 0.08);
}
.champion-image {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.04);
}
.champion-copy {
  min-width: 0;
}
.champion-copy h3 {
  margin: 0;
  font-size: 1em;
}
.champion-title-row {
  display: flex;
  align-items: center;
  gap: 0.45em;
  justify-content: space-between;
}
.roles {
  margin: 0.25em 0 0;
  color: var(--color-text-muted);
  font-size: 0.86em;
  line-height: 1.25;
}
.build-count-pill {
  padding: 0.22em 0.6em;
  border-radius: 999px;
  font-size: 0.78em;
  white-space: nowrap;
  background: rgba(10, 200, 185, 0.15);
  color: var(--color-teal);
}
.champion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  flex-wrap: wrap;
  margin-bottom: 1em;
}
.champion-header h2 {
  margin: 0;
}

@media (max-width: 720px) {
  .filters-header {
    flex-direction: column;
  }
  .filters-row {
    grid-template-columns: 1fr;
  }
  .champion-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}
</style>