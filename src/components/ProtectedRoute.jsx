import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Protected route component that redirects to sign in if not authenticated
 * @param {React.Component} Component - The component to render
 * @returns {React.ReactNode}
 */
export const ProtectedRoute = ({ element: Element }) => {
  const { data: session, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return session ? Element : <Navigate to="/signin" replace />;
};
