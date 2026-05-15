'use client';

import { useState } from 'react';
import { School, Building, Globe } from 'lucide-react';
import Swal from 'sweetalert2';

export default function RegisterSchool() {
  const [formData, setFormData] = useState({
    npsn: '',
    name: '',
    subdomain: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Auto-format subdomain (lowercase, no spaces)
    if (name === 'subdomain') {
      setFormData(prev => ({ ...prev, [name]: value.toLowerCase().replace(/[^a-z0-9]/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/schools/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json() as any;

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Your school has been registered and is pending approval.',
          background: '#1f2937', // Dark theme for SweetAlert2
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
        setFormData({ npsn: '', name: '', subdomain: '' });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: data.error || 'An unexpected error occurred.',
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Failed to reach the server. Please try again later.',
        background: '#1f2937',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 mb-4">
            <School size={32} />
          </div>
          <h1 className="text-2xl font-bold">Register Your School</h1>
          <p className="text-gray-400 mt-2 text-sm">Join the SekolahApp V2 ecosystem.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="npsn" className="block text-sm font-medium text-gray-300 mb-1">
              NPSN (National School ID)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Building size={18} />
              </div>
              <input
                type="text"
                id="npsn"
                name="npsn"
                required
                pattern="\d{8}"
                title="NPSN must be exactly 8 digits"
                value={formData.npsn}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="e.g. 12345678"
              />
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              School Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors uppercase"
              placeholder="SMAN 1 JAKARTA"
            />
          </div>

          <div>
            <label htmlFor="subdomain" className="block text-sm font-medium text-gray-300 mb-1">
              Desired Subdomain
            </label>
            <div className="relative flex rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Globe size={18} />
              </div>
              <input
                type="text"
                id="subdomain"
                name="subdomain"
                required
                value={formData.subdomain}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-l-lg bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="sman1jkt"
              />
              <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-700 bg-gray-800 text-gray-400 text-sm">
                .sekolah.app
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Register School'}
          </button>
        </form>
      </div>
    </div>
  );
}
