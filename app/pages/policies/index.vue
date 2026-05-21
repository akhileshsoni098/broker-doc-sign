<template>
  <div>
    <div class="page-header">
      <h1>Documents</h1>
      <NuxtLink to="/policies/create" class="btn btn-gold">+ New Document</NuxtLink>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="card">
      <div v-if="loading"><div class="spinner" /></div>
      <div v-else-if="!policies.length" class="empty-state">
        <div class="icon">◐</div>
        <p>No documents yet. Create your first document.</p>
      </div>
      <template v-else>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Status</th>
                <th>Signing Link</th>
                <th>Document</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in policies" :key="p.id">
                <td style="color:var(--text-muted)">{{ (page - 1) * limit + i + 1 }}</td>
                <td style="font-weight:500">{{ p.title }}</td>
                <td>
                  <span class="badge" :class="p.status === 'signed' ? 'badge-signed' : 'badge-pending'">{{ p.status }}</span>
                </td>
                <td>
                  <div v-if="p.signingToken" style="display:flex;gap:.35rem;align-items:center">
                    <code style="font-size:.72rem;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block">{{ p.signingToken }}</code>
                    <button class="btn btn-outline btn-xs" @click="copyLink(p.signingToken)">Copy</button>
                  </div>
                  <span v-else style="color:var(--text-muted);font-size:.82rem">—</span>
                </td>
                <td>
                  <a v-if="p.documentUrl" :href="p.documentUrl" target="_blank" class="btn btn-outline btn-sm">View PDF</a>
                  <span v-else style="color:var(--text-muted);font-size:.82rem">—</span>
                </td>
                <td style="font-size:.82rem;color:var(--text-muted)">{{ formatDate(p.createdAt) }}</td>
                <td>
                  <div style="display:flex;gap:.5rem">
                    <NuxtLink :to="`/policies/${p.id}`" class="btn btn-outline btn-sm">Edit</NuxtLink>
                    <button class="btn btn-danger btn-sm" @click="confirmDelete(p)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
        <div class="modal card">
          <h3>Delete Document</h3>
          <p style="margin-top:.5rem;color:var(--text-muted)">Delete <strong>{{ deleteTarget?.title }}</strong>? This cannot be undone.</p>
          <div style="display:flex;gap:.75rem;margin-top:1.25rem;justify-content:flex-end">
            <button class="btn btn-outline" @click="deleteTarget = null">Cancel</button>
            <button class="btn btn-danger" :disabled="deleting" @click="handleDelete">{{ deleting ? 'Deleting…' : 'Delete' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { getPolicies, deletePolicy, getSigningLink } = usePolicy()

const policies = ref<any[]>([])
const page = ref(1)
const limit = ref(10)
const loading = ref(true)
const error = ref('')
const deleteTarget = ref<any>(null)
const deleting = ref(false)

async function fetchPolicies() {
  loading.value = true
  error.value = ''
  try {
    const data = await getPolicies(page.value, limit.value)
    policies.value = data.policies || []
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function confirmDelete(p: any) { deleteTarget.value = p }

async function handleDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await deletePolicy(deleteTarget.value.id)
    deleteTarget.value = null
    await fetchPolicies()
  } catch (e: any) {
    error.value = e.message
  } finally {
    deleting.value = false
  }
}

async function copyLink(token: string) {
  const link = await getSigningLink(token)
  try { await navigator.clipboard.writeText(link) } catch {}
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(fetchPolicies)
</script>

<style scoped>
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:200;padding:1rem; }
.modal { max-width:420px;width:100%; }
.btn-xs { font-size:.72rem;padding:.2rem .5rem; }
.badge-signed { background: #d4edda; color: #155724; padding:.25rem .6rem; border-radius: 999px; font-size:.78rem; font-weight:600; text-transform:capitalize; }
.badge-pending { background: #fff3cd; color: #856404; padding:.25rem .6rem; border-radius: 999px; font-size:.78rem; font-weight:600; text-transform:capitalize; }
</style>
