import { API_BASE_URL } from '../config/api.js'

/**
 * Generic API request function
 */
async function apiRequest(endpoint, body = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    // Check if response is ok before parsing
    if (!response.ok) {
      // Try to get error message from response
      const contentType = response.headers.get('content-type')
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          // If JSON parsing fails, use status text
          errorMessage = `API request failed: ${response.status} ${response.statusText}`
        }
      } else {
        // For non-JSON responses (like HTML error pages), read as text
        try {
          const text = await response.text()
          console.error('Non-JSON error response:', text.substring(0, 200))
          errorMessage = `API endpoint not found (404). The endpoint ${endpoint} may not be implemented on the backend.`
        } catch (e) {
          // Fallback to status text
          errorMessage = `API request failed: ${response.status} ${response.statusText}`
        }
      }
      
      throw new Error(errorMessage)
    }
    
    // Check content type before parsing JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.warn('Response is not JSON:', text.substring(0, 200))
      throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`)
    }
    
    const data = await response.json()

    // Check for error in response body
    if (data.error) {
      throw new Error(data.error)
    }

    // Handle Set responses - check if this might be a serialized Set and convert to array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      // If backend returns Set, try to convert it
      if (data.constructor?.name === 'Object' && Object.keys(data).length === 0) {
        return []
      }
    }

    return data
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    // Re-throw with more context if it's a network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to connect to ${API_BASE_URL}. Is the backend server running?`)
    }
    throw error
  }
}

// CourseCatalog API - Endpoints match CourseCatalogConcept.ts methods
export const courseCatalogAPI = {
  // Get all courses (query method - has underscore prefix)
  getAllCourses: () => apiRequest('/api/CourseCatalog/_getAllCourses', {}),
  getAll: () => apiRequest('/api/CourseCatalog/_getAllCourses', {}), // Alias for backwards compatibility
  
  // Get course by courseID (query method)
  getCourseByCode: (code) => apiRequest('/api/CourseCatalog/_getCourseByCode', { code }),
  
  // Search courses with query and optional filters (query method)
  searchCourses: (query, filters = {}) => apiRequest('/api/CourseCatalog/_searchCourses', { query, filters }),
  
  // Get course prerequisites (query method)
  getCoursePrerequisites: (course) => apiRequest('/api/CourseCatalog/_getCoursePrerequisites', { course }),
  
  // Get course corequisites (query method)
  getCourseCorequisites: (course) => apiRequest('/api/CourseCatalog/_getCourseCorequisites', { course }),
  
  // Admin functions (mutation methods - no underscore)
  addCourse: (courseData) => apiRequest('/api/CourseCatalog/addCourse', courseData),
  updateCourseDetails: (courseData) => apiRequest('/api/CourseCatalog/updateCourseDetails', courseData),
  removeCourse: (course) => apiRequest('/api/CourseCatalog/removeCourse', { course }),
}

// Schedule API - Endpoints match ScheduleConcept.ts methods
export const scheduleAPI = {
  // Query methods (underscore prefix)
  getScheduleById: (schedule) => apiRequest('/api/Schedule/_getScheduleById', { schedule }),
  findSchedules: (criteria) => apiRequest('/api/Schedule/_findSchedules', criteria),
  
  // Mutation methods (no underscore)
  createSchedule: (scheduleData) => apiRequest('/api/Schedule/createSchedule', scheduleData),
  updateSchedule: (scheduleData) => apiRequest('/api/Schedule/updateSchedule', scheduleData),
  deleteSchedule: (schedule) => apiRequest('/api/Schedule/deleteSchedule', { schedule }),
  
  // Helper methods (no underscore)
  addCourse: (userId, courseID) => apiRequest('/api/Schedule/addCourse', { userId, courseID }),
  removeCourse: (userId, courseID) => apiRequest('/api/Schedule/removeCourse', { userId, courseID }),
  getUserSchedule: (userId) => apiRequest('/api/Schedule/getUserSchedule', { userId }),
  
  // AI Features (no underscore)
  setAIPreferences: (prefs) => apiRequest('/api/Schedule/setAIPreferences', prefs),
  suggestCourse: (params) => apiRequest('/api/Schedule/suggestCourse', params),
}

// CrossRegTravel API - Endpoints match CrossRegTravelConcept.ts methods
export const crossRegTravelAPI = {
  // Query methods (underscore prefix)
  getTravelOptions: (params) => apiRequest('/api/CrossRegTravel/_getTravelOptions', params),
  getBusSchedule: (params) => apiRequest('/api/CrossRegTravel/_getBusSchedule', params),
  findRoutes: (origin, destination) => apiRequest('/api/CrossRegTravel/_findRoutes', { origin, destination }),
  
  // Mutation methods (no underscore)
  submitRequest: (studentID, courseID, departureTime, returnTime, reason = '') => 
    apiRequest('/api/CrossRegTravel/submitRequest', { studentID, courseID, departureTime, returnTime, reason }),
  updateStatus: (requestID, newStatus, adminNotes = '') => 
    apiRequest('/api/CrossRegTravel/updateStatus', { requestID, newStatus, adminNotes }),
}

export default {
  courseCatalog: courseCatalogAPI,
  schedule: scheduleAPI,
  crossRegTravel: crossRegTravelAPI
}

const API_BASE = import.meta.nv.VITE_API_BASE_URL || '/api'