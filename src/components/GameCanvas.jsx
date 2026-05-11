import { useEffect, useRef, useState } from "react";
import { GameEngine } from "../game/GameEngine";
import HUD from "./HUD";
import MobileControls from "./MobileControls";
import "../styles/game.css";
import "../App.css";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../hooks/useAuth";
export default function GameCanvas() {
  const { emit, on } = useSocket();
  const { data: session } = useAuth();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [coOpPlaying, setCoOpPlaying] = useState(false);
  const [coopChoice, setCoopChoice] = useState("create");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [myRoomPlayers, setMyRoomPlayers] = useState([]);
  const [roomJoined, setRoomJoined] = useState(false);
  const [joinedRoomPlayers, setJoinedRoomPLayers] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []);

const startGame = () => {
    if (!canvasRef.current) return;

    if (engineRef.current) {
      engineRef.current.dispose();
    }

    const getSize = () => {
      const vv = window.visualViewport;
      if (vv) return { width: vv.width, height: vv.height };
      return { width: window.innerWidth, height: window.innerHeight };
    };

    const { width, height } = getSize();

    engineRef.current = new GameEngine(canvasRef.current, width, height);
    engineRef.current.start();
    setIsPlaying(true);
    setGameResult(null);

    let resizeTimer = null;

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (
          engineRef.current &&
          engineRef.current.state &&
          engineRef.current.state.running
        ) {
          const { width: w, height: h } = getSize();
          if (w > 0 && h > 0) {
            engineRef.current.resize(w, h);
          }
        }
      }, 100);
    };

    let orientationTimer = null;

    const handleOrientation = () => {
      if (orientationTimer) clearTimeout(orientationTimer);
      orientationTimer = setTimeout(() => {
        if (
          engineRef.current &&
          engineRef.current.state &&
          engineRef.current.state.running
        ) {
          const { width: w, height: h } = getSize();
          if (w > 0 && h > 0) {
            engineRef.current.resize(w, h);
          }
        }
      }, 300);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      window.visualViewport.addEventListener("scroll", handleResize);
    }
    window.addEventListener("orientationchange", handleOrientation);
    window.addEventListener("resize", handleResize);

    const pollInterval = setInterval(() => {
      if (engineRef.current && engineRef.current.state) {
        setGameState({
          hp: engineRef.current.state.player.hp,
          maxHp: engineRef.current.state.player.maxHp,
          energy: Math.ceil(engineRef.current.state.player.energy),
          sector: engineRef.current.state.sector,
          score: engineRef.current.state.score,
        });

        if (!engineRef.current.state.running) {
          console.log("engine ref not running, ending game");
          const result = engineRef.current.endGame(true);
          setGameResult(result);
          setIsPlaying(false);
          if (window.visualViewport) {
            window.visualViewport.removeEventListener("resize", handleResize);
            window.visualViewport.removeEventListener("scroll", handleResize);
          }
          window.removeEventListener("orientationchange", handleOrientation);
          window.removeEventListener("resize", handleResize);
          clearInterval(pollInterval);
          if (resizeTimer) clearTimeout(resizeTimer);
          if (orientationTimer) clearTimeout(orientationTimer);
        }
      }
    }, 50);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      if (orientationTimer) clearTimeout(orientationTimer);
      clearInterval(pollInterval);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
        window.visualViewport.removeEventListener("scroll", handleResize);
      }
      window.removeEventListener("orientationchange", handleOrientation);
      window.removeEventListener("resize", handleResize);
    };
  };

  const handleRetry = () => {
    startGame();
  };

  const toggleCoOp = () => {
    setCoOpPlaying(!coOpPlaying);
    setRoomCode("");
    setJoinCode("");
    setMyRoomPlayers([]);
  };

  const handleToggleReady = () => {
    console.log("Toggling ready status for player:", session?.user?.name || "You");
    emit("togglePlayerReady", { roomId: joinCode.toLowerCase() }, (response) => {
      if (response.success) {
        console.log("Toggling successful");
        setMyRoomPlayers((prev) =>
          prev.map((p) =>
            p.name === (session?.user?.name || "You")
              ? { ...p, ready: !p.ready }
              : p,
          ),
        );
        setActivityLog((prev) => [
          ...prev,
          {
            text: `${session?.user?.name || "You"} is ready`,
            time: Date.now(),
          },
        ]);
      }else {
        console.error("Failed to toggle ready status:", response.message);
      }
    });
  };

  const handleCreateRoom = () => {
    setIsCreatingRoom(true);

    console.log(
      "Trying to emit createRoom event to server with name : ",
      session?.user?.name || "UnknownPlayer",
    );

    on("playerJoined", (data) => {
      console.log("Player joined event received:", data);
      const guest = data.guest;
      setMyRoomPlayers((prev) => [
        ...prev,
        { name: guest.name, role: "guest", ready: false },
      ]);
      setActivityLog((prev) => [
        ...prev,
        { text: `${guest.name} joined the room`, time: Date.now() },
      ]);
    });

    on("togglePlayerReady", (data) => {
      console.log("Toggle player ready event received:", data);
      const playerName = data.guest.name;
      setMyRoomPlayers((prev) =>
        prev.map((p) =>
          p.name === playerName ? { ...p, ready: !p.ready } : p,
        ),
      );
      setActivityLog((prev) => [
        ...prev,
        {
          text: `${playerName} changed ready status`,
          time: Date.now(),
        },
      ]);
    });

    emit(
      "createRoom",
      { playerName: session?.user?.name || "HostPlayer" },
      (response) => {
        if (response.success) {
          console.log("Room created with code:", response.roomId);
          setRoomCode(response.roomId);
          setMyRoomPlayers([
            { name: session?.user?.name || "You", role: "host", ready: true },
          ]);
          setActivityLog((prev) => [
            ...prev,
            {
              text: `${session?.user?.name || "You"} created the room`,
              time: Date.now(),
            },
          ]);
        } else {
          console.error("Failed to create room:", response.message);
        }
        setIsCreatingRoom(false);
      },
    );
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;
    console.log("Joining room:", joinCode);
    emit(
      "joinRoom",
      {
        roomId: joinCode.trim().toLowerCase(),
        playerName: session?.user?.name || "Player",
      },
      (response) => {
        if (response.success) {
          console.log("Joined room successfully");
          setJoinedRoomPLayers([
            ...response.existingPlayers,
            { name: session?.user?.name || "You", role: "guest", ready: false },
          ]);
          setRoomJoined(true);
          // startGame();
        } else {
          console.error("Failed to join room:", response.message);
        }
      },
    );
  };

  const handleStartCoOp = () => {
    if (roomCode) {
      emit("startGame", { roomId: roomCode }, (response) => {
        if (response.success) {
          startGame();
        }
      });
    }
  };

  return (
    <>
      <canvas ref={canvasRef} id="game-canvas" className="game-canvas" />
      {isPlaying && gameState && <HUD gameState={gameState} />}
      <MobileControls engineRef={engineRef} isPlaying={isPlaying} />
      {!isPlaying && !gameResult && (
        <div className="screen">
          <div className={`main-screen${coOpPlaying ? " co-op-active" : ""}`}>
            <div className="intro">
              <div className="title-icon">👾</div>
              <h1 className="game-title">
                VOID
                <br />
                WALKER
              </h1>
              <p className="game-subtitle">space horror platformer</p>
              <div className="instructions">
                <p>← → MOVE | SPACE / ↑ JUMP</p>
                <p>DOUBLE JUMP available! | Z SHOOT</p>
                <p>STOMP enemies from above</p>
              </div>

              {!coOpPlaying && (
                <div className="buttons">
                  <button className="btn-start" onClick={startGame}>
                    INITIALIZE
                  </button>
                  <button className="btn-start" onClick={toggleCoOp}>
                    PLAY CO-OP
                  </button>
                </div>
              )}

              {coOpPlaying && (
                <div className="co-op-side-info">
                  <div className="connection-status">
                    <span className="status-dot"></span>
                    <span>CO-OP ACTIVE</span>
                  </div>
                  <button className="btn-exit-coop" onClick={toggleCoOp}>
                    ✕ EXIT CO-OP
                  </button>
                </div>
              )}
            </div>

            {coOpPlaying && (
              <div className="co-op-panel">
                <div className="co-op-panel-header">
                  <h2 className="co-op-title">CO-OP MODE</h2>
                  <p className="co-op-subtitle">team up and survive the void</p>
                </div>

                <div className="co-op-divider" />

                {/* Mode selector */}
                <div className="co-op-modes">
                  <button
                    className={`co-op-mode-btn ${coopChoice === "create" ? "active" : ""}`}
                    onClick={() => {
                      setCoopChoice("create");
                      // setRoomCode("");
                    }}
                  >
                    <span className="mode-icon">⚙</span>
                    <span className="mode-label">Create Room</span>
                  </button>
                  <button
                    className={`co-op-mode-btn ${coopChoice === "join" ? "active" : ""}`}
                    onClick={() => {
                      setCoopChoice("join");
                      // setJoinCode("");
                    }}
                  >
                    <span className="mode-icon">🔗</span>
                    <span className="mode-label">Join Room</span>
                  </button>
                </div>

                {/* Content area */}
                <div className="co-op-content">
                  {coopChoice === "create" ? (
                    <div className="co-op-section">
                      {!roomCode ? (
                        <>
                          <p className="co-op-hint">
                            Create a room and share the code with your friend.
                          </p>
                          <button
                            className="btn-coop-action"
                            onClick={handleCreateRoom}
                            disabled={isCreatingRoom}
                          >
                            {isCreatingRoom ? (
                              <span className="btn-loading">
                                <span className="spinner"></span>
                                CREATING...
                              </span>
                            ) : (
                              "CREATE ROOM"
                            )}
                          </button>
                        </>
                      ) : (
                        <div className="room-code-display">
                          <div className="pulse-ring"></div>
                          <p className="room-code-label">Your Room Code</p>
                          <div className="room-code">{roomCode}</div>
                          <div className="room-actions">
                            <button
                              className="btn-coop-secondary"
                              onClick={() => {
                                navigator.clipboard
                                  .writeText(roomCode)
                                  .then(() => {
                                    setActivityLog((prev) => [
                                      ...prev,
                                      {
                                        text: "Room code copied!",
                                        time: Date.now(),
                                      },
                                    ]);
                                  })
                                  .catch(() => {});
                              }}
                            >
                              COPY CODE
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="co-op-section">
                      <p className="co-op-hint">
                        Enter the room code your friend shared with you.
                      </p>
                      <input
                        className="co-op-input"
                        type="text"
                        placeholder="e.g. A3F9"
                        value={joinCode}
                        onChange={(e) =>
                          setJoinCode(
                            e.target.value
                              .replace(/[^A-Z0-9]/gi, "")
                              .toUpperCase()
                              .slice(0, 8),
                          )
                        }
                        maxLength={8}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <button
                        className="btn-coop-action"
                        onClick={handleJoinRoom}
                        disabled={!joinCode.trim()}
                      >
                        JOIN ROOM
                      </button>
                    </div>
                  )}
                </div>

                {/* Room activity */}

                {coopChoice == "create" && myRoomPlayers.length > 0 && (
                  <div className="co-op-activity">
                    <div className="co-op-divider" />
                    <h3 className="co-op-activity-title">ROOM ACTIVITY</h3>
                    <div className="players-list">
                      {myRoomPlayers.map((p, i) => (
                        <div
                          key={i}
                          className={`player-row ${p.ready ? "ready" : ""}`}
                        >
                          <span
                            className={`player-dot ${p.ready ? "dot-ready" : "dot-waiting"}`}
                          ></span>
                          <span className="player-name">{p.name}</span>
                          <span className="player-role">{p.role}</span>
                          <span className="player-status">
                            {p.ready ? "READY" : "WAITING"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {myRoomPlayers.length > 0 && (
                      <div className="co-op-actions">
                        <button
                          className="btn-coop-action"
                          onClick={handleStartCoOp}
                          disabled={!myRoomPlayers.every((p) => p.ready)}
                        >
                          START GAME
                        </button>
                      </div>
                    )}
                    {activityLog.length > 0 && (
                      <div className="activity-log">
                        {activityLog.map((log, i) => (
                          <div key={i} className="log-entry">
                            <span className="log-time">
                              {new Date(log.time).toLocaleTimeString()}
                            </span>
                            <span className="log-text">{log.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {coopChoice == "join" && roomJoined && (
                  <div className="co-op-activity">
                    <div className="co-op-divider" />
                    <h3 className="co-op-activity-title">ROOM ACTIVITY</h3>
                    <div className="players-list">
                      {joinedRoomPlayers.map((p, i) => (
                        <div
                          key={i}
                          className={`player-row ${p.ready ? "ready" : ""}`}
                        >
                          <span
                            className={`player-dot ${p.ready ? "dot-ready" : "dot-waiting"}`}
                          ></span>
                          <span className="player-name">{p.name}</span>
                          <span className="player-role">{p.role}</span>
                          <span className="player-status">
                            {p.ready ? "READY" : "WAITING"}
                          </span>
                        </div>
                      ))}
                    </div>
                    {joinedRoomPlayers.length > 0 && (
                      <div className="co-op-actions">
                        <button
                          className={`btn-coop-action ${joinedRoomPlayers.some((p) => p.ready && p.name === (session?.user?.name || "You")) ? "btn-ready-active" : "btn-ready-inactive"}`}
                          onClick={handleToggleReady}
                          // disabled={!joinedRoomPlayers.every((p) => p.ready)}
                        >
                          ready
                        </button>
                      </div>
                    )}
                    {activityLog.length > 0 && (
                      <div className="activity-log">
                        {activityLog.map((log, i) => (
                          <div key={i} className="log-entry">
                            <span className="log-time">
                              {new Date(log.time).toLocaleTimeString()}
                            </span>
                            <span className="log-text">{log.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Animated background elements */}
          <div className="stars"></div>
          <div className="void-overlay"></div>
        </div>
      )}

      {!isPlaying && gameResult && (
        <div className="screen game-over-screen">
          <h1 className="game-title">
            {gameResult.won ? "VICTORY" : "GAME OVER"}
          </h1>
          <div className="result-stats">
            <p>SCORE: {String(gameResult.score).padStart(6, "0")}</p>
            <p>SECTOR: {gameResult.sector}</p>
            <p>COINS: {gameResult.totalCoins}</p>
            <p>DEATHS: {gameResult.deaths}</p>
          </div>
          <button className="btn-retry" onClick={handleRetry}>
            RESTART
          </button>
        </div>
      )}
    </>
  );
}
