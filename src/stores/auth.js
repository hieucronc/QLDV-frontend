import { defineStore } from 'pinia'
import axios from 'axios'
import { API_BASE_URL } from '../config/api.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: (() => {
      const token = localStorage.getItem('token') || null;
      return token;
    })(),
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    memberInfo: (state) => state.user?.member_id
  },

  actions: {
    async login(student_id, password) {
      this.loading = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          student_id,
          password
        })

        const { user } = response.data
        
        // Get token from response
        const token = response.data.access_token || response.data.token

        this.user = user
        this.token = token
        this.isAuthenticated = true

        if (token) {
          localStorage.setItem('token', token)
        }

        return { success: true, user }
      } catch (error) {
        console.error('Login error:', error)
        // Handle specific error messages from the backend
        let errorMessage = 'Đăng nhập không thành công. Vui lòng thử lại.';
        if (error.response?.data?.error === 'invalid_credentials') {
          errorMessage = 'Tài khoản hoặc mật khẩu không đúng.';
        } else if (error.response?.data?.error === 'missing_credentials') {
          errorMessage = 'Vui lòng nhập đầy đủ tài khoản và mật khẩu.';
        } else if (error.response?.data?.error === 'user_not_found') {
          errorMessage = 'Không tìm thấy người dùng.';
        }
        return { 
          success: false, 
          error: errorMessage
        }
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await axios.post(`${API_BASE_URL}/auth/logout`)
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.user = null
        this.token = null
        this.isAuthenticated = false
        localStorage.removeItem('token')
        
        // Clear cookie
        document.cookie = 'access_token_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      }
    },

    async fetchCurrentUser() {
      this.loading = true;
      // Use token from store and send it in Authorization header
      if (!this.token) {
        this.loading = false;
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        })

        this.user = response.data.user
        this.isAuthenticated = true
        this.loading = false;
        return { success: true, user: response.data.user }
      } catch (error) {
        console.error('Fetch current user error:', error)
        this.clearAuth()
        this.loading = false;
        return { success: false, error: 'Failed to fetch user data' }
      }
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token')
      document.cookie = 'access_token_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    },

    async initializeAuth() {
      // Check for token in localStorage
      const token = localStorage.getItem('token')
      
      if (token) {
        this.token = token
        await this.fetchCurrentUser()
      }
    }
  }
})
