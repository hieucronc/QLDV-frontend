import { API_BASE_URL } from '../config/api.js'

class MemberService {
  // Get all members
  async getMembers() {
    const response = await fetch(`${API_BASE_URL}/members`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch members')
  }

  // Get a specific member by ID
  async getMemberById(memberId) {
    const response = await fetch(`${API_BASE_URL}/members/${memberId}`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch member')
  }

  // Get attendances (events) for a member
  async getMemberAttendances(memberId) {
    const response = await fetch(`${API_BASE_URL}/members/${memberId}/attendances`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch member attendances')
  }
}

export default new MemberService()
