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

    return data
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// CourseCatalog API
export const courseCatalogAPI = {
  addCourse: (courseData) => apiRequest('/api/CourseCatalog/addCourse', courseData),
  removeCourse: (course) => apiRequest('/api/CourseCatalog/removeCourse', { course }),
  offerCourse: (course, term) => apiRequest('/api/CourseCatalog/offerCourse', { course, term }),
  unofferCourse: (course, term) => apiRequest('/api/CourseCatalog/unofferCourse', { course, term }),
  addPrerequisite: (course, prerequisite) => apiRequest('/api/CourseCatalog/addPrerequisite', { course, prerequisite }),
  removePrerequisite: (course, prerequisite) => apiRequest('/api/CourseCatalog/removePrerequisite', { course, prerequisite }),
  getCourse: (course) => apiRequest('/api/CourseCatalog/_getCourse', { course }),
  listCourses: () => apiRequest('/api/CourseCatalog/_listCourses', {}),
  listOfferedCourses: (term) => apiRequest('/api/CourseCatalog/_listOfferedCourses', { term })
}

// CrossRegTravel API
export const crossRegTravelAPI = {
  enrollInCrossRegCourse: (enrollmentData) => apiRequest('/api/CrossRegTravel/enrollInCrossRegCourse', enrollmentData),
  approveTravel: (approvalData) => apiRequest('/api/CrossRegTravel/approveTravel', approvalData),
  cancelTravelRequest: (courseData) => apiRequest('/api/CrossRegTravel/cancelTravelRequest', courseData),
  withdrawFromCrossRegCourse: (courseData) => apiRequest('/api/CrossRegTravel/withdrawFromCrossRegCourse', courseData),
  getTravelStatus: (student, course, term) => apiRequest('/api/CrossRegTravel/_getTravelStatus', { student, course, term }),
  listStudentsWithPendingTravel: () => apiRequest('/api/CrossRegTravel/_listStudentsWithPendingTravel', {})
}

// RequirementTracker API
export const requirementTrackerAPI = {
  recordCourseCompletion: (student, course) => apiRequest('/api/RequirementTracker/recordCourseCompletion', { student, course }),
  removeCourseCompletion: (student, course) => apiRequest('/api/RequirementTracker/removeCourseCompletion', { student, course }),
  defineRequirement: (requirement, requiredCourses, requiredCredits) => apiRequest('/api/RequirementTracker/defineRequirement', { 
    requirement, 
    requiredCourses, 
    requiredCredits 
  }),
  updateRequirement: (requirement, requiredCourses, requiredCredits) => apiRequest('/api/RequirementTracker/updateRequirement', { 
    requirement, 
    requiredCourses, 
    requiredCredits 
  }),
  getStudentProgress: (student) => apiRequest('/api/RequirementTracker/_getStudentProgress', { student }),
  getRequirementDetails: (requirement) => apiRequest('/api/RequirementTracker/_getRequirementDetails', { requirement })
}

// Schedule API
export const scheduleAPI = {
  assignCourse: (course, room, timeSlot) => apiRequest('/api/Schedule/assignCourse', { course, room, timeSlot }),
  unassignCourse: (course) => apiRequest('/api/Schedule/unassignCourse', { course }),
  addRoom: (room, capacity) => apiRequest('/api/Schedule/addRoom', { room, capacity }),
  removeRoom: (room) => apiRequest('/api/Schedule/removeRoom', { room }),
  addTimeSlot: (timeSlot, dayOfWeek, startTime, endTime) => apiRequest('/api/Schedule/addTimeSlot', { 
    timeSlot, 
    dayOfWeek, 
    startTime, 
    endTime 
  }),
  removeTimeSlot: (timeSlot) => apiRequest('/api/Schedule/removeTimeSlot', { timeSlot }),
  getCourseSchedule: (course) => apiRequest('/api/Schedule/_getCourseSchedule', { course }),
  getRoomAvailability: (room) => apiRequest('/api/Schedule/_getRoomAvailability', { room }),
  getTimeSlotDetails: (timeSlot) => apiRequest('/api/Schedule/_getTimeSlotDetails', { timeSlot })
}

export default {
  courseCatalog: courseCatalogAPI,
  crossRegTravel: crossRegTravelAPI,
  requirementTracker: requirementTrackerAPI,
  schedule: scheduleAPI
}

