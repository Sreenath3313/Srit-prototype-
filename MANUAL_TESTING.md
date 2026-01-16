# Manual Testing Guide for PR Fixes

This guide outlines the manual testing steps to verify the three main fixes in this PR.

## Prerequisites

Before testing, ensure:
1. Supabase database is set up with the schema
2. Backend server is running (`cd server && npm run dev`)
3. Frontend client is running (`cd client && npm run dev`)
4. You have at least one admin, faculty, and student user created

## Test 1: Faculty Can See Assigned Classes

### Setup
1. Log in as admin
2. Create or verify the following exist:
   - At least one department
   - At least one section
   - At least one subject
   - At least one faculty member
3. Go to Assignments page and create a timetable entry:
   - Select a section
   - Select a subject
   - Select a faculty member
   - Select a day (e.g., Monday)
   - Select a period (e.g., 1)
   - Click "Save"

### Test Steps (Faculty with Classes)
1. Log out and log in as the faculty member you assigned
2. Go to "Attendance" or "Marks" page
3. **Expected Result**: Should see the assigned class in the dropdown
4. **Previous Behavior**: Would show "No classes assigned" error

### Test Steps (Faculty without Classes)
1. Create a new faculty member (or use one without assignments)
2. Log in as that faculty member
3. Go to "Attendance" or "Marks" page
4. **Expected Result**: Should see "No classes found" or empty dropdown, but no error
5. **Previous Behavior**: Would throw an error

### Backend Logs to Verify
Check server console for logs like:
```
[Faculty] Fetching assigned classes for user_id: <uuid>
[Faculty] Found faculty_id: <uuid>, fetching assigned classes...
[Faculty] Found X assigned classes for faculty_id: <uuid>
```

## Test 2: Admin Can Save Timetable Entries

### Test Steps (Creating Timetable)
1. Log in as admin
2. Go to Assignments/Timetable page
3. Fill in the timetable form:
   - Section: Select any section
   - Subject: Select any subject
   - Faculty: Select any faculty
   - Day: Select a day
   - Period: Select a period number
4. Click "Save" or "Create"
5. **Expected Result**: Entry should be saved successfully
6. **Previous Behavior**: Would show "Failed to save timetable" error

### Test Steps (Conflict Validation)
1. After creating a timetable entry, try to create another with:
   - **Same section**
   - **Same day**
   - **Same period**
   - Different subject/faculty
2. Click "Save"
3. **Expected Result**: Should show error "Timetable conflict: This section already has a class scheduled for this day and period"
4. **Previous Behavior**: Would either save duplicate or show generic error

### Test Steps (Updating Timetable)
1. Find an existing timetable entry
2. Click "Edit"
3. Change the subject or faculty (keep same section, day, period)
4. Click "Update"
5. **Expected Result**: Should update successfully
6. **Previous Behavior**: Would fail or use Supabase directly

### Backend Logs to Verify
Check server console for logs like:
```
[Timetable] Creating entry: section=<uuid>, subject=<uuid>, faculty=<uuid>, day=Monday, period=1
[Timetable] Successfully created entry with id: <uuid>
```

Or for conflicts:
```
[Timetable] Error creating timetable: Timetable conflict...
```

## Test 3: Admin Dashboard Shows Real-Time Statistics

### Setup
1. Log in as admin
2. Note the current counts in your database:
   - Number of students
   - Number of faculty
   - Number of departments
   - Number of subjects

### Test Steps
1. Go to Admin Dashboard
2. **Expected Result**: Should see a loading spinner briefly, then:
   - "Total Students" card shows actual count from database
   - "Total Faculty" card shows actual count from database
   - "Departments" card shows actual count from database
   - "Active Subjects" card shows actual count from database
3. **Previous Behavior**: Would show hardcoded values (5,234 students, 234 faculty, etc.)

### Test Steps (Department Overview)
1. Still on Admin Dashboard, scroll to "Department Overview" section
2. **Expected Result**: Should show real departments from database with:
   - Actual department names
   - Real student counts per department
   - Real faculty counts per department
   - Progress bars showing relative sizes
3. **Previous Behavior**: Would show hardcoded department data

### Test Steps (Verify Real-Time Updates)
1. Open a new tab and log in as admin
2. In the new tab, go to Students page and create a new student
3. Return to the Dashboard tab and refresh the page
4. **Expected Result**: Total students count should increase by 1
5. Repeat with faculty, departments, or subjects
6. **Expected Result**: All counts should update in real-time

### Backend Logs to Verify
Check server console for logs like:
```
[Stats] Fetching admin statistics...
[Stats] Admin statistics: { totalStudents: X, totalFaculty: Y, totalDepartments: Z, totalSubjects: W }
[Stats] Fetching department-wise statistics...
[Stats] Found statistics for X departments
```

## Common Issues and Troubleshooting

### Issue: "Failed to fetch statistics"
- **Cause**: Backend server not running or API endpoint not accessible
- **Fix**: Ensure server is running on port 5000 and check CORS settings

### Issue: "401 Unauthorized" errors
- **Cause**: User not logged in or JWT token expired
- **Fix**: Log out and log in again

### Issue: Backend endpoints return 404
- **Cause**: Routes not properly registered in server/src/index.js
- **Fix**: Verify the timetable and stats routes are imported and registered

### Issue: Database connection errors
- **Cause**: Supabase credentials incorrect or database not set up
- **Fix**: Check .env file and verify Supabase project is configured

## Success Criteria

All fixes are considered successful if:

1. ✅ Faculty can see their assigned classes (or empty state if none)
2. ✅ Faculty attendance/marks pages don't show errors for faculty without classes
3. ✅ Admin can create timetable entries without errors
4. ✅ Timetable conflict validation prevents double-booking
5. ✅ Admin dashboard shows real counts from database
6. ✅ Dashboard statistics update when data changes
7. ✅ All backend endpoints log appropriately
8. ✅ No console errors in browser or server

## Notes

- All changes use the existing backend API pattern (JWT auth, role-based access)
- No changes to database schema required
- All new endpoints follow RESTful conventions
- Error handling is consistent with existing codebase
