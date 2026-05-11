import { useContext } from "react";

import { SocketContext } from "../context/SocketContext";

/**
 * Hook to access socket connection and methods
 * @returns {object} - { isConnected, error, emit, on, once, off, socket }
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
