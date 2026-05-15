'use client';

import { useState, useEffect } from 'react';
import { Building, CheckCircle, XCircle, Clock, Server, Database } from 'lucide-react';
import Swal from 'sweetalert2';

interface SchoolRegistration {
  id: string;
  npsn: string;
  name: string;
  subdomain: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export default function OwnerDashboard() {
  const [registrations, setRegistrations] = useState<SchoolRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch this from an API endpoint 
    // that connects to the `global` schema.
    // Simulating data for now:
    setRegistrations([
      { id: '1', npsn: '12345678', name: 'SMAN 1 JAKARTA', subdomain: 'sman1jkt', status: 'PENDING', createdAt: new Date().toISOString() },
      { id: '2', npsn: '87654321', name: 'SMA BINA BANGSA', subdomain: 'binabangsa', status: 'ACTIVE', createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', npsn: '11223344', name: 'SMK TELKOM', subdomain: 'smktelkom', status: 'PENDING', createdAt: new Date(Date.now() - 172800000).toISOString() },
    ]);
    setLoading(false);
  }, []);

  const handleApprove = (id: string, name: string, subdomain: string) => {
    Swal.fire({
      title: 'Approve Registration?',
      text: `This will provision a new Turso database for ${name} at ${subdomain}.sekolah.app`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'Yes, Provision Infrastructure!',
      background: '#1f2937',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        // Simulate API call to Turso to create DB and update status
        Swal.fire({
          title: 'Provisioning...',
          text: 'Creating Edge Database and configuring routing.',
          allowOutsideClick: false,
          background: '#1f2937',
          color: '#fff',
          didOpen: () => Swal.showLoading()
        });

        setTimeout(() => {
            setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status: 'ACTIVE' } : r));
            Swal.fire({
              title: 'Provisioned!',
              text: `${name} is now active and ready.`,
              icon: 'success',
              background: '#1f2937',
              color: '#fff',
              confirmButtonColor: '#3b82f6',
            });
        }, 2000);
      }
    });
  };

  const handleReject = (id: string) => {
    Swal.fire({
      title: 'Reject Registration?',
      text: "You won't be able to revert this!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'Yes, reject it!',
      background: '#1f2937',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        setRegistrations(prev => prev.filter(r => r.id !== id));
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
           <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                 <Server className="mr-3 text-blue-500" />
                 SekolahApp Command Center
              </h1>
              <p className="text-gray-400 mt-2">Manage infrastructure, tenants, and global configurations.</p>
           </div>
           <div className="flex items-center space-x-4 text-sm bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg">
              <span className="flex items-center text-green-400"><Database size={16} className="mr-2"/> Turso Edge: Online</span>
              <span className="text-gray-600">|</span>
              <span className="flex items-center text-green-400"><Server size={16} className="mr-2"/> Cloudflare: Routing Active</span>
           </div>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
               <p className="text-gray-400 text-sm font-medium mb-1">Total Active Tenants</p>
               <p className="text-3xl font-bold text-white">{registrations.filter(r => r.status === 'ACTIVE').length}</p>
           </div>
           <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
               <p className="text-gray-400 text-sm font-medium mb-1">Pending Approvals</p>
               <p className="text-3xl font-bold text-yellow-500">{registrations.filter(r => r.status === 'PENDING').length}</p>
           </div>
           <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
               <p className="text-gray-400 text-sm font-medium mb-1">Edge Nodes Active</p>
               <p className="text-3xl font-bold text-blue-500">285</p>
           </div>
        </div>

        {/* Pending Registrations */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
           <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Tenant Registrations</h2>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-gray-800 bg-gray-900/50">
                       <th className="px-6 py-4 text-sm font-medium text-gray-400">School / Subdomain</th>
                       <th className="px-6 py-4 text-sm font-medium text-gray-400">NPSN</th>
                       <th className="px-6 py-4 text-sm font-medium text-gray-400">Date Applied</th>
                       <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                       <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Infrastructure Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800">
                    {registrations.map((school) => (
                       <tr key={school.id} className="hover:bg-gray-800/20 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mr-3">
                                   <Building size={20} />
                                </div>
                                <div>
                                   <p className="font-semibold text-gray-200">{school.name}</p>
                                   <p className="text-xs text-blue-400 font-mono">{school.subdomain}.sekolah.app</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-300">{school.npsn}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                             {new Date(school.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                school.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
                                school.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-red-500/10 text-red-400'
                             }`}>
                                {school.status === 'PENDING' && <Clock size={12} className="mr-1.5" />}
                                {school.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             {school.status === 'PENDING' ? (
                                <div className="flex justify-end space-x-2">
                                   <button 
                                     onClick={() => handleReject(school.id)}
                                     className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                                     title="Reject"
                                   >
                                      <XCircle size={20} />
                                   </button>
                                   <button 
                                     onClick={() => handleApprove(school.id, school.name, school.subdomain)}
                                     className="p-2 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20"
                                     title="Provision DB & Approve"
                                   >
                                      <CheckCircle size={20} />
                                   </button>
                                </div>
                             ) : (
                                <span className="text-sm text-gray-500 italic">Infrastructure Provisioned</span>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </div>
    </div>
  );
}
