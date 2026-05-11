import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useGameEvents } from "../hooks/useGameEvents";

/**
 * Example component demonstrating how to use authentication and socket events
 * This is a reference for how to structure your game components
 */
export const GameEventExample = () => {
  const { data: session, signOut } = useAuth();
  const { isConnected, startGame, movePlayer, onGameUpdate, onPlayerUpdate } =
    useGameEvents();
  const [gameState, setGameState] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  // Listen for game updates from server
  useEffect(() => {
    const unsubscribeGameUpdate = onGameUpdate((state) => {
      console.log("Game state updated:", state);
      setGameState(state);
    });

    return unsubscribeGameUpdate;
  }, [onGameUpdate]);

  // Listen for player updates from server
  useEffect(() => {
    const unsubscribePlayerUpdate = onPlayerUpdate((data) => {
      console.log("Player updated:", data);
      setPlayerData(data);
    });

    return unsubscribePlayerUpdate;
  }, [onPlayerUpdate]);

  const handleStartGame = () => {
    startGame({
      level: 1,
      difficulty: "normal",
      playerId: session?.user?.id,
    });
  };

  const handleMove = (direction) => {
    movePlayer(direction, {
      x: playerData?.x || 0,
      y: playerData?.y || 0,
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="example-container">
      {/* User Info */}
      <div className="user-info">
        <h2>Welcome, {session?.user?.name}</h2>
        <p>Email: {session?.user?.email}</p>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>

      {/* Connection Status */}
      <div className="connection-status">
        <p>Socket Connected: {isConnected ? "✓ Yes" : "✗ No"}</p>
      </div>

      {/* Game Controls */}
      <div className="game-controls">
        <button onClick={handleStartGame} disabled={!isConnected}>
          Start Game
        </button>

        <div className="movement-buttons">
          <button onClick={() => handleMove("up")}>↑ Up</button>
          <button onClick={() => handleMove("left")}>← Left</button>
          <button onClick={() => handleMove("right")}>Right →</button>
          <button onClick={() => handleMove("down")}>↓ Down</button>
        </div>
      </div>

      {/* Game State Display */}
      {gameState && (
        <div className="game-state">
          <h3>Game State</h3>
          <pre>{JSON.stringify(gameState, null, 2)}</pre>
        </div>
      )}

      {/* Player Data Display */}
      {playerData && (
        <div className="player-data">
          <h3>Player Data</h3>
          <pre>{JSON.stringify(playerData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default GameEventExample;

/*
HOW TO USE THIS COMPONENT:

1. In your GamePage.jsx or any protected route:

   import GameEventExample from '@/components/GameEventExample';

   function GamePage() {
     return <GameEventExample />;
   }

2. The component demonstrates:
   - Using useAuth() to get user info
   - Using useGameEvents() to interact with the server
   - Handling real-time updates via onGameUpdate() and onPlayerUpdate()
   - Checking socket connection status
   - Sending events to the server

3. Expected server responses:

   When client sends: startGame({ level: 1, ... })
   Server sends back: game:update event with new game state

   When client sends: movePlayer('up', { x, y })
   Server sends back: player:update event with updated position

4. Customize this pattern for your actual game:
   - Replace button controls with keyboard/touch input
   - Update game state management based on your needs
   - Add more event listeners/handlers as needed
   - Integrate with your GameEngine and Renderer

5. Use hooks directly in your components:

   function MyComponent() {
     const { movePlayer, onPlayerUpdate } = useGameEvents();
     // ... your component logic
   }

*/
