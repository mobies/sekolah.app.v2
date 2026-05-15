'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { CalendarCheck, FileText, QrCode, Settings, ShieldAlert, Wifi } from 'lucide-react';

export default function StaffDashboard() {
  return (
    <DashboardLayout role="STAFF" userName="Staff Member">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Staff Operations Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage daily school operations and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
                    <Wifi size={24} />
                 </div>
                 <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">ONLINE</span>
             </div>
             <h3 className="text-lg font-semibold text-gray-200">IoT Gates</h3>
             <p className="text-gray-500 text-sm mt-1">All 4 campus RFID gates are active and connected to the Edge.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <QrCode size={24} />
                 </div>
                 <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded">STANDBY</span>
             </div>
             <h3 className="text-lg font-semibold text-gray-200">Manual Scanner</h3>
             <p className="text-gray-500 text-sm mt-1">Click below to open the manual QR scanner for attendance.</p>
             <button className="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300">Open Scanner &rarr;</button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
             <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <ShieldAlert size={24} />
                 </div>
                 <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded">2 ISSUES</span>
             </div>
             <h3 className="text-lg font-semibold text-gray-200">System Alerts</h3>
             <p className="text-gray-500 text-sm mt-1">Missing logs or failed syncs requiring manual review.</p>
             <button className="mt-4 text-sm font-medium text-orange-400 hover:text-orange-300">View Alerts &rarr;</button>
          </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
         <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
            <FileText className="mr-2 text-gray-400" size={20} /> Daily Operations Log
         </h3>
         <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                 <thead className="text-gray-500 border-b border-gray-800">
                     <tr>
                         <th className="pb-3 font-medium">Time</th>
                         <th className="pb-3 font-medium">Event</th>
                         <th className="pb-3 font-medium">Actor</th>
                         <th className="pb-3 font-medium">Status</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800 text-gray-300">
                     <tr>
                         <td className="py-3">06:00 AM</td>
                         <td className="py-3">Main Gate Power On</td>
                         <td className="py-3">System</td>
                         <td className="py-3"><span className="text-green-400">Success</span></td>
                     </tr>
                     <tr>
                         <td className="py-3">06:15 AM</td>
                         <td className="py-3">Bus Route A Started</td>
                         <td className="py-3">Driver Pak Joko</td>
                         <td className="py-3"><span className="text-green-400">Tracking Active</span></td>
                     </tr>
                     <tr>
                         <td className="py-3">07:05 AM</td>
                         <td className="py-3">Manual Override Attendance</td>
                         <td className="py-3">Staff (You)</td>
                         <td className="py-3"><span className="text-blue-400">Logged</span></td>
                     </tr>
                 </tbody>
             </table>
         </div>
      </div>
    </DashboardLayout>
  );
}
