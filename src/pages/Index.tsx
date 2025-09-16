import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthForm from '@/components/AuthForm';
import TimeTracker from '@/components/TimeTracker';
import TimeLogTable from '@/components/TimeLogTable';
import QuickActions from '@/components/QuickActions';
import Dashboard from '@/components/Dashboard';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if user is already signed in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUsername(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const handleSignIn = (user: string) => {
    setUsername(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    localStorage.removeItem('currentUser');
  };

  const handleEntryAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return <AuthForm onSignIn={handleSignIn} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Legal Time Tracker
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {username}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="tracker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="tracker" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tracker
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <QuickActions 
                  username={username}
                  onEntryAdded={handleEntryAdded}
                  onLogout={handleLogout}
                />
                <TimeTracker onEntryAdded={handleEntryAdded} />
              </div>
              
              <div className="lg:col-span-3">
                <TimeLogTable refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard refreshTrigger={refreshTrigger} />
          </TabsContent>

          <TabsContent value="log" className="space-y-6">
            <TimeLogTable refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
