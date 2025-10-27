<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="member" class="row">
      <!-- Member Info Card -->
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <img 
                :src="getAvatarUrl(member.member.avatar_url) || `https://ui-avatars.com/api/?name=${member.member.full_name}&background=0d6efd&color=fff&size=150`" 
                class="rounded-circle img-fluid" 
                :alt="member.member.full_name"
                @error="handleImageError"
                style="width: 150px; height: 150px; object-fit: cover;"
              >
            </div>
            <h4 class="card-title">{{ member.member.full_name }}</h4>
            <p class="text-muted mb-2">{{ member.member.email || 'Chưa cập nhật' }}</p>
            <p class="text-muted mb-3">{{ member.member.phone || 'Chưa cập nhật' }}</p>
            
            <div class="mb-3">
              <span class="badge bg-primary fs-6">
                <i class="bi bi-star-fill me-1"></i>
                {{ member.total_score }} điểm
              </span>
            </div>
            
            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary" @click="refreshData">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Member Details -->
      <div class="col-md-8">
        <!-- Personal Information -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-person-badge me-2"></i>
              Thông tin cá nhân
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <strong>Họ và tên:</strong>
                <p class="text-muted">{{ member.member.full_name }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Mã số đoàn viên:</strong>
                <p class="text-muted">{{ member.member.code }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Ngày sinh:</strong>
                <p class="text-muted">{{ member.member.dob || 'Chưa cập nhật' }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Điện thoại:</strong>
                <p class="text-muted">{{ member.member.phone || 'Chưa cập nhật' }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Email:</strong>
                <p class="text-muted">{{ member.member.email || 'Chưa cập nhật' }}</p>
              </div>
              <div class="col-md-6 mb-3">
                <strong>Lớp:</strong>
                <p class="text-muted">{{ member.member.class || 'Chưa cập nhật' }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Skill Points -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-trophy me-2"></i>
              Điểm kỹ năng
            </h5>
          </div>
          <div class="card-body">
            <div v-if="member.skills && member.skills.length > 0">
              <div v-for="skill in member.skills" :key="skill.id" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-medium">{{ skill.name }}</span>
                  <span class="badge bg-primary">{{ skill.points }} điểm</span>
                </div>
                <div class="progress" style="height: 10px;">
                  <div 
                    class="progress-bar" 
                    role="progressbar" 
                    :style="{ width: `${Math.min(skill.points * 10, 100)}%` }"
                    :aria-valuenow="skill.points"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-muted py-4">
              <i class="bi bi-emoji-frown fs-1 d-block mb-2"></i>
              Chưa có kỹ năng nào
            </div>
          </div>
        </div>
        
        <!-- Attendances (events the member attended) -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="bi bi-calendar-check me-2"></i>
              Sự kiện đã tham gia
            </h5>
            <div>
              <span class="badge bg-primary me-2">{{ attendances.length }} sự kiện</span>
              <button class="btn btn-sm btn-outline-secondary" @click="fetchAttendances(member.member.code)">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="attendancesLoading" class="text-center py-3">
              <div class="spinner-border" role="status"></div>
            </div>
            <div v-else-if="attendances && attendances.length > 0">
              <div class="list-group">
                <div v-for="a in attendances" :key="a.event.id + (a.checkin_at || '')" class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <router-link :to="`/events/${a.event.id}`" class="fw-medium">{{ a.event.title || a.event.id }}</router-link>
                    <div class="small text-muted">{{ a.event.place || 'Không rõ địa điểm' }}</div>
                  </div>
                  <div class="text-end small text-muted">
                    <div v-if="a.checkin_at">{{ new Date(a.checkin_at).toLocaleString('vi-VN') }}</div>
                    <div v-else>—</div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-muted py-4">
              <i class="bi bi-calendar-x fs-1 d-block mb-2"></i>
              Chưa có sự kiện nào được điểm danh
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-5">
      <i class="bi bi-exclamation-triangle fs-1 text-warning d-block mb-3"></i>
      <h4>Không tìm thấy đoàn viên</h4>
      <p class="text-muted">Đoàn viên bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <router-link to="/members" class="btn btn-primary">
        <i class="bi bi-arrow-left me-1"></i>
        Quay lại danh sách
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import memberService from '../services/memberService'
import { API_BASE_URL } from '@/config/api.js'

export default {
  name: 'MemberDetail',
  setup() {
    const route = useRoute()
    
    const member = ref(null)
    const loading = ref(true)
    const attendances = ref([])
    const attendancesLoading = ref(false)
    
    const fetchMemberDetail = async () => {
      try {
        loading.value = true
        const memberId = route.params.id
        
        // Fetch member details
        const data = await memberService.getMemberById(memberId)
        member.value = data
        // fetch attendances after member loads
        fetchAttendances(memberId)
      } catch (error) {
        // Handle error silently
      } finally {
        loading.value = false
      }
    }

    const fetchAttendances = async (memberId) => {
      try {
        attendancesLoading.value = true
        const list = await memberService.getMemberAttendances(memberId)
        // Expect list of { event_id, event(optional), checkin_at, method }
        attendances.value = (list || []).map(a => ({
          event: a.event || { id: a.event_id },
          checkin_at: a.checkin_at || a.checked_at || a.created_at,
          method: a.method
        })).reverse() // show newest first
      } catch (e) {
        console.debug('fetchAttendances error:', e)
        attendances.value = []
      } finally {
        attendancesLoading.value = false
      }
    }
    
    const getAvatarUrl = (avatarUrl) => {
      if (!avatarUrl) return null
      // Check if it's a filename (not a full URL)
      if (!avatarUrl.startsWith('http')) {
        // Construct full URL using API base URL
        return `${API_BASE_URL.replace('/api', '')}/avatars/${avatarUrl}`
      }
      // If it's already a full URL, use it as is (backward compatibility)
      return avatarUrl
    }

    const handleImageError = (event) => {
      // Set a default avatar if the image fails to load
      const fullName = member.value?.member?.full_name || 'User'
      event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0d6efd&color=fff&size=150`
    }

    const refreshData = () => {
      fetchMemberDetail()
    }
    
    onMounted(() => {
      fetchMemberDetail()
    })
    
    return {
      member,
      loading,
      attendances,
      attendancesLoading,
      refreshData,
      handleImageError,
      getAvatarUrl
    }
  }
}
</script>


<style scoped>
.card {
  border: none;
  border-radius: 10px;
}

.card-header {
  border-bottom: 1px solid #eee;
  border-radius: 10px 10px 0 0 !important;
}

.progress-bar {
  background: linear-gradient(45deg, #0d6efd, #6610f2);
}

.badge {
  font-weight: 500;
}
</style>
