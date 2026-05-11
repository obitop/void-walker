import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/auth.css";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { isPending, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { error: signUpError } = await signUp.email({
        email,
        password,
        name,
      });

      if (signUpError) {
        setError(signUpError.message || "Sign up failed");
        return;
      }

      navigate("/game");
    } catch (err) {
      setError(err.message || "An error occurred");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              required
              disabled={isPending}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
              disabled={isPending}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
              disabled={isPending}
              className="form-input"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" disabled={isPending} className="btn-submit">
            {isPending ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account?{" "}
          <a
            href="/signin"
            onClick={(e) => {
              e.preventDefault();
              navigate("/signin");
            }}
            className="auth-link"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
