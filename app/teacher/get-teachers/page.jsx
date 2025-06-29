"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Search,
  Download,
  Edit,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  X,
  Save,
  Loader2,
  Plus
} from 'lucide-react';
import { withAuth } from '../../contexts/AuthContext';

const API_BASE_URL = 'https://schoolapp-production-e49d.up.railway.app/api';

// Fixed FormField component - moved outside and fixed multi-select handling
const FormField = ({ label, type = 'text', value, onChange, options, multiple = false, required = false }) => (
  <div className="mb-4 w-full">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'select' ? (
      <select
        value={multiple ? value : (value || '')} // Fixed: proper value handling for multi-select
        onChange={onChange}
        multiple={multiple}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {!multiple && <option value="">Select {label}</option>}
        {options?.map(option => (
          <option 
            key={option.value} 
            value={option.value}
            // Removed the 'selected' attribute - React handles this with 'value'
          >
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value || ''} // Added fallback for undefined values
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    )}
  </div>
);

const ErrorAlert = ({ message, onClose }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 sm:mb-6">
    <div className="flex items-start">
      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 mr-2 sm:mr-3" />
      <div className="flex-1">
        <p className="text-red-800 text-sm sm:text-base">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-red-600 hover:text-red-800"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  </div>
);

const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', disabled = false }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${variants[variant]}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};

const Modal = ({ show, onClose, title, children, size = 'md' }) => {
  if (!show) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const DataTable = ({ data, columns, actions }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {column.header}
              </th>
            ))}
            {actions && <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-3 sm:px-6 py-4 sm:py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(row)}
                          className={`p-2 rounded-lg transition-colors ${action.className}`}
                          title={action.label}
                        >
                          <action.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const Teachers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherForm, setTeacherForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    gender: '',
    address: '',
    subjectIds: []
  });
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const getAuthToken = () => localStorage.getItem('auth-token');

  const getAuthHeaders = (isJson = true) => ({
    ...(isJson && { 'Content-Type': 'application/json' }),
    'Authorization': `Bearer ${getAuthToken()}`
  });

  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...getAuthHeaders(options.isJson), ...options.headers }
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Unauthorized. Please login again.');
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

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [teachersRes, subjectsRes] = await Promise.all([
        apiCall('/Teacher/GetAll'),
        apiCall('/Subject/GetAll')
      ]);

      if (teachersRes.status && teachersRes.data) setTeachers(teachersRes.data);
      if (subjectsRes.status && subjectsRes.data) setSubjects(subjectsRes.data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTeacher = async (teacher) => {
    if (!confirm(`Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}?`)) return;
    try {
      setIsLoading(true);
      await apiCall(`/Teacher/Delete/${teacher.id}`, { method: 'POST' });
      await fetchData();
    } catch (error) {
      setError(`Failed to delete teacher: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setTeacherForm({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      phoneNumber: teacher.phoneNumber || '',
      dateOfBirth: teacher.dateOfBirth || '',
      gender: teacher.gender || '',
      address: teacher.address || '',
      subjectIds: teacher.subjects ? subjects.filter(s => teacher.subjects.includes(s.name)).map(s => s.id) : []
    });
    setShowTeacherModal(true);
  };

  const updateTeacher = async (id) => {
    const payload = {
      firstName: teacherForm.firstName,
      lastName: teacherForm.lastName,
      email: teacherForm.email,
      phoneNumber: teacherForm.phoneNumber,
      dateOfBirth: teacherForm.dateOfBirth,
      gender: teacherForm.gender,
      address: teacherForm.address,
      subjectIds: teacherForm.subjectIds
    };

    await apiCall(`/Teacher/Update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  };

  const handleTeacherSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id);
      } else {
        await createTeacher();
      }
      await fetchData();
      setShowTeacherModal(false);
      setEditingTeacher(null);
      setTeacherForm({ firstName: '', lastName: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '', address: '', subjectIds: [] });
    } catch (error) {
      setError(`Failed to ${editingTeacher ? 'update' : 'create'} teacher: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    return searchTerm === '' || 
      `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subjects?.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const teacherColumns = [
    { 
      key: 'name', 
      header: 'Name',
      render: (teacher) => `${teacher.firstName} ${teacher.lastName}`
    },
    { key: 'email', header: 'Email' },
    { 
      key: 'subjects', 
      header: 'Subjects',
      render: (teacher) => teacher.subjects ? teacher.subjects.join(', ') : 'N/A'
    },
    { key: 'phoneNumber', header: 'Phone No.' },
    { key: 'dateOfBirth', header: 'Date Of Birth'},
    { key: 'gender', header: 'Gender'},
    { 
      key: 'createdOn', 
      header: 'Registered',
      render: (teacher) => teacher.createdOn ? new Date(teacher.createdOn).toLocaleDateString() : 'N/A'
    }
  ];

  const teacherActions = [
    { icon: Edit, label: 'Edit', onClick: handleEditTeacher, className: 'text-green-600 hover:bg-green-100' },
    { icon: Trash2, label: 'Delete', onClick: handleDeleteTeacher, className: 'text-red-600 hover:bg-red-100' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="space-y-4 sm:space-y-6">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Teachers Management</h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Link href="/teacher/create-teacher">
              <ActionButton 
                icon={Plus} 
                label="Add Teacher" 
                disabled={isLoading}
              />
            </Link>
            <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable data={filteredTeachers} columns={teacherColumns} actions={teacherActions} />
        )}
        <Modal
          show={showTeacherModal}
          onClose={() => {
            setShowTeacherModal(false);
            setEditingTeacher(null);
            setTeacherForm({ firstName: '', lastName: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '', address: '', subjectIds: [] });
          }}
          title={'Edit Teacher'}
          size="md"
        >
          <form onSubmit={handleTeacherSubmit}>
            <FormField
              label="First Name"
              value={teacherForm.firstName}
              onChange={(e) => setTeacherForm({ ...teacherForm, firstName: e.target.value })}
              required
            />
            <FormField
              label="Last Name"
              value={teacherForm.lastName}
              onChange={(e) => setTeacherForm({ ...teacherForm, lastName: e.target.value })}
              required
            />
            <FormField
              label="Email"
              type="email"
              value={teacherForm.email}
              onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
              required
            />
            <FormField
              label="Phone Number"
              value={teacherForm.phoneNumber}
              onChange={(e) => setTeacherForm({ ...teacherForm, phoneNumber: e.target.value })}
            />
            <FormField
              label="Date of Birth"
              type="date"
              value={teacherForm.dateOfBirth}
              onChange={(e) => setTeacherForm({ ...teacherForm, dateOfBirth: e.target.value })}
            />
            <FormField
              label="Gender"
              type="select"
              value={teacherForm.gender}
              onChange={(e) => setTeacherForm({ ...teacherForm, gender: e.target.value })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]}
            />
            <FormField
              label="Address"
              value={teacherForm.address}
              onChange={(e) => setTeacherForm({ ...teacherForm, address: e.target.value })}
            />
            <FormField
              label="Subjects"
              type="select"
              value={teacherForm.subjectIds}
              onChange={(e) => {
                const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                setTeacherForm({ ...teacherForm, subjectIds: selectedOptions });
              }}
              options={subjects.map(subject => ({ value: subject.id, label: subject.name }))}
              multiple
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowTeacherModal(false);
                  setEditingTeacher(null);
                  setTeacherForm({ firstName: '', lastName: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '', address: '', subjectIds: [] });
                }}
                className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 rounded-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {'Update' }
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default withAuth(Teachers, ['admin', 'superadmin']);