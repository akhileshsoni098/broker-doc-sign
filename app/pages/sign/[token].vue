<template>
  <div class="sign-shell">
    <header class="sign-header">
      <span class="brand-icon">⚜</span>
      <span class="brand-name">BrokerDesk</span>
    </header>

    <main class="sign-main">
      <div v-if="loading" class="sign-card card">
        <div class="spinner" />
        <p style="text-align:center;color:var(--text-muted)">Loading document details…</p>
      </div>

      <div v-else-if="fetchError" class="sign-card card">
        <div class="error-icon">⚠</div>
        <h2>Invalid Link</h2>
        <p>{{ fetchError }}</p>
      </div>

      <div v-else-if="signedFromRedirect" class="sign-card card success-state">
        <div class="success-icon">✓</div>
        <h2>Document Signed Successfully!</h2>
        <p>Your document has been signed and verified.</p>
        <a v-if="signedPdfUrl" :href="signedPdfUrl" target="_blank" class="btn btn-outline" style="margin-top:1rem">Download Signed Copy ↗</a>
        <div style="margin-top:1rem;display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
          <NuxtLink to="/dashboard" class="btn btn-gold">Go to Dashboard →</NuxtLink>
        </div>
      </div>

      <div v-else-if="policy.status === 'signed'" class="sign-card card success-state">
        <div class="success-icon">✓</div>
        <h2>Document Signed</h2>
        <p>This document was signed on <strong>{{ formatDate(policy.signedAt) }}</strong>.</p>
        <a v-if="policy.signedPdfUrl" :href="policy.signedPdfUrl" target="_blank" class="btn btn-outline" style="margin-top:1rem">Download Signed Copy ↗</a>
        <div style="margin-top:1rem;display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
          <NuxtLink to="/dashboard" class="btn btn-gold">Go to Dashboard →</NuxtLink>
        </div>
      </div>

      <div v-else class="sign-card card">
        <div class="sign-intro">
          <h2>Sign Document</h2>
          <p class="sign-sub">Please review the document details and upload your signed copy.</p>
        </div>

        <div class="policy-details">
          <h3 style="margin-bottom:.75rem">Document Details</h3>
          <div class="detail-row">
            <span class="detail-label">Title</span>
            <span>{{ policy.title || '—' }}</span>
          </div>
          <div v-if="policy.description" class="detail-row">
            <span class="detail-label">Description</span>
            <span>{{ policy.description }}</span>
          </div>
        </div>

        <div v-if="policy.documentUrl" style="margin-top:1rem">
          <a :href="policy.documentUrl" target="_blank" class="btn btn-outline">📄 View Document</a>
          <p style="font-size:.8rem;color:var(--text-muted);margin-top:.4rem">Download, sign it, and upload below.</p>
        </div>

        <div class="divider" />

        <div v-if="!submitSuccess">
          <div v-if="submitError" class="alert alert-error">{{ submitError }}</div>
          <h3 style="margin-bottom:.75rem">Upload Signed Document</h3>
          <div class="file-drop" :class="{ dragover: isDragging }" @click="fileInput?.click()" @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="onDrop">
            <input ref="fileInput" type="file" accept=".pdf,.doc,.docx,.jpg,.png" @change="onFileChange" />
            <div class="file-icon">📤</div>
            <p v-if="!signedFile">Click to upload your signed document</p>
            <p v-else class="file-name">{{ signedFile.name }}</p>
          </div>
          <div style="margin-top:1.25rem;display:flex;justify-content:center">
            <button class="btn btn-gold btn-lg" :disabled="!signedFile || submitting" @click="handleSubmit">
              {{ submitting ? 'Submitting…' : '✓ Submit Signed Document' }}
            </button>
          </div>
          <p style="text-align:center;font-size:.8rem;color:var(--text-muted);margin-top:.75rem">By submitting, you confirm your acceptance of this document.</p>
        </div>

        <div v-else class="success-state" style="text-align:center;padding:1.5rem 0">
          <div class="success-icon">✓</div>
          <h3 style="margin-top:.75rem">Document Submitted!</h3>
          <p style="color:var(--text-muted);margin-top:.5rem">Your signed document has been received. The broker will verify and confirm.</p>
          <NuxtLink to="/dashboard" class="btn btn-gold" style="margin-top:1.25rem">Go to Dashboard →</NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const token = route.params.token as string

const { getPolicyByToken, submitSignedFile } = useSign()

const policy = ref<any>({})
const loading = ref(true)
const fetchError = ref('')
const submitError = ref('')
const submitting = ref(false)
const submitSuccess = ref(false)
const signedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const signedFromRedirect = computed(() => route.query.status === 'completed')
const signedPdfUrl = computed(() => route.query.url as string || '')

onMounted(async () => {
  try {
    const data = await getPolicyByToken(token)
    policy.value = data.policy || data
  } catch (e: any) {
    fetchError.value = e.message
  } finally {
    loading.value = false
  }
})

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) signedFile.value = f
}
function onDrop(e: DragEvent) {
  isDragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) signedFile.value = f
}

async function handleSubmit() {
  if (!signedFile.value) return
  submitError.value = ''
  submitting.value = true
  try {
    await submitSignedFile(token, signedFile.value)
    submitSuccess.value = true
    policy.value.status = 'signed'
  } catch (e: any) {
    submitError.value = e.message || 'Failed to submit. Please try again.'
  } finally {
    submitting.value = false
  }
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.sign-shell { min-height: 100vh; background: linear-gradient(160deg, var(--navy) 0%, var(--navy-light) 100%); display: flex; flex-direction: column; align-items: center; padding-bottom: 3rem; }
.sign-header { width: 100%; display: flex; align-items: center; justify-content: center; gap: .75rem; padding: 1.5rem 1rem; border-bottom: 1px solid rgba(255,255,255,.1); }
.brand-icon { font-size: 1.5rem; color: var(--gold); }
.brand-name { font-family: var(--font-display); font-size: 1.3rem; color: #fff; font-weight: 700; }
.sign-main { width: 100%; max-width: 600px; padding: 2rem 1rem; }
.sign-card { box-shadow: var(--shadow-lg); border: none; }
.sign-intro { margin-bottom: 1.5rem; }
.sign-intro h2 { font-size: 1.5rem; }
.sign-sub { color: var(--text-muted); margin-top: .25rem; font-size: .92rem; }
.policy-details { background: var(--surface); border-radius: var(--radius); padding: 1rem; }
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: .55rem 0; border-bottom: 1px solid var(--border); font-size: .9rem; }
.detail-row:last-child { border-bottom: none; }
.detail-label { color: var(--text-muted); font-size: .78rem; text-transform: uppercase; letter-spacing: .04em; }
.error-icon { font-size: 3rem; text-align: center; color: var(--danger); margin-bottom: 1rem; }
.error-icon + h2 { text-align: center; }
.error-icon + h2 + p { text-align: center; color: var(--text-muted); margin-top: .5rem; }
.success-state { text-align: center; }
.success-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--success); color: #fff; font-size: 1.8rem; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
</style>
