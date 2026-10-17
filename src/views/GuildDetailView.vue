<template>
  <div class="guild-detail">
    <div class="detail-header">
      <RouterLink to="/gremios">← Volver</RouterLink>
      <button type="button" @click="handleShare">Compartir</button>
    </div>

    <p v-if="loading">Cargando...</p>
    <p v-else-if="!guild">Este gremio ya no existe.</p>

    <template v-else>
      <section class="hero-panel hex-panel">
        <AvatarDisplay :path="guild.logo_url" :name="guild.name" :size="88" />
        <div class="hero-info">
          <h1>{{ guild.name }} <span v-if="guild.tag" class="tag-text">[{{ guild.tag.toUpperCase() }}]</span></h1>
          <p class="hero-meta">
            {{ guild.status }} · {{ guild.region }}
            <span v-if="guild.leader_name"> · Líder: {{ guild.leader_name }}</span>
          </p>
        </div>
      </section>

      <GuildApplyPanel :guild="guild" />

      <section v-if="guild.description" class="detail-section">
        <h2>Sobre el gremio</h2>
        <p>{{ guild.description }}</p>
      </section>

      <section v-if="guild.requirements" class="detail-section">
        <h2>Requisitos</h2>
        <p>{{ guild.requirements }}</p>
      </section>

      <section class="detail-section">
        <h2>Detalles</h2>
        <div class="tag-row">
          <span v-if="guild.language" class="region-tag">Idioma: {{ guild.language }}</span>
          <span v-if="guild.min_games_week" class="region-tag">{{ guild.min_games_week }}</span>
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
import GuildApplyPanel from '../components/GuildApplyPanel.vue'

const route = useRoute()
const guild = ref(null)
const loading = ref(true)

async function fetchGuild() {
  loading.value = true
  const { data } = await supabase
    .from('guilds')
    .select('*')
    .eq('id', route.params.id)
    .maybeSingle()

  guild.value = data
  loading.value = false
}

onMounted(fetchGuild)

const contacts = computed(() => guild.value ? (guild.value.contacts || []).filter(c => c && c.value) : [])

const regionsList = computed(() => {
  if (!guild.value) return []
  return [guild.value.region, ...(guild.value.play_regions || []).filter(r => r !== guild.value.region)]
})

async function handleShare() {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: guild.value?.name || 'Gremio', url })
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
.guild-detail {
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
.tag-row {
  display: flex;
  gap: 0.4em;
  flex-wrap: wrap;
}
.region-tag {
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
</style>