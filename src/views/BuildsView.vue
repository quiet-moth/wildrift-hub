<template>
  <div>
    <h1>Builds</h1>

    <section v-if="!selectedChampion" class="filters-panel">
      <div class="filters-header">
        <div>
          <h2>Buscar campeón</h2>
          <p>Filtra por nombre, rol y estado antes de elegir la build.</p>
        </div>
        <button type="button" class="ghost-button" @click="resetFilters">Limpiar filtros</button>
      </div>

      <div class="filters-row">
        <label class="search-field search-field-main">
          <span>Buscar</span>
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="Nombre del campeón"
          />
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
          <span v-if="buildCountFor(champ.id) > 0" class="build-count-pill">
            {{ buildCountFor(champ.id) }} build{{ buildCountFor(champ.id) > 1 ? 's' : '' }}
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

  <button @click="handleCreateBuild">+ Nueva build</button>

      <div v-for="build in championBuilds" :key="build.id" class="build-card">
        <div class="build-header">
  <input v-model="build.name" class="build-name-input" />
  <button @click="togglePreview(build.id)">
    {{ previewMode[build.id] ? 'Editar' : 'Vista previa' }}
  </button>
  <button @click="deleteBuild(build.id)" class="remove-btn">Eliminar build</button>
</div>

        <div class="meta-row">
          <label>
            Modo:
            <select v-model="build.mode">
              <option value="classic">Clásico</option>
              <option value="aram">ARAM</option>
            </select>
          </label>

          <label>
            Rol:
            <select v-model="build.role">
              <option value="">-- Rol --</option>
              <option value="top">Top</option>
              <option value="jungle">Jungla</option>
              <option value="mid">Mid</option>
              <option value="adc">ADC</option>
              <option value="support">Support</option>
            </select>
          </label>
        </div>

        <div class="meta-row">
          <div class="spell-selector">
  <label>Hechizo 1</label>
  <ItemSelector v-model="build.spells[0]" :options="spellsForBuild(build)" placeholder="Buscar hechizo..." :image-resolver="spellImage" />
</div>
<div class="spell-selector">
  <label>Hechizo 2</label>
  <ItemSelector v-model="build.spells[1]" :options="spellsForBuild(build)" placeholder="Buscar hechizo..." :image-resolver="spellImage" />
</div>
        </div>

        <div class="runes-box">
  <h3>Runas</h3>
  <div class="meta-row">
    <label>
      Runa clave:
      <ItemSelector
        v-model="build.runes.keystoneId"
        :options="keystones"
        placeholder="Buscar runa clave..."
        :image-resolver="keystoneImage"
      />
    </label>

    <label>
      Árbol principal:
      <ItemSelector
        v-model="build.runes.primaryTreeId"
        :options="trees"
        placeholder="Buscar árbol..."
        :image-resolver="treeImage"
      />
    </label>
  </div>

  <div v-if="getTree(build.runes.primaryTreeId)" class="primary-slots">
    <div v-for="(slotOptions, i) in getTree(build.runes.primaryTreeId).slots" :key="i" class="rune-slot">
      <label>Slot {{ i + 1 }}:</label>
      <ItemSelector
        v-model="build.runes.primaryRunes[i]"
        :options="slotOptions"
        placeholder="Buscar runa..."
        :image-resolver="runeImage"
      />
    </div>
  </div>

  <div class="meta-row">
    <label>
      Árbol secundario:
      <ItemSelector
        v-model="build.runes.secondaryTreeId"
        :options="trees.filter(t => t.id !== build.runes.primaryTreeId)"
        placeholder="Buscar árbol..."
        :image-resolver="treeImage"
      />
    </label>

    <label v-if="getTree(build.runes.secondaryTreeId)">
      Runa secundaria:
      <ItemSelector
        v-model="build.runes.secondaryRune"
        :options="getTree(build.runes.secondaryTreeId).slots.flat()"
        placeholder="Buscar runa..."
        :image-resolver="runeImage"
      />
    </label>
  </div>
</div>

        <template v-if="previewMode[build.id]">
  <h3>Ítems</h3>
  <BuildPreview
  :build="build"
  :all-items="allItems"
  :champion="selectedChampion"
  :summoner-spells="summonerSpells"
  :keystones="keystones"
  :trees="trees"
/>
</template>

<template v-else>
  <h3>Ítems</h3>
  <div class="slots-row">
    <div v-for="(slot, i) in build.slots" :key="i" class="slot-column">
      <label class="slot-label">Slot {{ i + 1 }}</label>
      <ItemCategorySelector v-model="slot.itemId" :items="itemsForBuild(build)" placeholder="Buscar ítem..." :image-resolver="itemImage" />

      <button @click="addAlternative(slot)" class="add-alt-btn">+ Alternativa</button>

      <AlternativeNode
        v-for="alt in slot.alternatives"
        :key="alt.id"
        :node="alt"
        :all-items="itemsForBuild(build)"
        @remove="removeAlternative(slot, alt.id)"
      />
    </div>
  </div>
</template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { championImage, spellImage, itemImage, keystoneImage, treeImage, runeImage } from '../utils/images'
import { ref, computed } from 'vue'
import championsData from '../data/champions.json'
import summonerSpellsData from '../data/summonerSpells.json'
import runesData from '../data/runes.json'
import { useBuilds } from '../composables/useBuilds'
import { useAllItems } from '../composables/useAllItems'
import ItemSelector from '../components/ItemSelector.vue'
import ItemCategorySelector from '../components/ItemCategorySelector.vue'
import AlternativeNode from '../components/AlternativeNode.vue'
import BuildPreview from '../components/BuildPreview.vue'
import { useOwnedChampions } from '../composables/useOwnedChampions'

const previewMode = ref({})
const { getBuildsForChampion, createBuild, deleteBuild } = useBuilds()
const { allItems, getItemsByMode } = useAllItems()
const { ownedChampions } = useOwnedChampions()

const champions = championsData // ya tienen { id, name }
const summonerSpells = summonerSpellsData // { id, name, modes }
const keystones = runesData.keystones
const trees = runesData.trees

function togglePreview(buildId) {
  previewMode.value[buildId] = !previewMode.value[buildId]
}

function getTree(treeId) {
  return trees.find(t => t.id === treeId) || null
}

const selectedChampionId = ref('')

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

function roleLabel(role) {
  const labels = { top: 'Top', jungle: 'Jungla', mid: 'Mid', adc: 'ADC', support: 'Support' }
  return labels[role] || role
}

function resetFilters() {
  searchQuery.value = ''
  roleFilter.value = 'all'
  ownershipFilter.value = 'all'
}

function buildCountFor(championId) {
  return getBuildsForChampion(championId).length
}

function handleSelectChampion(id) {
  selectedChampionId.value = id
}

const selectedChampion = computed(() =>
  champions.find(c => c.id === selectedChampionId.value) || null
)

const championBuilds = computed(() => {
  if (!selectedChampion.value) return []
  return getBuildsForChampion(selectedChampion.value.id)
})

function handleCreateBuild() {
  createBuild(selectedChampion.value.id, `Build de ${selectedChampion.value.name}`)
}

function addAlternative(slot) {
  slot.alternatives.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    itemId: '',
    note: '',
    alternatives: [],
  })
}

function removeAlternative(slot, id) {
  const idx = slot.alternatives.findIndex(a => a.id === id)
  if (idx !== -1) slot.alternatives.splice(idx, 1)
}

function itemsForBuild(build) {
  return getItemsByMode(build.mode)
}

function spellsForBuild(build) {
  return summonerSpells.filter(s => s.modes.includes(build.mode))
}
</script>

<style scoped>
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
  padding: 0.18em 0.5em;
  border-radius: 999px;
  font-size: 0.72em;
  white-space: nowrap;
  background: rgba(10, 200, 185, 0.15);
  color: var(--color-teal);
}

.champion-toggle.active {
  border-color: var(--color-gold);
  background: rgba(200, 155, 60, 0.08);
}
.build-count-pill {
  padding: 0.22em 0.6em;
  border-radius: 999px;
  font-size: 0.78em;
  white-space: nowrap;
  background: rgba(10, 200, 185, 0.15);
  color: var(--color-teal);
}
.build-card {
  border: 1px solid var(--color-border);
  padding: 1.5em;
  margin: 1.5em 0;
  background: var(--color-bg-panel);
}
.build-header {
  display: flex;
  gap: 1em;
  align-items: center;
  margin-bottom: 1.5em;
  flex-wrap: wrap;
}
.build-name-input {
  flex: 1;
  min-width: 200px;
  font-size: 1.1em;
  font-weight: bold;
}
.meta-row {
  display: flex;
  gap: 1.5em;
  margin-bottom: 1.5em;
  flex-wrap: wrap;
  align-items: flex-end;
}
.meta-row label {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.runes-box {
  border: 1px solid var(--color-border);
  padding: 1.2em;
  margin-bottom: 2em;
  background: var(--color-bg-panel-alt);
}
.runes-box h3 {
  margin-bottom: 1em;
}
.primary-slots {
  display: flex;
  gap: 1em;
  margin: 1em 0;
  flex-wrap: wrap;
}
h3 {
  margin-top: 1.5em;
  margin-bottom: 0.8em;
}
.slot-label {
  font-size: 0.8em;
  color: var(--color-text-muted);
  margin-bottom: -0.3em;
}
.add-alt-btn {
  font-size: 0.8em;
  margin-top: 0.2em;
}
.slots-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2em 1.5em;
  align-items: start;
}
.slot-column {
  display: flex;
  flex-direction: column;
  gap: 0.7em;
  min-width: 0;
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

.rune-slot {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
</style>