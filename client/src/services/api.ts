import { supabase } from '@/lib/supabase';

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Helper function for HTTP requests
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
}

// Types
export interface Department {
  id: string;
  name: string;
  code: string;
  created_at?: string;
}

export interface Section {
  id: string;
  department_id: string;
  year: number;
  name: string;
  created_at?: string;
  departments?: Department;
}

export interface Subject {
  id: string;
  department_id: string;
  semester: number;
  name: string;
  code: string;
  created_at?: string;
  departments?: Department;
}

export interface Student {
  id: string;
  user_id: string;
  roll_no: string;
  name: string;
  section_id: string;
  admission_year: number;
  created_at?: string;
  sections?: Section & { departments?: Department };
}

export interface Faculty {
  id: string;
  user_id: string;
  employee_id: string;
  name: string;
  department_id: string;
  created_at?: string;
  departments?: Department;
  timetable_count?: number;
  hasAssignments?: boolean;
}

export interface Timetable {
  id: string;
  section_id: string;
  subject_id: string;
  faculty_id: string;
  day: string;
  period: number;
  created_at?: string;
  sections?: Section;
  subjects?: Subject;
  faculty?: Faculty;
}

export interface Attendance {
  id: string;
  student_id: string;
  subject_id: string;
  date: string;
  present: boolean;
  created_at?: string;
}

export interface Marks {
  id: string;
  student_id: string;
  subject_id: string;
  internal1?: number;
  internal2?: number;
  external?: number;
  created_at?: string;
  subjects?: Subject;
}

// Admin APIs
export const departmentsApi = {
  getAll: async (): Promise<Department[]> => {
    const response = await fetchWithAuth('/admin/departments');
    return response.json();
  },

  create: async (department: Omit<Department, 'id' | 'created_at'>): Promise<Department> => {
    const response = await fetchWithAuth('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(department),
    });
    const result = await response.json();
    // Backend returns { success: true, data: [...] }
    if (!result.data || !result.data[0]) {
      throw new Error('Invalid response format from server');
    }
    return result.data[0];
  },

  update: async (id: string, department: Partial<Department>): Promise<Department> => {
    const response = await fetchWithAuth(`/admin/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(department),
    });
    const result = await response.json();
    if (!result.data || !result.data[0]) {
      throw new Error('Invalid response format from server');
    }
    return result.data[0];
  },

  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/admin/departments/${id}`, {
      method: 'DELETE',
    });
  },
};

export const sectionsApi = {
  getAll: async (): Promise<Section[]> => {
    const response = await fetchWithAuth('/admin/sections');
    return response.json();
  },

  create: async (section: Omit<Section, 'id' | 'created_at'>): Promise<Section> => {
    const response = await fetchWithAuth('/admin/sections', {
      method: 'POST',
      body: JSON.stringify(section),
    });
    const result = await response.json();
    if (!result.data || !result.data[0]) {
      throw new Error('Invalid response format from server');
    }
    return result.data[0];
  },

  update: async (id: string, section: Partial<Section>): Promise<Section> => {
    const response = await fetchWithAuth(`/admin/sections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(section),
    });
    const result = await response.json();
    if (!result.data || !result.data[0]) {
      throw new Error('Invalid response format from server');
    }
    return result.data[0];
  },

  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/admin/sections/${id}`, {
      method: 'DELETE',
    });
  },
};

export const subjectsApi = {
  getAll: async (): Promise<Subject[]> => {
    const response = await fetchWithAuth('/admin/subjects');
    return response.json();
  },

  create: async (subject: Omit<Subject, 'id' | 'created_at'>): Promise<Subject> => {
    const response = await fetchWithAuth('/admin/subjects', {
      method: 'POST',
      body: JSON.stringify(subject),
    });
    const result = await response.json();
    if (!result.data || !result.data[0]) {
      throw new Error('Invalid response format from server');
    }
    return result.data[0];
  },

  update: async (id: string, subject: Partial<Subject>): Promise<Subject> => {
    const response = await fetchWithAuth(`/admin/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subject),
    });
    const result = await response.json();
    if (!result.data || !result.data[0]) {
      throw new Error('Invalid response format from server');
    }
    return result.data[0];
  },

  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/admin/subjects/${id}`, {
      method: 'DELETE',
    });
  },
};

export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    const response = await fetchWithAuth('/admin/students');
    return response.json();
  },

  getBySection: async (sectionId: string): Promise<Student[]> => {
    // Check user role to determine endpoint
    const { data: { session } } = await supabase.auth.getSession();
    const role = session?.user?.user_metadata?.role;
    
    console.log(`[API] Fetching students for section ${sectionId} with role: ${role}`);
    
    // Faculty use their own endpoint with permission check, admin uses admin endpoint
    const endpoint = role === 'faculty' 
      ? `/faculty/students/${sectionId}`
      : `/admin/students?section_id=${sectionId}`;
    
    console.log(`[API] Using endpoint: ${endpoint}`);
    
    try {
      const response = await fetchWithAuth(endpoint);
      const data = await response.json();
      console.log(`[API] Loaded ${data?.length || 0} students`);
      return data;
    } catch (error) {
      console.error(`[API] Error fetching students:`, error);
      throw error;
    }
  },

  create: async (student: Omit<Student, 'id' | 'created_at' | 'user_id'> & { email: string; password: string }): Promise<Student> => {
    const response = await fetchWithAuth('/admin/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
    const result = await response.json();
    if (!result.data || !result.data[0]) {
      throw new Error('Invalid response format from server');
    }
    return result.data[0];
  },

  update: async (id: string, student: Partial<Student>): Promise<Student> => {
    const response = await fetchWithAuth(`/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    });
    const result = await response.json();
    if (!result.data || !result.data[0]) {
      throw new Error('Invalid response format from server');
    }
    return result.data[0];
  },

  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/admin/students/${id}`, {
      method: 'DELETE',
    });
  },
};

export const facultyApi = {
  getAll: async (): Promise<Faculty[]> => {
    const response = await fetchWithAuth('/admin/faculty');
    return response.json();
  },

  create: async (faculty: Omit<Faculty, 'id' | 'created_at' | 'user_id'> & { email: string; password: string }): Promise<Faculty> => {
    const response = await fetchWithAuth('/admin/faculty', {
      method: 'POST',
      body: JSON.stringify(faculty),
    });
    const result = await response.json();
    if (!result.data || !result.data[0]) {
      throw new Error('Invalid response format from server');
    }
    return result.data[0];
  },

  update: async (id: string, faculty: Partial<Faculty>): Promise<Faculty> => {
    const response = await fetchWithAuth(`/admin/faculty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(faculty),
    });
    const result = await response.json();
    if (!result.data || !result.data[0]) {
      throw new Error('Invalid response format from server');
    }
    return result.data[0];
  },

  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/admin/faculty/${id}`, {
      method: 'DELETE',
    });
  },
};

export const timetableApi = {
  getAll: async (): Promise<Timetable[]> => {
    const response = await fetchWithAuth('/timetable');
    return response.json();
  },

  getBySection: async (sectionId: string): Promise<Timetable[]> => {
    const response = await fetchWithAuth(`/timetable/section/${sectionId}`);
    return response.json();
  },

  getByFaculty: async (): Promise<Timetable[]> => {
    // Use backend endpoint which extracts faculty ID from JWT token
    const response = await fetchWithAuth('/faculty/classes');
    return response.json();
  },

  create: async (timetable: Omit<Timetable, 'id' | 'created_at'>): Promise<Timetable> => {
    const response = await fetchWithAuth('/timetable', {
      method: 'POST',
      body: JSON.stringify(timetable),
    });
    return response.json();
  },

  update: async (id: string, timetable: Partial<Timetable>): Promise<Timetable> => {
    const response = await fetchWithAuth(`/timetable/${id}`, {
      method: 'PUT',
      body: JSON.stringify(timetable),
    });
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/timetable/${id}`, {
      method: 'DELETE',
    });
  },
};

// Faculty APIs
export const attendanceApi = {
  markAttendance: async (records: Omit<Attendance, 'id' | 'created_at'>[]): Promise<void> => {
    await fetchWithAuth('/faculty/attendance', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  },

  getBySubject: async (subjectId: string, startDate?: string, endDate?: string): Promise<Attendance[]> => {
    const response = await fetchWithAuth(`/faculty/attendance/${subjectId}`);
    return response.json();
  },

  getByStudent: async (studentId: string): Promise<Attendance[]> => {
    const response = await fetchWithAuth('/student/attendance');
    return response.json();
  },
};

export const marksApi = {
  enterMarks: async (marks: Omit<Marks, 'id' | 'created_at'>): Promise<Marks> => {
    await fetchWithAuth('/faculty/marks', {
      method: 'POST',
      body: JSON.stringify({ records: [marks] }),
    });
    // Backend returns { success: true, message: "..." }
    // We return the input marks object since the API doesn't return the created record
    return marks as Marks;
  },

  getBySubject: async (subjectId: string): Promise<Marks[]> => {
    const response = await fetchWithAuth(`/faculty/marks/${subjectId}`);
    return response.json();
  },

  getByStudent: async (studentId: string): Promise<Marks[]> => {
    const response = await fetchWithAuth('/student/marks');
    return response.json();
  },
};

// Student APIs
export const studentProfileApi = {
  getProfile: async (_userId: string): Promise<Student | null> => {
    // userId parameter is ignored - backend uses JWT token to identify user
    const response = await fetchWithAuth('/student/profile');
    return response.json();
  },
};

// Stats APIs
export interface AdminStats {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  totalSubjects: number;
}

export interface DepartmentStats {
  id: string;
  name: string;
  code: string;
  studentsCount: number;
  facultyCount: number;
}

export const statsApi = {
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await fetchWithAuth('/stats/admin');
    return response.json();
  },

  getDepartmentStats: async (): Promise<DepartmentStats[]> => {
    const response = await fetchWithAuth('/stats/departments');
    return response.json();
  },
};
