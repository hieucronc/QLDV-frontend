import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  let nextId = 1

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = nextId++
    const time = new Date().toLocaleTimeString()
    
    toasts.value.push({
      id,
      message,
      type,
      time
    })

    // Auto remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const showSuccess = (message, duration = 5000) => {
    addToast(message, 'success', duration)
  }

  const showError = (message, duration = 5000) => {
    addToast(message, 'error', duration)
  }

  const showWarning = (message, duration = 5000) => {
    addToast(message, 'warning', duration)
  }

  const showInfo = (message, duration = 5000) => {
    addToast(message, 'info', duration)
  }

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})
