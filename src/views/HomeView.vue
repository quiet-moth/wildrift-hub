<template>
  <div class="home">
    <header class="hero">
      <h1>Wild Rift Hub</h1>
      <p>Herramientas para armar tus builds, sortear tu próxima partida y dominar la jungla.</p>
    </header>

    <section class="tools-grid">
      <RouterLink to="/builds" class="tool-card hex-panel">
        <h2>Builds</h2>
        <p>Crea y guarda builds de ítems para tus campeones, con alternativas y notas personalizadas.</p>
      </RouterLink>

      <RouterLink to="/randomizer" class="tool-card hex-panel">
        <h2>Randomizador</h2>
        <p>Sortea campeón, rol, hechizos, runas e ítems. Ideal para retos o partidas casuales.</p>
      </RouterLink>

      <RouterLink to="/pathings" class="tool-card hex-panel">
        <h2>Pathings</h2>
        <p>Crea tu propio pathing de jungla con los puntos de interés y los objetivos estratégicos.</p>
      </RouterLink>
    </section>

    <RouterLink to="/my-champions" class="secondary-link">
      Gestionar mis campeones →
    </RouterLink>
  </div>
</template>

<script setup>
import { useSession } from '../composables/useSession'
const { user, loading } = useSession()
</script>

<style scoped>
.home {
  max-width: 900px;
  margin: 0 auto;
  padding: 2em 1em;
}
.hero {
  text-align: center;
  margin-bottom: 2.5em;
}
.hero h1 {
  font-size: 2.2em;
  margin-bottom: 0.3em;
}
.hero p {
  color: #666;
}
.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25em;
  align-items: stretch;
}
.tool-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s;
  min-height: 100%;
}
.tool-card:hover {
  transform: translateY(-3px);
}
.tool-card h2 {
  margin-top: 0;
}
.tool-card p {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 0;
}
.secondary-link {
  display: block;
  text-align: center;
  margin-top: 2em;
  color: #555;
}

@media (max-width: 900px) {
  .tools-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .tools-grid {
    grid-template-columns: 1fr;
  }
}
</style>