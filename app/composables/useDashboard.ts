export const useDashboard = () => {
  const loading = ref(false)
  const stats = ref({
    totalPolicies: 0,
    pendingPolicies: 0,
    signedPolicies: 0,
    recentPolicies: [] as any[],
  })

  async function fetchStats() {
    loading.value = true
    try {
      const { getPolicies } = usePolicy()
      const polRes = await getPolicies(1, 100)
      const policies = polRes.policies || []

      const pending = policies.filter((p: any) => p.status === "pending")
      const signed = policies.filter((p: any) => p.status === "signed")

      stats.value = {
        totalPolicies: policies.length > 0 ? (polRes.pagination?.total || policies.length) : 0,
        pendingPolicies: pending.length,
        signedPolicies: signed.length,
        recentPolicies: policies.slice(0, 5),
      }
    } catch {
      // silent fail
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, fetchStats }
}
