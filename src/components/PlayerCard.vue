<template>
  <RouterLink :to="`/jugador/${profile.id}`" class="player-card hex-panel">
    <AvatarDisplay :path="profile.avatar_url" :name="displayName" :size="64" round />

    <div class="player-body">
      <div class="player-title-row">
        <h3>{{ displayName }}</h3>
        <span v-for="r in profile.roles.slice(0, 1)" :key="r" class="role-pill">{{ roleAbbrev(r) }}</span>
      </div>

      <p class="player-meta">{{ profile.riot_id }} · {{ profile.rank }}</p>

      <p v-if="profile.description" class="player-desc">{{ profile.description }}</p>

      <div v-if="profile.game_modes?.length" class="tag-row">
        <span v-for="m in profile.game_modes.slice(0, 3)" :key="m" class="mode-tag">{{ m }}</span>
      </div>

      <div class="player-footer">
        <div class="tag-row">
          <span v-for="c in profile.champions.slice(0, 3)" :key="c" class="champ-tag">{{ c }}</span>
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
  profile: { type: Object, required: true },
})

const ROLE_ABBREV = { Baron: 'TOP', Jungla: 'JGL', Mid: 'MID', ADC: 'ADC', Support: 'SUP' }
function roleAbbrev(r) {
  return ROLE_ABBREV[r] || r
}

const displayName = computed(() =>
  props.profile.display_name?.trim() || props.profile.riot_id.split('#')[0] || props.profile.riot_id
)

const regionsText = computed(() => {
  const list = [props.profile.region, ...(props.profile.play_regions || []).filter(r => r !== props.profile.region)]
  return list.join(' · ')
})
</script>

<style scoped>
.player-card {
  display: flex;
  gap: 1em;
  text-decoration: none;
  color: inherit;
  margin-bottom: 1em;
}
.player-body {
  flex: 1;
  min-width: 0;
}
.player-title-row {
  display: flex;
  align-items: center;
  gap: 0.6em;
}
.player-title-row h3 {
  margin: 0;
}
.role-pill {
  font-size: 0.7em;
  color: var(--color-teal);
  border: 1px solid var(--color-teal);
  padding: 0.1em 0.5em;
  border-radius: 4px;
}
.player-meta {
  margin: 0.2em 0 0;
  color: var(--color-text-muted);
  font-size: 0.85em;
}
.player-desc {
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
.mode-tag {
  font-size: 0.7em;
  color: var(--color-teal);
  border: 1px solid var(--color-teal);
  border-radius: 4px;
  padding: 0.15em 0.5em;
}
.champ-tag {
  font-size: 0.7em;
  color: var(--color-text-muted);
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.15em 0.5em;
}
.player-footer {
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