"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  BookOpen, 
  Calendar,
  Bell,
  Settings,
  FileText,
  Award,
  Clock,
  GraduationCap,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  School,
  Mail,
  Phone,
  MapPin,
  Edit
} from 'lucide-react';
import { withAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5130/api';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionTerm, setCurrentSessionTerm] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  // State for student data
  const [studentProfile, setStudentProfile] = useState(null);
  const [classmates, setClassmates] = useState([]);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('auth-token');
  };

  // Create headers with auth token
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
          const [currentSessionTermRes] = await Promise.all([
            apiCall('/Session/GetCurrentSessionAndTermName')
          ]);
  
          if (currentSessionTermRes.status && currentSessionTermRes.data) {
            setCurrentSessionTerm(currentSessionTermRes.data);
          }
        } catch (error) {
          setError(`Failed to fetch data: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, []);

  const fetchStudentData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Get current student profile
      const profileRes = await apiCall('/Student/GetProfile');
      
      if (profileRes.status && profileRes.data) {
        setStudentProfile(profileRes.data);
        
        // If we have the student's level, get classmates
        if (profileRes.data.levelId) {
          const classmatesRes = await apiCall(`/Student/GetAll/${profileRes.data.levelId}`);
          if (classmatesRes.status && classmatesRes.data) {
            // Filter out the current student from classmates
            const filteredClassmates = classmatesRes.data.filter(
              student => student.id !== profileRes.data.id
            );
            setClassmates(filteredClassmates);
          }
        }
      }

    } catch (error) {
      setError(error.message);
      console.error('Error fetching student data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchStudentData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const ActionCard = ({ title, description, icon: Icon, onClick, color }) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-200 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );

  const ErrorAlert = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
        <div className="flex-1">
          <p className="text-red-800">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800"
        >
          ×
        </button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      
      {/* Welcome Section */}
      {studentProfile && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {studentProfile.firstName}!
              </h1>
              <p className="text-blue-100">
                Class: {studentProfile.levelName} • Student ID: {studentProfile.studentId}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Current Class" 
          value={studentProfile?.levelName || 'N/A'} 
          icon={GraduationCap} 
          color="#3B82F6" 
        />
        <StatCard 
          title="Classmates" 
          value={classmates.length} 
          icon={User} 
          color="#10B981" 
        />
        {currentSessionTerm && (
          <StatCard 
            title="Session" 
            value={currentSessionTerm.sessionName} 
            icon={CheckCircle} 
            color="#F59E0B"
            description={currentSessionTerm.termName}
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <ActionCard
            title="View Profile"
            description="Check and update your personal information"
            icon={User}
            color="#3B82F6"
            onClick={() => setActiveTab('profile')}
          />
          <ActionCard
            title="My Classmates"
            description="See who's in your class"
            icon={User}
            color="#10B981"
            onClick={() => setActiveTab('classmates')}
          />
      
          <ActionCard 
            title="View Results"
            description="Check your academic performance"
            icon={Award}
            color="#F59E0B"
            onClick={() => router.push('/result/check-result')}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">New Announcement</p>
                <p className="text-xs text-gray-500">New Term Begins</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Upcoming Exam</p>
                <p className="text-xs text-gray-500">Science - Next week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => console.log('Edit profile')}
        >
          <Edit className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : studentProfile ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">
                  {studentProfile.firstName} {studentProfile.lastName}
                </h1>
                <p className="text-blue-100 text-lg">Student ID: {studentProfile.studentId}</p>
                <p className="text-blue-100">Class: {studentProfile.levelName}</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{studentProfile.email}</p>
                  </div>
                </div>
                
                {studentProfile.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{studentProfile.phoneNumber}</p>
                    </div>
                  </div>
                )}
                
                {studentProfile.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">
                        {new Date(studentProfile.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {studentProfile.gender && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium">{studentProfile.gender}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Academic Information</h3>
                
                <div className="flex items-center gap-3">
                  <School className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Current Class</p>
                    <p className="font-medium">{studentProfile.levelName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Enrolled Since</p>
                    <p className="font-medium">
                      {new Date(studentProfile.createdOn).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {studentProfile.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{studentProfile.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No profile information available
        </div>
      )}
    </div>
  );

  const renderClassmates = () => (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Classmates</h2>
        <div className="text-sm text-gray-500">
          {studentProfile?.levelName} • {classmates.length} students
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : classmates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classmates.map((classmate) => (
            <div key={classmate.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {classmate.firstName?.charAt(0)}{classmate.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {classmate.firstName} {classmate.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {classmate.studentId}</p>
                  <p className="text-sm text-gray-500">{classmate.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No classmates found
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'profile': return renderProfile();
      case 'classmates': return renderClassmates();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              Student Portal
            </h1>
          </div>
          
          <nav className="px-4 pb-4">
            <div className="space-y-2">
              <TabButton
                id="overview"
                label="Dashboard"
                icon={BookOpen}
                isActive={activeTab === 'overview'}
                onClick={setActiveTab}
              />
              <TabButton
                id="profile"
                label="My Profile"
                icon={User}
                isActive={activeTab === 'profile'}
                onClick={setActiveTab}
              />
              <TabButton
                id="classmates"
                label="Classmates"
                icon={User}
                isActive={activeTab === 'classmates'}
                onClick={setActiveTab}
              />
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default withAuth(StudentDashboard, ['student']);