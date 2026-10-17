<template>
  <div class="item-selector" ref="rootRef">
    <input
      type="text"
      v-model="query"
      @focus="open = true"
      @input="open = true"
      :placeholder="placeholder"
      class="selector-input"
    />
    <ul v-if="open" class="selector-dropdown">
      <li
        v-for="opt in filteredOptions"
        :key="opt.id"
        @mousedown.prevent="select(opt)"
        class="selector-option"
      >
        <img
          v-if="previewEnabled && imageResolver && imageResolver(opt.id)"
          :src="imageResolver(opt.id)"
          class="option-thumb"
          alt=""
        />
        {{ opt.name }}
      </li>
      <li v-if="filteredOptions.length === 0" class="no-results">Sin resultados</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { usePreviewToggle } from '../composables/usePreviewToggle'

const props = defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Buscar...' },
  imageResolver: { type: Function, default: null },
})
const emit = defineEmits(['update:modelValue'])

const { previewEnabled } = usePreviewToggle()

const query = ref('')
const open = ref(false)
const rootRef = ref(null)

watch(() => props.modelValue, (id) => {
  const found = props.options.find(o => o.id === id)
  query.value = found ? found.name : ''
}, { immediate: true })

function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/['\s]/g, '')
}

const sortedOptions = computed(() =>
  [...props.options].sort((a, b) => a.name.localeCompare(b.name))
)

const filteredOptions = computed(() => {
  const term = normalize(query.value.trim())
  if (!term) return sortedOptions.value

  const selected = props.options.find(o => o.id === props.modelValue)
  if (selected && normalize(selected.name) === term) return sortedOptions.value

  return sortedOptions.value.filter(o => {
    const nameMatch = normalize(o.name).includes(term)
    const idMatch = normalize(o.id).includes(term)
    return nameMatch || idMatch
  })
})

function select(opt) {
  emit('update:modelValue', opt.id)
  query.value = opt.name
  open.value = false
}

function handleClickOutside(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) {
    open.value = false
    const found = props.options.find(o => o.id === props.modelValue)
    query.value = found ? found.name : ''
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.item-selector {
  position: relative;
  width: 100%;
}
.selector-input {
  width: 100%;
  box-sizing: border-box;
}
.selector-dropdown {
  position: absolute;
  z-index: 20;
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-gold);
  max-height: 220px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
.selector-option {
  display: flex;
  align-items: center;
  gap: 0.6em;
  padding: 0.4em 0.8em;
  cursor: pointer;
  color: var(--color-text);
  font-size: 0.95em;
  border-bottom: 1px solid var(--color-border);
}
.selector-option:last-child {
  border-bottom: none;
}
.selector-option:hover {
  background: var(--color-gold);
  color: var(--color-bg);
}
.option-thumb {
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  background: var(--color-bg-panel);
}
.no-results {
  color: var(--color-text-muted);
  font-style: italic;
  cursor: default !important;
  padding: 0.5em 0.8em;
}
.no-results:hover {
  background: transparent !important;
  color: var(--color-text-muted) !important;
}
</style>