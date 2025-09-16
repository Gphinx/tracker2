import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { TimeTracker } from './components/TimeTracker';
import { QuickActions } from './components/QuickActions';
import { Dashboard } from './components/Dashboard';
import { TimeLogTable } from './components/TimeLogTable';
import { AdminDatabase } from './components/AdminDatabase';
import RealTimeActivityMonitor from './components/RealTimeActivityMonitor';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Clock, BarChart3, History, Database, Moon, Sun, LogOut, Shield, Activity } from 'lucide-react';
import { TimeEntry, User, UserActivity, Theme } from './types';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [theme, setTheme] = useState<Theme>('light');
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard for admin/manager
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('timeTracker_user');
    const savedUsers = localStorage.getItem('timeTracker_users');
    const savedEntries = localStorage.getItem('timeTracker_entries');
    const savedActiveEntry = localStorage.getItem('timeTracker_activeEntry');
    const savedTheme = localStorage.getItem('timeTracker_theme');
    const savedActivities = localStorage.getItem('timeTracker_activities');
    const savedOnlineUsers = localStorage.getItem('timeTracker_onlineUsers');

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({
          ...parsedUser,
          createdAt: new Date(parsedUser.createdAt)
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('timeTracker_user');
      }
    }

    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers).map((u: User) => ({
          ...u,
          createdAt: new Date(u.createdAt)
        }));
        setUsers(parsedUsers);
      } catch (error) {
        console.error('Error parsing saved users:', error);
        setUsers([]);
      }
    }

    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries).map((entry: TimeEntry) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: entry.endTime ? new Date(entry.endTime) : undefined,
          createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
          updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : new Date()
        }));
        setEntries(parsedEntries);
      } catch (error) {
        console.error('Error parsing saved entries:', error);
        setEntries([]);
      }
    }

    if (savedActiveEntry) {
      try {
        const parsedActiveEntry = JSON.parse(savedActiveEntry);
        setActiveEntry({
          ...parsedActiveEntry,
          startTime: new Date(parsedActiveEntry.startTime),
          endTime: parsedActiveEntry.endTime ? new Date(parsedActiveEntry.endTime) : undefined,
          createdAt: parsedActiveEntry.createdAt ? new Date(parsedActiveEntry.createdAt) : new Date(),
          updatedAt: parsedActiveEntry.updatedAt ? new Date(parsedActiveEntry.updatedAt) : new Date()
        });
      } catch (error) {
        console.error('Error parsing saved active entry:', error);
        localStorage.removeItem('timeTracker_activeEntry');
      }
    }

    if (savedTheme) {
      setTheme(savedTheme as Theme);
    }

    if (savedActivities) {
      try {
        const parsedActivities = JSON.parse(savedActivities).map((activity: UserActivity) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }));
        setActivities(parsedActivities);
      } catch (error) {
        console.error('Error parsing saved activities:', error);
        setActivities([]);
      }
    }

    if (savedOnlineUsers) {
      try {
        setOnlineUsers(JSON.parse(savedOnlineUsers));
      } catch (error) {
        console.error('Error parsing saved online users:', error);
        setOnlineUsers([]);
      }
    }
  }, []);

  // Set default tab based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'manager') {
        setActiveTab('dashboard'); // Default to dashboard for admin/manager
      } else {
        setActiveTab('tracker'); // Default to tracker for regular users
      }
    }
  }, [user]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('timeTracker_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('timeTracker_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    localStorage.setItem('timeTracker_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (activeEntry) {
      localStorage.setItem('timeTracker_activeEntry', JSON.stringify(activeEntry));
    } else {
      localStorage.removeItem('timeTracker_activeEntry');
    }
  }, [activeEntry]);

  useEffect(() => {
    localStorage.setItem('timeTracker_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('timeTracker_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('timeTracker_onlineUsers', JSON.stringify(onlineUsers));
  }, [onlineUsers]);

  // Track user activity and online status
  useEffect(() => {
    if (user) {
      addOnlineUser(user.username);
      addUserActivity(user.id, user.username, 'login', 'User logged in');
      
      // Track page visibility
      const handleVisibilityChange = () => {
        if (document.hidden) {
          removeOnlineUser(user.username);
          addUserActivity(user.id, user.username, 'logout', 'User went offline');
        } else {
          addOnlineUser(user.username);
          addUserActivity(user.id, user.username, 'login', 'User came back online');
        }
      };

      const handleBeforeUnload = () => {
        removeOnlineUser(user.username);
        addUserActivity(user.id, user.username, 'logout', 'User closed the application');
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [user]);

  // Track tab changes
  useEffect(() => {
    if (user) {
      const tabNames: { [key: string]: string } = {
        'tracker': 'Time Tracker',
        'dashboard': 'Dashboard',
        'timelog': 'Time Log',
        'database': 'Admin Database',
        'activity': 'Real-time Activity'
      };
      
      addUserActivity(
        user.id, 
        user.username, 
        'view_page', 
        `Viewing ${tabNames[activeTab] || activeTab}`
      );
    }
  }, [activeTab, user]);

  const addUserActivity = (userId: string, username: string, action: string, details?: string) => {
    const newActivity: UserActivity = {
      id: Date.now().toString(),
      userId,
      username,
      action,
      timestamp: new Date(),
      details,
      isOnline: onlineUsers.includes(username)
    };

    setActivities(prev => [newActivity, ...prev.slice(0, 99)]); // Keep only last 100 activities
  };

  const addOnlineUser = (username: string) => {
    setOnlineUsers(prev => {
      if (!prev.includes(username)) {
        return [...prev, username];
      }
      return prev;
    });
  };

  const removeOnlineUser = (username: string) => {
    setOnlineUsers(prev => prev.filter(user => user !== username));
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    
    // Update users list if user doesn't exist
    setUsers(prevUsers => {
      const existingUser = prevUsers.find(u => u.id === loggedInUser.id);
      if (!existingUser) {
        return [...prevUsers, loggedInUser];
      }
      return prevUsers.map(u => u.id === loggedInUser.id ? loggedInUser : u);
    });

    addOnlineUser(loggedInUser.username);
    addUserActivity(loggedInUser.id, loggedInUser.username, 'login', 'User successfully logged in');
  };

  const handleLogout = () => {
    if (user) {
      removeOnlineUser(user.username);
      addUserActivity(user.id, user.username, 'logout', 'User logged out');
    }

    // End any active session before logout
    if (activeEntry) {
      handleEndEntry(activeEntry.id);
    }
    
    setUser(null);
    setActiveEntry(null);
    localStorage.removeItem('timeTracker_user');
    localStorage.removeItem('timeTracker_activeEntry');
    setActiveTab('tracker');
  };

  const handleAddEntry = (entryData: Omit<TimeEntry, 'id'>) => {
    // End any existing active entry first
    if (activeEntry) {
      handleEndEntry(activeEntry.id);
    }

    const now = new Date();
    const newEntry: TimeEntry = {
      ...entryData,
      id: Date.now().toString(),
      userId: user?.id || '',
      createdAt: now,
      updatedAt: now
    };

    setEntries(prev => [...prev, newEntry]);
    setActiveEntry(newEntry);

    if (user) {
      addUserActivity(
        user.id,
        user.username,
        'start_task',
        `Started task: ${entryData.task}`
      );
    }
  };

  const handleEndEntry = (id: string) => {
    const endTime = new Date();
    
    setEntries(prev => 
      prev.map(entry => {
        if (entry.id === id) {
          const totalTime = endTime.getTime() - entry.startTime.getTime();
          return {
            ...entry,
            endTime,
            totalTime,
            updatedAt: new Date()
          };
        }
        return entry;
      })
    );

    if (activeEntry?.id === id) {
      setActiveEntry(null);
      if (user) {
        addUserActivity(
          user.id,
          user.username,
          'complete_task',
          `Completed task: ${activeEntry.task}`
        );
      }
    }
  };

  const handleDeleteEntry = (id: string) => {
    const entryToDelete = entries.find(entry => entry.id === id);
    setEntries(prev => prev.filter(entry => entry.id !== id));
    
    if (activeEntry?.id === id) {
      setActiveEntry(null);
    }

    if (user && entryToDelete) {
      addUserActivity(
        user.id,
        user.username,
        'delete_task',
        `Deleted task: ${entryToDelete.task}`
      );
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user?.id === updatedUser.id) {
      setUser(updatedUser);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Check if user has admin/manager access
  const hasAdminAccess = user && (user.role === 'admin' || user.role === 'manager');
  
  // Check if user is regular user (not admin/manager)
  const isRegularUser = user && user.role === 'user';

  if (!user) {
    return (
      <div className={`min-h-screen transition-colors ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-white/50'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-screen p-4">
          <AuthForm onLogin={handleLogin} theme={theme} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Legal Time Tracker
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className={`h-4 w-4 ${
                  user.role === 'admin' ? 'text-red-500' : 
                  user.role === 'manager' ? 'text-blue-500' : 'text-gray-500'
                }`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {user.username} ({user.role})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${
            hasAdminAccess ? 'grid-cols-4' : 'grid-cols-3'
          } ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            {/* Only show Tracker tab for regular users */}
            {isRegularUser && (
              <TabsTrigger 
                value="tracker" 
                className={`flex items-center gap-2 ${
                  theme === 'dark' ? 'data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white' : ''
                }`}
              >
                <Clock className="h-4 w-4" />
                Tracker
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="dashboard"
              className={`flex items-center gap-2 ${
                theme === 'dark' ? 'data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white' : ''
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="timelog"
              className={`flex items-center gap-2 ${
                theme === 'dark' ? 'data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white' : ''
              }`}
            >
              <History className="h-4 w-4" />
              Time Log
            </TabsTrigger>
            {hasAdminAccess && (
              <TabsTrigger 
                value="database"
                className={`flex items-center gap-2 ${
                  theme === 'dark' ? 'data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white' : ''
                }`}
              >
                <Database className="h-4 w-4" />
                Database
              </TabsTrigger>
            )}
            {hasAdminAccess && (
              <TabsTrigger 
                value="activity"
                className={`flex items-center gap-2 ${
                  theme === 'dark' ? 'data-[state=active]:bg-gray-700 text-gray-300 data-[state=active]:text-white' : ''
                }`}
              >
                <Activity className="h-4 w-4" />
                Live Activity
              </TabsTrigger>
            )}
          </TabsList>

          {/* Only show Tracker content for regular users */}
          {isRegularUser && (
            <TabsContent value="tracker" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimeTracker
                  onAddEntry={handleAddEntry}
                  activeEntry={activeEntry}
                  onStopTracking={() => activeEntry && handleEndEntry(activeEntry.id)}
                  theme={theme}
                />
                <QuickActions
                  onAddEntry={handleAddEntry}
                  activeEntry={activeEntry}
                  onStopTracking={() => activeEntry && handleEndEntry(activeEntry.id)}
                  theme={theme}
                />
              </div>
            </TabsContent>
          )}

          <TabsContent value="dashboard">
            <Dashboard
              entries={entries.filter(entry => entry.userId === user.id)}
              activeEntry={activeEntry}
              theme={theme}
            />
          </TabsContent>

          <TabsContent value="timelog">
            <TimeLogTable
              entries={entries.filter(entry => entry.userId === user.id)}
              onDeleteEntry={handleDeleteEntry}
              theme={theme}
            />
          </TabsContent>

          {hasAdminAccess && (
            <TabsContent value="database">
              <AdminDatabase
                entries={entries}
                users={users}
                currentUser={user}
                theme={theme}
                onDeleteEntry={handleDeleteEntry}
                onUpdateUser={handleUpdateUser}
              />
            </TabsContent>
          )}

          {hasAdminAccess && (
            <TabsContent value="activity">
              <RealTimeActivityMonitor
                activities={activities}
                onlineUsers={onlineUsers}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}

export default App;
