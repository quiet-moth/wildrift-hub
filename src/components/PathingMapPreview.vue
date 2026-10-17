<template>
  <div class="map-preview">
    <div class="phase-tabs" v-if="phases.length > 1">
      <button
        v-for="(ph, i) in phases" :key="i"
        type="button" class="phase-tab" :class="{ active: activePhase === i }"
        @click="activePhase = i"
      >Pathing {{ i + 1 }}</button>
    </div>

    <div class="map-scroll-area">
      <div class="map-wrapper">
        <img src="../assets/jungle/map.jpg" alt="Mapa de la Grieta" class="map-image" />
        <svg class="route-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            v-if="routePoints.length > 1"
            :points="polylinePoints"
            fill="none"
            stroke="#C89B3C"
            stroke-width="0.4"
          />
        </svg>
        <div
          v-for="(s, i) in routePoints" :key="i"
          class="map-marker"
          :style="{ left: s.mapX + '%', top: s.mapY + '%' }"
          :title="s.mapLabel"
        >
          <div class="marker-icon">
            <img v-if="getStepImage(s)" :src="getStepImage(s)" alt="" />
            <span v-else>{{ getStepEmoji(s) }}</span>
          </div>
          <span class="marker-number">{{ i + 1 }}</span>
        </div>
      </div>
    </div>

    <p v-if="routePoints.length === 0" class="no-points-hint">
      Ningún paso de este pathing tiene ubicación en el mapa todavía.
    </p>

    <div class="phase-details">
      <div v-for="(s, i) in currentPhase" :key="i" class="detail-card hex-panel">
        <div class="detail-icon">
          <img v-if="getStepImage(s)" :src="getStepImage(s)" alt="" />
          <span v-else class="detail-emoji">{{ getStepEmoji(s) }}</span>
          <img v-if="s.smite" :src="smiteImg" class="smite-badge" alt="" />
        </div>
        <p class="detail-title">{{ getStepDescription(s) }}</p>
        <p v-if="s.note" class="detail-note">{{ s.note }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getStepImage, getStepEmoji, getStepDescription } from '../composables/useStepDisplay'
import { spellImage } from '../utils/images'

const props = defineProps({
  pathing: { type: Object, required: true },
})

const smiteImg = spellImage('smite')

const phases = computed(() => {
  const groups = []
  let current = []
  for (const step of props.pathing.steps) {
    current.push(step)
    if (step.type === 'backer') {
      groups.push(current)
      current = []
    }
  }
  if (current.length) groups.push(current)
  return groups.length ? groups : [[]]
})

const activePhase = ref(0)
const currentPhase = computed(() => phases.value[activePhase.value] || [])

const routePoints = computed(() =>
  currentPhase.value.filter(s => s.mapX != null && s.mapY != null)
)

const polylinePoints = computed(() =>
  routePoints.value.map(p => `${p.mapX},${p.mapY}`).join(' ')
)
</script>

<style scoped>
.map-scroll-area {
  overflow: auto;
  border: 1px solid var(--color-gold);
}
.map-preview {
  display: flex;
  flex-direction: column;
  gap: 1em;
}
.phase-tabs {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}
.phase-tab {
  font-size: 0.85em;
  padding: 0.4em 0.9em;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: transparent;
  border-radius: 999px;
}
.phase-tab.active {
  background: var(--color-gold);
  color: var(--color-bg);
  border-color: var(--color-gold);
}
.map-wrapper {
  position: relative;
  width: 100%;
}
.map-image {
  width: 100%;
  display: block;
}
.route-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.marker-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid var(--color-gold);
  background: var(--color-bg-panel-alt);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.marker-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.marker-number {
  margin-top: 2px;
  font-size: 0.65em;
  color: var(--color-gold-bright);
  font-weight: 700;
  background: var(--color-bg);
  border-radius: 999px;
  padding: 0 0.35em;
}
.no-points-hint {
  font-size: 0.8em;
  color: var(--color-text-muted);
  text-align: center;
}
.phase-details {
  display: flex;
  gap: 1em;
  overflow-x: auto;
  padding-bottom: 0.5em;
}
.detail-card {
  flex-shrink: 0;
  width: 140px;
  padding: 0.8em;
  text-align: center;
}
.detail-icon {
  position: relative;
  width: 48px;
  height: 48px;
  margin: 0 auto 0.5em;
  border-radius: 50%;
  border: 1px solid var(--color-gold);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-panel-alt);
}
.detail-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-emoji {
  font-size: 1.3em;
}
.smite-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--color-gold);
}
.detail-title {
  margin: 0;
  font-size: 0.8em;
  color: var(--color-gold-bright);
  font-weight: 600;
}
.detail-note {
  margin: 0.3em 0 0;
  font-size: 0.72em;
  color: var(--color-text-muted);
  font-style: italic;
}
@media (max-width: 700px) {
  .map-wrapper {
    width: 900px;
  }
  .marker-icon {
    width: 40px;
    height: 40px;
  }
}
</style>