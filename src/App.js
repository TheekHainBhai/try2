import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProductReviews from './components/ProductReviews';
import ComplaintForm from './components/ComplaintForm';
import IncidentTracking from './components/IncidentTracking';
import Analytics from './components/Analytics';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import FSSAIVerification from './components/FSSAIVerification';
import FSSAIRegistrationList from './components/FSSAIRegistrationList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    secondary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#10b981',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <>
                      <Navbar />
                      <AnimatePresence mode="wait">
                        <main className="main-content">
                          <Dashboard />
                        </main>
                      </AnimatePresence>
                    </>
                  </PrivateRoute>
                }
              />
              <Route
                path="/reviews"
                element={
                  <PrivateRoute>
                    <>
                      <Navbar />
                      <AnimatePresence mode="wait">
                        <main className="main-content">
                          <ProductReviews />
                        </main>
                      </AnimatePresence>
                    </>
                  </PrivateRoute>
                }
              />
              <Route
                path="/complaints"
                element={
                  <PrivateRoute>
                    <>
                      <Navbar />
                      <AnimatePresence mode="wait">
                        <main className="main-content">
                          <ComplaintForm />
                        </main>
                      </AnimatePresence>
                    </>
                  </PrivateRoute>
                }
              />
              <Route
                path="/incidents"
                element={
                  <PrivateRoute>
                    <>
                      <Navbar />
                      <AnimatePresence mode="wait">
                        <main className="main-content">
                          <IncidentTracking />
                        </main>
                      </AnimatePresence>
                    </>
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <>
                      <Navbar />
                      <AnimatePresence mode="wait">
                        <main className="main-content">
                          <Analytics />
                        </main>
                      </AnimatePresence>
                    </>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <>
                      <Navbar />
                      <AnimatePresence mode="wait">
                        <main className="main-content">
                          <Profile />
                        </main>
                      </AnimatePresence>
                    </>
                  </PrivateRoute>
                }
              />
              <Route
                path="/fssai"
                element={
                  <PrivateRoute>
                    <>
                      <Navbar />
                      <AnimatePresence mode="wait">
                        <main className="main-content">
                          <FSSAIVerification />
                        </main>
                      </AnimatePresence>
                    </>
                  </PrivateRoute>
                }
              />
              <Route
                path="/fssai-registrations"
                element={
                  <PrivateRoute>
                    <>
                      <Navbar />
                      <AnimatePresence mode="wait">
                        <main className="main-content">
                          <FSSAIRegistrationList />
                        </main>
                      </AnimatePresence>
                    </>
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
