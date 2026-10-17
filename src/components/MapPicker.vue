<template>
  <Teleport to="body">
    <div class="map-modal-backdrop" @click.self="$emit('close')">
      <div class="map-modal hex-panel">
        <div class="map-modal-header">
          <h3>Elige un punto en el mapa</h3>
          <button type="button" @click="$emit('close')">✕</button>
        </div>

        <div class="filter-row">
          <span class="filter-label">FILTRAR POR:</span>
          <button
            type="button" class="filter-chip"
            :class="{ active: activeCategory === 'all' }"
            @click="activeCategory = 'all'"
          >Todos</button>
          <button
            v-for="c in MAP_CATEGORIES" :key="c.id"
            type="button" class="filter-chip"
            :class="{ active: activeCategory === c.id }"
            @click="activeCategory = c.id"
          >{{ c.label }}</button>
        </div>

        <div class="map-scroll-area">
          <div class="map-wrapper" ref="wrapperRef">
            <img src="../assets/jungle/map.jpg" alt="Mapa de la Grieta" class="map-image" />
            <button
              v-for="p in filteredPoints"
              :key="p.id"
              type="button"
              class="map-point"
              :style="{ left: p.x + '%', top: p.y + '%' }"
              :title="p.label"
              @click="selectPoint(p)"
            >
              <span class="map-point-dot"></span>
            </button>
          </div>
        </div>

        <p class="map-hint">Toca un punto para usarlo, o cierra y escribe la ubicación a mano.</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MAP_POINTS, MAP_CATEGORIES } from '../data/mapPoints'
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

const emit = defineEmits(['select', 'close'])

const activeCategory = ref('all')

const filteredPoints = computed(() => {
  if (activeCategory.value === 'all') return MAP_POINTS
  return MAP_POINTS.filter(p => p.category === activeCategory.value)
})

function selectPoint(p) {
  emit('select', p)
}
</script>

<style scoped>
.map-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1em;
  overflow-y: auto;
}
.map-modal {
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.map-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
}
.map-modal-header h3 {
  margin: 0;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;
  margin-bottom: 1em;
}
.filter-label {
  font-size: 0.7em;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}
.filter-chip {
  font-size: 0.75em;
  padding: 0.3em 0.8em;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: transparent;
  border-radius: 999px;
}
.filter-chip.active {
  background: var(--color-gold);
  color: var(--color-bg);
  border-color: var(--color-gold);
}
.map-scroll-area {
  overflow: auto;
  max-height: 65vh;
  border: 1px solid var(--color-border);
}
.map-wrapper {
  position: relative;
  min-width: 100%;
}
.map-image {
  width: 100%;
  display: block;
}
.map-point {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--color-gold);
  background: rgba(200, 155, 60, 0.35);
  padding: 0;
  cursor: pointer;
  transition: transform 0.1s, background 0.15s;
}
.map-point:hover {
  transform: translate(-50%, -50%) scale(1.3);
  background: var(--color-gold);
}
.map-point-dot {
  display: block;
  width: 100%;
  height: 100%;
}
.map-hint {
  margin-top: 0.8em;
  font-size: 0.8em;
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 700px) {
  .map-modal {
    max-width: 100%;
    max-height: 95vh;
  }
  .map-scroll-area {
    max-height: 55vh;
  }
  .map-wrapper {
    width: 900px;
  }
  .map-point {
    width: 28px;
    height: 28px;
  }
}
</style>