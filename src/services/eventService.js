import { API_BASE_URL } from '../config/api.js'

class EventService {
  // Get all events
  async getEvents() {
    const response = await fetch(`${API_BASE_URL}/events`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch events')
  }

  // Get a specific event by ID
  async getEventById(eventId) {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch event')
  }

  // Get all skills
  async getSkills() {
    const response = await fetch(`${API_BASE_URL}/skills`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch skills')
  }

  // Create a new event
  async createEvent(eventData) {
    // Format required_skills for the backend
    const formattedData = { ...eventData }
    if (formattedData.required_skills && formattedData.required_skills.length > 0) {
      formattedData.required_skills = formattedData.required_skills.map(skill => {
        // If skill is an object with id and base_points, use those values
        if (typeof skill === 'object' && skill.id !== undefined) {
          return {
            skill_id: skill.id,
            weight: skill.weight || 1,
            base_points: skill.base_points || 1
          };
        }
        // If skill is just an ID, use default values
        return {
          skill_id: skill,
          weight: 1,
          base_points: 1
        };
      });
    }

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedData)
    })
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to create event')
  }

  // Update an existing event
  async updateEvent(eventId, eventData) {
    // Format required_skills for the backend
    const formattedData = { ...eventData }
    if (formattedData.required_skills && formattedData.required_skills.length > 0) {
      formattedData.required_skills = formattedData.required_skills.map(skill => {
        // If skill is an object with id and base_points, use those values
        if (typeof skill === 'object' && skill.id !== undefined) {
          return {
            skill_id: skill.id,
            weight: skill.weight || 1,
            base_points: skill.base_points || 1
          };
        }
        // If skill is just an ID, use default values
        return {
          skill_id: skill,
          weight: 1,
          base_points: 1
        };
      });
    }

    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedData)
    })
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to update event')
  }

  // Delete an event
  async deleteEvent(eventId) {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to delete event')
  }

  // Scan attendance
  async scanAttendance(memberCode, eventId) {
    const response = await fetch(`${API_BASE_URL}/attendance/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        member_code: memberCode,
        event_id: eventId,
        method: 'qr_scan'
      })
    })
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to scan attendance')
  }

  // Get attendees for an event
  async getEventAttendees(eventId) {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/attendances`)
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch event attendees')
  }

}

export default new EventService()
