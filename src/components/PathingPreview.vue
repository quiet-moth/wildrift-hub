<template>
  <div class="pathing-preview">
    <div v-for="(step, i) in pathing.steps" :key="step.id" class="timeline-item">
      <div class="timeline-connector" v-if="i > 0">↓</div>
      <PathingStepPreview :node="step" />
    </div>
  </div>
</template>

<script setup>
import PathingStepPreview from './PathingStepPreview.vue'

defineProps({
  pathing: { type: Object, required: true },
})
</script>

<style scoped>
.pathing-preview {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.timeline-connector {
  color: var(--color-gold);
  font-size: 1.1em;
  margin-left: 1.2em;
}
</style>