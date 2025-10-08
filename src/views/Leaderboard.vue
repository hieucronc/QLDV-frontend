<template>
  <div class="leaderboard">
    <h2 class="mb-4">Bảng Xếp hạng</h2>

    <!-- Loading State -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Leaderboard Table -->
    <div v-else>
      <div v-if="members.length === 0" class="text-center my-5">
        <p class="text-muted">Chưa có dữ liệu xếp hạng</p>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="text-center">#</th>
                  <th scope="col">Đoàn viên</th>
                  <th scope="col">Email</th>
                  <th scope="col" class="text-center">Tổng điểm</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, index) in members" :key="member.id">
                  <td class="text-center">
                    <span v-if="index === 0" class="leaderboard-rank-1">🥇</span>
                    <span v-else-if="index === 1" class="leaderboard-rank-2">🥈</span>
                    <span v-else-if="index === 2" class="leaderboard-rank-3">🥉</span>
                    <span v-else class="text-muted">{{ index + 1 }}</span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <img 
                        :src="getAvatarUrl(member.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=007bff&color=fff&size=40`" 
                        class="avatar me-3" 
                        :alt="member.full_name"
                      >
                      <div class="fw-bold">{{ member.full_name }}</div>
                    </div>
                  </td>
                  <td>
                    <span class="text-muted">{{ member.email }}</span>
                  </td>
                  <td class="text-center">
                    <span class="fw-bold text-primary">{{ member.total_score }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import memberService from '../services/memberService'
import { API_BASE_URL } from '@/config/api.js'

export default {
  name: 'LeaderboardPage',
  setup() {
    const members = ref([])
    const loading = ref(true)

    const fetchLeaderboard = async () => {
      try {
        loading.value = true
        const data = await memberService.getMembers()
        // Sort by total_score descending
        members.value = data.sort((a, b) => b.total_score - a.total_score)
      } catch (error) {
        // Handle error silently
      } finally {
        loading.value = false
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

    onMounted(() => {
      fetchLeaderboard()
    })

    return {
      members,
      loading,
      getAvatarUrl
    }
  }
}
</script>

<style scoped>
.leaderboard {
  padding-top: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.leaderboard-rank-1,
.leaderboard-rank-2,
.leaderboard-rank-3 {
  font-size: 1.5rem;
  font-weight: bold;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
  transform: scale(1.01);
  transition: all 0.2s ease;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.form-select-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}
</style>
