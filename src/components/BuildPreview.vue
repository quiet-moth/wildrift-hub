<template>
  <div class="preview">
    <div class="preview-top-row">
      <div class="champion-frame">
        <IconBox
          v-if="champion"
          :name="champion.name"
          :image-src="championImage(champion.id)"
          :size="120"
          shape="circle"
        />
        <div v-if="roleLabel" class="role-badge">
          <IconBox :name="roleLabel" :image-src="roleImage(build.role)" :size="46" shape="circle" :show-label="false" />
        </div>
      </div>

      <IconBox
        v-for="(spellId, i) in build.spells"
        :key="'spell-' + i"
        class="rune-level-icon"
        v-show="spellId"
        :name="spellName(spellId)"
        :image-src="spellImage(spellId)"
        :size="64"
        shape="square"
      />

      <IconBox
        v-if="build.runes.keystoneId"
        class="rune-level-icon"
        :name="keystoneName"
        :image-src="keystoneImage(build.runes.keystoneId)"
        :size="64"
        shape="circle"
      />

      <div v-if="build.runes.primaryTreeId" class="tree-group">
        <IconBox :name="primaryTreeName" :image-src="treeImage(build.runes.primaryTreeId)" :size="25" shape="diamond" />
        <div class="tree-runes">
          <IconBox
            v-for="rid in filteredPrimaryRunes"
            :key="rid"
            :name="findRune(rid)?.name || '—'"
            :image-src="runeImage(rid)"
            :size="48"
            shape="circle"
          />
        </div>
      </div>

      <div v-if="build.runes.secondaryTreeId" class="tree-group">
        <IconBox :name="secondaryTreeName" :image-src="treeImage(build.runes.secondaryTreeId)" :size="25" shape="diamond" />
        <IconBox
          v-if="build.runes.secondaryRune"
          :name="findRune(build.runes.secondaryRune)?.name || '—'"
          :image-src="runeImage(build.runes.secondaryRune)"
          :size="48"
          shape="circle"
        />
      </div>
    </div>

    <div class="preview-row">
      <ItemBoxNode
        v-for="(slot, i) in build.slots"
        :key="i"
        :node="slot"
        :all-items="allItems"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import IconBox from './IconBox.vue'
import ItemBoxNode from './ItemBoxNode.vue'
import { championImage, spellImage, keystoneImage, treeImage, runeImage, roleImage } from '../utils/images'

const props = defineProps({
  build: { type: Object, required: true },
  allItems: { type: Array, required: true },
  champion: { type: Object, default: null },
  summonerSpells: { type: Array, required: true },
  keystones: { type: Array, required: true },
  trees: { type: Array, required: true },
})

function findRune(id) {
  for (const tree of props.trees) {
    for (const slot of tree.slots) {
      const found = slot.find(r => r.id === id)
      if (found) return found
    }
  }
  return null
}

const ROLE_LABELS = {
  top: 'Top',
  jungle: 'Jungla',
  mid: 'Mid',
  adc: 'ADC',
  support: 'Support',
}

const roleLabel = computed(() => ROLE_LABELS[props.build.role] || null)

function spellName(id) {
  const found = props.summonerSpells.find(s => s.id === id)
  return found ? found.name : '—'
}

const keystoneName = computed(() => {
  const found = props.keystones.find(k => k.id === props.build.runes.keystoneId)
  return found ? found.name : '—'
})

const primaryTreeName = computed(() => {
  const found = props.trees.find(t => t.id === props.build.runes.primaryTreeId)
  return found ? found.name : '—'
})

const secondaryTreeName = computed(() => {
  const found = props.trees.find(t => t.id === props.build.runes.secondaryTreeId)
  return found ? found.name : '—'
})

const filteredPrimaryRunes = computed(() =>
  props.build.runes.primaryRunes.filter(r => r)
)
</script>

<style scoped>
.preview {
  display: flex;
  flex-direction: column;
  gap: 1.8em;
  width: 100%;
}
.preview-top-row {
  display: flex;
  gap: 1.8em;
  flex-wrap: wrap;
  align-items: flex-start;
  width: 100%;
}
.champion-frame {
  position: relative;
  display: inline-block;
}
.role-badge {
  position: absolute;
  top: -10px;
  right: -10px;
}
.tree-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6em;
}
.tree-runes {
  display: flex;
  gap: 0.4em;
}
.rune-level-icon {
  margin-top: calc(25px + 0.6em);
}
.preview-row {
  display: flex;
  gap: 1.5em;
  flex-wrap: wrap;
}
</style>