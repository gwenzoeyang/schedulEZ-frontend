<template>
    <div class="bus-panel">
      <div class="panel-header">
        <h3>🚌 Exchange Bus</h3>
      </div>
      
      <div class="panel-content">
        <!-- Origin Selection -->
        <div class="form-group">
          <label>Departing from:</label>
          <select v-model="origin" class="form-select">
            <option v-for="stop in originStops" :key="stop" :value="stop">
              {{ stop }}
            </option>
          </select>
        </div>
        
        <!-- Destination Selection -->
        <div class="form-group">
          <label>Arriving at:</label>
          <select v-model="destination" class="form-select">
            <option v-for="stop in destinationStops" :key="stop" :value="stop">
              {{ stop }}
            </option>
          </select>
        </div>
        
        <!-- Day Selection (Multiple) -->
        <div class="form-group">
          <label>Days (select multiple):</label>
          <div class="day-selector">
            <button 
              v-for="day in days" 
              :key="day.value"
              :class="['day-btn', { selected: selectedDays.includes(day.value) }]"
              @click="toggleDay(day.value)"
              type="button"
            >
              {{ day.label }}
            </button>
          </div>
        </div>
        
        <!-- Trip Cards -->
        <div class="trips-section">
          <div class="trips-header">
            <span>Available Trips</span>
            <span class="trip-count">{{ trips.length }} options</span>
          </div>
          
          <div class="trips-list">
            <div 
              v-for="(trip, index) in trips" 
              :key="index"
              class="trip-card"
              draggable="true"
              @dragstart="onDragStart($event, trip)"
              @click="onTripClick(trip)"
            >
              <div class="trip-times">
                <span class="depart-time">{{ trip.departureTime }}</span>
                <span class="arrow">→</span>
                <span class="arrive-time">{{ trip.arrivalTime }}</span>
              </div>
              <div class="trip-route">
                <span class="origin-name">{{ shortenStop(origin) }}</span>
                <span class="dest-name">{{ shortenStop(destination) }}</span>
              </div>
              <div class="trip-days">
                <span v-for="day in selectedDays" :key="day" class="day-chip">{{ day }}</span>
              </div>
              <div class="trip-hint">Click or drag to add</div>
            </div>
          </div>
          
          <div v-if="trips.length === 0" class="no-trips">
            <span v-if="selectedDays.length === 0">Select at least one day</span>
            <span v-else>Select origin and destination</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const emit = defineEmits(['add-trip'])
  
  // Bus schedule data
  const EXCHANGE_BUS_TIMES = {
    "Wellesley Chapel": [
      "7:30 am", "9:00 am", "10:30 am", "11:30 am", "12:40 pm",
      "1:30 pm", "2:30 pm", "3:30 pm", "4:30 pm", "5:30 pm",
      "6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm"
    ],
    "Alumnae Hall": [
      "7:35 am", "9:05 am", "10:35 am", "11:35 am", "12:45 pm",
      "1:35 pm", "2:35 pm", "3:35 pm", "4:35 pm", "5:35 pm",
      "6:05 pm", "7:05 pm", "8:05 pm", "9:05 pm"
    ],
    "350 Mass Ave.": [
      "8:20 am", "9:50 am", "11:20 am", "12:20 pm", "1:20 pm",
      "2:20 pm", "3:20 pm", "4:20 pm", "5:20 pm", "6:20 pm",
      "6:50 pm", "7:50 pm", "8:50 pm", "9:50 pm"
    ],
    "Vassar St., Bldg 34": [
      "8:25 am", "9:55 am", "11:25 am", "12:25 pm", "1:25 pm",
      "2:25 pm", "3:25 pm", "4:25 pm", "5:25 pm", "6:25 pm",
      "6:55 pm", "7:55 pm", "8:55 pm", "9:55 pm"
    ],
    "Kendall Sq. T Stop": [
      "8:30 am", "10:00 am", "11:30 am", "12:30 pm", "1:30 pm",
      "2:30 pm", "3:30 pm", "4:30 pm", "5:30 pm", "6:30 pm",
      "7:00 pm", "8:00 pm", "9:00 pm", "10:00 pm"
    ],
    "77 Mass Ave.": [
      "8:35 am", "10:05 am", "11:35 am", "12:35 pm", "1:35 pm",
      "2:35 pm", "3:35 pm", "4:35 pm", "5:35 pm", "6:35 pm",
      "7:05 pm", "8:05 pm", "9:05 pm", "10:05 pm"
    ],
    "45 Mass Ave. (Marlboro Market)": [
      "8:40 am", "10:10 am", "11:40 am", "12:40 pm", "1:40 pm",
      "2:40 pm", "3:40 pm", "4:40 pm", "5:40 pm", "6:40 pm",
      "7:10 pm", "8:10 pm", "9:10 pm", "10:10 pm"
    ],
    "Alumnae Hall (return)": [
      "9:30 am", "11:00 am", "12:30 pm", "1:35 pm", "2:30 pm",
      "3:30 pm", "4:30 pm", "5:30 pm", "6:30 pm", "7:30 pm",
      "8:00 pm", "9:00 pm", "10:00 pm", "11:00 pm"
    ],
    "Wellesley Chapel (return)": [
      "9:35 am", "11:05 am", "12:35 pm", "1:40 pm", "2:35 pm",
      "3:35 pm", "4:35 pm", "5:35 pm", "6:35 pm", "7:35 pm",
      "8:05 pm", "9:05 pm", "10:05 pm", "11:05 pm"
    ]
  }
  
  const wellesleyToMITStops = [
    "Wellesley Chapel",
    "Alumnae Hall",
    "350 Mass Ave.",
    "Vassar St., Bldg 34",
    "Kendall Sq. T Stop",
    "77 Mass Ave.",
    "45 Mass Ave. (Marlboro Market)"
  ]
  
  const mitToWellesleyStops = [
    "45 Mass Ave. (Marlboro Market)",
    "77 Mass Ave.",
    "Kendall Sq. T Stop",
    "Vassar St., Bldg 34",
    "350 Mass Ave.",
    "Alumnae Hall (return)",
    "Wellesley Chapel (return)"
  ]
  
  const days = [
    { label: 'Mon', value: 'M' },
    { label: 'Tue', value: 'T' },
    { label: 'Wed', value: 'W' },
    { label: 'Thu', value: 'R' },
    { label: 'Fri', value: 'F' }
  ]
  
  const origin = ref("Wellesley Chapel")
  const destination = ref("77 Mass Ave.")
  const selectedDays = ref(['M'])
  
  function toggleDay(day) {
    const index = selectedDays.value.indexOf(day)
    if (index > -1) {
      selectedDays.value.splice(index, 1)
    } else {
      selectedDays.value.push(day)
    }
  }
  
  const originStops = computed(() => {
    // All stops that can be used as starting points
    // Wellesley stops for going to MIT, MIT stops for returning to Wellesley
    return [
      "Wellesley Chapel",
      "Alumnae Hall",
      "350 Mass Ave.",
      "Vassar St., Bldg 34",
      "Kendall Sq. T Stop",
      "77 Mass Ave.",
      "45 Mass Ave. (Marlboro Market)",
      "Alumnae Hall (return)"
    ]
  })
  
  const destinationStops = computed(() => {
    // If departing from Wellesley side, can go to any stop further on the route
    const originIndex = wellesleyToMITStops.indexOf(origin.value)
    if (originIndex !== -1) {
      // Can go to any stop after this one on the Wellesley→MIT route
      return wellesleyToMITStops.slice(originIndex + 1)
    }
    
    // If departing from an MIT stop (for return trip to Wellesley)
    const mitStops = ["350 Mass Ave.", "Vassar St., Bldg 34", "Kendall Sq. T Stop", "77 Mass Ave.", "45 Mass Ave. (Marlboro Market)"]
    if (mitStops.includes(origin.value)) {
      // From MIT, can return to Wellesley
      return ["Alumnae Hall (return)", "Wellesley Chapel (return)"]
    }
    
    // If departing from Alumnae Hall (return), can only go to Chapel
    if (origin.value === "Alumnae Hall (return)") {
      return ["Wellesley Chapel (return)"]
    }
    
    return []
  })
  
  const trips = computed(() => {
    if (!origin.value || !destination.value || selectedDays.value.length === 0) return []
    
    const originTimes = EXCHANGE_BUS_TIMES[origin.value]
    const destTimes = EXCHANGE_BUS_TIMES[destination.value]
    
    if (!originTimes || !destTimes) return []
    
    const tripList = []
    for (let i = 0; i < originTimes.length && i < destTimes.length; i++) {
      tripList.push({
        index: i,
        departureTime: originTimes[i],
        arrivalTime: destTimes[i]
      })
    }
    
    return tripList
  })
  
  function convertTo24Hour(timeStr) {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i)
    if (!match) return timeStr
    
    let [, hourStr, minute, period] = match
    let hour = parseInt(hourStr, 10)
    
    if (period.toLowerCase() === 'pm' && hour !== 12) {
      hour += 12
    } else if (period.toLowerCase() === 'am' && hour === 12) {
      hour = 0
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute}`
  }
  
  function shortenStop(stop) {
    const shortNames = {
      "Wellesley Chapel": "Wellesley",
      "Alumnae Hall": "Alumnae",
      "350 Mass Ave.": "350 Mass",
      "Vassar St., Bldg 34": "Vassar St",
      "Kendall Sq. T Stop": "Kendall",
      "77 Mass Ave.": "77 Mass",
      "45 Mass Ave. (Marlboro Market)": "45 Mass",
      "Alumnae Hall (return)": "Alumnae",
      "Wellesley Chapel (return)": "Wellesley"
    }
    return shortNames[stop] || stop
  }
  
  // Create a single trip object for one day
  function createSingleTrip(tripData, day) {
    return {
      type: 'bus',
      id: `bus-${day}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      origin: origin.value,
      destination: destination.value,
      departureTime: tripData.departureTime,
      arrivalTime: tripData.arrivalTime,
      day: day,
      title: `${shortenStop(origin.value)} → ${shortenStop(destination.value)}`,
      courseID: `🚌 ${tripData.departureTime}`,
      meetingTimes: [{
        day: day,
        start: convertTo24Hour(tripData.departureTime),
        end: convertTo24Hour(tripData.arrivalTime)
      }]
    }
  }
  
  function onDragStart(event, tripData) {
    console.log('🚌 Drag started:', tripData)
    console.log('🚌 Selected days:', selectedDays.value)
    
    // Create trip objects for all selected days
    const tripObjects = selectedDays.value.map(day => createSingleTrip(tripData, day))
    
    const payload = JSON.stringify(tripObjects)
    console.log('🚌 Drag payload:', payload)
    
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('text/plain', payload)
    event.dataTransfer.setData('application/json', payload)
  }
  
  function onTripClick(tripData) {
    console.log('🚌 Trip clicked:', tripData)
    
    // Emit a trip for each selected day
    for (const day of selectedDays.value) {
      const trip = createSingleTrip(tripData, day)
      console.log('🚌 Emitting trip:', trip)
      emit('add-trip', trip)
    }
  }
  </script>
  
  <style scoped>
  .bus-panel {
    background: white;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .panel-header {
    padding: 0.25rem 0.5rem;
    background: #012169;
    color: white;
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .panel-content {
    padding: 0.35rem;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    flex: 1;
    overflow: hidden;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .form-group label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #012169;
    text-transform: uppercase;
  }
  
  .form-select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.85rem;
    background: white;
    color: #333;
    cursor: pointer;
  }
  
  .form-select option {
    color: #333;
    background: white;
  }
  
  .form-select:focus {
    outline: none;
    border-color: #012169;
  }
  
  .day-selector {
    display: flex;
    gap: 0.25rem;
  }
  
  .day-btn {
    flex: 1;
    padding: 0.4rem 0.25rem;
    border: 1px solid #ddd;
    background: white;
    color: #333;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.2s;
  }
  
  .day-btn:hover {
    border-color: #012169;
    background: #f0f4f8;
  }
  
  .day-btn.selected {
    background: #012169;
    color: white;
    border-color: #012169;
  }
  
  .trips-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f8fafc;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
  }
  
  .trips-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: #e8eef6;
    border-bottom: 1px solid #d0ddef;
  }
  
  .trips-header span:first-child {
    font-size: 0.75rem;
    font-weight: 600;
    color: #012169;
    text-transform: uppercase;
  }
  
  .trip-count {
    font-size: 0.7rem;
    color: #666;
  }
  
  .trips-list {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .trip-card {
    background: repeating-linear-gradient(
      45deg,
      #e8eef6,
      #e8eef6 6px,
      #d0ddef 6px,
      #d0ddef 12px
    );
    border: 2px solid #012169;
    border-radius: 8px;
    padding: 0.6rem 0.75rem;
    cursor: grab;
    transition: all 0.2s;
    user-select: none;
  }
  
  .trip-card:hover {
    background: repeating-linear-gradient(
      45deg,
      #d0ddef,
      #d0ddef 6px,
      #b8c9e0 6px,
      #b8c9e0 12px
    );
    box-shadow: 0 2px 8px rgba(1, 33, 105, 0.25);
    transform: translateY(-1px);
  }
  
  .trip-card:active {
    cursor: grabbing;
  }
  
  .trip-times {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.35rem;
  }
  
  .depart-time {
    font-weight: 700;
    color: #012169;
    font-size: 0.95rem;
  }
  
  .arrow {
    color: #666;
    font-size: 0.9rem;
  }
  
  .arrive-time {
    font-weight: 700;
    color: #012169;
    font-size: 0.95rem;
  }
  
  .trip-route {
    display: flex;
    justify-content: space-between;
    font-size: 0.7rem;
    color: #555;
    margin-bottom: 0.35rem;
  }
  
  .trip-days {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 0.25rem;
  }
  
  .day-chip {
    background: #012169;
    color: white;
    padding: 0.1rem 0.35rem;
    border-radius: 3px;
    font-size: 0.65rem;
    font-weight: 600;
  }
  
  .trip-hint {
    font-size: 0.65rem;
    color: #999;
    text-align: center;
    font-style: italic;
  }
  
  .no-trips {
    padding: 2rem 1rem;
    text-align: center;
    color: #999;
    font-size: 0.85rem;
  }
  
  .trips-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .trips-list::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 3px;
  }
  
  .trips-list::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  
  .trips-list::-webkit-scrollbar-thumb:hover {
    background: #012169;
  }
  </style>