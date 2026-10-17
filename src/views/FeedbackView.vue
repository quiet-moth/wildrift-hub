<template>
  <div class="feedback-view">
    <header>
      <p class="eyebrow">Comunidad</p>
      <h1>Feedback y sugerencias</h1>
      <p class="subtitle">Cuéntanos qué mejorarías, qué falla o qué te gustaría ver. Vota lo que más te interese para priorizarlo.</p>
    </header>

    <form v-if="user" @submit.prevent="handleCreate" class="feedback-form hex-panel">
      <div class="chip-row">
  <button
    v-for="c in CATEGORIES" :key="c" type="button"
    class="chip" :class="[categoryClass(c), { active: category === c }]"
    @click="category = c"
  >{{ c }}</button>
</div>
      <input v-model="authorName" maxlength="60" placeholder="Título (opcional)" />
      <textarea v-model="message" maxlength="1000" rows="4" placeholder="Tu mensaje..."></textarea>
      <div class="form-footer">
        <span class="char-count">{{ message.length }}/1000</span>
        <button type="submit" :disabled="creating">{{ creating ? 'Enviando...' : 'Publicar' }}</button>
      </div>
    </form>
    <div v-else class="panel-box">
      <RouterLink to="/auth" class="link-accent">Inicia sesión</RouterLink>
      para dejar tu comentario o votar. Puedes leer los de la comunidad igual.
    </div>

    <div class="control-row">
      <span class="control-label">ORDENAR:</span>
      <button type="button" class="pill" :class="{ active: sort === 'votos' }" @click="sort = 'votos'">MÁS VOTADOS</button>
      <button type="button" class="pill" :class="{ active: sort === 'recientes' }" @click="sort = 'recientes'">RECIENTES</button>
    </div>

    <div class="control-row wrap">
      <span class="control-label">FILTRAR:</span>
      <button
  v-for="c in ['Todos', ...CATEGORIES]" :key="c" type="button"
  class="pill" :class="[c !== 'Todos' ? categoryClass(c) : '', { active: filter === c }]"
  @click="filter = c"
>{{ c.toUpperCase() }}</button>
    </div>

    <section class="items-list">
      <p v-if="loading">Cargando...</p>
      <p v-else-if="sorted.length === 0" class="empty-text">Todavía no hay comentarios.</p>

      <article v-for="item in sorted" :key="item.id" class="feedback-card hex-panel" :class="{ closed: isClosedStatus(item.status) }">
        <div class="card-top">
          <span class="tag category-tag" :class="categoryClass(item.category)">{{ item.category.toUpperCase() }}</span>
          <span class="tag status-tag" :class="statusClass(item.status)">{{ item.status.toUpperCase() }}</span>
          <span class="author-name">{{ item.author_name || 'Sin título' }}</span>
          <span class="date-text">{{ formatDate(item.created_at) }}</span>
        </div>

        <p class="message-text">{{ item.message }}</p>

        <div class="card-actions">
          <button
            type="button" class="vote-btn" :class="{ active: voteMap.get(item.id)?.mine === 1 }"
            :disabled="isClosedStatus(item.status)"
            @click="handleVote(item.id, 1)"
            >▲ {{ voteMap.get(item.id)?.up || 0 }}</button>
          <button
            type="button" class="vote-btn down" :class="{ active: voteMap.get(item.id)?.mine === -1 }"
            :disabled="isClosedStatus(item.status)"
            @click="handleVote(item.id, -1)"
            >▼ {{ voteMap.get(item.id)?.down || 0 }}</button>

          <span class="score-text">{{ formatScore(item.id) }}</span>

          <button
            v-if="isAdmin || user?.id === item.user_id"
            type="button" class="delete-link"
            @click="handleDelete(item.id)"
          >ELIMINAR</button>
        </div>

        <div v-if="isAdmin" class="admin-row">
          <span class="admin-label">ADMIN:</span>
          <button
            v-for="s in STATUSES" :key="s" type="button"
            class="status-chip" :class="[statusClass(s), { active: item.status === s }]"
            @click="handleSetStatus(item.id, s)"
          >{{ s.toUpperCase() }}</button>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useSession } from '../composables/useSession'
import { useIsAdmin } from '../composables/useIsAdmin'

const CATEGORIES = ['Sugerencia', 'Error', 'Comentario']

const CATEGORY_CLASS = {
  Sugerencia: 'cat-suggestion',
  Error: 'cat-error',
  Comentario: 'cat-comment',
}
function categoryClass(c) {
  return CATEGORY_CLASS[c] || 'cat-suggestion'
}

const STATUSES = ['No visto', 'En consideración', 'En proceso', 'Solucionado', 'Descartado']

const { user } = useSession()
const { isAdmin } = useIsAdmin()

const items = ref([])
const votes = ref([])
const loading = ref(true)

const category = ref('Sugerencia')
const authorName = ref('')
const message = ref('')
const creating = ref(false)

const sort = ref('votos')
const filter = ref('Todos')

async function fetchFeedback() {
  loading.value = true
  const { data } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  items.value = data || []
  loading.value = false
}

async function fetchVotes() {
  const { data } = await supabase
    .from('feedback_votes')
    .select('feedback_id,user_id,value')
  votes.value = data || []
}

onMounted(() => {
  fetchFeedback()
  fetchVotes()
})

const voteMap = computed(() => {
  const map = new Map()
  for (const v of votes.value) {
    const entry = map.get(v.feedback_id) || { up: 0, down: 0, mine: null }
    if (v.value > 0) entry.up += 1
    else entry.down += 1
    if (user.value && v.user_id === user.value.id) entry.mine = v.value
    map.set(v.feedback_id, entry)
  }
  return map
})

const CLOSED_STATUSES = ['Solucionado', 'Descartado']

const sorted = computed(() => {
  const list = items.value.filter(i => filter.value === 'Todos' || i.category === filter.value)

  const withOrder = list.map(item => ({
    item,
    isClosed: CLOSED_STATUSES.includes(item.status) ? 1 : 0,
  }))

  withOrder.sort((a, b) => {
    if (a.isClosed !== b.isClosed) return a.isClosed - b.isClosed

    if (sort.value === 'votos') {
      const sa = voteMap.value.get(a.item.id)
      const sb = voteMap.value.get(b.item.id)
      const scoreA = (sa?.up || 0) - (sa?.down || 0)
      const scoreB = (sb?.up || 0) - (sb?.down || 0)
      if (scoreA !== scoreB) return scoreB - scoreA
      return b.item.created_at.localeCompare(a.item.created_at)
    }
    return b.item.created_at.localeCompare(a.item.created_at)
  })

  return withOrder.map(w => w.item)
})

function isClosedStatus(status) {
  return CLOSED_STATUSES.includes(status)
}

function formatScore(id) {
  const s = voteMap.value.get(id)
  const score = (s?.up || 0) - (s?.down || 0)
  return score >= 0 ? `+${score}` : score
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CL')
}

const STATUS_CLASS = {
  'No visto': 'status-none',
  'En consideración': 'status-info',
  'En proceso': 'status-warn',
  'Solucionado': 'status-ok',
  'Descartado': 'status-bad',
}
function statusClass(s) {
  return STATUS_CLASS[s] || 'status-none'
}

async function handleCreate() {
  if (!user.value) return
  const text = message.value.trim()
  if (!text) return
  creating.value = true

  const { error } = await supabase.from('feedback').insert({
    user_id: user.value.id,
    author_name: authorName.value.trim().slice(0, 60),
    category: category.value,
    message: text,
  })

  creating.value = false
  if (!error) {
    message.value = ''
    fetchFeedback()
  }
}

async function handleVote(id, value) {
  if (!user.value) return

  const item = items.value.find(i => i.id === id)
  if (item && isClosedStatus(item.status)) return

  const mine = voteMap.value.get(id)?.mine ?? null

  if (mine === value) {
    await supabase.from('feedback_votes').delete().eq('feedback_id', id).eq('user_id', user.value.id)
  } else {
    await supabase.from('feedback_votes').upsert(
      { feedback_id: id, user_id: user.value.id, value },
      { onConflict: 'feedback_id,user_id' }
    )
  }
  fetchVotes()
}

async function handleDelete(id) {
  if (!confirm('¿Eliminar este comentario?')) return
  await supabase.from('feedback').delete().eq('id', id)
  fetchFeedback()
}

async function handleSetStatus(id, status) {
  await supabase.from('feedback').update({ status }).eq('id', id)
  fetchFeedback()
}
</script>

<style scoped>
.feedback-view {
  max-width: 640px;
  margin: 0 auto;
}
.eyebrow {
  font-size: 0.75em;
  letter-spacing: 0.2em;
  color: var(--color-text-muted);
  margin: 0;
}
.subtitle {
  color: var(--color-text-muted);
  font-size: 0.9em;
}
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
  margin: 1em 0 1.5em;
}
.chip-row {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}
.chip {
  font-size: 0.8em;
  padding: 0.4em 0.9em;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: transparent;
  border-radius: 999px;
}
.chip.active {
  border-color: var(--color-teal);
  color: var(--color-teal);
}
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.char-count {
  font-size: 0.75em;
  color: var(--color-text-muted);
}
.panel-box {
  background: var(--color-bg-panel-alt);
  border: 1px solid var(--color-border);
  padding: 0.9em;
  font-size: 0.85em;
  color: var(--color-text-muted);
  margin: 1em 0 1.5em;
}
.link-accent {
  color: var(--color-teal);
  font-weight: 600;
}
.control-row {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.8em;
}
.control-row.wrap {
  flex-wrap: wrap;
}
.control-label {
  font-size: 0.7em;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}
.pill {
  font-size: 0.7em;
  padding: 0.3em 0.7em;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: transparent;
  border-radius: 999px;
}
.pill.active {
  background: var(--color-gold);
  color: var(--color-bg);
  border-color: var(--color-gold);
}
.items-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-top: 1em;
}
.empty-text {
  color: var(--color-text-muted);
  font-size: 0.9em;
}
.feedback-card {
  padding: 1em;
}
.card-top {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;
}
.tag {
  font-size: 0.65em;
  padding: 0.15em 0.5em;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}
.category-tag {
  color: var(--color-teal);
  border-color: var(--color-teal);
}
.status-tag.status-none { color: var(--color-text-muted); }
.status-tag.status-info { color: var(--color-teal); border-color: var(--color-teal); }
.status-tag.status-warn { color: var(--color-gold); border-color: var(--color-gold); }
.status-tag.status-ok { color: #8ee7b4; border-color: #8ee7b4; }
.status-tag.status-bad { color: var(--color-danger); border-color: var(--color-danger); }
.author-name {
  font-size: 0.85em;
  font-weight: 600;
}
.date-text {
  font-size: 0.7em;
  color: var(--color-text-muted);
  margin-left: auto;
}
.message-text {
  margin: 0.6em 0;
  font-size: 0.9em;
  white-space: pre-wrap;
  word-break: break-word;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 0.6em;
}
.vote-btn {
  font-size: 0.8em;
  padding: 0.3em 0.6em;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: transparent;
}
.vote-btn.active {
  border-color: var(--color-gold);
  color: var(--color-gold);
}
.vote-btn.down.active {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
.score-text {
  font-size: 0.75em;
  color: var(--color-text-muted);
}
.delete-link {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--color-danger);
  font-size: 0.75em;
  text-decoration: underline;
}
.admin-row {
  display: flex;
  align-items: center;
  gap: 0.4em;
  flex-wrap: wrap;
  border-top: 1px solid var(--color-border);
  margin-top: 0.8em;
  padding-top: 0.8em;
}
.admin-label {
  font-size: 0.65em;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
}
.status-chip {
  font-size: 0.65em;
  padding: 0.2em 0.6em;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  background: transparent;
  border-radius: 999px;
}
.category-tag.cat-suggestion, .chip.cat-suggestion.active, .pill.cat-suggestion.active {
  color: var(--color-teal);
  border-color: var(--color-teal);
}
.category-tag.cat-error, .chip.cat-error.active, .pill.cat-error.active {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
.category-tag.cat-comment, .chip.cat-comment.active, .pill.cat-comment.active {
  color: #b794f6;
  border-color: #b794f6;
}
.feedback-card.closed {
  opacity: 0.55;
  filter: grayscale(0.6);
}
.vote-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.status-chip.active.status-none { border-color: var(--color-text-muted); color: var(--color-text-muted); }
.status-chip.active.status-info { border-color: var(--color-teal); color: var(--color-teal); }
.status-chip.active.status-warn { border-color: var(--color-gold); color: var(--color-gold); }
.status-chip.active.status-ok { border-color: #8ee7b4; color: #8ee7b4; }
.status-chip.active.status-bad { border-color: var(--color-danger); color: var(--color-danger); }
</style>