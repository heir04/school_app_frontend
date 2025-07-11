"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../app/contexts/AuthContext";
import { User, LogOut, ChevronDown, Shield, Bell, LayoutDashboard, GraduationCap } from "lucide-react";
import Image from "next/image";

const API_BASE_URL = "https://schoolapp-production-e49d.up.railway.app/api";

const Navbar = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("auth-token");
  };

  const handleUpdatePasswordClick = () => {
    setIsProfileDropdownOpen(false);
    router.push("/user/update-password");
  };

  // Create headers with auth token
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch user details from backend
  const fetchUserDetails = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      let endpoint = "";

      // Determine endpoint based on user role
      switch (user.role?.toLowerCase()) {
        case "admin":
          endpoint = "/Admin/GetProfile"; // Adjust based on your actual endpoint
          break;
        case "superadmin":
          endpoint = "/Admin/GetProfile";
          break;
        case "teacher":
          endpoint = "/Teacher/GetProfile";
          break;
        case "student":
          endpoint = "/Student/GetProfile";
          break;
        default:
          endpoint = "/User/GetDetails";
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data) {
          setUserDetails(data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user details when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserDetails();
    }
  }, [user, isAuthenticated]);

  // Add event listener for orientation change
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.innerWidth <= 768) {
        setIsProfileDropdownOpen(false); // Ensure dropdown is closed on rotation
      }
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    return () =>
      window.removeEventListener("orientationchange", handleOrientationChange);
  }, []);

  // Don't render navbar if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    setIsProfileDropdownOpen(false);
    logout();
  };

  const getUserDisplayName = () => {
    if (userDetails) {
      if (userDetails.firstName && userDetails.lastName) {
        return `${userDetails.firstName} ${userDetails.lastName}`;
      }
      if (userDetails.name) {
        return userDetails.name;
      }
    }
    return user?.email || "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplayName = () => {
    return (
      user?.role?.charAt(0).toUpperCase() +
        user?.role?.slice(1).toLowerCase() || "User"
    );
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <Image
                src="/images/logo.png"
                alt="Fazl-I-Omar Academy Logo"
                width={32}
                height={32}
                className="mr-2 rounded"
              />
              <span className="text-xl font-bold text-gray-900">
                Fazl-I-Omar Academy
              </span>
            </Link>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {getUserInitials()}
                  </div>

                  {/* User info */}
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getRoleDisplayName()}
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User info in dropdown */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                          {getUserInitials()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {getUserDisplayName()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user?.email}
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            {getRoleDisplayName()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        View My Profile
                      </button>

                      {user && user.role && (
                        <>
                          {user.role.toLowerCase() === "teacher" && (
                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                router.push("/teacher");
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 mr-3" />
                              Dashboard
                            </button>
                          )}
                          {user.role.toLowerCase() === "student" && (
                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                router.push("/student");
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <GraduationCap className="w-4 h-4 mr-3" />
                              Portal
                            </button>
                          )}
                          {(user.role.toLowerCase() === "admin" ||
                            user.role.toLowerCase() === "superadmin") && (
                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                router.push("/admin");
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 mr-3" />
                              Dashboard
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={handleUpdatePasswordClick}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        Update Password
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          userDetails={userDetails}
          isLoading={isLoading}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
};

// Profile Modal Component
const ProfileModal = ({ user, userDetails, isLoading, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const ProfileField = ({ label, value, loading = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {loading ? (
        <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
      ) : (
        <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">
          {value || "N/A"}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            My Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h3>

              <ProfileField
                label="First Name"
                value={userDetails?.firstName}
                loading={isLoading}
              />

              <ProfileField
                label="Last Name"
                value={userDetails?.lastName}
                loading={isLoading}
              />

              <ProfileField
                label="Email"
                value={user?.email || userDetails?.email}
              />

              <ProfileField
                label="Role"
                value={
                  user?.role?.charAt(0).toUpperCase() +
                  user?.role?.slice(1).toLowerCase()
                }
              />

              {/* Role-specific fields */}
              {user?.role?.toLowerCase() === "student" && (
                <>
                  <ProfileField
                    label="Student ID"
                    value={userDetails?.studentId}
                    loading={isLoading}
                  />
                  <ProfileField
                    label="Class/Level"
                    value={userDetails?.levelName || userDetails?.className}
                    loading={isLoading}
                  />
                </>
              )}

              {user?.role?.toLowerCase() === "teacher" && (
                <>
                  <ProfileField
                    label="Teacher ID"
                    value={userDetails?.teacherId}
                    loading={isLoading}
                  />
                  <ProfileField
                    label="Department"
                    value={userDetails?.department}
                    loading={isLoading}
                  />
                </>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Additional Information
              </h3>

              <ProfileField
                label="Phone Number"
                value={userDetails?.phoneNumber || userDetails?.phone}
                loading={isLoading}
              />

              <ProfileField
                label="Date of Birth"
                value={formatDate(userDetails?.dateOfBirth)}
                loading={isLoading}
              />

              <ProfileField
                label="Address"
                value={userDetails?.address}
                loading={isLoading}
              />

              <ProfileField
                label="Gender"
                value={userDetails?.gender}
                loading={isLoading}
              />

              <ProfileField
                label="Registration Date"
                value={formatDate(
                  userDetails?.createdOn || userDetails?.registrationDate
                )}
                loading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
