"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  School,
  Settings,
  Edit,
  Trash2,
  Search,
  Calendar,
  BarChart3,
  Eye,
  AlertTriangle,
  X,
  Save,
  Loader2,
  Plus,
  FileText,
  Clock,
  Menu,
} from "lucide-react";
import { withAuth, useAuth } from "../contexts/AuthContext";

const API_BASE_URL = "https://schoolapp-production-e49d.up.railway.app/api";

const FormField = ({
  label,
  type = "text",
  value,
  onChange,
  options,
  multiple = false,
  required = false,
}) => (
  <div className="mb-4 w-full">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "select" ? (
      <select
        value={multiple ? undefined : value}
        onChange={onChange}
        multiple={multiple}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {!multiple && <option value="">Select {label}</option>}
        {options?.map((option) => (
          <option
            key={option.value}
            value={option.value}
            selected={multiple && value.includes(option.value)}
          >
            {option.label}
          </option>
        ))}
      </select>
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

const Modal = ({ show, onClose, title, children, size = "md" }) => {
  if (!show) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

const DataTable = ({ data, columns, actions }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    {/* Mobile Card View */}
    <div className="block sm:hidden">
      {data.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No data available</div>
      ) : (
        <div className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <div key={rowIndex} className="p-4 hover:bg-gray-50">
              <div className="space-y-2">
                {columns.map((column, colIndex) => (
                  <div
                    key={colIndex}
                    className="flex justify-between items-start"
                  >
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[80px]">
                      {column.header}:
                    </span>
                    <span className="text-sm text-gray-900 text-right flex-1 ml-2">
                      {column.render ? column.render(row) : row[column.key]}
                    </span>
                  </div>
                ))}
                {actions && (
                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    {actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => action.onClick(row)}
                        className={`p-2 rounded-lg transition-colors ${action.className} mx-1`}
                        title={action.label}
                      >
                        <action.icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Desktop Table View */}
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {column.header}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-6 py-8 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 text-sm text-gray-900"
                  >
                    <div
                      className="max-w-[250px] truncate"
                      title={
                        column.render ? column.render(row) : row[column.key]
                      }
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </div>
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showTermModal, setShowTermModal] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editingSession, setEditingSession] = useState(null);

  // Form states
  const [levelForm, setLevelForm] = useState({
    levelName: "",
    category: "",
  });

  const [subjectForm, setSubjectForm] = useState({
    name: "",
    category: "",
  });

  const [sessionForm, setSessionForm] = useState({
    sessionName: "",
    startDate: "",
    endDate: "",
  });

  const [termForm, setTermForm] = useState({
    termId: "",
  });

  // State for real data
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalLevels: 0,
  });

  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [currentSessionTerm, setCurrentSessionTerm] = useState(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("auth-token");
  };

  // Create headers with auth token
  const getAuthHeaders = (isJson = true) => {
    const token = getAuthToken();
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Only set Content-Type for JSON, not for FormData
    if (isJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    let headers = { ...getAuthHeaders(options.isJson), ...options.headers };
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        let errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [
        subjectsRes,
        levelsRes,
        sessionsRes,
        termsRes,
        currentSessionTermRes,
        studentsRes,
        teachersRes,
      ] = await Promise.all([
        apiCall("/Subject/GetAll"),
        apiCall("/Level/GetAll"),
        apiCall("/Session/GetAll"),
        apiCall("/Session/GetAllSessionTerm"),
        apiCall("/Session/GetCurrentSessionAndTermName"),
        apiCall("/Student/Count"),
        apiCall("/Teacher/Count"),
      ]);

      if (subjectsRes.status && subjectsRes.data) {
        setSubjects(subjectsRes.data);
        setStats((prev) => ({
          ...prev,
          totalSubjects: subjectsRes.data.length || 0,
        }));
      }
      if (levelsRes.status && levelsRes.data) {
        setLevels(levelsRes.data);
        setStats((prev) => ({
          ...prev,
          totalLevels: levelsRes.data.length || 0,
        }));
      }
      if (sessionsRes.status && sessionsRes.data) setSessions(sessionsRes.data);
      if (termsRes.status && termsRes.data) setTerms(termsRes.data);
      if (currentSessionTermRes.status && currentSessionTermRes.data)
        setCurrentSessionTerm(currentSessionTermRes.data);
      if (studentsRes.status && studentsRes.data)
        setStats((prev) => ({
          ...prev,
          totalStudents: studentsRes.data.count,
        }));
      if (teachersRes.status && teachersRes.data)
        setStats((prev) => ({
          ...prev,
          totalTeachers: teachersRes.data.count,
        }));
    } catch (error) {
      setError(error.message);
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSubject = async (subject) => {
    if (!confirm(`Are you sure you want to delete ${subject.name}?`)) return;

    try {
      setIsLoading(true);
      await apiCall(`/Subject/Delete/${subject.id}`, { method: "POST" });
      await fetchAllData();
    } catch (error) {
      setError(`Failed to delete subject: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLevel = async (level) => {
    if (!confirm(`Are you sure you want to delete ${level.levelName}?`)) return;

    try {
      setIsLoading(true);
      await apiCall(`/Level/Delete/${level.id}`, { method: "POST" });
      await fetchAllData();
    } catch (error) {
      setError(`Failed to delete level: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (session) => {
    if (!confirm(`Are you sure you want to delete ${session.sessionName}?`))
      return;

    try {
      setIsLoading(true);
      await apiCall(`/Session/Delete/${session.id}`, { method: "POST" });
      await fetchAllData();
    } catch (error) {
      setError(`Failed to delete session: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLevel = (level) => {
    setEditingLevel(level);
    setLevelForm({
      levelName: level.levelName,
      category: level.category || "",
    });
    setShowLevelModal(true);
  };

  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectForm({
      name: subject.name,
      category: subject.category || "",
    });
    setShowSubjectModal(true);
  };

  const handleEditSession = (session) => {
    setEditingSession(session);
    setSessionForm({
      sessionName: session.sessionName,
      startDate: session.startDate
        ? new Date(session.startDate).toISOString().split("T")[0]
        : "",
      endDate: session.endDate
        ? new Date(session.endDate).toISOString().split("T")[0]
        : "",
    });
    setShowSessionModal(true);
  };

  const createLevel = async () => {
    const formData = new FormData();
    formData.append("levelName", levelForm.levelName);
    formData.append("category", levelForm.category);

    await apiCall("/Level/Create", {
      method: "POST",
      headers: getAuthHeaders(false),
      body: formData,
      isJson: false,
    });
  };

  const updateLevel = async (id) => {
    const payload = {
      levelName: levelForm.levelName,
      category: levelForm.category,
    };

    await apiCall(`/Level/Update/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  };

  const handleLevelSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingLevel) {
        await updateLevel(editingLevel.id);
      } else {
        await createLevel();
      }

      await fetchAllData();
      setShowLevelModal(false);
      setEditingLevel(null);
      setLevelForm({ levelName: "", category: "" });
    } catch (error) {
      setError(
        `Failed to ${editingLevel ? "update" : "create"} level: ${error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createSubject = async () => {
    const formData = new FormData();
    formData.append("name", subjectForm.name);
    formData.append("category", subjectForm.category);

    await apiCall("/Subject/Create", {
      method: "POST",
      headers: getAuthHeaders(false),
      body: formData,
      isJson: false,
    });
  };

  const updateSubject = async (id) => {
    const payload = {
      name: subjectForm.name,
      category: subjectForm.category,
    };

    await apiCall(`/Subject/Update/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id);
      } else {
        await createSubject();
      }

      await fetchAllData();
      setShowSubjectModal(false);
      setEditingSubject(null);
      setSubjectForm({ name: "", category: "" });
    } catch (error) {
      setError(
        `Failed to ${editingSubject ? "update" : "create"} subject: ${error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async () => {
    const formData = new FormData();
    formData.append("sessionName", sessionForm.sessionName);
    formData.append("startDate", sessionForm.startDate);
    formData.append("endDate", sessionForm.endDate);

    await apiCall("/Session/Register", {
      method: "POST",
      headers: getAuthHeaders(false),
      body: formData,
      isJson: false,
    });
  };

  const updateSession = async (id) => {
    const payload = {
      sessionName: sessionForm.sessionName,
      startDate: sessionForm.startDate,
      endDate: sessionForm.endDate,
    };

    await apiCall(`/Session/Update/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingSession) {
        await updateSession(editingSession.id);
      } else {
        await createSession();
      }

      await fetchAllData();
      setShowSessionModal(false);
      setEditingSession(null);
      setSessionForm({ sessionName: "", startDate: "", endDate: "" });
    } catch (error) {
      setError(
        `Failed to ${editingSession ? "update" : "create"} session: ${error.message
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!confirm("Are you sure you want to end the current session?")) return;

    try {
      setIsLoading(true);
      await apiCall("/Session/EndSession", { method: "PUT" });
      await fetchAllData();
    } catch (error) {
      setError(`Failed to end session: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTerm = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiCall(`/Session/UpdateCurrentTerm/${termForm.termId}`, {
        method: "PUT",
      });
      await fetchAllData();
      setShowTermModal(false);
      setTermForm({ termId: "" });
    } catch (error) {
      setError(`Failed to update term: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAllData();
  }, []);

  // Components
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div
      className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {value}
          </p>
        </div>
        <div
          className="p-2 sm:p-3 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 w-full ${isActive
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-600 hover:bg-gray-100"
        }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="font-medium text-sm sm:text-base">{label}</span>
    </button>
  );

  const ActionButton = ({
    onClick,
    icon: Icon,
    label,
    variant = "primary",
    disabled = false,
  }) => {
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white",
      success: "bg-green-600 hover:bg-green-700 text-white",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      secondary: "bg-gray-600 hover:bg-gray-700 text-white",
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

  const DataTable = ({ data, columns, actions }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        {data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No data available</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <div key={rowIndex} className="p-4 hover:bg-gray-50">
                <div className="space-y-2">
                  {columns.map((column, colIndex) => (
                    <div
                      key={colIndex}
                      className="flex justify-between items-start"
                    >
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide min-w-[80px]">
                        {column.header}:
                      </span>
                      <span className="text-sm text-gray-900 text-right flex-1 ml-2">
                        {column.render ? column.render(row) : row[column.key]}
                      </span>
                    </div>
                  ))}
                  {actions && (
                    <div className="flex justify-end pt-2 border-t border-gray-100">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(row)}
                          className={`p-2 rounded-lg transition-colors ${action.className} mx-1`}
                          title={action.label}
                          disabled={isLoading}
                        >
                          <action.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm text-gray-900"
                    >
                      <div
                        className="max-w-[250px] truncate"
                        title={
                          column.render ? column.render(row) : row[column.key]
                        }
                      >
                        {column.render ? column.render(row) : row[column.key]}
                      </div>
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            className={`p-2 rounded-lg transition-colors ${action.className}`}
                            title={action.label}
                            disabled={isLoading}
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

  const ErrorAlert = ({ message, onClose }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 sm:mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 mr-2 sm:mr-3" />
        <div className="flex-1">
          <p className="text-red-800 text-sm sm:text-base">{message}</p>
        </div>
        <button onClick={onClose} className="text-red-600 hover:text-red-800">
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6 sm:space-y-8">
      {error && <ErrorAlert message={error} onClose={() => setError("")} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="#3B82F6"
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          icon={GraduationCap}
          color="#10B981"
        />
        <StatCard
          title="Subjects"
          value={stats.totalSubjects}
          icon={BookOpen}
          color="#F59E0B"
        />
        <StatCard
          title="Grade Levels"
          value={stats.totalLevels}
          icon={School}
          color="#8B5CF6"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            Academic Session
          </h3>
          <div className="space-y-3">
            {currentSessionTerm && (
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">
                    Current Session: {currentSessionTerm.sessionName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Term: {currentSessionTerm.termName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/student/get-students">
              <ActionButton
                icon={Users}
                label="Manage Students"
                disabled={isLoading}
              />
            </Link>
            {user?.role?.toLowerCase() === "superadmin" && (
              <Link href="/admin/get-admins">
                <ActionButton
                  icon={Users}
                  label="Manage Admins"
                  disabled={isLoading}
                />
              </Link>
            )}
            <Link href="/teacher/get-teachers">
              <ActionButton
                icon={GraduationCap}
                label="Manage Teachers"
                variant="success"
                disabled={isLoading}
              />
            </Link>
            <Link href="/result">
              <ActionButton
                icon={FileText}
                label="Result Dashboard"
                variant="success"
                disabled={isLoading}
              />
            </Link>
            <ActionButton
              icon={Plus}
              label="Add Level"
              onClick={() => setShowLevelModal(true)}
              variant="secondary"
              disabled={isLoading}
            />
            <ActionButton
              icon={Plus}
              label="Add Subject"
              onClick={() => setShowSubjectModal(true)}
              variant="secondary"
              disabled={isLoading}
            />
            <ActionButton
              icon={Plus}
              label="Add Session"
              onClick={() => setShowSessionModal(true)}
              variant="secondary"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubjects = () => {
    const subjectColumns = [
      { key: "name", header: "Subject Name" },
      { key: "category", header: "Category" },
      {
        key: "dateCreated",
        header: "Created Date",
        render: (row) =>
          row.dateCreated
            ? new Date(row.dateCreated).toLocaleDateString()
            : "N/A",
      },
    ];

    const subjectActions = [
      {
        icon: Edit,
        label: "Edit",
        onClick: handleEditSubject,
        className: "text-green-600 hover:bg-green-100",
      },
      {
        icon: Trash2,
        label: "Delete",
        onClick: handleDeleteSubject,
        className: "text-red-600 hover:bg-red-100",
      },
    ];

    return (
      <div className="space-y-4 sm:space-y-6">
        {error && <ErrorAlert message={error} onClose={() => setError("")} />}

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Subjects Management
          </h2>
          <ActionButton
            icon={Plus}
            label="Add New Subject"
            onClick={() => setShowSubjectModal(true)}
            disabled={isLoading}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            data={subjects}
            columns={subjectColumns}
            actions={subjectActions}
          />
        )}
      </div>
    );
  };

  const renderLevels = () => {
    const levelColumns = [
      { key: "levelName", header: "Level Name" },
      { key: "category", header: "Category" },
      {
        key: "dateCreated",
        header: "Created Date",
        render: (row) =>
          row.dateCreated
            ? new Date(row.dateCreated).toLocaleDateString()
            : "N/A",
      },
    ];

    const levelActions = [
      {
        icon: Edit,
        label: "Edit",
        onClick: handleEditLevel,
        className: "text-green-600 hover:bg-green-100",
      },
      {
        icon: Trash2,
        label: "Delete",
        onClick: handleDeleteLevel,
        className: "text-red-600 hover:bg-red-100",
      },
    ];

    return (
      <div className="space-y-4 sm:space-y-6">
        {error && <ErrorAlert message={error} onClose={() => setError("")} />}

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Grade Levels Management
          </h2>
          <ActionButton
            icon={Plus}
            label="Add New Level"
            onClick={() => setShowLevelModal(true)}
            disabled={isLoading}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            data={levels}
            columns={levelColumns}
            actions={levelActions}
          />
        )}
      </div>
    );
  };

  const renderSessions = () => {
    const sessionColumns = [
      { key: "sessionName", header: "Session Name" },
      {
        key: "startDate",
        header: "Start Date",
        render: (row) =>
          row.startDate ? new Date(row.startDate).toLocaleDateString() : "N/A",
      },
      {
        key: "endDate",
        header: "End Date",
        render: (row) =>
          row.endDate ? new Date(row.endDate).toLocaleDateString() : "N/A",
      },
      {
        key: "currentSession",
        header: "Status",
        render: (row) => (row.currentSession ? "Active" : "Inactive"),
      },
    ];

    const sessionActions = [
      {
        icon: Edit,
        label: "Edit",
        onClick: handleEditSession,
        className: "text-green-600 hover:bg-green-100",
      },
      {
        icon: Trash2,
        label: "Delete",
        onClick: handleDeleteSession,
        className: "text-red-600 hover:bg-red-100",
      },
    ];

    return (
      <div className="space-y-4 sm:space-y-6">
        {error && <ErrorAlert message={error} onClose={() => setError("")} />}

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Sessions Management
          </h2>
          <ActionButton
            icon={Plus}
            label="Add New Session"
            onClick={() => setShowSessionModal(true)}
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <ActionButton
            icon={Calendar}
            label="End Current Session"
            onClick={handleEndSession}
            variant="danger"
            disabled={isLoading || !sessions.some((s) => s.currentSession)}
          />
          <ActionButton
            icon={Clock}
            label="Update Term"
            onClick={() => setShowTermModal(true)}
            variant="secondary"
            disabled={isLoading || !terms.length}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <DataTable
            data={sessions.filter(
              (s) =>
                searchTerm === "" ||
                s.sessionName.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={sessionColumns}
            actions={sessionActions}
          />
        )}
      </div>
    );
  };

  const renderLevelModal = () => (
    <Modal
      show={showLevelModal}
      onClose={() => {
        setShowLevelModal(false);
        setEditingLevel(null);
        setLevelForm({ levelName: "", description: "" });
      }}
      title={editingLevel ? "Edit Level" : "Add New Level"}
      size="sm"
    >
      <form onSubmit={handleLevelSubmit}>
        <FormField
          label="Level Name"
          value={levelForm.levelName}
          onChange={(e) =>
            setLevelForm({ ...levelForm, levelName: e.target.value })
          }
          required
        />
        <FormField
          label="Category"
          type="select"
          value={levelForm.category}
          onChange={(e) =>
            setLevelForm({ ...levelForm, category: e.target.value })
          }
          options={[
            { value: "Junior", label: "Junior" },
            { value: "Senior", label: "Senior" },
          ]}
          required
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowLevelModal(false);
              setEditingLevel(null);
              setLevelForm({ levelName: "", category: "" });
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
                {editingLevel ? "Update" : "Save"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );

  const renderSubjectModal = () => (
    <Modal
      show={showSubjectModal}
      onClose={() => {
        setShowSubjectModal(false);
        setEditingSubject(null);
        setSubjectForm({ name: "", description: "" });
      }}
      title={editingSubject ? "Edit Subject" : "Add New Subject"}
      size="sm"
    >
      <form onSubmit={handleSubjectSubmit}>
        <FormField
          label="Subject Name"
          value={subjectForm.name}
          onChange={(e) =>
            setSubjectForm({ ...subjectForm, name: e.target.value })
          }
          required
        />
        <FormField
          label="Category"
          type="select"
          value={subjectForm.category}
          onChange={(e) =>
            setSubjectForm({ ...subjectForm, category: e.target.value })
          }
          options={[
            { value: "Junior", label: "Junior" },
            { value: "Senior", label: "Senior" },
          ]}
          required
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowSubjectModal(false);
              setEditingSubject(null);
              setSubjectForm({ name: "", category: "" });
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
                {editingSubject ? "Update" : "Save"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );

  const renderSessionModal = () => (
    <Modal
      show={showSessionModal}
      onClose={() => {
        setShowSessionModal(false);
        setEditingSession(null);
        setSessionForm({ sessionName: "", startDate: "", endDate: "" });
      }}
      title={editingSession ? "Edit Session" : "Add New Session"}
      size="sm"
    >
      <form onSubmit={handleSessionSubmit}>
        <FormField
          label="Session Name"
          value={sessionForm.sessionName}
          onChange={(e) =>
            setSessionForm({ ...sessionForm, sessionName: e.target.value })
          }
          required
        />
        <FormField
          label="Start Date"
          type="date"
          value={sessionForm.startDate}
          onChange={(e) =>
            setSessionForm({ ...sessionForm, startDate: e.target.value })
          }
          required
        />
        <FormField
          label="End Date"
          type="date"
          value={sessionForm.endDate}
          onChange={(e) =>
            setSessionForm({ ...sessionForm, endDate: e.target.value })
          }
          required
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowSessionModal(false);
              setEditingSession(null);
              setSessionForm({ sessionName: "", startDate: "", endDate: "" });
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
                {editingSession ? "Update" : "Save"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );

  const renderTermModal = () => (
    <Modal
      show={showTermModal}
      onClose={() => {
        setShowTermModal(false);
        setTermForm({ termId: "" });
      }}
      title="Update Current Term"
      size="sm"
    >
      <form onSubmit={handleUpdateTerm}>
        <FormField
          label="Term"
          type="select"
          value={termForm.termId}
          onChange={(e) => setTermForm({ ...termForm, termId: e.target.value })}
          options={terms.map((term) => ({ value: term.id, label: term.name }))}
          required
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setShowTermModal(false);
              setTermForm({ termId: "" });
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
                Update
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "subjects":
        return renderSubjects();
      case "levels":
        return renderLevels();
      case "sessions":
        return renderSessions();
      default:
        return renderOverview();
    }
  };

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
        <div
          className={`
          fixed lg:static inset-y-0 left-0 z-40 lg:z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
            }
        `}
        >
          <div className="p-4 lg:p-6 border-b lg:border-b-0">
            <div className="flex items-center justify-between">
              <h1 className="text-lg lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <School className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
                <span className="hidden sm:block">School Admin</span>
              </h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <nav className="px-4 pb-4">
            <div className="space-y-2">
              <TabButton
                id="overview"
                label="Overview"
                icon={BarChart3}
                isActive={activeTab === "overview"}
                onClick={(tab) => {
                  setActiveTab(tab);
                  setIsSidebarOpen(false);
                }}
              />
              <TabButton
                id="subjects"
                label="Subjects"
                icon={BookOpen}
                isActive={activeTab === "subjects"}
                onClick={(tab) => {
                  setActiveTab(tab);
                  setIsSidebarOpen(false);
                }}
              />
              <TabButton
                id="levels"
                label="Grade Levels"
                icon={School}
                isActive={activeTab === "levels"}
                onClick={(tab) => {
                  setActiveTab(tab);
                  setIsSidebarOpen(false);
                }}
              />
              <TabButton
                id="sessions"
                label="Sessions"
                icon={Clock}
                isActive={activeTab === "sessions"}
                onClick={(tab) => {
                  setActiveTab(tab);
                  setIsSidebarOpen(false);
                }}
              />
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
              <h1 className="text-lg font-semibold text-gray-900">
                School Admin
              </h1>
              <div className="w-10" /> {/* Spacer for centering */}
            </div>
          </div>

          <div className="p-4 lg:p-8">
            {renderContent()}
            {renderLevelModal()}
            {renderSubjectModal()}
            {renderSessionModal()}
            {renderTermModal()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(AdminDashboard, ["superadmin", "admin"]);
