"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Search,
  Download,
  School,
  Calendar,
  BarChart3,
  Eye,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { withAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5130/api';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for teacher-specific data
  const [stats, setStats] = useState({
    totalLevels: 0,
    totalStudents: 0,
    totalSubjects: 0
  });

  const [levels, setLevels] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

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

  // Fetch teacher-specific data
  const fetchTeacherData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const [levelsRes, studentsRes, subjectsRes] = await Promise.all([
        apiCall('/Level/GetAll'), // Hypothetical endpoint
        apiCall('/Student/GetAll'), // Hypothetical endpoint
        apiCall('/Subject/GetSubjectsByTeacher') // Hypothetical endpoint
      ]);

      // Set Levelss data
      if (levelsRes.status && levelsRes.data) {
        setLevels(levelsRes.data);
        setStats(prev => ({ ...prev, totalLevels: levelsRes.data.length }));
      }

      // Set students data
      if (studentsRes.status && studentsRes.data) {
        setStudents(studentsRes.data);
        setStats(prev => ({ ...prev, totalStudents: studentsRes.data.length }));
      }

      // Set subjects data
      if (subjectsRes.status && subjectsRes.data) {
        setSubjects(subjectsRes.data);
        setStats(prev => ({ ...prev, totalSubjects: subjectsRes.data.length }));
      }

    } catch (error) {
      setError(error.message);
      console.error('Error fetching teacher data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchTeacherData();
  }, []);

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = selectedLevel === '' || student.levelName === selectedLevel;
    
      return matchesSearch && matchesLevel;
  });

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', disabled = false }) => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white'
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  };

  const DataTable = ({ data, columns, actions }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.header}
                </th>
              ))}
              {actions && <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={`p-2 rounded-lg transition-colors ${action.levelsName}`}
                            title={action.label}
                            disabled={isLoading}
                          >
                            <action.icon className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ErrorAlert = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Classes" value={stats.totalLevels} icon={School} color="#3B82F6" />
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="#10B981" />
        <StatCard title="Subjects Taught" value={stats.totalSubjects} icon={BookOpen} color="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Teaching Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Classess: Active</p>
                <p className="text-xs text-gray-500">All Classess assigned</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Assignments: Up to date</p>
                <p className="text-xs text-gray-500">No pending grading</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton 
              icon={Users} 
              label="View Students" 
              onClick={() => setActiveTab('students')} 
              disabled={isLoading}
            />
            <ActionButton 
              icon={BookOpen} 
              label="View Classes" 
              onClick={() => setActiveTab('levels')} 
              variant="success" 
              disabled={isLoading}
            />
            <Link href="/result">
            <ActionButton 
              icon={FileText}
              label="Result Dashboard" 
              variant="success" 
              disabled={isLoading}
            />
          </Link>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLevels = () => {
    const levelColumns = [
      { key: 'levelName', header: 'Class Name' },
      { key: 'description', header: 'Description' }
    ];

    return (
      <div className="space-y-6">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Classes Management</h2>
          <ActionButton 
            icon={Download} 
            label="Export" 
            onClick={() => console.log('Export Classes')} 
            variant="secondary" 
            disabled={isLoading}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable data={levels} columns={levelColumns} />
        )}
      </div>
    );
  };

  const renderStudents = () => {
    const studentColumns = [
      { key: 'studentId', header: 'Student ID' },
      { 
        key: 'name', 
        header: 'Name',
        render: (student) => `${student.firstName} ${student.lastName}`
      },
      { key: 'email', header: 'Email' },
      { key: 'levelName', header: 'Grade Class' }
    ];

    const studentActions = [
      { icon: Eye, label: 'View', onClick: (student) => console.log('View', student), className: 'text-blue-600 hover:bg-blue-100' }
    ];

    return (
      <div className="space-y-6">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Students Management</h2>
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              {levels.map(level => (
                <option key={level.id} value={level.levelName}>{level.levelName}</option>
              ))}
            </select>
            <ActionButton 
              icon={Download} 
              label="Export" 
              onClick={() => console.log('Export')} 
              variant="secondary" 
              disabled={isLoading}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable data={filteredStudents} columns={studentColumns} actions={studentActions} />
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'levels': return renderLevels();
      case 'students': return renderStudents();
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
                <School className="w-8 h-8 text-blue-600" />
                Teacher Dashboard
              </h1>
            </div>
            
            <nav className="px-4 pb-4">
              <div className="space-y-2">
                <TabButton
                  id="overview"
                  label="Overview"
                  icon={BarChart3}
                  isActive={activeTab === 'overview'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="levels"
                  label="Classes"
                  icon={BookOpen}
                  isActive={activeTab === 'levels'}
                  onClick={setActiveTab}
                />
                <TabButton
                  id="students"
                  label="Students"
                  icon={Users}
                  isActive={activeTab === 'students'}
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

export default withAuth(TeacherDashboard, ['teacher']);