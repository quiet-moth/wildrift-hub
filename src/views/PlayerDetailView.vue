<template>
  <div class="player-detail">
    <div class="detail-header">
      <RouterLink to="/jugadores">← Volver</RouterLink>
      <button type="button" @click="handleShare">Compartir</button>
    </div>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="!profile">Este perfil ya no existe.</p>

    <template v-else>
      <section class="hero-panel hex-panel">
        <AvatarDisplay :path="profile.avatar_url" :name="displayName" :size="88" round />
        <div class="hero-info">
          <h1>{{ displayName }}</h1>
          <p class="hero-meta">{{ profile.riot_id }} · {{ profile.rank }} · {{ profile.region }}</p>
          <div class="tag-row">
            <span v-for="r in profile.roles" :key="r" class="role-pill">{{ roleAbbrev(r) }}</span>
          </div>
        </div>
      </section>

      <section v-if="profile.description" class="detail-section">
        <h2>Sobre mí</h2>
        <p>{{ profile.description }}</p>
      </section>

      <section v-if="profile.game_modes?.length" class="detail-section">
        <h2>Modos de juego</h2>
        <div class="tag-row">
          <span v-for="m in profile.game_modes" :key="m" class="mode-tag">{{ m }}</span>
        </div>
      </section>

      <section class="detail-section">
        <h2>Juega con</h2>
        <div class="tag-row">
          <span v-for="r in regionsList" :key="r" class="region-tag">{{ r }}</span>
        </div>
      </section>

      <section v-if="profile.champions?.length" class="detail-section">
        <h2>Campeones</h2>
        <div class="tag-row">
          <span v-for="c in profile.champions" :key="c" class="region-tag">{{ c }}</span>
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

const route = useRoute()
const profile = ref(null)
const loading = ref(true)

const ROLE_ABBREV = { Baron: 'TOP', Jungla: 'JGL', Mid: 'MID', ADC: 'ADC', Support: 'SUP' }
function roleAbbrev(r) {
  return ROLE_ABBREV[r] || r
}

async function fetchProfile() {
  loading.value = true
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', route.params.id)
    .maybeSingle()

  profile.value = data
  loading.value = false
}

onMounted(fetchProfile)

const displayName = computed(() => {
  if (!profile.value) return ''
  return profile.value.display_name?.trim() || profile.value.riot_id.split('#')[0] || profile.value.riot_id
})

const regionsList = computed(() => {
  if (!profile.value) return []
  return [profile.value.region, ...(profile.value.play_regions || []).filter(r => r !== profile.value.region)]
})

const contacts = computed(() => {
  if (!profile.value) return []
  return (profile.value.contacts || []).filter(c => c && c.value)
})

async function handleShare() {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: displayName.value, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link copiado')
    }
  } catch {
    // el usuario canceló el share, no hacemos nada
  }
}
</script>

<style scoped>
.player-detail {
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
.hero-meta {
  color: var(--color-text-muted);
  font-size: 0.9em;
  margin: 0.3em 0 0.6em;
}
.detail-section {
  margin-bottom: 1.5em;
}
.detail-section h2 {
  font-size: 1.1em;
  margin-bottom: 0.5em;
}
.tag-row {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}
.role-pill {
  font-size: 0.75em;
  color: var(--color-teal);
  border: 1px solid var(--color-teal);
  padding: 0.15em 0.6em;
  border-radius: 4px;
}
.mode-tag, .region-tag {
  font-size: 0.75em;
  color: var(--color-text-muted);
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-border);
  padding: 0.2em 0.6em;
  border-radius: 4px;
}
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
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
.empty-text {
  color: var(--color-text-muted);
  font-size: 0.9em;
}
</style>