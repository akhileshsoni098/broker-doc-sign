<template>
  <div class="auth-shell">
    <div class="auth-card card">
      <div class="auth-header">
        <span class="auth-logo">⚜</span>
        <h1>BrokerDesk</h1>
        <p class="auth-sub">Sign in to your account</p>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="broker@example.com" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn btn-gold btn-block" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>

      <p class="auth-footer">
        Don't have an account? <NuxtLink to="/register">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const auth = useAuthStore()
const { apiFetch } = useApiFetch()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const data = await apiFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.value, password: password.value }),
    })
    auth.setAuth(data.token, data.broker)
    await router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(160deg, var(--navy) 0%, var(--navy-light) 100%); padding: 1rem; }
.auth-card { max-width: 400px; width: 100%; padding: 2.5rem; box-shadow: var(--shadow-lg); border: none; }
.auth-header { text-align: center; margin-bottom: 1.5rem; }
.auth-logo { font-size: 2.5rem; }
.auth-header h1 { font-family: var(--font-display); margin-top: .5rem; font-size: 1.5rem; }
.auth-sub { color: var(--text-muted); font-size: .88rem; margin-top: .25rem; }
.auth-footer { text-align: center; margin-top: 1.25rem; font-size: .85rem; color: var(--text-muted); }
.auth-footer a { color: var(--navy); font-weight: 600; }
.btn-block { width: 100%; justify-content: center; }
</style>
