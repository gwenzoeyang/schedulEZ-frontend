# SchedulEZ Frontend

A modern Vue.js scheduling application built with Vite.

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
- **Composition API** - Modern way to write Vue components

## API Integration

The application is configured to connect to a backend API running at `http://localhost:8000/`.

### API Services

The application includes service modules for:

- **CourseCatalog** - Manage courses, prerequisites, and course offerings
- **CrossRegTravel** - Handle cross-registration and travel arrangements
- **RequirementTracker** - Track student academic requirements and progress
- **Schedule** - Manage course schedules, room assignments, and time slots

All API services are located in `src/services/api.js` and can be imported and used in Vue components.

### Example Usage

```javascript
import { courseCatalogAPI } from './services/api.js'

// List all courses
const courses = await courseCatalogAPI.listCourses()

// Get course details
const courseDetails = await courseCatalogAPI.getCourse('CS101')

// Add a new course
await courseCatalogAPI.addCourse({
  course: 'CS101',
  name: 'Introduction to Computer Science',
  description: 'Fundamental concepts of programming',
  credits: 3,
  subject: 'CS'
})
```

See `api.md` for the complete API specification.

## Component Structure

The application is organized into the following components:

- **Navigation.vue** - Tab navigation to switch between different views
- **CourseCatalogView.vue** - Manage courses, prerequisites, and offerings
- **ScheduleView.vue** - Manage rooms, time slots, and course assignments
- **RequirementView.vue** - Track student progress and academic requirements
- **CrossRegView.vue** - Handle cross-registration and travel arrangements

## State Management

The application uses Pinia for state management with dedicated stores:

- **courseStore.js** - Course catalog data and operations
- **scheduleStore.js** - Room and schedule management
- **requirementStore.js** - Student progress tracking
- **crossRegStore.js** - Cross-registration and travel management

Each component manages its own local state for form inputs, with the Pinia stores handling shared data and API interactions. The UI is fully reactive and updates automatically without page refreshes.

