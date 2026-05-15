'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, CalendarCheck, BookOpen, LogOut, Settings, Bus } from 'lucide-react';

interface SidebarProps {
  role: 'STUDENT' | 'ADMIN';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/student/wallet', icon: Wallet, label: 'My Wallet' },
    { href: '/student/attendance', icon: CalendarCheck, label: 'Attendance' },
    { href: '/student/e-learning', icon: BookOpen, label: 'E-Learning' },
    { href: '/student/logistics', icon: Bus, label: 'Bus Tracking' }, // Changed Icon
  ];

  const adminLinks = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { href: '/admin/users', icon: Settings, label: 'User Management' },
    { href: '/admin/finances', icon: Wallet, label: 'Finances' },
    { href: '/admin/attendance', icon: CalendarCheck, label: 'Attendance Logs' },
  ];

  const links = role === 'ADMIN' ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <span className="text-xl font-bold text-white tracking-wider">SekolahApp</span>
        <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">V2</span>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-500' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              }`}
            >
              <Icon size={18} className={`mr-3 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-400 rounded-lg hover:bg-gray-800 hover:text-red-400 transition-colors">
          <LogOut size={18} className="mr-3 text-gray-500 group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'STUDENT' | 'ADMIN';
  userName?: string;
  subdomain?: string;
}

export default function DashboardLayout({ children, role, userName = "User", subdomain = "school" }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 font-sans">
      <Sidebar role={role} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
           <div className="flex items-center text-sm text-gray-400">
             <span className="uppercase tracking-wider font-semibold">{subdomain}</span>
             <span className="mx-2">•</span>
             <span>{role} Portal</span>
           </div>
           <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-200">{userName}</p>
                <p className="text-xs text-gray-500">{role}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold shadow-inner">
                 {userName.charAt(0).toUpperCase()}
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
