'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { PiggyBank, Receipt, ShoppingBag } from 'lucide-react';

export default function StudentSavingsBills() {
  return (
    <DashboardLayout role="STUDENT" userName="Student Name">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Financial Center</h1>
        <p className="text-gray-400 mt-1">Manage your savings, pay bills, and view transactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Savings View */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
           <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center">
              <PiggyBank className="mr-2 text-green-500" /> My Savings Accounts
           </h3>
           <div className="space-y-4">
               <div className="bg-gradient-to-r from-green-900/40 to-green-800/10 border border-green-800/30 rounded-xl p-4 flex justify-between items-center">
                   <div>
                       <p className="text-green-400 font-semibold mb-1">Tabungan Wajib</p>
                       <p className="text-xs text-gray-400">Cannot be withdrawn until graduation</p>
                   </div>
                   <p className="text-xl font-bold text-white">Rp 1.250.000</p>
               </div>
               <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/10 border border-blue-800/30 rounded-xl p-4 flex justify-between items-center">
                   <div>
                       <p className="text-blue-400 font-semibold mb-1">Tabungan Sukarela</p>
                       <p className="text-xs text-gray-400">Available for withdrawal</p>
                   </div>
                   <p className="text-xl font-bold text-white">Rp 450.000</p>
               </div>
           </div>
        </div>

        {/* Bills View */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
           <h3 className="text-lg font-semibold text-gray-200 mb-6 flex items-center">
              <Receipt className="mr-2 text-orange-500" /> Outstanding Bills
           </h3>
           <div className="space-y-4">
               {[
                   { name: 'SPP Bulan Mei 2026', type: 'MONTHLY', amount: 350000, due: '10 May 2026' },
                   { name: 'Buku Paket Semester 2', type: 'INCIDENTAL', amount: 150000, due: '15 May 2026' }
               ].map((bill, i) => (
                   <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                       <div className="flex justify-between items-start mb-2">
                           <p className="font-semibold text-gray-200">{bill.name}</p>
                           <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-1 rounded">UNPAID</span>
                       </div>
                       <div className="flex justify-between items-end mt-4">
                           <div>
                               <p className="text-xs text-gray-500">Due: <span className="text-gray-300">{bill.due}</span></p>
                           </div>
                           <div className="text-right">
                               <p className="text-lg font-bold text-white mb-2">Rp {bill.amount.toLocaleString('id-ID')}</p>
                               <button className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors">
                                   Pay Now
                               </button>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
        </div>
      </div>
      
      {/* Marketplace Pre-Order Preview */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-200 flex items-center">
                 <ShoppingBag className="mr-2 text-purple-500" /> Marketplace Pre-Orders
              </h3>
              <button className="text-sm text-blue-400 hover:text-blue-300">Browse Kantin</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {[
                   { store: 'Kantin Ibu Siti', items: '2x Nasi Goreng, 1x Es Teh', total: 35000, status: 'PREPARING', pickup: 'Break 1 (09:30)' },
               ].map((order, i) => (
                   <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                       <p className="text-xs text-gray-500 mb-1">{order.store}</p>
                       <p className="text-sm font-semibold text-gray-200 mb-3">{order.items}</p>
                       <div className="flex justify-between items-center text-xs">
                           <span className="text-white font-bold">Rp {order.total.toLocaleString('id-ID')}</span>
                           <span className="text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded font-medium">{order.status}</span>
                       </div>
                       <p className="text-[10px] text-gray-500 mt-3 pt-3 border-t border-gray-700">Pickup: {order.pickup}</p>
                   </div>
               ))}
           </div>
      </div>
    </DashboardLayout>
  );
}
