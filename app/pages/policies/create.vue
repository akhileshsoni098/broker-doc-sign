<template>
  <div>
    <div class="page-header">
      <h1>New Document</h1>
      <NuxtLink to="/policies" class="btn btn-outline">← Back</NuxtLink>
    </div>

    <div class="card form-wrap">
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>

      <form @submit.prevent="handleCreate">
        <div class="form-group">
          <label for="title">Document Title *</label>
          <input id="title" v-model="form.title" type="text" placeholder="e.g. Health Insurance Policy" required />
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" v-model="form.description" rows="3" placeholder="Brief description of the document..." />
        </div>

        <div class="form-group">
          <label>Document File (PDF)</label>
          <div class="file-drop" :class="{ dragover: isDragging }" @click="fileInput?.click()" @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="onDrop">
            <input ref="fileInput" type="file" accept=".pdf,.doc,.docx" @change="onFileChange" />
            <div class="file-icon">📄</div>
            <p v-if="!selectedFile">Click to upload or drag & drop (PDF, DOC)</p>
            <p v-else class="file-name">{{ selectedFile.name }}</p>
          </div>
        </div>

        <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:.5rem">
          <NuxtLink to="/policies" class="btn btn-outline">Cancel</NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'Creating…' : 'Create Document' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { createPolicy } = usePolicy()
const router = useRouter()

const form = reactive({ title: '', description: '' })
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const error = ref('')
const success = ref('')
const loading = ref(false)

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) selectedFile.value = f
}
function onDrop(e: DragEvent) {
  isDragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) selectedFile.value = f
}

async function handleCreate() {
  error.value = ''
  loading.value = true
  try {
    await createPolicy(form, selectedFile.value)
    success.value = 'Document created successfully!'
    setTimeout(() => router.push('/policies'), 1200)
  } catch (e: any) {
    error.value = e.message || 'Failed to create document.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-wrap { max-width: 640px; }
</style>
