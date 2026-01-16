# Testing Guide - College Management System

This guide helps you test the fully integrated College Management System with Supabase.

## Prerequisites

Before testing, ensure you have:
1. ✅ Created a Supabase project
2. ✅ Run the schema.sql in Supabase SQL Editor
3. ✅ Set up environment variables in both client and server
4. ✅ Created an admin user in Supabase Auth
5. ✅ Both frontend and backend servers are running

## Quick Setup Checklist

### Supabase Setup
- [ ] Project created on supabase.com
- [ ] Database schema created (run `server/database/schema.sql`)
- [ ] Email auth enabled
- [ ] Admin user created with role metadata

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

## Test Scenarios

### 1. Authentication Tests

#### Test Admin Login
1. Navigate to `http://localhost:5173/login`
2. Select **Administrator** role
3. Enter admin credentials
4. Expected: Redirect to `/admin` dashboard
5. Verify: User name appears in topbar

#### Test Invalid Login
1. Try logging in with wrong credentials
2. Expected: Error message displayed
3. Expected: Stay on login page

#### Test Role Verification
1. Try logging in as admin with faculty credentials
2. Expected: Error message about invalid role

### 2. Admin Dashboard Tests

#### Department Management
1. Navigate to Admin → Departments
2. **Create**:
   - Click "Add Department"
   - Enter: Name = "Computer Science", Code = "CS"
   - Click Submit
   - Expected: Success toast, department appears in table
3. **Update**:
   - Click edit icon on a department
   - Change name to "Computer Science Engineering"
   - Expected: Success toast, name updated in table
4. **Delete**:
   - Click delete icon on a department
   - Confirm deletion
   - Expected: Success toast, department removed from table

#### Section Management
1. Navigate to Admin → Sections
2. **Create**:
   - Click "Add Section"
   - Select Department: "Computer Science"
   - Year: 1
   - Name: "A"
   - Expected: Success toast, section appears in table
3. Verify: Department name is displayed in table

#### Subject Management
1. Navigate to Admin → Subjects
2. **Create**:
   - Click "Add Subject"
   - Select Department: "Computer Science"
   - Semester: 1
   - Name: "Data Structures"
   - Code: "CS101"
   - Expected: Success toast, subject appears in table

#### Student Management
1. Navigate to Admin → Students
2. **Create**:
   - Click "Add Student"
   - Roll No: "CS001"
   - Name: "John Doe"
   - Email: "john@example.com"
   - Password: "student123" (default)
   - Section: Select from dropdown
   - Admission Year: 2024
   - Expected: Success toast, student appears in table
3. Verify: Student can login with these credentials
4. **Update**: Edit student details
5. **Delete**: Remove a student

#### Faculty Management
1. Navigate to Admin → Faculty
2. **Create**:
   - Click "Add Faculty"
   - Employee ID: "FAC001"
   - Name: "Dr. Jane Smith"
   - Email: "jane@example.com"
   - Password: "faculty123" (default)
   - Department: Select from dropdown
   - Expected: Success toast, faculty appears in table
3. Verify: Faculty can login with these credentials

#### Timetable/Assignments
1. Navigate to Admin → Assignments
2. **Create**:
   - Click "Add Assignment"
   - Select Section, Subject, Faculty
   - Day: "Monday"
   - Period: 1
   - Expected: Success toast, assignment appears in table
3. Create multiple assignments for different days/periods

### 3. Faculty Dashboard Tests

#### Login as Faculty
1. Logout from admin
2. Login with faculty credentials created above
3. Expected: Redirect to `/faculty` dashboard

#### Dashboard View
1. Verify: Today's schedule is displayed
2. Verify: Assigned classes count is correct
3. Verify: Subjects taught are listed

#### Attendance Marking
1. Navigate to Faculty → Attendance
2. Select a class (subject + section)
3. Expected: Students list loads
4. Select a date
5. Mark some students as Present, some as Absent
6. Click "Save Attendance"
7. Expected: Success toast
8. Refresh page and verify attendance is saved

#### Marks Entry
1. Navigate to Faculty → Marks
2. Select a class (subject + section)
3. Expected: Students list loads with existing marks
4. Enter marks:
   - Internal 1: 25/25
   - Internal 2: 23/25
   - External: 45/50
5. Click "Save Marks"
6. Expected: Success toast
7. Refresh and verify marks are saved

### 4. Student Dashboard Tests

#### Login as Student
1. Logout from faculty
2. Login with student credentials
3. Expected: Redirect to `/student` dashboard

#### Dashboard View
1. Verify: Attendance percentage is displayed
2. Verify: Today's timetable shows classes
3. Verify: Statistics are calculated correctly

#### View Attendance
1. Navigate to Student → Attendance
2. Verify: Subject-wise attendance is displayed
3. Verify: Percentage calculation is correct
4. Verify: Overall attendance matches dashboard

#### View Marks
1. Navigate to Student → Marks
2. Verify: Marks for all subjects are displayed
3. Verify: Internal 1, Internal 2, External shown
4. Verify: Total and grade calculated correctly

#### View Timetable
1. Navigate to Student → Timetable
2. Verify: Weekly timetable displayed in grid
3. Verify: Days as columns, periods as rows
4. Verify: Subject and faculty names shown

#### View Profile
1. Navigate to Student → Profile
2. Verify: Student details displayed (name, roll no, section, department)
3. Verify: Current year and semester calculated

### 5. Password Change Tests

#### Admin Password Change
1. Login as admin
2. Navigate to `/admin/change-password`
3. Enter current password
4. Enter new password (at least 6 characters)
5. Confirm new password
6. Click "Change Password"
7. Expected: Success toast, redirect back
8. Logout and login with new password

#### Faculty/Student Password Change
- Repeat above steps for faculty at `/faculty/change-password`
- Repeat for student at `/student/change-password`

### 6. Error Handling Tests

#### Network Error Simulation
1. Stop the Supabase project
2. Try to load any data page
3. Expected: Error message displayed with retry button
4. Click retry
5. Expected: Error persists

#### Empty State Tests
1. Create a new section without students
2. Navigate to that section's attendance
3. Expected: Empty state message displayed

#### Validation Tests
1. Try creating department without name
2. Expected: Browser validation error
3. Try creating student with invalid email
4. Expected: Error message

### 7. Loading States Tests

1. Navigate to any data-heavy page
2. Expected: Loading spinner displayed
3. Expected: Data loads and spinner disappears

### 8. Logout Test

1. Click user menu in topbar
2. Click "Logout"
3. Expected: Redirect to login page
4. Try accessing `/admin` directly
5. Expected: Redirect to login page

## Common Issues and Solutions

### Issue: Cannot login
**Solution:**
- Check that user exists in Supabase Auth
- Verify user_metadata contains correct role
- Check email/password are correct

### Issue: Database errors
**Solution:**
- Ensure schema.sql has been run
- Check foreign key constraints
- Verify RLS policies are enabled

### Issue: Empty data
**Solution:**
- Create data in order: Departments → Sections → Subjects → Students/Faculty → Timetable
- Check that relations are correct

### Issue: Attendance/Marks not saving
**Solution:**
- Verify faculty is assigned to the subject
- Check that students belong to the section
- Ensure date format is correct

## Success Criteria

Your implementation is successful if:
- ✅ All user roles can login
- ✅ Admin can perform all CRUD operations
- ✅ Faculty can mark attendance and enter marks
- ✅ Students can view their data
- ✅ All navigation works
- ✅ Error messages are user-friendly
- ✅ Loading states are smooth
- ✅ Data persists after refresh
- ✅ Password change works
- ✅ Logout works correctly

## Performance Checklist

- [ ] Pages load within 2 seconds
- [ ] No console errors in browser
- [ ] No memory leaks
- [ ] Smooth transitions and animations
- [ ] Mobile responsive (test on different screen sizes)

## Security Checklist

- [ ] Passwords not visible in network requests
- [ ] Service role key not exposed in frontend
- [ ] RLS policies prevent unauthorized access
- [ ] JWT tokens stored securely
- [ ] Session persists after refresh
- [ ] Logout clears all auth data

## Next Steps

After successful testing:
1. Set up production Supabase project
2. Configure production environment variables
3. Deploy frontend to Vercel/Netlify
4. Deploy backend to Railway/Render
5. Set up monitoring and logging
6. Configure backup strategy
7. Set up CI/CD pipeline

## Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Verify Supabase dashboard for data
4. Review README.md for setup instructions
5. Check database schema in `server/database/README.md`
