import { API_BASE_URL } from '../config/api.js'

class MemberManagementService {
  // Get all members
  async getMembers() {
    const response = await fetch(`${API_BASE_URL}/members`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch members')
  }

  // Get all skills
  async getSkills() {
    const response = await fetch(`${API_BASE_URL}/skills`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch skills')
  }

  // Create a new member
  async createMember(memberData) {
    const response = await fetch(`${API_BASE_URL}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memberData)
    })
    if (response.ok) {
      return await response.json()
    }
    // Get error details from response
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If we can't parse JSON, use status text
      throw new Error(`Failed to create member: ${response.statusText}`);
    }
    // Handle specific error messages from the backend
    if (errorData.error === 'invalid_class_format') {
      throw new Error('Định dạng lớp không hợp lệ. Vui lòng nhập theo định dạng AxKy (ví dụ: A1K1)');
    } else if (errorData.error.startsWith('missing_field_')) {
      const fieldName = errorData.error.replace('missing_field_', '');
      throw new Error(`Thiếu thông tin bắt buộc: ${fieldName}`);
    }
    throw new Error(errorData.error || 'Failed to create member');
  }

  // Update an existing member
  async updateMember(memberId, memberData) {
    const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memberData)
    })
    if (response.ok) {
      return await response.json()
    }
    // Get error details from response
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If we can't parse JSON, use status text
      throw new Error(`Failed to update member: ${response.statusText}`);
    }
    // Handle specific error messages from the backend
    if (errorData.error === 'invalid_class_format') {
      throw new Error('Định dạng lớp không hợp lệ. Vui lòng nhập theo định dạng AxKy (ví dụ: A1K1)');
    } else if (errorData.error.startsWith('missing_field_')) {
      const fieldName = errorData.error.replace('missing_field_', '');
      throw new Error(`Thiếu thông tin bắt buộc: ${fieldName}`);
    }
    throw new Error(errorData.error || 'Failed to update member');
  }

  // Delete a member
  async deleteMember(memberId) {
    const response = await fetch(`${API_BASE_URL}/members/${memberId}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to delete member')
  }

  // Get member skills
  async getMemberSkills(memberId) {
    const response = await fetch(`${API_BASE_URL}/members/${memberId}`)
    if (response.ok) {
      const data = await response.json()
      return data.skills || []
    }
    throw new Error('Failed to fetch member skills')
  }

  // Update member skills
  async updateMemberSkills(memberId, skillsData) {
    const response = await fetch(`${API_BASE_URL}/members/${memberId}/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(skillsData)
    })
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to update member skills')
  }

  // Toggle member status
  async toggleMemberStatus(memberId) {
    const response = await fetch(`${API_BASE_URL}/members/${memberId}/status`, {
      method: 'PUT'
    })
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to toggle member status')
  }

  // Upload avatar
  async uploadAvatar(imageData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ image: imageData })
    })
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to upload avatar')
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
    })
    if (response.ok) {
      return await response.json()
    }
    // Get error details from response
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If we can't parse JSON, use status text
      throw new Error(`Failed to change password: ${response.statusText}`);
    }
    throw new Error(errorData.error || 'Failed to change password');
  }
}

export default new MemberManagementService()
