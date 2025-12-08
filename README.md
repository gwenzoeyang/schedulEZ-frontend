# SchedulEZ Frontend

A modern Vue.js scheduling application for Wellesley College cross-registration planning, built with Vite.

## Setup

Install dependencies:

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Build the application for production:

```bash
npm run build
```

## Preview

Preview the production build:

```bash
npm run preview
```

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend build tool
- **Composition API** - Modern way to write Vue components with `<script setup>`
- **Local Storage** - Client-side persistence for schedules

## Application Overview

SchedulEZ is a cross-registration planning tool that helps students:
- Browse and search courses from MongoDB
- Build and manage multiple weekly schedules
- View course details and prerequisites
- Plan bus trips for cross-registration travel
- Get AI-powered course recommendations

## API Integration

The application is configured to connect to a backend API running at `http://localhost:8000/`.

### API Services

The application includes service modules for:

- **CourseCatalog** - Browse, search, and manage courses
  - `getAllCourses()` - Load all courses from MongoDB
  - `searchCourses(query)` - Search courses by name, professor, subject, etc.
  - `getCourseByCode(code)` - Get specific course details
  - `getCoursePrerequisites(course)` - Get course prerequisites
  - `getCourseCorequisites(course)` - Get course corequisites

- **Schedule** - Manage student schedules
  - `createSchedule(scheduleData)` - Create a new schedule
  - `updateSchedule(scheduleData)` - Update schedule details
  - `getUserSchedule(params)` - Get user's schedule
  - `addCourse(params)` - Add course to schedule
  - `removeCourse(params)` - Remove course from schedule
  - `suggestCourse(params)` - Get AI course recommendations

- **CrossRegTravel** - Handle cross-registration travel requests
  - `requestTravel(travelData)` - Request travel for a course
  - `getTravelRequestStatus(requestId)` - Check request status
  - `getStudentTravelRequests(student)` - Get student's travel requests

All API services are located in `src/services/api.js` and can be imported and used in Vue components.

### Example Usage

```javascript
import { courseCatalogAPI, scheduleAPI } from './services/api.js'

// Load all courses
const courses = await courseCatalogAPI.getAllCourses()

// Search for courses
const results = await courseCatalogAPI.searchCourses('computer science')

// Get course details
const course = await courseCatalogAPI.getCourseByCode('CS 101')

// Get AI recommendations
const suggestions = await scheduleAPI.suggestCourse({
  enrolledCourses: [...],
  preferences: {...}
})
```

See `api.md` for the complete API specification.

## Component Structure

The application is organized into the following components:

### Main Components

- **SchedulePage.vue** - Main page component that orchestrates the entire application
  - Left sidebar: Course search and filtering
  - Center: Weekly schedule grid
  - Right sidebar: Bus schedule panel
  - Header: Schedule selector and name editor

- **ScheduleGrid.vue** - Weekly calendar grid (Monday-Friday, 8am-9pm)
  - Displays enrolled courses and bus trips
  - Supports drag-and-drop for adding courses
  - Shows courses based on their meeting times

- **CourseCard.vue** - Individual course card in the course list
  - Displays course code, name, credits, and campus
  - Supports drag-and-drop to schedule
  - Clickable to view course details

- **CourseDetailModal.vue** - Modal popup showing full course information
  - Course details, prerequisites, corequisites
  - Meeting times and schedule
  - Add/remove from schedule actions

- **BusSchedulePanel.vue** - Right sidebar panel for bus trip planning
  - Browse available bus routes
  - Add bus trips to schedule
  - View trip details

- **AIRecommendationPanel.vue** - Floating panel for AI course recommendations
  - Get personalized course suggestions
  - View recommended courses
  - Add recommendations to schedule

## Features

### Course Management
- **Search & Filter**: Search courses by name, professor, or subject
- **Advanced Filters**: Filter by subject, days of week, and time range
- **Course Details**: View full course information including prerequisites and meeting times
- **Drag & Drop**: Drag courses from the list directly onto the schedule grid

### Schedule Management
- **Multiple Schedules**: Create and manage multiple schedules
- **Schedule Switching**: Easy switching between different schedule plans
- **Editable Names**: Customize schedule names
- **Local Persistence**: Schedules are saved to browser local storage

### Bus Trip Planning
- **Bus Schedule Integration**: View and add bus trips to your schedule
- **Cross-Registration Support**: Plan travel for courses at other institutions

### AI Recommendations
- **Personalized Suggestions**: Get AI-powered course recommendations based on your schedule
- **Smart Filtering**: Recommendations consider your enrolled courses and preferences

## State Management

The application uses Vue 3's Composition API with reactive refs and computed properties for state management. Schedule data is persisted to browser local storage (`localStorage`) under the key `schedulez-data`.

The UI is fully reactive and updates automatically without page refreshes. All course data is loaded from the backend MongoDB database via the API.

## Project Structure

```
src/
├── components/
│   ├── SchedulePage.vue      # Main page component
│   ├── ScheduleGrid.vue       # Weekly calendar grid
│   ├── CourseCard.vue         # Course list item
│   ├── CourseDetailModal.vue  # Course details popup
│   ├── BusSchedulePanel.vue   # Bus trip panel
│   └── AIRecommendationPanel.vue  # AI recommendations
├── services/
│   └── api.js                 # API service layer
├── config/
│   └── api.js                # API configuration (base URL)
├── App.vue                   # Root component
└── main.js                   # Application entry point
```


user journey:

At the end of the semester, Ana, a Wellesley sophomore CS major, uses SchedulEZ to quickly plan her spring courses without the overwhelming options and processes of Workday. First she selects CS230 from the dropdown menu, looking at the course details and professor rating on ratemyprofessor. She then adds the class to her schedule by dragging and dropping it in. She then uses the AI recommendation to get a recommendation for a course, which recommends algorithms to her. She continues dragging and dropping courses in, adding differential geometry. However, that overlaps with her CS230 course, so she removes it. She has an in-person activity at 7pm on Tuesdays on MIT campus. Using the transportation bar on the side, she adds the appropriate transportation block for the Wellesley shuttle. She then continues to explore the app, creating more schedules, renaming them, etc.

You can view the screen recording here:  
[Check-in Video (Google Drive)](https://drive.google.com/file/d/1-U0IFB8uVTmxfLFFHJx4gNQg8dHZHhyZ/view?usp=sharing)

updated user journey:

At the end of the semester, Ana, a Wellesley sophomore CS major, uses SchedulEZ to plan her spring courses without the overwhelming interface of Workday.
She starts by using the filter feature to narrow down the course catalog by subject, selecting "CS" to see only computer science courses. 
She clicks on CS230 - Data Structures to view the course details, checks the professor's rating on Rate My Professor through the integrated link, and adds it to her schedule.
The course appears on the grid in a soft pastel color. Wanting guidance on what to take next, she opens the AI Recommendation panel, enters her preferences, and receives a personalized suggestion for an Algorithms course, which she adds to her schedule.
She continues exploring, searching for a math elective and dragging Differential Geometry onto the grid. However, she notices the visual overlap with her CS230 block, so she clicks on it and removes it from her schedule.
Ana also has an in-person activity at MIT on Tuesday evenings, so she uses the Exchange Bus sidebar to find a shuttle from Wellesley Chapel to 77 Mass Ave., selects Tuesday, and adds the trip to her schedule—it appears as a striped block alongside her courses.
Finally, she creates a second schedule called "Plan B" to explore alternative options, easily switching between the two using the dropdown menu to compare before registration opens.

You can view the screen recording here:  
[Final Video (Google Drive)](https://drive.google.com/file/d/131NB_UazP7p41eB42slmCJfnL4l2KS2P/view?usp=sharing)

[Visual Desgin Study (Google Drive)](https://docs.google.com/presentation/d/1AAIUxC6xJPeijZpeDS3GEFDxjMTO2F6t_j-9qlM1jAI/edit?usp=sharing)
