// pages/assignments/student.jsx
"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Calendar,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Menu,
  X,
  GraduationCap,
  Eye,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { withAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'https://schoolapp-production-e49d.up.railway.app/api';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const router = useRouter();

  const getAuthToken = () => localStorage.getItem('auth-token');

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  });

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
          localStorage.removeItem('auth-token');
          router.push('/login');
          throw new Error('Session expired. Please login again.');
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

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiCall('/Assignment/GetAllStudentTermAssignment');
      if (response.status && response.data) {
        setAssignments(response.data);
      } else {
        setError(response.message || 'Failed to fetch assignments');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const viewAssignment = async (assignmentId) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiCall(`/Assignment/Get/${assignmentId}`);
      if (response.status && response.data) {
        setSelectedAssignment(response.data);
        setShowModal(true);
      } else {
        setError(response.message || 'Failed to fetch assignment details');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sortAssignments = (assignments) => {
    return [...assignments].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'subject':
          aValue = a.subject?.toLowerCase() || '';
          bValue = b.subject?.toLowerCase() || '';
          break;
        case 'teacher':
          aValue = a.teacher?.toLowerCase() || '';
          bValue = b.teacher?.toLowerCase() || '';
          break;
        default:
          aValue = a.content?.toLowerCase() || '';
          bValue = b.content?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const filteredAssignments = sortAssignments(assignments.filter(assignment => {
    const matchesSearch = assignment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.teacher?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'overdue') {
      const dueDate = new Date(assignment.dueDate);
      const today = new Date();
      return matchesSearch && dueDate < today;
    }
    if (filterBy === 'upcoming') {
      const dueDate = new Date(assignment.dueDate);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && dueDate >= today && dueDate <= nextWeek;
    }
    return matchesSearch;
  }));

  useEffect(() => {
    fetchAssignments();
  }, []);

  const AssignmentCard = ({ assignment }) => {
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today;
    const isUpcoming = dueDate >= today && dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
              {assignment.content}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {assignment.subject}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {assignment.level}
              </span>
              {isOverdue && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </span>
              )}
              {isUpcoming && !isOverdue && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due Soon
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => viewAssignment(assignment.id)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Assignment"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>Teacher: {assignment.teacher}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Due: {dueDate.toLocaleDateString()}</span>
            {!isOverdue && daysUntilDue >= 0 && (
              <span className="text-gray-500">
                ({daysUntilDue === 0 ? 'Today' : `${daysUntilDue} days left`})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            <span>{assignment.session} - {assignment.term}</span>
          </div>
        </div>
      </div>
    );
  };

  const AssignmentModal = () => {
    if (!selectedAssignment) return null;

    const dueDate = new Date(selectedAssignment.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today;
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b bg-gray-50 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Assignment Details</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedAssignment.subject} • {selectedAssignment.level}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAssignment(null);
                }}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Teacher</span>
                  </div>
                  <p className="text-gray-900">{selectedAssignment.teacher}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">Due Date</span>
                  </div>
                  <p className="text-gray-900">{dueDate.toLocaleDateString()}</p>
                  {!isOverdue && daysUntilDue >= 0 && (
                    <p className="text-sm text-gray-600">
                      ({daysUntilDue === 0 ? 'Due Today' : `${daysUntilDue} days remaining`})
                    </p>
                  )}
                  {isOverdue && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Overdue
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Assignment Content
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedAssignment.content}</p>
                </div>
              </div>

              {selectedAssignment.instructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Instructions
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Assignment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Subject</p>
                      <p className="font-medium">{selectedAssignment.subject}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Level</p>
                      <p className="font-medium">{selectedAssignment.level}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Session</p>
                      <p className="font-medium">{selectedAssignment.session}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Term</p>
                      <p className="font-medium">{selectedAssignment.term}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Assignments</option>
            <option value="upcoming">Due Soon</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="dueDate">Due Date</option>
            <option value="subject">Subject</option>
            <option value="teacher">Teacher</option>
            <option value="content">Content</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:flex">
        <Sidebar />
        
        <div className="flex-1 lg:ml-0">
          <div className="sticky top-0 z-40 lg:mx-8 lg:mt-8 bg-white rounded-t-xl shadow-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
                  <p className="text-sm text-gray-600">
                    {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={fetchAssignments}
                  disabled={isLoading}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 lg:px-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {!isLoading && filteredAssignments.length === 0 && !error && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'No assignments have been posted yet'}
                </p>
              </div>
            )}

            {!isLoading && filteredAssignments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && <AssignmentModal />}
      
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default withAuth(StudentAssignments);