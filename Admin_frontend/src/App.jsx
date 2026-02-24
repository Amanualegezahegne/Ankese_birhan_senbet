import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Home from './Pages/Home';
import Contact from './Pages/Contact';
import Messages from './Pages/Messages';
import UserManagement from './Pages/UserManagement';
import TeacherManagement from './Pages/TeacherManagement';
import NewsManager from './Pages/NewsManager';
import Settings from './Pages/Settings';
import Attendance from './Pages/Attendance';
import CourseManagement from './Pages/CourseManagement';
import Results from './Pages/Results';
import About from './Pages/About';
import SignIn from './Pages/SignIn';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/signin" />;
};

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'dark');
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('adminToken'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('adminTheme', newTheme);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    window.location.href = '/signin';
  };

  return (
    <Router>
      <div className="admin-app">
        <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          isAuthenticated={isAuthenticated}
          handleLogout={handleLogout}
        />
        <div className={`admin-main-layout ${isAuthenticated ? 'has-sidebar' : ''}`}>
          {isAuthenticated && <Sidebar handleLogout={handleLogout} />}
          <div className="admin-content">
            <Routes>
              <Route path="/signin" element={
                isAuthenticated ? <Navigate to="/" /> : <SignIn />
              } />

              <Route path="/about" element={
                <ProtectedRoute>
                  <About />
                </ProtectedRoute>
              } />

              <Route path="/" element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } />

              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />

              <Route path="/users" element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              } />

              <Route path="/teachers" element={
                <ProtectedRoute>
                  <TeacherManagement />
                </ProtectedRoute>
              } />

              <Route path="/contact" element={
                <ProtectedRoute>
                  <Contact />
                </ProtectedRoute>
              } />

              <Route path="/news" element={
                <ProtectedRoute>
                  <NewsManager />
                </ProtectedRoute>
              } />

              <Route path="/attendance" element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              } />

              <Route path="/courses" element={
                <ProtectedRoute>
                  <CourseManagement />
                </ProtectedRoute>
              } />

              <Route path="/results" element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings theme={theme} toggleTheme={toggleTheme} />
                </ProtectedRoute>
              } />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
