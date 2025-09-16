export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
  task: string;
  duration: number;
  timestamp: string;
  type: 'productive' | 'non-productive' | 'break';
  category?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface UserStats {
  userId: string;
  username: string;
  totalHours: number;
  productiveHours: number;
  nonProductiveHours: number;
  breakHours: number;
  lastActivity: string;
  status: 'online' | 'offline' | 'away';
}
