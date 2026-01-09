import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import './styles/global.css';

// Import pages
import ConsumerSignup from './pages/ConsumerSignup';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import ConsumerHome from './pages/ConsumerHome';
import ConsumerVideoDetails from './pages/ConsumerVideoDetails';
import AuthService from './services/authService';


// Custom theme
const theme = extendTheme({
  colors: {
    brand: {
      primary: '#FFD700',   // Primary Yellow
      secondary: '#FFC107', // Secondary Yellow
      white: '#FFFFFF',     // Background White
      text: '#333333'       // Text Color
    }
  },
  styles: {
    global: {
      body: {
        bg: 'brand.white',
        color: 'brand.text'
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        _hover: {
          opacity: 0.8
        }
      },
      variants: {
        solid: {
          bg: 'brand.primary',
          color: 'white'
        },
        outline: {
          borderColor: 'brand.primary',
          color: 'brand.primary'
        }
      }
    }
  }
});

function PrivateRoute({ children, allowedRoles }) {
  const user = AuthService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/signup" element={<ConsumerSignup />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/consumer/video/:videoId" 
            element={
              <PrivateRoute allowedRoles={['consumer']}>
                <ConsumerVideoDetails />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/consumer/home" 
            element={
              <PrivateRoute allowedRoles={['consumer']}>
                <ConsumerHome />
              </PrivateRoute>
            } 
          />

          {['admin'].includes(AuthService.getCurrentUser()?.role) && (
            <Route 
              path="/analytics" 
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Analytics />
                </PrivateRoute>
              } 
            />
          )}

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
