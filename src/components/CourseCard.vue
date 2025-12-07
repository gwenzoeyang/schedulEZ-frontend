<template>
  <div 
    class="course-card"
    draggable="true"
    @dragstart="handleDragStart"
    @click="handleClick"
  >
    <div class="course-code">{{ course.courseID || course.courseId || course.code || course.course }}</div>
    <div class="course-name">{{ course.title || course.name || 'Unnamed Course' }}</div>
    <div class="course-info">
      <span v-if="course.creditHours || course.credits">{{ course.creditHours || course.credits }} credits</span>
      <span v-if="course.campus">{{ course.campus }}</span>
      <span v-if="course.subject">{{ course.subject }}</span>
    </div>
    <div v-if="course.instructor" class="course-instructor">
      {{ course.instructor }}
      <a 
        v-if="course.rmp" 
        :href="course.rmp" 
        target="_blank" 
        rel="noopener noreferrer"
        class="rmp-link"
        @click.stop
        title="View on Rate My Professor"
      >
        📊 RMP
      </a>
    </div>
    
    <!-- Meeting Times Display - Raw DB format -->
    <div v-if="hasDBMeetingTimes" class="meeting-times">
      <div v-for="(time, index) in dbMeetingTimesArray" :key="index" class="time-slot">
        {{ time }}
      </div>
    </div>
    <div v-else class="meeting-times no-times">
      <span>No scheduled times</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['course-selected'])

const hasDBMeetingTimes = computed(() => {
  const dbTimes = props.course.DBmeetingTimes
  if (!dbTimes) return false
  if (Array.isArray(dbTimes)) return dbTimes.length > 0
  return typeof dbTimes === 'string' && dbTimes.trim().length > 0
})

const dbMeetingTimesArray = computed(() => {
  const dbTimes = props.course.DBmeetingTimes
  if (!dbTimes) return []
  if (Array.isArray(dbTimes)) return dbTimes
  return [dbTimes]
})

function handleDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('application/json', JSON.stringify(props.course))
}

function handleClick() {
  emit('course-selected', props.course)
}
</script>

<style scoped>
/* Wellesley Blue: #012169 */
.course-card {
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
  background: white;
}

.course-card:active {
  cursor: grabbing;
}

.course-card:hover {
  background-color: #f0f4f8;
  border-color: #012169;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(1, 33, 105, 0.15);
}

.course-code {
  font-weight: bold;
  color: #012169;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.course-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.course-info {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.course-info span {
  background: #e8eef6;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.course-instructor {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 0.5rem;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.rmp-link {
  font-size: 0.7rem;
  font-style: normal;
  font-weight: 600;
  color: white;
  background: #012169;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.rmp-link:hover {
  background: #023e8a;
  transform: scale(1.05);
}

.meeting-times {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #e0e0e0;
}

.meeting-times.no-times {
  color: #999;
  font-size: 0.8rem;
  font-style: italic;
}

.time-slot {
  font-size: 0.8rem;
  color: #555;
  background: #f0f4f8;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border-left: 3px solid #012169;
}
</style>