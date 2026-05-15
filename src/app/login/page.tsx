'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, GraduationCap } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Basic client-side check for subdomain to show context
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > 2 && !hostname.includes('localhost')) {
        setSubdomain(parts[0]);
    } else if (hostname.includes('localhost') && parts.length > 1) {
        setSubdomain(parts[0]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as any;

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Welcome back!',
          text: `Logged in as ${data.user.name} (${data.user.role})`,
          background: '#1f2937',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
            // Redirect based on role
            if (data.user.role === 'ADMIN') router.push('/admin/dashboard');
            else if (data.user.role === 'STUDENT') router.push('/student/dashboard');
            else router.push('/dashboard');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: data.error,
          background: '#1f2937',
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Failed to connect to the server.',
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
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold">Sign In</h1>
          {subdomain ? (
            <p className="text-blue-400 mt-2 text-sm font-medium">School: {subdomain.toUpperCase()}</p>
          ) : (
            <p className="text-yellow-500 mt-2 text-sm">Warning: Accessing from global domain. Please use your school's specific URL.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="student@school.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-950 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !subdomain}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
