import React from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../services/authService';

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = AuthService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'consumer':
        return <Navigate to="/consumer/videos" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
