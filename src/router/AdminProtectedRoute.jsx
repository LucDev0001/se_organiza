import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../store/userContext';

export const ADMIN_EMAIL = 'lucianosantosseverino@gmail.com'; // WARNING: Hardcoding admin email on client-side is not secure for production. Use Firebase Custom Claims in a real application.

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // Check if user is logged in and if their email matches the admin email
  if (!user || user.email !== ADMIN_EMAIL) {
    // Redirect to login or a "not authorized" page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;