export const usePolicy = () => {
  const { apiFetch } = useApiFetch()

  function buildBody(payload: Record<string, any>, file?: File | null) {
    if (file) {
      const fd = new FormData()
      Object.entries(payload).forEach(([k, v]) => fd.append(k, String(v)))
      fd.append("document", file)
      return fd
    }
    return JSON.stringify(payload)
  }

  async function createPolicy(payload: { title: string; description?: string }, file?: File | null) {
    return apiFetch("/api/broker/policy/create", {
      method: "POST",
      body: buildBody(payload, file),
    })
  }

  async function getPolicies(page = 1, limit = 10) {
    return apiFetch(`/api/broker/policy?page=${page}&limit=${limit}`)
  }

  async function getPolicy(id: string) {
    return apiFetch(`/api/broker/policy/${id}`)
  }

  async function updatePolicy(id: string, payload: { title?: string; description?: string }, file?: File | null) {
    return apiFetch(`/api/broker/policy/${id}`, {
      method: "PUT",
      body: buildBody(payload, file),
    })
  }

  async function deletePolicy(id: string) {
    return apiFetch(`/api/broker/policy/${id}`, { method: "DELETE" })
  }

  async function getSigningLink(token: string) {
    const config = useRuntimeConfig()
    return `${config.public.appUrl}/sign/${token}`
  }

  return { createPolicy, getPolicies, getPolicy, updatePolicy, deletePolicy, getSigningLink }
}
