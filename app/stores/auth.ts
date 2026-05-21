export const useAuthStore = defineStore('auth', () => {

  const token = ref('')

  const broker = ref<any>(null)

  /*
  |------------------------------------------------------------------
  | Logged In
  |------------------------------------------------------------------
  */

  const isLoggedIn = computed(() => {

    return !!token.value

  })

  /*
  |------------------------------------------------------------------
  | Initialize From LocalStorage
  |------------------------------------------------------------------
  */

  function init() {

    if (process.client) {

      token.value =
        localStorage.getItem('token') || ''

      const savedBroker =
        localStorage.getItem('broker')

      if (savedBroker) {

        broker.value =
          JSON.parse(savedBroker)

      }
    }
  }

  /*
  |------------------------------------------------------------------
  | Set Auth
  |------------------------------------------------------------------
  */

  function setAuth(
    newToken: string,
    user: any
  ) {

    token.value =
      newToken

    broker.value =
      user

    if (process.client) {

      localStorage.setItem(
        'token',
        newToken
      )

      localStorage.setItem(
        'broker',
        JSON.stringify(user)
      )
    }
  }

  /*
  |------------------------------------------------------------------
  | Logout
  |------------------------------------------------------------------
  */

  function logout() {

    token.value = ''

    broker.value = null

    if (process.client) {

      localStorage.removeItem(
        'token'
      )

      localStorage.removeItem(
        'broker'
      )
    }
  }

  return {

    token,

    broker,

    isLoggedIn,

    init,

    setAuth,

    logout,

  }

})