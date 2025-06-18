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
  AlertTriangle,
  Plus,
  MessageCircle,
  FileText,
  TrendingUp
} from 'lucide-react';
import { withAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost:5130/api';

const ResultDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
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

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
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

  const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', disabled = false, className = '' }) => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      warning: 'bg-orange-600 hover:bg-orange-700 text-white'
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Results" 
          value={stats.totalResults} 
          icon={FileText} 
          color="#3B82F6" 
          subtitle="Across all levels"
        />
        <StatCard 
          title="Pending Remarks" 
          value={stats.pendingRemarks} 
          icon={MessageCircle} 
          color="#F59E0B" 
          subtitle="Awaiting admin review"
        />
        <StatCard 
          title="Completed Results" 
          value={stats.completedResults} 
          icon={TrendingUp} 
          color="#10B981" 
          subtitle="With remarks added"
        />
        <StatCard 
          title="Total Subjects" 
          value={stats.totalSubjects} 
          icon={BookOpen} 
          color="#8B5CF6" 
          subtitle="Available subjects"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <ActionButton 
              icon={Plus} 
              label="Create Bulk Results" 
              onClick={() => router.push('/result/create-bulk')}
              disabled={isLoading}
              className="w-full justify-center"
            />
            <ActionButton 
              icon={MessageCircle} 
              label="Manage Remarks" 
              onClick={() => router.push('/result/manage-remarks')}
              variant="warning"
              disabled={isLoading}
              className="w-full justify-center"
            />
            <ActionButton 
              icon={Download} 
              label="Export Results" 
              onClick={() => console.log('Export Results')}
              variant="secondary"
              disabled={isLoading}
              className="w-full justify-center"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Result Status Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Results with Remarks</p>
                <p className="text-xs text-gray-500">{stats.completedResults} completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium">Pending Remarks</p>
                <p className="text-xs text-gray-500">{stats.pendingRemarks} awaiting review</p>
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
    ];

    return (
      <div className="space-y-6">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Results Management</h2>
          <div className="flex items-center gap-2">
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Level</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.levelName}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              Result Dashboard
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
        <div className="flex-1 p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default withAuth(ResultDashboard, ['admin', 'teacher']);