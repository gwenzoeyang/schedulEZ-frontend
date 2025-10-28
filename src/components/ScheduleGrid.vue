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
            :key="course.courseId"
            class="course-block"
          >
            {{ course.courseId }}
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
    if (!course.meets) return false
    return course.meets.some(meet => {
      const lowerMeet = meet.toLowerCase()
      const dayMatch = lowerMeet.includes(day.toLowerCase()) || 
                       lowerMeet.includes(getFullDayName(day))
      const hourMatch = lowerMeet.includes(`${hour}:`) || 
                       lowerMeet.includes(`${formatHour(hour)}:`)
      return dayMatch && hourMatch
    })
  })
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

