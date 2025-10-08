import { defineStore } from 'pinia'
import axios from 'axios'
import { API_BASE_URL } from '../config/api.js'

export const useMemberStore = defineStore('member', {
  state: () => ({
    members: [],
    currentMember: null,
    leaderboard: [],
    loading: false,
    error: null
  }),

  getters: {
    getMemberById: (state) => (id) => {
      return state.members.find(member => member.id === id)
    },
    
    getMemberByCode: (state) => (code) => {
      return state.members.find(member => member.code === code)
    }
  },

  actions: {
    async fetchMembers(search = '') {
      this.loading = true
      this.error = null
      
      try {
        const params = search ? { search } : {}
        const response = await axios.get(`${API_BASE_URL}/members`, { params })
        
        this.members = response.data
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch members'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchMember(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/members/${id}`)
        
        this.currentMember = response.data
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch member'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async fetchLeaderboard(limit = 50) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/leaderboard`, { 
          params: { limit } 
        })
        
        this.leaderboard = response.data
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to fetch leaderboard'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    async searchMembers(query) {
      this.loading = true
      this.error = null
      
      try {
        const response = await axios.get(`${API_BASE_URL}/members`, { 
          params: { search: query } 
        })
        
        return { success: true, data: response.data }
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to search members'
        return { success: false, error: this.error }
      } finally {
        this.loading = false
      }
    },

    clearCurrentMember() {
      this.currentMember = null
    },

    clearError() {
      this.error = null
    }
  }
})
