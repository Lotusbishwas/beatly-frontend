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


// Modern Dark Theme
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      primary: '#6366F1',     // Indigo
      secondary: '#8B5CF6',   // Purple
      accent: '#06B6D4',      // Cyan
      success: '#10B981',     // Emerald
      warning: '#F59E0B',     // Amber
      error: '#EF4444',       // Red
      dark: '#0F0F23',        // Very Dark Blue
      darker: '#070720',      // Darker Blue
      light: '#F8FAFC',       // Light Gray
      gray: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A'
      }
    }
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'brand.dark' : 'brand.light',
        color: props.colorMode === 'dark' ? 'white' : 'brand.gray.900',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        lineHeight: '1.6'
      },
      '*': {
        borderColor: props.colorMode === 'dark' ? 'brand.gray.700' : 'brand.gray.200'
      }
    })
  },
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'xl',
        _focus: {
          boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.4)'
        }
      },
      variants: {
        solid: (props) => ({
          bg: `${props.colorScheme || 'brand'}.primary`,
          color: 'white',
          _hover: {
            bg: `${props.colorScheme || 'brand'}.secondary`,
            transform: 'translateY(-1px)',
            boxShadow: 'lg'
          },
          _active: {
            transform: 'translateY(0)'
          }
        }),
        gradient: {
          bgGradient: 'linear(to-r, brand.primary, brand.secondary)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, brand.secondary, brand.accent)',
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
          },
          _active: {
            transform: 'translateY(0)'
          }
        },
        outline: (props) => ({
          borderColor: `${props.colorScheme || 'brand'}.primary`,
          color: `${props.colorScheme || 'brand'}.primary`,
          _hover: {
            bg: `${props.colorScheme || 'brand'}.primary`,
            color: 'white',
            transform: 'translateY(-1px)'
          }
        }),
        ghost: (props) => ({
          color: props.colorMode === 'dark' ? 'white' : 'brand.gray.700',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.gray.800' : 'brand.gray.100',
            color: 'brand.primary'
          }
        })
      }
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'brand.gray.800' : 'white',
          borderRadius: '2xl',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'brand.gray.700' : 'brand.gray.200',
          boxShadow: props.colorMode === 'dark' 
            ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
            : '0 4px 6px rgba(0, 0, 0, 0.07)',
          _hover: {
            transform: 'translateY(-2px)',
            boxShadow: props.colorMode === 'dark' 
              ? '0 20px 25px rgba(0, 0, 0, 0.4)' 
              : '0 20px 25px rgba(0, 0, 0, 0.1)'
          },
          transition: 'all 0.3s ease'
        }
      })
    },
    Input: {
      variants: {
        filled: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'brand.gray.800' : 'brand.gray.50',
            border: '2px solid',
            borderColor: 'transparent',
            _hover: {
              borderColor: 'brand.primary'
            },
            _focus: {
              borderColor: 'brand.primary',
              boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.4)'
            }
          }
        })
      },
      defaultProps: {
        variant: 'filled'
      }
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? 'brand.gray.800' : 'white',
          borderRadius: '2xl',
          border: '1px solid',
          borderColor: props.colorMode === 'dark' ? 'brand.gray.700' : 'brand.gray.200'
        }
      })
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
