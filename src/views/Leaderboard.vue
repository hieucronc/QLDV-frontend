<template>
  <div class="leaderboard">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">Bảng Xếp hạng</h2>
      <div class="d-flex align-items-center gap-3">
        <div class="btn-group" role="group">
          <input
            type="radio"
            class="btn-check"
            name="rankingType"
            id="memberRanking"
            autocomplete="off"
            :checked="rankingType === 'member'"
            @change="rankingType = 'member'"
          />
          <label class="btn btn-outline-primary" for="memberRanking"
            >Đoàn viên</label
          >

          <input
            type="radio"
            class="btn-check"
            name="rankingType"
            id="classRanking"
            autocomplete="off"
            :checked="rankingType === 'class'"
            @change="rankingType = 'class'"
          />
          <label class="btn btn-outline-primary" for="classRanking">Lớp</label>
        </div>

        <div v-if="rankingType === 'member'" class="d-flex align-items-center">
          <label for="classFilter" class="me-2">Lọc theo lớp:</label>
          <select
            id="classFilter"
            class="form-select form-select-sm"
            v-model="classFilter"
            @change="onClassFilterChange"
          >
            <option value="">Tất cả</option>
            <option v-for="cls in availableClasses" :key="cls" :value="cls">
              {{ cls }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Leaderboard Table -->
    <div v-else>
      <div
        v-if="rankingType === 'class' && classRankingsLoading"
        class="text-center my-5"
      >
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 text-muted">Đang tính toán xếp hạng lớp...</p>
      </div>

      <div v-else-if="displayData.length === 0" class="text-center my-5">
        <p class="text-muted">Chưa có dữ liệu xếp hạng</p>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <!-- Note for class ranking -->
          <div
            v-if="rankingType === 'class'"
            class="alert alert-secondary mb-4 small"
          >
            <p class="mb-0 text-muted">
              Các lớp được xếp hạng dựa trên
              <strong>điểm trung bình</strong> của tất cả thành viên trong lớp.
            </p>
          </div>

          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="text-center">#</th>
                  <th scope="col">
                    {{ rankingType === "class" ? "Lớp" : "Đoàn viên" }}
                  </th>
                  <th scope="col" v-if="rankingType === 'member'">Lớp</th>
                  <th scope="col">
                    {{ rankingType === "class" ? "Số thành viên" : "Email" }}
                  </th>
                  <th
                    scope="col"
                    class="text-center"
                    v-if="rankingType === 'class'"
                  >
                    Tổng điểm lớp
                  </th>

                  <th scope="col" class="text-center">
                    {{
                      rankingType === "class" ? "Điểm trung bình" : "Tổng điểm"
                    }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in displayData" :key="item.id">
                  <td class="text-center">
                    <span v-if="index === 0" class="leaderboard-rank-1"
                      >🥇</span
                    >
                    <span v-else-if="index === 1" class="leaderboard-rank-2"
                      >🥈</span
                    >
                    <span v-else-if="index === 2" class="leaderboard-rank-3"
                      >🥉</span
                    >
                    <span v-else class="text-muted">{{ index + 1 }}</span>
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <img
                        v-if="rankingType === 'member'"
                        :data-src="
                          getAvatarUrl(item.avatar_url) ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            item.full_name
                          )}&background=007bff&color=fff&size=40`
                        "
                        class="avatar me-3 lazy-avatar"
                        :alt="item.full_name"
                        @error="handleAvatarError"
                        loading="lazy"
                        decoding="async"
                      />
                      <div class="fw-bold">{{ item.full_name }}</div>
                    </div>
                  </td>
                  <td v-if="rankingType === 'member'">
                    <span class="badge bg-secondary">{{ item.class }}</span>
                  </td>
                  <td>
                    <span class="text-muted">{{ item.email }}</span>
                  </td>
                  <td class="text-center" v-if="rankingType === 'class'">
                    <span class="fw-bold text-primary">{{
                      item.total_score
                    }}</span>
                  </td>
                  <td class="text-center">
                    <span class="fw-bold text-primary">{{
                      getDisplayScore(item)
                    }}</span>
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
import { ref, onMounted, computed, watch, onBeforeUnmount } from "vue";
import memberService from "../services/memberService";
import { API_BASE_URL } from "@/config/api.js";

export default {
  name: "LeaderboardPage",
  setup() {
    const members = ref([]);
    const loading = ref(true);
    const classFilter = ref("");
    const availableClasses = ref([]);
    const rankingType = ref("member"); // 'member' or 'class'
    const classRankings = ref([]); // Store class rankings separately
    const classRankingsLoading = ref(false); // Loading state for class rankings

    const fetchMembers = async () => {
      try {
        loading.value = true;
        const data = await memberService.getMembers();
        // Sort by total_score descending
        members.value = data.sort((a, b) => b.total_score - a.total_score);

        // Extract unique classes for the filter dropdown
        const classes = [
          ...new Set(data.map((member) => member.class).filter(Boolean)),
        ];
        availableClasses.value = classes.sort();
      } catch (error) {
        // Handle error silently
      } finally {
        loading.value = false;
      }
    };

    // Calculate class rankings efficiently
    const calculateClassRankings = async () => {
      if (rankingType.value !== "class" || classRankings.value.length > 0)
        return;

      classRankingsLoading.value = true;

      // Use setTimeout with 0 delay to defer execution to next event loop
      // This prevents blocking the UI thread
      setTimeout(() => {
        const classScores = {};

        // Calculate total scores and member counts for each class
        // Use a for loop for better performance than forEach
        for (let i = 0; i < members.value.length; i++) {
          const member = members.value[i];
          if (member.class) {
            if (!classScores[member.class]) {
              classScores[member.class] = {
                class: member.class,
                total_score: 0,
                member_count: 0,
              };
            }
            classScores[member.class].total_score += member.total_score;
            classScores[member.class].member_count += 1;
          }
        }

        // Convert to array and sort by average score descending
        const classArray = Object.values(classScores);
        
        // Use a more efficient sorting approach
        classArray.sort((a, b) => {
          const avgA = a.member_count > 0 ? a.total_score / a.member_count : 0;
          const avgB = b.member_count > 0 ? b.total_score / b.member_count : 0;
          return avgB - avgA;
        });

        // Map to final format
        const rankings = classArray.map((cls) => ({
          ...cls,
          id: cls.class,
          full_name: `Lớp ${cls.class}`,
          email: `${cls.member_count} thành viên`,
          avatar_url: null,
          average_score:
            cls.member_count > 0 ? cls.total_score / cls.member_count : 0,
        }));

        classRankings.value = rankings;
        classRankingsLoading.value = false;
      }, 0);
    };

    // Watch for ranking type changes to calculate class rankings when needed
    // and reinitialize avatar loading when switching back to member view
    watch(rankingType, (newType) => {
      if (newType === "class" && classRankings.value.length === 0) {
        calculateClassRankings();
      } else if (newType === "member") {
        // Reinitialize avatar loading when switching back to member view
        setTimeout(() => {
          initLazyLoading();
        }, 100);
      }
    });

    // Use computed property for display data
    const displayData = computed(() => {
      if (rankingType.value === "class") {
        return classRankings.value;
      } else {
        // Member ranking with class filter
        if (!classFilter.value) {
          return members.value;
        }
        return members.value.filter(
          (member) => member.class === classFilter.value
        );
      }
    });

    const getAvatarUrl = (avatarUrl) => {
      if (!avatarUrl) return null;
      // Check if it's a filename (not a full URL)
      if (!avatarUrl.startsWith("http")) {
        // Construct full URL using API base URL
        return `${API_BASE_URL.replace("/api", "")}/avatars/${avatarUrl}`;
      }
      // If it's already a full URL, use it as is (backward compatibility)
      return avatarUrl;
    };

    // Handle class filter change and reinitialize avatar loading
    const onClassFilterChange = () => {
      // Reinitialize avatar loading when class filter changes
      setTimeout(() => {
        initLazyLoading();
      }, 50);
    };

    const getDisplayScore = (item) => {
      if (rankingType.value === "class") {
        return item.average_score ? item.average_score.toFixed(1) : 0;
      } else {
        return item.total_score;
      }
    };

    // Handle avatar loading error
    const handleAvatarError = (event) => {
      event.target.src = `https://ui-avatars.com/api/?name=User&background=007bff&color=fff&size=40`;
    };

    // Initialize lazy loading for avatars with optimized settings
    const initLazyLoading = () => {
      // Clear any existing observers
      if (window.leaderboardImageObserver) {
        window.leaderboardImageObserver.disconnect();
      }

      // Create new observer with optimized settings
      window.leaderboardImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            // Use requestIdleCallback if available for better performance
            if (window.requestIdleCallback) {
              window.requestIdleCallback(() => {
                img.src = img.dataset.src;
                img.classList.remove('lazy-avatar');
                observer.unobserve(img);
              }, { timeout: 500 });
            } else {
              // Fallback to setTimeout
              setTimeout(() => {
                img.src = img.dataset.src;
                img.classList.remove('lazy-avatar');
                observer.unobserve(img);
              }, 0);
            }
          }
        });
      }, {
        // Reduce root margin to only load images when they're close to viewport
        rootMargin: '20px',
        // Set threshold to 0.5 to load images when they're half visible
        threshold: 0.5
      });

      // Observe all lazy avatars with a delay to ensure DOM is ready
      setTimeout(() => {
        const lazyAvatars = document.querySelectorAll('.lazy-avatar');
        lazyAvatars.forEach(avatar => window.leaderboardImageObserver.observe(avatar));
      }, 50);
    };

    onMounted(() => {
      fetchMembers();
      
      // Initialize lazy loading after a short delay to ensure DOM is ready
      setTimeout(() => {
        initLazyLoading();
      }, 100);
    });

    // Clean up the observer when component is unmounted
    onBeforeUnmount(() => {
      if (window.leaderboardImageObserver) {
        window.leaderboardImageObserver.disconnect();
        window.leaderboardImageObserver = null;
      }
    });

    return {
      members,
      loading,
      classFilter,
      availableClasses,
      rankingType,
      classRankingsLoading,
      displayData,
      getAvatarUrl,
      getDisplayScore,
      handleAvatarError,
      onClassFilterChange,
    };
  },
};
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

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-select-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

/* Lazy loading styles */
.lazy-avatar {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  /* Add will-change property to optimize rendering */
  will-change: transform;
}

/* Optimize avatar rendering */
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  /* Optimize rendering performance */
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
}

/* Add simple hover effect back for better UX, but keep it minimal */
.table tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}
</style>
