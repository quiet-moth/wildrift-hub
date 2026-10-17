const assetUrls = import.meta.glob('../assets/**/*.png', {
  eager: true,
  import: 'default',
})

function imgUrl(folder, id) {
  if (!id) return null

  return assetUrls[`../assets/${folder}/${id}.png`] || null
}

export const championImage = (id) => imgUrl('champions', id)
export const itemImage = (id) => imgUrl('items', id)
export const spellImage = (id) => imgUrl('spells', id)
export const keystoneImage = (id) => imgUrl('runes/keystones', id)
export const treeImage = (id) => imgUrl('runes/trees', id)
export const roleImage = (id) => imgUrl('roles', id)
export const runeImage = (id) => imgUrl('runes/individual', id)
export const campImage = (id) => imgUrl('jungle/camps', id)
export const objectiveImage = (id) => imgUrl('jungle/objectives', id)
export const wardImage = (type) => imgUrl('jungle/wards', type)
export const actionImage = (id) => imgUrl('jungle/actions', id)