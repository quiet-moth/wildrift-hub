<template>
  <div class="step-chain">
    <div class="step-card hex-panel">
  <div class="step-icons">
    <IconBox
      v-if="stepImage"
      :image-src="stepImage"
      :size="44"
      :show-label="false"
    />
    <span v-else class="step-icon">{{ typeIcon }}</span>

    <IconBox
      v-if="node.smite"
      :image-src="smiteImage"
      :size="28"
      :show-label="false"
    />
  </div>

  <div class="step-body">
    <p class="step-title">{{ stepDescription }}</p>
    <p v-if="node.note" class="step-note">{{ node.note }}</p>
  </div>
</div>

    <div v-if="node.alternatives.length" class="branches">
      <div v-for="alt in node.alternatives" :key="alt.id" class="branch">
        <div class="branch-label">↓ o si no</div>
        <PathingStepPreview :node="alt" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import jungleData from '../data/jungleData.json'
import summonerSpellsData from '../data/summonerSpells.json'
import IconBox from './IconBox.vue'
import { campImage, objectiveImage, wardImage, spellImage, actionImage } from '../utils/images'

const props = defineProps({
  node: { type: Object, required: true },
})

const TYPE_ICONS = {
  ability: '⚔️',
  gank: '🗡️',
  invade: '🚨',
  backer: '🏠',
  note: '📝',
}
const typeIcon = computed(() => TYPE_ICONS[props.node.type] || '•')

const smiteImage = computed(() => spellImage('smite'))

const stepImage = computed(() => {
  const n = props.node
  switch (n.type) {
    case 'ward':
      return n.wardType ? wardImage(n.wardType) : null
    case 'camp':
      return n.camp ? campImage(n.camp) : null
    case 'objective':
      return n.objective ? objectiveImage(n.objective) : null
    case 'summoner':
      return n.spellId ? spellImage(n.spellId) : null
    case 'backer':
      return actionImage('backer')
    default:
      return null
  }
})

const WARD_LABELS = { normal: 'Ward normal', pink: 'Ward rosa', lens: 'Lente revelador' }
const LANE_LABELS = { top: 'Top', mid: 'Mid', bottom: 'Bot' }

function campName(id) {
  const found = jungleData.camps.find(c => c.id === id)
  return found ? found.name : '—'
}
function objectiveName(id) {
  const found = jungleData.objectives.find(o => o.id === id)
  return found ? found.name : '—'
}
function spellName(id) {
  const found = summonerSpellsData.find(s => s.id === id)
  return found ? found.name : '—'
}

const stepDescription = computed(() => {
  const n = props.node
  switch (n.type) {
    case 'ward':
      return `${WARD_LABELS[n.wardType] || 'Ward'}${n.location ? ' en ' + n.location : ''}`
    case 'camp':
      return `${campName(n.camp)}${n.smite ? ' (Castigo)' : ''}`
    case 'objective':
      return `${objectiveName(n.objective)}${n.smite ? ' (Castigo)' : ''}`
    case 'ability':
      return `Subir ${n.ability || '—'}`
    case 'summoner':
      return `Usar ${spellName(n.spellId)}`
    case 'gank':
      return `Gankear ${LANE_LABELS[n.lane] || '—'}`
    case 'invade':
      return `Invadir${n.area ? ': ' + n.area : ''}`
    case 'backer':
      return 'Backear'
    case 'note':
      return 'Nota'
    default:
      return '— Sin definir —'
  }
})
</script>

<style scoped>
.step-chain {
  display: flex;
  flex-direction: column;
}
.step-card {
  display: flex;
  gap: 0.8em;
  align-items: flex-start;
  padding: 0.8em 1em;
  max-width: 320px;
}
.step-icon {
  font-size: 1.3em;
  line-height: 1;
}
.step-title {
  margin: 0;
  color: var(--color-gold-bright);
  font-weight: 600;
  font-size: 0.95em;
}
.step-note {
  margin: 0.3em 0 0;
  color: var(--color-text-muted);
  font-size: 0.82em;
  font-style: italic;
}
.branches {
  margin-left: 2em;
  margin-top: 0.6em;
  display: flex;
  flex-direction: column;
  gap: 0.6em;
  border-left: 2px dashed var(--color-border);
  padding-left: 1em;
}
.branch-label {
  font-size: 0.75em;
  color: var(--color-teal);
  margin-bottom: 0.3em;
}
.step-icons {
  display: flex;
  align-items: center;
  gap: 0.4em;
}
</style>