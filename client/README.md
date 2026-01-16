# College ERP - Frontend

This is the frontend application for the College Management System, built with React, Vite, and TypeScript.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **Supabase** - Backend integration
- **React Query** - Server state management
- **Sonner** - Toast notifications

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (DataTable, Modal, etc.)
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── layouts/            # Layout components
│   └── DashboardLayout.tsx
├── lib/               # Utility libraries
│   ├── supabase.ts    # Supabase client
│   └── utils.ts       # Helper functions
├── pages/             # Page components
│   ├── admin/         # Admin pages
│   ├── faculty/       # Faculty pages
│   ├── student/       # Student pages
│   ├── Login.tsx      # Login page
│   └── ChangePassword.tsx
├── services/          # API service layer
│   └── api.ts         # Supabase API calls
├── App.tsx            # Main app component
└── main.tsx          # App entry point
```

## Features

### For All Users
- 🔐 Secure authentication with Supabase
- 🎨 Modern, responsive UI with Tailwind CSS
- 🌙 Professional theme and design
- 🔄 Real-time data updates
- 🔔 Toast notifications for actions
- ⚡ Fast performance with Vite

### Admin Dashboard
- Manage departments, sections, subjects
- Manage students and faculty
- Create timetable assignments
- View system-wide statistics

### Faculty Dashboard
- View assigned classes
- Mark student attendance
- Enter student marks
- View teaching schedule

### Student Dashboard
- View attendance records
- View marks and grades
- View weekly timetable
- Update profile

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_SUPABASE_URL | Your Supabase project URL | Yes |
| VITE_SUPABASE_ANON_KEY | Your Supabase anon/public key | Yes |
| VITE_API_URL | Backend API URL (optional) | No |

## Development

### Adding New Pages

1. Create page component in `src/pages/[role]/`
2. Import and add route in `src/App.tsx`
3. Update sidebar navigation if needed

### Adding New API Calls

1. Add API method to `src/services/api.ts`
2. Define TypeScript interfaces for data
3. Use in components with proper error handling

### Styling

- Use Tailwind utility classes
- Follow existing component patterns
- Use shadcn/ui components when possible
- Maintain consistent spacing and colors

## Building for Production

```bash
npm run build
```

Build output will be in `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## Deployment

The frontend can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting service

Make sure to:
1. Set environment variables in deployment platform
2. Update CORS settings in backend
3. Update Supabase Auth redirect URLs

## Troubleshooting

### Cannot connect to Supabase
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Check browser console for errors
- Ensure Supabase project is active

### Build errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist .vite`
- Check TypeScript errors: `npm run lint`

### Authentication issues
- Check that email auth is enabled in Supabase
- Verify user has correct role in user_metadata
- Check browser localStorage for auth tokens

## Contributing

1. Follow existing code style
2. Write TypeScript types for all data
3. Add proper error handling
4. Test thoroughly before committing
5. Update documentation as needed

## License

MIT

---

For more information, see the main README in the repository root.
