# Career Connect

**Career Connect** is a cutting-edge MERN stack platform designed to seamlessly bridge the gap between job seekers and recruiters. With an elegant UI powered by TailwindCSS and fluid Framer Motion animations, it provides a feature-rich portal including applicant tracking, intelligent career AI guidance, and comprehensive interactive roadmaps.

---

## 🚀 Key Features

### For Job Seekers
*   **Intelligent Job Discovery**: Browse, save, and apply for jobs tailored to specific career trajectories.
*   **Career AI Chatbot**: Get guided assistance on interview preparation, resume enhancement, and career planning.
*   **Interactive 3D Roadmaps**: Visualize complex career paths step-by-step through generated 3D visual timelines.
*   **Secure Authentication**: Flexible login options via standard Email/OTP or seamless Google Identity OAuth.

### For Recruiters
*   **Advanced Hiring Pipeline**: Manage candidates through a fully functional drag-and-drop KanBan board (Applied → Screening → Interview → Hired / Rejected).
*   **Automated Communication**: Automatically trigger formal acceptance, interview, or rejection emails to applicants.
*   **Mock Payment Gateway**: Recharge hiring credits through a responsive mock UPI, Card, or Net Banking checkout flow.
*   **Candidate Analytics**: Monitor job post views, applications, and general metrics.

---

## 🛠 Tech Stack

**Frontend:**
*   **React 18** (Vite)
*   **TailwindCSS** (Utility-first styling, glassmorphism, responsive design)
*   **Framer Motion** (Micro-animations, page transitions)
*   **React Hook Form** (Form state and validation)
*   **Redux Toolkit** (Global state management)

**Backend:**
*   **Node.js / Express** (RESTful API architecture)
*   **MongoDB & Mongoose** (Database modeling)
*   **JSON Web Tokens (JWT)** (Secure robust auth strategies)
*   **Nodemailer** (Automated pipeline notifications and OTP verifications)

**Integrations:**
*   Google Identity Services SDK (Instant Sign-in)
*   Helmet / CORS (Production security enhancements)

---

## ⚙️ Environment Configuration

To run this project locally, create a `.env` file in both the `/backend` and `/frontend` directories.

### Backend (`/backend/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Nodemailer setup
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (`/frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

---

## 💻 Quick Start

Follow these steps to set up the robust development environment locally.

### 1. Clone the repository
```bash
git clone https://github.com/TirthBarvaliya/Career_Connect.git
cd Career_Connect
```

### 2. Start the Backend API
```bash
cd backend
npm install
npm run dev
```
*The backend should default to running on `http://localhost:5000`.*

### 3. Start the Frontend Application
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend should now be running on `http://localhost:5173`.*

---

⚠️ License Notice

This project is protected under a custom "All Rights Reserved" license.

You are allowed to view the code, but copying, modifying, or using this project is strictly prohibited without permission.
---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
