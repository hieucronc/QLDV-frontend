<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý sự kiện</h2>
      <button class="btn btn-primary" @click="showCreateModal = true">
        <i class="bi bi-plus-circle me-1"></i>
        Tạo sự kiện mới
      </button>
    </div>
    
    <!-- Filters -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Trạng thái</label>
            <select class="form-select" v-model="filters.status">
              <option value="">Tất cả</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="closed">Đã kết thúc</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label">Tìm kiếm</label>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Tên sự kiện, địa điểm..." 
              v-model="filters.search"
            >
          </div>
          <div class="col-md-3">
            <label class="form-label">&nbsp;</label>
            <div class="d-grid">
              <button class="btn btn-outline-primary" @click="fetchEvents">
                <i class="bi bi-search me-1"></i>
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Events List -->
    <div class="card shadow-sm">
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        
        <div v-else-if="filteredEvents.length > 0">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Tên sự kiện</th>
                  <th>Thời gian</th>
                  <th>Địa điểm</th>
                  <th>Trạng thái</th>
                  <th>Tham gia</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in filteredEvents" :key="event.id">
                  <td>
                    <div class="fw-medium">{{ event.title }}</div>
                    <small class="text-muted text-truncate d-block" style="max-width: 200px;">{{ event.description }}</small>
                  </td>
                  <td>{{ formatDateTime(event.start_time) }}</td>
                  <td>{{ event.place }}</td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(event.status)">
                      {{ getStatusText(event.status) }}
                    </span>
                  </td>
                  <td>{{ event.current_participants }} / {{ event.capacity }}</td>
                  <td>
                    <div class="btn-group" role="group">
                      <button 
                        class="btn btn-sm btn-outline-primary" 
                        @click="editEvent(event)"
                        title="Chỉnh sửa"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn btn-sm btn-outline-danger" 
                        @click="confirmDelete(event)"
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
          <i class="bi bi-calendar-x fs-1 d-block mb-2 text-muted"></i>
          <h5>Không tìm thấy sự kiện</h5>
          <p class="text-muted">Không có sự kiện nào phù hợp với tiêu chí tìm kiếm.</p>
        </div>
      </div>
    </div>
    
    <!-- Create/Edit Event Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ showCreateModal ? 'Tạo sự kiện mới' : 'Chỉnh sửa sự kiện' }}</h5>
            <button type="button" class="btn-close" @click="closeModals"></button>
          </div>
          <div class="modal-body">
            <div v-if="modalLoading" class="text-center py-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <form v-else @submit.prevent="saveEvent">
              <div class="row g-3">
                <div class="col-md-8">
                  <label class="form-label">Tên sự kiện <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="formData.title"
                    required
                  >
                  <small v-if="validationErrors.title" class="text-danger">{{ validationErrors.title }}</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Số lượng tối đa <span class="text-danger">*</span></label>
                  <input 
                    type="number" 
                    class="form-control" 
                    v-model.number="formData.capacity"
                    min="1"
                    required
                  >
                  <small v-if="validationErrors.capacity" class="text-danger">{{ validationErrors.capacity }}</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Thời gian bắt đầu <span class="text-danger">*</span></label>
                  <input 
                    type="datetime-local" 
                    class="form-control" 
                    v-model="formData.start_time"
                    required
                  >
                  <small v-if="validationErrors.start_time" class="text-danger">{{ validationErrors.start_time }}</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Thời gian kết thúc <span class="text-danger">*</span></label>
                  <input 
                    type="datetime-local" 
                    class="form-control" 
                    v-model="formData.end_time"
                    required
                  >
                  <small v-if="validationErrors.end_time" class="text-danger">{{ validationErrors.end_time }}</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Địa điểm <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="formData.place"
                    required
                  >
                  <small v-if="validationErrors.place" class="text-danger">{{ validationErrors.place }}</small>
                </div>
                <div class="col-12">
                  <label class="form-label">Mô tả <span class="text-danger">*</span></label>

                  <textarea 
                    class="form-control" 
                    v-model="formData.description"
                    rows="3"
                    required
                  ></textarea>
                  <small v-if="validationErrors.description" class="text-danger">{{ validationErrors.description }}</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Kỹ năng yêu cầu</label>
                  <div class="d-grid gap-2 mb-3">
                    <button type="button" class="btn btn-outline-primary" @click="generateSkills">
                      <i class="bi bi-magic me-1"></i>
                      Tự động tạo kỹ năng (AI)
                    </button>
                  </div>
                  <small class="text-muted">Kỹ năng sẽ được tạo tự động dựa trên mô tả sự kiện</small>
                  
                  <!-- Manual skill selection -->
                  <div class="mt-3">
                    <h6>Chọn kỹ năng thủ công:</h6>
                    <div class="row">
                      <div 
                        v-for="skill in availableSkills" 
                        :key="skill.id" 
                        class="col-md-6 mb-2"
                      >
                        <div class="card">
                          <div class="card-body p-2">
                            <div class="d-flex justify-content-between align-items-center">
                              <div class="form-check">
                                <input 
                                  class="form-check-input" 
                                  type="checkbox" 
                                  :id="'skill-' + skill.id"
                                  :value="skill.id"
                                  v-model="selectedSkillIds"
                                >
                                <label class="form-check-label" :for="'skill-' + skill.id">
                                  {{ skill.name }}
                                </label>
                              </div>
                              <input 
                                v-if="selectedSkillIds.includes(skill.id)"
                                type="number" 
                                class="form-control form-control-sm" 
                                min="1" 
                                max="10" 
                                v-model.number="skillBasePoints[skill.id]"
                                style="width: 70px;"
                                @change="updateSkillBasePoints(skill.id, $event.target.value)"
                              >
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModals">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveEvent" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ showCreateModal ? 'Tạo' : 'Cập nhật' }}
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
            <p>Bạn có chắc chắn muốn xóa sự kiện "<strong>{{ eventToDelete?.title }}</strong>"?</p>
            <p class="text-muted mb-0">Hành động này không thể hoàn tác.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">Hủy</button>
            <button type="button" class="btn btn-danger" @click="deleteEvent" :disabled="deleting">
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
import eventService from '../services/eventService'

export default {
  name: 'AdminEventManagement',
  setup() {
    const authStore = useAuthStore()
    
    const events = ref([])
    const availableSkills = ref([])
    const loading = ref(true)
    const saving = ref(false)
    const deleting = ref(false)
  const validationErrors = ref({})
    
    const filters = ref({
      status: '',
      search: ''
    })
    
    const showCreateModal = ref(false)
    const showEditModal = ref(false)
    const showDeleteModal = ref(false)
  const modalLoading = ref(false)
    const generatedSkillsList = ref([])
    const selectedSkillIds = ref([])
    const skillBasePoints = ref({})
    
    const formData = ref({
      title: '',
      description: '',
      place: '',
      start_time: '',
      end_time: '',
      capacity: 50,
      required_skills: []
    })
    
    const eventToDelete = ref(null)
    
    const filteredEvents = computed(() => {
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
      
      let filtered = eventsWithStatus
      
      if (filters.value.status) {
        filtered = filtered.filter(e => e.status === filters.value.status)
      }
      
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        filtered = filtered.filter(e => 
          e.title.toLowerCase().includes(search) || 
          e.place.toLowerCase().includes(search)
        )
      }
      
      return filtered
    })
    
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
    
    const fetchSkills = async () => {
      try {
        availableSkills.value = await eventService.getSkills()
      } catch (error) {
        // Handle error silently
      }
    }
    
    const editEvent = async (event) => {
      // show modal and spinner immediately
      selectedSkillIds.value = []
      skillBasePoints.value = {}
      modalLoading.value = true
      showEditModal.value = true

      // Ensure skills are loaded (so checkboxes exist)
      if (!availableSkills.value || availableSkills.value.length === 0) {
        await fetchSkills()
      }

      // Fetch full event details from backend to get required_skills
      let full = null
      try {
        full = await eventService.getEventById(event.id)
      } catch (e) {
        // fallback to provided event if request fails
        full = { event }
      }

      const eData = full.event || event

      // Initialize form data
      formData.value = {
        ...eData,
        title: eData.title,
        place: eData.place,
        capacity: eData.capacity,
        start_time: eData.start_time ? new Date(eData.start_time).toISOString().slice(0, 16) : '',
        end_time: eData.end_time ? new Date(eData.end_time).toISOString().slice(0, 16) : '',
        required_skills: []
      }

      // Initialize skill selection and base points from required_skills returned by API
      const reqSkills = full.required_skills || eData.required_skills || []
      if (reqSkills && reqSkills.length > 0) {
        reqSkills.forEach(skill => {
          // backend shape is { id, base_points, weight, code, name }
          const rawId = skill.id ?? skill.skill_id ?? (skill.skill && (skill.skill.id ?? skill.skill.skill_id))
          if (rawId === undefined || rawId === null) return
          const idNum = Number(rawId)

          if (!selectedSkillIds.value.includes(idNum)) selectedSkillIds.value.push(idNum)

          const basePts = skill.base_points ?? skill.basePoints ?? 1
          // store keyed by numeric id (JS object keys are strings but access via number works)
          skillBasePoints.value[idNum] = basePts

          formData.value.required_skills.push({
            id: idNum,
            base_points: basePts,
            weight: skill.weight ?? 1
          })
        })
      }

      modalLoading.value = false
    }
    
    const saveEvent = async () => {
      try {
        saving.value = true
        // Client-side validation
        if (!validateForm()) {
          // don't proceed if validation fails
          alert('Vui lòng sửa các lỗi trong biểu mẫu trước khi lưu.')
          return
        }
        
        // Prepare required skills data with base points
        const requiredSkills = selectedSkillIds.value.map(skillId => ({
          id: skillId,
          base_points: skillBasePoints.value[skillId] || 1,
          weight: 1
        }));
        
        // For new events, generate an ID
        const eventData = { ...formData.value, required_skills: requiredSkills }
        if (showCreateModal.value) {
          eventData.id = `evt-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}-${Math.random().toString(36).substr(2, 5)}`
        }
        
        if (showCreateModal.value) {
          await eventService.createEvent(eventData)
        } else {
          await eventService.updateEvent(eventData.id, eventData)
        }
        
        closeModals()
        fetchEvents()
      } catch (error) {
        // Handle error silently
      } finally {
        saving.value = false
      }
    }

    const validateForm = () => {
      validationErrors.value = {}
      const fd = formData.value || {}

      // Helper to check non-empty after trimming
      const isEmpty = (v) => {
        return v === null || v === undefined || String(v).trim() === ''
      }

      if (isEmpty(fd.title)) {
        validationErrors.value.title = 'Tên sự kiện là bắt buộc.'
      }

      if (isEmpty(fd.description)) {
        validationErrors.value.description = 'Mô tả là bắt buộc.'
      }

      if (isEmpty(fd.place)) {
        validationErrors.value.place = 'Địa điểm là bắt buộc.'
      }

      if (isEmpty(fd.start_time)) {
        validationErrors.value.start_time = 'Thời gian bắt đầu là bắt buộc.'
      }

      if (isEmpty(fd.end_time)) {
        validationErrors.value.end_time = 'Thời gian kết thúc là bắt buộc.'
      }

      // capacity must be a positive integer
      const cap = parseInt(fd.capacity, 10)
      if (Number.isNaN(cap) || cap < 1) {
        validationErrors.value.capacity = 'Số lượng tối đa phải là số nguyên lớn hơn hoặc bằng 1.'
      }

      // If both times provided, ensure start < end
      if (!validationErrors.value.start_time && !validationErrors.value.end_time) {
        const start = new Date(fd.start_time)
        const end = new Date(fd.end_time)
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          // invalid dates
          if (isNaN(start.getTime())) validationErrors.value.start_time = 'Thời gian bắt đầu không hợp lệ.'
          if (isNaN(end.getTime())) validationErrors.value.end_time = 'Thời gian kết thúc không hợp lệ.'
        } else if (start >= end) {
          validationErrors.value.start_time = 'Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc.'
          validationErrors.value.end_time = 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu.'
        }
      }

      return Object.keys(validationErrors.value).length === 0
    }
    
    const confirmDelete = (event) => {
      eventToDelete.value = event
      showDeleteModal.value = true
    }
    
    const deleteEvent = async () => {
      try {
        deleting.value = true
        await eventService.deleteEvent(eventToDelete.value.id)
        showDeleteModal.value = false
        fetchEvents()
      } catch (error) {
        // Handle error silently
      } finally {
        deleting.value = false
      }
    }
    
    const startEvent = async (eventId) => {
      try {
        await eventService.startEvent(eventId)
        fetchEvents()
      } catch (error) {
        // Handle error silently
      }
    }
    
    const endEvent = async (eventId) => {
      try {
        await eventService.endEvent(eventId)
        fetchEvents()
      } catch (error) {
        // Handle error silently
      }
    }
    
    const closeModals = () => {
      showCreateModal.value = false
      showEditModal.value = false
      resetForm()
      selectedSkillIds.value = []
      skillBasePoints.value = {}
      generatedSkillsList.value = []
      validationErrors.value = {}
    }
    
    const resetForm = () => {
      formData.value = {
        title: '',
        description: '',
        place: '',
        start_time: '',
        end_time: '',
        capacity: 50,
        required_skills: []
      }
      validationErrors.value = {}
    }
    
    // Helper: chuẩn hoá text (lowercase + bỏ dấu + bỏ ký tự thừa)
const normalizeText = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')      // bỏ dấu tiếng Việt
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')    // bỏ ký tự đặc biệt, giữ chữ/số/khoảng trắng
    .replace(/\s+/g, ' ')                 // gộp khoảng trắng
    .trim();

const generateSkills = () => {
  // Rule-based AI to generate skills based on event description
  const descriptionNorm = normalizeText(formData.value.description);

  const generatedSkillIds = [];

  // === Keyword mở rộng (đã được normalize khi so sánh) ===
  // 1: Tình nguyện
  const kwVolunteer = [
    // việt có dấu
    'tinh nguyen','giup do','cong dong','phuc vu','tu thien','thien nguyen',
    'hien mau','quyen gop','gay quy','trong cay','don rac','bao ve moi truong',
    'chien dich xanh','gio trai dat','clean up','green day',
    // english
    'volunteer','community','charity','serve','service','donation','fundraising',
    'cleanup','environment','blood donation'
  ];

  // 2: Thể thao
  const kwSports = [
    // việt
    'the thao','bong da','bong ro','bong chuyen','bong ban','bong chay','cau long',
    'dien kinh','chay bo','giai chay','marathon','giai dau','thi dau','tap luyen',
    'esports','e sport','bơi','boi loi','gym','futsal',
    // english
    'sport','sports','soccer','football','basketball','volleyball','badminton',
    'table tennis','athletics','run','race','tournament','league','cup','esport'
  ];

  // 3: Văn nghệ
  const kwArt = [
    // việt
    'van nghe','ca hat','hat','mua','nhac','bieu dien','nhay','dance','dance cover',
    'khi nhac','dan guitar','guitar','piano','trong','ban nhac','rap','beatbox',
    'kịch','kich','san khau','open mic','tai nang','flashmob','mua lan',
    // english
    'music','sing','song','dance','performance','band','choir','theater','talent show','open mic','dj'
  ];

  // 4: Truyền thông
  const kwMedia = [
    // việt
    'truyen thong','tuyen truyen','marketing','quang cao','quang ba','pr','pr ',
    'thiet ke','poster','banner','an pham','bai pr','thong cao bao chi','bao chi',
    'chup anh','quay phim','dung phim','edit video','dung video','cap','caption',
    'copy','copywriting','noi dung','seeding','quan tri fanpage','social','mxh',
    'facebook','tiktok','youtube','livestream','reels','shorts','design','canva','photoshop',
    // english
    'media','promo','promotion','content','copywriting','press','press release',
    'photography','videography','editing','livestream','social media'
  ];

  // Bảng skillId -> keywords
  const skillKeywords = {
    1: kwVolunteer,
    2: kwSports,
    3: kwArt,
    4: kwMedia
  };

  // Check match (so sánh sau khi normalize)
  const hasKeyword = (text, keyword) => {
    const kw = normalizeText(keyword);
    if (!kw) return false;
    return text.includes(kw);
  };

  // Duyệt và gom skill phù hợp
  for (const [skillId, keywords] of Object.entries(skillKeywords)) {
    for (const keyword of keywords) {
      if (hasKeyword(descriptionNorm, keyword)) {
        const idNum = parseInt(skillId, 10);
        if (!generatedSkillIds.includes(idNum)) {
          generatedSkillIds.push(idNum);
        }
        break; // sang skill kế tiếp sau khi thấy match đầu tiên
      }
    }
  }

  // Nếu không match gì, gán mặc định Tình nguyện
  if (generatedSkillIds.length === 0) {
    generatedSkillIds.push(1);
  }

  // Update form data & UI state
  formData.value.required_skills = generatedSkillIds;

  selectedSkillIds.value = [...generatedSkillIds];
  generatedSkillIds.forEach(id => {
    if (!skillBasePoints.value[id]) {
      skillBasePoints.value[id] = 1; // default base points
    }
  });

  generatedSkillsList.value = generatedSkillIds.map(id => {
    const skill = availableSkills.value.find(s => s.id === id);
    return { id, name: skill ? skill.name : `Kỹ năng ${id}` };
  });

  alert(`Đã tạo ${generatedSkillIds.length} kỹ năng dựa trên mô tả sự kiện!`);
};

    
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
    
    const updateSkillBasePoints = (skillId, value) => {
      // Ensure the value is between 1 and 10
      const points = Math.min(Math.max(parseInt(value) || 1, 1), 10)
      skillBasePoints.value[skillId] = points
    }
    
    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleString('vi-VN')
    }
    
    onMounted(() => {
      fetchEvents()
      fetchSkills()
    })
    
    return {
      authStore,
      events,
      availableSkills,
      loading,
      saving,
      deleting,
      modalLoading,
      filters,
      filteredEvents,
      showCreateModal,
      showEditModal,
      showDeleteModal,
      formData,
      eventToDelete,
      generatedSkillsList,
      selectedSkillIds,
      skillBasePoints,
      validationErrors,
      fetchEvents,
      editEvent,
      saveEvent,
      confirmDelete,
      deleteEvent,
      startEvent,
      endEvent,
      closeModals,
      generateSkills,
      updateSkillBasePoints,
      getStatusBadgeClass,
      getStatusText,
      formatDateTime
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
</style>
