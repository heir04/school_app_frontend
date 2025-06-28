"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Upload, 
  Save, 
  Loader2, 
  X, 
  AlertCircle,
  ArrowLeft 
} from 'lucide-react';
import { withAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:5130/api';

const FormField = ({ label, type = 'text', value, onChange, options, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'select' ? (
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select {label}</option>
        {options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : type === 'radio' ? (
      <div className="flex gap-4">
        {options?.map(option => (
          <label key={option.value} className="flex items-center gap-1">
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              required={required}
              className="accent-blue-600"
            />
            {option.label}
          </label>
        ))}
      </div>
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    )}
  </div>
);

const StudentCreate = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    levelName: '',
    phoneNumber: '',
    address: '',
    gender: '',
    dateOfBirth: ''
  });
  const [levels, setLevels] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthToken = () => localStorage.getItem('auth-token');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`
  });
  
  const apiCall = async (endpoint, options = {}) => {
    let headers = { ...getAuthHeaders(), ...options.headers };
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        let errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      return contentType && contentType.includes('application/json') 
        ? await response.json() 
        : await response.text();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };
  
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await apiCall('/Level/GetAll');
        if (response.status && response.data) {
          setLevels(response.data);
        }
      } catch (error) {
        setError(`Failed to fetch levels: ${error.message}`);
      }
    };
    fetchLevels();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('email', formData.email);
      data.append('levelName', formData.levelName);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('address', formData.address);
      data.append('gender', formData.gender);
      data.append('dateOfBirth', formData.dateOfBirth);

      await apiCall('/Student/Register', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data
      });

      router.push('/student/get-students');
    } catch (error) {
      setError(`Failed to create student: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('type', 'students');

      const response = await fetch(`${API_BASE_URL}/Student/BulkUpload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      setUploadResults(result);
      setUploadFile(null);
      setUploadProgress(100);
    } catch (error) {
      setError(`Bulk upload failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorAlert = ({ message }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
        <p className="text-red-800 text-sm">{message}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Add New Student
          </h1>
          <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
        </div>

        {error && <ErrorAlert message={error} />}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Details</h2>
          <form onSubmit={handleSubmit}>
            <FormField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <FormField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
            <FormField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FormField
              label="Phone Number"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
            />
            <FormField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <FormField
              label="Gender"
              type="radio"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]}
              required
            />
            <FormField
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
            <FormField
              label="Grade Level"
              type="select"
              value={formData.levelName}
              onChange={(e) => setFormData({ ...formData, levelName: e.target.value })}
              options={levels.map(level => ({ value: level.levelName, label: level.levelName }))}
              required
            />
            <div className="flex justify-end gap-2 mt-6">
              <Link href="/admin?tab=students" className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-sm">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bulk Upload Students</h2>
          <form onSubmit={handleBulkUpload}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  {uploadFile ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-2 text-sm text-gray-700">{uploadFile.name}</p>
                      <p className="text-xs text-gray-400">Click to change file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">CSV files only</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {uploadProgress > 0 && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Upload Progress: {uploadProgress}%</p>
              </div>
            )}

            {uploadResults && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Results</h3>
                <p className="text-sm text-gray-600">
                  Success: {uploadResults.successCount || 0} records processed
                </p>
                {uploadResults.errors && uploadResults.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600">Errors:</p>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {uploadResults.errors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <Link href="/admin?tab=students" className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-sm">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading || !uploadFile}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default withAuth(StudentCreate, ['admin', 'superadmin']);