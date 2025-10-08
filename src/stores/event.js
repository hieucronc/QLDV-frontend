import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'
import { API_BASE_URL } from '../config/api.js'

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [],
    currentEvent: null,
    skills: [],
    loading: false,
    error: null
  }),

  getters: {
    getEventById: (state) => (id) => {
      return state.events.find(event => event.id === id)
    },
    
    upcomingEvents: (state) => {
      return state.events.filter(event => event.status === 'upcoming')
    },
    
    ongoingEvents: (state) => {
      return state.events.filter(event => event.status === 'ongoing')
    },
    
    closedEvents: (state) => {
      return state.events.filter(event => event.status === 'closed')
    }
  },

  actions: {
    async fetchEvents() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/events`)
        
        this.events = response.data
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch events'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchEvent(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/events/${id}`)
        
        this.currentEvent = response.data
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async createEvent(eventData) {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const token = authStore.token
        
        const response = await axios.post(`${API_BASE_URL}/events`, eventData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to create event'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchSkills() {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/skills`)
        
        this.skills = response.data
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch skills'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async scanAttendance(memberCode, eventId, method = 'admin_scan') {
      this.loading = true
      this.error = null
      
      try {
        const authStore = useAuthStore()
        const token = authStore.token
        
        const response = await axios.post(`${API_BASE_URL}/attendance/scan`, {
          member_code: memberCode,
          event_id: eventId,
          method
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to scan attendance'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    clearCurrentEvent() {
      this.currentEvent = null
    },

    clearError() {
      this.error = null
    }
  }
})
