<template>
  <div class="team-detail">
    <div class="detail-header">
      <RouterLink to="/equipos">← Volver</RouterLink>
      <button type="button" @click="handleShare">Compartir</button>
    </div>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="!team">Este equipo ya no existe.</p>

    <template v-else>
      <section class="hero-panel hex-panel">
        <AvatarDisplay :path="team.logo_url" :name="team.name" :size="88" />
        <div class="hero-info">
          <h1>{{ team.name }} <span v-if="team.tag" class="tag-text">[{{ team.tag.toUpperCase() }}]</span></h1>
          <p class="hero-meta">
            {{ team.status }} · {{ team.region }}
            <span v-if="team.min_rank"> · mín. {{ team.min_rank }}</span>
          </p>
        </div>
      </section>

      <ApplyPanel :team="team" :openings="openings" />

      <section v-if="team.description" class="detail-section">
        <h2>Sobre el equipo</h2>
        <p>{{ team.description }}</p>
      </section>

      <section class="detail-section">
        <h2>Integrantes ({{ members.length }})</h2>
        <p v-if="members.length === 0" class="empty-text">Todavía no cargaron el roster.</p>
        <div v-else class="member-list">
          <div v-for="(m, i) in members" :key="i" class="member-row">
            <span class="member-name">{{ m.name }}</span>
            <span class="member-meta">{{ [roleAbbrev(m.role), m.rank].filter(Boolean).join(' · ') }}</span>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <h2>Vacantes</h2>
        <p v-if="openings.length === 0" class="empty-text">Sin vacantes abiertas por ahora.</p>
        <div v-else class="opening-list">
          <div v-for="(o, i) in openings" :key="i" class="opening-item">
            <div class="opening-top">
              <span class="opening-role">{{ o.role || 'Jugador' }}</span>
              <span class="opening-type">{{ (o.type || 'Titular').toUpperCase() }}</span>
            </div>
            <p v-if="o.min_rank" class="opening-rank">Rango mínimo: {{ o.min_rank }}</p>
            <p v-if="o.notes" class="opening-notes">{{ o.notes }}</p>
          </div>
        </div>
      </section>

      <section v-if="team.requirements" class="detail-section">
        <h2>Requisitos</h2>
        <p>{{ team.requirements }}</p>
      </section>

      <section v-if="team.game_modes?.length" class="detail-section">
        <h2>Modos de juego</h2>
        <div class="tag-row">
          <span v-for="m in team.game_modes" :key="m" class="mode-tag">{{ m }}</span>
        </div>
      </section>

      <section class="detail-section">
        <h2>Juega en</h2>
        <div class="tag-row">
          <span v-for="r in regionsList" :key="r" class="region-tag">{{ r }}</span>
        </div>
      </section>

      <section class="detail-section">
        <h2>Contacto</h2>
        <p v-if="contacts.length === 0" class="empty-text">Sin métodos de contacto cargados.</p>
        <div v-else class="contact-list">
          <div v-for="(c, i) in contacts" :key="i" class="contact-item">
            <p class="contact-label">{{ c.label.toUpperCase() }}</p>
            <p class="contact-value">{{ c.value }}</p>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import AvatarDisplay from '../components/AvatarDisplay.vue'
import ApplyPanel from '../components/ApplyPanel.vue'

const route = useRoute()
const team = ref(null)
const loading = ref(true)

const ROLE_ABBREV = { Baron: 'TOP', Jungla: 'JGL', Mid: 'MID', ADC: 'ADC', Support: 'SUP' }
function roleAbbrev(r) {
  return ROLE_ABBREV[r] || r
}

async function fetchTeam() {
  loading.value = true
  const { data } = await supabase
    .from('teams')
    .select('*')
    .eq('id', route.params.id)
    .maybeSingle()

  team.value = data
  loading.value = false
}

onMounted(fetchTeam)

const members = computed(() => team.value ? (team.value.members || []).filter(m => m && m.name) : [])
const openings = computed(() => team.value ? (team.value.openings || []).filter(o => o && (o.role || o.notes)) : [])
const contacts = computed(() => team.value ? (team.value.contacts || []).filter(c => c && c.value) : [])

const regionsList = computed(() => {
  if (!team.value) return []
  return [team.value.region, ...(team.value.play_regions || []).filter(r => r !== team.value.region)]
})

async function handleShare() {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: team.value?.name || 'Equipo', url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copiado')
    }
  } catch {
    // cancelado por el usuario
  }
}
</script>

<style scoped>
.team-detail {
  max-width: 600px;
  margin: 0 auto;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
}
.detail-header a {
  color: var(--color-text-muted);
  text-decoration: none;
}
.hero-panel {
  display: flex;
  gap: 1.2em;
  align-items: center;
  margin-bottom: 1.5em;
}
.hero-info h1 {
  margin: 0;
}
.tag-text {
  color: var(--color-teal);
  font-size: 0.7em;
}
.hero-meta {
  color: var(--color-text-muted);
  font-size: 0.9em;
  margin: 0.3em 0 0;
}
.detail-section {
  margin: 1.5em 0;
}
.detail-section h2 {
  font-size: 1.1em;
  margin-bottom: 0.5em;
}
.empty-text {
  color: var(--color-text-muted);
  font-size: 0.9em;
}
.member-list, .opening-list, .contact-list {
  display: flex;
  flex-direction: column;
  gap: 0.6em;
}
.member-row {
  display: flex;
  justify-content: space-between;
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-border);
  padding: 0.6em 0.8em;
  border-radius: 4px;
}
.member-meta {
  color: var(--color-text-muted);
  font-size: 0.85em;
}
.opening-item {
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-border);
  padding: 0.7em 0.8em;
  border-radius: 4px;
}
.opening-top {
  display: flex;
  justify-content: space-between;
}
.opening-role {
  font-weight: 600;
}
.opening-type {
  font-size: 0.7em;
  color: var(--color-gold);
  border: 1px solid var(--color-gold);
  padding: 0.1em 0.5em;
  border-radius: 4px;
}
.opening-rank, .opening-notes {
  margin: 0.4em 0 0;
  font-size: 0.85em;
  color: var(--color-text-muted);
}
.tag-row {
  display: flex;
  gap: 0.4em;
  flex-wrap: wrap;
}
.mode-tag, .region-tag {
  font-size: 0.75em;
  color: var(--color-text-muted);
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-border);
  padding: 0.2em 0.6em;
  border-radius: 4px;
}
.contact-label {
  font-size: 0.75em;
  color: var(--color-text-muted);
  margin: 0 0 0.2em;
}
.contact-value {
  margin: 0;
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-border);
  padding: 0.6em 0.8em;
  border-radius: 4px;
  word-break: break-all;
}
</style>