<template>
  <div 
    class="course-card"
    draggable="true"
    @dragstart="handleDragStart"
    @click="handleClick"
  >
    <div class="course-code">{{ course.code || course.courseId || course.course }}</div>
    <div class="course-name">{{ course.name || 'Unnamed Course' }}</div>
    <div class="course-info">
      <span v-if="course.creditHours || course.credits">{{ course.creditHours || course.credits }} credits</span>
      <span v-if="course.campus || course.subject">{{ course.campus || course.subject }}</span>
    </div>
    <div v-if="course.description" class="course-description">{{ course.description }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
  course: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['course-selected'])

function handleDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('application/json', JSON.stringify(props.course))
}

function handleClick() {
  emit('course-selected', props.course)
}
</script>

<style scoped>
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
  background-color: #f9f9f9;
  border-color: #42b983;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.course-code {
  font-weight: bold;
  color: #42b983;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.course-name {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.course-info {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.course-info span {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.course-description {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
  line-height: 1.4;
}
</style>

