<template>
  <div>
    <h1>Mis campeones</h1>
    <p>Marca los campeones que tienes desbloqueados. Esto se usa en el Randomizador para filtrar por "solo mis campeones".</p>

    <section class="filters-panel">
      <div class="filters-row">
        <label class="search-field">
          <span>Buscar</span>
          <input
            v-model.trim="searchQuery"
            type="search"
            placeholder="Nombre del campeón"
          />
        </label>

        <label>
          <span>Rol</span>
          <select v-model="roleFilter">
            <option value="all">Todos</option>
            <option v-for="role in availableRoles" :key="role" :value="role">
              {{ roleLabel(role) }}
            </option>
          </select>
        </label>

        <label>
          <span>Estado</span>
          <select v-model="ownershipFilter">
            <option value="all">Todos</option>
            <option value="owned">Solo desbloqueados</option>
            <option value="missing">Solo pendientes</option>
          </select>
        </label>
      </div>

      <div class="filters-summary">
        <p>Mostrando {{ filteredChampions.length }} de {{ champions.length }} campeones.</p>
        <button type="button" class="ghost-button" @click="resetFilters">Limpiar filtros</button>
      </div>
    </section>

    <ul class="champion-grid">
      <li v-for="champ in filteredChampions" :key="champ.id" class="champion-card">
        <button type="button" class="champion-toggle" @click="toggleOwned(champ.id)">
          <img class="champion-image" :src="championImage(champ.id)" :alt="champ.name" />
          <div class="champion-copy">
            <div class="champion-title-row">
              <h3>{{ champ.name }}</h3>
              <span class="ownership-pill" :class="isOwned(champ.id) ? 'owned' : 'missing'">
                {{ isOwned(champ.id) ? 'Desbloqueado' : 'Pendiente' }}
              </span>
            </div>
            <p class="roles">{{ champ.roles.map(roleLabel).join(' · ') }}</p>
          </div>
          <span class="card-checkbox" aria-hidden="true">
            <input
              type="checkbox"
              :checked="isOwned(champ.id)"
              tabindex="-1"
            />
          </span>
        </button>
      </li>
    </ul>

    <p>Tienes {{ ownedChampions.length }} campeones marcados.</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import champions from '../data/champions.json'
import { useOwnedChampions } from '../composables/useOwnedChampions'
import { championImage } from '../utils/images'

const { ownedChampions, toggleOwned, isOwned } = useOwnedChampions()

const searchQuery = ref('')
const roleFilter = ref('all')
const ownershipFilter = ref('all')

const availableRoles = computed(() => {
  const roles = new Set()
  for (const champion of champions) {
    for (const role of champion.roles) {
      roles.add(role)
    }
  }
  return Array.from(roles).sort()
})

const filteredChampions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return champions
    .filter((champion) => {
      const matchesName = !query || champion.name.toLowerCase().includes(query)
      const matchesRole = roleFilter.value === 'all' || champion.roles.includes(roleFilter.value)
      const owned = isOwned(champion.id)
      const matchesOwnership = ownershipFilter.value === 'all'
        || (ownershipFilter.value === 'owned' && owned)
        || (ownershipFilter.value === 'missing' && !owned)

      return matchesName && matchesRole && matchesOwnership
    })
    .slice()
    .sort((a, b) => {
      const nameCompare = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
      if (nameCompare !== 0) return nameCompare
      return a.id.localeCompare(b.id, 'es', { sensitivity: 'base' })
    })
})

function roleLabel(role) {
  const labels = {
    top: 'Top',
    jungle: 'Jungla',
    mid: 'Mid',
    adc: 'ADC',
    support: 'Support',
  }

  return labels[role] || role
}

function resetFilters() {
  searchQuery.value = ''
  roleFilter.value = 'all'
  ownershipFilter.value = 'all'
}
</script>

<style scoped>
.filters-panel {
  margin: 1.25em 0 1.5em;
  padding: 1em;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
}

.filters-row {
  display: grid;
  grid-template-columns: minmax(220px, 1.8fr) repeat(2, minmax(160px, 1fr));
  gap: 0.9em;
  align-items: end;
}

.filters-row label {
  display: flex;
  flex-direction: column;
  gap: 0.35em;
  color: var(--color-text-muted);
  font-size: 0.92em;
}

.search-field input,
.filters-row select {
  width: 100%;
}

.filters-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1em;
  margin-top: 0.9em;
  color: var(--color-text-muted);
  flex-wrap: wrap;
}

.ghost-button {
  border: 1px solid var(--color-border);
  background: transparent;
}

.champion-grid {
  list-style: none;
  padding: 0;
  margin: 1.25em 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.7em;
}

.champion-card {
  margin: 0;
}

.champion-toggle {
  width: 100%;
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 0.65em;
  align-items: center;
  text-align: left;
  padding: 0.7em;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
}

.champion-toggle:hover {
  border-color: var(--color-accent);
  transform: translateY(-1px);
}

.champion-image {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.04);
}

.champion-copy {
  min-width: 0;
}

.champion-copy h3 {
  margin: 0;
  font-size: 1em;
}

.champion-title-row {
  display: flex;
  align-items: center;
  gap: 0.45em;
  justify-content: space-between;
}

.roles {
  margin: 0.25em 0 0;
  color: var(--color-text-muted);
  font-size: 0.86em;
  line-height: 1.25;
}

.ownership-pill {
  padding: 0.18em 0.5em;
  border-radius: 999px;
  font-size: 0.72em;
  white-space: nowrap;
}

.ownership-pill.owned {
  background: rgba(83, 200, 138, 0.16);
  color: #8ee7b4;
}

.ownership-pill.missing {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-muted);
}

.card-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-checkbox input {
  width: 1em;
  height: 1em;
  margin: 0;
}

@media (max-width: 720px) {
  .filters-row {
    grid-template-columns: 1fr;
  }

  .champion-toggle {
    grid-template-columns: 56px 1fr auto;
  }

  .champion-image {
    width: 56px;
    height: 56px;
  }
}
</style>