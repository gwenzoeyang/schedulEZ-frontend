# API Specification: CourseCatalog Concept

**Purpose:** maintain a record of courses, their attributes, and their availability across terms

---

## API Endpoints

### POST /api/CourseCatalog/addCourse

**Description:** Adds a new course to the catalog with the given attributes.

**Requirements:**
- course does not exist

**Effects:**
- adds a new course with the given attributes

**Request Body:**
```json
{
  "course": "string",
  "name": "string",
  "description": "string",
  "credits": "number",
  "subject": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CourseCatalog/removeCourse

**Description:** Removes a course from the catalog.

**Requirements:**
- course exists and is not offered in any term

**Effects:**
- removes the course

**Request Body:**
```json
{
  "course": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CourseCatalog/offerCourse

**Description:** Associates a course with a term, making it available for registration.

**Requirements:**
- course exists and is not already offered in this term

**Effects:**
- associates the course with the term, making it available for registration

**Request Body:**
```json
{
  "course": "string",
  "term": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CourseCatalog/unofferCourse

**Description:** Disassociates a course from a term, making it unavailable for registration.

**Requirements:**
- course exists and is offered in this term

**Effects:**
- disassociates the course from the term, making it unavailable for registration

**Request Body:**
```json
{
  "course": "string",
  "term": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CourseCatalog/addPrerequisite

**Description:** Adds a prerequisite to the set of prerequisites for a course.

**Requirements:**
- course and prerequisite exist, and prerequisite is not already a prerequisite of course

**Effects:**
- adds prerequisite to the set of prerequisites for course

**Request Body:**
```json
{
  "course": "string",
  "prerequisite": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CourseCatalog/removePrerequisite

**Description:** Removes a prerequisite from the set of prerequisites for a course.

**Requirements:**
- course and prerequisite exist, and prerequisite is a prerequisite of course

**Effects:**
- removes prerequisite from the set of prerequisites for course

**Request Body:**
```json
{
  "course": "string",
  "prerequisite": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CourseCatalog/_getCourse

**Description:** Returns the attributes of the specified course.

**Requirements:**
- course exists

**Effects:**
- returns the attributes of the specified course

**Request Body:**
```json
{
  "course": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "name": "string",
    "description": "string",
    "credits": "number",
    "subject": "string",
    "meets": [
      "string"
    ],
    "prerequisites": [
      "string"
    ]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CourseCatalog/_listCourses

**Description:** Returns all courses and their attributes.

**Requirements:**
- true

**Effects:**
- returns all courses and their attributes

**Request Body:**
```json
{}
```

**Success Response Body (Query):**
```json
[
  {
    "courseId": "string",
    "name": "string",
    "description": "string",
    "credits": "number",
    "subject": "string",
    "meets": [
      "string"
    ],
    "prerequisites": [
      "string"
    ]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CourseCatalog/_listOfferedCourses

**Description:** Returns all courses offered in the given term, with name and subject.

**Requirements:**
- term exists

**Effects:**
- returns all courses offered in the given term, with name and subject

**Request Body:**
```json
{
  "term": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "courseId": "string",
    "name": "string",
    "subject": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
# API Specification: CrossRegTravel Concept

**Purpose:** facilitate travel arrangements for students taking courses at other campuses through cross-registration

---

## API Endpoints

### POST /api/CrossRegTravel/enrollInCrossRegCourse

**Description:** Records student's enrollment in a cross-registered course and sets travelRequested to true.

**Requirements:**
- student, homeCampus, hostCampus, course, term exist; student is not already enrolled in this course for this term

**Effects:**
- records student's enrollment in a cross-registered course, sets travelRequested to true

**Request Body:**
```json
{
  "student": "string",
  "homeCampus": "string",
  "hostCampus": "string",
  "course": "string",
  "term": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CrossRegTravel/approveTravel

**Description:** Sets travelApproved to true and updates travelDetails for an enrolled student's cross-registration.

**Requirements:**
- student is enrolled in the course for the term, travelRequested is true, travelApproved is false

**Effects:**
- sets travelApproved to true and updates travelDetails

**Request Body:**
```json
{
  "student": "string",
  "course": "string",
  "term": "string",
  "details": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CrossRegTravel/cancelTravelRequest

**Description:** Cancels a student's travel request for a cross-registered course.

**Requirements:**
- student is enrolled in the course for the term, travelRequested is true

**Effects:**
- sets travelRequested to false, travelApproved to false, and clears travelDetails

**Request Body:**
```json
{
  "student": "string",
  "course": "string",
  "term": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CrossRegTravel/withdrawFromCrossRegCourse

**Description:** Removes a student's enrollment from a cross-registered course and clears travel related flags.

**Requirements:**
- student is enrolled in the course for the term

**Effects:**
- removes student's enrollment, sets travelRequested to false, travelApproved to false, and clears travelDetails

**Request Body:**
```json
{
  "student": "string",
  "course": "string",
  "term": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CrossRegTravel/_getTravelStatus

**Description:** Returns the travel request and approval status, and any approved travel details for a student's course.

**Requirements:**
- student is enrolled in the course for the term

**Effects:**
- returns the travel request and approval status, and any approved travel details

**Request Body:**
```json
{
  "student": "string",
  "course": "string",
  "term": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "travelRequested": "boolean",
    "travelApproved": "boolean",
    "travelDetails": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/CrossRegTravel/_listStudentsWithPendingTravel

**Description:** Returns a list of students with cross-registered courses for which travel is requested but not yet approved.

**Requirements:**
- true

**Effects:**
- returns a list of students with cross-registered courses for which travel is requested but not yet approved

**Request Body:**
```json
{}
```

**Success Response Body (Query):**
```json
[
  {
    "studentId": "string",
    "homeCampus": "string",
    "hostCampus": "string",
    "course": "string",
    "term": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
# API Specification: RequirementTracker Concept

**Purpose:** track a student's progress towards fulfilling academic requirements by mapping courses to requirements

---

## API Endpoints

### POST /api/RequirementTracker/recordCourseCompletion

**Description:** Adds a course to a student's completed courses; if any requirement becomes fulfilled by this, it is recorded.

**Requirements:**
- student and course exist; student has not already completed this course

**Effects:**
- adds course to student's completed courses; if any requirement becomes fulfilled by this, it is recorded

**Request Body:**
```json
{
  "student": "string",
  "course": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/RequirementTracker/removeCourseCompletion

**Description:** Removes a course from a student's completed courses; if any requirement becomes unfulfilled by this, it is recorded.

**Requirements:**
- student and course exist; student has completed this course

**Effects:**
- removes course from student's completed courses; if any requirement becomes unfulfilled by this, it is recorded

**Request Body:**
```json
{
  "student": "string",
  "course": "string"
}
```

**Success Response Body (Action):
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/RequirementTracker/defineRequirement

**Description:** Defines a new academic requirement with specified courses and credits.

**Requirements:**
- requirement does not exist; all courses in requiredCourses exist

**Effects:**
- defines a new academic requirement with specified courses and credits

**Request Body:**
```json
{
  "requirement": "string",
  "requiredCourses": [
    "string"
  ],
  "requiredCredits": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/RequirementTracker/updateRequirement

**Description:** Updates an existing academic requirement with new courses and credits.

**Requirements:**
- requirement exists; all courses in requiredCourses exist

**Effects:**
- updates an existing academic requirement with new courses and credits

**Request Body:**
```json
{
  "requirement": "string",
  "requiredCourses": [
    "string"
  ],
  "requiredCredits": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/RequirementTracker/_getStudentProgress

**Description:** Returns the courses completed by the student and the requirements they have fulfilled.

**Requirements:**
- student exists

**Effects:**
- returns the courses completed by the student and the requirements they have fulfilled

**Request Body:**
```json
{
  "student": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "completedCourses": [
      "string"
    ],
    "fulfilledRequirements": [
      "string"
    ]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/RequirementTracker/_getRequirementDetails

**Description:** Returns the details of a specific requirement.

**Requirements:**
- requirement exists

**Effects:**
- returns the details of a specific requirement

**Request Body:**
```json
{
  "requirement": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "requiredCourses": [
      "string"
    ],
    "requiredCredits": "number"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---
# API Specification: Schedule Concept

**Purpose:** manage the assignment of courses to rooms and time slots, and allow users to view course schedules

---

## API Endpoints

### POST /api/Schedule/assignCourse

**Description:** Assigns the course to the specified room and time slot.

**Requirements:**
- course, room, timeSlot exist; room has sufficient capacity for course (implicitly handled elsewhere or assumed); time slot is not already occupied by another course in that room

**Effects:**
- assigns the course to the specified room and time slot

**Request Body:**
```json
{
  "course": "string",
  "room": "string",
  "timeSlot": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Schedule/unassignCourse

**Description:** Removes the assignment of the course from its room and time slot.

**Requirements:**
- course exists and is assigned to a room and time slot

**Effects:**
- removes the assignment of the course from its room and time slot

**Request Body:**
```json
{
  "course": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Schedule/addRoom

**Description:** Adds a new room with specified capacity.

**Requirements:**
- room does not exist and capacity is positive

**Effects:**
- adds a new room with specified capacity

**Request Body:**
```json
{
  "room": "string",
  "capacity": "number"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Schedule/removeRoom

**Description:** Removes the room.

**Requirements:**
- room exists and is not assigned to any course

**Effects:**
- removes the room

**Request Body:**
```json
{
  "room": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Schedule/addTimeSlot

**Description:** Adds a new time slot with specified details.

**Requirements:**
- timeSlot does not exist; startTime is before endTime

**Effects:**
- adds a new time slot with specified details

**Request Body:**
```json
{
  "timeSlot": "string",
  "dayOfWeek": "string",
  "startTime": "string",
  "endTime": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Schedule/removeTimeSlot

**Description:** Removes the time slot.

**Requirements:**
- timeSlot exists and is not assigned to any course

**Effects:**
- removes the time slot

**Request Body:**
```json
{
  "timeSlot": "string"
}
```

**Success Response Body (Action):**
```json
{}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Schedule/_getCourseSchedule

**Description:** Returns the assigned room and time slot details for the course.

**Requirements:**
- course exists and is assigned to a room and time slot

**Effects:**
- returns the assigned room and time slot details for the course

**Request Body:**
```json
{
  "course": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "room": "string",
    "timeSlot": "string",
    "dayOfWeek": "string",
    "startTime": "string",
    "endTime": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Schedule/_getRoomAvailability

**Description:** Returns the set of time slots when the room is not occupied.

**Requirements:**
- room exists

**Effects:**
- returns the set of time slots when the room is not occupied

**Request Body:**
```json
{
  "room": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "availableTimeSlots": [
      "string"
    ]
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/Schedule/_getTimeSlotDetails

**Description:** Returns the day of week, start time, and end time for the specified time slot.

**Requirements:**
- timeSlot exists

**Effects:**
- returns the day of week, start time, and end time for the specified time slot

**Request Body:**
```json
{
  "timeSlot": "string"
}
```

**Success Response Body (Query):**
```json
[
  {
    "dayOfWeek": "string",
    "startTime": "string",
    "endTime": "string"
  }
]
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---