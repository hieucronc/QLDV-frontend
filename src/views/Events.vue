<template>
  <div class="events">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Danh sách Sự kiện</h2>
      <div class="d-flex">
        <div class="input-group me-2" style="width: 300px;">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm sự kiện..." 
            v-model="searchQuery"
            @input="handleSearch"
          >
        </div>
        <div class="dropdown me-2">
          <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="filterDropdown" data-bs-toggle="dropdown">
            <i class="bi bi-funnel"></i> Bộ lọc
          </button>
          <ul class="dropdown-menu" aria-labelledby="filterDropdown">
            <li><a class="dropdown-item" :class="{ 'active': statusFilter === '' }" @click="statusFilter = ''">Tất cả</a></li>
            <li><a class="dropdown-item" :class="{ 'active': statusFilter === 'upcoming' }" @click="statusFilter = 'upcoming'">Sắp diễn ra</a></li>
            <li><a class="dropdown-item" :class="{ 'active': statusFilter === 'ongoing' }" @click="statusFilter = 'ongoing'">Đang diễn ra</a></li>
            <li><a class="dropdown-item" :class="{ 'active': statusFilter === 'closed' }" @click="statusFilter = 'closed'">Đã kết thúc</a></li>
          </ul>
        </div>
        <button class="btn btn-primary" @click="sortByDate = !sortByDate">
          <i class="bi bi-sort-down" v-if="!sortByDate"></i>
          <i class="bi bi-sort-up" v-else></i>
          {{ sortByDate ? 'Xếp theo tên' : 'Xếp theo ngày' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Events List -->
    <div v-else>
      <div v-if="filteredAndSortedEvents.length === 0" class="text-center my-5">
        <div class="alert alert-info" role="alert">
          <i class="bi bi-info-circle me-2"></i>
          Không có sự kiện nào
        </div>
      </div>

      <div v-else class="row">
        <div v-for="event in filteredAndSortedEvents" :key="event.id" class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 event-card" @click="goToEventDetail(event.id)">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="card-title mb-0">{{ event.title }}</h5>
                <span class="badge" :class="getStatusBadgeClass(event.status)">
                  {{ getStatusText(event.status) }}
                </span>
              </div>
              
                <p class="card-text text-muted flex-grow-1 text-truncate">{{ event.description }}</p>
              
              <div class="event-details mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <small class="text-muted">
                    <i class="bi bi-geo-alt me-1"></i> {{ event.place }}
                  </small>
                  <small class="text-muted">
                    <i class="bi bi-people me-1"></i> {{ event.current_participants }} / {{ event.capacity }}
                  </small>
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">
                    <i class="bi bi-calendar3 me-1"></i> {{ formatDate(event.start_time) }}
                  </small>
                  <div class="progress" style="width: 60px; height: 6px;">
                    <div 
                      class="progress-bar" 
                      role="progressbar" 
                      :style="{ width: `${(event.current_participants / event.capacity) * 100}%` }"
                      :aria-valuenow="event.current_participants"
                      aria-valuemin="0"
                      :aria-valuemax="event.capacity"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import eventService from '../services/eventService'

export default {
  name: 'EventsPage',
  setup() {
    const router = useRouter()
    const events = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const statusFilter = ref('')
    const sortByDate = ref(false)

    const fetchEvents = async () => {
      try {
        loading.value = true
        events.value = await eventService.getEvents()
      } catch (error) {
        // Handle error silently
      } finally {
        loading.value = false
      }
    }

    const goToEventDetail = (eventId) => {
      router.push(`/events/${eventId}`)
    }

    const getStatusBadgeClass = (status) => {
      const classes = {
        upcoming: 'bg-warning',
        ongoing: 'bg-success',
        closed: 'bg-secondary'
      }
      return classes[status] || 'bg-secondary'
    }

    const getStatusText = (status) => {
      const texts = {
        upcoming: 'Sắp diễn ra',
        ongoing: 'Đang diễn ra',
        closed: 'Đã kết thúc'
      }
      return texts[status] || status
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const handleSearch = () => {
      // Search is handled by the computed property filteredAndSortedEvents
    }

    const filteredAndSortedEvents = computed(() => {
      // Calculate event status based on time comparison
      const eventsWithStatus = events.value.map(event => {
        const now = new Date()
        const startTime = new Date(event.start_time)
        const endTime = new Date(event.end_time)
        
        let status = 'closed'
        if (now < startTime) {
          status = 'upcoming'
        } else if (now >= startTime && now <= endTime) {
          status = 'ongoing'
        }
        
        return {
          ...event,
          status
        }
      })

      let result = [...eventsWithStatus]

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(event => 
          event.title.toLowerCase().includes(query) || 
          event.description.toLowerCase().includes(query) ||
          event.place.toLowerCase().includes(query)
        )
      }

      // Filter by status
      if (statusFilter.value) {
        result = result.filter(event => event.status === statusFilter.value)
      }

      // Sort by date or name
      if (sortByDate.value) {
        result = result.sort((a, b) => a.title.localeCompare(b.title))
      } else {
        result = result.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
      }

      return result
    })

    onMounted(() => {
      fetchEvents()
    })

    return {
      events,
      loading,
      searchQuery,
      statusFilter,
      sortByDate,
      filteredAndSortedEvents,
      goToEventDetail,
      getStatusBadgeClass,
      getStatusText,
      formatDate,
      handleSearch
    }
  }
}
</script>

<style scoped>
.events {
  padding-top: 1rem;
}

.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border-radius: 10px;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.event-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.card-title {
  font-weight: 600;
  color: #333;
}

.badge {
  font-weight: 500;
  font-size: 0.75rem;
}

.progress-bar {
  background: linear-gradient(90deg, #007bff, #0056b3);
}

.input-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.input-group .form-control {
  border: none;
}

.input-group .form-control:focus {
  box-shadow: none;
}

.input-group .btn {
  border: none;
  background-color: #f8f9fa;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
}

.btn-outline-secondary {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dropdown-item {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin: 0.125rem 0.5rem;
}

.dropdown-item:hover,
.dropdown-item.active {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alert {
  border-radius: 8px;
}

@media (max-width: 768px) {
  .d-flex {
    flex-direction: column;
  }
  
  .input-group {
    width: 100% !important;
    margin-bottom: 1rem;
  }
  
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .dropdown {
    margin-bottom: 1rem;
  }
}
</style>
