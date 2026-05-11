/**
 * Better Auth Client Configuration
 * Frontend client for authenticating with better-auth backend
 *
 * Docs: https://www.better-auth.com/docs/client
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  // Store tokens in cookies (HTTP-only by default on backend)
  storageProvider: localStorage,
  // CORS configuration for better-auth
  fetchOptions: {
    credentials: "include", // Include cookies in requests for CORS
  },
});

// Export convenient hooks
export const useSession = authClient.useSession;
export const useUser = authClient.useUser;
export const useSignIn = authClient.signIn.useSignInEmail;
export const useSignUp = authClient.signUp.useSignUpEmail;
export const useSignOut = authClient.signOut;
export const useChangePassword = authClient.changePassword.useChangePassword;
export const useUpdateProfile = authClient.updateProfile;

// Export client for manual API calls
export default authClient;
