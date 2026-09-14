import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Optional Live Firebase credentials (can be supplied via .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyGoogleCloudPlatform_GatePass",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hostel-gatepass-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hostel-gatepass-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hostel-gatepass-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo123456"
};

let app, db, auth, googleProvider;
let isLiveFirebase = false;

try {
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    isLiveFirebase = true;
  }
} catch (err) {
  console.warn("Using Reactive Local Store Mode (Mock Firestore Mode):", err);
}

// -------------------------------------------------------------
// REACTIVE LOCAL STORE (Simulates Firestore Real-Time Subscriptions)
// -------------------------------------------------------------

const INITIAL_PASSES = [
  {
    id: "PASS-9082",
    studentId: "STU-2024-0391",
    studentName: "Rahul Sharma",
    rollNo: "22BCS104",
    branch: "Computer Science Engineering",
    year: "3rd Year",
    hostelBlock: "Block A - Room 304",
    studentPhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    phone: "+91 98765 43210",
    guardianPhone: "+91 98111 22233",
    passType: "Day Outing",
    destination: "Phoenix Market City Mall",
    departureTime: "2026-09-14T17:30:00",
    expectedReturnTime: "2026-09-14T20:30:00",
    reason: "Purchasing essential academic textbooks & project electronics components.",
    status: "APPROVED", // PENDING, APPROVED, REJECTED, CHECKED_OUT, CHECKED_IN, OVERDUE
    wardenApproval: {
      wardenName: "Dr. V. K. Gupta",
      approvedAt: "2026-09-14T16:15:00",
      remarks: "Approved. Please return strict before 8:30 PM curfew.",
      digitalSignature: "SIG-VKG-9981"
    },
    aiRiskAnalysis: {
      score: "LOW",
      riskReason: "Standard day outing during non-curfew hours. Clean previous gate record.",
      confidence: 94
    },
    gateEvents: [],
    createdAt: "2026-09-14T15:00:00"
  },
  {
    id: "PASS-9083",
    studentId: "STU-2024-0512",
    studentName: "Ananya Roy",
    rollNo: "23ECE044",
    branch: "Electronics & Comm",
    year: "2nd Year",
    hostelBlock: "Girls Hostel B - Room 108",
    studentPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    phone: "+91 98234 56789",
    guardianPhone: "+91 98777 88899",
    passType: "Night Out",
    destination: "Home - Vasant Kunj, New Delhi",
    departureTime: "2026-09-14T18:00:00",
    expectedReturnTime: "2026-09-16T09:00:00",
    reason: "Family emergency visit for grandfather medical checkup.",
    status: "PENDING",
    wardenApproval: null,
    aiRiskAnalysis: {
      score: "LOW",
      riskReason: "Night out request to registered home address. Guardian phone auto-verified.",
      confidence: 91
    },
    gateEvents: [],
    createdAt: "2026-09-14T16:30:00"
  },
  {
    id: "PASS-9084",
    studentId: "STU-2024-0199",
    studentName: "Vikram Malhotra",
    rollNo: "21ME102",
    branch: "Mechanical Engg",
    year: "4th Year",
    hostelBlock: "Block C - Room 412",
    studentPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    phone: "+91 97112 33445",
    guardianPhone: "+91 98222 33344",
    passType: "Day Outing",
    destination: "Downtown Club & Lounge",
    departureTime: "2026-09-14T21:00:00",
    expectedReturnTime: "2026-09-15T02:00:00",
    reason: "Late night birthday party with off-campus friends.",
    status: "PENDING",
    wardenApproval: null,
    aiRiskAnalysis: {
      score: "HIGH",
      riskReason: "⚠️ HIGH RISK: Requested departure past standard 8:30 PM curfew. Destination flagged for non-academic late hours. Student has 2 past late return strikes.",
      confidence: 98
    },
    gateEvents: [],
    createdAt: "2026-09-14T16:45:00"
  },
  {
    id: "PASS-9080",
    studentId: "STU-2024-0888",
    studentName: "Priya Patel",
    rollNo: "22CS088",
    branch: "Computer Science",
    year: "3rd Year",
    hostelBlock: "Girls Hostel A - Room 204",
    studentPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    phone: "+91 99887 76655",
    guardianPhone: "+91 98999 11122",
    passType: "Day Outing",
    destination: "City Central Library",
    departureTime: "2026-09-14T14:00:00",
    expectedReturnTime: "2026-09-14T16:30:00",
    reason: "Group study session and reference books collection.",
    status: "OVERDUE",
    wardenApproval: {
      wardenName: "Dr. V. K. Gupta",
      approvedAt: "2026-09-14T13:30:00",
      remarks: "Approved.",
      digitalSignature: "SIG-VKG-8821"
    },
    aiRiskAnalysis: {
      score: "LOW",
      riskReason: "Library study pass.",
      confidence: 95
    },
    gateEvents: [
      {
        type: "CHECK_OUT",
        timestamp: "2026-09-14T14:10:00",
        guardName: "Officer Bahadur Singh",
        gate: "Gate 1 - Main Entrance",
        notes: "Gate pass scanned. Verified student photo."
      }
    ],
    createdAt: "2026-09-14T13:00:00"
  }
];

class ReactiveGatePassStore {
  constructor() {
    const saved = localStorage.getItem('gcp_gatepass_data_v2');
    if (saved) {
      try {
        this.passes = JSON.parse(saved);
      } catch (e) {
        this.passes = INITIAL_PASSES;
      }
    } else {
      this.passes = INITIAL_PASSES;
    }
    this.listeners = new Set();
  }

  save() {
    localStorage.setItem('gcp_gatepass_data_v2', JSON.stringify(this.passes));
    this.notify();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.passes);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.passes));
  }

  getPasses() {
    return this.passes;
  }

  async createPass(passData) {
    const newPass = {
      id: `PASS-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      gateEvents: [],
      wardenApproval: null,
      ...passData
    };
    this.passes = [newPass, ...this.passes];
    this.save();
    return newPass;
  }

  async updatePassStatus(passId, status, wardenDetails = null) {
    this.passes = this.passes.map(p => {
      if (p.id === passId) {
        return {
          ...p,
          status,
          ...(wardenDetails ? { wardenApproval: wardenDetails } : {})
        };
      }
      return p;
    });
    this.save();
  }

  async recordGateCheck(passId, checkType, guardDetails = {}) {
    const timestamp = new Date().toISOString();
    this.passes = this.passes.map(p => {
      if (p.id === passId) {
        const nextStatus = checkType === "CHECK_OUT" ? "CHECKED_OUT" : "CHECKED_IN";
        const newEvent = {
          type: checkType,
          timestamp,
          guardName: guardDetails.guardName || "Officer Bahadur Singh",
          gate: guardDetails.gate || "Gate 1 Main Gate",
          notes: guardDetails.notes || `${checkType} recorded at main gate.`
        };
        return {
          ...p,
          status: nextStatus,
          gateEvents: [...(p.gateEvents || []), newEvent]
        };
      }
      return p;
    });
    this.save();
  }

  async resetDemoData() {
    this.passes = INITIAL_PASSES;
    this.save();
  }
}

export const reactiveStore = new ReactiveGatePassStore();
export { isLiveFirebase, db, auth, googleProvider };
