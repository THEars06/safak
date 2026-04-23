'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  Users,
  User,
  Key,
  Building2,
  Wrench,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface MenuItem {
  href?: string;
  label: string;
  icon: React.ReactNode;
  permission?: string; // Hangi permission gerekli
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { href: '/panel', label: 'Anasayfa', icon: <Home size={20} /> },
  {
    label: 'Kullanici Yonetimi',
    icon: <Users size={20} />,
    permission: 'users.view',
    children: [
      { href: '/panel/users', label: 'Kullanicilar', icon: <User size={18} />, permission: 'users.view' },
      { href: '/panel/users/roles', label: 'Roller', icon: <Key size={18} />, permission: 'roles.view' },
    ],
  },
  { href: '/panel/customers', label: 'Musteriler', icon: <Building2 size={20} />, permission: 'customers.view' },
  { href: '/panel/services', label: 'Servis / Montaj', icon: <Wrench size={20} />, permission: 'services.view' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  userName: string;
  userRole: string;
  userPermissions: string[];
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ 
  collapsed, 
  onToggle, 
  userName, 
  userRole, 
  userPermissions,
  isMobile = false,
  onMobileClose
}: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<string[]>(['Kullanici Yonetimi']);

  const toggleMenu = (label: string) => {
    if (openMenus.includes(label)) {
      setOpenMenus(openMenus.filter((m) => m !== label));
    } else {
      setOpenMenus([...openMenus, label]);
    }
  };

  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true; // Permission yoksa herkes görebilir
    return userPermissions.includes(permission);
  };

  const renderMenuItem = (item: MenuItem) => {
    if (!hasPermission(item.permission)) return null;

    if (item.children) {
      const visibleChildren = item.children.filter(child => hasPermission(child.permission));
      if (visibleChildren.length === 0) return null;

      const hasActiveChild = visibleChildren.some((child) => pathname === child.href);
      const isOpen = openMenus.includes(item.label);

      return (
        <li key={item.label}>
          <button
            onClick={() => {
              toggleMenu(item.label);
              if (isMobile && onMobileClose) {
                // Mobile'da menü açıldığında sidebar'ı kapatma
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              hasActiveChild
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            <span className="text-zinc-400">{item.icon}</span>
            {(!collapsed || isMobile) && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>
          
          {isOpen && (!collapsed || isMobile) && (
            <ul className="mt-1 ml-4 pl-4 border-l border-zinc-700 space-y-1">
              {visibleChildren.map((child) => {
                const isActive = pathname === child.href;
                return (
                  <li key={child.href}>
                    <Link
                      href={child.href!}
                      onClick={() => {
                        if (isMobile && onMobileClose) {
                          onMobileClose();
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-zinc-600 text-white'
                          : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      <span className="text-zinc-500">{child.icon}</span>
                      <span>{child.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    const isActive = pathname === item.href;
    return (
      <li key={item.href}>
        <Link
          href={item.href!}
          onClick={() => {
            if (isMobile && onMobileClose) {
              onMobileClose();
            }
          }}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
          }`}
          title={collapsed && !isMobile ? item.label : undefined}
        >
          <span className="text-zinc-400">{item.icon}</span>
          {(!collapsed || isMobile) && <span>{item.label}</span>}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onMobileClose}
        />
      )}
      
      <aside
        className={`bg-zinc-800 min-h-screen flex flex-col transition-all duration-300 z-50 ${
          isMobile 
            ? `fixed left-0 top-0 h-full transform ${collapsed ? '-translate-x-full' : 'translate-x-0'} w-64 lg:relative lg:translate-x-0`
            : collapsed ? 'w-16' : 'w-64'
        }`}
      >
      {/* Header */}
      <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
        {(!collapsed || isMobile) && (
          <h1 className="text-lg font-bold text-white">Teknik Servis</h1>
        )}
        <button
          onClick={onToggle}
          className={`text-zinc-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-zinc-700 ${
            collapsed && !isMobile ? 'mx-auto' : ''
          }`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="p-3 flex-1">
        <ul className="space-y-1">
          {menuItems.map(renderMenuItem)}
        </ul>
      </nav>

      {/* Profile */}
      <div className="p-3 border-t border-zinc-700">
        <div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md bg-zinc-700/50 ${
            collapsed && !isMobile ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-zinc-600 flex items-center justify-center text-white text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-zinc-400">{userRole || 'Kullanici'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
