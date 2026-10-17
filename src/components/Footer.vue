<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>
        <strong>{{ projectName }}</strong> is a fan-made project created under Riot Games'
        "Legal Jibber Jabber" policy using assets owned by Riot Games.
        Riot Games does not endorse or sponsor this project.
      </p>
      <p class="footer-note">
        This is an unofficial tool. Not affiliated with Riot Games.
      </p>
    </div>
  </footer>
</template>

<script setup>
const projectName = 'WRHub'
</script>

<style scoped>
.app-footer {
  margin-top: auto;
  padding: 2em 1.2em;
  background: var(--color-bg-panel-alt);
  border-top: 2px solid var(--color-gold);
  text-align: center;
}

.footer-content {
  max-width: 1100px;
  margin: 0 auto;
}

.footer-content p {
  font-size: 0.85em;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}

.footer-content strong {
  color: var(--color-gold-bright);
}

.footer-note {
  margin-top: 0.6em !important;
  font-size: 0.75em !important;
  color: var(--color-text-muted);
  opacity: 0.7;
}
</style>