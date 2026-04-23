'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getUser } from '@/lib/api';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

interface Permission {
  id: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
  label: string;
  permissions: Permission[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role?: Role;
}

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Kullanıcının permission listesini çıkar
  const getUserPermissions = (): string[] => {
    if (!user || !user.role) return [];
    return user.role.permissions?.map(p => p.name) || [];
  };

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true); // Mobile'da başlangıçta kapalı
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    getUser(token)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await logout(token);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileClose = () => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-100">
        <p className="text-zinc-600">Yukleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        userName={user?.name || ''}
        userRole={user?.role?.label || ''}
        userPermissions={getUserPermissions()}
        isMobile={isMobile}
        onMobileClose={handleMobileClose}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          userName={user?.name || ''} 
          onLogout={handleLogout}
          onMenuToggle={isMobile ? handleSidebarToggle : undefined}
        />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}