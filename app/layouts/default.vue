<template>
  <div class="app-shell">
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-logo">
        <span class="logo-icon">⚜</span>
        <span class="logo-text">BrokerDesk</span>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/dashboard" class="nav-item" @click="sidebarOpen = false">
          <span class="nav-icon">◇</span>
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/policies" class="nav-item" @click="sidebarOpen = false">
          <span class="nav-icon">◐</span>
          <span>Documents</span>
        </NuxtLink>

        <div class="nav-divider" />

        <NuxtLink to="/profile" class="nav-item" @click="sidebarOpen = false">
          <span class="nav-icon">◎</span>
          <span>Profile</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="broker-tag">
          <div class="broker-avatar">{{ initials }}</div>
          <div class="broker-info">
            <p class="broker-name">{{ auth.brokerName || 'Broker' }}</p>
            <p class="broker-role">Broker</p>
          </div>
        </div>
        <button class="btn btn-outline btn-sm logout-btn" @click="handleLogout">
          Sign out
        </button>
      </div>
    </aside>

    <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false" />

    <main class="main-content">
      <header class="topbar">
        <button class="hamburger" @click="sidebarOpen = !sidebarOpen">
          <span /><span /><span />
        </button>
        <div class="topbar-right">
          <span class="topbar-greeting">Welcome, {{ auth.brokerName || 'Broker' }}</span>
        </div>
      </header>

      <div class="page-area">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
auth.initialize()

const router = useRouter()
const sidebarOpen = ref(false)

const initials = computed(() => {
  const name = auth.brokerName || 'B'
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
})

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-shell { display: flex; min-height: 100vh; }
.sidebar { width: 240px; min-height: 100vh; background: var(--navy); display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 100; transition: transform .25s ease; }
.sidebar-logo { display: flex; align-items: center; gap: .75rem; padding: 1.5rem 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,.1); }
.logo-icon { font-size: 1.4rem; color: var(--gold); }
.logo-text { font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: #fff; letter-spacing: .02em; }
.sidebar-nav { flex: 1; padding: 1rem .75rem; display: flex; flex-direction: column; gap: .2rem; }
.nav-item { display: flex; align-items: center; gap: .75rem; padding: .65rem .9rem; border-radius: var(--radius); color: rgba(255,255,255,.6); text-decoration: none; font-size: .9rem; font-weight: 400; transition: all .15s; }
.nav-item:hover { background: rgba(255,255,255,.08); color: #fff; }
.nav-item.router-link-active { background: var(--gold); color: var(--navy); font-weight: 600; }
.nav-item.router-link-active .nav-icon { color: var(--navy); }
.nav-icon { font-size: 1rem; color: rgba(255,255,255,.4); }
.nav-divider { height: 1px; background: rgba(255,255,255,.1); margin: .75rem 0; }
.sidebar-footer { padding: 1rem 1.25rem 1.5rem; border-top: 1px solid rgba(255,255,255,.1); display: flex; flex-direction: column; gap: .75rem; }
.broker-tag { display: flex; align-items: center; gap: .75rem; }
.broker-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gold); color: var(--navy); font-weight: 700; font-size: .8rem; display: flex; align-items: center; justify-content: center; }
.broker-name { color: #fff; font-size: .88rem; font-weight: 500; }
.broker-role { color: rgba(255,255,255,.4); font-size: .75rem; }
.logout-btn { width: 100%; justify-content: center; color: rgba(255,255,255,.6); border-color: rgba(255,255,255,.2); }
.logout-btn:hover { color: #fff; border-color: rgba(255,255,255,.5); background: rgba(255,255,255,.05); }
.main-content { margin-left: 240px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
.topbar { height: 60px; background: var(--surface-2); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; position: sticky; top: 0; z-index: 50; }
.topbar-greeting { font-size: .9rem; color: var(--text-muted); }
.hamburger { display: none; flex-direction: column; gap: 4px; background: none; border: none; cursor: pointer; padding: .25rem; }
.hamburger span { display: block; width: 22px; height: 2px; background: var(--text-primary); border-radius: 2px; }
.page-area { flex: 1; padding: 2rem 1.5rem; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 99; }
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .main-content { margin-left: 0; }
  .hamburger { display: flex; }
  .topbar-greeting { display: none; }
}
</style>
