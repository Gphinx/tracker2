import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/types';

interface AuthFormProps {
  onLogin: (user: User) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.password) {
      setError('Username and password are required');
      return false;
    }

    if (!isLogin) {
      if (!formData.email) {
        setError('Email is required for registration');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login logic
        const users = JSON.parse(localStorage.getItem('ltt_users') || '[]');
        
        // Check for admin/manager with password 123456
        let user = null;
        if (formData.password === '123456') {
          user = users.find((u: User) => 
            u.username.toLowerCase() === formData.username.toLowerCase() && u.status === 'active'
          );
        } else {
          // For regular users (Ron, Aj, Rey, Gen, Armand) - any password works for demo
          user = users.find((u: User) => 
            u.username.toLowerCase() === formData.username.toLowerCase() && 
            u.status === 'active' && 
            u.role === 'user'
          );
        }

        if (user) {
          // Log activity
          const activityLogs = JSON.parse(localStorage.getItem('ltt_activity_logs') || '[]');
          activityLogs.push({
            id: Date.now().toString(),
            userId: user.id,
            username: user.username,
            action: 'Login',
            timestamp: new Date().toISOString(),
            details: 'User logged in successfully'
          });
          localStorage.setItem('ltt_activity_logs', JSON.stringify(activityLogs));

          onLogin(user);
        } else {
          setError('Invalid credentials or inactive account');
        }
      } else {
        // Registration logic - Default role is 'user'
        const users = JSON.parse(localStorage.getItem('ltt_users') || '[]');
        
        // Check if user already exists
        if (users.some((u: User) => u.username === formData.username || u.email === formData.email)) {
          setError('Username or email already exists');
          return;
        }

        // Create new user with default role 'user'
        const newUser: User = {
          id: Date.now().toString(),
          username: formData.username,
          email: formData.email,
          role: 'user', // Default role for new signups
          status: 'active',
          created_at: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('ltt_users', JSON.stringify(users));

        // Log registration activity
        const activityLogs = JSON.parse(localStorage.getItem('ltt_activity_logs') || '[]');
        activityLogs.push({
          id: Date.now().toString(),
          userId: newUser.id,
          username: newUser.username,
          action: 'Registration',
          timestamp: new Date().toISOString(),
          details: 'New user account created with role: user'
        });
        localStorage.setItem('ltt_activity_logs', JSON.stringify(activityLogs));

        // Auto-login after successful registration
        onLogin(newUser);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize with demo users if none exist
  React.useEffect(() => {
    const existingUsers = localStorage.getItem('ltt_users');
    if (!existingUsers) {
      const demoUsers: User[] = [
        // Admin and Manager accounts with password 123456
        {
          id: '1',
          username: 'admin',
          email: 'admin@legalfirm.com',
          role: 'admin',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          username: 'manager',
          email: 'manager@legalfirm.com',
          role: 'manager',
          status: 'active',
          created_at: new Date().toISOString()
        },
        // Regular users - Ron, Aj, Rey, Gen, Armand
        {
          id: '3',
          username: 'Ron',
          email: 'ron@legalfirm.com',
          role: 'user',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          username: 'Aj',
          email: 'aj@legalfirm.com',
          role: 'user',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          username: 'Rey',
          email: 'rey@legalfirm.com',
          role: 'user',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '6',
          username: 'Gen',
          email: 'gen@legalfirm.com',
          role: 'user',
          status: 'active',
          created_at: new Date().toISOString()
        },
        {
          id: '7',
          username: 'Armand',
          email: 'armand@legalfirm.com',
          role: 'user',
          status: 'active',
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('ltt_users', JSON.stringify(demoUsers));
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Legal Time Tracker
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">
                {isLogin ? 'Password' : 'Password'}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({
                  username: '',
                  email: '',
                  password: '',
                  confirmPassword: ''
                });
              }}
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </Button>
          </div>

          {/* Demo credentials info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <div className="mb-2">
              <p className="font-medium text-red-600">Admin/Manager Access:</p>
              <p><strong>admin</strong> / 123456 (Admin)</p>
              <p><strong>manager</strong> / 123456 (Manager)</p>
            </div>
            <div>
              <p className="font-medium text-blue-600">Regular Users:</p>
              <p><strong>Ron, Aj, Rey, Gen, Armand</strong> (any password)</p>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              New signups automatically get 'user' role
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
