<template>
  <div class="chain">
    <IconBox :name="itemName" :image-src="itemImage(node.itemId)" :size="80" />
    <div v-for="alt in node.alternatives" :key="alt.id" class="alt-branch">
      <div class="arrow-down">↓</div>
      <div v-if="alt.note" class="alt-note">{{ alt.note }}</div>
      <ItemBoxNode :node="alt" :all-items="allItems" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import IconBox from './IconBox.vue'
import { itemImage } from '../utils/images'

const props = defineProps({
  node: { type: Object, required: true },
  allItems: { type: Array, required: true },
})

const itemName = computed(() => {
  const found = props.allItems.find(i => i.id === props.node.itemId)
  return found ? found.name : '—'
})
</script>

<style scoped>
.chain {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3em;
}
.arrow-down {
  color: var(--color-teal);
  font-size: 0.9em;
}
.alt-note {
  font-size: 0.65em;
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
  max-width: 90px;
}
.alt-branch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2em;
}
</style>