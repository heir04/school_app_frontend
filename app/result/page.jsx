"use client"
import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  AlertTriangle,
  Plus,
  MessageCircle,
  FileText,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';
import { withAuth, useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost:5130/api';

const ResultDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar toggle
  const router = useRouter();

  // State for result-specific data
  const [stats, setStats] = useState({
    totalResults: 0,
    pendingRemarks: 0,
    completedResults: 0,
    totalSubjects: 0
  });

  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [resultsStat, setResultsStat] = useState([]);

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

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const [levelsRes, subjectsRes, resultsStatRes] = await Promise.all([
        apiCall('/Level/GetAll'),
        apiCall('/Subject/GetAll'),
        apiCall('/Result/GetResultsRemarkCounts')
      ]);

      // Set levels data
      if (levelsRes.status && levelsRes.data) {
        setLevels(levelsRes.data);
      }

      // Set subjects data
      if (subjectsRes.status && subjectsRes.data) {
        setSubjects(subjectsRes.data);
        setStats(prev => ({ ...prev, totalSubjects: subjectsRes.data.length }));
      }

      if (resultsStatRes.status && resultsStatRes.data) {
        setResultsStat(resultsStatRes.data);
        setStats(prev => ({
          ...prev,
          totalResults: resultsStatRes.data.totalResult || 0,
          pendingRemarks: resultsStatRes.data.withoutRemark || 0,
          completedResults: resultsStatRes.data.withRemark || 0
        }));
      }


    } catch (error) {
      setError(error.message);
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch results by level
  const fetchResultsByLevel = async (levelId) => {
    if (!levelId) return;
    
    setIsLoading(true);
    try {
      const response = await apiCall(`/Result/GetAllByLevel/${levelId}`);
      if (response.status && response.data) {
        setResults(response.data);
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter results based on search
  const filteredResults = results.filter(result => {
    const matchesSearch = searchTerm === '' || 
      result.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.level?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
        onClick={() => {
          onClick(id);
          setIsSidebarOpen(false); // Close sidebar on mobile after click
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-sm sm:text-base ${
          isActive 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-medium">{label}</span>
      </button>
    );
  
    const ActionButton = ({ title, description, icon: Icon, onClick, color }) => (
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-red-800 text-sm sm:text-base break-words">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-600 hover:text-red-800 text-lg sm:text-xl ml-2 flex-shrink-0"
          >
            ×
          </button>
        </div>
      </div>
    );
    const DataTable = ({ data, columns, actions }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        {data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No data available
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <div key={rowIndex} className="p-4 space-y-3">
                {columns.map((column, colIndex) => (
                  <div key={colIndex} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">{column.header}:</span>
                    <span className="text-sm text-gray-900 text-right flex-1 ml-2">
                      {column.render ? column.render(row) : row[column.key]}
                    </span>
                  </div>
                ))}
                {actions && (
                  <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                    {actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => action.onClick(row)}
                        className={`p-2 rounded-lg transition-colors ${action.className}`}
                        title={action.label}
                        disabled={isLoading}
                      >
                        <action.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {column.header}
                </th>
              ))}
              {actions && <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 lg:px-6 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                      <div className="truncate max-w-xs">
                        {column.render ? column.render(row) : row[column.key]}
                      </div>
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={`p-2 rounded-lg transition-colors ${action.className}`}
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
  const renderOverview = () => (
    <div className="space-y-6 sm:space-y-8">
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Total Results" 
          value={stats.totalResults} 
          icon={FileText} 
          color="#3B82F6" 
          description="Across all levels"
        />
        <StatCard 
          title="Pending Remarks" 
          value={stats.pendingRemarks} 
          icon={MessageCircle} 
          color="#F59E0B" 
          description="Awaiting admin review"
        />
        <StatCard 
          title="Completed Results" 
          value={stats.completedResults} 
          icon={TrendingUp} 
          color="#10B981" 
          description="With remarks added"
        />
        <StatCard 
          title="Total Subjects" 
          value={stats.totalSubjects} 
          icon={BookOpen} 
          color="#8B5CF6" 
          description="Available subjects"
        />
      </div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            {user?.role?.toLowerCase() === 'teacher' && (
              <ActionButton 
                title="Create Bulk Results"
                description="Upload multiple results at once"
                icon={Plus} 
                onClick={() => router.push('/result/create-bulk')}
                color="#3B82F6"
              />
            )}
            {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'superadmin') && (
              <ActionButton 
                title="Manage Remarks"
                description="Add or update result remarks"
                icon={MessageCircle} 
                onClick={() => router.push('/result/manage-remarks')}
                color="#F59E0B"
              />
            )}
            <ActionButton 
              title="Export Results"
              description="Download results as CSV/PDF"
              icon={Download} 
              onClick={() => console.log('Export Results')}
              color="#10B981"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Result Status Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Results with Remarks</p>
                <p className="text-xs text-gray-500 truncate">{stats.completedResults} completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Pending Remarks</p>
                <p className="text-xs text-gray-500 truncate">{stats.pendingRemarks} awaiting review</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    const resultColumns = [
      { key: 'studentName', header: 'Student Name' },
      { key: 'level', header: 'Level' },
      { key: 'termName', header: 'Term' },
      { 
        key: 'remark', 
        header: 'Remark Status',
        render: (result) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            result.remark 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {result.remark ? 'Completed' : 'Pending'}
          </span>
        )
      }
    ];

    const resultActions = [
      { 
        icon: Eye, 
        label: 'View Details', 
        onClick: (result) => console.log('View result details', result), 
        className: 'text-blue-600 hover:bg-blue-100' 
      }
    ];    return (
      <div className="space-y-4 sm:space-y-6">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:gap-4 sm:items-center sm:justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Results Management</h2>
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-3">
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                if (e.target.value) {
                  fetchResultsByLevel(e.target.value);
                } else {
                  setResults([]);
                }
              }}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Select Level</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.levelName}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable data={filteredResults} columns={resultColumns} actions={resultActions} />
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'results': return renderResults();
      default: return renderOverview();
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col sm:flex-row">

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <span className="hidden sm:inline">Result Dashboard</span>
              <span className="sm:hidden">Results</span>
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
                id="results"
                label="Results"
                icon={FileText}
                isActive={activeTab === 'results'}
                onClick={setActiveTab}
              />
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <button
            className="lg:hidden mb-4 p-2 bg-blue-600 text-white rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            Menu
          </button>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default withAuth(ResultDashboard, ['admin', 'teacher', 'superadmin']);