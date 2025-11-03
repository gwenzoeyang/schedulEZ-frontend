<template>
  <div class="schedule-page">
    <div class="page-header">
      <h1>SchedulEZ</h1>
    </div>
    
    <div class="main-layout">
      <div class="left-sidebar">
        <div class="search-bar">
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Search courses..."
            class="search-input"
            @input="handleSearchInput"
          />
        </div>
        <div class="courses-list">
          <div v-if="loading" class="loading">Loading courses from MongoDB...</div>
          <div v-else-if="courses.length === 0" class="empty">
            No courses found.
          </div>
          <CourseCard
            v-for="course in courses"
            :key="course.course || course.code"
            :course="course"
            @course-selected="showCourseDetails"
          />
        </div>
      </div>
      
      <div class="schedule-area">
        <input 
          v-model="scheduleName"
          class="schedule-title-input"
          @blur="saveScheduleName"
        />
        <ScheduleGrid :enrolledCourses="enrolledCourses" @course-dropped="handleCourseDrop" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { courseCatalogAPI } from '../services/api.js'
import CourseCard from './CourseCard.vue'
import ScheduleGrid from './ScheduleGrid.vue'

const scheduleName = ref('My Schedule')
const searchQuery = ref('')
const courses = ref([])
const enrolledCourses = ref([])
const loading = ref(false)
const searchTimeout = ref(null)

function saveScheduleName() {
  localStorage.setItem('scheduleName', scheduleName.value)
}

function showCourseDetails(course) {
  console.log('Show details for:', course)
}

function handleCourseDrop(course) {
  enrolledCourses.value.push(course)
}

async function loadCourses() {
  loading.value = true
  try {
    console.log('Attempting to load courses from MongoDB via CourseCatalog/_getAllCourses')
    const response = await courseCatalogAPI.getAllCourses()
    console.log('=== RAW API RESPONSE ===')
    console.log('Full response:', response)
    console.log('Stringified:', JSON.stringify(response, null, 2))
    console.log('Data type:', typeof response)
    console.log('Is array?', Array.isArray(response))
    console.log('Length:', Array.isArray(response) ? response.length : 'N/A')
    
    // Handle the response - API returns array of objects with "course" property
    let courseArray = []
    if (Array.isArray(response)) {
      // Response format: [{ "course": "string" }, ...]
      // We need to fetch full details for each course using getCourseByCode or the course identifier
      courseArray = response
      
      // If courses are just strings, we might need to fetch details
      // For now, assume the response contains full course objects
      if (response.length > 0 && typeof response[0] === 'object' && response[0].course) {
        // Response format is [{ course: "..." }]
        // We may need to fetch full details, but let's try to use what we have
        courseArray = response.map(item => {
          // If item has a course property that's a string, we might need the full object
          // For now, assume the backend returns the full course objects
          return typeof item.course === 'string' ? { course: item.course } : item
        })
      }
    } else if (response && typeof response === 'object') {
      const keys = Object.keys(response)
      console.warn('Response is object but not array. Keys:', keys)
      
      if (keys.length === 0) {
        console.error('❌ Empty object received - backend returned Set which serialized to {}')
        courseArray = []
      } else {
        courseArray = []
      }
    } else {
      console.warn('Unexpected response format:', response)
      courseArray = []
    }
    
    courses.value = courseArray
    console.log(`Loaded ${courseArray.length} courses from API`)
    
  } catch (error) {
    console.error('Error loading courses:', error)
    courses.value = []
  } finally {
    loading.value = false
  }
}

async function searchCourses(query) {
  if (!query || query.trim() === '') {
    // If search is empty, load all courses
    await loadCourses()
    return
  }
  
  loading.value = true
  try {
    console.log('Searching courses with query:', query)
    const response = await courseCatalogAPI.searchCourses(query)
    console.log('Search response:', response)
    
    let courseArray = []
    if (Array.isArray(response)) {
      courseArray = response
    }
    
    courses.value = courseArray
    console.log(`Found ${courseArray.length} courses matching "${query}"`)
    
  } catch (error) {
    console.error('Error searching courses:', error)
    courses.value = []
  } finally {
    loading.value = false
  }
}

function handleSearchInput() {
  // Debounce search to avoid too many API calls
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    searchCourses(searchQuery.value)
  }, 500) // Wait 500ms after user stops typing
}

onMounted(() => {
  const saved = localStorage.getItem('scheduleName')
  if (saved) scheduleName.value = saved
  loadCourses()
})
</script>

<style scoped>
.schedule-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-sidebar {
  width: 350px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #42b983;
}

.courses-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.loading, .empty {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.schedule-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.schedule-title-input {
  font-size: 1.5rem;
  font-weight: bold;
  border: none;
  background: transparent;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.schedule-title-input:focus {
  outline: none;
  border-bottom: 2px solid #42b983;
}
</style>

