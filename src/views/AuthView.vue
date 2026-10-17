<template>
  <div class="auth-view">
    <h1>{{ mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta' }}</h1>

    <form v-if="mode !== 'reset'" @submit.prevent="handleSubmit" class="auth-form hex-panel">
      <label>
        Email
        <input v-model="email" type="email" required />
      </label>
      <label>
        Contraseña
          <div class="password-field">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required minlength="6" />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
      </label>

      <p v-if="errorMsg" class="no-result">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

      <button type="submit" :disabled="busy">
        {{ busy ? 'Enviando...' : (mode === 'login' ? 'Entrar' : 'Registrarme') }}
      </button>

      <button v-if="mode === 'login'" type="button" class="forgot-link" @click="mode = 'reset'; errorMsg = ''; successMsg = ''">
        ¿Olvidaste tu contraseña?
      </button>
    </form>

    <form v-else @submit.prevent="handleReset" class="auth-form hex-panel">
      <p class="reset-hint">Te enviaremos un link para restablecer tu contraseña.</p>
      <label>
        Email
        <input v-model="email" type="email" required />
      </label>

      <p v-if="errorMsg" class="no-result">{{ errorMsg }}</p>
      <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

      <button type="submit" :disabled="busy">{{ busy ? 'Enviando...' : 'Enviar link de recuperación' }}</button>
      <button type="button" class="forgot-link" @click="mode = 'login'; errorMsg = ''; successMsg = ''">
        ← Volver a iniciar sesión
      </button>
    </form>

    <button v-if="mode !== 'reset'" type="button" class="switch-mode" @click="toggleMode">
      {{ mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const mode = ref('login') // 'login' | 'register' | 'reset'
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const busy = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  errorMsg.value = ''
  successMsg.value = ''
}

async function handleSubmit() {
  busy.value = true
  errorMsg.value = ''
  successMsg.value = ''

  if (mode.value === 'login') {
    const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    busy.value = false
    if (error) {
      errorMsg.value = error.message
      return
    }
    router.push('/')
    return
  }

  const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
  busy.value = false
  if (error) {
    errorMsg.value = error.message
    return
  }
  successMsg.value = 'Te hemos enviado un correo de confirmación. Revisa tu bandeja de entrada para activar tu cuenta.'
}

async function handleReset() {
  busy.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: window.location.origin + '/auth',
  })

  busy.value = false
  if (error) {
    errorMsg.value = error.message
    return
  }
  successMsg.value = 'Te hemos enviado un correo con el link para restablecer tu contraseña.'
}
</script>

<style scoped>
.auth-view {
  max-width: 400px;
  margin: 0 auto;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-top: 1em;
}
.auth-form label {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}
.switch-mode {
  display: block;
  margin: 1em auto 0;
  background: transparent;
  border: none;
  text-decoration: underline;
}
.forgot-link {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  text-decoration: underline;
  font-size: 0.85em;
  align-self: center;
}
.success-msg {
  color: var(--color-teal);
  font-size: 0.9em;
}
.reset-hint {
  color: var(--color-text-muted);
  font-size: 0.85em;
  margin: 0;
}
.password-field {
  position: relative;
  display: flex;
}
.password-field input {
  width: 100%;
  padding-right: 2.4em;
  box-sizing: border-box;
}
.password-toggle {
  position: absolute;
  right: 0.4em;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 0.2em;
  cursor: pointer;
  font-size: 1em;
  line-height: 1;
}
</style>