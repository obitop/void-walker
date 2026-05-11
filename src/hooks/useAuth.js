import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { authClient } from "../services/auth-client";

/**
 * Hook to access authentication state and methods from better-auth
 * Combines context and better-auth hooks for full functionality
 * @returns {object} - { data, isPending, error, signIn, signUp, signOut, ... }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // Get session from better-auth hook (works in components!)
  const session = authClient.useSession();

  // Return combined context and session data
  return {
    ...context,
    ...session,
  };
};
