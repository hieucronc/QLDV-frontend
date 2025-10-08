import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/events'
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('../views/Members.vue')
  },
      {
        path: '/events',
        name: 'Events',
        component: () => import('../views/Events.vue')
      },
      {
        path: '/events/:id',
        name: 'EventDetail',
        component: () => import('../views/EventDetail.vue')
      },
      {
        path: '/leaderboard',
        name: 'Leaderboard',
        component: () => import('../views/Leaderboard.vue')
      },
      {
        path: '/members/:id',
        name: 'MemberDetail',
        component: () => import('../views/MemberDetail.vue')
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        beforeEnter: (to, from, next) => {
          // Import the auth store
          const { useAuthStore } = require('../stores/auth')
          const authStore = useAuthStore()
          
          // Check if user is admin
          if (authStore.isAdmin) {
            // Redirect admin users to home page
            next('/')
          } else {
            // Allow non-admin users to access the profile page
            next()
          }
        }
      },
      {
        path: '/admin/events',
        name: 'AdminEventManagement',
        component: () => import('../views/AdminEventManagement.vue')
      },
      {
        path: '/admin/members',
        name: 'AdminMemberManagement',
        component: () => import('../views/AdminMemberManagement.vue')
      },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  // No authentication checks needed
  next()
})

export default router
