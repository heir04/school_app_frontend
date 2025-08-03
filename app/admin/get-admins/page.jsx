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

const API_BASE_URL = 'https://schoolapp-production-ac99.up.railway.app/api';

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

const Admins = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    gender: '',
    address: '',
    subjectIds: []
  });
  const [admins, setAdmins] = useState([]);
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
      const [adminsRes] = await Promise.all([
        apiCall('/Admin/GetAll'),
      ]);

      if (adminsRes.status && adminsRes.data) setAdmins(adminsRes.data);
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

  const handleDeleteAdmin = async (admin) => {
    if (!confirm(`Are you sure you want to delete ${admin.firstName} ${admin.lastName}?`)) return;
    try {
      setIsLoading(true);
      await apiCall(`/Admin/Delete/${admin.id}`, { method: 'POST' });
      await fetchData();
    } catch (error) {
      setError(`Failed to delete Admin: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setAdminForm({
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      email: admin.email || '',
      phoneNumber: admin.phoneNumber || '',
      dateOfBirth: admin.dateOfBirth || '',
      gender: admin.gender || '',
      address: admin.address || ''
    });
    setShowAdminModal(true);
  };

  const updateAdmin = async (id) => {
    const payload = {
      firstName: adminForm.firstName,
      lastName: adminForm.lastName,
      email: adminForm.email,
      phoneNumber: adminForm.phoneNumber,
      dateOfBirth: adminForm.dateOfBirth,
      gender: adminForm.gender,
      address: adminForm.address
    };

    await apiCall(`/Admin/Update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingAdmin) {
        await updateAdmin(editingAdmin.id);
      } else {
        await createAdmin();
      }
      await fetchData();
      setShowAdminModal(false);
      setEditingAdmin(null);
      setAdminForm({ firstName: '', lastName: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '', address: '', subjectIds: [] });
    } catch (error) {
      setError(`Failed to ${editingAdmin ? 'update' : 'create'} Admin: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdmins = admins.filter(admin => {
    return searchTerm === '' || 
      `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  });

  const AdminColumns = [
    { 
      key: 'name', 
      header: 'Name',
      render: (admin) => `${admin.firstName} ${admin.lastName}`
    },
    { key: 'email', header: 'Email' },
    { key: 'phoneNumber', header: 'Phone No.' },
    { key: 'dateOfBirth', header: 'Date Of Birth'},
    { key: 'gender', header: 'Gender'},
    { 
      key: 'createdOn', 
      header: 'Registered',
      render: (admin) => admin.createdOn ? new Date(admin.createdOn).toLocaleDateString() : 'N/A'
    }
  ];

  const AdminActions = [
    { icon: Edit, label: 'Edit', onClick: handleEditAdmin, className: 'text-green-600 hover:bg-green-100' },
    { icon: Trash2, label: 'Delete', onClick: handleDeleteAdmin, className: 'text-red-600 hover:bg-red-100' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="space-y-4 sm:space-y-6">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Admins Management</h2>
          <Link href="/admin/create-admin">
            <ActionButton 
              icon={Plus} 
              label="Add Admin" 
              disabled={isLoading}
            />
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable data={filteredAdmins} columns={AdminColumns} actions={AdminActions} />
        )}
        <Modal
          show={showAdminModal}
          onClose={() => {
            setShowAdminModal(false);
            setEditingAdmin(null);
            setAdminForm({ firstName: '', lastName: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '', address: ''});
          }}
          title={'Edit Admin'}
          size="md"
        >
          <form onSubmit={handleAdminSubmit}>
            <FormField
              label="First Name"
              value={adminForm.firstName}
              onChange={(e) => setAdminForm({ ...adminForm, firstName: e.target.value })}
              required
            />
            <FormField
              label="Last Name"
              value={adminForm.lastName}
              onChange={(e) => setAdminForm({ ...adminForm, lastName: e.target.value })}
              required
            />
            <FormField
              label="Email"
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              required
            />
            <FormField
              label="Phone Number"
              value={adminForm.phoneNumber}
              onChange={(e) => setAdminForm({ ...adminForm, phoneNumber: e.target.value })}
            />
            <FormField
              label="Date of Birth"
              type="date"
              value={adminForm.dateOfBirth}
              onChange={(e) => setAdminForm({ ...adminForm, dateOfBirth: e.target.value })}
            />
            <FormField
              label="Gender"
              type="select"
              value={adminForm.gender}
              onChange={(e) => setAdminForm({ ...adminForm, gender: e.target.value })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]}
            />
            <FormField
              label="Address"
              value={adminForm.address}
              onChange={(e) => setAdminForm({ ...adminForm, address: e.target.value })}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAdminModal(false);
                  setEditingAdmin(null);
                  setAdminForm({ firstName: '', lastName: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '', address: ''});
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

export default withAuth(Admins, ['superadmin']);