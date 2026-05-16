'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { PiggyBank, Receipt, TrendingUp, Users, CheckCircle, Clock, CalendarCheck } from 'lucide-react';

export default function FinanceDashboard() {
  return (
    <DashboardLayout role="FINANCE" userName="Staff Keuangan">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
        <p className="text-gray-400 mt-1">Manage school billing, SPP, and student savings.</p>
      </div>

      {/* High-Level Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900 to-gray-900 border border-blue-800/50 rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-medium text-blue-200 mb-1">Total SPP Collected (This Month)</h3>
           <p className="text-3xl font-bold text-white">Rp 124.5M</p>
           <p className="text-xs text-green-400 mt-2 flex items-center">
             <TrendingUp size={12} className="mr-1" /> +12% from last month
           </p>
        </div>
        <div className="bg-gradient-to-br from-green-900 to-gray-900 border border-green-800/50 rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-medium text-green-200 mb-1">Total Student Savings (Wajib & Sukarela)</h3>
           <p className="text-3xl font-bold text-white">Rp 842.0M</p>
           <p className="text-xs text-gray-400 mt-2 flex items-center">
             <PiggyBank size={12} className="mr-1" /> Across 1,200 active accounts
           </p>
        </div>
        <div className="bg-gradient-to-br from-orange-900 to-gray-900 border border-orange-800/50 rounded-2xl p-6 shadow-sm">
           <h3 className="text-sm font-medium text-orange-200 mb-1">Pending Unpaid Bills</h3>
           <p className="text-3xl font-bold text-white">Rp 18.2M</p>
           <p className="text-xs text-orange-400 mt-2 flex items-center">
             <Clock size={12} className="mr-1" /> 45 students have outstanding SPP
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bill Payments */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
              <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                 <Receipt className="mr-2 text-blue-500" /> Recent Bill Payments
              </h3>
              <button className="text-sm text-blue-400 hover:text-blue-300">View All</button>
           </div>
           
           <div className="space-y-4">
              {[
                { student: 'Budi Santoso', desc: 'SPP Bulan Mei 2026', amount: 350000, method: 'TRANSFER', status: 'PAID' },
                { student: 'Siti Aminah', desc: 'Uang Gedung (Cicilan 1)', amount: 1500000, method: 'CASH', status: 'PAID' },
                { student: 'Agus Pratama', desc: 'SPP Bulan Mei 2026', amount: 350000, method: 'WALLET', status: 'PAID' },
              ].map((payment, i) => (
                 <div key={i} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                    <div>
                       <p className="font-semibold text-gray-200 text-sm">{payment.student}</p>
                       <p className="text-xs text-gray-500">{payment.desc}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-green-400 text-sm">+ Rp {payment.amount.toLocaleString('id-ID')}</p>
                       <p className="text-[10px] text-gray-500 uppercase tracking-wider">{payment.method}</p>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Quick Actions & Savings Overview */}
        <div className="space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
               <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                  <PiggyBank className="mr-2 text-green-500" /> Savings Actions (Tabungan)
               </h3>
               <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 text-center transition-colors">
                     <p className="font-semibold text-white mb-1">Deposit</p>
                     <p className="text-xs text-gray-400">Setor Tunai</p>
                  </button>
                  <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 text-center transition-colors">
                     <p className="font-semibold text-white mb-1">Withdraw</p>
                     <p className="text-xs text-gray-400">Tarik Tunai</p>
                  </button>
               </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
               <h3 className="text-lg font-semibold text-gray-200 mb-4">Generate New Bills</h3>
               <p className="text-sm text-gray-400 mb-4">Create global billing items for all active students.</p>
               <div className="space-y-3">
                   <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center">
                       <CalendarCheck size={16} className="mr-2" /> Generate Monthly SPP
                   </button>
                   <button className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium rounded-lg border border-gray-700 transition-colors flex items-center justify-center">
                       <Users size={16} className="mr-2" /> Generate Custom Incidental Bill
                   </button>
               </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
