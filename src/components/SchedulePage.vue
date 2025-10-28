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
          />
        </div>
        <div class="courses-list">
          <div v-if="loading" class="loading">Loading courses from MongoDB...</div>
          <div v-else-if="courses.length === 0" class="empty">
            No courses loaded. Check console for API logs.
          </div>
          <CourseCard
            v-for="course in filteredCourses"
            :key="course.courseId"
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

const filteredCourses = computed(() => {
  if (!searchQuery.value) return courses.value
  const query = searchQuery.value.toLowerCase()
  return courses.value.filter(course => 
    course.courseId?.toLowerCase().includes(query) ||
    course.name?.toLowerCase().includes(query) ||
    course.subject?.toLowerCase().includes(query)
  )
})

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
    console.log('Attempting to load courses from http://localhost:8000/api/CourseCatalog/_listCourses')
    const response = await courseCatalogAPI.listCourses()
    console.log('=== RAW API RESPONSE ===')
    console.log('Full response:', JSON.stringify(response, null, 2))
    console.log('Data type:', typeof response)
    console.log('Is array?', Array.isArray(response))
    console.log('Length:', Array.isArray(response) ? response.length : 'N/A')
    
    // Handle the response - it should be an array of courses
    let courseArray = []
    if (Array.isArray(response)) {
      courseArray = response
    } else if (response && Array.isArray(response.data)) {
      courseArray = response.data
      console.log('Found courses in response.data')
    } else if (response && typeof response === 'object') {
      console.warn('Response is object but not array:', Object.keys(response))
      courseArray = []
    } else {
      console.warn('Unexpected response format:', response)
      courseArray = []
    }
    
    courses.value = courseArray
    console.log(`Loaded ${courseArray.length} courses from API`)
    
    // If empty, use mock data for testing
    if (courses.value.length === 0) {
      console.log('WARNING: No courses from API, using mock data')
      courses.value = [
        {
          courseId: 'CS101',
          name: 'Introduction to Computer Science',
          description: 'Fundamental concepts of programming and computer systems',
          credits: 3,
          subject: 'CS',
          meets: ['Monday 9:00-10:00', 'Wednesday 9:00-10:00'],
          prerequisites: []
        },
        {
          courseId: 'MATH101',
          name: 'Calculus I',
          description: 'Limits, derivatives, and integrals',
          credits: 4,
          subject: 'Math',
          meets: ['Tuesday 10:00-11:00', 'Thursday 10:00-11:00'],
          prerequisites: []
        },
        {
          courseId: 'ENG101',
          name: 'English Composition',
          description: 'Writing and communication skills',
          credits: 3,
          subject: 'English',
          meets: ['Monday 11:00-12:00', 'Wednesday 11:00-12:00', 'Friday 11:00-12:00'],
          prerequisites: []
        }
      ]
    }
  } catch (error) {
    console.error('Error loading courses:', error)
    // Use mock data on error
    console.log('Using fallback mock data due to error')
    courses.value = [
      {
        courseId: 'CS101',
        name: 'Introduction to Computer Science',
        description: 'Fundamental concepts of programming and computer systems',
        credits: 3,
        subject: 'CS',
        meets: ['Monday 9:00-10:00', 'Wednesday 9:00-10:00'],
        prerequisites: []
      },
      {
        courseId: 'MATH101',
        name: 'Calculus I',
          description: 'Limits, derivatives, and integrals',
        credits: 4,
        subject: 'Math',
        meets: ['Tuesday 10:00-11:00', 'Thursday 10:00-11:00'],
        prerequisites: []
      },
      {
        courseId: 'ENG101',
        name: 'English Composition',
        description: 'Writing and communication skills',
        credits: 3,
        subject: 'English',
        meets: ['Monday 11:00-12:00', 'Wednesday 11:00-12:00', 'Friday 11:00-12:00'],
        prerequisites: []
      }
    ]
  } finally {
    loading.value = false
  }
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

