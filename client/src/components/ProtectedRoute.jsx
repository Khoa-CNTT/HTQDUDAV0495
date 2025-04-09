import { Navigate } from 'react-router-dom';
import { isAuthenticated, isCurrentTokenExpired } from '../utils/jwtUtils';

const ProtectedRoute = ({ user, children }) => {
  // Check authentication with JWT utilities
  const authenticated = isAuthenticated();
  const tokenExpired = isCurrentTokenExpired();
  
  if (!authenticated || tokenExpired) {
    // Redirect to login if not authenticated or token expired
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute; 