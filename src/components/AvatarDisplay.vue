<template>
  <div class="avatar-box" :class="{ round: round }" :style="{ '--avatar-size': size + 'px' }">
    <img v-if="publicUrl" :src="publicUrl" :alt="name" />
    <span v-else>{{ initials }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { supabase } from '../lib/supabase'

const props = defineProps({
  path: { type: String, default: null },
  name: { type: String, default: '' },
  round: { type: Boolean, default: false },
  size: { type: Number, default: 80 },
})

const publicUrl = computed(() => {
  if (!props.path) return null
  if (props.path.startsWith('http')) return props.path
  const { data } = supabase.storage.from('avatars').getPublicUrl(props.path)
  return data.publicUrl
})

const initials = computed(() => (props.name ? props.name.slice(0, 2).toUpperCase() : '?'))
</script>

<style scoped>
.avatar-box {
  width: var(--avatar-size);
  height: var(--avatar-size);
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar-box.round {
  border-radius: 50%;
}
.avatar-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-box span {
  font-family: var(--font-display);
  color: var(--color-gold-bright);
}
</style>