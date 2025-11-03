<template>
  <div 
    class="schedule-grid"
    @drop="handleDrop"
    @dragover.prevent
  >
    <div class="grid-header">
      <div class="time-col"></div>
      <div v-for="day in days" :key="day" class="day-col">{{ day }}</div>
    </div>
    
    <div class="grid-body">
      <div v-for="hour in hours" :key="hour" class="time-row">
        <div class="time-label">{{ formatHour(hour) }}</div>
        <div 
          v-for="day in days" 
          :key="`${day}-${hour}`"
          class="time-cell"
        >
          <div 
            v-for="course in getCourseAt(day, hour)" 
            :key="course.code || course.courseId || course.course"
            class="course-block"
          >
            {{ course.code || course.courseId || course.course }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  enrolledCourses: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['course-dropped'])

const days = ['M', 'T', 'W', 'Th', 'F']
const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

function formatHour(hour) {
  return hour % 12 || 12
}

function getCourseAt(day, hour) {
  return props.enrolledCourses.filter(course => {
    // New format: course.schedule is a string like "MW 9:00-10:00 Room 101"
    // Old format: course.meets is an array like ["Monday 9:00-10:00"]
    
    if (course.schedule) {
      return parseScheduleString(course.schedule, day, hour)
    } else if (course.meets && Array.isArray(course.meets)) {
      // Handle old format for backward compatibility
      return course.meets.some(meet => {
        const lowerMeet = meet.toLowerCase()
        const dayMatch = lowerMeet.includes(day.toLowerCase()) || 
                         lowerMeet.includes(getFullDayName(day))
        const hourMatch = lowerMeet.includes(`${hour}:`) || 
                         lowerMeet.includes(`${formatHour(hour)}:`)
        return dayMatch && hourMatch
      })
    }
    return false
  })
}

function parseScheduleString(schedule, day, hour) {
  if (!schedule) return false
  
  const lowerSchedule = schedule.toLowerCase()
  const dayName = getFullDayName(day).toLowerCase()
  const dayAbbrev = day.toLowerCase()
  
  // Check if day matches (could be full name or abbreviation)
  const dayMatch = lowerSchedule.includes(dayName) || 
                   lowerSchedule.includes(dayAbbrev) ||
                   (day === 'Th' && lowerSchedule.includes('thursday')) ||
                   (day === 'M' && lowerSchedule.includes('monday')) ||
                   (day === 'T' && lowerSchedule.includes('tuesday')) ||
                   (day === 'W' && lowerSchedule.includes('wednesday')) ||
                   (day === 'F' && lowerSchedule.includes('friday'))
  
  if (!dayMatch) return false
  
  // Try to parse time from schedule string
  // Formats could be: "9:00-10:00", "9am-10am", "09:00-10:00", etc.
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/,  // "9:00-10:00"
    /(\d{1,2})\s*am\s*-\s*(\d{1,2})\s*am/i,        // "9am-10am"
    /(\d{1,2})\s*pm\s*-\s*(\d{1,2})\s*pm/i,        // "9pm-10pm"
  ]
  
  for (const pattern of timePatterns) {
    const match = schedule.match(pattern)
    if (match) {
      let startHour = parseInt(match[1])
      const startMin = parseInt(match[2] || 0)
      
      // Handle AM/PM
      if (pattern.toString().includes('pm') && match[0].toLowerCase().includes('pm')) {
        if (startHour < 12) startHour += 12
      }
      if (pattern.toString().includes('am') && match[0].toLowerCase().includes('am')) {
        if (startHour === 12) startHour = 0
      }
      
      // Check if the hour matches (within the time range)
      if (startHour === hour || (startHour <= hour && hour < startHour + 1)) {
        return true
      }
    }
  }
  
  // Fallback: check if hour number appears in schedule string
  if (lowerSchedule.includes(`${hour}:`) || lowerSchedule.includes(`${formatHour(hour)}:`)) {
    return true
  }
  
  return false
}

function getFullDayName(abbrev) {
  const map = {
    'M': 'monday',
    'T': 'tuesday', 
    'W': 'wednesday',
    'Th': 'thursday',
    'F': 'friday'
  }
  return map[abbrev] || ''
}

function handleDrop(e) {
  e.preventDefault()
  try {
    const courseData = JSON.parse(e.dataTransfer.getData('application/json'))
    emit('course-dropped', courseData)
  } catch (error) {
    console.error('Error handling drop:', error)
  }
}
</script>

<style scoped>
.schedule-grid {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  overflow: auto;
}

.grid-header {
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
  border-bottom: 2px solid #ccc;
  margin-bottom: 0;
}

.day-col {
  text-align: center;
  font-weight: bold;
  padding: 0.5rem;
  border-right: 1px dotted #ccc;
  color: #666;
}

.grid-body {
  display: flex;
  flex-direction: column;
}

.time-row {
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
}

.time-label {
  font-size: 0.9rem;
  color: #999;
  text-align: right;
  padding: 0.5rem;
  border-right: 2px solid #ccc;
}

.time-cell {
  min-height: 60px;
  border-left: 1px dotted #ccc;
  border-top: 1px dotted #ccc;
  position: relative;
  padding: 0.25rem;
}

.time-cell:last-child {
  border-right: 1px dotted #ccc;
}

.time-row:last-child .time-cell {
  border-bottom: 1px dotted #ccc;
}

.course-block {
  background: #42b983;
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
}
</style>

