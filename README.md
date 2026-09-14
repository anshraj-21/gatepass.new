# 🛡️ Hostel Digital Gate Pass System (Google Cloud Tech Stack)

A comprehensive, real-time, tamper-proof **Digital Gate Pass Management System** designed for college hostels to eliminate gate bypasses, fake screenshots, and unapproved student exits. Built entirely using **Google Cloud Technologies**.

---

## 🎯 The Core Problem & Solution

### Problem
Students bypass hostel gates without showing valid warden passes, share static screenshots of old passes with guards, or sneak out past curfew hours.

### Solution
1. **Dynamic Anti-Screenshot QR Code**: Every approved pass renders a live QR code with a **15-second rotating cryptographic hash token**, animated laser scan bar, and dynamic watermark ("LIVE GATE PASS • GCP SECURED"). Static screenshots scanned at the gate will fail.
2. **Google Gemini 2.5 AI Risk Analysis**: Automatically evaluates student pass reasons, departure times, and destination. Flags high-risk requests (e.g. late night clubbing, curfew violations) with risk confidence ratings for wardens.
3. **Instant Guard Gate Scanner**: Camera scanner interface featuring high-visibility **Green (Authorized)** and **Red (Denied)** visual flash cards + Web Audio sound synthesizer chimes for instant gate decisions.
4. **Real-time Warden Approval & Overdue Tracker**: Single-click pass approvals with warden digital signatures (`SIG-VKG-9981`) and live curfew violation monitoring.

---

## 🛠️ Google Technology Stack

| Layer | Google Technology | Purpose |
|---|---|---|
| **Database** | **Cloud Firestore** | Sub-second real-time sync between student app, warden dashboard, and guard gate terminal. |
| **Authentication** | **Firebase Auth / Google SSO** | Single Sign-On enforcing college email domain restrictions (`@college.edu`). |
| **Artificial Intelligence** | **Google Gemini AI SDK** | Automated pass reason risk analysis, curfew violation scoring, and guard verification aid. |
| **Storage** | **Cloud Storage** | Secure hosting for student profile pictures, warden digital signatures, and audit logs. |
| **Location / Geofencing** | **Google Maps Platform** | Geofence validation ensuring checkout occurs at Main Campus Gate 1. |
| **Hosting & Cloud** | **Firebase Hosting / Cloud Run** | Global serverless deployment on Google Cloud Platform. |

---

## 📱 User Roles & Interactive Capabilities

- **`🎓 Student`**: Submit out-pass / day pass / emergency requests, view live rotating QR pass, track approval status.
- **`👨‍⚖️ Warden`**: Review pending applications, view Gemini AI safety risk flags, approve with digital signature stamp, track curfew violations.
- **`👮 Guard Scanner`**: Camera QR scanner terminal, visual green/red match cards, 1-tap Check-Out / Check-In, exit activity log stream.
- **`📊 Analytics`**: System metrics, GCP stack architecture status, export gate audit log to CSV.

---

## 🚀 Quick Local Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/digital-gate-pass.git
   cd digital-gate-pass
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. *(Optional)* **Configure Real Firebase & Gemini Keys**:
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```
   *(Note: The app comes with a built-in reactive emulated store and heuristic AI fallback so it works 100% out of the box without keys!)*

---

## 📜 License
MIT License - Built with Google Technologies.
