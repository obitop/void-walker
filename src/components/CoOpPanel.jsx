import { useState } from "react";
import "../styles/coop.css";

export default function CoOpPanel({ onClose, onStartGame }) {
  const [activeTab, setActiveTab] = useState("create");
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState(`Player_${Math.floor(Math.random() * 10000)}`);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([
    { id: "ROOM001", players: 1, maxPlayers: 2, createdAt: new Date() },
    { id: "ROOM002", players: 2, maxPlayers: 2, createdAt: new Date() },
  ]);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const generateRoomCode = () => {
    const code = `VOID${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return code;
  };

  const handleCreateRoom = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newRoom = {
        id: generateRoomCode(),
        players: 1,
        maxPlayers: 2,
        host: playerName,
        createdAt: new Date(),
      };
      setCreatedRoom(newRoom);
      setIsCreating(false);
    }, 800);
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return;
    setIsJoining(true);
    setTimeout(() => {
      setJoinedRoom({
        id: roomCode,
        players: 2,
        maxPlayers: 2,
        createdAt: new Date(),
      });
      setIsJoining(false);
    }, 800);
  };

  const handleStartCoOpGame = () => {
    const room = createdRoom || joinedRoom;
    if (room) {
      onStartGame({ isCoOp: true, room });
      onClose();
    }
  };

  const handleLeaveRoom = () => {
    setCreatedRoom(null);
    setJoinedRoom(null);
    setRoomCode("");
  };

  if (createdRoom) {
    return (
      <div className="coop-panel">
        <div className="coop-content">
          <button className="btn-close" onClick={onClose}>✕</button>
          
          <div className="room-status-container">
            <div className="room-header">
              <h2>Room Created</h2>
              <div className="status-badge active">WAITING</div>
            </div>

            <div className="room-code-box">
              <p className="label">ROOM CODE</p>
              <div className="code-display">
                <span className="code">{createdRoom.id}</span>
                <button 
                  className="btn-copy" 
                  onClick={() => navigator.clipboard.writeText(createdRoom.id)}
                >
                  📋
                </button>
              </div>
            </div>

            <div className="players-display">
              <h3>PLAYERS</h3>
              <div className="player-slots">
                <div className="player-slot filled">
                  <span className="icon">⚔️</span>
                  <p className="name">{playerName}</p>
                  <p className="role">HOST</p>
                </div>
                <div className="player-slot empty">
                  <span className="icon">?</span>
                  <p className="status">WAITING...</p>
                </div>
              </div>
            </div>

            <div className="room-info">
              <p><span className="label">Created:</span> {new Date().toLocaleTimeString()}</p>
              <p><span className="label">Mode:</span> Co-op</p>
              <p><span className="label">Max Players:</span> {createdRoom.maxPlayers}</p>
            </div>

            <div className="button-group">
              <button 
                className="btn-primary"
                onClick={handleStartCoOpGame}
              >
                START GAME
              </button>
              <button 
                className="btn-secondary"
                onClick={handleLeaveRoom}
              >
                LEAVE ROOM
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (joinedRoom) {
    return (
      <div className="coop-panel">
        <div className="coop-content">
          <button className="btn-close" onClick={onClose}>✕</button>
          
          <div className="room-status-container">
            <div className="room-header">
              <h2>Room Joined</h2>
              <div className="status-badge joined">READY</div>
            </div>

            <div className="room-code-box">
              <p className="label">ROOM CODE</p>
              <div className="code-display">
                <span className="code">{joinedRoom.id}</span>
              </div>
            </div>

            <div className="players-display">
              <h3>PLAYERS</h3>
              <div className="player-slots">
                <div className="player-slot filled">
                  <span className="icon">🛡️</span>
                  <p className="name">Host Player</p>
                  <p className="role">HOST</p>
                </div>
                <div className="player-slot filled">
                  <span className="icon">⚔️</span>
                  <p className="name">{playerName}</p>
                  <p className="role">GUEST</p>
                </div>
              </div>
            </div>

            <div className="button-group">
              <button 
                className="btn-primary"
                onClick={handleStartCoOpGame}
              >
                READY TO START
              </button>
              <button 
                className="btn-secondary"
                onClick={handleLeaveRoom}
              >
                LEAVE ROOM
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="coop-panel">
      <div className="coop-content">
        <button className="btn-close" onClick={onClose}>✕</button>
        
        <div className="coop-header">
          <h2>⚔️ CO-OP MODE</h2>
          <p className="subtitle">Play with Friends</p>
        </div>

        <div className="player-input-section">
          <label>YOUR NAME</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={16}
            placeholder="Enter player name"
            className="input-field"
          />
        </div>

        <div className="tab-group">
          <button
            className={`tab ${activeTab === "create" ? "active" : ""}`}
            onClick={() => setActiveTab("create")}
          >
            CREATE ROOM
          </button>
          <button
            className={`tab ${activeTab === "join" ? "active" : ""}`}
            onClick={() => setActiveTab("join")}
          >
            JOIN ROOM
          </button>
        </div>

        {activeTab === "create" && (
          <div className="tab-content">
            <div className="content-section">
              <p className="description">Create a new room and invite your friends to join</p>
              <button
                className="btn-primary"
                onClick={handleCreateRoom}
                disabled={isCreating}
              >
                {isCreating ? "CREATING..." : "CREATE NEW ROOM"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "join" && (
          <div className="tab-content">
            <div className="content-section">
              <label>ROOM CODE</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="input-field"
              />
              <button
                className="btn-primary"
                onClick={handleJoinRoom}
                disabled={isJoining}
              >
                {isJoining ? "JOINING..." : "JOIN ROOM"}
              </button>

              <div className="divider">OR</div>

              <div className="available-rooms">
                <h4>AVAILABLE ROOMS</h4>
                {availableRooms.map((room) => (
                  <div 
                    key={room.id} 
                    className="room-item"
                    onClick={() => {
                      if (room.players < room.maxPlayers) {
                        setRoomCode(room.id);
                        handleJoinRoom();
                      }
                    }}
                    style={{ opacity: room.players < room.maxPlayers ? 1 : 0.5, cursor: room.players < room.maxPlayers ? "pointer" : "not-allowed" }}
                  >
                    <span className="room-name">{room.id}</span>
                    <span className="room-players">
                      {room.players}/{room.maxPlayers}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button className="btn-back" onClick={onClose}>← BACK</button>
      </div>
    </div>
  );
}