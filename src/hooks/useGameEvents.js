import { useCallback } from "react";
import { useSocket } from "./useSocket";

/**
 * Custom hook for managing game events
 * Provides simplified API for common game operations
 * Works with socket.io and better-auth
 */
export const useGameEvents = () => {
  const { emit, on, off, isConnected } = useSocket();

  // Game lifecycle events
  const startGame = useCallback(
    (gameConfig) => {
      emit("game:start", gameConfig);
    },
    [emit],
  );

  const endGame = useCallback(
    (gameData) => {
      emit("game:end", gameData);
    },
    [emit],
  );

  const pauseGame = useCallback(() => {
    emit("game:pause", {});
  }, [emit]);

  const resumeGame = useCallback(() => {
    emit("game:resume", {});
  }, [emit]);

  // Player action events
  const movePlayer = useCallback(
    (direction, position) => {
      emit("player:move", { direction, position });
    },
    [emit],
  );

  const playerAction = useCallback(
    (actionType, actionData) => {
      emit("player:action", { type: actionType, ...actionData });
    },
    [emit],
  );

  const fireWeapon = useCallback(
    (weaponData) => {
      emit("player:fire", weaponData);
    },
    [emit],
  );

  // Game state listeners
  const onGameUpdate = useCallback(
    (callback) => {
      on("game:update", callback);
      return () => off("game:update", callback);
    },
    [on, off],
  );

  const onGameStateChange = useCallback(
    (callback) => {
      on("game:state", callback);
      return () => off("game:state", callback);
    },
    [on, off],
  );

  const onPlayerUpdate = useCallback(
    (callback) => {
      on("player:update", callback);
      return () => off("player:update", callback);
    },
    [on, off],
  );

  const onEnemyUpdate = useCallback(
    (callback) => {
      on("enemy:update", callback);
      return () => off("enemy:update", callback);
    },
    [on, off],
  );

  const onGameError = useCallback(
    (callback) => {
      on("game:error", callback);
      return () => off("game:error", callback);
    },
    [on, off],
  );

  return {
    isConnected,
    startGame,
    endGame,
    pauseGame,
    resumeGame,
    movePlayer,
    playerAction,
    fireWeapon,
    onGameUpdate,
    onGameStateChange,
    onPlayerUpdate,
    onEnemyUpdate,
    onGameError,
    emit,
    on,
    off,
  };
};
