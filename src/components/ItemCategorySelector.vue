<template>
  <div class="cat-selector">
    <div class="cat-tabs">
      <button
        v-for="cat in categoryList"
        :key="cat.id"
        type="button"
        :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id"
      >
        {{ cat.label }}
      </button>
    </div>
    <ItemSelector
      v-model="internalValue"
      :options="filteredOptions"
      placeholder="Buscar ítem..."
      :image-resolver="imageResolver"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ItemSelector from './ItemSelector.vue'
import { useAllItems } from '../composables/useAllItems'

const props = defineProps({
  modelValue: { type: String, default: '' },
  items: { type: Array, required: true },
  imageResolver: { type: Function, default: null },
})

const emit = defineEmits(['update:modelValue'])

const { getItemsByCategory, CATEGORY_LABELS } = useAllItems()

const activeCategory = ref('all')

const categoryList = computed(() => [
  { id: 'all', label: 'Todos' },
  ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ id, label })),
  { id: 'actives', label: 'Activos' },
])

const filteredOptions = computed(() =>
  getItemsByCategory(props.items, activeCategory.value)
)

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<style scoped>
.cat-selector {
  width: 100%;
}
.cat-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  margin-bottom: 0.5em;
}
.cat-tabs button {
  font-size: 0.75em;
  padding: 0.3em 0.7em;
  border-color: var(--color-border);
  color: var(--color-text-muted);
}
.cat-tabs button.active {
  border-color: var(--color-gold);
  background: var(--color-gold);
  color: var(--color-bg);
}
</style>