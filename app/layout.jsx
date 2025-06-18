"use client"
import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google'
import Navbar from '../components/Navbar';
import { useAuth, AuthProvider } from './contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'School Management System',
//   description: 'Comprehensive school management platform',
// }

const LayoutContent = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? 'min-h-[calc(100vh-4rem)]' : 'min-h-screen'}>
        {children}
      </main>
    </div>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}

// // app/layout.js
// import { Inter } from 'next/font/google'
// import './globals.css'
// import { AuthProvider } from './contexts/AuthContext'

// const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'School Management System',
//   description: 'Comprehensive school management platform',
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <AuthProvider>
//           {children}
//         </AuthProvider>
//       </body>
//     </html>
//   )
// }
// components/Layout.js