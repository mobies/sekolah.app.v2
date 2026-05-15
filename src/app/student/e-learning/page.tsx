'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { BookOpen, Download, FileText, File as FileIcon, Search } from 'lucide-react';
import Swal from 'sweetalert2';

interface Material {
  id: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export default function ELearningDashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Mock data for demonstration since we don't have seed data yet
    setMaterials([
      { id: '1', title: 'Chapter 1: Limits & Continuity', description: 'Advanced Mathematics for Grade 12', fileType: 'application/pdf', fileSize: 2500000, createdAt: new Date().toISOString() },
      { id: '2', title: 'Biology Lab Safety Guidelines', description: 'Mandatory reading before next week\'s lab', fileType: 'application/pdf', fileSize: 1200000, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', title: 'History: The Cold War Era', description: 'Presentation slides', fileType: 'application/vnd.ms-powerpoint', fileSize: 5500000, createdAt: new Date(Date.now() - 172800000).toISOString() },
    ]);
    setLoading(false);
  }, []);

  const handleDownload = async (materialId: string, title: string) => {
    try {
      Swal.fire({
        title: 'Generating secure link...',
        background: '#1f2937',
        color: '#fff',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // Simulating API call to /api/elearning/download-url
      await new Promise(resolve => setTimeout(resolve, 800));

      Swal.fire({
        icon: 'success',
        title: 'Ready!',
        text: `Downloading ${title}`,
        background: '#1f2937',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
      
      // In a real app, you would window.open(data.downloadUrl) here
    } catch (error) {
      Swal.fire('Error', 'Failed to generate download link', 'error');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredMaterials = materials.filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <DashboardLayout role="STUDENT" userName="Student Name">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
             <BookOpen className="mr-3 text-blue-500" />
             Study Materials Library
          </h1>
          <p className="text-gray-400 mt-1">Access all your course resources securely via Edge Storage.</p>
        </div>
        <div className="relative w-full md:w-64">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
             <Search size={18} />
           </div>
           <input
             type="text"
             placeholder="Search materials..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((material) => (
          <div key={material.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-sm hover:border-gray-700 transition-colors flex flex-col">
            <div className="flex items-start justify-between mb-4">
               <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  {material.fileType.includes('pdf') ? <FileText size={24} /> : <FileIcon size={24} />}
               </div>
               <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-1 rounded-md">
                 {formatSize(material.fileSize)}
               </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-200 mb-2 line-clamp-2" title={material.title}>
              {material.title}
            </h3>
            <p className="text-sm text-gray-400 mb-6 flex-1 line-clamp-2">
              {material.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
               <span className="text-xs text-gray-500">
                 {new Date(material.createdAt).toLocaleDateString()}
               </span>
               <button 
                 onClick={() => handleDownload(material.id, material.title)}
                 className="flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg"
               >
                 <Download size={16} className="mr-1.5" />
                 Download
               </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredMaterials.length === 0 && (
         <div className="text-center py-12">
            <div className="inline-flex w-16 h-16 rounded-full bg-gray-800 text-gray-600 items-center justify-center mb-4">
               <Search size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-400">No materials found</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search term.</p>
         </div>
      )}
    </DashboardLayout>
  );
}
