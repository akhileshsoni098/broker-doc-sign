export const useApiFetch = () => {
  const auth = useAuthStore()

  async function apiFetch(url: string, opts: RequestInit = {}) {
    const headers: Record<string, string> = {
      ...(opts.headers as Record<string, string> || {}),
    }

    if (!(opts.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    if (auth.token) {
      headers["Authorization"] = `Bearer ${auth.token}`
    }

    const res = await fetch(url, { ...opts, headers })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || "Request failed")
    }

    return data
  }

  return { apiFetch }
}
