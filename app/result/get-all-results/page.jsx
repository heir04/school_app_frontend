"use client"
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  User, 
  Calendar, 
  Award,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Download,
  BarChart3,
  GraduationCap,
  TrendingUp,
  Eye,
  FileText
} from 'lucide-react';
import { withAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

const API_BASE_URL = 'https://schoolapp-production-ac99.up.railway.app/api';

const AllResults = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getAuthToken = () => localStorage.getItem('auth-token');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
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

  const fetchAllResults = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiCall('/Result/GetAllStudentResults');
      
      if (response.status) {
        setResults(response.data || []);
      } else {
        setError(response.message || 'No results found');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch results');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllResults();
  }, []);

  const calculateTotalScore = (subjectScores) => {
    if (!subjectScores || subjectScores.length === 0) return 0;
    return subjectScores.reduce((total, subject) => total + subject.totalScore, 0);
  };

  const calculateAverage = (subjectScores) => {
    if (!subjectScores || subjectScores.length === 0) return 0;
    return (calculateTotalScore(subjectScores) / subjectScores.length).toFixed(2);
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 75) return 'A';
    if (score >= 70) return 'B2';
    if (score >= 65) return 'B3';
    if (score >= 60) return 'C4';
    if (score >= 55) return 'C5';
    if (score >= 50) return 'C6';
    if (score >= 45) return 'D7';
    if (score >= 40) return 'E8';
    return 'F9';
  };

  const getGradeColor = (score) => {
    if (score >= 75) return 'text-green-600';  // A+ and A grades
    if (score >= 60) return 'text-blue-600';   // B2, B3, C4 grades
    if (score >= 40) return 'text-yellow-600'; // C5, C6, D7, E8 grades
    return 'text-red-600';                     // F9 grade
  };


  const getPerformanceStatus = (average) => {
    if (average >= 80) return { status: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (average >= 70) return { status: 'Very Good', color: 'bg-blue-100 text-blue-800' };
    if (average >= 60) return { status: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (average >= 50) return { status: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { status: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  const openDetailModal = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedResult(null);
    setShowDetailModal(false);
  };

  const ErrorAlert = ({ message }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
        <div className="flex-1">
          <p className="text-red-800">{message}</p>
        </div>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const DetailModal = ({ result, onClose }) => {
    if (!result) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {result.termName} - {result.sessionName} Results
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Student Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Student Name</p>
                  <p className="font-semibold text-gray-900">{result.studentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Class</p>
                  <p className="font-semibold text-gray-900">{result.level}</p>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Score</p>
                <p className="text-xl font-bold text-gray-900">{calculateTotalScore(result.subjectScores)}</p>
                <p className="text-xs text-gray-500">Out of {(result.subjectScores?.length || 0) * 100}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-xl font-bold text-gray-900">{calculateAverage(result.subjectScores)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Overall Grade</p>
                <p className={`text-xl font-bold ${getGradeColor(calculateAverage(result.subjectScores))}`}>
                  {getGrade(calculateAverage(result.subjectScores))}
                </p>
              </div>
            </div>

            {/* Subject Scores Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-900">
                      Subject
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                      CA Score (40)
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                      Exam Score (60)
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                      Total Score (100)
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                      Grade
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.subjectScores?.map((subject, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                        {subject.subjectName}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-900">
                        {subject.continuousAssessment}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-900">
                        {subject.examScore}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-900">
                        {subject.totalScore}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm font-bold">
                        <span className={getGradeColor(subject.totalScore)}>
                          {getGrade(subject.totalScore)}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          subject.totalScore >= 50 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subject.totalScore >= 50 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Principal's Remark */}
            {result.remark && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Principal's Remark</h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-gray-700 italic">"{result.remark}"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              All My Results
            </h1>
            <p className="text-gray-600 mt-1">Complete academic performance history</p>
          </div>
          <Link href="/student" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {error && <ErrorAlert message={error} />}

        {results.length > 0 ? (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Total Results" 
                value={results.length} 
                icon={FileText} 
                color="#3B82F6"
                subtext="Published results"
              />
              <StatCard 
                title="Latest Average" 
                value={`${calculateAverage(results[0]?.subjectScores)}%`} 
                icon={TrendingUp} 
                color="#10B981"
                subtext={`Grade: ${getGrade(calculateAverage(results[0]?.subjectScores))}`}
              />
              <StatCard 
                title="Total Subjects" 
                value={results[0]?.subjectScores?.length || 0} 
                icon={BookOpen} 
                color="#F59E0B"
                subtext="Last term"
              />
            </div>

            {/* Results List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Academic Results History</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {results.map((result, index) => {
                  const average = calculateAverage(result.subjectScores);
                  const performance = getPerformanceStatus(average);
                  
                  return (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {result.termName} - {result.sessionName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${performance.color}`}>
                              {performance.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              <span>Class: {result.level}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-4 h-4" />
                              <span>Average: {average}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4" />
                              <span>Grade: {getGrade(average)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>Subjects: {result.subjectScores?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{calculateTotalScore(result.subjectScores)}</p>
                            <p className="text-xs text-gray-500">Total Score</p>
                          </div>
                          <button
                            onClick={() => openDetailModal(result)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          !error && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Available</h3>
              <p className="text-gray-600">
                No academic results have been published yet. Please check back later.
              </p>
            </div>
          )
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <DetailModal result={selectedResult} onClose={closeDetailModal} />
      )}
    </div>
  );
};

export default withAuth(AllResults, ['student']);