// contexts/AuthContext.js
"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Decode JWT token to get user info
  const decodeToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.jti || payload.sub,
        email: payload.sub,
        role: payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
        exp: payload.exp
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5130/api/User/Login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        localStorage.setItem('auth-token', data.token);
        const userInfo = decodeToken(data.token);
        
        if (userInfo) {
          setUser(userInfo);
          
          // Redirect based on role
          switch (userInfo.role.toLowerCase()) {
            case 'admin':
              router.push('/admin');
              break;
            case 'superadmin':
              router.push('/admin');
            case 'teacher':
              router.push('/teacher');
              break;
            case 'student':
              router.push('/student');
              break;
            default:
              router.push('/dashboard');
          }
          
          return { success: true, user: userInfo };
        }
      }
      
      return { success: false, message: data.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
    router.push('/login');
  };

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth-token');
      
      if (token && !isTokenExpired(token)) {
        const userInfo = decodeToken(token);
        if (userInfo) {
          setUser(userInfo);
        } else {
          localStorage.removeItem('auth-token');
        }
      } else if (token) {
        // Token expired
        localStorage.removeItem('auth-token');
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protected routes
export const withAuth = (WrappedComponent, allowedRoles = []) => {
  return function AuthenticatedComponent(props) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.push('/login');
          return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role.toLowerCase())) {
          router.push('/unauthorized');
          return;
        }
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role.toLowerCase())) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};