<template>
  <div class="home">
    <!-- Hero Section -->
    <div class="jumbotron bg-primary text-white p-5 rounded mb-4">
      <div class="container">
        <h1 class="display-4">Chào mừng đến với Hệ thống Quản lý Đoàn Viên</h1>
        <p class="lead">Nền tảng số hóa quản lý đoàn viên, sự kiện và điểm danh thông minh</p>
        <hr class="my-4">
        <p>Tham gia các hoạt động, tích lũy điểm kỹ năng và theo dõi thành tích của bạn</p>
        <router-link class="btn btn-light btn-lg" to="/events" role="button">Khám phá sự kiện</router-link>
      </div>
    </div>

    <!-- Features Section -->
    <div class="row mb-5">
      <div class="col-md-4 mb-4">
        <div class="card h-100 text-center">
          <div class="card-body">
            <div class="feature-icon mb-3">
              <i class="bi bi-people-fill" style="font-size: 3rem; color: #007bff;"></i>
            </div>
            <h5 class="card-title">Quản lý Đoàn Viên</h5>
            <p class="card-text">Theo dõi thông tin, điểm kỹ năng và thành tích của từng đoàn viên trong hệ thống</p>
            <router-link to="/members" class="btn btn-outline-primary">Xem đoàn viên</router-link>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card h-100 text-center">
          <div class="card-body">
            <div class="feature-icon mb-3">
              <i class="bi bi-calendar-event" style="font-size: 3rem; color: #28a745;"></i>
            </div>
            <h5 class="card-title">Sự kiện & Hoạt động</h5>
            <p class="card-text">Tổ chức và quản lý các sự kiện, gợi ý đoàn viên phù hợp dựa trên kỹ năng</p>
            <router-link to="/events" class="btn btn-outline-success">Xem sự kiện</router-link>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card h-100 text-center">
          <div class="card-body">
            <div class="feature-icon mb-3">
              <i class="bi bi-qr-code-scan" style="font-size: 3rem; color: #dc3545;"></i>
            </div>
            <h5 class="card-title">Điểm danh QR</h5>
            <p class="card-text">Điểm danh nhanh chóng bằng mã QR, tự động cộng điểm kỹ năng cho đoàn viên</p>
            <router-link to="/leaderboard" class="btn btn-outline-danger">Xem xếp hạng</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Events -->
    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Sự kiện sắp diễn ra</h5>
            <router-link to="/events" class="btn btn-sm btn-outline-primary">Xem tất cả</router-link>
          </div>
          <div class="card-body">
            <div v-if="eventStore.loading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="eventStore.upcomingEvents.length === 0" class="text-center text-muted">
              Chưa có sự kiện sắp diễn ra
            </div>
            <div v-else>
              <div v-for="event in eventStore.upcomingEvents.slice(0, 3)" :key="event.id" class="mb-3 pb-3 border-bottom">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ event.title }}</h6>
                    <p class="mb-1 text-muted small">{{ event.place }}</p>
                    <small class="text-muted">
                      <i class="bi bi-calendar3"></i> {{ formatDate(event.start_time) }}
                    </small>
                  </div>
                  <span class="badge bg-info">Sắp diễn ra</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Top Đoàn viên</h5>
          </div>
          <div class="card-body">
            <div v-if="memberStore.loading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="memberStore.leaderboard.length === 0" class="text-center text-muted">
              Chưa có dữ liệu
            </div>
            <div v-else>
              <div v-for="(member, index) in memberStore.leaderboard.slice(0, 5)" :key="member.id" class="d-flex align-items-center mb-2">
                <span class="me-2" :class="getRankClass(index)">
                  {{ index + 1 }}
                </span>
                <div class="flex-grow-1">
                  <div class="fw-bold">{{ member.full_name }}</div>
                  <small class="text-muted">{{ member.code }}</small>
                </div>
                <span class="badge bg-primary">{{ member.total_score }} điểm</span>
              </div>
            </div>
            <div class="text-center mt-3">
              <router-link to="/leaderboard" class="btn btn-sm btn-outline-primary">Xem đầy đủ</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useEventStore } from '@/stores/event'
import { useMemberStore } from '@/stores/member'
import { onMounted } from 'vue'

export default {
  name: 'HomePage', // Changed to multi-word name
  setup() {
    const eventStore = useEventStore()
    const memberStore = useMemberStore()

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getRankClass = (index) => {
      if (index === 0) return 'leaderboard-rank-1'
      if (index === 1) return 'leaderboard-rank-2'
      if (index === 2) return 'leaderboard-rank-3'
      return ''
    }

    onMounted(async () => {
      await eventStore.fetchEvents()
      await memberStore.fetchLeaderboard(10)
    })

    return {
      eventStore,
      memberStore,
      formatDate,
      getRankClass
    }
  }
}
</script>

<style scoped>
.jumbotron {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(0, 123, 255, 0.1);
}
</style>
