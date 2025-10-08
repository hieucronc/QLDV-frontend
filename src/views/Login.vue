<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header text-center mb-4">
        <div class="logo mb-3">
          <i class="bi bi-people-fill login-icon"></i>
        </div>
        <h2 class="login-title">Hệ thống Quản lý Đoàn Viên</h2>
        <p class="login-subtitle">Đăng nhập để tiếp tục</p>
      </div>
      
      <div v-if="authStore.loading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Đang đăng nhập...</p>
      </div>
      
      <form v-else @submit.prevent="handleLogin" class="login-form">
        <div class="mb-3">
          <label for="student_id" class="form-label">Tài khoản</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-person"></i>
            </span>
            <input 
              type="text" 
              class="form-control" 
              id="student_id" 
              v-model="formData.student_id"
              required
              :disabled="authStore.loading"
              placeholder="Nhập tài khoản"
            >
          </div>
        </div>
        
        <div class="mb-4">
          <label for="password" class="form-label">Mật khẩu</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-lock"></i>
            </span>
            <input 
              type="password" 
              class="form-control" 
              id="password" 
              v-model="formData.password"
              required
              :disabled="authStore.loading"
              placeholder="Nhập mật khẩu"
            >
          </div>
        </div>
        
        <div class="d-grid mb-4">
          <button 
            type="submit" 
            class="btn btn-primary btn-lg" 
            :disabled="authStore.loading || !formData.student_id || !formData.password"
          >
            <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i v-else class="bi bi-box-arrow-in-right me-2"></i>
            Đăng nhập
          </button>
        </div>
      </form>
      
      <div class="demo-section">
        <div class="text-center mb-3">
          <small class="text-muted">Tài khoản demo:</small>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-success flex-fill" @click="fillDemoAccount('admin')">
            <i class="bi bi-person-badge me-1"></i>
            Admin
          </button>
          <button class="btn btn-outline-info flex-fill" @click="fillDemoAccount('member')">
            <i class="bi bi-person-circle me-1"></i>
            Đoàn viên
          </button>
        </div>
      </div>
      
      <div class="text-center mt-4">
        <small class="text-muted">
          <i class="bi bi-info-circle me-1"></i>
          Chưa có tài khoản? Vui lòng liên hệ quản trị viên.
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'LoginPage', // Changed to multi-word name
  setup() {
    const authStore = useAuthStore()
    const toastStore = useToastStore()
    const router = useRouter()
    
    const formData = ref({
      student_id: '',
      password: ''
    })

    const handleLogin = async () => {
      const result = await authStore.login(formData.value.student_id, formData.value.password)
      
      if (result.success) {
        // Redirect to intended destination or events page
        const redirectPath = router.currentRoute.value.query.redirect || '/events'
        router.push(redirectPath)
      } else {
        toastStore.showError(result.error)
      }
    }

    const fillDemoAccount = (type) => {
      if (type === 'admin') {
        formData.value = {
          student_id: 'admin',
          password: 'admin123'
        }
      } else {
        formData.value = {
          student_id: 'dv001',
          password: '123456'
        }
      }
    }

    return {
      authStore,
      formData,
      handleLogin,
      fillDemoAccount
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-header {
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  justify-content: center;
}

.login-icon {
  font-size: 3.5rem;
  color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-title {
  color: #333;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.login-subtitle {
  color: #6c757d;
  margin-bottom: 0;
  font-size: 1.1rem;
}

.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

.input-group {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  transition: box-shadow 0.2s ease;
}

.input-group:focus-within {
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.2);
}

.input-group-text {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: #6c757d;
}

.form-control {
  border: 1px solid #e9ecef;
  border-left: none;
  border-radius: 0 8px 8px 0;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25);
  outline: 0;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 0.75rem;
  font-weight: 600;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  background: #adb5bd;
  transform: none;
  box-shadow: none;
}

.btn-outline-success, .btn-outline-info {
  border-radius: 8px;
  padding: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-outline-success:hover {
  background: #198754;
  border-color: #198754;
  color: white;
}

.btn-outline-info:hover {
  background: #0dcaf0;
  border-color: #0dcaf0;
  color: white;
}

.alert {
  border-radius: 8px;
  font-size: 0.9rem;
}

.alert-danger {
  background-color: #f8d7da;
  border-color: #f5c2c7;
  color: #842029;
}

.btn-close {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
}

.demo-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 1rem;
}

.text-muted {
  color: #6c757d !important;
}

@media (max-width: 576px) {
  .login-card {
    padding: 1.5rem;
    margin: 0.5rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
  
  .login-subtitle {
    font-size: 1rem;
  }
}
</style>
