import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { toast } from 'sonner';

// Constants for academic year calculations
const MAX_STUDY_YEARS = 4; // 4-year degree program
const MAX_SEMESTERS = 8; // 2 semesters per year for 4 years
const SEMESTER_1_START_MONTH = 6; // July (month index 6, 0-based)
const SEMESTER_1_END_MONTH = 11; // December (month index 11, 0-based)

export default function StudentProfile() {
  const { user, loading } = useAuth();

  const handleChangePassword = () => {
    toast.info('Password change feature coming soon!');
  };

  if (loading) {
    return <LoadingSpinner className="min-h-[400px]" />;
  }

  if (!user?.profile) {
    return <ErrorMessage message="Unable to load profile. Please try logging in again." />;
  }

  const profile = user.profile;
  console.log('[StudentProfile] User profile data:', JSON.stringify(profile, null, 2));
  console.log('[StudentProfile] Section data:', JSON.stringify(profile.sections, null, 2));
  console.log('[StudentProfile] Department data:', JSON.stringify(profile.sections?.departments, null, 2));
  
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Calculate current year and semester
  // Fix year calculation to cap at 4 years for 4-year programs
  const currentYear = new Date().getFullYear();
  const yearsPassed = currentYear - profile.admission_year;
  const studyYear = Math.min(yearsPassed + 1, MAX_STUDY_YEARS);
  const displayYear = studyYear === MAX_STUDY_YEARS ? 'Final Year' : `Year ${studyYear}`;
  
  // Fix semester calculation - semester based on current month
  // July-December (months 6-11) = Semester 1, January-June (months 0-5) = Semester 2
  const currentMonth = new Date().getMonth(); // 0-11
  const semesterInYear = (currentMonth >= SEMESTER_1_START_MONTH && currentMonth <= SEMESTER_1_END_MONTH) ? 1 : 2;
  const semester = Math.min((studyYear - 1) * 2 + semesterInYear, MAX_SEMESTERS);
  const displaySemester = semester > MAX_SEMESTERS ? 'Final' : `Semester ${semester}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">My Profile</h1>
      <div className="card-base p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center text-4xl font-bold text-white mx-auto md:mx-0">{initials}</div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries({ 
              'Roll Number': profile.roll_no, 
              'Full Name': profile.name, 
              'Email': user.email, 
              'Department': profile.sections?.departments?.name || 'Not Assigned - Contact Admin',
              'Section': profile.sections?.name || 'Not Assigned - Contact Admin', 
              'Year': displayYear, 
              'Semester': displaySemester,
              'Admission Year': profile.admission_year
            }).map(([label, value]) => (
              <div key={label}>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-border">
          <button 
            onClick={handleChangePassword}
            className="btn-primary"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
