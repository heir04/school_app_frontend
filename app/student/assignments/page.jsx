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
  Search,
  Eye,
  RefreshCw,
  GraduationCap,
  X,
  ArrowLeft
} from 'lucide-react';
import { withAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'https://schoolapp-production-e49d.up.railway.app/api';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
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
      const aValue = new Date(a.dueDate);
      const bValue = new Date(b.dueDate);
      return aValue > bValue ? 1 : -1;
    });
  };

  const filteredAssignments = sortAssignments(assignments.filter(assignment => {
    return assignment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           assignment.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           assignment.teacher?.toLowerCase().includes(searchTerm.toLowerCase());
  }));

  useEffect(() => {
    fetchAssignments();
  }, []);

  const getAssignmentStatus = (assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today;
    const isUpcoming = dueDate >= today && dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    return { isOverdue, isUpcoming, daysUntilDue, dueDate };
  };

  const ErrorAlert = ({ message }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
        <p className="text-red-800 text-sm">{message}</p>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading assignments...</span>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
      <p className="text-gray-600">
        {searchTerm ? 'Try adjusting your search terms' : 'No assignments have been posted yet'}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              My Assignments
            </h1>
            <p className="text-gray-600 mt-2">
              {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert message={error} />}

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Empty State */}
        {!isLoading && filteredAssignments.length === 0 && !error && <EmptyState />}

        {/* Assignments List */}
        {!isLoading && filteredAssignments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => {
                const { isOverdue, isUpcoming, daysUntilDue, dueDate } = getAssignmentStatus(assignment);
                
                return (
                  <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {assignment.content}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {assignment.subject}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {assignment.level}
                          </span>
                          {isOverdue && (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Overdue
                            </span>
                          )}
                          {isUpcoming && !isOverdue && (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Due Soon
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
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
                      
                      <button
                        onClick={() => viewAssignment(assignment.id)}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assignment Details Modal */}
        {showModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gray-50">
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

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Assignment Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700">Teacher</span>
                    </div>
                    <p className="text-gray-900 font-semibold">{selectedAssignment.teacher}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700">Due Date</span>
                    </div>
                    <p className="text-gray-900 font-semibold">
                      {new Date(selectedAssignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Assignment Content */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Assignment Content
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedAssignment.content}</p>
                  </div>
                </div>

                {/* Instructions */}
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

                {/* Additional Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Subject</p>
                        <p className="font-medium">{selectedAssignment.subject}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Level</p>
                        <p className="font-medium">{selectedAssignment.level}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Session</p>
                        <p className="font-medium">{selectedAssignment.session}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
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
        )}
      </div>
    </div>
  );
};

export default withAuth(StudentAssignments, ['student']);