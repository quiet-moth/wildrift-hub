import jungleData from '../data/jungleData.json'
import summonerSpellsData from '../data/summonerSpells.json'
import { campImage, objectiveImage, wardImage, spellImage, actionImage } from '../utils/images'

const TYPE_ICONS = { ability: '⚔️', gank: '🗡️', invade: '🚨', backer: '🏠', note: '📝' }
const WARD_LABELS = { normal: 'Ward normal', pink: 'Ward rosa', lens: 'Lente revelador' }
const LANE_LABELS = { top: 'Top', mid: 'Mid', bottom: 'Bot' }

function campName(id) {
  return jungleData.camps.find(c => c.id === id)?.name || '—'
}
function objectiveName(id) {
  return jungleData.objectives.find(o => o.id === id)?.name || '—'
}
function spellName(id) {
  return summonerSpellsData.find(s => s.id === id)?.name || '—'
}

export function getStepImage(n) {
  switch (n.type) {
    case 'ward': return n.wardType ? wardImage(n.wardType) : null
    case 'camp': return n.camp ? campImage(n.camp) : null
    case 'objective': return n.objective ? objectiveImage(n.objective) : null
    case 'summoner': return n.spellId ? spellImage(n.spellId) : null
    case 'backer': return actionImage('backer')
    default: return null
  }
}

export function getStepEmoji(n) {
  return TYPE_ICONS[n.type] || '•'
}

export function getStepDescription(n) {
  switch (n.type) {
    case 'ward': return `${WARD_LABELS[n.wardType] || 'Ward'}${n.location ? ' en ' + n.location : ''}`
    case 'camp': return `${campName(n.camp)}${n.smite ? ' (Castigo)' : ''}`
    case 'objective': return `${objectiveName(n.objective)}${n.smite ? ' (Castigo)' : ''}`
    case 'ability': return `Subir ${n.ability || '—'}`
    case 'summoner': return `Usar ${spellName(n.spellId)}`
    case 'gank': return `Gankear ${LANE_LABELS[n.lane] || '—'}`
    case 'invade': return `Invadir${n.area ? ': ' + n.area : ''}`
    case 'backer': return 'Backear'
    case 'note': return 'Nota'
    default: return '— Sin definir —'
  }
}