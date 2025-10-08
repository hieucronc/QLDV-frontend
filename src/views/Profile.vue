<template>
  <div class="profile">
    <div class="row">
      <div class="col-md-4">
        <!-- Profile Card -->
        <div class="card shadow mb-4">
          <div class="card-body text-center">
            <div v-if="memberStore.loading" class="my-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <div v-else-if="memberInfo">
              <img 
                :src="getAvatarUrl(memberInfo.avatar_url) || `https://ui-avatars.com/api/?name=${encodeURIComponent(memberInfo.full_name)}&background=007bff&color=fff&size=120`" 
                class="avatar-lg mb-3" 
                :alt="memberInfo.full_name"
              >
              <h4>{{ memberInfo.full_name }}</h4>
              <p class="text-muted mb-1">Mã đoàn viên: {{ memberInfo.code }}</p>
              
              <div class="d-grid gap-2">
                <button class="btn btn-outline-secondary" @click="refreshProfile">
                  <i class="bi bi-arrow-clockwise me-2"></i>Làm mới
                </button>
              </div>
            </div>

            <div v-else class="text-center my-4">
              <i class="bi bi-person-x" style="font-size: 3rem; color: #6c757d;"></i>
              <p class="text-muted mt-3">Không tìm thấy thông tin</p>
            </div>
          </div>
        </div>

        <!-- Total Score Card -->
        <div class="card shadow" v-if="memberInfo">
          <div class="card-body text-center">
            <h5 class="card-title text-primary">Tổng Điểm</h5>
            <h2 class="display-4 fw-bold">{{ totalScore }}</h2>
            <p class="text-muted">điểm</p>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <!-- QR Code Card -->
        <div class="card shadow mb-4" v-if="memberInfo">
          <div class="card-header">
            <h5 class="mb-0">Mã QR Cá Nhân</h5>
          </div>
          <div class="card-body text-center">
            <div class="qr-container mb-3">
              <img :src="qrImage" class="qr-code" v-if="qrImage" alt="QR Code">
              <div v-else class="qr-placeholder">Đang tạo mã QR...</div>
            </div>
            <div class="alert alert-info" role="alert">
              <i class="bi bi-info-circle me-2"></i>
              Đây là mã QR cá nhân của bạn. Vui lòng xuất trình khi cần xác thực.
            </div>
            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="downloadQR" :disabled="!qrImage">
                <i class="bi bi-download me-2"></i>Tải QR Code
              </button>
              <button class="btn btn-outline-secondary" @click="generateQR">
                <i class="bi bi-arrow-clockwise me-2"></i>Tạo lại QR
              </button>
            </div>
          </div>
        </div>

        <!-- Skills Card -->
        <div class="card shadow mb-4" v-if="memberInfo">
          <div class="card-header">
            <h5 class="mb-0">Điểm Kỹ Năng</h5>
          </div>
          <div class="card-body">
            <div v-if="memberStore.loading" class="text-center my-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="skills.length === 0" class="text-center my-4">
              <i class="bi bi-star" style="font-size: 2rem; color: #6c757d;"></i>
              <p class="text-muted mt-2">Chưa có kỹ năng nào</p>
            </div>

            <div v-else>
              <div v-for="skill in skills" :key="skill.id" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h6 class="mb-1">{{ skill.name }}</h6>
                    <small class="text-muted">{{ skill.points }} điểm</small>
                  </div>
                  <span class="badge bg-primary">{{ skill.points }} điểm</span>
                </div>
                <div class="skill-bar">
                  <div 
                    class="skill-progress" 
                    :style="{ width: getSkillPercentage(skill.points) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Actions -->
        <div class="card shadow mb-4" v-if="memberInfo">
          <div class="card-body">
            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="toggleEditProfile">
                <i class="bi bi-pencil-square me-2"></i>
                {{ showEditProfile ? 'Hủy bỏ chỉnh sửa thông tin' : 'Chỉnh sửa thông tin' }}
              </button>
              <button class="btn btn-outline-primary" @click="toggleChangePassword">
                <i class="bi bi-key me-2"></i>
                {{ showChangePassword ? 'Hủy bỏ đổi mật khẩu' : 'Đổi mật khẩu' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Change Password Card -->
        <div class="card shadow mb-4" v-if="memberInfo && showChangePassword">
          <div class="card-header">
            <h5 class="mb-0">Đổi Mật Khẩu</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label for="currentPassword" class="form-label">Mật khẩu hiện tại</label>
                <div class="input-group">
                  <input 
                    :type="showCurrentPassword ? 'text' : 'password'" 
                    class="form-control" 
                    id="currentPassword" 
                    v-model="passwordData.currentPassword"
                    required
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>
              <div class="mb-3">
                <label for="newPassword" class="form-label">Mật khẩu mới</label>
                <div class="input-group">
                  <input 
                    :type="showNewPassword ? 'text' : 'password'" 
                    class="form-control" 
                    id="newPassword" 
                    v-model="passwordData.newPassword"
                    required
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    @click="showNewPassword = !showNewPassword"
                  >
                    <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Xác nhận mật khẩu mới</label>
                <div class="input-group">
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    class="form-control" 
                    id="confirmPassword" 
                    v-model="passwordData.confirmPassword"
                    required
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary" :disabled="changingPassword">
                  <span v-if="changingPassword" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Personal Information Card -->
        <div class="card shadow" v-if="memberInfo && showEditProfile">
          <div class="card-header">
            <h5 class="mb-0">Chỉnh Sửa Thông Tin Cá Nhân</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveProfile">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Họ và tên</label>
                  <p class="fw-bold">{{ memberInfo.full_name }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label text-muted">Mã đoàn viên</label>
                  <p class="fw-bold">{{ memberInfo.code }}</p>
                </div>
                <div class="col-md-6 mb-3">
                  <label for="dob" class="form-label">Ngày sinh</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="dob" 
                    v-model="profileData.dob"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="phone" class="form-label">Số điện thoại</label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    id="phone" 
                    v-model="profileData.phone"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="profileData.email"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="class" class="form-label">Lớp</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="class" 
                    v-model="profileData.address"
                    placeholder="Nhập lớp"
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label for="avatar" class="form-label">Ảnh đại diện</label>
                  <input 
                    type="file" 
                    class="form-control" 
                    id="avatar" 
                    @change="handleAvatarUpload"
                    accept="image/*"
                  >
                  <div v-if="profileData.avatar_url" class="mt-2">
                    <img :src="profileData.avatar_url" class="avatar-preview" alt="Avatar preview">
                  </div>
                </div>
              </div>
              <div class="d-grid mt-3">
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useMemberStore } from '@/stores/member'
import { useToastStore } from '@/stores/toast'
import { computed, onMounted, ref, watch } from 'vue'
import QRCode from 'qrcode'
import memberManagementService from '@/services/memberManagementService'
import { API_BASE_URL } from '@/config/api.js'

export default {
  name: 'ProfilePage', // Changed to multi-word name
  setup() {
    const authStore = useAuthStore()
    const memberStore = useMemberStore()
    const toastStore = useToastStore()
    const qrImage = ref(null)
    const saving = ref(false)
    const changingPassword = ref(false)
    const showEditProfile = ref(false)
    const showChangePassword = ref(false)
    const showCurrentPassword = ref(false)
    const showNewPassword = ref(false)
    const showConfirmPassword = ref(false)
    const profileData = ref({
      dob: '',
      phone: '',
      email: '',
      address: '',
      avatar_url: ''
    })
    const passwordData = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const memberInfo = computed(() => {
      return memberStore.currentMember?.member
    })

    const skills = computed(() => {
      return memberStore.currentMember?.skills || []
    })

    const totalScore = computed(() => {
      if (!skills.value || skills.value.length === 0) {
        return 0
      }
      
      return skills.value.reduce((total, skill) => {
        return total + (skill.points * skill.weight)
      }, 0)
    })

    const getSkillPercentage = (points) => {
      const maxPoints = Math.max(...skills.value.map(s => s.points), 100)
      return Math.min((points / maxPoints) * 100, 100)
    }

    const generateQR = async () => {
      // Use member_id if available, otherwise use username
      const qrData = authStore.currentUser?.member_id || authStore.currentUser?.username
      
      if (!qrData) {
        toastStore.showError('Không tìm thấy thông tin người dùng')
        return
      }

      try {
        // Generate QR code as data URL
        const dataUrl = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        qrImage.value = dataUrl
      } catch (err) {
        toastStore.showError('Không thể tạo mã QR. Vui lòng thử lại.')
      }
    }

    const downloadQR = () => {
      if (!qrImage.value) return

      try {
        const link = document.createElement('a')
        const filename = authStore.currentUser?.member_id || authStore.currentUser?.username
        link.download = `qr-code-${filename}.png`
        link.href = qrImage.value
        link.click()
      } catch (err) {
        toastStore.showError('Không thể tải mã QR. Vui lòng thử lại.')
      }
    }

    const refreshProfile = async () => {
      if (authStore.currentUser?.member_id) {
        await memberStore.fetchMember(authStore.currentUser.member_id)
      }
    }

    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0]
      if (file) {
        // Show preview immediately
        const reader = new FileReader()
        reader.onload = (e) => {
          profileData.value.avatar_url = e.target.result
        }
        reader.readAsDataURL(file)
        
        // Upload to backend
        try {
          // Convert file to base64
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result.split(',')[1]) // Remove data URL prefix
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
          
          // Upload avatar
          const result = await memberManagementService.uploadAvatar(base64)
          profileData.value.avatar_url = result.avatar_url
        } catch (err) {
          toastStore.showError('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.')
          // Reset the file input
          event.target.value = ''
        }
      }
    }

    const saveProfile = async () => {
      if (!authStore.currentUser?.member_id) {
        toastStore.showError('Không tìm thấy thông tin người dùng')
        return
      }

      try {
        saving.value = true
        // Update member profile
        await memberManagementService.updateMember(authStore.currentUser.member_id, profileData.value)
        
        // Refresh profile data
        await refreshProfile()
        
        // Show success message
        toastStore.showSuccess('Cập nhật thông tin thành công!')
      } catch (err) {
        toastStore.showError('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.')
      } finally {
        saving.value = false
      }
    }

    // Watch for changes in memberInfo and update profileData
    watch(memberInfo, (newMemberInfo) => {
      if (newMemberInfo) {
        profileData.value = {
          dob: newMemberInfo.dob || '',
          phone: newMemberInfo.phone || '',
          email: newMemberInfo.email || '',
          address: newMemberInfo.address || '',
          avatar_url: newMemberInfo.avatar_url || ''
        }
      }
    }, { immediate: true })

    const changePassword = async () => {
      if (!authStore.currentUser?.member_id) {
        toastStore.showError('Không tìm thấy thông tin người dùng')
        return
      }

      // Check if new password and confirm password match
      if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        toastStore.showError('Mật khẩu mới và xác nhận mật khẩu không khớp')
        return
      }

      // Check if new password is at least 6 characters
      if (passwordData.value.newPassword.length < 6) {
        toastStore.showError('Mật khẩu mới phải có ít nhất 6 ký tự')
        return
      }

      try {
        changingPassword.value = true
        // Change password
        await memberManagementService.changePassword(
          passwordData.value.currentPassword,
          passwordData.value.newPassword
        )
        
        // Show success message
        toastStore.showSuccess('Đổi mật khẩu thành công!')
        
        // Reset password fields
        passwordData.value.currentPassword = ''
        passwordData.value.newPassword = ''
        passwordData.value.confirmPassword = ''
        
        // Hide the change password form
        showChangePassword.value = false
      } catch (err) {
        // Handle specific error messages from the backend
        if (err.message.includes('incorrect_current_password')) {
          toastStore.showError('Mật khẩu hiện tại không đúng. Vui lòng thử lại.')
        } else if (err.message.includes('missing_password')) {
          toastStore.showError('Vui lòng nhập đầy đủ thông tin mật khẩu.')
        } else if (err.message.includes('user_not_found')) {
          toastStore.showError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.')
        } else {
          toastStore.showError('Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.')
        }
      } finally {
        changingPassword.value = false
      }
    }

    const toggleEditProfile = () => {
      showEditProfile.value = !showEditProfile.value
      // Close change password form if it's open
      if (showEditProfile.value) {
        showChangePassword.value = false
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

    const toggleChangePassword = () => {
      showChangePassword.value = !showChangePassword.value
      // Close edit profile form if it's open
      if (showChangePassword.value) {
        showEditProfile.value = false
      }
    }

    onMounted(async () => {
      if (authStore.currentUser?.member_id) {
        // Add a small delay to ensure authentication is fully completed
        await new Promise(resolve => setTimeout(resolve, 500))
        await memberStore.fetchMember(authStore.currentUser.member_id)
        // Generate QR code after loading member info
        await generateQR()
      }
    })

    return {
      authStore,
      memberStore,
      memberInfo,
      skills,
      totalScore,
      qrImage,
      saving,
      changingPassword,
      showEditProfile,
      showChangePassword,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      profileData,
      passwordData,
      getSkillPercentage,
      getAvatarUrl,
      generateQR,
      downloadQR,
      refreshProfile,
      handleAvatarUpload,
      saveProfile,
      changePassword,
      toggleEditProfile,
      toggleChangePassword
    }
  }
}
</script>

<style scoped>
.profile {
  padding-top: 1rem;
}

.card {
  border: none;
  border-radius: 15px;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.avatar-lg {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e9ecef;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.skill-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.form-label {
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.btn {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.display-4 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #007bff;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
}

.card-header h5 {
  color: #495057;
  margin-bottom: 0;
}

.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.qr-code {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background-color: white;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dee2e6;
}
</style>
