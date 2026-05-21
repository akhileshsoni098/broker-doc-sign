<template>
  <div>
    <div class="page-header">
      <h1>Document Details</h1>
      <NuxtLink to="/policies" class="btn btn-outline">← Back</NuxtLink>
    </div>

    <div v-if="fetchLoading"><div class="spinner" /></div>
    <div v-else>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <div class="card" style="margin-bottom:1.25rem">
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Status</span>
            <span class="badge" :class="policy.status === 'signed' ? 'badge-signed' : 'badge-pending'">{{ policy.status }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Signing Link</span>
            <div v-if="policy.signingToken" style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
              <code class="link-token">{{ signingLink }}</code>
              <button class="btn btn-outline btn-sm" @click="copyLink">Copy Link</button>
              <a :href="signingLink" target="_blank" class="btn btn-primary btn-sm">Open ↗</a>
            </div>
            <span v-else style="color:var(--text-muted);font-size:.85rem">Generating on save…</span>
          </div>
          <div v-if="policy.status === 'signed'" class="meta-item">
            <span class="meta-label">Signed PDF</span>
            <a v-if="policy.signedPdfUrl" :href="policy.signedPdfUrl" target="_blank" class="btn btn-outline btn-sm">View Signed PDF ↗</a>
            <span v-else style="color:var(--text-muted);font-size:.85rem">—</span>
          </div>
          <div v-if="policy.status === 'signed'" class="meta-item">
            <span class="meta-label">Signed At</span>
            <span style="font-size:.88rem">{{ formatDate(policy.signedAt) }}</span>
          </div>
        </div>
      </div>

      <div class="card form-wrap">
        <form @submit.prevent="handleUpdate">
          <div class="form-group">
            <label for="title">Document Title *</label>
            <input id="title" v-model="form.title" type="text" required />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" v-model="form.description" rows="3" />
          </div>
          <div class="form-group">
            <label>Current Document</label>
            <a v-if="policy.documentUrl" :href="policy.documentUrl" target="_blank" class="btn btn-outline btn-sm">View Current PDF ↗</a>
            <span v-else style="color:var(--text-muted);font-size:.85rem">No document uploaded</span>
          </div>
          <div class="form-group">
            <label>Replace Document (optional)</label>
            <div class="file-drop" :class="{ dragover: isDragging }" @click="fileInput?.click()" @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="onDrop">
              <input ref="fileInput" type="file" accept=".pdf" @change="onFileChange" />
              <div class="file-icon">📄</div>
              <p v-if="!selectedFile">Click to upload a new PDF</p>
              <p v-else class="file-name">{{ selectedFile.name }}</p>
            </div>
          </div>
          <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:.5rem">
            <NuxtLink to="/policies" class="btn btn-outline">Cancel</NuxtLink>
            <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving…' : 'Save Changes' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const id = route.params.id as string

const { getPolicy, updatePolicy, getSigningLink } = usePolicy()

const policy = ref<any>({})
const form = reactive({ title: '', description: '' })
const signingLink = ref('')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const fetchLoading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

onMounted(async () => {
  try {
    const data = await getPolicy(id)
    const p = data.policy || data
    policy.value = p
    form.title = p.title || ''
    form.description = p.description || ''
    if (p.signingToken) {
      signingLink.value = await getSigningLink(p.signingToken)
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    fetchLoading.value = false
  }
})

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) selectedFile.value = f
}
function onDrop(e: DragEvent) {
  isDragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) selectedFile.value = f
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(signingLink.value)
    success.value = 'Link copied!'
    setTimeout(() => success.value = '', 2000)
  } catch {}
}

async function handleUpdate() {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    await updatePolicy(id, form, selectedFile.value)
    success.value = 'Document updated successfully!'
  } catch (e: any) {
    error.value = e.message || 'Failed to update document.'
  } finally {
    saving.value = false
  }
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.form-wrap { max-width: 640px; }
.meta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.meta-item { display: flex; flex-direction: column; gap: .25rem; }
.meta-label { font-size: .78rem; text-transform: uppercase; letter-spacing: .04em; color: var(--text-muted); }
.link-token { font-size: .78rem; word-break: break-all; }
.badge-signed { background: #d4edda; color: #155724; padding:.25rem .6rem; border-radius: 999px; font-size:.78rem; font-weight:600; text-transform:capitalize; display:inline-block; }
.badge-pending { background: #fff3cd; color: #856404; padding:.25rem .6rem; border-radius: 999px; font-size:.78rem; font-weight:600; text-transform:capitalize; display:inline-block; }
</style>
