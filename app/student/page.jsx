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
  Edit,
  Menu,
  X
} from 'lucide-react';
import { withAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'https://schoolapp-production-e49d.up.railway.app/api';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionTerm, setCurrentSessionTerm] = useState(null);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar toggle
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
      const profileRes = await apiCall('/Student/GetProfile');
      
      if (profileRes.status && profileRes.data) {
        setStudentProfile(profileRes.data);
        
        if (profileRes.data.levelId) {
          const classmatesRes = await apiCall(`/Student/GetAll/${profileRes.data.levelId}`);
          if (classmatesRes.status && classmatesRes.data) {
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

  useEffect(() => {
    fetchStudentData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-2 sm:p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 w-full ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium text-sm sm:text-base">{label}</span>
    </button>
  );

  const ActionCard = ({ title, description, icon: Icon, onClick, color }) => (
    <div 
      onClick={() => {
        onClick();
        setIsSidebarOpen(false); // Close sidebar on mobile after click
      }}
      className="bg-white rounded-xl shadow-lg p-4 sm:p-6 cursor-pointer hover:shadow-xl transition-all duration-200 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{description}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      </div>
    </div>
  );

  const ErrorAlert = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 mr-2 sm:mr-3" />
        <div className="flex-1">
          <p className="text-red-800 text-sm sm:text-base">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 text-lg sm:text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6 sm:space-y-8">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      
      {studentProfile && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                Welcome back, {studentProfile.firstName}!
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                Class: {studentProfile.levelName} • Student ID: {studentProfile.studentId}
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
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

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">New Announcement</p>
                <p className="text-xs text-gray-500">New Term Begins</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
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
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h2>
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
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="text-white">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  {studentProfile.firstName} {studentProfile.lastName}
                </h1>
                <p className="text-blue-100 text-sm sm:text-lg">Student ID: {studentProfile.studentId}</p>
                <p className="text-blue-100 text-sm sm:text-base">Class: {studentProfile.levelName}</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Email</p>
                    <p className="font-medium text-sm sm:text-base truncate">{studentProfile.email}</p>
                  </div>
                </div>
                
                {studentProfile.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-sm sm:text-base">{studentProfile.phoneNumber}</p>
                    </div>
                  </div>
                )}
                
                {studentProfile.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium text-sm sm:text-base">
                        {new Date(studentProfile.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {studentProfile.gender && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Gender</p>
                      <p className="font-medium text-sm sm:text-base">{studentProfile.gender}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">Academic Information</h3>
                
                <div className="flex items-center gap-3">
                  <School className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Current Class</p>
                    <p className="font-medium text-sm sm:text-base">{studentProfile.levelName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Enrolled Since</p>
                    <p className="font-medium text-sm sm:text-base">
                      {new Date(studentProfile.createdOn).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {studentProfile.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Address</p>
                      <p className="font-medium text-sm sm:text-base truncate">{studentProfile.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
          No profile information available
        </div>
      )}
    </div>
  );

  const renderClassmates = () => (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Classmates</h2>
        <div className="text-xs sm:text-sm text-gray-500">
          {studentProfile?.levelName} • {classmates.length} students
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : classmates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {classmates.map((classmate) => (
            <div key={classmate.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-base sm:text-lg">
                    {classmate.firstName?.charAt(0)}{classmate.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {classmate.firstName} {classmate.lastName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">ID: {classmate.studentId}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{classmate.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
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
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 lg:p-6 border-b lg:border-b-0">
            <div className="flex items-center justify-between">
              <h1 className="text-lg lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                <span className="hidden sm:block">Student Portal</span>
              </h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <nav className="px-4 pb-4">
            <div className="space-y-2">
              <TabButton
                id="overview"
                label="Dashboard"
                icon={BookOpen}
                isActive={activeTab === 'overview'}
                onClick={(tab) => {
                  setActiveTab(tab);
                  setIsSidebarOpen(false);
                }}
              />
              <TabButton
                id="profile"
                label="My Profile"
                icon={User}
                isActive={activeTab === 'profile'}
                onClick={(tab) => {
                  setActiveTab(tab);
                  setIsSidebarOpen(false);
                }}
              />
              <TabButton
                id="classmates"
                label="Classmates"
                icon={User}
                isActive={activeTab === 'classmates'}
                onClick={(tab) => {
                  setActiveTab(tab);
                  setIsSidebarOpen(false);
                }}
              />
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile header */}
          <div className="lg:hidden bg-white shadow-sm border-b p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Student Portal</h1>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>
          </div>
          
          <div className="p-4 lg:p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(StudentDashboard, ['student']);