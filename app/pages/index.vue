<script setup lang="ts">
const auth = useAuthStore()

onMounted(async () => {
  auth.initialize()
  if (auth.isAuthenticated) {
    await navigateTo('/dashboard')
  } else {
    await navigateTo('/login')
  }
})
</script>
