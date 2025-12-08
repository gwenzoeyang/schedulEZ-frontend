<template>
    <!-- Floating AI Button -->
    <button class="ai-float-button" @click="openModal">
      <span class="sparkle">✨</span>
      <span class="button-text">AI Recommend</span>
    </button>
  
    <!-- AI Recommendation Modal -->
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="closeModal">×</button>
        
        <div class="modal-header">
          <h2>🤖 AI Course Recommendation</h2>
          <p class="subtitle">Fill out any preferences you'd like (all optional!)</p>
        </div>
  
        <div class="modal-body">
          <div class="form-section">
            <label class="form-label">User ID (optional)</label>
            <input 
              v-model="preferences.userId" 
              type="text" 
              class="form-input"
              placeholder="e.g., student-123"
            />
          </div>
  
          <div class="form-section">
            <label class="form-label">Major (optional)</label>
            <input 
              v-model="preferences.major" 
              type="text" 
              class="form-input"
              placeholder="e.g., Computer Science"
            />
          </div>
  
          <div class="form-section">
            <label class="form-label">Interests (optional, comma-separated)</label>
            <input 
              v-model="interestsInput" 
              type="text" 
              class="form-input"
              placeholder="e.g., AI, Machine Learning, Web Development"
            />
          </div>
  
          <div class="form-section">
            <label class="form-label">Availability (optional)</label>
            <div class="days-selector">
              <button 
                v-for="day in daysOfWeek" 
                :key="day.value"
                :class="['day-button', { selected: preferences.availability.includes(day.value) }]"
                @click="toggleDay(day.value)"
              >
                {{ day.label }}
              </button>
            </div>
          </div>
  
          <button 
            class="recommend-button"
            @click="getRecommendation"
            :disabled="loading"
          >
            {{ loading ? 'Getting Recommendation...' : '✨ Get AI Recommendation' }}
          </button>
  
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="allCoursesAdded" class="all-added-message">
            <div class="all-added-icon">🎉</div>
            <div class="all-added-text">All available courses have been added to your schedule!</div>
          </div>
  
          <div v-if="recommendation" class="recommendation-result">
            <div class="result-header">
              <h4>📚 Recommended Course</h4>
              <button class="view-details-btn" @click="viewCourseDetails">
                View Details
              </button>
            </div>
            <div class="course-info">
              <div class="course-code">{{ recommendation.courseID || recommendation.courseId || recommendation.code }}</div>
              <div class="course-title">{{ recommendation.title || recommendation.name }}</div>
              <div class="course-instructor">{{ recommendation.instructor }}</div>
            </div>
            <button class="add-button" @click="addRecommendation">
              Add to Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, defineEmits, defineProps } from 'vue'
  import { scheduleAPI } from '../services/api.js'
  
  const props = defineProps({
    enrolledCourses: {
      type: Array,
      default: () => []
    }
  })
  
  const emit = defineEmits(['add-course', 'view-course'])
  
  const isOpen = ref(false)
  const loading = ref(false)
  const error = ref(null)
  const recommendation = ref(null)
  const allCoursesAdded = ref(false)
  
  const preferences = ref({
    userId: '',
    major: '',
    availability: []
  })
  
  const interestsInput = ref('')
  
  const daysOfWeek = [
    { label: 'Mon', value: 'M' },
    { label: 'Tue', value: 'T' },
    { label: 'Wed', value: 'W' },
    { label: 'Thu', value: 'R' },
    { label: 'Fri', value: 'F' },
    { label: 'Sat', value: 'S' },
    { label: 'Sun', value: 'U' }
  ]
  
  function getItemId(item) {
    if (!item) return ''
    return item.courseID || item.courseId || item.code || item.course || ''
  }
  
  function isAlreadyEnrolled(course) {
    const courseId = getItemId(course)
    return props.enrolledCourses.some(c => getItemId(c) === courseId)
  }
  
  function openModal() {
    isOpen.value = true
    recommendation.value = null
    error.value = null
    allCoursesAdded.value = false
  }
  
  function closeModal() {
    isOpen.value = false
  }
  
  function toggleDay(day) {
    const index = preferences.value.availability.indexOf(day)
    if (index > -1) {
      preferences.value.availability.splice(index, 1)
    } else {
      preferences.value.availability.push(day)
    }
  }
  
  async function getRecommendation() {
    loading.value = true
    error.value = null
    recommendation.value = null
    allCoursesAdded.value = false
  
    try {
      const interests = interestsInput.value
        .split(',')
        .map(i => i.trim())
        .filter(Boolean)
  
      const userId = preferences.value.userId.trim() || 'default-user'
      
      // Get list of enrolled course IDs to exclude
      const enrolledIds = props.enrolledCourses.map(c => getItemId(c)).filter(Boolean)
      console.log('🤖 Enrolled course IDs to exclude:', enrolledIds)
  
      // NOTE: setAIPreferences and suggestCourse are not in the current API spec (api.md)
      // These may be custom features that the backend still supports.
      // If these methods fail, this feature will need to be disabled or the backend updated.
      const hasPreferences = preferences.value.major || interests.length > 0 || preferences.value.availability.length > 0
      
      // TODO: These methods (setAIPreferences, suggestCourse) are not in the new API spec
      // Uncomment if the backend still supports them, or implement alternative approach
      /*
      if (hasPreferences) {
        await scheduleAPI.setAIPreferences({
          userId,
          major: preferences.value.major || 'Undeclared',
          interests: interests.length > 0 ? interests : ['General'],
          availability: preferences.value.availability.length > 0 ? preferences.value.availability : ['M', 'T', 'W', 'R', 'F']
        })
      }
      
      const response = await scheduleAPI.suggestCourse({ 
        userId,
        excludeCourseIds: enrolledIds
      })
      
      if (response.success && response.suggestion) {
        recommendation.value = response.suggestion
      } else if (response.allCoursesEnrolled) {
        allCoursesAdded.value = true
      } else {
        error.value = 'No suitable course found. Try adjusting your preferences.'
      }
      */
      
      // Temporary: Show error since API methods don't exist in spec
      error.value = 'AI recommendation feature is not available in the current API specification. Please check with the backend team.'
  
    } catch (err) {
      console.error('Error getting recommendation:', err)
      // Check if the error message indicates all courses are enrolled
      if (err.message && err.message.includes('no suitable course')) {
        allCoursesAdded.value = true
      } else {
        error.value = `Failed to get recommendation: ${err.message}`
      }
    } finally {
      loading.value = false
    }
  }
  
  function addRecommendation() {
    if (recommendation.value) {
      emit('add-course', recommendation.value)
      closeModal()
      recommendation.value = null
    }
  }
  
  function viewCourseDetails() {
    if (recommendation.value) {
      emit('view-course', recommendation.value)
    }
  }
  </script>
  
  <style scoped>
  /* Wellesley Blue: #012169 */
  
  /* Floating Button - positioned to the right of the sidebar */
  .ai-float-button {
    position: fixed;
    bottom: 2rem;
    right: 20px; /* Account for 280px sidebar + spacing */
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, #012169 0%, #023e8a 100%);
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(1, 33, 105, 0.4);
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    z-index: 999;
  }
  
  .ai-float-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(1, 33, 105, 0.5);
  }
  
  .ai-float-button .sparkle {
    font-size: 1.2rem;
    animation: sparkle 1.5s ease-in-out infinite;
  }
  
  .ai-float-button .button-text {
    white-space: nowrap;
  }
  
  @keyframes sparkle {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.2) rotate(180deg); }
  }
  
  /* Modal */
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
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(1, 33, 105, 0.3);
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
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
    z-index: 1;
  }
  
  .close-button:hover {
    background: #f5f5f5;
    color: #333;
  }
  
  .modal-header {
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .modal-header h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    color: #012169;
  }
  
  .subtitle {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
  }
  
  .modal-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-label {
    font-weight: 600;
    color: #012169;
    font-size: 0.9rem;
  }
  
  .form-input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }
  
  .form-input:focus {
    outline: none;
    border-color: #012169;
  }
  
  .days-selector {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  
  .day-button {
    padding: 0.5rem 1rem;
    border: 2px solid #ddd;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    color: #012169;
    transition: all 0.2s;
  }
  
  .day-button:hover {
    border-color: #012169;
    background: #f0f4f8;
  }
  
  .day-button.selected {
    background: #e8eef6;
    color: #012169;
    border-color: #012169;
  }
  
  .recommend-button {
    padding: 1rem;
    background: linear-gradient(135deg, #012169 0%, #023e8a 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 0.5rem;
  }
  
  .recommend-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(1, 33, 105, 0.4);
  }
  
  .recommend-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .error-message {
    padding: 1rem;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 8px;
    color: #c33;
    font-size: 0.9rem;
  }

  .all-added-message {
    padding: 1.5rem;
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    border: 2px solid #4caf50;
    border-radius: 12px;
    text-align: center;
  }

  .all-added-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .all-added-text {
    color: #2e7d32;
    font-weight: 600;
    font-size: 1rem;
  }
  
  .recommendation-result {
    padding: 1.5rem;
    background: #f0f4f8;
    border: 2px solid #012169;
    border-radius: 12px;
  }
  
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .result-header h4 {
    margin: 0;
    color: #012169;
    font-size: 1.1rem;
  }
  
  .view-details-btn {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #012169;
    color: #012169;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }
  
  .view-details-btn:hover {
    background: #012169;
    color: white;
  }
  
  .course-info {
    margin-bottom: 1rem;
  }
  
  .course-code {
    font-weight: bold;
    color: #012169;
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }
  
  .course-title {
    font-size: 1rem;
    color: #2c3e50;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .course-instructor {
    font-size: 0.9rem;
    color: #666;
  }
  
  .add-button {
    width: 100%;
    padding: 0.75rem;
    background: #012169;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .add-button:hover {
    background: #001a4d;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(1, 33, 105, 0.3);
  }
  
  @media (max-width: 1200px) {
    .ai-float-button {
      right: 20px;
    }
  }
  
  @media (max-width: 900px) {
    .ai-float-button {
      bottom: 1.5rem;
      right: 1rem;
      padding: 0.75rem 1.25rem;
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 600px) {
    .ai-float-button {
      bottom: 1rem;
      right: 1rem;
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
    }
    
    .ai-float-button .button-text {
      display: none;
    }
  
    .modal-content {
      width: 95%;
      max-height: 95vh;
    }
  
    .modal-header,
    .modal-body {
      padding: 1.5rem;
    }
  }
  </style>