<template>
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-button" @click="closeModal">×</button>
        
        <div class="course-header">
          <h2 class="course-title">{{ course.title || course.name }}</h2>
          <div class="course-code-badge">{{ course.courseID || course.courseId || course.code }}</div>
        </div>
  
        <div class="course-details">
          <div class="detail-section">
            <div class="detail-label">Instructor</div>
            <div class="detail-value">{{ course.instructor || 'TBA' }}</div>
          </div>
  
          <div class="detail-section" v-if="course.rmp">
            <div class="detail-label">Rate My Professor</div>
            <div class="detail-value">
              <a 
                :href="course.rmp" 
                target="_blank" 
                rel="noopener noreferrer"
                class="rmp-button"
              >
                📊 View Professor Rating
              </a>
            </div>
          </div>
  
          <div class="detail-section">
            <div class="detail-label">Subject</div>
            <div class="detail-value">{{ course.subject || 'N/A' }}</div>
          </div>
  
          <div class="detail-section" v-if="course.campus">
            <div class="detail-label">Campus</div>
            <div class="detail-value">{{ course.campus }}</div>
          </div>
  
          <div class="detail-section" v-if="course.location">
            <div class="detail-label">Location</div>
            <div class="detail-value">{{ course.location }}</div>
          </div>
  
          <!-- Meeting Times - Raw DB format -->
          <div class="detail-section full-width">
            <div class="detail-label">Meeting Times</div>
            <div v-if="dbMeetingTimesArray.length > 0" class="meeting-times-list">
              <div v-for="(time, index) in dbMeetingTimesArray" :key="index" class="time-slot">
                {{ time }}
              </div>
            </div>
            <div v-else class="detail-value">TBA</div>
          </div>
  
          <div class="detail-section full-width" v-if="course.description">
            <div class="detail-label">Description</div>
            <div class="detail-value">{{ course.description }}</div>
          </div>
        </div>
  
        <div class="modal-actions">
          <button 
            v-if="mode === 'add'" 
            class="action-button primary" 
            @click="addToSchedule"
          >
            Add to Schedule
          </button>
          
          <button 
            v-if="mode === 'delete'" 
            class="action-button danger" 
            @click="deleteFromSchedule"
          >
            Remove from Schedule
          </button>
          
          <button class="action-button secondary" @click="closeModal">
            Close
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    isOpen: {
      type: Boolean,
      required: true
    },
    course: {
      type: Object,
      required: true
    },
    mode: {
      type: String,
      default: 'add',
      validator: (value) => ['add', 'delete'].includes(value)
    }
  })
  
  const emit = defineEmits(['close', 'add-to-schedule', 'delete-from-schedule'])
  
  const dbMeetingTimesArray = computed(() => {
    const dbTimes = props.course.DBmeetingTimes
    if (!dbTimes) return []
    if (Array.isArray(dbTimes)) return dbTimes
    return [dbTimes]
  })
  
  function closeModal() {
    emit('close')
  }
  
  function addToSchedule() {
    emit('add-to-schedule', props.course)
  }
  
  function deleteFromSchedule() {
    emit('delete-from-schedule', props.course)
  }
  </script>
  
  <style scoped>
  /* Wellesley Blue: #012169 */
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
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 85vh;
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
  }
  
  .close-button:hover {
    background: #f5f5f5;
    color: #333;
  }
  
  .course-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid #f0f0f0;
  }
  
  .course-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    color: #2c3e50;
    font-weight: 600;
  }
  
  .course-code-badge {
    display: inline-block;
    background: #012169;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
  }
  
  .course-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .detail-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .detail-section.full-width {
    grid-column: 1 / -1;
  }
  
  .detail-label {
    font-weight: 600;
    color: #012169;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .detail-value {
    color: #2c3e50;
    font-size: 1rem;
    line-height: 1.5;
  }
  
  .rmp-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #012169 0%, #023e8a 100%);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s;
  }
  
  .rmp-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(1, 33, 105, 0.3);
  }
  
  .meeting-times-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .time-slot {
    background: #f0f4f8;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    border-left: 4px solid #012169;
    font-size: 0.95rem;
    color: #333;
  }
  
  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding-top: 1.5rem;
    border-top: 2px solid #f0f0f0;
  }
  
  .action-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .action-button.primary {
    background: #012169;
    color: white;
  }
  
  .action-button.primary:hover {
    background: #001a4d;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(1, 33, 105, 0.3);
  }
  
  .action-button.danger {
    background: #c0392b;
    color: white;
  }
  
  .action-button.danger:hover {
    background: #a5281b;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(192, 57, 43, 0.3);
  }
  
  .action-button.secondary {
    background: #f0f0f0;
    color: #666;
  }
  
  .action-button.secondary:hover {
    background: #e0e0e0;
    color: #333;
  }
  
  @media (max-width: 600px) {
    .modal-content {
      width: 95%;
      padding: 1.5rem;
    }
  
    .course-details {
      grid-template-columns: 1fr;
    }
  
    .modal-actions {
      flex-direction: column-reverse;
    }
  
    .action-button {
      width: 100%;
    }
  }
  </style>