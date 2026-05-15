'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { BookOpen, Users, UploadCloud, FileText } from 'lucide-react';

export default function TeacherDashboard() {
  return (
    <DashboardLayout role="TEACHER" userName="Budi Guru">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage your classes and e-learning materials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'My Classes', value: '4', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Uploaded Materials', value: '18', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-500/10' },
          { title: 'Pending Grades', value: '2', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { title: 'Recent CBT Sync', value: 'Today', icon: UploadCloud, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => {
           const Icon = stat.icon;
           return (
             <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm flex items-center">
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
         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
               <BookOpen className="mr-2 text-blue-500" /> Quick Upload Material
            </h3>
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:bg-gray-800/50 transition-colors cursor-pointer">
               <UploadCloud size={40} className="mx-auto text-gray-500 mb-4" />
               <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
               <p className="text-gray-500 text-sm mt-1">PDF, PPTX, or DOCX (Max 50MB)</p>
               <p className="text-xs text-blue-400 mt-4 bg-blue-500/10 inline-block px-3 py-1 rounded-full">Securely stored on Cloudflare R2</p>
            </div>
         </div>

         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
               {[
                 { time: '07:30 - 09:00', class: 'XII-IPA 1', subject: 'Advanced Mathematics' },
                 { time: '09:15 - 10:45', class: 'XII-IPA 2', subject: 'Advanced Mathematics' },
                 { time: '11:00 - 12:30', class: 'XI-IPS 1', subject: 'Basic Mathematics' },
               ].map((schedule, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg border border-gray-800">
                     <div>
                        <p className="font-semibold text-gray-200">{schedule.class}</p>
                        <p className="text-sm text-gray-400">{schedule.subject}</p>
                     </div>
                     <span className="text-sm font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{schedule.time}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </DashboardLayout>
  );
}
