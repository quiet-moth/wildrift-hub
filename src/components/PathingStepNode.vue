<template>
  <div class="step-node">
    <div class="step-row">
      <div class="step-fields">
        <select v-model="node.type" class="type-select">
          <option value="">-- Tipo de paso --</option>
          <option value="ward">Ward</option>
          <option value="camp">Campamento</option>
          <option value="objective">Objetivo (dragón/barón/heraldo)</option>
          <option value="ability">Subir habilidad</option>
          <option value="summoner">Usar hechizo</option>
          <option value="gank">Gankear línea</option>
          <option value="invade">Invadir</option>
          <option value="backer">Backear</option>
          <option value="note">Nota libre</option>
        </select>

        <template v-if="node.type === 'ward'">
          <select v-model="node.wardType">
            <option value="">-- Tipo de ward --</option>
            <option value="normal">Ward normal</option>
            <option value="pink">Ward rosa (control)</option>
            <option value="lens">Lente revelador</option>
          </select>
          <input v-model="node.location" placeholder="Ubicación" class="field-short" />
        </template>

        <template v-else-if="node.type === 'camp'">
          <select v-model="node.camp">
            <option value="">-- Campamento --</option>
            <option v-for="c in campOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <label class="smite-check">
            <input type="checkbox" v-model="node.smite" /> Castigo
          </label>
        </template>

        <template v-else-if="node.type === 'objective'">
          <select v-model="node.objective">
            <option value="">-- Objetivo --</option>
            <option v-for="o in objectiveOptions" :key="o.id" :value="o.id">{{ o.name }}</option>
          </select>
          <label class="smite-check">
            <input type="checkbox" v-model="node.smite" /> Castigo
          </label>
        </template>

        <template v-else-if="node.type === 'ability'">
          <select v-model="node.ability">
            <option value="">-- Habilidad --</option>
            <option value="Q">Q</option>
            <option value="W">W</option>
            <option value="E">E</option>
          </select>
        </template>

        <template v-else-if="node.type === 'summoner'">
          <select v-model="node.spellId">
            <option value="">-- Hechizo --</option>
            <option v-for="s in summonerSpells" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </template>

        <template v-else-if="node.type === 'gank'">
          <select v-model="node.lane">
            <option value="">-- Línea --</option>
            <option value="top">Top</option>
            <option value="mid">Mid</option>
            <option value="bottom">Bot</option>
          </select>
        </template>

        <template v-else-if="node.type === 'invade'">
          <input v-model="node.area" placeholder="Zona a invadir" class="field-short" />
        </template>

        <input v-model="node.note" placeholder="Descripción / nota" class="note-input" />
      </div>

      <div class="step-map">
        <button type="button" @click="openMapFor">
          📍 {{ node.mapX != null ? 'Cambiar punto' : 'Ubicar en mapa' }}
        </button>
        <span v-if="node.mapX != null" class="map-pin-label">{{ node.mapLabel }}</span>
      </div>

      <div class="step-actions">
        <button type="button" @click="addAlternative">+ Alternativa</button>
        <button type="button" @click="$emit('remove')" class="remove-btn">✕</button>
      </div>
    </div>

    <div class="alternatives">
      <div v-for="alt in node.alternatives" :key="alt.id" class="alt-branch">
        <div class="arrow-label">↓ o si no</div>
        <PathingStepNode :node="alt" @remove="removeAlternative(alt.id)" />
      </div>
    </div>

    <MapPicker
      v-if="mapOpen"
      @select="handleMapSelect"
      @close="mapOpen = false"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import summonerSpellsData from '../data/summonerSpells.json'
import jungleData from '../data/jungleData.json'
import MapPicker from './MapPicker.vue'
import { ref } from 'vue'

const mapOpen = ref(false)

function openMapFor() {
  mapOpen.value = true
}

function handleMapSelect(point) {
  props.node.mapX = point.x
  props.node.mapY = point.y
  props.node.mapLabel = point.label
  mapOpen.value = false
}

const props = defineProps({
  node: { type: Object, required: true },
})
defineEmits(['remove'])

const summonerSpells = summonerSpellsData

const campOptions = jungleData.camps.map(c => ({ id: c.id, name: c.name }))
const objectiveOptions = jungleData.objectives
  .filter(o => ['crab', 'herald', 'dragon', 'elder_dragon', 'baron'].includes(o.id))
  .map(o => ({ id: o.id, name: o.name }))

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function addAlternative() {
  props.node.alternatives.push({
    id: generateId(),
    type: '', wardType: '', camp: '', objective: '', ability: '', spellId: '',
    lane: '', smite: false, location: '', area: '', orientation: '', note: '',
    mapX: null, mapY: null, mapLabel: '',
    alternatives: [],
  })
}

function removeAlternative(id) {
  const idx = props.node.alternatives.findIndex(a => a.id === id)
  if (idx !== -1) props.node.alternatives.splice(idx, 1)
}
</script>

<style scoped>
.step-node {
  margin-top: 0.4em;
}
.step-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.8em;
  align-items: start;
  background: var(--color-bg-panel-alt);
  padding: 0.8em;
  border-left: 3px solid var(--color-gold);
}
.step-fields {
  display: flex;
  gap: 0.6em;
  flex-wrap: wrap;
  align-items: center;
}
.type-select {
  min-width: 150px;
}
.field-short {
  max-width: 160px;
}
.note-input {
  flex: 1;
  min-width: 160px;
}
.smite-check {
  display: flex;
  align-items: center;
  gap: 0.3em;
  font-size: 0.85em;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.step-map {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3em;
  padding-top: 0.1em;
}
.step-map button {
  white-space: nowrap;
}
.map-pin-label {
  font-size: 0.75em;
  color: var(--color-teal);
}
.step-actions {
  display: flex;
  gap: 0.4em;
  padding-top: 0.1em;
}
.remove-btn {
  color: crimson;
}
.alternatives {
  margin-left: 1.5em;
  border-left: 2px dashed var(--color-border);
  padding-left: 1em;
}
.alt-branch {
  margin-top: 0.5em;
}
.arrow-label {
  font-size: 0.8em;
  color: var(--color-teal);
  margin-bottom: 0.2em;
}

@media (max-width: 780px) {
  .step-row {
    grid-template-columns: 1fr;
  }
  .step-map,
  .step-actions {
    flex-direction: row;
    align-items: center;
  }
}
</style>