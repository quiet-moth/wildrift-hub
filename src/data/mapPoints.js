export const MAP_CATEGORIES = [
  { id: 'bases', label: 'Bases' },
  { id: 'buffs', label: 'Buffs' },
  { id: 'camps', label: 'Campamentos' },
  { id: 'bushes', label: 'Bushes' },
  { id: 'lanes', label: 'Líneas' },
  { id: 'objectives', label: 'Objetivos' },
]

export const MAP_POINTS = [
  { id: 'blue_base', label: 'Base Azul', x: 11, y: 87, category: 'bases' },
  { id: 'red_base', label: 'Base Roja', x: 80, y: 13, category: 'bases' },

  { id: 'blue_buff_blue_side', label: 'Blue Buff (lado azul)', x: 34, y: 40, category: 'buffs' },
  { id: 'blue_buff_red_side', label: 'Blue Buff (lado rojo)', x: 69, y: 45, category: 'buffs' },
  { id: 'red_buff_blue_side', label: 'Red Buff (lado azul)', x: 53, y: 67, category: 'buffs' },
  { id: 'red_buff_red_side', label: 'Red Buff (lado rojo)', x: 50, y: 22, category: 'buffs' },

  { id: 'gromp_blue_side', label: 'Gromp (lado azul)', x: 27, y: 36, category: 'camps' },
  { id: 'gromp_red_side', label: 'Gromp (lado rojo)', x: 78, y: 48, category: 'camps' },
  { id: 'wolves_blue_side', label: 'Lobos (lado azul)', x: 30, y: 51, category: 'camps' },
  { id: 'wolves_red_side', label: 'Lobos (lado rojo)', x: 71, y: 34, category: 'camps' },
  { id: 'raptors_blue_side', label: 'Rapaces (lado azul)', x: 50, y: 58, category: 'camps' },
  { id: 'raptors_red_side', label: 'Rapaces (lado rojo)', x: 53, y: 29, category: 'camps' },
  { id: 'krugs_blue_side', label: 'Krugs (lado azul)', x: 63, y: 72, category: 'camps' },
  { id: 'krugs_red_side', label: 'Krugs (lado rojo)', x: 42, y: 20, category: 'camps' },

  { id: 'top_river_bush', label: 'Bush río top', x: 38, y: 23, category: 'bushes' },
  { id: 'top_river_bush_2', label: 'Bush río top 2', x: 32, y: 26, category: 'bushes' },
  { id: 'top_turret_bush_blue_side', label: 'Bush torre top (lado azul)', x: 27, y: 30, category: 'bushes' },
  { id: 'top_turret_bush_red_side', label: 'Bush torre top (lado rojo)', x: 45, y: 17, category: 'bushes' },

  { id: 'bot_river_bush', label: 'Bush río bot', x: 75, y: 65, category: 'bushes' },
  { id: 'bot_bush_2', label: 'Bush bot', x: 68, y: 68, category: 'bushes' },
  { id: 'bot_turret_bush_blue_side', label: 'Bush torre bot (lado azul)', x: 62, y: 77, category: 'bushes' },
  { id: 'bot_turret_bush_red_side', label: 'Bush torre bot (lado rojo)', x: 79, y: 57, category: 'bushes' },

  { id: 'mid_river_bush', label: 'Bush río mid', x: 46, y: 37, category: 'bushes' },
  { id: 'mid_river_bush_2', label: 'Bush río mid 2', x: 56, y: 48, category: 'bushes' },
  { id: 'mid_turret_bush_blue_side', label: 'Bush torre mid (lado azul)', x: 38, y: 48, category: 'bushes' },
  { id: 'mid_turret_bush_red_side', label: 'Bush torre mid (lado rojo)', x: 65, y: 39, category: 'bushes' },
  
  { id: 'red_bush_blue_side', label: 'Bush red (lado azul)', x: 58, y: 64, category: 'bushes' },
  { id: 'raptor_bush_blue_side', label: 'Bush rapaces (lado azul)', x: 46, y: 64, category: 'bushes' },
  { id: 'blue_bush_blue_side', label: 'Bush blue (lado azul)', x: 32, y: 42, category: 'bushes' },
  { id: 'blue_bush_red_side', label: 'Bush blue (lado rojo)', x: 71, y: 43, category: 'bushes' },
  { id: 'red_bush_red_side', label: 'Bush red (lado rojo)', x: 47, y: 26, category: 'bushes' },
  { id: 'raptor_bush_red_side', label: 'Bush rapaces (lado rojo)', x: 56, y: 25, category: 'bushes' },

  { id: 'top_lane', label: 'Línea Top', x: 28, y: 18, category: 'lanes' },
  { id: 'mid_lane', label: 'Línea Mid', x: 51, y: 43, category: 'lanes' },
  { id: 'bot_lane', label: 'Línea Bot', x: 82, y: 76, category: 'lanes' },

  { id: 'dragon_pit', label: 'Foso del Dragón', x: 65, y: 60, category: 'objectives' },
  { id: 'baron_pit', label: 'Foso del Barón', x: 40, y: 29, category: 'objectives' },
  { id: 'crab_river_bot', label: 'Río Bot (cangrejo)', x: 69, y: 57, category: 'objectives' },
  { id: 'crab_river_top', label: 'Río Top (cangrejo)', x: 37, y: 32, category: 'objectives' },
]