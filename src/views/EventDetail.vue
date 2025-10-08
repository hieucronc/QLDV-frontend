<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Đang tải thông tin sự kiện...</p>
    </div>
    
    <div v-else-if="eventData" class="row">
      <!-- Event Header -->
      <div class="col-12 mb-4">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h2 class="mb-1">{{ eventData.event.title }}</h2>
            <div class="d-flex align-items-center">
              <span class="badge" :class="getStatusBadgeClass(eventData.event.status)">
                {{ getStatusText(eventData.event.status) }}
              </span>
              <span class="badge bg-info ms-2">
                <i class="bi bi-people me-1"></i>
                {{ eventData.event.current_participants }} / {{ eventData.event.capacity }}
              </span>
            </div>
          </div>
          <router-link to="/events" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i>
            Quay lại
          </router-link>
        </div>
      </div>
      
      <!-- Event Info Cards -->
      <div class="col-md-4 mb-4">
        <!-- Event Details Card -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-info-circle me-2"></i>
              Thông tin sự kiện
            </h5>
          </div>
          <div class="card-body">
            <div class="event-info mb-3">
              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-calendar3 me-2 text-primary"></i>
                  <strong>Thời gian bắt đầu</strong>
                </small>
                <p class="mb-0">{{ formatDateTime(eventData.event.start_time) }}</p>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-calendar-x me-2 text-primary"></i>
                  <strong>Thời gian kết thúc</strong>
                </small>
                <p class="mb-0">{{ formatDateTime(eventData.event.end_time) }}</p>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-geo-alt me-2 text-primary"></i>
                  <strong>Địa điểm</strong>
                </small>
                <p class="mb-0">{{ eventData.event.place }}</p>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-people me-2 text-primary"></i>
                  <strong>Sức chứa</strong>
                </small>
                <p class="mb-0">{{ eventData.event.capacity }} người</p>
              </div>
              <div class="mb-3">
                <small class="text-muted d-block mb-1">
                  <i class="bi bi-person-check me-2 text-primary"></i>
                  <strong>Đã tham gia</strong>
                </small>
                <p class="mb-0">{{ eventData.event.current_participants }} người</p>
                <div class="progress mt-2" style="height: 8px;">
                  <div 
                    class="progress-bar" 
                    role="progressbar" 
                    :style="{ width: `${(eventData.event.current_participants / eventData.event.capacity) * 100}%` }"
                    :aria-valuenow="eventData.event.current_participants"
                    aria-valuemin="0"
                    :aria-valuemax="eventData.event.capacity"
                  ></div>
                </div>
              </div>
            </div>
            
            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary" @click="refreshData">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Cập nhật thông tin
              </button>
            </div>
          </div>
        </div>
        
        <!-- Admin Actions -->
        <div v-if="authStore.isAdmin" class="card shadow-sm">
          <div class="card-header bg-white">
            <h6 class="card-title mb-0">
              <i class="bi bi-gear me-2"></i>
              Quản lý sự kiện
            </h6>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button 
                v-if="eventData.event.status === 'ongoing'" 
                class="btn btn-primary" 
                @click="showQRScanner = true"
                :disabled="processing"
              >
                <i class="bi bi-qr-code-scan me-1"></i>
                Quét QR điểm danh
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Event Content -->
      <div class="col-md-8">
        <!-- Event Description -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-file-text me-2"></i>
              Mô tả sự kiện
            </h5>
          </div>
          <div class="card-body">
            <p>{{ eventData.event.description || 'Không có mô tả chi tiết cho sự kiện này.' }}</p>
          </div>
        </div>
        
        <!-- Required Skills -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="bi bi-star me-2"></i>
              Kỹ năng yêu cầu
            </h5>
            <span class="badge bg-primary">{{ eventData.required_skills.length }} kỹ năng</span>
          </div>
          <div class="card-body">
            <div v-if="eventData.required_skills && eventData.required_skills.length > 0">
              <div class="row">
                <div v-for="skill in eventData.required_skills" :key="skill.id" class="col-md-6 mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-medium">{{ skill.name }}</span>
                    <span class="badge bg-info">x{{ skill.weight }}</span>
                  </div>
                  <div class="d-flex justify-content-between small text-muted mt-1">
                    <span>Điểm thưởng:</span>
                    <span>{{ skill.base_points }} điểm</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-muted py-3">
              <i class="bi bi-star fs-3 d-block mb-2"></i>
              Sự kiện này không yêu cầu kỹ năng cụ thể
            </div>
          </div>
        </div>
        
        <!-- Participant Suggestions -->
        <div class="card shadow-sm">
          <div class="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">
              <i class="bi bi-person-lines-fill me-2"></i>
              Gợi ý đoàn viên tham gia
            </h5>
            <div>
              <span class="badge bg-success me-2">{{ eventData.suggestions.length }} gợi ý</span>
              <button class="btn btn-sm btn-outline-info" @click="showScoreCalculation = true">
                <i class="bi bi-info-circle me-1"></i>
                Cách tính điểm
              </button>
            </div>
          </div>
          <div class="card-body">
            <div v-if="eventData.suggestions && eventData.suggestions.length > 0">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Đoàn viên</th>
                      <th class="text-center">Mã số</th>
                      <th class="text-end">Độ phù hợp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="suggestion in eventData.suggestions" :key="suggestion.id">
                      <td>
                        <div class="d-flex align-items-center">
                          <img 
                            :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(suggestion.full_name)}&background=0d6efd&color=fff&size=32`" 
                            class="rounded-circle me-2" 
                            :alt="suggestion.full_name"
                            style="width: 32px; height: 32px;"
                          >
                          <div class="fw-medium">{{ suggestion.full_name }}</div>
                        </div>
                      </td>
                      <td class="text-center">
                        <span class="badge bg-light text-dark">{{ suggestion.code }}</span>
                      </td>
                      <td class="text-end">
                        <span class="badge bg-primary">{{ suggestion.fit }}/10 điểm</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="text-center text-muted py-4">
              <i class="bi bi-person-x fs-1 d-block mb-2"></i>
              Không có gợi ý nào cho sự kiện này
            </div>
          </div>
        </div>
        
        <!-- Score Calculation Modal -->
        <div v-if="showScoreCalculation" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Cách tính điểm độ phù hợp</h5>
                <button type="button" class="btn-close" @click="showScoreCalculation = false"></button>
              </div>
              <div class="modal-body">
                <div class="alert alert-info">
                  <h6 class="alert-heading">Công thức tính điểm:</h6>
                  <p class="mb-0">Điểm độ phù hợp (thang 10) = (Tổng điểm kỹ năng × 10) / Điểm tối đa có thể đạt được</p>
                </div>
                
                <h6 class="mt-4">Chi tiết tính toán:</h6>
                <ul>
                  <li>Bước 1: Tính tổng điểm kỹ năng = Σ(Điểm kỹ năng của đoàn viên × Trọng số kỹ năng sự kiện)</li>
                  <li>Bước 2: Tính điểm tối đa có thể đạt được = Σ(10 × Trọng số kỹ năng sự kiện)</li>
                  <li>Bước 3: Điểm độ phù hợp (thang 10) = (Tổng điểm kỹ năng × 10) / Điểm tối đa có thể đạt được</li>
                </ul>
                
                <div class="card mt-4">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">Ví dụ minh họa</h6>
                  </div>
                  <div class="card-body">
                    <p>Giả sử sự kiện yêu cầu 2 kỹ năng:</p>
                    <ul>
                      <li>Kỹ năng A: Trọng số 2</li>
                      <li>Kỹ năng B: Trọng số 1</li>
                    </ul>
                    <p>Đoàn viên có các kỹ năng:</p>
                    <ul>
                      <li>Kỹ năng A: 5 điểm</li>
                      <li>Kỹ năng B: 3 điểm</li>
                    </ul>
                    <p>Tính toán:</p>
                    <ul>
                      <li>Tổng điểm kỹ năng = (5 × 2) + (3 × 1) = 10 + 3 = <strong>13 điểm</strong></li>
                      <li>Điểm tối đa có thể đạt được = (10 × 2) + (10 × 1) = 20 + 10 = <strong>30 điểm</strong></li>
                      <li>Điểm độ phù hợp (thang 10) = (13 × 10) / 30 = <strong>4.3/10 điểm</strong></li>
                    </ul>
                  </div>
                </div>
                
                <div class="card mt-4" v-if="eventData.required_skills && eventData.required_skills.length > 0">
                  <div class="card-header bg-light">
                    <h6 class="mb-0">Kỹ năng yêu cầu cho sự kiện này</h6>
                  </div>
                  <div class="card-body">
                    <div class="row">
                      <div v-for="skill in eventData.required_skills" :key="skill.id" class="col-md-6 mb-3">
                        <div class="d-flex justify-content-between align-items-center">
                          <span class="fw-medium">{{ skill.name }}</span>
                          <span class="badge bg-info">Trọng số: {{ skill.weight }}</span>
                        </div>
                        <div class="d-flex justify-content-between small text-muted mt-1">
                          <span>Điểm thưởng:</span>
                          <span>{{ skill.base_points }} điểm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="showScoreCalculation = false">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-5">
      <i class="bi bi-exclamation-triangle fs-1 text-warning d-block mb-3"></i>
      <h4>Không tìm thấy sự kiện</h4>
      <p class="text-muted">Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <router-link to="/events" class="btn btn-primary">
        <i class="bi bi-arrow-left me-1"></i>
        Quay lại danh sách
      </router-link>
    </div>
    
    <!-- QR Scanner Modal -->
    <div v-if="showQRScanner" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Quét QR điểm danh</h5>
            <button type="button" class="btn-close" @click="showQRScanner = false"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
  <video
    ref="qrVideo"
    autoplay
    muted
    playsinline
    style="width:100%;border-radius:12px;background:#000;max-height:360px;"
  ></video>

</div>
              <div class="col-md-6">
                <div class="manual-input-section">
                  <h6 class="mb-3">Nhập mã điểm danh thủ công</h6>
                  <div class="mb-3">
                    <label for="memberCode" class="form-label">Mã đoàn viên</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="memberCode" 
                      v-model="manualMemberCode"
                      placeholder="Ví dụ: DV001"
                      :disabled="processing"
                    >
                  </div>
                  <div class="d-grid">
                    <button 
                      class="btn btn-primary" 
                      @click="handleManualAttendance"
                      :disabled="!manualMemberCode || processing"
                    >
                      <span v-if="processing" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Điểm danh thủ công
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="scanResult" class="mt-3">
              <div :class="['alert', scanResult.success ? 'alert-success' : 'alert-danger']">
                {{ scanResult.message }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showQRScanner = false">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import eventService from '../services/eventService'
import { BrowserMultiFormatReader } from '@zxing/browser'

export default {
  name: 'EventDetail',
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    
    const eventData = ref(null)
    const loading = ref(true)
    const processing = ref(false)
    const showQRScanner = ref(false)
    const showScoreCalculation = ref(false)
    const scanResult = ref(null)
    const codeReader = ref(null)
    const manualMemberCode = ref('')

    // ref tới phần tử <video>
    const qrVideo = ref(null)

    const fetchEventDetail = async () => {
      try {
        loading.value = true
        const eventId = route.params.id
        
        const data = await eventService.getEventById(eventId)
        
        const now = new Date()
        const startTime = new Date(data.event.start_time)
        const endTime = new Date(data.event.end_time)
        
        let status = 'closed'
        if (now < startTime) {
          status = 'upcoming'
        } else if (now >= startTime && now <= endTime) {
          status = 'ongoing'
        }
        
        eventData.value = {
          ...data,
          event: {
            ...data.event,
            status
          }
        }
      } catch (error) {
        // có thể log nếu cần
        console.debug('fetchEventDetail error:', error)
      } finally {
        loading.value = false
      }
    }

    // Dọn stream camera (nếu có)
    const stopStreamIfAny = () => {
      try {
        const el = qrVideo.value
        if (el && el.srcObject) {
          el.srcObject.getTracks().forEach(t => t.stop())
          el.srcObject = null
        }
      } catch (e) {
        console.debug('stopStreamIfAny noop:', e)
      }
    }

    // Initialize QR scanner (fix: dùng enumerateDevices thay cho listVideoInputDevices)
const initQRScanner = async () => {
  if (!showQRScanner.value) return

  try {
    if (typeof window === 'undefined') {
      throw new Error('Not in browser context')
    }

    const hasMedia =
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'

    if (!hasMedia) {
      scanResult.value = {
        success: false,
        message:
          'Trình duyệt không hỗ trợ camera hoặc trang không chạy trên HTTPS (hoặc http://localhost). Hãy bật HTTPS và kiểm tra quyền camera.'
      }
      return
    }

    // Xin quyền & warm-up
    const warmupStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    })
    if (qrVideo.value) {
      qrVideo.value.srcObject = warmupStream
      await qrVideo.value.play().catch((e) => {
        console.debug('video warmup play failed:', e)
      })
    }
    // Tắt warm-up (ZXing sẽ mở stream riêng)
    warmupStream.getTracks().forEach(t => t.stop())

    // Dọn scanner/stream cũ
    if (codeReader.value) {
      try { await codeReader.value.reset() } catch (e) {
        console.debug('codeReader reset failed:', e)
      }
    }
    stopStreamIfAny()

    // Tạo reader
    codeReader.value = new BrowserMultiFormatReader()

    // Lấy danh sách camera bằng enumerateDevices (thay cho listVideoInputDevices)
    const allDevices = await navigator.mediaDevices.enumerateDevices()
    const devices = allDevices.filter(d => d.kind === 'videoinput')

    if (!devices || devices.length === 0) {
      scanResult.value = {
        success: false,
        message: 'Không tìm thấy camera trên thiết bị của bạn.'
      }
      return
    }

    // Ưu tiên camera sau
    let selected = devices[0]
    const back = devices.find(d =>
      (d.label || '').toLowerCase().includes('back') ||
      (d.label || '').toLowerCase().includes('rear') ||
      (d.label || '').toLowerCase().includes('environment')
    )
    if (back) selected = back

    if (!qrVideo.value) {
      scanResult.value = {
        success: false,
        message: 'Phần tử video chưa sẵn sàng. Hãy kiểm tra ref="qrVideo" trong template.'
      }
      return
    }

    await codeReader.value.decodeFromVideoDevice(
  selected.deviceId,
  qrVideo.value,
  (result, err) => {
    if (result) {
      handleQRCodeResult(result.getText())
      return
    }
    // Bỏ qua lỗi "chưa thấy mã ở frame này"
    if (err) {
      const name = err.name || (err.constructor && err.constructor.name)
      if (name !== 'NotFoundException' && name !== 'ChecksumException' && name !== 'FormatException') {
        console.error('ZXing decode error:', err)
      }
    }
  }
)

  } catch (error) {
    console.error('QR Scanner error:', error)

    let message = 'Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập camera trong trình duyệt.'
    if (error && error.name === 'NotAllowedError') {
      message = 'Bạn đã từ chối quyền camera. Hãy cấp lại quyền trong cài đặt trình duyệt.'
    } else if (error && error.name === 'NotFoundError') {
      message = 'Không tìm thấy thiết bị camera. Vui lòng kiểm tra kết nối thiết bị.'
    } else if (error && error.name === 'NotReadableError') {
      message = 'Camera đang bận hoặc bị hệ thống chặn. Hãy đóng ứng dụng khác đang dùng camera.'
    } else if (error && error.name === 'SecurityError') {
      message = 'Bị chặn do không chạy trên HTTPS hoặc trong iframe thiếu allow="camera".'
    }

    scanResult.value = { success: false, message }
    stopStreamIfAny()
  }
}


    // Handle QR code result
    const handleQRCodeResult = async (memberCode) => {
      if (!memberCode || processing.value) return;
      
      try {
        processing.value = true;
        scanResult.value = null;
        
        const result = await eventService.scanAttendance(memberCode, eventData.value.event.id);
        
        if (result.status === 'duplicated') {
          scanResult.value = {
            success: false,
            message: 'Đoàn viên này đã được điểm danh trước đó!'
          };
        } else if (result.status === 'ok') {
          let pointsMessage = '';
          if (result.awarded_points && result.awarded_points.length > 0) {
            pointsMessage = result.awarded_points.map(point => {
              const skill = eventData.value.required_skills.find(s => s.id === point.skill_id);
              return `${skill ? skill.name : 'Kỹ năng'}: +${point.added} điểm`;
            }).join(', ');
          }
          
          scanResult.value = {
            success: true,
            message: `Điểm danh thành công! ${pointsMessage}`
          };
          
          await fetchEventDetail();
        }
      } catch (error) {
        console.debug('handleQRCodeResult error:', error)
        scanResult.value = {
          success: false,
          message: 'Có lỗi xảy ra khi điểm danh. Vui lòng thử lại.'
        };
      } finally {
        processing.value = false;
      }
    };
    
    // Clean up scanner when modal closes
    const cleanupScanner = () => {
      try { codeReader.value?.reset() } catch (e) {
        console.debug('cleanup reset failed:', e)
      }
      codeReader.value = null
      stopStreamIfAny()
      scanResult.value = null
    }
    
    // Handle manual attendance
    const handleManualAttendance = async () => {
      if (!manualMemberCode.value || processing.value) return;
      
      try {
        processing.value = true;
        scanResult.value = null;
        
        const result = await eventService.scanAttendance(manualMemberCode.value, eventData.value.event.id);
        
        if (result.status === 'duplicated') {
          scanResult.value = {
            success: false,
            message: 'Đoàn viên này đã được điểm danh trước đó!'
          };
        } else if (result.status === 'ok') {
          let pointsMessage = '';
          if (result.awarded_points && result.awarded_points.length > 0) {
            pointsMessage = result.awarded_points.map(point => {
              const skill = eventData.value.required_skills.find(s => s.id === point.skill_id);
              return `${skill ? skill.name : 'Kỹ năng'}: +${point.added} điểm`;
            }).join(', ');
          }
          
          scanResult.value = {
            success: true,
            message: `Điểm danh thành công! ${pointsMessage}`
          };
          
          await fetchEventDetail();
          manualMemberCode.value = '';
        }
      } catch (error) {
        console.debug('handleManualAttendance error:', error)
        scanResult.value = {
          success: false,
          message: 'Có lỗi xảy ra khi điểm danh. Vui lòng thử lại.'
        };
      } finally {
        processing.value = false;
      }
    };
    
    const refreshData = () => {
      fetchEventDetail()
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
    
    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('vi-VN')
    }
    
    // Watch for QR scanner modal changes
    watch(showQRScanner, (newVal) => {
      if (newVal) {
        setTimeout(() => {
          initQRScanner()
        }, 100)
      } else {
        cleanupScanner()
      }
    })
    
    onMounted(() => {
      fetchEventDetail()
    })

    onBeforeUnmount(() => {
      cleanupScanner()
    })
    
    return {
      eventData,
      loading,
      processing,
      showQRScanner,
      showScoreCalculation,
      scanResult,
      authStore,
      manualMemberCode,
      refreshData,
      getStatusBadgeClass,
      getStatusText,
      formatDateTime,
      initQRScanner,
      handleQRCodeResult,
      handleManualAttendance,
      cleanupScanner,
      qrVideo
    }
  }
}
</script>



<style scoped>
.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card-header {
  border-bottom: 1px solid #eee;
  border-radius: 10px 10px 0 0 !important;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.event-info p {
  margin-bottom: 0.5rem;
}

.event-info i {
  width: 20px;
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
  background: linear-gradient(90deg, #007bff, #0056b3);
}

.btn-outline-primary {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.btn-outline-primary:hover {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-color: #007bff;
}

.btn-outline-secondary {
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.btn-warning {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.modal-content {
  border-radius: 10px;
  border: none;
}

.modal-header {
  border-bottom: 1px solid #eee;
  border-radius: 10px 10px 0 0 !important;
}

.modal-footer {
  border-top: 1px solid #eee;
  border-radius: 0 0 10px 10px !important;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

.text-muted {
  color: #6c757d !important;
}

.manual-input-section {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #f8f9fa;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.manual-input-section h6 {
  color: #495057;
  font-weight: 600;
}

@media (max-width: 768px) {
  .d-flex.justify-content-between.align-items-start {
    flex-direction: column;
  }
  
  .btn-outline-secondary {
    margin-top: 1rem;
  }
  
  .manual-input-section {
    margin-top: 1rem;
  }
}
</style>
