import { ref } from 'vue'
import champions from '../data/champions.json'
import summonerSpells from '../data/summonerSpells.json'
import runesData from '../data/runes.json'
import itemsData from '../data/items.json'
import rolesData from '../data/roles.json'
import { useOwnedChampions } from './useOwnedChampions'

// ---------- Funciones puras (sin tocar refs) ----------

function pickChampion(pool) {
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

function pickRole() {
  return rolesData[Math.floor(Math.random() * rolesData.length)]
}

function pickSpells(mode = 'classic', forceSmite = false, excludeSmite = false) {
  let pool = summonerSpells
  if (mode !== 'all') {
    pool = pool.filter(s => s.modes.includes(mode))
  }

  if (forceSmite) {
    const smite = pool.find(s => s.id === 'smite')
    if (smite) {
      const others = pool.filter(s => s.id !== 'smite')
      const other = others[Math.floor(Math.random() * others.length)]
      return Math.random() < 0.5 ? [smite, other] : [other, smite]
    }
  } else if (excludeSmite) {
    pool = pool.filter(s => s.id !== 'smite')
  }

  if (pool.length < 2) return null
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 2)
}

function pickRunes() {
  const { keystones, trees } = runesData

  const keystone = keystones[Math.floor(Math.random() * keystones.length)]
  const primaryTree = trees[Math.floor(Math.random() * trees.length)]

  const primaryRunes = primaryTree.slots.map(slotOptions => {
    return slotOptions[Math.floor(Math.random() * slotOptions.length)]
  })

  const secondaryOptions = trees.filter(t => t.id !== primaryTree.id)
  const secondaryTree = secondaryOptions[Math.floor(Math.random() * secondaryOptions.length)]
  const secondaryAllRunes = secondaryTree.slots.flat()
  const secondaryRune = secondaryAllRunes[Math.floor(Math.random() * secondaryAllRunes.length)]

  return {
    keystone,
    primaryTree: primaryTree.name,
    primaryTreeId: primaryTree.id,
    primaryRunes,
    secondaryTree: secondaryTree.name,
    secondaryTreeId: secondaryTree.id,
    secondaryRune,
  }
}

function pickItems(mode = 'classic', activeMode = 'random') {
  const { items, actives } = itemsData

  const bootsPool = items.filter(i => i.category.includes('boots') && i.modes.includes(mode))
  if (bootsPool.length === 0) return null
  const boots = bootsPool[Math.floor(Math.random() * bootsPool.length)]

  let shouldIncludeActive = false
  if (activeMode === 'yes') shouldIncludeActive = true
  else if (activeMode === 'random') shouldIncludeActive = Math.random() < 0.5

  let active = null
  if (shouldIncludeActive) {
    const activePool = actives.filter(a => !a.modes || a.modes.includes(mode))
    if (activePool.length > 0) {
      active = activePool[Math.floor(Math.random() * activePool.length)]
    }
  }

  const slotsRemaining = 6 - 1 - (active ? 1 : 0)
  const normalPool = items.filter(i => !i.category.includes('boots') && i.modes.includes(mode))

  const chosenItems = []
  const chosenIds = new Set()

  function isCompatible(candidate) {
    for (const picked of chosenItems) {
      if (picked.incompatibleWith.includes(candidate.id)) return false
      if (candidate.incompatibleWith.includes(picked.id)) return false
    }
    return true
  }

  let attempts = 0
  while (chosenItems.length < slotsRemaining && attempts < 500) {
    attempts++
    const candidate = normalPool[Math.floor(Math.random() * normalPool.length)]
    if (chosenIds.has(candidate.id)) continue
    if (!isCompatible(candidate)) continue
    chosenItems.push(candidate)
    chosenIds.add(candidate.id)
  }

  return { boots, active, items: chosenItems }
}

function buildFullLoadout(champion, role, mode = 'classic', activeMode = 'random', forceSmiteJungle = false) {
  const isJungle = role === 'jungle'
  const forceSmite = forceSmiteJungle && isJungle
  const excludeSmite = forceSmiteJungle && !isJungle

  return {
    champion,
    role,
    spells: pickSpells(mode === 'aram' ? 'aram' : 'classic', forceSmite, excludeSmite),
    runes: pickRunes(),
    items: pickItems(mode, activeMode),
  }
}

// ---------- Composable ----------

export function useRandomizer() {
  const { ownedChampions } = useOwnedChampions()

  const result = ref(null)
  const spellsResult = ref(null)
  const runesResult = ref(null)
  const itemsResult = ref(null)
  const roleResult = ref(null)
  const teamResult = ref(null)

  function randomizeChampion(filters = {}) {
    const { onlyOwned = false } = filters
    let pool = champions
    if (onlyOwned) {
      pool = pool.filter(c => ownedChampions.value.includes(c.id))
    }
    const picked = pickChampion(pool)
    result.value = picked
    return picked
  }

  function randomizeRole() {
    const picked = pickRole()
    roleResult.value = picked
    return picked
  }

function randomizeSpells(mode = 'classic', forceSmite = false, excludeSmite = false) {
  const picked = pickSpells(mode, forceSmite, excludeSmite)
  spellsResult.value = picked
  return picked
}

  function randomizeRunes() {
    const picked = pickRunes()
    runesResult.value = picked
    return picked
  }

  function randomizeItems(mode = 'classic', activeMode = 'random') {
    const picked = pickItems(mode, activeMode)
    itemsResult.value = picked
    return picked
  }

  function randomizeTeam(count, filters = {}) {
  const { onlyOwned = false, mode = 'classic', activeMode = 'random', forceSmiteJungle = false } = filters

  let pool = champions
  if (onlyOwned) {
    pool = pool.filter(c => ownedChampions.value.includes(c.id))
  }

  if (!count || count < 1 || count > pool.length) {
    teamResult.value = null
    return null
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const picks = shuffled.slice(0, count)
  const roleCycle = ['top', 'jungle', 'mid', 'adc', 'support']

  const team = picks.map((champ, i) => {
    const role = roleCycle[i % 5]
    return buildFullLoadout(champ, role, mode, activeMode, forceSmiteJungle)
  })

  teamResult.value = team
  return team
}

  return {
    result, randomizeChampion,
    spellsResult, randomizeSpells,
    runesResult, randomizeRunes,
    itemsResult, randomizeItems,
    roleResult, randomizeRole,
    teamResult, randomizeTeam,
  }
}