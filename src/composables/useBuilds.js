import { useSyncedStore } from './useSyncedStore'

const builds = useSyncedStore('builds', [])

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function useBuilds() {
  function getBuildsForChampion(championId) {
    return builds.value.filter(b => b.championId === championId)
  }

  function createBuild(championId, name) {
    const newBuild = {
      id: generateId(),
      championId,
      name: name || 'Nueva build',
      mode: 'classic',
      role: '',
      spells: ['', ''],
      runes: {
        keystoneId: '',
        primaryTreeId: '',
        primaryRunes: ['', '', ''],
        secondaryTreeId: '',
        secondaryRune: '',
      },
      slots: Array.from({ length: 6 }, () => ({
        itemId: '',
        alternatives: [],
      })),
    }
    builds.value.push(newBuild)
    return newBuild
  }

  function deleteBuild(buildId) {
    const index = builds.value.findIndex(b => b.id === buildId)
    if (index !== -1) builds.value.splice(index, 1)
  }

  return {
    builds,
    getBuildsForChampion,
    createBuild,
    deleteBuild,
  }
}