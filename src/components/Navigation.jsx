import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authClient } from "../services/auth-client";
import "../styles/navigation.css";

export default function Navigation() {
  const location = useLocation();
  const { data: session } = useAuth();

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🚀</span>
          <span className="brand-text">Void Walker</span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-menu">
          <Link
            to="/"
            className={`nav-link ${isActive("/") || isActive("/home") ? "active" : ""}`}
          >
            Home
          </Link>

          {session?.user ? (
            <>
              <Link
                to="/game"
                className={`nav-link ${isActive("/game") ? "active" : ""}`}
              >
                Play
              </Link>
              <div className="user-section">
                <span className="user-name">
                  @{session.user.name || session.user.email}
                </span>
                <button className="nav-btn logout-btn" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="auth-section">
              <Link
                to="/signin"
                className={`nav-link ${isActive("/signin") ? "active" : ""}`}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className={`nav-btn signup-btn ${isActive("/signup") ? "active" : ""}`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
