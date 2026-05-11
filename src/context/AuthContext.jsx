import { createContext } from "react";
import { authClient } from "../services/auth-client";

/**
 * Auth Context using better-auth client
 * Wraps better-auth session management with React Context
 *
 * Docs: https://www.better-auth.com/docs/client
 */
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Note: useSession hook must be called in components, not in providers
  // The authClient methods are passed directly to components
  const value = {
    authClient,
    signIn: authClient.signIn,
    signUp: authClient.signUp,
    signOut: authClient.signOut,
    changePassword: authClient.changePassword,
    updateProfile: authClient.updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
