"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, Mail, Calendar, User, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Welcome Card */}
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Welcome back!
                </CardTitle>
                <CardDescription>
                  You're successfully logged in to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                    <Mail className="mr-3 h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Email Address</p>
                      <p className="text-lg text-blue-800">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <Calendar className="mr-3 h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Member Since</p>
                      <p className="text-lg text-green-800">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded mt-1">
                      {user.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                      Active
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Authentication</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      OTP Verified
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common actions you can perform from your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => router.push('/users')}
                  >
                    <Users className="h-6 w-6" />
                    <span>Manage Users</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={() => router.push('/')}
                  >
                    <User className="h-6 w-6" />
                    <span>View Profile</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    disabled
                  >
                    <Mail className="h-6 w-6" />
                    <span>Update Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    disabled
                  >
                    <Calendar className="h-6 w-6" />
                    <span>View Activity</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center space-y-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-6 w-6" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}