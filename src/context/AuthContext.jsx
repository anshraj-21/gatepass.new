import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const ROLES = {
  STUDENT: 'STUDENT',
  WARDEN: 'WARDEN',
  GUARD: 'GUARD',
  ADMIN: 'ADMIN'
};

export const MOCK_USERS = {
  STUDENT: {
    id: "STU-2024-0391",
    name: "Rahul Sharma",
    email: "rahul.sharma@college.edu",
    role: ROLES.STUDENT,
    avatar: "", // Empty photo - clean default placeholder
    rollNo: "22BCS104",
    branch: "Computer Science Engineering",
    year: "3rd Year",
    hostelBlock: "Block A - Room 304",
    phone: "+91 98765 43210",
    guardianPhone: "+91 98111 22233",
    defaultPass: "student123"
  },
  WARDEN: {
    id: "WARDEN-001",
    name: "Dr. V. K. Gupta",
    email: "vk.gupta@college.edu",
    role: ROLES.WARDEN,
    avatar: "",
    designation: "Chief Hostel Warden",
    assignedHostel: "Boys Hostel Block A & B",
    digitalSignature: "SIG-VKG-9981",
    defaultPass: "warden123"
  },
  GUARD: {
    id: "GUARD-012",
    name: "Officer Bahadur Singh",
    email: "security.gate1@college.edu",
    role: ROLES.GUARD,
    avatar: "",
    gatePost: "Gate 1 - Main Campus Gate",
    shift: "Evening Shift (14:00 - 22:00)",
    defaultPass: "guard123"
  },
  ADMIN: {
    id: "ADMIN-001",
    name: "Campus Security Admin",
    email: "admin.security@college.edu",
    role: ROLES.ADMIN,
    avatar: "",
    defaultPass: "admin123"
  }
};

export function AuthProvider({ children }) {
  // Start with Student role logged in by default, but require auth when switching to Warden/Guard/Admin
  const [currentRole, setCurrentRole] = useState(ROLES.STUDENT);
  const [authenticatedRole, setAuthenticatedRole] = useState(ROLES.STUDENT);

  const user = MOCK_USERS[currentRole];

  /**
   * Validates Login ID and Password for target role
   */
  const loginToRole = (targetRole, loginId, password) => {
    const roleUser = MOCK_USERS[targetRole];
    if (!roleUser) return { success: false, error: "Invalid role selected." };

    const validId = (loginId || '').trim().toLowerCase();
    const validPass = (password || '').trim();

    const expectedId = roleUser.id.toLowerCase();
    const expectedEmail = roleUser.email.toLowerCase();
    const expectedPass = roleUser.defaultPass;

    if ((validId === expectedId || validId === expectedEmail) && validPass === expectedPass) {
      setCurrentRole(targetRole);
      setAuthenticatedRole(targetRole);
      return { success: true };
    }

    return { 
      success: false, 
      error: `Invalid Credentials for ${targetRole}! Hint: ID is ${roleUser.id} and Password is ${roleUser.defaultPass}` 
    };
  };

  const logout = () => {
    setCurrentRole(ROLES.STUDENT);
    setAuthenticatedRole(ROLES.STUDENT);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      currentRole, 
      authenticatedRole,
      loginToRole, 
      logout,
      ROLES,
      MOCK_USERS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
