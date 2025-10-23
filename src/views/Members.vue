<template>
  <div class="members">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Danh sách Đoàn viên</h2>
      <div class="d-flex">
        <div class="input-group me-2" style="width: 300px;">
          <span class="input-group-text"><i class="bi bi-search"></i></span>
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm đoàn viên..." 
            v-model="searchQuery"
            @input="handleSearch"
          >
        </div>
        <button class="btn btn-primary" @click="sortByScore = !sortByScore">
          <i class="bi bi-sort-down" v-if="!sortByScore"></i>
          <i class="bi bi-sort-up" v-else></i>
          {{ sortByScore ? 'Xếp theo tên' : 'Xếp theo điểm' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Members List -->
    <div v-else>
      <div v-if="filteredAndSortedMembers.length === 0" class="text-center my-5">
        <div class="alert alert-info" role="alert">
          <i class="bi bi-info-circle me-2"></i>
          Không tìm thấy đoàn viên nào
        </div>
      </div>

      <div v-else class="row">
        <div v-for="member in filteredAndSortedMembers" :key="member.id" class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 member-card" @click="goToMemberDetail(member.id)">
            <div class="card-body d-flex flex-column">
              <div class="text-center mb-3">
                <div class="position-relative d-inline-block">
              <img 
                :src="getAvatarUrl(member.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=007bff&color=fff&size=100`" 
                class="rounded-circle member-avatar" 
                :alt="member.full_name"
                @error="handleImageError"
              >
                  <div class="member-score-badge">
                    {{ member.total_score }}
                  </div>
                </div>
                <h5 class="card-title mt-3 mb-1">{{ member.full_name }}</h5>
                <p class="text-muted small mb-2">{{ member.code }}</p>
              </div>
              
              <div class="mt-auto">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <small class="text-muted">Email:</small>
                  <small class="text-truncate" style="max-width: 60%;">{{ member.email || 'Chưa cập nhật' }}</small>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <small class="text-muted">Điện thoại:</small>
                  <small class="text-truncate" style="max-width: 60%;">{{ member.phone || 'Chưa cập nhật' }}</small>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <small class="text-muted">Lớp:</small>
                  <small class="text-truncate" style="max-width: 60%;">{{ member.class || 'Chưa cập nhật' }}</small>
                </div>
                
                <div class="progress mb-3" style="height: 8px;">
                  <div 
                    class="progress-bar" 
                    role="progressbar" 
                    :style="{ width: `${Math.min(member.total_score * 2.5, 100)}%` }"
                    :aria-valuenow="member.total_score"
                    aria-valuemin="0"
                    aria-valuemax="40"
                  ></div>
                </div>
                
                <div class="d-flex justify-content-between small">
                  <span>Điểm số</span>
                  <span class="fw-bold text-primary">{{ member.total_score }} điểm</span>
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
import memberService from '../services/memberService'
import { API_BASE_URL } from '@/config/api.js'

export default {
  name: 'MembersPage',
  setup() {
    const router = useRouter()
    const members = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const sortByScore = ref(false)

    const fetchMembers = async () => {
      try {
        loading.value = true
        members.value = await memberService.getMembers()
      } catch (error) {
        // Handle error silently
      } finally {
        loading.value = false
      }
    }

    const goToMemberDetail = (memberId) => {
      router.push(`/members/${memberId}`)
    }

    const handleSearch = () => {
      // Search is handled by the computed property filteredAndSortedMembers
    }

    const filteredAndSortedMembers = computed(() => {
      let result = members.value

      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(member => 
          member.full_name.toLowerCase().includes(query) || 
          member.code.toLowerCase().includes(query) ||
          (member.email && member.email.toLowerCase().includes(query))
        )
      }

      // Sort by score or name
      if (sortByScore.value) {
        result = result.sort((a, b) => a.full_name.localeCompare(b.full_name))
      } else {
        result = result.sort((a, b) => b.total_score - a.total_score)
      }

      return result
    })

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
      event.target.src = 'https://ui-avatars.com/api/?name=User&background=007bff&color=fff&size=100'
    }

    onMounted(() => {
      fetchMembers()
    })

    return {
      members,
      loading,
      searchQuery,
      sortByScore,
      filteredAndSortedMembers,
      goToMemberDetail,
      handleSearch,
      handleImageError,
      getAvatarUrl
    }
  }
}
</script>

<style scoped>
.members {
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

.member-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.member-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e9ecef;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.member-score-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid white;
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
  }
}
</style>
