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
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    rollNo: "22BCS104",
    branch: "Computer Science Engineering",
    year: "3rd Year",
    hostelBlock: "Block A - Room 304",
    phone: "+91 98765 43210",
    guardianPhone: "+91 98111 22233"
  },
  WARDEN: {
    id: "WARDEN-001",
    name: "Dr. V. K. Gupta",
    email: "vk.gupta@college.edu",
    role: ROLES.WARDEN,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
    designation: "Chief Hostel Warden",
    assignedHostel: "Boys Hostel Block A & B",
    digitalSignature: "SIG-VKG-9981"
  },
  GUARD: {
    id: "GUARD-012",
    name: "Officer Bahadur Singh",
    email: "security.gate1@college.edu",
    role: ROLES.GUARD,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    gatePost: "Gate 1 - Main Campus Gate",
    shift: "Evening Shift (14:00 - 22:00)"
  },
  ADMIN: {
    id: "ADMIN-001",
    name: "Campus Security Admin",
    email: "admin.security@college.edu",
    role: ROLES.ADMIN,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
  }
};

export function AuthProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(ROLES.STUDENT);
  const user = MOCK_USERS[currentRole];

  const switchRole = (role) => {
    if (ROLES[role]) {
      setCurrentRole(role);
    }
  };

  return (
    <AuthContext.Provider value={{ user, currentRole, switchRole, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
