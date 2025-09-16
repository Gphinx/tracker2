Time Tracking Web App - MVP Implementation
Core Features
Task Selection - Dropdown with predefined tasks
Jurisdiction Selection - Dropdown with predefined jurisdictions
Case ID Input - Text field for case identification
Time Logging - Start/stop functionality with automatic timestamps
Data Storage - localStorage for persistence
Time Log Display - Table showing all logged entries
Files to Create/Modify
src/pages/Index.tsx - Main time tracking interface
src/components/TimeTracker.tsx - Core time tracking component
src/components/TimeLogTable.tsx - Display logged entries
src/types/index.ts - TypeScript interfaces
index.html - Update title to “Time Tracker”
Data Structure
TimeEntry:
Tasks: Predefined list of common tasks
Jurisdictions: Predefined list of jurisdictions
Implementation Strategy
Use localStorage for data persistence
Automatic end time when starting new entry
Form validation for required fields
Clean, professional interface using Shadcn-UI components
