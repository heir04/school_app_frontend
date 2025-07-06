"use client"
import React, { useState, useEffect, useRef } from 'react';
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

const API_BASE_URL = 'https://schoolapp-production-e49d.up.railway.app/api';

const CheckResults = () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const printRef = useRef();

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
      
      if (response.status) {
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

  const downloadPDF = async () => {
    if (!result) return;

    try {
      // Dynamically import html2pdf only on the client side
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = printRef.current;
      
      // Temporarily make the element visible for PDF generation
      const originalStyle = element.style.cssText;
      element.style.cssText = 'position: relative; top: auto; left: auto; opacity: 1; width: auto; height: auto;';
      
      const opt = {
        margin: 1,
        filename: `${result.studentName}_Results_${result.termName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      
      // Restore the original hidden styles
      element.style.cssText = originalStyle;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      
      // Make sure to restore styles even if there's an error
      const element = printRef.current;
      if (element) {
        element.style.cssText = 'position: absolute; top: -9999px; left: -9999px; width: 21cm; min-height: 29.7cm; opacity: 0; pointer-events: none;';
      }
    }
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
            {/* Printable Content - Hidden from view but available for PDF generation */}
            <div ref={printRef} className="print-content absolute -top-full left-0 opacity-0 pointer-events-none"
                 style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '21cm', minHeight: '29.7cm' }}>
              {/* PDF Header */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 print:shadow-none print:border">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">STUDENT RESULT REPORT</h1>
                  <p className="text-gray-600">Academic Performance Summary</p>
                </div>
                
                {/* Student Info for PDF */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Student Name:</p>
                    <p className="font-semibold text-gray-900">{result.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Class:</p>
                    <p className="font-semibold text-gray-900">{result.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Term:</p>
                    <p className="font-semibold text-gray-900">{result.termName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Subjects:</p>
                    <p className="font-semibold text-gray-900">{result.subjectScores?.length || 0}</p>
                  </div>
                </div>

                {/* Performance Summary for PDF */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Score</p>
                    <p className="text-xl font-bold text-gray-900">{calculateTotalScore()}</p>
                    <p className="text-xs text-gray-500">Out of {(result.subjectScores?.length || 0) * 100}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-xl font-bold text-gray-900">{calculateAverage()}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Overall Grade</p>
                    <p className={`text-xl font-bold ${getGradeColor(calculateAverage())}`}>
                      {getGrade(calculateAverage())}
                    </p>
                  </div>
                </div>

                {/* Subject Scores Table for PDF */}
                <div className="overflow-x-auto">
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
                          Remark
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
                            {getGrade(subject.totalScore)}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                            {subject.totalScore >= 50 ? 'Pass' : 'Fail'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {result.remark && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Principal's Remark</h3>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <p className="text-gray-700 italic">"{result.remark}"</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 text-center text-xs text-gray-500">
                  <p>Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Web View Content */}
            <div className="print:hidden">
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
                    <button 
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!result}
                    >
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
            </div>
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