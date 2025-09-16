import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Database, 
  Download, 
  Search, 
  Filter, 
  Users, 
  Clock, 
  TrendingUp,
  UserCheck,
  UserX,
  User
} from 'lucide-react';
import { TimeEntry, User as UserType, UserStats } from '../types';

interface AdminDatabaseProps {
  currentUser: UserType;
}

export const AdminDatabase: React.FC<AdminDatabaseProps> = ({ currentUser }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data generation with login status
  const generateMockData = () => {
    const mockUsers: UserType[] = [
      { 
        id: '1', 
        username: 'AJ', 
        email: 'AJ@example.com', 
        role: 'user', 
        createdAt: '2024-01-15T08:00:00Z',
        loginStatus: currentUser.id === '1' ? 'active' : (Math.random() > 0.4 ? 'active' : 'inactive'),
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
        lastActivity: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
      },
      { 
        id: '2', 
        username: 'Ron', 
        email: 'Ron@example.com', 
        role: 'User', 
        createdAt: '2024-01-10T09:00:00Z',
        loginStatus: currentUser.id === '2' ? 'active' : (Math.random() > 0.3 ? 'active' : 'inactive'),
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
        lastActivity: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
      },
      { 
        id: '3', 
        username: 'admin', 
        email: 'admin@example.com', 
        role: 'admin', 
        createdAt: '2024-01-05T10:00:00Z',
        loginStatus: currentUser.id === '3' ? 'active' : (Math.random() > 0.2 ? 'active' : 'inactive'),
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
        lastActivity: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
      },
      { 
        id: '4', 
        username: 'Armand', 
        email: 'Armand@example.com', 
        role: 'user', 
        createdAt: '2024-01-20T11:00:00Z',
        loginStatus: currentUser.id === '4' ? 'active' : (Math.random() > 0.5 ? 'active' : 'inactive'),
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
        lastActivity: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
      },
      { 
        id: '5', 
        username: 'Ray', 
        email: 'Ray@example.com', 
        role: 'manager', 
        createdAt: '2024-01-12T12:00:00Z',
        loginStatus: currentUser.id === '5' ? 'active' : (Math.random() > 0.6 ? 'active' : 'inactive'),
        lastLogin: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
        lastActivity: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString()
      },
    ];

    // Ensure current user is marked as active
    const updatedUsers = mockUsers.map(user => 
      user.id === currentUser.id 
        ? { ...user, loginStatus: 'active' as const, lastActivity: new Date().toISOString() }
        : user
    );

    const mockEntries: TimeEntry[] = [];
    const mockStats: Record<string, UserStats> = {};

    updatedUsers.forEach(user => {
      const entryCount = Math.floor(Math.random() * 10) + 5;
      let totalTime = 0;
      let productiveTime = 0;

      for (let i = 0; i < entryCount; i++) {
        const duration = Math.floor(Math.random() * 120) + 15;
        const isProductive = Math.random() > 0.3;
        const entry: TimeEntry = {
          id: `${user.id}-${i}`,
          userId: user.id,
          username: user.username,
          task: isProductive 
            ? ['Contract Review', 'Client Meeting', 'Legal Research', 'Document Drafting'][Math.floor(Math.random() * 4)]
            : ['Break', 'Personal Time', 'Administrative'][Math.floor(Math.random() * 3)],
          duration,
          isProductive,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString(),
        };
        mockEntries.push(entry);
        totalTime += duration;
        if (isProductive) productiveTime += duration;
      }

      mockStats[user.id] = {
        totalTime,
        productiveTime,
        nonProductiveTime: totalTime - productiveTime,
        tasksCompleted: entryCount,
        avgSessionTime: Math.floor(totalTime / entryCount),
        loginStatus: user.loginStatus || 'inactive',
        lastActivity: user.lastActivity || new Date().toISOString(),
      };
    });

    setUsers(updatedUsers);
    setTimeEntries(mockEntries);
    setUserStats(mockStats);
  };

  useEffect(() => {
    generateMockData();
  }, [currentUser.id]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.loginStatus === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const exportData = () => {
    const csvContent = [
      ['Username', 'Email', 'Role', 'Login Status', 'Total Time', 'Productive Time', 'Tasks Completed', 'Last Activity'].join(','),
      ...filteredUsers.map(user => {
        const stats = userStats[user.id];
        return [
          user.username,
          user.email,
          user.role,
          user.loginStatus || 'inactive',
          formatDuration(stats?.totalTime || 0),
          formatDuration(stats?.productiveTime || 0),
          stats?.tasksCompleted || 0,
          formatTimeAgo(user.lastActivity || user.createdAt)
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_database_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.loginStatus === 'active').length;
  const totalHours = Object.values(userStats).reduce((sum, stats) => sum + stats.totalTime, 0);
  const avgProductivity = totalHours > 0 
    ? (Object.values(userStats).reduce((sum, stats) => sum + stats.productiveTime, 0) / totalHours) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <UserCheck className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{activeUsers}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{formatDuration(totalHours)}</p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold">{avgProductivity.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Avg Productivity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Database */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            User Database - All Users
          </CardTitle>
          <CardDescription>
            Complete overview of all users with login status and productivity metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* User List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const stats = userStats[user.id];
              const isCurrentUser = user.id === currentUser.id;
              
              return (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg border ${
                    isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <User className="h-10 w-10 text-gray-600" />
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            user.loginStatus === 'active' ? 'bg-green-500' : 'bg-gray-500'
                          }`}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {user.username}
                            {isCurrentUser && (
                              <span className="text-blue-600 text-sm ml-1">(You)</span>
                            )}
                          </span>
                          <Badge variant={user.role === 'admin' ? 'default' : user.role === 'manager' ? 'secondary' : 'outline'}>
                            {user.role}
                          </Badge>
                          {user.loginStatus === 'active' ? (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          ) : (
                            <UserX className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Status: 
                            <Badge 
                              variant={user.loginStatus === 'active' ? 'default' : 'secondary'}
                              className={`ml-1 ${user.loginStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              {user.loginStatus === 'active' ? 'Online' : 'Offline'}
                            </Badge>
                          </span>
                          <span>Last activity: {formatTimeAgo(user.lastActivity || user.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">{formatDuration(stats?.totalTime || 0)}</div>
                          <div className="text-muted-foreground">Total Time</div>
                        </div>
                        <div>
                          <div className="font-medium">{formatDuration(stats?.productiveTime || 0)}</div>
                          <div className="text-muted-foreground">Productive</div>
                        </div>
                        <div>
                          <div className="font-medium">{stats?.tasksCompleted || 0}</div>
                          <div className="text-muted-foreground">Tasks</div>
                        </div>
                        <div>
                          <div className="font-medium">
                            {stats?.totalTime ? Math.round((stats.productiveTime / stats.totalTime) * 100) : 0}%
                          </div>
                          <div className="text-muted-foreground">Efficiency</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
