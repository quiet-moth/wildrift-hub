import itemsData from '../data/items.json'

const CATEGORY_LABELS = {
  fighter: 'Peleador',
  assassin: 'Asesino',
  marksman: 'Tirador',
  mage: 'Magia',
  defense: 'Defensa',
  support: 'Soporte',
  boots: 'Botas',
}

export function useAllItems() {
  const allItems = [
    ...itemsData.items.map(i => ({ ...i, isActive: false })),
    ...itemsData.actives.map(a => ({
      ...a,
      incompatibleWith: [],
      modes: a.modes || ['classic', 'aram'],
      isActive: true,
    })),
  ]

  function getItemsByMode(mode) {
    if (!mode) return allItems
    return allItems.filter(i => i.modes.includes(mode))
  }

  function getItemsByCategory(items, category) {
    if (!category || category === 'all') return items
    if (category === 'actives') return items.filter(i => i.isActive)
    return items.filter(i => i.category.includes(category))
  }

  return { allItems, getItemsByMode, getItemsByCategory, CATEGORY_LABELS }
}