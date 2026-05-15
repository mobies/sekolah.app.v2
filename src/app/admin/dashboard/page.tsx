'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Wallet, CalendarCheck, TrendingUp, AlertCircle } from 'lucide-react';

interface AttendanceLog {
  id: string;
  type: string;
  method: string;
  timestamp: string;
  userName: string;
  userRole: string;
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    const eventSource = new EventSource('/api/attendance/stream');

    eventSource.onopen = () => {
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.type === 'INITIAL') {
          setLogs(payload.data);
        } else if (payload.type === 'UPDATE') {
          setLogs((prevLogs) => {
            // Prepend new logs and keep max 50
            const newLogs = [...payload.data, ...prevLogs];
            return newLogs.slice(0, 50);
          });
        }
      } catch (e) {
        console.error("Error parsing SSE data", e);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      setConnectionStatus('error');
      eventSource.close();
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
         setConnectionStatus('connecting');
         // In a real app, you'd recreate the EventSource here
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const stats = [
    { title: 'Total Students', value: '1,240', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Today\'s Attendance', value: '94%', icon: CalendarCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Daily Transaction Vol.', value: 'Rp 4.2M', icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'Active Vendors', value: '12', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  return (
    <DashboardLayout role="ADMIN" userName="Principal">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">School Overview Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time metrics for your institution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm flex items-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mr-4 ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-100">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Placeholder for Chart */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Financial Flow (7 Days)</h3>
          <div className="h-64 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
            <p className="text-gray-500">Chart Component Placeholder</p>
          </div>
        </div>

        {/* Live Attendance Stream */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-200 flex items-center">
              {connectionStatus === 'connected' ? (
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
              ) : connectionStatus === 'connecting' ? (
                 <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse mr-2"></span>
              ) : (
                 <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
              )}
              Live Attendance Stream
            </h3>
            {connectionStatus === 'error' && (
               <span className="text-xs text-red-400 flex items-center"><AlertCircle size={12} className="mr-1"/> Disconnected</span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
             {logs.length === 0 && connectionStatus === 'connected' ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                   Waiting for new scans...
                </div>
             ) : (
               logs.map((log) => {
                 const date = new Date(log.timestamp);
                 const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                 const isOut = log.type === 'OUT';
                 
                 return (
                   <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-800 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${isOut ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                           {log.userName.charAt(0)}
                         </div>
                         <div>
                           <p className="text-sm font-medium text-gray-200">{log.userName}</p>
                           <p className="text-xs text-gray-500 capitalize">{log.userRole.toLowerCase()}</p>
                         </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${isOut ? 'text-orange-400' : 'text-green-400'}`}>
                           {timeString}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center justify-end">
                           <span className="uppercase text-[10px] tracking-wider mr-1 opacity-70">{log.type}</span>
                           • {log.method}
                        </p>
                      </div>
                   </div>
                 );
               })
             )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
