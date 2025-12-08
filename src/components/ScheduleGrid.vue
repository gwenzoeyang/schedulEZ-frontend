<template>
  <div 
    class="schedule-grid"
    @drop.prevent="handleDrop"
    @dragover.prevent
    @dragenter.prevent
  >
    <div class="grid-header">
      <div class="time-col">Time</div>
      <div v-for="day in days" :key="day.abbrev" class="day-col">
        {{ day.full }}
      </div>
    </div>
    
    <div class="grid-body">
      <div v-for="hour in hours" :key="hour" class="time-row">
        <div class="time-label">{{ formatHour(hour) }}</div>
        <div 
          v-for="day in days" 
          :key="`${day.abbrev}-${hour}`"
          class="time-cell"
          :data-day="day.abbrev"
          :data-hour="hour"
        >
          <div 
            v-for="(item, index) in getItemsStartingAt(day.abbrev, hour)" 
            :key="item.id || getItemId(item) + '-' + index"
            :class="['schedule-block', { 'bus-block': item.type === 'bus' }]"
            :style="getItemStyle(item, day.abbrev, hour, index, getOverlapCount(day.abbrev, hour))"
            :title="getItemTooltip(item)"
            @click="handleItemClick(item)"
          >
            <div v-if="item.type === 'bus'" class="bus-icon">🚌</div>
            <div class="block-code">{{ getDisplayCode(item) }}</div>
            <div class="block-name">{{ truncate(getDisplayName(item)) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="floatingItems.length > 0" class="floating-items">
      <h4>📌 Items (No Time Set)</h4>
      <div class="floating-list">
        <div 
          v-for="item in floatingItems" 
          :key="item.id || getItemId(item)"
          :class="['floating-item', { 'bus-item': item.type === 'bus' }]"
          :style="getFloatingItemStyle(item)"
          @click="handleItemClick(item)"
        >
          <div class="block-code">{{ getDisplayCode(item) }}</div>
          <div class="block-name">{{ item.title || item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  enrolledCourses: {
    type: Array,
    default: () => []
  }
})

// Pastel color palette for courses - soft fairy-like colors
const pastelColors = [
  { bg: '#E8B7CA', border: '#D8A0B5', hover: '#DDA8BC' }, // Soft Rose
  { bg: '#ADE1EF', border: '#8FCFDF', hover: '#9DD8E8' }, // Sky Blue
  { bg: '#D2CCF2', border: '#BEB9E2', hover: '#C5C0EA' }, // Soft Lavender
  { bg: '#B2EAD3', border: '#96DCC0', hover: '#A4E3CB' }, // Mint Green
  { bg: '#F5E29E', border: '#E8D488', hover: '#F0DB90' }, // Soft Yellow
  { bg: '#C8EBEF', border: '#B0DDE2', hover: '#BCE4E8' }, // Pale Cyan
  { bg: '#EDBDD5', border: '#DFA8C3', hover: '#E5B2CC' }, // Rose Pink
  { bg: '#DFCFF3', border: '#CFBCE6', hover: '#D7C5EC' }, // Light Purple
  { bg: '#A9E8E8', border: '#8FD8D8', hover: '#9CE0E0' }, // Soft Cyan
  { bg: '#C6EAEE', border: '#B0DCE2', hover: '#BBE3E8' }, // Light Teal
  { bg: '#C0F3EA', border: '#A5E8DC', hover: '#B2EDE3' }, // Seafoam
  { bg: '#F5F4D6', border: '#E8E7C0', hover: '#EEEDCB' }, // Cream
]

// Store persistent color assignments (survives reactivity updates)
const colorAssignments = new Map()

// Assign colors to courses randomly (excluding bus trips)
const courseColorMap = computed(() => {
  const colorMap = new Map()
  const usedColorIndices = new Set()
  
  // First, keep existing assignments that are still in enrolledCourses
  const currentCourseIds = new Set(
    props.enrolledCourses
      .filter(item => item.type !== 'bus')
      .map(item => getItemId(item))
  )
  
  // Remove assignments for courses no longer enrolled
  for (const [courseId] of colorAssignments) {
    if (!currentCourseIds.has(courseId)) {
      colorAssignments.delete(courseId)
    }
  }
  
  // Track which colors are currently in use
  for (const [, colorIndex] of colorAssignments) {
    usedColorIndices.add(colorIndex)
  }
  
  // Assign colors to courses
  props.enrolledCourses.forEach(item => {
    if (item.type !== 'bus') {
      const courseId = getItemId(item)
      
      // Check if this course already has a color
      if (colorAssignments.has(courseId)) {
        const colorIndex = colorAssignments.get(courseId)
        colorMap.set(courseId, pastelColors[colorIndex])
      } else {
        // Find available colors (not currently in use)
        const availableIndices = []
        for (let i = 0; i < pastelColors.length; i++) {
          if (!usedColorIndices.has(i)) {
            availableIndices.push(i)
          }
        }
        
        // Pick a random available color, or any random if all used
        let randomIndex
        if (availableIndices.length > 0) {
          randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
        } else {
          // All colors used, pick any random one
          randomIndex = Math.floor(Math.random() * pastelColors.length)
        }
        
        colorAssignments.set(courseId, randomIndex)
        usedColorIndices.add(randomIndex)
        colorMap.set(courseId, pastelColors[randomIndex])
      }
    }
  })
  
  return colorMap
})

// Get color for a specific course
function getCourseColor(item) {
  if (item.type === 'bus') return null
  const courseId = getItemId(item)
  return courseColorMap.value.get(courseId) || pastelColors[0]
}

const emit = defineEmits(['course-dropped', 'course-clicked'])

const days = [
  { abbrev: 'M', full: 'Monday' },
  { abbrev: 'T', full: 'Tuesday' },
  { abbrev: 'W', full: 'Wednesday' },
  { abbrev: 'R', full: 'Thursday' },
  { abbrev: 'F', full: 'Friday' }
]

const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]

function getItemId(item) {
  return item.id || item.courseID || item.courseId || item.code || item.course || 'Unknown'
}

function getDisplayCode(item) {
  if (item.type === 'bus') {
    return item.departureTime
  }
  return item.courseID || item.courseId || item.code || item.course || 'Unknown'
}

function getDisplayName(item) {
  if (item.type === 'bus') {
    return item.title || `${item.origin} → ${item.destination}`
  }
  return item.title || item.name || ''
}

function getItemTooltip(item) {
  if (item.type === 'bus') {
    return `Bus: ${item.origin} → ${item.destination}\n${item.departureTime} - ${item.arrivalTime}`
  }
  return `${item.title || item.name}\n${item.instructor || ''}`
}

function formatHour(hour) {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

function truncate(text, length = 16) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const scheduledItems = computed(() => {
  return props.enrolledCourses.filter(item => {
    return item.meetingTimes && 
           Array.isArray(item.meetingTimes) && 
           item.meetingTimes.length > 0
  })
})

const floatingItems = computed(() => {
  return props.enrolledCourses.filter(item => {
    return !item.meetingTimes || 
           !Array.isArray(item.meetingTimes) || 
           item.meetingTimes.length === 0
  })
})

function parseTime(timeStr) {
  if (!timeStr) return null
  
  // Try 24-hour format first: "14:30"
  let match = timeStr.match(/^(\d{1,2}):(\d{2})$/)
  if (match) {
    return {
      hour: parseInt(match[1]),
      minute: parseInt(match[2])
    }
  }
  
  // Try 12-hour format with AM/PM: "9:55 AM" or "2:20 PM"
  match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (match) {
    let hour = parseInt(match[1])
    const minute = parseInt(match[2])
    const period = match[3].toUpperCase()
    
    // Convert to 24-hour format
    if (period === 'PM' && hour !== 12) {
      hour += 12
    } else if (period === 'AM' && hour === 12) {
      hour = 0
    }
    
    return { hour, minute }
  }
  
  return null
}

function getMeetingTimeForDay(item, day) {
  if (!item.meetingTimes || !Array.isArray(item.meetingTimes)) {
    return null
  }
  return item.meetingTimes.find(mt => mt.day === day)
}

function getItemsAtHour(day, hour) {
  return scheduledItems.value.filter(item => {
    const mt = getMeetingTimeForDay(item, day)
    if (!mt) return false
    
    const startTime = parseTime(mt.start)
    const endTime = parseTime(mt.end)
    if (!startTime || !endTime) return false
    
    const startMinutes = startTime.hour * 60 + startTime.minute
    const endMinutes = endTime.hour * 60 + endTime.minute
    const hourStart = hour * 60
    const hourEnd = (hour + 1) * 60
    
    return startMinutes < hourEnd && endMinutes > hourStart
  })
}

function getItemsStartingAt(day, hour) {
  return scheduledItems.value.filter(item => {
    const mt = getMeetingTimeForDay(item, day)
    if (!mt) return false
    
    const startTime = parseTime(mt.start)
    if (!startTime) return false
    
    return startTime.hour === hour
  })
}

function getOverlapCount(day, hour) {
  const itemsStartingHere = getItemsStartingAt(day, hour)
  let maxOverlap = itemsStartingHere.length
  
  for (const item of itemsStartingHere) {
    const mt = getMeetingTimeForDay(item, day)
    if (!mt) continue
    
    const startTime = parseTime(mt.start)
    const endTime = parseTime(mt.end)
    if (!startTime || !endTime) continue
    
    for (let h = startTime.hour; h < endTime.hour + 1; h++) {
      const overlapping = getItemsAtHour(day, h)
      if (overlapping.length > maxOverlap) {
        maxOverlap = overlapping.length
      }
    }
  }
  
  return maxOverlap
}

function getOverlapIndex(item, day) {
  const mt = getMeetingTimeForDay(item, day)
  if (!mt) return 0
  
  const startTime = parseTime(mt.start)
  if (!startTime) return 0
  
  const endTime = parseTime(mt.end)
  if (!endTime) return 0
  
  const overlappingItems = scheduledItems.value.filter(other => {
    const otherMt = getMeetingTimeForDay(other, day)
    if (!otherMt) return false
    
    const otherStart = parseTime(otherMt.start)
    const otherEnd = parseTime(otherMt.end)
    if (!otherStart || !otherEnd) return false
    
    const startMinutes = startTime.hour * 60 + startTime.minute
    const endMinutes = endTime.hour * 60 + endTime.minute
    const otherStartMinutes = otherStart.hour * 60 + otherStart.minute
    const otherEndMinutes = otherEnd.hour * 60 + otherEnd.minute
    
    return startMinutes < otherEndMinutes && endMinutes > otherStartMinutes
  })
  
  overlappingItems.sort((a, b) => getItemId(a).localeCompare(getItemId(b)))
  
  return overlappingItems.findIndex(c => getItemId(c) === getItemId(item))
}

function getItemStyle(item, day, hour, indexInCell, overlapCount) {
  const mt = getMeetingTimeForDay(item, day)
  if (!mt) return {}
  
  const startTime = parseTime(mt.start)
  const endTime = parseTime(mt.end)
  
  if (!startTime || !endTime) return {}
  
  const startMinutes = startTime.hour * 60 + startTime.minute
  const endMinutes = endTime.hour * 60 + endTime.minute
  const durationMinutes = endMinutes - startMinutes
  const durationHours = durationMinutes / 60
  
  const topOffset = (startTime.minute / 60) * 45
  const height = Math.max(durationHours * 45, 22)
  
  const overlapIndex = getOverlapIndex(item, day)
  const totalOverlapping = Math.max(overlapCount, getOverlappingCount(item, day))
  
  const widthPercent = 100 / totalOverlapping
  const leftPercent = overlapIndex * widthPercent
  
  // Get pastel color for this course
  const color = getCourseColor(item)
  
  const style = {
    position: 'absolute',
    top: `${topOffset}px`,
    height: `${height}px`,
    left: `calc(${leftPercent}% + 1px)`,
    width: `calc(${widthPercent}% - 2px)`,
    zIndex: 5 + overlapIndex
  }
  
  // Apply pastel colors for courses (not bus trips)
  if (color && item.type !== 'bus') {
    style.backgroundColor = color.bg
    style.borderColor = color.border
    style['--hover-bg'] = color.hover
  }
  
  return style
}

function getFloatingItemStyle(item) {
  if (item.type === 'bus') return {}
  
  const color = getCourseColor(item)
  if (!color) return {}
  
  return {
    backgroundColor: color.bg,
    borderColor: color.border,
    '--hover-bg': color.hover
  }
}

function getOverlappingCount(item, day) {
  const mt = getMeetingTimeForDay(item, day)
  if (!mt) return 1
  
  const startTime = parseTime(mt.start)
  const endTime = parseTime(mt.end)
  if (!startTime || !endTime) return 1
  
  const startMinutes = startTime.hour * 60 + startTime.minute
  const endMinutes = endTime.hour * 60 + endTime.minute
  
  const overlapping = scheduledItems.value.filter(other => {
    const otherMt = getMeetingTimeForDay(other, day)
    if (!otherMt) return false
    
    const otherStart = parseTime(otherMt.start)
    const otherEnd = parseTime(otherMt.end)
    if (!otherStart || !otherEnd) return false
    
    const otherStartMinutes = otherStart.hour * 60 + otherStart.minute
    const otherEndMinutes = otherEnd.hour * 60 + otherEnd.minute
    
    return startMinutes < otherEndMinutes && endMinutes > otherStartMinutes
  })
  
  return overlapping.length
}

function handleDrop(e) {
  // Try to get data from dataTransfer
  let rawData = e.dataTransfer.getData('application/json')
  if (!rawData) {
    rawData = e.dataTransfer.getData('text/plain')
  }
  if (!rawData) {
    rawData = e.dataTransfer.getData('text')
  }
  
  if (!rawData) {
    return
  }
  
  try {
    const data = JSON.parse(rawData)
    
    // Check if it's an array of bus trips
    if (Array.isArray(data)) {
      for (const item of data) {
        emit('course-dropped', item)
      }
    } else {
      // Single item (course or single bus trip)
      emit('course-dropped', data)
    }
  } catch (error) {
    console.error('Error parsing drop data:', error)
  }
}

function handleItemClick(item) {
  emit('course-clicked', item)
}
</script>

<style scoped>
.schedule-grid {
  flex: 1;
  background: white;
  border: none;
  overflow: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.grid-header {
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
  background: #012169;
  border-bottom: 2px solid #012169;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.time-col,
.day-col {
  padding: 0.25rem;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.75rem;
}

.day-col:last-child {
  border-right: none;
}

.grid-body {
  flex: 1;
}

.time-row {
  display: grid;
  grid-template-columns: 60px repeat(5, 1fr);
  min-height: 45px;
  border-bottom: 1px solid #eee;
}

.time-row:last-child {
  border-bottom: none;
}

.time-label {
  padding: 0.1rem;
  font-size: 0.65rem;
  color: #012169;
  background: white;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  border-right: 1px solid #e0e0e0;
  font-weight: 500;
}

.time-cell {
  border-right: 1px solid #eee;
  position: relative;
  min-height: 45px;
}

.time-cell:last-child {
  border-right: none;
}

.time-cell:hover {
  background: #f8fafc;
}

/* Course blocks - pastel colors applied via inline styles */
.schedule-block {
  background: #E8B7CA; /* Default soft rose, overridden by inline style */
  border: 2px solid #D8A0B5;
  border-radius: 4px;
  padding: 0.3rem;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.schedule-block:hover {
  background: var(--hover-bg, #DDA8BC);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  z-index: 20 !important;
  transform: scale(1.02);
}

.schedule-block .block-code {
  font-weight: 700;
  font-size: 0.75rem;
  color: #333;
  margin-bottom: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.schedule-block .block-name {
  font-size: 0.65rem;
  color: #555;
  line-height: 1.2;
  flex: 1;
  overflow: hidden;
}

/* Bus blocks - striped light blue with dark blue border */
.schedule-block.bus-block {
  background: repeating-linear-gradient(
    45deg,
    #e8eef6,
    #e8eef6 6px,
    #d0ddef 6px,
    #d0ddef 12px
  );
  border: 2px solid #012169;
  border-radius: 4px;
}

.schedule-block.bus-block:hover {
  background: repeating-linear-gradient(
    45deg,
    #d0ddef,
    #d0ddef 6px,
    #b8c9e0 6px,
    #b8c9e0 12px
  );
  box-shadow: 0 2px 8px rgba(1, 33, 105, 0.3);
}

.schedule-block.bus-block .block-code {
  color: #012169;
}

.schedule-block.bus-block .block-name {
  color: #012169;
}

.bus-icon {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 0.8rem;
  line-height: 1;
}

/* Floating items */
.floating-items {
  border-top: 2px solid #e0e0e0;
  padding: 0.5rem;
  background: white;
}

.floating-items h4 {
  margin: 0 0 0.5rem 0;
  color: #012169;
  font-size: 0.85rem;
}

.floating-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.floating-item {
  background: #E8B7CA; /* Default soft rose, overridden by inline style */
  border: 2px dashed #D8A0B5;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  min-width: 120px;
  cursor: pointer;
  transition: all 0.2s;
}

.floating-item:hover {
  border-style: solid;
  background: var(--hover-bg, #DDA8BC);
  transform: scale(1.02);
}

.floating-item.bus-item {
  border-color: #012169;
  background: repeating-linear-gradient(
    45deg,
    #e8eef6,
    #e8eef6 6px,
    #d0ddef 6px,
    #d0ddef 12px
  );
}

.floating-item.bus-item:hover {
  background: repeating-linear-gradient(
    45deg,
    #d0ddef,
    #d0ddef 6px,
    #b8c9e0 6px,
    #b8c9e0 12px
  );
}

.floating-item .block-code {
  font-weight: 600;
  color: #333;
  font-size: 0.8rem;
}

.floating-item.bus-item .block-code {
  color: #012169;
}

.floating-item .block-name {
  font-size: 0.75rem;
  color: #555;
  margin-top: 0.15rem;
}

@media (max-width: 900px) {
  .grid-header,
  .time-row {
    grid-template-columns: 50px repeat(5, 1fr);
  }

  .time-col,
  .day-col,
  .time-label {
    padding: 0.25rem;
    font-size: 0.65rem;
  }

  .time-cell {
    min-height: 40px;
  }

  .schedule-block {
    padding: 0.15rem;
  }

  .schedule-block .block-code {
    font-size: 0.6rem;
  }

  .schedule-block .block-name {
    font-size: 0.5rem;
  }
}
</style>