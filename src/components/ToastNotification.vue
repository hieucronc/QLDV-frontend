<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1050;">
    <div 
      v-for="toast in toasts" 
      :key="toast.id"
      class="toast show"
      :class="`bg-${toast.type} text-white`"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      :data-toast-id="toast.id"
    >
      <div class="toast-header">
        <strong class="me-auto">
          <i :class="getIconClass(toast.type)"></i>
          {{ getTitle(toast.type) }}
        </strong>
        <small class="text-white">{{ toast.time }}</small>
        <button type="button" class="btn-close btn-close-white" @click="removeToast(toast.id)"></button>
      </div>
      <div class="toast-body">
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia'
import { onMounted, watch } from 'vue'

export default {
  name: 'ToastNotification',
  setup() {
    const toastStore = useToastStore()
    const { toasts } = storeToRefs(toastStore)
    
    // Handle automatic hiding of toasts
    onMounted(() => {
      watch(toasts, (newToasts) => {
        newToasts.forEach((toast) => {
          // Set a timeout to automatically hide the toast after 5 seconds
          setTimeout(() => {
            const toastElement = document.querySelector(`[data-toast-id="${toast.id}"]`)
            if (toastElement) {
              // Add the hiding class to trigger the fade-out animation
              toastElement.classList.add('hiding')
              
              // Remove the toast from the store after the animation completes
              setTimeout(() => {
                toastStore.removeToast(toast.id)
              }, 300) // Match the CSS transition duration
            }
          }, 5000) // Show for 5 seconds
        })
      }, { deep: true, immediate: true })
    })
    
    const removeToast = (id) => {
      // Add the hiding class to trigger the fade-out animation
      const toastElement = document.querySelector(`[data-toast-id="${id}"]`)
      if (toastElement) {
        toastElement.classList.add('hiding')
        
        // Remove the toast from the store after the animation completes
        setTimeout(() => {
          toastStore.removeToast(id)
        }, 300) // Match the CSS transition duration
      } else {
        // If we can't find the element, remove it directly
        toastStore.removeToast(id)
      }
    }
    
    const getIconClass = (type) => {
      switch (type) {
        case 'success':
          return 'bi bi-check-circle-fill'
        case 'error':
          return 'bi bi-exclamation-triangle-fill'
        case 'warning':
          return 'bi bi-exclamation-circle-fill'
        case 'info':
          return 'bi bi-info-circle-fill'
        default:
          return 'bi bi-bell-fill'
      }
    }
    
    const getTitle = (type) => {
      switch (type) {
        case 'success':
          return 'Thành công'
        case 'error':
          return 'Lỗi'
        case 'warning':
          return 'Cảnh báo'
        case 'info':
          return 'Thông tin'
        default:
          return 'Thông báo'
      }
    }
    
    return {
      toasts,
      removeToast,
      getIconClass,
      getTitle
    }
  }
}
</script>

<style scoped>
.toast-container {
  z-index: 1050;
}

.toast {
  border: none;
  border-radius: 8px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  margin-bottom: 0.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-header {
  border-radius: 8px 8px 0 0;
  border: none;
  align-items: center;
}

.toast-body {
  border-radius: 0 0 8px 8px;
}

.bg-success {
  background-color: #198754 !important;
}

.bg-error {
  background-color: #dc3545 !important;
}

.bg-warning {
  background-color: #ffc107 !important;
}

.bg-info {
  background-color: #0dcaf0 !important;
}

/* Animation for hiding toasts */
.toast.hiding {
  opacity: 0;
  transform: translateY(20px);
}
</style>
