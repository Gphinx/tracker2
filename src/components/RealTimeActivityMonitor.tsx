import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Activity, Clock } from 'lucide-react';
import { TimeEntry, User as UserType } from '@/types';

interface RealTimeActivityMonitorProps {
  currentUser: UserType;
  users: UserType[];
  timeEntries: TimeEntry[];
}

interface UserActivity {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastActivity: string;
  currentTask?: string;
  todayHours: number;
}

const RealTimeActivityMonitor: React.FC<RealTimeActivityMonitorProps> = ({
  currentUser,
  users,
  timeEntries
}) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loggedInUsers, setLoggedInUsers] = useState<Set<string>>(new Set());

  // Simulate tracking logged-in users (in a real app, this would come from your auth system)
  useEffect(() => {
    // Initialize with current user as logged in
    setLoggedInUsers(new Set([currentUser.id]));
    
    // Simulate other users logging in/out randomly for demo purposes
    const interval = setInterval(() => {
      setLoggedInUsers(prev => {
        const newSet = new Set(prev);
        
        // Always keep current user logged in
        newSet.add(currentUser.id);
        
        // Randomly add/remove other users
        users.forEach(user => {
          if (user.id !== currentUser.id) {
            if (Math.random() > 0.7) {
              if (newSet.has(user.id)) {
                newSet.delete(user.id);
              } else {
                newSet.add(user.id);
              }
            }
          }
        });
        
        return newSet;
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [currentUser.id, users]);

  useEffect(() => {
    const updateActivities = () => {
      const now = new Date();
      const today = now.toDateString();

      const userActivities: UserActivity[] = users.map(user => {
        const isLoggedIn = loggedInUsers.has(user.id);
        
        // Get today's entries for this user
        const todayEntries = timeEntries.filter(entry => 
          entry.userId === user.id && 
          new Date(entry.startTime).toDateString() === today
        );

        // Calculate total hours for today
        const todayHours = todayEntries.reduce((total, entry) => {
          if (entry.endTime) {
            const start = new Date(entry.startTime);
            const end = new Date(entry.endTime);
            return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          }
          return total;
        }, 0);

        // Find current active task (if any)
        const activeEntry = todayEntries.find(entry => !entry.endTime);
        
        // Determine last activity time
        let lastActivity = 'No activity today';
        if (todayEntries.length > 0) {
          const latestEntry = todayEntries.sort((a, b) => 
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          )[0];
          
          if (isLoggedIn && activeEntry) {
            lastActivity = 'Currently active';
          } else {
            const lastTime = new Date(latestEntry.endTime || latestEntry.startTime);
            const timeDiff = now.getTime() - lastTime.getTime();
            const minutesAgo = Math.floor(timeDiff / (1000 * 60));
            
            if (minutesAgo < 60) {
              lastActivity = `${minutesAgo} minutes ago`;
            } else {
              const hoursAgo = Math.floor(minutesAgo / 60);
              lastActivity = `${hoursAgo} hours ago`;
            }
          }
        }

        return {
          id: user.id,
          name: user.name,
          role: user.role,
          status: isLoggedIn ? 'Active' : 'Inactive',
          lastActivity,
          currentTask: activeEntry?.task,
          todayHours: Math.round(todayHours * 100) / 100
        };
      });

      setActivities(userActivities);
    };

    updateActivities();
    const interval = setInterval(updateActivities, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [users, timeEntries, loggedInUsers]);

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-500' : 'bg-gray-400';
  };

  const getStatusVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Activity Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusColor(activity.status)}`}
                    />
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-sm text-gray-500">
                      {activity.role} • {activity.lastActivity}
                    </div>
                    {activity.currentTask && (
                      <div className="text-sm text-blue-600 mt-1">
                        Working on: {activity.currentTask}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="h-3 w-3" />
                      {activity.todayHours}h today
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activities.filter(a => a.status === 'Active').length}
              </div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {activities.filter(a => a.status === 'Inactive').length}
              </div>
              <div className="text-sm text-gray-500">Inactive Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activities.filter(a => a.currentTask).length}
              </div>
              <div className="text-sm text-gray-500">Currently Working</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(activities.reduce((sum, a) => sum + a.todayHours, 0) * 100) / 100}h
              </div>
              <div className="text-sm text-gray-500">Total Hours Today</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeActivityMonitor;
