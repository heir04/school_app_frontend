"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, 
  Upload, 
  Save, 
  Loader2,
  AlertCircle,
  ArrowLeft 
} from 'lucide-react';
import { withAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'https://schoolapp-production-e49d.up.railway.app/api';

const FormField = ({ label, type = 'text', value, onChange, options, multiple = false, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    { type === 'radio' ? (
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

// Move ErrorAlert component OUTSIDE as well
const ErrorAlert = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <div className="flex items-start">
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
      <p className="text-red-800 text-sm">{message}</p>
    </div>
  </div>
);

const AdminCreate = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    gender: '',
    dateOfBirth: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthToken = () => localStorage.getItem('auth-token');

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`
  });

  const apiCall = async (endpoint, options = {}) => {
    let headers = { ...getAuthHeaders(), ...options.headers };
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('email', formData.email);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('address', formData.address);
      data.append('gender', formData.gender);
      data.append('dateOfBirth', formData.dateOfBirth);

      await apiCall('/Admin/Register', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: data
      });

      router.push('/get-admins');
    } catch (error) {
      setError(`Failed to create admin: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            Add New Admin
          </h1>
          <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
        </div>

        {error && <ErrorAlert message={error} />}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Details</h2>
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
            <div className="flex justify-end gap-2 mt-6">
              <Link href="/admin?tab=teachers" className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-sm">
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
      </div>
    </div>
  );
};

export default withAuth(AdminCreate, ['superadmin']);