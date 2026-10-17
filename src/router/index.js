import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BuildsView from '../views/BuildsView.vue'
import RandomizerView from '../views/RandomizerView.vue'
import OwnedChampionsView from '../views/OwnedChampionsView.vue'
import PathingsView from '../views/PathingsView.vue'
import AuthView from '../views/AuthView.vue'
import { supabase } from '../lib/supabase'
import MyProfileView from '../views/MyProfileView.vue'
import PlayersView from '../views/PlayersView.vue'
import PlayerDetailView from '../views/PlayerDetailView.vue'
import TeamsView from '../views/TeamsView.vue'
import TeamDetailView from '../views/TeamDetailView.vue'
import MyTeamView from '../views/MyTeamView.vue'
import FeedbackView from '../views/FeedbackView.vue'
import GuildsView from '../views/GuildsView.vue'
import GuildDetailView from '../views/GuildDetailView.vue'
import MyGuildView from '../views/MyGuildView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/builds', name: 'builds', component: BuildsView },
  { path: '/randomizer', name: 'randomizer', component: RandomizerView },
  { path: '/my-champions', name: 'my-champions', component: OwnedChampionsView },
  { path: '/:pathMatch(.*)*', redirect: '/' },
  { path: '/pathings', name: 'pathings', component: PathingsView },
  { path: '/auth', name: 'auth', component: AuthView },
  { path: '/jugadores', name: 'jugadores', component: PlayersView },
  { path: '/jugador/:id', name: 'jugador-detalle', component: PlayerDetailView },
  { path: '/equipos', name: 'equipos', component: TeamsView },
  { path: '/equipo/:id', name: 'equipo-detalle', component: TeamDetailView },
  { path: '/feedback', name: 'feedback', component: FeedbackView },
  { path: '/mi-equipo', name: 'mi-equipo', component: MyTeamView, meta: { requiresAuth: true } },
  { path: '/mi-perfil', name: 'mi-perfil', component: MyProfileView, meta: { requiresAuth: true } },
  { path: '/gremios', name: 'gremios', component: GuildsView },
  { path: '/gremio/:id', name: 'gremio-detalle', component: GuildDetailView },
  { path: '/mi-gremio', name: 'mi-gremio', component: MyGuildView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    return { path: '/auth' }
  }
  return true
})

export default router