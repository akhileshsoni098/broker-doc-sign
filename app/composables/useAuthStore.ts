import { reactive, computed } from "vue"

interface AuthState {
  token: string
  brokerName: string
  brokerEmail: string
  brokerId: string
}

const state = reactive<AuthState>({
  token: "",
  brokerName: "",
  brokerEmail: "",
  brokerId: "",
})

function loadFromStorage() {
  if (import.meta.client) {
    state.token = localStorage.getItem("token") || ""
    state.brokerName = localStorage.getItem("brokerName") || ""
    state.brokerEmail = localStorage.getItem("brokerEmail") || ""
    state.brokerId = localStorage.getItem("brokerId") || ""
  }
}

function saveToStorage() {
  if (import.meta.client) {
    localStorage.setItem("token", state.token)
    localStorage.setItem("brokerName", state.brokerName)
    localStorage.setItem("brokerEmail", state.brokerEmail)
    localStorage.setItem("brokerId", state.brokerId)
  }
}

export function useAuthStore() {
  const isAuthenticated = computed(() => !!state.token)

  function initialize() {
    loadFromStorage()
  }

  function setAuth(token: string, broker: { id?: string; name?: string; email?: string }) {
    state.token = token || ""
    state.brokerName = broker?.name || ""
    state.brokerEmail = broker?.email || ""
    state.brokerId = broker?.id || ""
    saveToStorage()
  }

  function logout() {
    state.token = ""
    state.brokerName = ""
    state.brokerEmail = ""
    state.brokerId = ""
    if (import.meta.client) {
      localStorage.removeItem("token")
      localStorage.removeItem("brokerName")
      localStorage.removeItem("brokerEmail")
      localStorage.removeItem("brokerId")
    }
  }

  return { token: computed(() => state.token), brokerName: computed(() => state.brokerName), brokerEmail: computed(() => state.brokerEmail), brokerId: computed(() => state.brokerId), isAuthenticated, initialize, setAuth, logout }
}
