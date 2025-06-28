"use client"
import React, { useState, useEffect } from 'react';
import { 
  School, 
  GraduationCap, 
  BookOpen, 
  Search,
  MessageSquare,
  Save,
  Eye,
  AlertTriangle,
  CheckCircle,
  Users,
  FileText,
  Calendar,
  X
} from 'lucide-react';
import { withAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5130/api';

const AdminResultsRemarksPage = () => {
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for data
  const [levels, setLevels] = useState([]);
  const [results, setResults] = useState([]);
  const [currentSessionTerm, setCurrentSessionTerm] = useState(null);
  
  // State for remarks modal
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [remarkText, setRemarkText] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);

  // State for view result modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingResult, setViewingResult] = useState(null);
  const [loadingResultDetails, setLoadingResultDetails] = useState(false);

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

  // Fetch levels
  const fetchLevels = async () => {
    try {
      const response = await apiCall('/Level/GetAll');
      if (response.status && response.data) {
        setLevels(response.data);
      }
    } catch (error) {
      setError('Failed to fetch levels: ' + error.message);
    }
  };

  // Fetch session and term info (assuming you have these endpoints)
  const fetchSessionTermInfo = async () => {
    try {
      // You might need to adjust these endpoints based on your actual API
      const [currentSessionTermRes] = await Promise.all([
        apiCall('/Session/GetCurrentSessionAndTermName')
      ]);
      
      if (currentSessionTermRes.status && currentSessionTermRes.data) {
        setCurrentSessionTerm(currentSessionTermRes.data);
      }
    } catch (error) {
      console.log('Session/Term info not available');
    }
  };

  // Fetch results by level
  const fetchResultsByLevel = async (levelId) => {
    if (!levelId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiCall(`/Result/GetAllByLevel/${levelId}`);
      if (response.status && response.data) {
        setResults(response.data);
      } else {
        setResults([]);
        setError(response.message || 'No results found for this level');
      }
    } catch (error) {
      setError('Failed to fetch results: ' + error.message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch detailed result for viewing
  const fetchResultDetails = async (resultId) => {
    setLoadingResultDetails(true);
    try {
      const response = await apiCall(`/Result/Get/${resultId}`);
      if (response.status && response.data) {
        setViewingResult(response.data);
      } else {
        setError(response.message || 'Failed to fetch result details');
      }
    } catch (error) {
      setError('Failed to fetch result details: ' + error.message);
    } finally {
      setLoadingResultDetails(false);
    }
  };

  // Handle level selection
  const handleLevelChange = (levelId) => {
    setSelectedLevel(levelId);
    if (levelId) {
      fetchResultsByLevel(levelId);
    } else {
      setResults([]);
    }
  };

  // Open view result modal
  const openViewModal = async (result) => {
    setIsViewModalOpen(true);
    await fetchResultDetails(result.id);
  };

  // Close view result modal
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingResult(null);
  };

  // Open remark modal
  const openRemarkModal = (result) => {
    setSelectedResult(result);
    setRemarkText(result.remark || '');
    setIsRemarkModalOpen(true);
  };

  // Close remark modal
  const closeRemarkModal = () => {
    setIsRemarkModalOpen(false);
    setSelectedResult(null);
    setRemarkText('');
  };

  // Submit remark
  const submitRemark = async () => {
    if (!selectedResult || !remarkText.trim()) {
      setError('Please enter a remark');
      return;
    }

    setSubmittingRemark(true);
    setError('');

    try {
      const response = await apiCall(`/Result/GiveRemark/${selectedResult.id}`, {
        method: 'PUT',
        body: JSON.stringify({ remark: remarkText.trim() })
      });

      if (response.status) {
        setSuccess('Remark added successfully');
        // Update the local results state
        setResults(prev => prev.map(result => 
          result.id === selectedResult.id 
            ? { ...result, remark: remarkText.trim() }
            : result
        ));
        closeRemarkModal();
      } else {
        setError(response.message || 'Failed to add remark');
      }
    } catch (error) {
      setError('Failed to submit remark: ' + error.message);
    } finally {
      setSubmittingRemark(false);
    }
  };

  // Filter results based on search term
  const filteredResults = results.filter(result => {
    if (!searchTerm) return true;
    return result.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate statistics
  const stats = {
    totalResults: results.length,
    withRemarks: results.filter(r => r.remark).length,
    withoutRemarks: results.filter(r => !r.remark).length
  };

  // Initial data load
  useEffect(() => {
    fetchLevels();
    fetchSessionTermInfo();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl shadow-lg p-6 border-l-4`} style={{ borderLeftColor: color }}>
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

  const AlertMessage = ({ message, type, onClose }) => {
    const styles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    };
    
    const icons = {
      success: CheckCircle,
      error: AlertTriangle
    };
    
    const Icon = icons[type];

    return (
      <div className={`border rounded-lg p-4 mb-6 ${styles[type]}`}>
        <div className="flex items-start">
          <Icon className="w-5 h-5 mt-0.5 mr-3" />
          <div className="flex-1">
            <p>{message}</p>
          </div>
          <button onClick={onClose} className="ml-4 text-lg font-bold">×</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <School className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Results Remarks Management</h1>
          </div>
          <p className="text-gray-600">Add remarks to student results for better feedback</p>
          {currentSessionTerm && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Session: {currentSessionTerm.sessionName}
              </span>
              <span>Term: {currentSessionTerm.termName}</span>
            </div>
          )}
        </div>

        {/* Alert Messages */}
        {success && (
          <AlertMessage 
            message={success} 
            type="success" 
            onClose={() => setSuccess('')} 
          />
        )}
        {error && (
          <AlertMessage 
            message={error} 
            type="error" 
            onClose={() => setError('')} 
          />
        )}

        {/* Level Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Select Class Level
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a class level...</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.levelName} - {level.description}
                </option>
              ))}
            </select>
            {selectedLevel && (
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        {selectedLevel && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Results" 
              value={stats.totalResults} 
              icon={FileText} 
              color="#3B82F6" 
              bgColor="bg-white"
            />
            <StatCard 
              title="With Remarks" 
              value={stats.withRemarks} 
              icon={CheckCircle} 
              color="#10B981" 
              bgColor="bg-white"
            />
            <StatCard 
              title="Pending Remarks" 
              value={stats.withoutRemarks} 
              icon={MessageSquare} 
              color="#F59E0B" 
              bgColor="bg-white"
            />
          </div>
        )}

        {/* Results Table */}
        {selectedLevel && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Student Results
                {filteredResults.length > 0 && (
                  <span className="text-sm text-gray-500">({filteredResults.length} students)</span>
                )}
              </h3>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {selectedLevel ? 'No results found for this level' : 'Please select a level to view results'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subjects
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remark Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredResults.map((result, index) => {
                      const totalScore = result.subjectScores?.reduce((sum, score) => sum + score.totalScore, 0) || 0;
                      const avgScore = result.subjectScores?.length > 0 ? (totalScore / result.subjectScores.length).toFixed(1) : 'N/A';
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {result.studentName?.split(' ').map(n => n[0]).join('') || 'N/A'}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {result.studentName || 'Unknown'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {result.level}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {result.subjectScores?.length || 0} subjects
                            </div>
                            <div className="text-xs text-gray-500">
                              {result.subjectScores?.map(score => score.subjectName).join(', ') || 'No subjects'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {avgScore}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {result.remark ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Has Remark
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openViewModal(result)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="View Result Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openRemarkModal(result)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title={result.remark ? "Edit Remark" : "Add Remark"}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* View Result Modal */}
        {isViewModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="w-6 h-6 text-green-600" />
                    Student Result Details
                  </h3>
                  <button
                    onClick={closeViewModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {loadingResultDetails ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : viewingResult ? (
                  <div className="space-y-6">
                    {/* Student Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Student Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{viewingResult.studentName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Level:</span>
                          <span className="ml-2 font-medium">{viewingResult.level}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Session:</span>
                          <span className="ml-2 font-medium">{viewingResult.sessionName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Term:</span>
                          <span className="ml-2 font-medium">{viewingResult.termName}</span>
                        </div>
                      </div>
                      {viewingResult.totalScore && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-gray-600">Total Score:</span>
                          <span className="ml-2 font-bold text-lg text-blue-600">{viewingResult.totalScore}</span>
                        </div>
                      )}
                    </div>

                    {/* Subject Scores */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Subject Scores</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">CA</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Exam</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {viewingResult.subjectScores?.map((score, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {score.subjectName}
                                </td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">
                                  {score.continuousAssessment}
                                </td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">
                                  {score.examScore}
                                </td>
                                <td className="px-4 py-3 text-sm text-center font-semibold text-blue-600">
                                  {score.totalScore}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Current Remark */}
                    {viewingResult.remark && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Current Remark</h4>
                        <p className="text-gray-700">{viewingResult.remark}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Failed to load result details</p>
                  </div>
                )}

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeViewModal}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remark Modal */}
        {isRemarkModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    {selectedResult?.remark ? 'Edit Remark' : 'Add Remark'}
                  </h3>
                  <button
                    onClick={closeRemarkModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Student:</p>
                  <p className="font-medium text-gray-900">{selectedResult?.studentName}</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remark
                  </label>
                  <textarea
                    value={remarkText}
                    onChange={(e) => setRemarkText(e.target.value)}
                    placeholder="Enter your remark for this student's performance..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeRemarkModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={submittingRemark}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRemark}
                    disabled={submittingRemark || !remarkText.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingRemark ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {submittingRemark ? 'Saving...' : 'Save Remark'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(AdminResultsRemarksPage, ['admin', 'superadmin']);