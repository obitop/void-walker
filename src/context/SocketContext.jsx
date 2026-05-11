import { createContext, useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { data: session } = useAuth();
  const [Connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Connect to socket when authenticated
  useEffect(() => {
    if (!session) {
      setConnected(false);
      setSocket(null);
      return;
    }

    const newSocket = io("ws://localhost:3000", {
      auth: {
        token: session.accessToken,
      },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      setConnected(true);
      setError(null);
    });

    newSocket.on("connect_error", (err) => {
      setError(err.message);
      setConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount or session change
    return () => {
      newSocket.disconnect();
      setConnected(false);
      setSocket(null);
    };
  }, [session]);

  const emit = useCallback(
    (event, data, callback) => {
      socket.emit(event, data, callback);
    },
    [socket],
  );

  const on = useCallback(
    (event, callback) => {
      socket.on(event, callback);
    },
    [socket],
  );

  const once = useCallback(
    (event, callback) => {
      socket.once(event, callback);
    },
    [socket],
  );

  const off = useCallback(
    (event, callback) => {
      socket.off(event, callback);
    },
    [socket],
  );

  const value = {
    isConnected: Connected,
    error,
    emit,
    on,
    once,
    off,
    socket,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export { SocketContext };
