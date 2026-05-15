'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, QrCode } from 'lucide-react';
import Swal from 'sweetalert2';

export default function StudentDashboard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch('/api/wallet/balance');
        const data = await res.json() as any;
        if (data.success) {
          setBalance(data.balance);
        }
      } catch (error) {
        console.error("Failed to fetch balance");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const handleShowQR = () => {
    Swal.fire({
      title: 'Your Payment QR',
      html: `
        <div class="flex flex-col items-center justify-center p-4">
          <div class="w-48 h-48 bg-white rounded-xl flex items-center justify-center border-4 border-gray-200 shadow-inner mb-4">
             <QrCode size={120} class="text-gray-900" />
          </div>
          <p class="text-sm text-gray-400 text-center">Show this code at the Canteen or Koperasi to pay.</p>
        </div>
      `,
      background: '#1f2937',
      color: '#fff',
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Close'
    });
  };

  return (
    <DashboardLayout role="STUDENT" userName="Student Name">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, Student! 👋</h1>
        <p className="text-gray-400 mt-1">Here is what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Wallet Card */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-100 font-medium flex items-center mb-1">
                <Wallet size={16} className="mr-2" />
                SekolahPay Balance
              </p>
              <h2 className="text-4xl font-bold text-white tracking-tight">
                {loading ? '...' : `Rp ${(balance || 0).toLocaleString('id-ID')}`}
              </h2>
            </div>
            <button 
              onClick={handleShowQR}
              className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-3 backdrop-blur-sm transition-colors shadow-sm"
            >
              <QrCode size={24} />
            </button>
          </div>

          <div className="flex space-x-3 mt-8">
            <button className="flex-1 bg-white text-blue-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center">
              <ArrowUpRight size={18} className="mr-2" />
              Top Up
            </button>
            <button className="flex-1 bg-blue-900/50 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-900/70 transition-colors border border-blue-400/30 flex items-center justify-center">
              <Clock size={18} className="mr-2" />
              History
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Today's Attendance</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                <ArrowDownRight size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Check In</p>
                <p className="text-lg font-bold text-gray-100">06:45 AM</p>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 flex items-center justify-between">
             <span className="text-sm text-gray-400">Status</span>
             <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">Present</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Transactions</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-800">
            {/* Mock Transactions */}
            {[
              { title: 'Koperasi Canteen - Nasi Kuning', date: 'Today, 12:30 PM', amount: -15000, type: 'PURCHASE' },
              { title: 'Top Up via Virtual Account', date: 'Yesterday, 08:00 AM', amount: 50000, type: 'TOPUP' },
              { title: 'School Bus Ticket', date: 'Mon, 06:15 AM', amount: -5000, type: 'PURCHASE' },
            ].map((tx, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'TOPUP' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.type === 'TOPUP' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{tx.title}</p>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                  </div>
                </div>
                <div className={`font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-gray-100'}`}>
                  {tx.amount > 0 ? '+' : ''}Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
