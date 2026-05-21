<template>
  <div class="app-shell">

    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{ open: sidebarOpen }"
    >

      <div class="sidebar-logo">
        <span class="logo-icon">
          ⚜
        </span>

        <span class="logo-text">
          BrokerDesk
        </span>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">

        <NuxtLink
          to="/dashboard"
          class="nav-item"
          @click="sidebarOpen = false"
        >
          <span class="nav-icon">
            ◇
          </span>

          <span>
            Dashboard
          </span>
        </NuxtLink>

        <NuxtLink
          to="/policies"
          class="nav-item"
          @click="sidebarOpen = false"
        >
          <span class="nav-icon">
            ◐
          </span>

          <span>
            Documents
          </span>
        </NuxtLink>

        <NuxtLink
          to="/customers"
          class="nav-item"
          @click="sidebarOpen = false"
        >
          <span class="nav-icon">
            ◎
          </span>

          <span>
            Customers
          </span>
        </NuxtLink>

        <div class="nav-divider" />

        <NuxtLink
          to="/profile"
          class="nav-item"
          @click="sidebarOpen = false"
        >
          <span class="nav-icon">
            ◈
          </span>

          <span>
            Profile
          </span>
        </NuxtLink>

      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">

        <div class="broker-tag">

          <div class="broker-avatar">
            {{ initials }}
          </div>

          <div class="broker-info">

            <p class="broker-name">
              {{ mounted ? brokerName : 'Broker' }}
            </p>

            <p class="broker-role">
              Broker
            </p>

          </div>

        </div>

        <button
          class="btn btn-outline btn-sm logout-btn"
          @click="handleLogout"
        >
          Sign out
        </button>

      </div>

    </aside>

    <!-- Overlay -->
    <div
      v-if="sidebarOpen"
      class="overlay"
      @click="sidebarOpen = false"
    />

    <!-- Main -->
    <main class="main-content">

      <!-- Topbar -->
      <header class="topbar">

        <button
          class="hamburger"
          @click="sidebarOpen = !sidebarOpen"
        >
          <span />
          <span />
          <span />
        </button>

        <div class="topbar-right">

          <span class="topbar-greeting">
            Welcome,
            {{ mounted ? brokerName : 'Broker' }}
          </span>

        </div>

      </header>

      <!-- Page -->
      <div class="page-area">
        <slot />
      </div>

    </main>

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth"

/*
|------------------------------------------------------------
| Store
|------------------------------------------------------------
*/

const auth =
  useAuthStore()

/*
|------------------------------------------------------------
| Router
|------------------------------------------------------------
*/

const router =
  useRouter()

/*
|------------------------------------------------------------
| Sidebar
|------------------------------------------------------------
*/

const sidebarOpen =
  ref(false)

/*
|------------------------------------------------------------
| Mounted
|------------------------------------------------------------
*/

const mounted =
  ref(false)

/*
|------------------------------------------------------------
| Initialize Auth
|------------------------------------------------------------
*/

onMounted(() => {

  auth.init()

  mounted.value = true

})

/*
|------------------------------------------------------------
| Broker Name
|------------------------------------------------------------
*/

const brokerName =
  computed(() => {

    return String(

      auth.broker?.name ||

      "Broker"

    )

  })

/*
|------------------------------------------------------------
| Initials
|------------------------------------------------------------
*/

const initials =
  computed(() => {

    return brokerName.value

      .split(" ")

      .map(
        (n: string) =>
          n[0] || ""
      )

      .join("")

      .slice(0, 2)

      .toUpperCase()

  })

/*
|------------------------------------------------------------
| Logout
|------------------------------------------------------------
*/

async function handleLogout() {

  auth.logout()

  await navigateTo(
    "/login"
  )

}
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  min-height: 100vh;
  background: var(--navy);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  transition: transform .25s ease;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: 1.5rem 1.25rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,.1);
}

.logo-icon {
  font-size: 1.4rem;
  color: var(--gold);
}

.logo-text {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem .75rem;
  display: flex;
  flex-direction: column;
  gap: .2rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .65rem .9rem;
  border-radius: var(--radius);
  color: rgba(255,255,255,.6);
  text-decoration: none;
}

.nav-item:hover {
  background: rgba(255,255,255,.08);
  color: #fff;
}

.nav-item.router-link-active {
  background: var(--gold);
  color: var(--navy);
  font-weight: 600;
}

.nav-divider {
  height: 1px;
  background: rgba(255,255,255,.1);
  margin: .75rem 0;
}

.sidebar-footer {
  padding: 1rem 1.25rem 1.5rem;
  border-top: 1px solid rgba(255,255,255,.1);
}

.broker-tag {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin-bottom: 1rem;
}

.broker-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gold);
  color: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.broker-name {
  color: #fff;
  font-size: .88rem;
}

.broker-role {
  color: rgba(255,255,255,.4);
  font-size: .75rem;
}

.logout-btn {
  width: 100%;
}

.main-content {
  margin-left: 240px;
  flex: 1;
  min-height: 100vh;
}

.topbar {
  height: 60px;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
}

.page-area {
  padding: 2rem 1.5rem;
}

.hamburger {
  display: none;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 99;
}

@media (max-width: 768px) {

  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: none;
    border: none;
  }

}
</style>