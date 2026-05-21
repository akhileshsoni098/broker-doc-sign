<template>
  <div class="error-shell">
    <div class="error-card">
      <div class="error-code">{{ error?.statusCode || 404 }}</div>
      <h1 v-if="error?.statusCode === 404">Page Not Found</h1>
      <h1 v-else>Something Went Wrong</h1>
      <p>{{ error?.message || 'The page you are looking for does not exist.' }}</p>
      <div class="error-actions">
        <NuxtLink to="/dashboard" class="btn btn-gold">Go to Dashboard →</NuxtLink>
        <button class="btn btn-outline" @click="handleError">Try Again</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  error: Object as any,
})

const handleError = () => clearError({ redirect: '/dashboard' })
</script>

<style scoped>
.error-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(160deg, var(--navy) 0%, var(--navy-light) 100%); padding: 1rem; }
.error-card { max-width: 440px; width: 100%; text-align: center; color: #fff; }
.error-code { font-size: 5rem; font-weight: 800; color: var(--gold); line-height: 1; margin-bottom: .5rem; font-family: var(--font-display); }
.error-card h1 { font-size: 1.5rem; margin-bottom: .5rem; }
.error-card p { color: rgba(255,255,255,.6); margin-bottom: 1.5rem; font-size: .92rem; }
.error-actions { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
</style>
