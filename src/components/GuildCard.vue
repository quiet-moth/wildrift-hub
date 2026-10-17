<template>
  <RouterLink :to="`/gremio/${guild.id}`" class="guild-card hex-panel">
    <AvatarDisplay :path="guild.logo_url" :name="guild.name" :size="64" />

    <div class="guild-body">
      <div class="guild-title-row">
        <h3>{{ guild.name }}</h3>
        <span v-if="guild.tag" class="tag-pill">{{ guild.tag.toUpperCase() }}</span>
      </div>

      <p class="guild-meta">
        {{ guild.status }}
        <span v-if="guild.language"> · {{ guild.language }}</span>
        <span v-if="guild.min_games_week"> · {{ guild.min_games_week }}</span>
      </p>

      <p v-if="guild.description" class="guild-desc">{{ guild.description }}</p>

      <div class="guild-footer">
        <span class="region-text">{{ regionsText }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import AvatarDisplay from './AvatarDisplay.vue'

const props = defineProps({
  guild: { type: Object, required: true },
})

const regionsText = computed(() => {
  const list = [props.guild.region, ...(props.guild.play_regions || []).filter(r => r !== props.guild.region)]
  return list.join(' · ')
})
</script>

<style scoped>
.guild-card {
  display: flex;
  gap: 1em;
  text-decoration: none;
  color: inherit;
  margin-bottom: 1em;
}
.guild-body {
  flex: 1;
  min-width: 0;
}
.guild-title-row {
  display: flex;
  align-items: center;
  gap: 0.6em;
}
.guild-title-row h3 {
  margin: 0;
}
.tag-pill {
  font-size: 0.7em;
  color: var(--color-teal);
  border: 1px solid var(--color-teal);
  padding: 0.1em 0.5em;
  border-radius: 4px;
}
.guild-meta {
  margin: 0.2em 0 0;
  color: var(--color-text-muted);
  font-size: 0.85em;
}
.guild-desc {
  margin: 0.5em 0 0;
  color: var(--color-text);
  font-size: 0.85em;
  line-height: 1.4;
}
.guild-footer {
  margin-top: 0.6em;
}
.region-text {
  font-size: 0.75em;
  color: var(--color-text-muted);
}
</style>