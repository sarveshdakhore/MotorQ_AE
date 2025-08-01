"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, BarChart3, Settings, Home, Car } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      href: '/parking',
      label: 'Parking',
      icon: Car,
    },
    {
      href: '/maintenance',
      label: 'Maintenance',
      icon: Settings,
    },
  ];

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">MotorQ</h1>
            </div>
            <nav className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => router.push(item.href)}
                    className="flex items-center"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
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
  );
}