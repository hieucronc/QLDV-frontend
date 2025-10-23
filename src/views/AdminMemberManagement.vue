<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý đoàn viên</h2>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <i class="bi bi-person-plus me-1"></i>
        Thêm đoàn viên mới
      </button>
    </div>
    
    <!-- Filters -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-9">
            <label class="form-label">Tìm kiếm</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Tên, email, điện thoại..." 
              v-model="filters.search"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">&nbsp;</label>
            <div class="d-grid">
              <button class="btn btn-outline-primary" @click="fetchMembers">
                <i class="bi bi-search me-1"></i>
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Members List -->
    <div class="card shadow-sm">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <div v-else-if="filteredMembers.length > 0">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Đoàn viên</th>
                  <th>Thông tin liên hệ</th>
                  <th>Điểm tổng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in filteredMembers" :key="member.id">
                  <td>
                    <div class="d-flex align-items-center">
                      <img 
                        :src="getAvatarUrl(member.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=0d6efd&color=fff&size=40`" 
                        class="rounded-circle me-3" 
                        :alt="member.full_name"
                        style="width: 40px; height: 40px; object-fit: cover;"
                        @error="handleImageError"
                      >
                      <div>
                        <div class="fw-medium">{{ member.full_name }}</div>
                      <small class="text-muted">Mã: {{ member.code }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <i class="bi bi-envelope me-1 text-muted"></i>
                      {{ member.email || 'N/A' }}
                    </div>
                    <div>
                      <i class="bi bi-telephone me-1 text-muted"></i>
                      {{ member.phone || 'N/A' }}
                    </div>
                  </td>
                  <td>
                    <span class="badge bg-primary fs-6">
                      <i class="bi bi-star-fill me-1"></i>
                      {{ member.total_score || 0 }} điểm
                    </span>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <button 
                        class="btn btn-sm btn-outline-primary" 
                        @click="editMember(member)"
                        title="Chỉnh sửa"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-info" 
                        @click="viewMemberSkills(member)"
                        title="Kỹ năng"
                      >
                        <i class="bi bi-star"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger" 
                        @click="confirmDelete(member)"
                        title="Xóa"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div v-else class="text-center py-5">
          <i class="bi bi-people fs-1 d-block mb-2 text-muted"></i>
          <h5>Không tìm thấy đoàn viên</h5>
          <p class="text-muted">Không có đoàn viên nào phù hợp với tiêu chí tìm kiếm.</p>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Member Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ showCreateModal ? 'Thêm đoàn viên mới' : 'Chỉnh sửa đoàn viên' }}</h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <div class="modal-body">
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
            <form @submit.prevent="saveMember">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Họ và tên <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="formData.full_name"
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email <span class="text-danger">*</span></label>
                  <input 
                    type="email" 
                    class="form-control" 
                    v-model="formData.email"
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Số điện thoại <span class="text-danger">*</span></label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    v-model="formData.phone"
                    required
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label">Lớp <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="formData.class"
                    required
                    pattern="A\d{1}K\d{1}"
                    title="Định dạng lớp: AxKy (ví dụ: A1K1)"
                  >
                  <div class="form-text">Định dạng: AxKy (ví dụ: A1K1)</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Mật khẩu <span class="text-danger">*</span></label>
                  <input 
                    type="password" 
                    class="form-control" 
                    v-model="formData.password"
                    :required="showCreateModal"
                    :placeholder="showCreateModal ? '' : 'Để trống nếu không đổi mật khẩu'"
                  >
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModals">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveMember" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ showCreateModal ? 'Thêm' : 'Cập nhật' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Member Skills Modal -->
    <div v-if="showSkillsModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Kỹ năng của {{ selectedMember?.full_name }}</h5>
            <button type="button" class="btn-close" @click="showSkillsModal = false"></button>
          </div>
          <div class="modal-body">
            <div v-if="memberSkills.length > 0">
              <div v-for="skill in memberSkills" :key="skill.id" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-medium">{{ skill.name }}</span>
                  <div class="input-group" style="width: 120px;">
                    <input 
                      type="number" 
                      class="form-control form-control-sm" 
                      v-model.number="skill.points"
                      min="0"
                    >
                    <span class="input-group-text">điểm</span>
                  </div>
                </div>
                <div class="progress" style="height: 8px;">
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
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showSkillsModal = false">Đóng</button>
            <button type="button" class="btn btn-primary" @click="updateMemberSkills" :disabled="updatingSkills">
              <span v-if="updatingSkills" class="spinner-border spinner-border-sm me-1"></span>
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Xác nhận xóa</h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa đoàn viên "<strong>{{ memberToDelete?.full_name }}</strong>"?</p>
            <p class="text-muted mb-0">Hành động này không thể hoàn tác.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Hủy</button>
            <button type="button" class="btn btn-danger" @click="deleteMember" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import memberManagementService from '../services/memberManagementService'
import { API_BASE_URL } from '@/config/api.js'

export default {
  name: 'AdminMemberManagement',
  setup() {
    const authStore = useAuthStore()
    
    const members = ref([])
    const availableSkills = ref([])
    const loading = ref(true)
    const saving = ref(false)
    const deleting = ref(false)
    const updatingSkills = ref(false)
    const errorMessage = ref('')
    
    const filters = ref({
      search: ''
    })
    
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showSkillsModal = ref(false)
    const showDeleteModal = ref(false)
    
    const formData = ref({
      id: '',
      code: '',
      full_name: '',
      email: '',
      phone: '',
      class: '',
      avatar_url: '',
      total_score: 0,
      password: ''
    })
    
    const selectedMember = ref(null)
    const memberSkills = ref([])
    const memberToDelete = ref(null)
    
    const filteredMembers = computed(() => {
      let filtered = members.value
      
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(m => 
          m.full_name.toLowerCase().includes(search) || 
          m.email.toLowerCase().includes(search) ||
          m.phone?.toLowerCase().includes(search)
        )
      }
      
      return filtered
    })
    
    const fetchMembers = async () => {
      try {
        loading.value = true
        members.value = await memberManagementService.getMembers()
      } catch (error) {
        // Handle error silently
      } finally {
        loading.value = false
      }
    }
    
    const fetchSkills = async () => {
      try {
        availableSkills.value = await memberManagementService.getSkills()
      } catch (error) {
        // Handle error silently
      }
    }
    
    const editMember = (member) => {
      formData.value = {
        ...member,
        class: member.class || '',
        password: '' // Don't show password in edit mode
      }
      showEditModal.value = true
    }
    
    const saveMember = async () => {
      try {
        saving.value = true
        errorMessage.value = ''
        
        const data = { ...formData.value }
        if (!showCreateModal.value && !data.password) {
          delete data.password // Don't update password if empty
        }
        
        if (showCreateModal.value) {
          await memberManagementService.createMember(data)
        } else {
          await memberManagementService.updateMember(formData.value.id, data)
        }
        
        closeModals()
        fetchMembers()
      } catch (error) {
        errorMessage.value = error.message
      } finally {
        saving.value = false
      }
    }
    
    const viewMemberSkills = async (member) => {
      try {
        selectedMember.value = member
        
        // Fetch member skills
        const skills = await memberManagementService.getMemberSkills(member.id)
        memberSkills.value = skills.map(skill => ({
          ...skill,
          points: skill.points || 0
        }))
        
        // Add skills that member doesn't have yet
        availableSkills.value.forEach(availableSkill => {
          if (!memberSkills.value.find(s => s.id === availableSkill.id)) {
            memberSkills.value.push({
              ...availableSkill,
              points: 0
            })
          }
        })
        
        showSkillsModal.value = true
      } catch (error) {
        // Handle error silently
      }
    }
    
    const updateMemberSkills = async () => {
      try {
        updatingSkills.value = true
        
        const skillsData = memberSkills.value
          .filter(skill => skill.points > 0)
          .map(skill => ({
            skill_id: skill.id,
            points: skill.points
          }))
        
        await memberManagementService.updateMemberSkills(selectedMember.value.id, skillsData)
        
        showSkillsModal.value = false
        fetchMembers()
      } catch (error) {
        // Handle error silently
      } finally {
        updatingSkills.value = false
      }
    }
    
    const confirmDelete = (member) => {
      memberToDelete.value = member
      showDeleteModal.value = true
    }
    
    const deleteMember = async () => {
      try {
        deleting.value = true
        await memberManagementService.deleteMember(memberToDelete.value.id)
        showDeleteModal.value = false
        fetchMembers()
      } catch (error) {
        // Handle error silently
      } finally {
        deleting.value = false
      }
    }
    
    const closeModals = () => {
      showCreateModal.value = false
      showEditModal.value = false
      resetForm()
    }
    
    const resetForm = () => {
      formData.value = {
        id: '',
        code: '',
        full_name: '',
        email: '',
        phone: '',
        class: '',
        avatar_url: '',
        total_score: 0,
        password: ''
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
      const parentElement = event.target.closest('div.d-flex.align-items-center');
      if (parentElement) {
        const memberNameElement = parentElement.querySelector('.fw-medium');
        if (memberNameElement) {
          const memberName = memberNameElement.textContent;
          event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=0d6efd&color=fff&size=40`;
        }
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('vi-VN')
    }
    
    onMounted(() => {
      fetchMembers()
      fetchSkills()
    })
    
    return {
      authStore,
      members,
      loading,
      saving,
      deleting,
      updatingSkills,
      errorMessage,
      filters,
      filteredMembers,
      showCreateModal,
      showEditModal,
      showSkillsModal,
      showDeleteModal,
      formData,
      selectedMember,
      memberSkills,
      memberToDelete,
      fetchMembers,
      editMember,
      saveMember,
      viewMemberSkills,
      updateMemberSkills,
      confirmDelete,
      deleteMember,
      closeModals,
      formatDate,
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

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

.badge {
  font-weight: 500;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.progress-bar {
  background: linear-gradient(45deg, #0d6efd, #6610f2);
}
</style>
