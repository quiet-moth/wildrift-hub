<template>
  <div class="alt-node">
    <div class="arrow">↓</div>
    <div class="alt-row">
      <ItemCategorySelector v-model="node.itemId" :items="allItems" placeholder="Buscar ítem..." :image-resolver="itemImage" />
      <input v-model="node.note" placeholder="Nota (ej. contra escudos)" class="note-input" />
      <div class="alt-actions">
        <button @click="addChild" title="Agregar alternativa debajo">+ Alt</button>
        <button @click="$emit('remove')" class="remove-btn" title="Eliminar">✕</button>
      </div>
    </div>

    <div class="children">
      <AlternativeNode
        v-for="child in node.alternatives"
        :key="child.id"
        :node="child"
        :all-items="allItems"
        @remove="removeChild(child.id)"
      />
    </div>
  </div>
</template>

<script setup>
import ItemCategorySelector from './ItemCategorySelector.vue'
import { itemImage } from '../utils/images'

const props = defineProps({
  node: { type: Object, required: true },
  allItems: { type: Array, required: true },
})

function addChild() {
  props.node.alternatives.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    itemId: '',
    note: '',
    alternatives: [],
  })
}
function removeChild(id) {
  const idx = props.node.alternatives.findIndex(a => a.id === id)
  if (idx !== -1) props.node.alternatives.splice(idx, 1)
}
</script>

<style scoped>
.alt-node {
  margin-top: 0.6em;
  padding-left: 0.8em;
  border-left: 2px dashed #999;
}
.arrow {
  font-size: 1.1em;
  color: #666;
  line-height: 1;
}
.alt-row {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.alt-actions {
  display: flex;
  gap: 0.4em;
}
.remove-btn {
  color: crimson;
}
.children {
  margin-left: 0.5em;
}
.alt-row {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
  margin-top: 0.5em;
}
.alt-actions {
  display: flex;
  gap: 0.5em;
  margin-top: 0.2em;
}
.alt-node {
  margin-top: 1em;
  padding-left: 1em;
  border-left: 2px dashed var(--color-border);
}
</style>