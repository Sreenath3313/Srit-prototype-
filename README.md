# College Management System (ERP)

A comprehensive web-based Enterprise Resource Planning system for college administration, built with React, Node.js, and Supabase.

## Features

### For Administrators
- 📊 Complete CRUD operations for:
  - Departments
  - Sections (by year and department)
  - Subjects
  - Students
  - Faculty
  - Timetable assignments
- 👥 User management with automatic account creation
- 📋 Dashboard with system-wide statistics

### For Faculty
- 📝 Mark and manage student attendance
- 📊 Enter and manage student marks (Internal 1, Internal 2, External)
- 📅 View assigned classes and timetable
- 📈 Dashboard with teaching statistics

### For Students
- 📊 View attendance records (overall and subject-wise)
- 📝 View marks and grades
- 📅 View weekly timetable
- 👤 Profile management
- 🔐 Password change

## Tech Stack

### Frontend
- **React** with **Vite** - Fast, modern build tool
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **React Router** - Client-side routing
- **@supabase/supabase-js** - Supabase client library
- **React Query** - Server state management
- **Sonner** - Toast notifications

### Backend
- **Node.js** with **Express** - REST API server
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
- **JWT** - Token-based authentication

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18 or higher
- **npm** or **yarn**
- A **Supabase** account ([supabase.com](https://supabase.com))

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `server/database/schema.sql`
3. Enable **Email Auth** in Authentication settings:
   - Go to Authentication → Settings
   - Enable Email provider
   - Optionally disable email confirmation for development
4. Copy your project credentials:
   - Project URL
   - Anon/Public key
   - Service Role key (keep this secret!)

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=5000
CLIENT_URL=http://localhost:8080
JWT_SECRET=your_random_jwt_secret_here
```

Start the server:

```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The app will run on `http://localhost:8080`

### 4. Create First Admin User

You need to create an admin user manually in Supabase:

1. Go to **Authentication** in your Supabase dashboard
2. Click **Add User** → **Create new user**
3. Enter:
   - Email: `admin@college.edu`
   - Password: `admin123` (or your preferred password)
   - Auto Confirm User: **Yes**
4. After creating the user, click on the user and add user metadata:
   ```json
   {
     "role": "admin",
     "name": "System Administrator"
   }
   ```

Now you can login with these credentials!

### 5. (Optional) Seed Sample Data

For testing, you can add sample departments, sections, and subjects through the admin panel after logging in.

## Project Structure

```
College-Site/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── layouts/        # Layout components
│   │   ├── lib/           # Utility libraries (Supabase client)
│   │   ├── pages/         # Page components
│   │   │   ├── admin/     # Admin pages
│   │   │   ├── faculty/   # Faculty pages
│   │   │   └── student/   # Student pages
│   │   └── services/      # API service layer
│   ├── .env.example       # Environment variables template
│   └── package.json       # Frontend dependencies
│
├── server/                # Node.js backend application
│   ├── src/
│   │   ├── config/        # Configuration (Supabase client)
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware (auth, roles)
│   │   └── routes/        # API routes
│   ├── database/          # Database schema and migrations
│   ├── .env.example       # Environment variables template
│   └── package.json       # Backend dependencies
│
└── README.md             # This file
```

## Database Schema

The system uses the following main tables:

- **departments** - Academic departments
- **sections** - Class sections (linked to departments)
- **subjects** - Course subjects (linked to departments)
- **students** - Student records (linked to auth.users)
- **faculty** - Faculty records (linked to auth.users)
- **timetable** - Class schedule (links sections, subjects, and faculty)
- **attendance** - Student attendance records
- **marks** - Student marks (internal and external)

See `server/database/README.md` for detailed schema documentation.

## Default Credentials

After setting up the admin user manually, you can create faculty and students through the admin panel. The system automatically generates accounts for them.

**Default passwords for auto-created users:**
- Faculty: `faculty123`
- Student: `student123`

Users can change their passwords after first login.

## Development

### Running in Development Mode

Frontend:
```bash
cd client
npm run dev
```

Backend:
```bash
cd server
npm run dev
```

### Building for Production

Frontend:
```bash
cd client
npm run build
```

The build output will be in `client/dist/`

Backend:
```bash
cd server
npm start
```

## Security Features

- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Faculty, Student)
- ✅ Row Level Security (RLS) in Supabase
- ✅ Password hashing via Supabase Auth
- ✅ Secure environment variable management
- ✅ CORS protection
- ✅ Input validation

## Troubleshooting

### CORS Errors
- **Issue**: Browser shows CORS errors when frontend tries to access backend
- **Solution**: 
  - Ensure backend `.env` has `CLIENT_URL=http://localhost:8080`
  - Restart the backend server after changing `.env`
  - Check browser console for specific CORS error details
  - Verify both frontend (port 8080) and backend (port 5000) are running

### Cannot login
- Ensure you've created the admin user with correct user_metadata
- Check that email auth is enabled in Supabase
- Verify environment variables are correct

### Database errors
- Ensure you've run the schema.sql in Supabase
- Check that RLS policies are enabled
- Verify service role key is correct

### Connection errors
- Check that backend is running on port 5000
- Check that frontend is running on port 8080
- Verify CORS settings in server (`CLIENT_URL=http://localhost:8080`)
- Ensure Supabase URL is correct
- Check that `VITE_API_URL` in frontend `.env` is set to `http://localhost:5000/api`

### Backend won't start
- Ensure you've created `.env` file in server directory (`cp .env.example .env`)
- Verify all required environment variables are set
- Check that `SUPABASE_SERVICE_ROLE_KEY` is correct
- Run `npm install` in server directory if dependencies are missing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue on GitHub.

---

Built with ❤️ for educational institutions
