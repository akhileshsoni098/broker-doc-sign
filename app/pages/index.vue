<script setup lang="ts">
const auth = useAuthStore()

onMounted(async () => {

  onMounted(() => {

  auth.init()

})

  if (auth.isLoggedIn) {

    await navigateTo('/dashboard')

  } else {

    await navigateTo('/login')

  }

})
</script>