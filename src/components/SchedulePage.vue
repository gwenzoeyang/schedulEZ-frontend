<template>
  <div class="schedule-page">
    <div class="page-header">
      <h1>SchedulEZ</h1>
      <span class="tagline">Wellesley Cross-Registration Planner</span>
    </div>
    
    <div class="main-layout">
      <!-- Left Sidebar: Course Search -->
      <div class="left-sidebar">
        <div class="search-bar">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search courses..."
            class="search-input"
            @input="handleSearchInput"
          />
          <button 
            class="filter-btn" 
            :class="{ active: showFilters || hasActiveFilters }"
            @click="showFilters = !showFilters"
            title="Filter courses"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
        </div>
        
        <!-- Filter Panel -->
        <div v-if="showFilters" class="filter-panel">
          <div class="filter-group">
            <label>Subject</label>
            <select v-model="subjectFilter" class="filter-select">
              <option value="">All Subjects</option>
              <option v-for="subject in availableSubjects" :key="subject" :value="subject">
                {{ subject }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Days</label>
            <div class="days-filter">
              <button 
                v-for="day in filterDays" 
                :key="day.value"
                :class="['day-filter-btn', { selected: selectedFilterDays.includes(day.value) }]"
                @click="toggleFilterDay(day.value)"
              >
                {{ day.label }}
              </button>
            </div>
          </div>
          
          <div class="filter-group">
            <label>Time</label>
            <div class="time-range-filter">
              <select v-model="startTimeFilter" class="filter-select time-select">
                <option value="">Start</option>
                <option v-for="hour in timeOptions" :key="'start-' + hour.value" :value="hour.value">
                  {{ hour.label }}
                </option>
              </select>
              <span class="time-separator">to</span>
              <select v-model="endTimeFilter" class="filter-select time-select">
                <option value="">End</option>
                <option v-for="hour in timeOptions" :key="'end-' + hour.value" :value="hour.value">
                  {{ hour.label }}
                </option>
              </select>
            </div>
          </div>
          
          <button v-if="hasActiveFilters" class="clear-filters-btn" @click="clearFilters">
            Clear Filters
          </button>
        </div>
        
        <div class="courses-list">
          <div v-if="loading" class="loading">Loading courses from MongoDB...</div>
          <div v-else-if="error" class="error">
            {{ error }}
          </div>
          <div v-else-if="filteredCourses.length === 0" class="empty">
            No courses found.
          </div>
          <CourseCard
            v-for="course in filteredCourses"
            :key="course.courseID || course.course || course.code"
            :course="course"
            @course-selected="showCourseDetailsForAdd"
          />
        </div>
      </div>
      
      <!-- Center: Schedule Grid -->
      <div class="schedule-area">
        <div class="schedule-header">
          <div class="schedule-selector">
            <select 
              v-model="currentScheduleId" 
              class="schedule-dropdown"
              @change="switchSchedule"
            >
              <option 
                v-for="schedule in schedules" 
                :key="schedule.id" 
                :value="schedule.id"
              >
                {{ schedule.name }}
              </option>
              <option value="__new__">+ Add New Schedule</option>
            </select>
          </div>
          
          <div class="schedule-name-edit">
            <input 
              v-model="currentScheduleName"
              class="schedule-title-input"
              placeholder="Schedule name..."
              @blur="saveCurrentScheduleName"
              @keyup.enter="saveCurrentScheduleName"
            />
            <button 
              v-if="schedules.length > 1" 
              class="delete-schedule-btn"
              @click="deleteCurrentSchedule"
              title="Delete this schedule"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <ScheduleGrid 
          :enrolledCourses="enrolledItems" 
          @course-dropped="handleItemDrop"
          @course-clicked="handleItemClick"
        />
      </div>
      
      <!-- Right Sidebar: Bus Schedule -->
      <div class="right-sidebar">
        <BusSchedulePanel @add-trip="addBusTrip" />
      </div>
    </div>

    <!-- AI Recommendation Floating Button -->
    <AIRecommendationPanel 
      :enrolledCourses="enrolledCourses"
      @add-course="addCourseToSchedule"
      @view-course="showCourseDetailsForAdd"
    />

    <!-- Course Detail Modal -->
    <CourseDetailModal
      v-if="showModal && selectedItem && selectedItem.type !== 'bus'"
      :isOpen="showModal"
      :course="selectedItem"
      :mode="modalMode"
      @close="closeModal"
      @add-to-schedule="addCourseToSchedule"
      @delete-from-schedule="removeItemFromSchedule"
    />
    
    <!-- Bus Trip Detail Modal -->
    <div v-if="showModal && selectedItem && selectedItem.type === 'bus'" class="modal-overlay" @click="closeModal">
      <div class="modal-content bus-modal" @click.stop>
        <button class="close-button" @click="closeModal">×</button>
        
        <div class="bus-header">
          <h2>🚌 Bus Trip</h2>
          <div class="bus-badge">Exchange Bus</div>
        </div>
        
        <div class="bus-details">
          <div class="bus-route">
            <div class="route-point">
              <span class="route-label">From</span>
              <span class="route-value">{{ selectedItem.origin }}</span>
              <span class="route-time">{{ selectedItem.departureTime }}</span>
            </div>
            <div class="route-arrow">→</div>
            <div class="route-point">
              <span class="route-label">To</span>
              <span class="route-value">{{ selectedItem.destination }}</span>
              <span class="route-time">{{ selectedItem.arrivalTime }}</span>
            </div>
          </div>
          
          <div class="bus-day">
            <span class="day-label">Day:</span>
            <span class="day-value">{{ getDayName(selectedItem.day) }}</span>
          </div>
        </div>
        
        <div class="modal-actions">
          <button 
            v-if="modalMode === 'add'" 
            class="action-button primary" 
            @click="addBusTrip(selectedItem); closeModal()"
          >
            Add to Schedule
          </button>
          
          <button 
            v-if="modalMode === 'delete'" 
            class="action-button danger" 
            @click="removeItemFromSchedule(selectedItem)"
          >
            Remove from Schedule
          </button>
          
          <button class="action-button secondary" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { courseCatalogAPI } from '../services/api.js'
import CourseCard from './CourseCard.vue'
import ScheduleGrid from './ScheduleGrid.vue'
import CourseDetailModal from './CourseDetailModal.vue'
import AIRecommendationPanel from './AIRecommendationPanel.vue'
import BusSchedulePanel from './BusSchedulePanel.vue'

const searchQuery = ref('')
const courses = ref([])
const loading = ref(false)
const error = ref(null)
const searchTimeout = ref(null)

// Filter state
const showFilters = ref(false)
const subjectFilter = ref('')
const selectedFilterDays = ref([])
const startTimeFilter = ref('')
const endTimeFilter = ref('')

const filterDays = [
  { label: 'M', value: 'M' },
  { label: 'T', value: 'T' },
  { label: 'W', value: 'W' },
  { label: 'R', value: 'R' },
  { label: 'F', value: 'F' }
]

const timeOptions = [
  { label: '7am', value: 7 },
  { label: '8am', value: 8 },
  { label: '9am', value: 9 },
  { label: '10am', value: 10 },
  { label: '11am', value: 11 },
  { label: '12pm', value: 12 },
  { label: '1pm', value: 13 },
  { label: '2pm', value: 14 },
  { label: '3pm', value: 15 },
  { label: '4pm', value: 16 },
  { label: '5pm', value: 17 },
  { label: '6pm', value: 18 },
  { label: '7pm', value: 19 },
  { label: '8pm', value: 20 },
  { label: '9pm', value: 21 },
  { label: '10pm', value: 22 }
]

function toggleFilterDay(day) {
  const index = selectedFilterDays.value.indexOf(day)
  if (index > -1) {
    selectedFilterDays.value.splice(index, 1)
  } else {
    selectedFilterDays.value.push(day)
  }
}

// Multiple schedules support
const schedules = ref([])
const currentScheduleId = ref(null)

// Current schedule data (computed from active schedule)
const currentSchedule = computed(() => {
  return schedules.value.find(s => s.id === currentScheduleId.value) || null
})

const currentScheduleName = computed({
  get() {
    return currentSchedule.value?.name || ''
  },
  set(value) {
    if (currentSchedule.value) {
      currentSchedule.value.name = value
    }
  }
})

const enrolledCourses = computed({
  get() {
    return currentSchedule.value?.courses || []
  },
  set(value) {
    if (currentSchedule.value) {
      currentSchedule.value.courses = value
    }
  }
})

const busTrips = computed({
  get() {
    return currentSchedule.value?.busTrips || []
  },
  set(value) {
    if (currentSchedule.value) {
      currentSchedule.value.busTrips = value
    }
  }
})

// Modal state
const showModal = ref(false)
const selectedItem = ref(null)
const modalMode = ref('add')

// Combined list of courses and bus trips for the grid
const enrolledItems = computed(() => {
  return [...enrolledCourses.value, ...busTrips.value]
})

// Extract unique subjects from courses
const availableSubjects = computed(() => {
  const subjects = new Set()
  courses.value.forEach(course => {
    // Extract subject from courseID (e.g., "CS 101" -> "CS")
    const courseId = course.courseID || course.course || course.code || ''
    const match = courseId.match(/^([A-Za-z]+)/)
    if (match) {
      subjects.add(match[1].toUpperCase())
    }
  })
  return Array.from(subjects).sort()
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return subjectFilter.value !== '' || 
         selectedFilterDays.value.length > 0 || 
         startTimeFilter.value !== '' || 
         endTimeFilter.value !== ''
})

// Filter courses based on subject, days, and time
const filteredCourses = computed(() => {
  let result = courses.value
  
  // Filter by subject
  if (subjectFilter.value) {
    result = result.filter(course => {
      const courseId = course.courseID || course.course || course.code || ''
      return courseId.toUpperCase().startsWith(subjectFilter.value)
    })
  }
  
  // Filter by days
  if (selectedFilterDays.value.length > 0) {
    result = result.filter(course => {
      const meetingTimes = course.meetingTimes || []
      if (meetingTimes.length === 0) return false // Exclude courses without time info
      
      return meetingTimes.some(mt => {
        return selectedFilterDays.value.includes(mt.day)
      })
    })
  }
  
  // Filter by time range
  if (startTimeFilter.value !== '' || endTimeFilter.value !== '') {
    result = result.filter(course => {
      const meetingTimes = course.meetingTimes || []
      if (meetingTimes.length === 0) return false // Exclude courses without time info
      
      return meetingTimes.some(mt => {
        const startHour = mt.start || 0
        const endHour = mt.end || 24
        
        // Check if course falls within selected time range
        const filterStart = startTimeFilter.value !== '' ? startTimeFilter.value : 0
        const filterEnd = endTimeFilter.value !== '' ? endTimeFilter.value : 24
        
        // Course must start at or after filterStart AND end at or before filterEnd
        return startHour >= filterStart && endHour <= filterEnd
      })
    })
  }
  
  return result
})

// Clear all filters
function clearFilters() {
  subjectFilter.value = ''
  selectedFilterDays.value = []
  startTimeFilter.value = ''
  endTimeFilter.value = ''
}

const dayNames = {
  'M': 'Monday',
  'T': 'Tuesday',
  'W': 'Wednesday',
  'R': 'Thursday',
  'F': 'Friday'
}

function getDayName(day) {
  return dayNames[day] || day
}

// Schedule management functions
function generateScheduleId() {
  return `schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function createNewSchedule(name = null) {
  const scheduleCount = schedules.value.length + 1
  const newSchedule = {
    id: generateScheduleId(),
    name: name || `Schedule ${scheduleCount}`,
    courses: [],
    busTrips: [],
    createdAt: Date.now()
  }
  schedules.value.push(newSchedule)
  currentScheduleId.value = newSchedule.id
  saveAllSchedules()
  return newSchedule
}

function switchSchedule(event) {
  const selectedId = event.target.value
  
  if (selectedId === '__new__') {
    // Create a new schedule
    createNewSchedule()
    return
  }
  
  currentScheduleId.value = selectedId
  saveAllSchedules()
}

function saveCurrentScheduleName() {
  if (currentSchedule.value) {
    // Name is already updated via v-model, just save
    saveAllSchedules()
  }
}

function deleteCurrentSchedule() {
  if (schedules.value.length <= 1) {
    alert('You must have at least one schedule!')
    return
  }
  
  const confirmDelete = confirm(`Are you sure you want to delete "${currentSchedule.value?.name}"?`)
  if (!confirmDelete) return
  
  const index = schedules.value.findIndex(s => s.id === currentScheduleId.value)
  if (index !== -1) {
    schedules.value.splice(index, 1)
    // Switch to first remaining schedule
    currentScheduleId.value = schedules.value[0].id
    saveAllSchedules()
  }
}

function saveAllSchedules() {
  const data = {
    schedules: schedules.value,
    currentScheduleId: currentScheduleId.value
  }
  localStorage.setItem('schedulez-data', JSON.stringify(data))
}

function loadAllSchedules() {
  try {
    const saved = localStorage.getItem('schedulez-data')
    if (saved) {
      const data = JSON.parse(saved)
      if (data.schedules && data.schedules.length > 0) {
        schedules.value = data.schedules
        currentScheduleId.value = data.currentScheduleId || data.schedules[0].id
        return
      }
    }
  } catch (e) {
    console.error('Error loading schedules:', e)
  }
  
  // No saved data or error - create default schedule
  createNewSchedule('My Schedule')
}

function showCourseDetailsForAdd(course) {
  selectedItem.value = course
  modalMode.value = 'add'
  showModal.value = true
}

function handleItemClick(item) {
  selectedItem.value = item
  modalMode.value = 'delete'
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedItem.value = null
}

function getItemId(item) {
  if (!item) return ''
  if (item.type === 'bus') {
    return item.id || ''
  }
  const id = item.courseID || item.courseId || item.code || item.course || ''
  return String(id).trim()
}

function addCourseToSchedule(course) {
  if (!currentSchedule.value) return
  
  const courseId = getItemId(course)
  
  // Filter out any undefined/null entries that might have snuck in
  currentSchedule.value.courses = currentSchedule.value.courses.filter(c => c && getItemId(c))
  
  const alreadyEnrolled = currentSchedule.value.courses.some(
    c => getItemId(c) === courseId
  )
  
  if (alreadyEnrolled) {
    alert('This course is already in your schedule!')
    return
  }
  
  // Create a new array to ensure reactivity
  currentSchedule.value.courses = [...currentSchedule.value.courses, course]
  saveAllSchedules()
  closeModal()
}

function addBusTrip(trip) {
  if (!currentSchedule.value) return
  
  // Check for duplicate (same route, time, and day)
  const isDuplicate = currentSchedule.value.busTrips.some(t => 
    t.origin === trip.origin && 
    t.destination === trip.destination && 
    t.departureTime === trip.departureTime &&
    t.day === trip.day
  )
  
  if (isDuplicate) {
    return
  }
  
  // Create a unique copy with new ID to ensure reactivity
  const newTrip = {
    ...trip,
    id: `bus-${trip.day}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  currentSchedule.value.busTrips.push(newTrip)
  saveAllSchedules()
}

function removeItemFromSchedule(item) {
  if (!currentSchedule.value) return
  
  if (item.type === 'bus') {
    const index = currentSchedule.value.busTrips.findIndex(t => t.id === item.id)
    if (index !== -1) {
      currentSchedule.value.busTrips.splice(index, 1)
    }
  } else {
    const itemId = getItemId(item)
    
    // Filter out the course by ID
    const newCourses = currentSchedule.value.courses.filter(c => getItemId(c) !== itemId)
    
    // Assign the new filtered array
    currentSchedule.value.courses = newCourses
  }
  
  // Save immediately after modification
  saveAllSchedules()
  closeModal()
}

function handleItemDrop(item) {
  if (!currentSchedule.value) return
  
  if (item.type === 'bus') {
    addBusTrip(item)
  } else {
    const courseId = getItemId(item)
    const alreadyEnrolled = currentSchedule.value.courses.some(
      c => getItemId(c) === courseId
    )
    
    if (alreadyEnrolled) {
      alert('This course is already in your schedule!')
      return
    }
    
    // Create a new array to ensure reactivity
    currentSchedule.value.courses = [...currentSchedule.value.courses, item]
    saveAllSchedules()
  }
}

async function loadCourses() {
  loading.value = true
  error.value = null
  
  try {
    const response = await courseCatalogAPI.getAllCourses()
    
    if (Array.isArray(response)) {
      courses.value = response
    } else {
      error.value = 'Failed to load courses: unexpected format'
      courses.value = []
    }
    
  } catch (err) {
    error.value = `Failed to load courses: ${err.message}`
    courses.value = []
  } finally {
    loading.value = false
  }
}

async function searchCourses(query) {
  if (!query || query.trim() === '') {
    await loadCourses()
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const response = await courseCatalogAPI.searchCourses(query)
    
    if (Array.isArray(response)) {
      courses.value = response
    } else {
      courses.value = []
    }
    
  } catch (err) {
    error.value = `Search failed: ${err.message}`
    courses.value = []
  } finally {
    loading.value = false
  }
}

function handleSearchInput() {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    searchCourses(searchQuery.value)
  }, 500)
}

onMounted(() => {
  loadAllSchedules()
  loadCourses()
})
</script>

<style scoped>
.schedule-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
}

.page-header {
  background: #012169;
  padding: 0.2rem 1rem;
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-shrink: 0;
}

.page-header h1 {
  margin: 0;
  font-size: 0.95rem;
  color: white;
}

.tagline {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.7);
}

.main-layout {
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
  min-height: 0;
}

.left-sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.search-bar {
  padding: 0.25rem;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 0.4rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #333;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #012169;
  box-shadow: 0 0 0 2px rgba(1, 33, 105, 0.1);
}

.filter-btn {
  padding: 0.35rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #012169;
  color: #012169;
}

.filter-btn.active {
  background: #012169;
  border-color: #012169;
  color: white;
}

.filter-panel {
  padding: 0.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.filter-group label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #012169;
  text-transform: uppercase;
}

.filter-select {
  padding: 0.3rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #333;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #012169;
}

.days-filter {
  display: flex;
  gap: 0.25rem;
}

.day-filter-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-filter-btn:hover {
  border-color: #012169;
  color: #012169;
}

.day-filter-btn.selected {
  background: #012169;
  border-color: #012169;
  color: white;
}

.time-range-filter {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.time-select {
  flex: 1;
  min-width: 0;
}

.time-separator {
  font-size: 0.75rem;
  color: #666;
}

.clear-filters-btn {
  padding: 0.3rem 0.5rem;
  background: white;
  border: 1px solid #c0392b;
  border-radius: 4px;
  color: #c0392b;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.25rem;
}

.clear-filters-btn:hover {
  background: #c0392b;
  color: white;
}

.courses-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.loading, .empty, .error {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.error {
  color: #c0392b;
}

.schedule-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  min-width: 0;
  overflow: hidden;
  background: white;
}

.schedule-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.15rem 0.5rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.schedule-selector {
  flex-shrink: 0;
}

.schedule-dropdown {
  padding: 0.3rem 1.5rem 0.3rem 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #012169;
  background: white;
  border: 2px solid #012169;
  border-radius: 4px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23012169' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.4rem center;
}

.schedule-dropdown:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(1, 33, 105, 0.2);
}

.schedule-dropdown option {
  color: #333;
  background: white;
  padding: 0.5rem;
}

.schedule-name-edit {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.schedule-title-input {
  flex: 1;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  background: transparent;
  padding: 0.25rem;
  color: #012169;
}

.schedule-title-input:focus {
  outline: none;
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 0 2px rgba(1, 33, 105, 0.2);
}

.delete-schedule-btn {
  padding: 0.2rem 0.4rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.delete-schedule-btn:hover {
  background: #fdd;
  border-color: #c0392b;
}

.right-sidebar {
  width: 250px;
  background: white;
  border-left: 1px solid #e0e0e0;
  padding: 0;
  overflow-y: auto;
  flex-shrink: 0;
}

/* Bus Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content.bus-modal {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 450px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #999;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f5f5f5;
  color: #333;
}

.bus-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.bus-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: #012169;
}

.bus-badge {
  display: inline-block;
  background: repeating-linear-gradient(
    45deg,
    #e8eef6,
    #e8eef6 4px,
    #d0ddef 4px,
    #d0ddef 8px
  );
  color: #012169;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #012169;
}

.bus-details {
  margin-bottom: 1.5rem;
}

.bus-route {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.route-point {
  flex: 1;
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.route-label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.route-value {
  display: block;
  font-weight: 600;
  color: #012169;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.route-time {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #012169;
}

.route-arrow {
  font-size: 1.5rem;
  color: #999;
}

.bus-day {
  text-align: center;
  padding: 0.75rem;
  background: #e8eef6;
  border-radius: 6px;
}

.day-label {
  color: #666;
  margin-right: 0.5rem;
}

.day-value {
  font-weight: 600;
  color: #012169;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 2px solid #f0f0f0;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.primary {
  background: #012169;
  color: white;
}

.action-button.primary:hover {
  background: #001a4d;
}

.action-button.danger {
  background: #c0392b;
  color: white;
}

.action-button.danger:hover {
  background: #a5281b;
}

.action-button.secondary {
  background: #f0f0f0;
  color: #666;
}

.action-button.secondary:hover {
  background: #e0e0e0;
  color: #333;
}

@media (max-width: 1200px) {
  .right-sidebar {
    width: 200px;
  }
  
  .left-sidebar {
    width: 220px;
  }
}

@media (max-width: 900px) {
  .main-layout {
    flex-direction: column;
  }
  
  .left-sidebar,
  .right-sidebar {
    width: 100%;
    max-height: 250px;
  }
  
  .right-sidebar {
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
}
</style>

<style>
/* Global styles to prevent page scrolling and fill screen */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
  width: 100%;
  background: white;
}

#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>