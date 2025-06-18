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
  BarChart3
} from 'lucide-react';
import { withAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

const API_BASE_URL = 'http://localhost:5130/api';

const CheckResults = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const fetchResult = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiCall('/Result/CheckResult');
      
      if (response.status && response.data) {
        setResult(response.data);
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
    fetchResult();
  }, []);

  const calculateTotalScore = () => {
    if (!result?.subjectScores) return 0;
    return result.subjectScores.reduce((total, subject) => total + subject.totalScore, 0);
  };

  const calculateAverage = () => {
    if (!result?.subjectScores?.length) return 0;
    return (calculateTotalScore() / result.subjectScores.length).toFixed(2);
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getGradeColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
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
              <Award className="w-8 h-8 text-blue-600" />
              My Results
            </h1>
            <p className="text-gray-600 mt-1">View your academic performance</p>
          </div>
          <Link href="/student" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {error && <ErrorAlert message={error} />}

        {result ? (
          <>
            {/* Student Info Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Term</p>
                    <p className="font-semibold text-gray-900">{result.termName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-green-600">Published</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Total Subjects" 
                value={result.subjectScores?.length || 0} 
                icon={BookOpen} 
                color="#3B82F6" 
              />
              <StatCard 
                title="Total Score" 
                value={calculateTotalScore()} 
                icon={BarChart3} 
                color="#10B981"
                subtext={`Out of ${(result.subjectScores?.length || 0) * 100}`}
              />
              <StatCard 
                title="Average Score" 
                value={`${calculateAverage()}%`} 
                icon={Award} 
                color="#F59E0B"
                subtext={`Grade: ${getGrade(calculateAverage())}`}
              />
            </div>

            {/* Subject Scores Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Subject Breakdown</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CA Score
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam Score
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Score
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {result.subjectScores?.map((subject, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-100 rounded-full mr-3"></div>
                            <span className="text-sm font-medium text-gray-900">
                              {subject.subjectName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                          {subject.continuousAssessment}/40
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                          {subject.examScore}/60
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="text-lg font-semibold text-gray-900">
                            {subject.totalScore}/100
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`text-lg font-bold ${getGradeColor(subject.totalScore)}`}>
                            {getGrade(subject.totalScore)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
            </div>

            {result.remark && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Principal's Remark</h3>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-gray-700 italic">"{result.remark}"</p>
                </div>
              </div>
            )}
          </>
        ) : (
          !error && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Available</h3>
              <p className="text-gray-600">
                Your results haven't been published yet. Please check back later.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default withAuth(CheckResults, ['student']);