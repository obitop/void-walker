# Quick Reference Guide

## Installation & Setup (✅ Already Done)

```bash
npm install socket.io-client better-auth
```

## Environment Setup

```bash
cp .env.example .local.env
# Update with your backend URLs
```

## Essential Imports

```javascript
// Authentication
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth";

// Socket Communication
import { useSocket } from "@/context/SocketContext";
import { socketService } from "@/services/socket";

// Game Events
import { useGameEvents } from "@/hooks/useGameEvents";

// Route Protection
import { ProtectedRoute } from "@/components/ProtectedRoute";
```

## Common Patterns

### Check if User is Authenticated

```javascript
const { isAuthenticated, user } = useAuth();

if (!isAuthenticated) {
  return <Navigate to="/signin" />;
}
```

### Sign In/Out

```javascript
const { signIn, signOut } = useAuth();

await signIn("email@example.com", "password");
await signOut();
```

### Connect to Socket

```javascript
const { isConnected } = useSocket();

// Auto-connects when user is authenticated
// Disconnects when user signs out
```

### Send & Receive Events

```javascript
const { emit, on, off, isConnected } = useSocket();

// Send event
emit("game:start", { level: 1 });

// Listen for event
on("game:update", (gameState) => {
  console.log("Game updated:", gameState);
});

// Stop listening
off("game:update", handler);
```

### Game Events

```javascript
const {
  startGame,
  endGame,
  pauseGame,
  resumeGame,
  movePlayer,
  playerAction,
  fireWeapon,
  onGameUpdate,
  onPlayerUpdate,
  onEnemyUpdate,
  isConnected,
} = useGameEvents();

// Start game
startGame({ level: 1, difficulty: "hard" });

// Listen for updates
onGameUpdate((state) => {
  updateGameState(state);
});

// Player moves
movePlayer("up", { x: 100, y: 200 });

// Fire weapon
fireWeapon({ type: "laser", damage: 10 });
```

## File Locations

| Purpose               | Path                                           |
| --------------------- | ---------------------------------------------- |
| Auth service          | `src/services/auth.js`                         |
| Socket service        | `src/services/socket.js`                       |
| Auth context & hook   | `src/context/AuthContext.jsx`                  |
| Socket context & hook | `src/context/SocketContext.jsx`                |
| Game events hook      | `src/hooks/useGameEvents.js`                   |
| Auth pages            | `src/pages/SignIn.jsx`, `src/pages/SignUp.jsx` |
| Route protection      | `src/components/ProtectedRoute.jsx`            |
| Auth styling          | `src/styles/auth.css`                          |

## API Response Format Expected

### Auth Endpoints

All auth endpoints should return:

```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string"
  },
  "token": "jwt-token",
  "expiresIn": 86400000
}
```

### Socket Authentication

Send token in auth handshake:

```javascript
// Already handled by SocketService
// Token from auth.service is sent automatically
```

## Event Flow

1. **User signs in** → Token stored in localStorage
2. **AuthContext updated** → `isAuthenticated = true`
3. **SocketProvider detects auth** → Connects to socket server
4. **Socket authenticated** → Token sent in handshake
5. **Game ready** → Emit/listen to game events

## Common Issues & Fixes

| Issue                         | Solution                                            |
| ----------------------------- | --------------------------------------------------- |
| Socket won't connect          | Check `VITE_SOCKET_URL` in `.local.env`             |
| Auth fails                    | Verify backend auth endpoints return correct format |
| Token expires                 | Backend refresh endpoint must return new token      |
| Socket disconnects on refresh | Client-side auto-reconnect should trigger           |

## Debug Tips

```javascript
// Check auth state
console.log(authService.user);
console.log(authService.getToken());

// Check socket connection
console.log(socketService.getIsConnected());
console.log(socketService.getId());

// Monitor socket events (add to SocketService)
socket.onAny((eventName, ...args) => {
  console.log(`[Socket Event] ${eventName}`, args);
});
```

## Production Checklist

- [ ] Backend auth endpoints tested
- [ ] Backend socket.io server running
- [ ] CORS configured on backend
- [ ] JWT token expiration set
- [ ] Token refresh working
- [ ] Socket reconnection tested
- [ ] Error handling implemented
- [ ] Environment variables configured
- [ ] Build tested: `npm run build`
- [ ] Game events flowing correctly

## Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Lint
npm run lint
```

## Next: Backend Implementation

See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for detailed backend requirements and examples.
