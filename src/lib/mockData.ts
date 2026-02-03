import { User } from './mockAuth';

export interface Team {
  id: string;
  name: string;
  members: User[];
  problemId?: string;
  status: 'pending' | 'approved' | 'rejected';
  instituteId: string;
  mentorId?: string;
  progress: number; // 0-100
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
}

export interface Submission {
  id: string;
  teamId: string;
  problemId: string;
  fileUrl: string;
  description: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
}

export interface Institute {
  id: string;
  name: string;
  spocId: string;
}

// Initial Mock Data
const INITIAL_PROBLEMS: Problem[] = [
  {
    id: 'ID-01',
    title: 'AI-Powered Healthcare Diagnosis',
    description: 'Develop an AI system that can assist doctors in diagnosing diseases from medical images and patient data.',
    category: 'Healthcare',
    difficulty: 'Hard',
    tags: ['AI/ML', 'Healthcare', 'Computer Vision']
  },

  {
    id: 'ID-03',
    title: 'Sustainable Agriculture Platform',
    description: 'Build a platform that helps farmers optimize crop yields using IoT sensors and predictive analytics.',
    category: 'Agriculture',
    difficulty: 'Medium',
    tags: ['IoT', 'Agriculture', 'ML']
  }
];

const INITIAL_INSTITUTES: Institute[] = [
  { id: 'inst1', name: 'MIT World Peace University', spocId: 'spoc1' },
  { id: 'inst2', name: 'COEP Technological University', spocId: 'spoc2' }
];

const INITIAL_TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Code Warriors',
    members: [],
    problemId: 'p1',
    status: 'approved',
    instituteId: 'inst1',
    progress: 45
  },
  {
    id: 't2',
    name: 'Innovators',
    members: [],
    status: 'pending',
    instituteId: 'inst1',
    progress: 0
  }
];

const INITIAL_SUBMISSIONS: Submission[] = [];

// Helper to initialize local storage
export const initializeMockData = () => {
  if (!localStorage.getItem('problems')) {
    localStorage.setItem('problems', JSON.stringify(INITIAL_PROBLEMS));
  }
  if (!localStorage.getItem('institutes')) {
    localStorage.setItem('institutes', JSON.stringify(INITIAL_INSTITUTES));
  }
  if (!localStorage.getItem('teams')) {
    localStorage.setItem('teams', JSON.stringify(INITIAL_TEAMS));
  }
  if (!localStorage.getItem('submissions')) {
    localStorage.setItem('submissions', JSON.stringify(INITIAL_SUBMISSIONS));
  }

  // Ensure we have some users if not already present (re-using mockAuth logic conceptually)
  // But here we might want to ensure specific test users exist in the 'registeredUsers' key
  // handled by mockAuth.ts usually, but we can add some here if needed.
};

// Data Accessors
export const getStoredData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error);
    return [];
  }
};

export const setStoredData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};
