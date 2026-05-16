'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Wallet, CalendarCheck, BookOpen, LogOut, Settings, Bus, Store, Users, FileText, PiggyBank, Receipt, ShoppingBag } from 'lucide-react';

type Role = 'STUDENT' | 'ADMIN' | 'TEACHER' | 'PARTNER' | 'PARENT' | 'STAFF' | 'FINANCE';

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const roleLinks = {
    STUDENT: [
      { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/student/wallet', icon: Wallet, label: 'SekolahPay (Jajan)' },
      { href: '/student/savings', icon: PiggyBank, label: 'My Savings' },
      { href: '/student/bills', icon: Receipt, label: 'School Bills' },
      { href: '/student/market', icon: ShoppingBag, label: 'Marketplace' },
      { href: '/student/attendance', icon: CalendarCheck, label: 'Attendance' },
      { href: '/student/e-learning', icon: BookOpen, label: 'E-Learning' },
      { href: '/student/logistics', icon: Bus, label: 'Bus Tracking' },
    ],
    ADMIN: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
      { href: '/admin/users', icon: Settings, label: 'User Management' },
      { href: '/admin/finances', icon: Wallet, label: 'Finances' },
      { href: '/admin/attendance', icon: CalendarCheck, label: 'Attendance Logs' },
    ],
    TEACHER: [
      { href: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/teacher/classes', icon: Users, label: 'My Classes' },
      { href: '/teacher/e-learning', icon: BookOpen, label: 'Upload Materials' },
      { href: '/teacher/grades', icon: FileText, label: 'Grades (CBT)' },
    ],
    PARTNER: [
      { href: '/partner/dashboard', icon: LayoutDashboard, label: 'POS & Dashboard' },
      { href: '/partner/inventory', icon: Store, label: 'Inventory' },
      { href: '/partner/transactions', icon: Wallet, label: 'Sales History' },
      { href: '/partner/orders', icon: ShoppingBag, label: 'Pre-Orders' },
    ],
    PARENT: [
      { href: '/parent/dashboard', icon: LayoutDashboard, label: 'Child Overview' },
      { href: '/parent/wallet', icon: Wallet, label: 'SekolahPay (Topup)' },
      { href: '/parent/savings', icon: PiggyBank, label: 'Child Savings' },
      { href: '/parent/bills', icon: Receipt, label: 'Pay Bills (SPP)' },
      { href: '/parent/market', icon: ShoppingBag, label: 'Order Food/Items' },
      { href: '/parent/attendance', icon: CalendarCheck, label: 'Attendance Logs' },
      { href: '/parent/logistics', icon: Bus, label: 'Live Bus Tracking' },
    ],
    STAFF: [
      { href: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/staff/wallet', icon: Wallet, label: 'My Wallet' },
      { href: '/staff/attendance', icon: CalendarCheck, label: 'Attendance' },
      { href: '/staff/operations', icon: Settings, label: 'Operations' },
    ],
    FINANCE: [
      { href: '/finance/dashboard', icon: LayoutDashboard, label: 'Financial Overview' },
      { href: '/finance/billing', icon: Receipt, label: 'Billing & SPP' },
      { href: '/finance/savings', icon: PiggyBank, label: 'Manage Savings' },
      { href: '/finance/reports', icon: FileText, label: 'Transactions Report' },
    ]
  };

  const links = roleLinks[role] || roleLinks.STUDENT;

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
  role: Role;
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
