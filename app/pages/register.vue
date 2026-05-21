<template>
  <div class="auth-shell">
    <div class="auth-card card">
      <div class="auth-header">
        <span class="auth-logo">⚜</span>
        <h1>Create Account</h1>
        <p class="auth-sub">Register as a new broker</p>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input id="name" v-model="name" type="text" placeholder="John Doe" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="broker@example.com" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Min. 6 characters" minlength="6" required />
        </div>
        <button type="submit" class="btn btn-gold btn-block" :disabled="loading">
          {{ loading ? 'Creating account…' : 'Create Account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account? <NuxtLink to="/login">Sign In</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const auth = useAuthStore()
const { apiFetch } = useApiFetch()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    const data = await apiFetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ name: name.value, email: email.value, password: password.value }),
    })
    auth.setAuth(data.token, data.broker)
    await router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message || 'Registration failed'
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
