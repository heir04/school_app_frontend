"use client"
import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google'
import Navbar from '../components/Navbar';
import { useAuth, AuthProvider } from './contexts/AuthContext';

const inter = Inter({ subsets: ['latin'],  display: 'swap', })

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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3B82F6" />
        <title>Fazl-I-Omar Academy</title>
        <meta name="description" content="seeking Knowledge to Serve Allah" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}