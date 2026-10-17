<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <RouterLink to="/" class="brand">WR Hub</RouterLink>

      <div class="nav-links">
        <div class="dropdown">
          <button type="button" class="dropdown-trigger" ref="toolsBtn" @click="toggleMenu('tools')">
            Herramientas <span class="caret">▾</span>
          </button>
        </div>

        <div class="dropdown">
          <button type="button" class="dropdown-trigger" ref="communityBtn" @click="toggleMenu('community')">
            Comunidad <span class="caret">▾</span>
          </button>
        </div>
      </div>

      <div class="session-area">
        
        <RouterLink v-if="!user" to="/auth" class="session-link">Iniciar sesión</RouterLink>

        <div v-else class="dropdown">
          <button type="button" class="dropdown-trigger" ref="accountBtn" @click="toggleMenu('account')">
            Mi cuenta <span class="caret">▾</span>
          </button>
        </div>
      </div>
    </div>
  </nav>

  <Teleport to="body">
    <div v-if="openMenu" class="menu-overlay" @click="openMenu = null">
      <div class="floating-menu" :style="menuPosition" @click.stop>
        <template v-if="openMenu === 'tools'">
          <RouterLink to="/builds" @click="openMenu = null">Builds</RouterLink>
          <RouterLink to="/randomizer" @click="openMenu = null">Randomizador</RouterLink>
          <RouterLink to="/pathings" @click="openMenu = null">Pathings</RouterLink>
          <RouterLink to="/my-champions" @click="openMenu = null">Mis campeones</RouterLink>
        </template>
        <template v-else-if="openMenu === 'community'">
          <RouterLink to="/jugadores" @click="openMenu = null">Jugadores</RouterLink>
          <RouterLink to="/equipos" @click="openMenu = null">Equipos</RouterLink>
          <RouterLink to="/gremios" @click="openMenu = null">Gremios</RouterLink>
          <RouterLink to="/feedback" @click="openMenu = null">Feedback</RouterLink>
        </template>
        <template v-else-if="openMenu === 'account'">
          <RouterLink to="/mi-perfil" @click="openMenu = null">Mi perfil</RouterLink>
          <button type="button" class="dropdown-signout" @click="handleSignOut">Cerrar sesión</button>
        </template>
      </div>
    </div>
  </Teleport>

  <main class="page">
    <RouterView />
  </main>
  <Footer />
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useSession } from './composables/useSession'
import { supabase } from './lib/supabase'
import Footer from './components/Footer.vue'


const { user } = useSession()

const toolsBtn = ref(null)
const communityBtn = ref(null)
const accountBtn = ref(null)

const openMenu = ref(null) // 'tools' | 'community' | 'account' | null
const menuPosition = ref({})

const BTN_REFS = { tools: toolsBtn, community: communityBtn, account: accountBtn }

async function toggleMenu(name) {
  if (openMenu.value === name) {
    openMenu.value = null
    return
  }
  openMenu.value = name
  await nextTick()

  const btn = BTN_REFS[name].value
  if (!btn) return
  const rect = btn.getBoundingClientRect()

  menuPosition.value = {
    top: rect.bottom + 8 + 'px',
    left: name === 'account'
      ? 'auto'
      : rect.left + 'px',
    right: name === 'account'
      ? (window.innerWidth - rect.right) + 'px'
      : 'auto',
  }
}

async function handleSignOut() {
  await supabase.auth.signOut()
  openMenu.value = null
}
</script>

<style scoped>
.navbar {
  background: var(--color-bg-panel-alt);
  border-bottom: 2px solid var(--color-gold);
}
.navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.9em 1.2em;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6em 1.2em;
}
.brand {
  font-family: var(--font-display);
  font-size: clamp(1em, 4vw, 1.2em);
  color: var(--color-gold-bright);
  text-decoration: none;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.nav-links {
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 0.9em;
}
.dropdown {
  position: relative;
}
.dropdown-trigger {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9em;
  letter-spacing: 0.02em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding-bottom: 0.2em;
  border-bottom: 2px solid transparent;
  line-height: 1;
}
.dropdown-trigger:hover {
  color: var(--color-teal);
}
.caret {
  font-size: 0.8em;
}
.session-area {
  display: flex;
  align-items: center;
}
.session-link {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.9em;
  cursor: pointer;
  text-decoration: none;
}
.session-link:hover {
  color: var(--color-teal);
}
.page {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 2em 1.2em;
  flex: 1;
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .navbar-inner {
    flex-wrap: wrap;
    padding: 0.7em 1em;
    gap: 0.4em 0.8em;
  }
  .brand {
    width: 100%;
    font-size: 1.1em;
  }
  .nav-links {
    gap: 0.9em;
  }
  .nav-links > .dropdown .dropdown-trigger {
    font-size: 0.78em;
    white-space: nowrap;
  }
  .session-area {
    margin-left: auto;
  }
  .session-link {
    font-size: 0.78em;
  }
  .page {
    padding: 1.5em 1em;
  }
}
</style>

<style>
.menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
}
.floating-menu {
  position: fixed;
  background: var(--color-bg-panel);
  border: 1px solid var(--color-gold);
  min-width: 160px;
  display: flex;
  flex-direction: column;
}
.floating-menu a {
  padding: 0.7em 1em;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.85em;
  border-bottom: 1px solid var(--color-border);
}
.floating-menu a:last-child {
  border-bottom: none;
}
.floating-menu a:hover {
  color: var(--color-teal);
  background: var(--color-bg-panel-alt);
}
.floating-menu a.router-link-exact-active {
  color: var(--color-gold-bright);
}
.dropdown-signout {
  padding: 0.7em 1em;
  color: var(--color-danger);
  background: transparent;
  border: none;
  font-family: var(--font-body);
  font-size: 0.85em;
  text-align: left;
  cursor: pointer;
}
.dropdown-signout:hover {
  background: var(--color-bg-panel-alt);
}
</style>