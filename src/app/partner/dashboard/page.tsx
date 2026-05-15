'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Store, QrCode, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PartnerDashboard() {
  const [scanMode, setScanMode] = useState(false);

  const simulateScan = () => {
      setScanMode(true);
      Swal.fire({
          title: 'Scanning Student QR...',
          text: 'Simulating POS camera scan',
          allowOutsideClick: false,
          background: '#1f2937',
          color: '#fff',
          didOpen: () => Swal.showLoading()
      });

      setTimeout(() => {
          setScanMode(false);
          Swal.fire({
              icon: 'success',
              title: 'Payment Successful',
              text: 'Rp 15.000 deducted from Budi Santoso',
              background: '#1f2937',
              color: '#fff',
              confirmButtonColor: '#3b82f6'
          });
      }, 2000);
  };

  return (
    <DashboardLayout role="PARTNER" userName="Ibu Kantin">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Partner Point of Sale</h1>
        <p className="text-gray-400 mt-1">Manage your store and process student payments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* POS Interface */}
          <div className="lg:col-span-2">
             <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-semibold text-gray-200">Current Order</h3>
                   <span className="text-gray-400 text-sm">Order #0042</span>
                </div>

                <div className="space-y-4 mb-6">
                   {[
                       { name: 'Nasi Kuning', qty: 1, price: 10000 },
                       { name: 'Es Teh Manis', qty: 1, price: 5000 },
                   ].map((item, i) => (
                       <div key={i} className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg">
                           <div className="flex items-center">
                               <span className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-sm font-bold mr-3">{item.qty}x</span>
                               <span className="text-gray-200">{item.name}</span>
                           </div>
                           <span className="text-gray-300">Rp {item.price.toLocaleString('id-ID')}</span>
                       </div>
                   ))}
                </div>

                <div className="border-t border-gray-800 pt-4 mb-6">
                   <div className="flex justify-between items-center mb-2">
                       <span className="text-gray-400">Subtotal</span>
                       <span className="text-gray-300">Rp 15.000</span>
                   </div>
                   <div className="flex justify-between items-center text-xl font-bold text-white">
                       <span>Total</span>
                       <span>Rp 15.000</span>
                   </div>
                </div>

                <button 
                  onClick={simulateScan}
                  disabled={scanMode}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center transition-colors"
                >
                    <QrCode className="mr-2" size={24} />
                    {scanMode ? 'Scanning...' : 'Scan Student QR to Pay'}
                </button>
             </div>
          </div>

          {/* Side Stats */}
          <div className="space-y-6">
             <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm flex items-center">
               <div className="w-14 h-14 rounded-full flex items-center justify-center mr-4 bg-green-500/10 text-green-500">
                 <TrendingUp size={24} />
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-400">Today's Revenue</p>
                 <p className="text-2xl font-bold text-gray-100">Rp 450.000</p>
               </div>
             </div>

             <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm flex items-center">
               <div className="w-14 h-14 rounded-full flex items-center justify-center mr-4 bg-purple-500/10 text-purple-500">
                 <ShoppingCart size={24} />
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-400">Total Transactions</p>
                 <p className="text-2xl font-bold text-gray-100">42</p>
               </div>
             </div>

             <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
                   <Package className="mr-2 text-orange-500" size={20} /> Low Stock Alert
                </h3>
                <div className="space-y-2">
                   <div className="flex justify-between items-center p-2 bg-red-500/5 border border-red-500/20 rounded text-sm">
                       <span className="text-gray-300">Roti Bakar</span>
                       <span className="text-red-400 font-bold">2 left</span>
                   </div>
                   <div className="flex justify-between items-center p-2 bg-orange-500/5 border border-orange-500/20 rounded text-sm">
                       <span className="text-gray-300">Susu Coklat</span>
                       <span className="text-orange-400 font-bold">5 left</span>
                   </div>
                </div>
             </div>
          </div>
      </div>
    </DashboardLayout>
  );
}
