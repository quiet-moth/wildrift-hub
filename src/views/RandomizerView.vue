<template>
  <div>
    <h1>Randomizador</h1>
    <label class="inline-check global-toggle">
  <input type="checkbox" v-model="forceSmiteJungle" />
  Forzar Castigo si el rol es Jungla
</label>

    <!-- RANDOMIZAR TODO -->
    <section class="hex-panel quick-panel">
      <div class="quick-row">
        <h3>Randomizar todo</h3>
        <button @click="handleRandomizeAll">🎲 Generar build completa</button>
      </div>

      <div v-if="hasQuickResult" class="quick-layout">
        <div class="quick-details">
          <BuildPreview
            v-if="quickPreviewBuild"
            :build="quickPreviewBuild"
            :all-items="allItems"
            :champion="result"
            :summoner-spells="summonerSpells"
            :keystones="keystones"
            :trees="trees"
          />
        </div>
      </div>
    </section>

    <p class="divider-text">— o randomiza cada parte por separado —</p>

    <!-- CONTROLES COMPACTOS -->
<!-- CONTROLES COMPACTOS -->
<section class="hex-panel compact-controls">
  <div class="control-row">
    <div class="control-stack">
      <label class="inline-check">
        <input type="checkbox" v-model="onlyOwned" /> Solo mis campeones
      </label>
      <button class="control-btn" @click="handleRandomize">Sortear campeón</button>
    </div>
    <div class="control-result">
      <IconBox v-if="result" :name="result.name" :image-src="championImage(result.id)" :size="56" />
    </div>
  </div>
  <hr class="mini-divider" />

  <div class="control-row">
    <div class="control-stack">
      <button class="control-btn" @click="randomizeRole">Sortear rol</button>
    </div>
    <div class="control-result">
      <IconBox v-if="roleResult" :name="roleResult.name" :image-src="roleImage(roleResult.id)" :size="56" :show-label="false" />
    </div>
  </div>
  <hr class="mini-divider" />

  <div class="control-row">
    <div class="control-stack">
      <select v-model="spellMode">
        <option value="classic">Clásico</option>
        <option value="aram">ARAM</option>
        <option value="all">Todos</option>
      </select>
      <button class="control-btn" @click="handleRandomizeSpells">Sortear hechizos</button>
    </div>
    <div class="control-result">
      <IconBox
        v-for="(s, i) in spellsResult || []"
        :key="'s' + i"
        :name="s.name"
        :image-src="spellImage(s.id)"
        :size="56"
      />
    </div>
  </div>
  <hr class="mini-divider" />

  <div class="control-row">
    <div class="control-stack">
      <button class="control-btn" @click="randomizeRunes">Sortear runas</button>
    </div>
    <div class="control-result compact-runes-inline" v-if="runesResult">
      <IconBox :name="runesResult.keystone.name" :image-src="keystoneImage(runesResult.keystone.id)" :size="56" />
      <IconBox :name="runesResult.primaryTree" :image-src="treeImage(runesResult.primaryTreeId)" :size="24" shape="diamond" />
      <IconBox
        v-for="r in runesResult.primaryRunes"
        :key="r.id"
        :name="r.name"
        :image-src="runeImage(r.id)"
        :size="40"
      />
      <IconBox :name="runesResult.secondaryTree" :image-src="treeImage(runesResult.secondaryTreeId)" :size="24" shape="diamond" />
      <IconBox :name="runesResult.secondaryRune.name" :image-src="runeImage(runesResult.secondaryRune.id)" :size="40" />
    </div>
  </div>
  <hr class="mini-divider" />

  <div class="control-row">
    <div class="control-stack">
      <select v-model="itemMode">
        <option value="classic">Clásico</option>
        <option value="aram">ARAM</option>
      </select>
      <select v-model="activeMode">
        <option value="random">Activo aleatorio</option>
        <option value="yes">Siempre activo</option>
        <option value="no">Sin activo</option>
      </select>
      <button class="control-btn" @click="handleRandomizeItems">Sortear ítems</button>
    </div>
    <div class="control-result" v-if="itemsResult">
      <IconBox
        v-for="item in [itemsResult.boots, itemsResult.active, ...itemsResult.items].filter(Boolean)"
        :key="item.id"
        :name="item.name"
        :image-src="itemImage(item.id)"
        :size="56"
      />
    </div>
  </div>
</section>

    <hr />

    <!-- RANDOMIZADOR DE EQUIPO / TORNEO -->
    <section class="hex-panel">
      <h2>Randomizador de equipo</h2>
      <p>Genera una build completa (campeón, rol, hechizos, runas, ítems) para cada jugador.</p>

      <div class="control-row">
        <div class="control-left">
          <label>
            Jugadores:
            <input type="number" v-model.number="playerCount" min="1" :max="totalChampions" class="player-input" />
          </label>
          <button @click="handleRandomizeTeam">Sortear equipo</button>
        </div>
        <p v-if="teamError" class="no-result">Máximo {{ totalChampions }} jugadores (no hay suficientes campeones).</p>
      </div>

      <div v-if="teamResult" class="team-groups">
        <div v-for="(group, gi) in teamGroups" :key="gi" class="team-group">
          <h3 v-if="teamGroups.length > 1">Grupo {{ gi + 1 }}</h3>
          <div class="team-list">
            <div v-for="(entry, i) in group" :key="i" class="team-entry hex-panel">
              <BuildPreview
                v-if="teamPreviewBuild(entry)"
                :build="teamPreviewBuild(entry)"
                :all-items="allItems"
                :champion="entry.champion"
                :summoner-spells="summonerSpells"
                :keystones="keystones"
                :trees="trees"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOwnedChampions } from '../composables/useOwnedChampions'
import { useRandomizer } from '../composables/useRandomizer'
import { useAllItems } from '../composables/useAllItems'
import BuildPreview from '../components/BuildPreview.vue'
import IconBox from '../components/IconBox.vue'
import { championImage, roleImage, spellImage, keystoneImage, treeImage, runeImage, itemImage } from '../utils/images'
import championsData from '../data/champions.json'
import summonerSpellsData from '../data/summonerSpells.json'
import runesData from '../data/runes.json'

const forceSmiteJungle = ref(true)
const { allItems } = useAllItems()
const summonerSpells = summonerSpellsData
const keystones = runesData.keystones
const trees = runesData.trees

const { ownedChampions } = useOwnedChampions()
const {
  result, randomizeChampion,
  spellsResult, randomizeSpells,
  runesResult, randomizeRunes,
  itemsResult, randomizeItems,
  roleResult, randomizeRole,
  teamResult, randomizeTeam,
} = useRandomizer()

const onlyOwned = ref(false)
const spellMode = ref('classic')
const itemMode = ref('classic')
const activeMode = ref('random')
const playerCount = ref(5)
const teamError = ref(false)

const totalChampions = championsData.length

function toPreviewBuild(loadout) {
  if (!loadout) return null
  const { role, spells, runes, items } = loadout
  if (!role || !spells || !runes || !items) return null

  const orderedItems = [items.boots, items.active, ...(items.items || [])]
    .filter(Boolean)
    .slice(0, 6)

  return {
    role,
    spells: spells.map(s => s.id),
    runes: {
      keystoneId: runes.keystone?.id || '',
      primaryTreeId: runes.primaryTreeId || '',
      primaryRunes: (runes.primaryRunes || []).map(r => r.id),
      secondaryTreeId: runes.secondaryTreeId || '',
      secondaryRune: runes.secondaryRune?.id || '',
    },
    slots: orderedItems.map(item => ({
      id: item.id,
      itemId: item.id,
      note: '',
      alternatives: [],
    })),
  }
}

function handleRandomize() {
  randomizeChampion({ onlyOwned: onlyOwned.value })
}
function handleRandomizeSpells() {
  const isJungle = roleResult.value?.id === 'jungle'
  const force = forceSmiteJungle.value && isJungle
  const exclude = forceSmiteJungle.value && roleResult.value && !isJungle
  randomizeSpells(spellMode.value, force, exclude)
}
function handleRandomizeItems() {
  randomizeItems(itemMode.value, activeMode.value)
}
function handleRandomizeAll() {
  randomizeChampion({ onlyOwned: onlyOwned.value })
  const role = randomizeRole()
  const isJungle = role?.id === 'jungle'
  randomizeSpells('classic', forceSmiteJungle.value && isJungle, forceSmiteJungle.value && !isJungle)
  randomizeRunes()
  randomizeItems('classic', 'random')
}
function handleRandomizeTeam() {
  const res = randomizeTeam(playerCount.value, {
    onlyOwned: onlyOwned.value,
    forceSmiteJungle: forceSmiteJungle.value,
  })
  teamError.value = !res
}

const hasQuickResult = computed(() =>
  result.value || roleResult.value || spellsResult.value || runesResult.value || itemsResult.value
)

const quickPreviewBuild = computed(() => {
  if (!result.value) return null

  return toPreviewBuild({
    role: roleResult.value?.id,
    spells: spellsResult.value,
    runes: runesResult.value,
    items: itemsResult.value,
  })
})

function teamPreviewBuild(entry) {
  return toPreviewBuild(entry)
}

const teamGroups = computed(() => {
  if (!teamResult.value) return []
  const groups = []
  for (let i = 0; i < teamResult.value.length; i += 5) {
    groups.push(teamResult.value.slice(i, i + 5))
  }
  return groups
})
</script>

<style scoped>
.global-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  margin-bottom: 1em;
  color: var(--color-text-muted);
  font-size: 0.9em;
}
.quick-panel {
  margin-bottom: 1em;
}
.quick-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1em;
  flex-wrap: wrap;
  margin-bottom: 1.2em;
}
.quick-layout {
  display: flex;
  gap: 2em;
  align-items: center;
  flex-wrap: wrap;
}
.quick-details {
  display: flex;
  flex-direction: column;
  gap: 1em;
  flex: 1;
}
.quick-top, .quick-bottom, .icon-inline {
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  align-items: flex-start;
}
.compact-runes-inline {
  align-items: center;
  gap: 0.55em;
}
.divider-text {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.85em;
  margin: 1.5em 0;
}
.compact-controls {
  display: flex;
  flex-direction: column;
}
.control-row {
  display: flex;
  align-items: flex-start;
  gap: 1.5em;
  padding: 0.8em 0;
  flex-wrap: wrap;
}
.control-stack {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  width: 220px;
  flex-shrink: 0;
}
.control-btn {
  width: 100%;
}
.control-result {
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  align-items: flex-start;
  padding-top: 0.2em;
}

@media (max-width: 600px) {
  .control-stack {
    width: 100%;
  }
}
.control-options {
  display: flex;
  align-items: center;
  gap: 0.6em;
  flex-wrap: wrap;
}
.control-btn {
  justify-self: start;
  white-space: nowrap;
}
.control-result {
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  align-items: flex-start;
}

@media (max-width: 700px) {
  .control-row {
    grid-template-columns: 1fr;
    gap: 0.6em;
  }
  .control-btn {
    justify-self: stretch;
  }
}
.inline-check {
  display: flex;
  align-items: center;
  gap: 0.4em;
  color: var(--color-text-muted);
  font-size: 0.9em;
}
.mini-divider {
  margin: 0;
  border-top: 1px solid var(--color-border);
}
.player-input {
  width: 70px;
}
.team-groups {
  margin-top: 1.5em;
  display: flex;
  flex-direction: column;
  gap: 1.5em;
}
.team-group h3 {
  margin-bottom: 0.8em;
}
.team-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
.team-entry {
  padding: 1em;
}
.quick-panel,
.compact-controls,
.hex-panel {
  width: 100%;
  box-sizing: border-box;
}
.quick-layout {
  width: 100%;
}
.quick-details {
  width: 100%;
}
</style>