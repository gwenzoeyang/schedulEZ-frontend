import { API_BASE_URL } from '../config/api.js'

/**
 * Generic API request function
 */
async function apiRequest(endpoint, body = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    console.log(`Making API request to: ${url}`, body)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    console.log(`Response status: ${response.status}`)
    
    const data = await response.json()
    console.log(`Response data:`, data)

    if (!response.ok || data.error) {
      throw new Error(data.error || `API request failed: ${response.statusText}`)
    }

    // Handle Set responses - check if this might be a serialized Set and convert to array
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      console.log('Response is object, checking for Set-like structure')
      // If backend returns Set, try to convert it
      if (data.constructor?.name === 'Object' && Object.keys(data).length === 0) {
        console.warn('Received empty object - might be a Set that was serialized incorrectly')
        return []
      }
    }

    return data
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// CourseCatalog API - Updated to match new API spec
export const courseCatalogAPI = {
  addCourse: (courseData) => apiRequest('/api/CourseCatalog/addCourse', courseData),
  updateCourseDetails: (courseData) => apiRequest('/api/CourseCatalog/updateCourseDetails', courseData),
  removeCourse: (course) => apiRequest('/api/CourseCatalog/removeCourse', { course }),
  getAllCourses: () => apiRequest('/api/CourseCatalog/_getAllCourses', {}),
  getCourseByCode: (code) => apiRequest('/api/CourseCatalog/_getCourseByCode', { code }),
  searchCourses: (query) => apiRequest('/api/CourseCatalog/_searchCourses', { query }),
  getCoursePrerequisites: (course) => apiRequest('/api/CourseCatalog/_getCoursePrerequisites', { course }),
  getCourseCorequisites: (course) => apiRequest('/api/CourseCatalog/_getCourseCorequisites', { course })
}

// Schedule API - Updated to match new API spec
export const scheduleAPI = {
  createSchedule: (scheduleData) => apiRequest('/api/Schedule/createSchedule', scheduleData),
  updateSchedule: (scheduleData) => apiRequest('/api/Schedule/updateSchedule', scheduleData),
  deleteSchedule: (schedule) => apiRequest('/api/Schedule/deleteSchedule', { schedule }),
  getScheduleById: (schedule) => apiRequest('/api/Schedule/_getScheduleById', { schedule }),
  findSchedules: (criteria) => apiRequest('/api/Schedule/_findSchedules', criteria)
}

// CrossRegTravel API - Updated to match new API spec
export const crossRegTravelAPI = {
  requestTravel: (travelData) => apiRequest('/api/CrossRegTravel/requestTravel', travelData),
  approveTravel: (requestId) => apiRequest('/api/CrossRegTravel/approveTravel', { requestId }),
  denyTravel: (requestId, reason) => apiRequest('/api/CrossRegTravel/denyTravel', { requestId, reason }),
  cancelTravel: (requestId) => apiRequest('/api/CrossRegTravel/cancelTravel', { requestId }),
  getTravelRequestStatus: (requestId) => apiRequest('/api/CrossRegTravel/_getTravelRequestStatus', { requestId }),
  getStudentTravelRequests: (student) => apiRequest('/api/CrossRegTravel/_getStudentTravelRequests', { student }),
  getCourseTravelRequests: (course) => apiRequest('/api/CrossRegTravel/_getCourseTravelRequests', { course })
}

export default {
  courseCatalog: courseCatalogAPI,
  schedule: scheduleAPI,
  crossRegTravel: crossRegTravelAPI
}

