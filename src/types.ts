import { Timestamp } from 'firebase/firestore';

export interface Weather {
  morning: string;
  afternoon: string;
  evening: string;
}

export interface Personnel {
  total: number;
  positions: { [role: string]: number };
  contractors: { [name: string]: number };
}

export interface Financials {
  contractValue: number;
  temporaryOutput: number;
  remainingValue: number;
}

export interface ProgressItem {
  id: number;
  description: string;
  unit: string;
  target: number;
  completedToday: number;
  totalCompleted: number;
  progress: number;
  planStart: string;
  planEnd: string;
  issues: string;
  notes: string;
}

export interface DailyReport {
  id?: string;
  date: string; // ISO date string
  weather: Weather;
  personnel: Personnel;
  financials: Financials;
  civilItems: ProgressItem[];
  equipmentItems: ProgressItem[];
  dailyTasks: string[];
  nextDayPlan: string[];
  issues: string[];
  proposals: string[];
  photos: string[];
  authorUid: string;
  createdAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
}
