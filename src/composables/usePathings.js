import { useSyncedStore } from './useSyncedStore'

const pathings = useSyncedStore('pathings', [])

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function createStep() {
  return {
    id: generateId(),
    type: '',
    wardType: '',
    camp: '',
    objective: '',
    ability: '',
    spellId: '',
    lane: '',
    smite: false,
    location: '',
    area: '',
    orientation: '',
    note: '',
    mapX: null,
    mapY: null,
    mapLabel: '',
    alternatives: [],
  }
}

export function usePathings() {
  function getPathingsForChampion(championId) {
    return pathings.value.filter(p => p.championId === championId)
  }

  function createPathing(championId, name) {
    const newPathing = {
      id: generateId(),
      championId,
      name: name || 'Nuevo pathing',
      mapSide: 'normal', // 'normal' | 'inverted'
      steps: [],
    }
    pathings.value.push(newPathing)
    return newPathing
  }

  function deletePathing(pathingId) {
    const idx = pathings.value.findIndex(p => p.id === pathingId)
    if (idx !== -1) pathings.value.splice(idx, 1)
  }

  function createStep() {
  return {
    id: generateId(),
    type: '',
    wardType: '',
    camp: '',
    objective: '',
    ability: '',
    spellId: '',
    lane: '',
    smite: false,
    location: '',
    area: '',
    orientation: '',
    note: '',
    alternatives: [],
  }
}

  function addStep(pathing) {
    pathing.steps.push(createStep())
  }

  function removeStep(pathing, stepId) {
    const idx = pathing.steps.findIndex(s => s.id === stepId)
    if (idx !== -1) pathing.steps.splice(idx, 1)
  }

  return {
    pathings,
    getPathingsForChampion,
    createPathing,
    deletePathing,
    createStep,
    addStep,
    removeStep,
  }
}