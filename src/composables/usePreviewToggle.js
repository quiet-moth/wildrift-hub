import { ref, watch } from 'vue'

const STORAGE_KEY = 'preview_icons_enabled'
const stored = localStorage.getItem(STORAGE_KEY)
const previewEnabled = ref(stored === null ? true : stored === 'true')

watch(previewEnabled, (val) => {
  localStorage.setItem(STORAGE_KEY, String(val))
})

export function usePreviewToggle() {
  return { previewEnabled }
}