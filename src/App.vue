<template>
  <div id="app">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <img src="https://upload.wikimedia.org/wikipedia/vi/0/09/Huy_Hi%E1%BB%87u_%C4%90o%C3%A0n.png" alt="Đoàn徽" class="doan-huy-hieu">
        </router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/members">Đoàn viên</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/events">Sự kiện</router-link>
            </li>
            <li v-if="authStore.isAdmin" class="nav-item">
              <router-link class="nav-link" to="/admin/events">Quản lý Sự kiện</router-link>
            </li>
            <li v-if="authStore.isAdmin" class="nav-item">
              <router-link class="nav-link" to="/admin/members">Quản lý Đoàn viên</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/leaderboard">Xếp hạng</router-link>
            </li>
          </ul>
          
          <ul class="navbar-nav">
            <template v-if="authStore.isAuthenticated">
              <!-- User Avatar Dropdown for larger screens -->
              <li class="nav-item dropdown d-none d-lg-flex">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                  <img 
                    :src="getUserAvatar()" 
                    class="user-avatar me-2" 
                    :alt="authStore.currentUser?.username"
                  >
                  <span>{{ authStore.currentUser?.username }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li v-if="!authStore.isAdmin">
                    <router-link class="dropdown-item" to="/profile">
                      <i class="bi bi-person me-2"></i>
                      Thông tin của tôi
                    </router-link>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#" @click="handleLogout">
                      <i class="bi bi-box-arrow-right me-2"></i>
                      Đăng xuất
                    </a>
                  </li>
                </ul>
              </li>
              
              <!-- Direct links in navbar for small screens -->
              <template v-if="authStore.isAuthenticated">
                <li v-if="!authStore.isAdmin" class="nav-item d-lg-none">
                  <router-link class="nav-link" to="/profile">
                    <i class="bi bi-person me-2"></i>
                    Thông tin của tôi
                  </router-link>
                </li>
                <li class="nav-item d-lg-none">
                  <a class="nav-link" href="#" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                  </a>
                </li>
              </template>
            </template>
            <template v-else>
              <li class="nav-item">
                <router-link class="nav-link" to="/login">
                  <i class="bi bi-box-arrow-in-right me-1"></i>
                  Đăng nhập
                </router-link>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mt-4">
      <router-view />
    </main>

    <!-- Toast Notifications -->
    <ToastNotification />

    <!-- Footer -->
    <footer class="bg-dark text-white text-center py-3 mt-5">
      <div class="container">
        <p>Hệ thống Quản lý Đoàn Viên</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useMemberStore } from '@/stores/member'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import ToastNotification from '@/components/ToastNotification.vue'
import { API_BASE_URL } from '@/config/api.js'

export default {
  name: 'App',
  components: {
    ToastNotification
  },
  setup() {
    const authStore = useAuthStore()
    const memberStore = useMemberStore()
    const router = useRouter()

    const handleLogout = async () => {
      await authStore.logout()
      // Redirect to home page after logout
      router.push('/')
    }

    // Cache for avatar URLs to prevent repeated calculations
    const avatarCache = new Map()
    
    const getUserAvatar = () => {
      // Use cache if available
      const cacheKey = `${authStore.currentUser?.username}-${memberStore.currentMember?.member?.avatar_url}`
      if (avatarCache.has(cacheKey)) {
        return avatarCache.get(cacheKey)
      }
      
      // If we have the member's avatar, use it
      if (memberStore.currentMember?.member?.avatar_url) {
        const avatarUrl = memberStore.currentMember.member.avatar_url
        // Check if it's a filename (not a full URL)
        if (!avatarUrl.startsWith('http')) {
          // Construct full URL using API base URL
          const fullUrl = `${API_BASE_URL.replace('/api', '')}/avatars/${avatarUrl}`
          avatarCache.set(cacheKey, fullUrl)
          return fullUrl
        }
        // If it's already a full URL, use it as is (backward compatibility)
        avatarCache.set(cacheKey, avatarUrl)
        return avatarUrl
      }
      
      // If we don't have the member's avatar, generate one based on the username
      if (!authStore.currentUser) {
        const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=007bff&color=fff&size=32'
        avatarCache.set(cacheKey, defaultAvatar)
        return defaultAvatar
      }
      
      const generatedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.currentUser.username)}&background=007bff&color=fff&size=32`
      avatarCache.set(cacheKey, generatedAvatar)
      return generatedAvatar
    }

    // Handle clicks outside navbar to close it on mobile
    const handleOutsideClick = (event) => {
      const navbar = document.getElementById('navbarNav')
      const toggler = document.querySelector('.navbar-toggler')
      
      if (navbar && toggler && navbar.classList.contains('show')) {
        // Check if click is outside navbar and toggler
        if (!navbar.contains(event.target) && !toggler.contains(event.target)) {
          // Close the navbar by removing the 'show' class
          navbar.classList.remove('show')
        }
      }
    }

    // Fetch member information when the user is authenticated
    onMounted(async () => {
      await authStore.initializeAuth()
      
      // Add event listener for clicks outside navbar
      document.addEventListener('click', handleOutsideClick)
      
      // Watch for changes in the auth store to fetch member information
      watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
        if (isAuthenticated && authStore.currentUser?.member_id) {
          // Fetch member information
          await memberStore.fetchMember(authStore.currentUser.member_id)
        } else {
          // Clear member information if not authenticated or not a member
          memberStore.clearCurrentMember()
        }
      }, { immediate: true })
    })

    // Clean up event listener
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleOutsideClick)
    })

    return {
      authStore,
      memberStore,
      handleLogout,
      getUserAvatar
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.navbar-brand {
  font-weight: bold;
}

.router-link-active {
  font-weight: 600;
}

.router-link-exact-active {
  color: #fff !important;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #007bff;
}

.dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin: 0.125rem 0.5rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item i {
  width: 20px;
  text-align: center;
}

.navbar-nav .dropdown-menu {
  position: absolute;
}

@media (max-width: 992px) {
  .user-avatar {
    width: 24px;
    height: 24px;
  }
}

.doan-huy-hieu {
  height: 30px;
  width: auto;
  object-fit: contain;
}
</style>
