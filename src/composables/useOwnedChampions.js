import { useSyncedStore } from './useSyncedStore'

const ownedChampions = useSyncedStore('owned_champions', [])

export function useOwnedChampions() {
  function toggleOwned(championId) {
    const index = ownedChampions.value.indexOf(championId)
    if (index === -1) {
      ownedChampions.value.push(championId)
    } else {
      ownedChampions.value.splice(index, 1)
    }
  }

  function isOwned(championId) {
    return ownedChampions.value.includes(championId)
  }

  return {
    ownedChampions,
    toggleOwned,
    isOwned,
  }
}