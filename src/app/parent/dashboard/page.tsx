'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Activity, Bell, Bus, CalendarCheck, Wallet } from 'lucide-react';

export default function ParentDashboard() {
  return (
    <DashboardLayout role="PARENT" userName="Bapak Budi">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Parent Portal</h1>
        <p className="text-gray-400 mt-1">Monitor Budi Santoso's activity, attendance, and wallet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
         {/* Wallet Monitoring */}
         <div className="bg-gradient-to-br from-blue-900 to-gray-900 border border-blue-800/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Wallet size={120} />
             </div>
             <h3 className="text-lg font-semibold text-blue-200 mb-2 relative z-10">Child's Wallet Balance</h3>
             <p className="text-4xl font-bold text-white mb-6 relative z-10">Rp 45.000</p>
             <div className="flex space-x-3 relative z-10">
                 <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                     Top Up Now
                 </button>
                 <button className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700">
                     View History
                 </button>
             </div>
         </div>

         {/* Today's Overview */}
         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
             <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                 <Activity className="mr-2 text-green-500" size={20} /> Today's Status
             </h3>
             <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                     <div className="flex items-center">
                         <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mr-3">
                             <CalendarCheck size={16} />
                         </div>
                         <span className="text-gray-300 text-sm">School Check-in</span>
                     </div>
                     <span className="text-green-400 text-sm font-semibold">06:45 AM</span>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                     <div className="flex items-center">
                         <div className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mr-3">
                             <Bus size={16} />
                         </div>
                         <span className="text-gray-300 text-sm">Bus Status</span>
                     </div>
                     <span className="text-yellow-400 text-sm font-semibold">Arrived at Campus</span>
                 </div>
             </div>
         </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
             <Bell className="mr-2 text-purple-500" size={20} /> Recent Notifications
          </h3>
          <div className="divide-y divide-gray-800">
              {[
                  { title: 'Payment Successful', desc: 'Budi spent Rp 15.000 at Koperasi.', time: '2 hours ago', type: 'wallet' },
                  { title: 'New Grade Available', desc: 'Mathematics Chapter 1 Exam score is out.', time: 'Yesterday', type: 'academic' },
                  { title: 'Low Balance Alert', desc: 'Wallet balance is under Rp 50.000.', time: 'Yesterday', type: 'wallet' },
              ].map((notif, i) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0">
                      <p className="text-sm font-medium text-gray-200">{notif.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{notif.desc}</p>
                      <p className="text-xs text-gray-600 mt-2">{notif.time}</p>
                  </div>
              ))}
          </div>
      </div>
    </DashboardLayout>
  );
}
