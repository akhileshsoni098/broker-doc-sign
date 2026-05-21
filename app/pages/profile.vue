<template>
  <div>
    <div class="page-header">
      <h1>Profile</h1>
    </div>

    <div class="card" style="max-width:500px">
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <form @submit.prevent="handleUpdate">
        <div class="form-group">
          <label for="name">Full Name</label>
          <input id="name" v-model="form.name" type="text" required />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" disabled style="opacity:.6" />
        </div>
        <div class="form-group">
          <label for="password">New Password (leave blank to keep current)</label>
          <input id="password" v-model="form.password" type="password" placeholder="••••••••" minlength="6" />
        </div>

        <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:.5rem">
          <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save Changes' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const { apiFetch } = useApiFetch()

const form = reactive({ name: auth.brokerName || '', email: auth.brokerEmail || '', password: '' })
const error = ref('')
const success = ref('')
const saving = ref(false)

async function handleUpdate() {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    const data = await apiFetch('/api/broker/profile', {
      method: 'PUT',
      body: JSON.stringify({ name: form.name, password: form.password || undefined }),
    })
    if (data.broker) {
      auth.setAuth(auth.token, data.broker)
    }
    success.value = 'Profile updated!'
  } catch (e: any) {
    error.value = e.message || 'Failed to update profile.'
  } finally {
    saving.value = false
  }
}
</script>
