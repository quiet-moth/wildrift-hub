<template>
  <RouterLink :to="`/equipo/${team.id}`" class="team-card hex-panel" :class="{ completed: isCompleted }">
    <AvatarDisplay :path="team.logo_url" :name="team.name" :size="64" />

    <div class="team-body">
      <div class="team-title-row">
        <h3>{{ team.name }}</h3>
        <span v-if="team.tag" class="tag-pill">{{ team.tag.toUpperCase() }}</span>
      </div>

      <p class="team-meta">
        {{ team.status }} · {{ members.length }} integrantes
        <span v-if="team.min_rank"> · mín. {{ team.min_rank }}</span>
      </p>

      <p v-if="isCompleted" class="completed-note">No disponible por el momento</p>

      <div v-if="openings.length" class="tag-row">
        <span v-for="(o, i) in openings.slice(0, 4)" :key="i" class="opening-tag">
          Busca {{ roleAbbrev(o.role) || 'JUGADOR' }}<span v-if="o.min_rank"> · {{ o.min_rank }}+</span>
        </span>
      </div>
      <p v-else class="empty-text">Sin vacantes abiertas</p>

      <p v-if="team.description" class="team-desc">{{ team.description }}</p>

      <div class="team-footer">
        <div class="tag-row">
          <span v-for="m in (team.game_modes || []).slice(0, 2)" :key="m" class="mode-tag">{{ m }}</span>
        </div>
        <span class="region-text">{{ regionsText }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import AvatarDisplay from './AvatarDisplay.vue'

const props = defineProps({
  team: { type: Object, required: true },
})

const ROLE_ABBREV = { Baron: 'TOP', Jungla: 'JGL', Mid: 'MID', ADC: 'ADC', Support: 'SUP' }
function roleAbbrev(r) {
  return ROLE_ABBREV[r] || r
}

const members = computed(() => (props.team.members || []).filter(m => m && m.name))
const openings = computed(() => (props.team.openings || []).filter(o => o && (o.role || o.notes)))
const isCompleted = computed(() => props.team.status === 'Equipo completo')

const regionsText = computed(() => {
  const list = [props.team.region, ...(props.team.play_regions || []).filter(r => r !== props.team.region)]
  return list.join(' · ')
})
</script>

<style scoped>
.team-card {
  display: flex;
  gap: 1em;
  text-decoration: none;
  color: inherit;
  margin-bottom: 1em;
}
.team-card.completed {
  opacity: 0.6;
}
.team-body {
  flex: 1;
  min-width: 0;
}
.team-title-row {
  display: flex;
  align-items: center;
  gap: 0.6em;
}
.team-title-row h3 {
  margin: 0;
}
.tag-pill {
  font-size: 0.7em;
  color: var(--color-teal);
  border: 1px solid var(--color-teal);
  padding: 0.1em 0.5em;
  border-radius: 4px;
}
.team-meta {
  margin: 0.2em 0 0;
  color: var(--color-text-muted);
  font-size: 0.85em;
}
.completed-note {
  font-size: 0.75em;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  display: inline-block;
  padding: 0.15em 0.5em;
  margin-top: 0.4em;
  border-radius: 4px;
}
.team-desc {
  margin: 0.5em 0 0;
  color: var(--color-text);
  font-size: 0.85em;
  line-height: 1.4;
}
.tag-row {
  display: flex;
  gap: 0.4em;
  flex-wrap: wrap;
  margin-top: 0.5em;
}
.opening-tag {
  font-size: 0.7em;
  color: var(--color-gold-bright);
  border: 1px solid var(--color-gold);
  border-radius: 4px;
  padding: 0.15em 0.5em;
}
.mode-tag {
  font-size: 0.7em;
  color: var(--color-teal);
  border: 1px solid var(--color-teal);
  border-radius: 4px;
  padding: 0.15em 0.5em;
}
.empty-text {
  font-size: 0.75em;
  color: var(--color-text-muted);
  margin: 0.5em 0 0;
}
.team-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.6em;
  flex-wrap: wrap;
  gap: 0.5em;
}
.region-text {
  font-size: 0.75em;
  color: var(--color-text-muted);
}
</style>