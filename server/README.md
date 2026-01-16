# College ERP - Backend API

This is the backend API server for the College Management System, built with Node.js, Express, and Supabase.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
- **JWT** - Token-based authentication
- **Zod** - Schema validation
- **bcrypt** - Password hashing (used by Supabase)
- **dotenv** - Environment configuration

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account and project

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Edit `.env` with your credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_random_jwt_secret_here
```

4. Initialize database:
   - Go to your Supabase project
   - Run the SQL from `database/schema.sql` in SQL Editor
   - This creates all tables, indexes, and RLS policies

5. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

## Project Structure

```
src/
├── config/
│   └── supabase.js      # Supabase client configuration
├── controllers/         # Route controllers
│   ├── admin.controller.js
│   ├── auth.controller.js
│   ├── faculty.controller.js
│   └── student.controller.js
├── middleware/          # Express middleware
│   ├── auth.middleware.js
│   └── role.middleware.js
├── routes/             # API routes
│   ├── admin.routes.js
│   ├── auth.routes.js
│   ├── faculty.routes.js
│   └── student.routes.js
└── index.js           # App entry point
database/
├── schema.sql         # Database schema
└── README.md         # Database documentation
```

## API Endpoints

### Authentication

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "admin|faculty|student"
  },
  "token": "jwt-token"
}
```

#### POST /api/auth/logout
Logout current user.

#### GET /api/auth/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

### Admin Routes

All admin routes require authentication and admin role.

**Base URL:** `/api/admin`

#### Departments
- `GET /departments` - Get all departments
- `POST /departments` - Create department
- `PUT /departments/:id` - Update department
- `DELETE /departments/:id` - Delete department

#### Sections
- `GET /sections` - Get all sections
- `POST /sections` - Create section
- `PUT /sections/:id` - Update section
- `DELETE /sections/:id` - Delete section

#### Subjects
- `GET /subjects` - Get all subjects
- `POST /subjects` - Create subject
- `PUT /subjects/:id` - Update subject
- `DELETE /subjects/:id` - Delete subject

#### Students
- `GET /students` - Get all students
- `POST /students` - Create student (with auth user)
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

#### Faculty
- `GET /faculty` - Get all faculty
- `POST /faculty` - Create faculty (with auth user)
- `PUT /faculty/:id` - Update faculty
- `DELETE /faculty/:id` - Delete faculty

### Faculty Routes

All faculty routes require authentication and faculty role.

**Base URL:** `/api/faculty`

#### Timetable
- `GET /timetable` - Get assigned classes
- `GET /timetable/:id` - Get specific timetable entry

#### Attendance
- `POST /attendance` - Mark attendance for a class
- `GET /attendance/:subjectId` - Get attendance records for subject

#### Marks
- `POST /marks` - Enter/update marks for student
- `GET /marks/:subjectId` - Get marks for subject

### Student Routes

All student routes require authentication and student role.

**Base URL:** `/api/student`

#### Profile
- `GET /profile` - Get student profile

#### Attendance
- `GET /attendance` - Get own attendance records

#### Marks
- `GET /marks` - Get own marks

#### Timetable
- `GET /timetable` - Get section timetable

## Middleware

### Authentication Middleware
`requireAuth` - Verifies JWT token and attaches user to request.

```javascript
router.get('/protected', requireAuth, (req, res) => {
  // req.user is available
});
```

### Role Middleware
`requireRole(roles)` - Verifies user has required role.

```javascript
router.get('/admin-only', requireAuth, requireRole('admin'), (req, res) => {
  // Only admins can access
});
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| SUPABASE_URL | Supabase project URL | Yes |
| SUPABASE_ANON_KEY | Supabase anon/public key | Yes |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key (secret!) | Yes |
| PORT | Server port | No (default: 5000) |
| CLIENT_URL | Frontend URL for CORS | No (default: http://localhost:5173) |
| JWT_SECRET | Secret for JWT signing | Yes |

## Database

The API uses Supabase PostgreSQL. See `database/README.md` for schema documentation.

### Row Level Security

- Service role key bypasses RLS (used by backend)
- Anon key respects RLS (used by frontend)
- Students can only access their own data
- Faculty can access their assigned classes
- Admins have full access via service role

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Security

### Best Practices Implemented

1. ✅ **Environment Variables** - Secrets stored in .env
2. ✅ **JWT Authentication** - Secure token-based auth
3. ✅ **Role-Based Access Control** - Middleware checks user roles
4. ✅ **CORS** - Configured for specific origins
5. ✅ **Input Validation** - Zod schemas for request validation
6. ✅ **Row Level Security** - Database-level access control
7. ✅ **Password Hashing** - Handled by Supabase Auth
8. ✅ **SQL Injection Prevention** - Parameterized queries via Supabase

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET
- [ ] Keep SERVICE_ROLE_KEY secret (never expose to frontend)
- [ ] Enable RLS on all tables
- [ ] Set proper CORS origins
- [ ] Use HTTPS in production
- [ ] Implement rate limiting (optional)
- [ ] Set up monitoring and logging

## Development

### Adding New Routes

1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Import and mount in `src/index.js`

Example:
```javascript
// src/controllers/example.controller.js
export async function getExample(req, res) {
  try {
    // Your logic here
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// src/routes/example.routes.js
import express from 'express';
import { getExample } from '../controllers/example.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/', requireAuth, getExample);
export default router;

// src/index.js
import exampleRoutes from './routes/example.routes.js';
app.use('/api/example', exampleRoutes);
```

### Testing API

Use tools like:
- **Postman** - API testing platform
- **Thunder Client** - VS Code extension
- **curl** - Command line tool

Example curl request:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@college.edu","password":"admin123"}'

# Get departments (with token)
curl http://localhost:5000/api/admin/departments \
  -H "Authorization: Bearer <your-token>"
```

## Deployment

### Production Checklist

1. Set production environment variables
2. Use production Supabase project
3. Enable HTTPS
4. Configure proper CORS origins
5. Set up logging and monitoring
6. Implement rate limiting
7. Set up health checks
8. Configure auto-scaling (optional)

### Deployment Platforms

- **Railway** - Easy deployment with PostgreSQL
- **Render** - Free tier available
- **Heroku** - Popular PaaS
- **AWS EC2** - Full control
- **DigitalOcean** - Simple VPS

## Troubleshooting

### Cannot connect to Supabase
- Verify SUPABASE_URL is correct
- Check SUPABASE_SERVICE_ROLE_KEY
- Ensure Supabase project is active

### Authentication errors
- Check JWT_SECRET is set
- Verify user role in user_metadata
- Check token expiration

### Database errors
- Ensure schema.sql has been run
- Check RLS policies
- Verify foreign key constraints

### CORS errors
- Update CLIENT_URL in .env
- Check CORS configuration in index.js

## Contributing

1. Follow existing code style
2. Add proper error handling
3. Validate input data
4. Test thoroughly
5. Update API documentation

## License

MIT

---

For more information, see the main README in the repository root.
