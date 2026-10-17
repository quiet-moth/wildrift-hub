<template>
  <div class="icon-box" :style="{ '--box-size': size + 'px' }">
    <div class="icon-img-wrap" :class="shape">
      <img v-if="imageSrc && !imgError" :src="imageSrc" :alt="name" @error="imgError = true" />
      <span v-else class="icon-fallback">{{ initials }}</span>
    </div>
    <span v-if="showLabel" class="icon-name">{{ name }}</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  name: { type: String, default: '—' },
  imageSrc: { type: String, default: null },
  size: { type: Number, default: 64 },
  shape: { type: String, default: 'circle' }, // circle | square | diamond
  showLabel: { type: Boolean, default: true },
})

const imgError = ref(false)

const initials = computed(() =>
  props.name && props.name !== '—' ? props.name.slice(0, 2).toUpperCase() : '?'
)
</script>

<style scoped>
.icon-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3em;
  width: auto;
}
.icon-img-wrap {
  width: var(--box-size);
  height: var(--box-size);
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  box-sizing: border-box;
}
.icon-img-wrap.circle {
  border-radius: 50%;
}
.icon-img-wrap.square {
  border-radius: 4px;
}
.icon-img-wrap.diamond {
  border-radius: 4px;
  transform: rotate(45deg);
}
.icon-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.icon-img-wrap.diamond img {
  transform: rotate(-45deg);
}
.icon-fallback {
  font-family: var(--font-display);
  color: var(--color-gold-bright);
  font-size: 1.1em;
}
.icon-img-wrap.diamond .icon-fallback {
  transform: rotate(-45deg);
}
.icon-name {
  font-size: 0.7em;
  color: var(--color-text);
  text-align: center;
  line-height: 1.15;
  width: max(var(--box-size), 70px);
}
</style>