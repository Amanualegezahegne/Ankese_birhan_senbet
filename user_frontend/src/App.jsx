import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Components/Navbar';
import Home from './Pages/Home';
import About from './Pages/About';
import Contact from './Pages/Contact';
import SignIn from './Pages/SignIn';
import SignUp from './Pages/SignUp';
import ForgotPassword from './Pages/ForgotPassword';
import VerifyOTP from './Pages/VerifyOTP';
import ResetPassword from './Pages/ResetPassword';
import News from './Pages/News';
import Profile from './Pages/Profile';
import GradeReport from './Pages/GradeReport';
import './App.css';

// Protected Route Component for Students
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('studentToken');
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

import Sidebar from './Components/Sidebar'; // Import Sidebar
import Footer from './Components/Footer';

// ... inside App component ...
function App() {
  const { t } = useTranslation();
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
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            setIsAuthenticated={setIsAuthenticated}
          />
        )}

        <main className={`main-content ${isTeacher ? 'sidebar-open' : ''}`}>
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
          <Footer />
        </main>
      </div>
    </Router>
  );
}

export default App;
