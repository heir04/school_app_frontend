// app/unauthorized/page.jsx
"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; 

const UnauthorizedPage = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        {user && user.role && (
          <>
            {user.role.toLowerCase() === 'teacher' && (
              <button
                onClick={() => router.push('/teacher')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            )}
            {user.role.toLowerCase() === 'student' && (
              <button
                onClick={() => router.push('/student')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            )}
            {(user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'superadmin') && (
              <button
                onClick={() => router.push('/admin')}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            )}
          </>
        )}
        
        {!user && (
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default UnauthorizedPage;