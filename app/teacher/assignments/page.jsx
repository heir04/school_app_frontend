"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Menu,
  X
} from 'lucide-react';
import { withAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'https://schoolapp-production-e49d.up.railway.app/api';

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    content: '',
    instructions: '',
    subjectId: '',
    levelId: '',
    dueDate: ''
  });

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

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiCall('/Assignment/GetAllTeacherAssignment');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      const endpoint = editingAssignment 
        ? `/Assignment/Update/${editingAssignment.id}`
        : '/Assignment/Create';
      
      const method = editingAssignment ? 'PUT' : 'POST';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status) {
        setShowCreateForm(false);
        setEditingAssignment(null);
        setFormData({
          content: '',
          instructions: '',
          subjectId: '',
          levelId: '',
          dueDate: ''
        });
        fetchAssignments();
      } else {
        setError(data.message || 'Failed to save assignment');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      content: assignment.content || '',
      instructions: assignment.instructions || '',
      subjectId: assignment.subjectId || '',
      levelId: assignment.levelId || '',
      dueDate: assignment.dueDate ? assignment.dueDate.split('T')[0] : ''
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (assignmentId) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await apiCall(`/Assignment/Delete/${assignmentId}`, {
        method: 'POST'
      });

      if (response.status) {
        fetchAssignments();
      } else {
        setError(response.message || 'Failed to delete assignment');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.level?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const AssignmentCard = ({ assignment }) => {
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today;
    const isUpcoming = dueDate >= today && dueDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
              {assignment.content}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {assignment.subject}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {assignment.level}
              </span>
              {isOverdue && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Overdue
                </span>
              )}
              {isUpcoming && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Due Soon
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(assignment)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(assignment.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Due: {dueDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{assignment.session} - {assignment.term}</span>
          </div>
        </div>
        
        {assignment.instructions && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-3">{assignment.instructions}</p>
          </div>
        )}
      </div>
    );
  };

  const CreateAssignmentForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setEditingAssignment(null);
                setFormData({
                  content: '',
                  instructions: '',
                  subjectId: '',
                  levelId: '',
                  dueDate: ''
                });
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
              placeholder="Enter assignment content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Enter assignment instructions..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject ID *
              </label>
              <input
                type="text"
                value={formData.subjectId}
                onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter subject ID..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level ID *
              </label>
              <input
                type="text"
                value={formData.levelId}
                onChange={(e) => setFormData({...formData, levelId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter level ID..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Create Assignment'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setEditingAssignment(null);
                setFormData({
                  content: '',
                  instructions: '',
                  subjectId: '',
                  levelId: '',
                  dueDate: ''
                });
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
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
          className="text-red-600 hover:text-red-800 text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );

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
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
                Teacher Portal
              </h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 w-full"
              >
                <BookOpen className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              <button
                className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg transition-all duration-200 w-full"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Assignments</span>
              </button>
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
              <h1 className="text-lg font-semibold text-gray-900">Assignments</h1>
              <div className="w-10" />
            </div>
          </div>

          <div className="p-4 lg:p-8">
            {error && <ErrorAlert message={error} onClose={() => setError('')} />}

            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>
                <p className="text-gray-600">Manage your class assignments</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Assignment
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Assignments</option>
                    <option value="upcoming">Due Soon</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Assignments Grid */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first assignment to get started'
                  }
                </p>
                {!searchTerm && filterBy === 'all' && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Assignment
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Assignment Modal */}
      {showCreateForm && <CreateAssignmentForm />}
    </div>
  );
};

export default withAuth(TeacherAssignments, ['teacher']);