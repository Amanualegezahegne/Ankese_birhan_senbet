import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import News from './pages/News';
import Profile from './Pages/Profile';
import GradeReport from './Pages/GradeReport';
import './App.css';

// Protected Route Component for Students
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('studentToken');
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

import Sidebar from './components/Sidebar'; // Import Sidebar

// ... inside App component ...
function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('studentToken'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open for desktop if desired, or false

  // Check if user is teacher
  const userInfo = JSON.parse(localStorage.getItem('studentInfo'));
  const isTeacher = isAuthenticated && userInfo?.role === 'teacher';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <Router>
      <div className="app-main">
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />

        {isTeacher && (
          <>
            <button
              className="sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ position: 'fixed', top: '80px', left: '20px', zIndex: 99 }}
            >
              ☰ Menu
            </button>
            <Sidebar
              isOpen={isSidebarOpen}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              setIsAuthenticated={setIsAuthenticated}
            />
          </>
        )}

        <main style={{ marginLeft: isTeacher && isSidebarOpen ? '250px' : '0', transition: 'margin 0.3s' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signin" element={<SignIn setAuthState={setIsAuthenticated} />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/news" element={
              <ProtectedRoute>
                <News />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/grades" element={
              <ProtectedRoute>
                <GradeReport />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
