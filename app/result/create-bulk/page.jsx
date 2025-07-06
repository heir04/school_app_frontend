"use client"
import React, { useState, useEffect } from 'react';
import { Save, Users, BookOpen, AlertCircle, CheckCircle, XCircle, Clock, AlertTriangle, X, ArrowLeft, Award } from 'lucide-react';
import { withAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

const API_BASE_URL = 'https://schoolapp-production-e49d.up.railway.app/api';

const BulkResultDashboard = () => {
  const [formData, setFormData] = useState({
    levelId: '',
    subjectId: ''
  });
  const [students, setStudents] = useState([]);
  const [studentScores, setStudentScores] = useState({});
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [currentSessionTerm, setCurrentSessionTerm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const getAuthToken = () => localStorage.getItem('auth-token');

  const getAuthHeaders = (isJson = true) => ({
    ...(isJson && { 'Content-Type': 'application/json' }),
    'Authorization': `Bearer ${getAuthToken()}`
  });

  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(options.isJson),
          ...options.headers
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [levelsRes, subjectsRes, currentSessionTermRes] = await Promise.all([
          apiCall('/Level/GetAll'),
          apiCall('/Subject/GetSubjectsByTeacher'),
          apiCall('/Session/GetCurrentSessionAndTermName')
        ]);

        if (levelsRes.status && levelsRes.data) {
          setLevels(levelsRes.data);
        }

        if (subjectsRes.status && subjectsRes.data) {
          setSubjects(subjectsRes.data);
        }

        if (currentSessionTermRes.status && currentSessionTermRes.data) {
          setCurrentSessionTerm(currentSessionTermRes.data);
        }
      } catch (error) {
        setError(`Failed to fetch data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchStudents = async () => {
    if (!formData.levelId || !formData.subjectId) return;

    setLoading(true);
    setError('');
    try {
      const response = await apiCall(`/Result/GetStudentsByLevel/${formData.levelId}/${formData.subjectId}`);
      if (response.status && response.data) {
        setStudents(response.data);
        const initialScores = {};
        response.data.forEach(student => {
          initialScores[student.id] = {
            continuousAssessment: '',
            examScore: ''
          };
        });
        setStudentScores(initialScores);
      } else {
        setStudents([]);
        setStudentScores({});
        setError('No students found for the selected level and subject.');
      }
    } catch (error) {
      setError(`Failed to fetch students: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [formData.levelId, formData.subjectId]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleScoreChange = (studentId, field, value) => {
    const numValue = parseFloat(value) || 0;
    if (numValue < 0 || (field === 'continuousAssessment' && numValue > 40) || (field === 'examScore' && numValue > 60)) return;

    setStudentScores({
      ...studentScores,
      [studentId]: {
        ...studentScores[studentId],
        [field]: value
      }
    });
  };

  const calculateTotal = (studentId) => {
    const scores = studentScores[studentId];
    if (!scores) return 0;

    const ca = parseFloat(scores.continuousAssessment) || 0;
    const exam = parseFloat(scores.examScore) || 0;
    return ca + exam;
  };

  const getGrade = (total) => {
    if (total >= 70) return { grade: 'A', color: 'text-green-600' };
    if (total >= 60) return { grade: 'B', color: 'text-blue-600' };
    if (total >= 50) return { grade: 'C', color: 'text-yellow-600' };
    if (total >= 40) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const validateScores = () => {
    for (const studentId of Object.keys(studentScores)) {
      const scores = studentScores[studentId];
      const ca = parseFloat(scores.continuousAssessment);
      const exam = parseFloat(scores.examScore);

      if (isNaN(ca) || isNaN(exam) || ca < 0 || ca > 40 || exam < 0 || exam > 60) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.levelId || !formData.subjectId) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateScores()) {
      setError('Please ensure all scores are valid (CA: 0-40, Exam: 0-60)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const bulkResultData = {
        levelId: formData.levelId,
        subjectId: formData.subjectId,
        studentScores: students.map(student => ({
          studentId: student.id,
          studentName: student.fullName,
          continuousAssessment: parseFloat(studentScores[student.id]?.continuousAssessment) || 0,
          examScore: parseFloat(studentScores[student.id]?.examScore) || 0
        }))
      };

      const response = await apiCall('/Result/CreateResults', {
        method: 'POST',
        body: JSON.stringify(bulkResultData)
      });

      if (response.status && response.data) {
        setResults(response.data);
        setShowResults(true);
      } else {
        setError('Failed to submit results');
      }
    } catch (error) {
      setError(`Error submitting results: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Created':
      case 'Updated':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Skipped':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Bulk Result Submission Results</h1>
              <button
                onClick={() => {
                  setShowResults(false);
                  setResults([]);
                  setStudentScores({});
                  setFormData({ levelId: '', subjectId: '' });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create New Batch
              </button>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium text-gray-800">{result.studentName}</p>
                      {result.message && (
                        <p className="text-sm text-gray-600">{result.message}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.status === 'Created' || result.status === 'Updated' 
                      ? 'bg-green-100 text-green-800'
                      : result.status === 'Failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex justify-end mb-6">
          <Link href="/result" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Bulk Result Entry</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  name="levelId"
                  value={formData.levelId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Level</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>{level.levelName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading students...</p>
              </div>
            ) : students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                        S/N
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700">
                        Student Name
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">
                        C/A (40)
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">
                        Exam (60)
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">
                        Total (100)
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">
                        Grade
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const total = calculateTotal(student.id);
                      const { grade, color } = getGrade(total);

                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {index + 1}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{student.fullName}</span>
                              {student.hasExistingScore && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                  Has Score
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              max="40"
                              step="0.1"
                              value={studentScores[student.id]?.continuousAssessment || ''}
                              onChange={(e) => handleScoreChange(student.id, 'continuousAssessment', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                              placeholder="0.0"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              max="60"
                              step="0.1"
                              value={studentScores[student.id]?.examScore || ''}
                              onChange={(e) => handleScoreChange(student.id, 'examScore', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                              placeholder="0.0"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">
                            {total.toFixed(1)}
                          </td>
                          <td className={`border border-gray-300 px-4 py-2 text-center font-bold ${color}`}>
                            {grade}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {student.hasExistingScore ? (
                              <span className="text-yellow-600 text-sm">Will Skip</span>
                            ) : (
                              <span className="text-green-600 text-sm">Ready</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : formData.levelId && formData.subjectId ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No students found for the selected level and subject.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Please select a level and subject to load students.</p>
              </div>
            )}

            {students.length > 0 && (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setStudentScores({});
                    const initialScores = {};
                    students.forEach(student => {
                      initialScores[student.id] = {
                        continuousAssessment: '',
                        examScore: ''
                      };
                    });
                    setStudentScores(initialScores);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Instructions</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Select the level and subject to load all students in that level</li>
                <li>• Enter Continuous Assessment scores (0-40) and Exam scores (0-60)</li>
                <li>• Students with existing scores for this subject will be skipped</li>
                <li>• Total score is automatically calculated (C/A + Exam)</li>
                <li>• Grades: A (70-100), B (60-69), C (50-59), D (40-49), F (0-39)</li>
                <li>• Results are submitted for the current term set by the system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(BulkResultDashboard, ['teacher']);