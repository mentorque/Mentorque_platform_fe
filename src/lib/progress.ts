// src/lib/progress.ts
import { auth } from "@/lib/firebase";

export type WeekItem = {
  week: number;
  title: string;
  description: string;
  done: boolean;
  completedAt: string | null;
  notes: string;
  color: string;
};

export const DEFAULT_WEEKS: WeekItem[] = [
  { 
    week: 1, 
    title: "Resume Review & Analysis", 
    description: "Get your resume reviewed and analysed by your personal mentor",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-blue-50 border-blue-200"
  },
  { 
    week: 2, 
    title: "Resume Rebuild & Optimization", 
    description: "Completely rebuild your resume with expert guidance and ATS optimization",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-green-50 border-green-200"
  },
  { 
    week: 3, 
    title: "AI Assistant & Job Tracker Setup, Portfolio Building", 
    description: "Get your AI assistant setup and build a stunning portfolio that showcases your skills and projects",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-purple-50 border-purple-200"
  },
  { 
    week: 4, 
    title: "Cheat Sheet & Mock Interview Prep Plan", 
    description: "Get your cheat sheets and comprehensive mock interview preparation plan",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-orange-50 border-orange-200"
  },
  { 
    week: 5, 
    title: "Elevator Pitch", 
    description: "Perfect your 30-second introduction",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-green-100 border-green-200"
  },
  { 
    week: 6, 
    title: "Competency Interview", 
    description: "Behavioral questions and soft skills assessment",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-yellow-100 border-yellow-200"
  },
  { 
    week: 7, 
    title: "Technical Interview", 
    description: "Coding challenges and technical deep-dives",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-orange-100 border-orange-200"
  },
  { 
    week: 8, 
    title: "Final Behavioral Round", 
    description: "Executive-level behavioral assessment",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-red-100 border-red-200"
  },
];

// API base URL - adjust based on your backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://platformbackend-production.up.railway.app';

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  return {
    'x-user-id': user.uid,
    'Content-Type': 'application/json'
  };
}

export async function initUserProgressIfMissing(uid: string) {
  // This is now handled automatically by the API when getting progress
  // The API will create default progress if it doesn't exist
  return await getUserProgress();
}

export async function getUserProgress(): Promise<WeekItem[]> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/progress`, {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error('Failed to get user progress');
  }

  const data = await response.json();
  return data.weeks;
}

export function onUserProgress(uid: string, cb: (weeks: WeekItem[] | null) => void) {
  // For now, we'll use polling instead of real-time updates
  // This can be enhanced later with WebSockets or Server-Sent Events
  let intervalId: NodeJS.Timeout;
  
  const poll = async () => {
    try {
      const weeks = await getUserProgress();
      cb(weeks);
    } catch (error) {
      console.error('Error polling progress:', error);
      cb(null);
    }
  };

  // Initial fetch
  poll();
  
  // Poll every 5 seconds
  intervalId = setInterval(poll, 5000);

  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}

export async function updateWeekDone(uid: string, index: number, nextDone: boolean) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/progress/week/${index}/done`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ done: nextDone })
  });

  if (!response.ok) {
    throw new Error('Failed to update week status');
  }

  const data = await response.json();
  return data.weeks;
}

export async function updateWeekNotes(uid: string, index: number, notes: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/progress/week/${index}/notes`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ notes })
  });

  if (!response.ok) {
    throw new Error('Failed to update week notes');
  }

  const data = await response.json();
  return data.weeks;
}
