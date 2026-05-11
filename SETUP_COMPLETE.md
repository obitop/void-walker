# Socket.io + Better Auth Setup Complete ✅

## What's Been Installed & Configured

### Dependencies

- ✅ `socket.io-client` - WebSocket client for real-time communication
- ✅ `better-auth` - Authentication management

### Frontend Architecture

#### Services (`src/services/`)

1. **auth.js** - Handles all authentication operations
   - Sign up, sign in, sign out
   - Token refresh with auto-expiration handling
   - User session persistence
2. **socket.js** - WebSocket client with socket.io
   - Auto-reconnection (5 attempts)
   - Token-based authentication
   - Event emission & listening

#### Context Providers (`src/context/`)

1. **AuthContext.jsx** - Authentication state management
   - Provides `useAuth()` hook
   - Manages user session & loading states
2. **SocketContext.jsx** - WebSocket connection management
   - Provides `useSocket()` hook
   - Auto-connects when authenticated

#### Components & Pages

- **ProtectedRoute.jsx** - Route protection wrapper
- **SignIn.jsx** - Login page
- **SignUp.jsx** - Registration page
- **Updated App.jsx** - Integrated routing with auth

#### Hooks

- **useGameEvents.js** - Simplified game event API
  - Game lifecycle: `startGame()`, `endGame()`, `pauseGame()`, `resumeGame()`
  - Player actions: `movePlayer()`, `playerAction()`, `fireWeapon()`
  - Event listeners: `onGameUpdate()`, `onPlayerUpdate()`, etc.

#### Styles

- **auth.css** - Authentication UI styling
- **index.css** - Loading states & shared styles

## Quick Start

### 1. Create `.local.env`

```bash
cp .env.example .local.env
```

Update with your backend URLs:

```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### 2. Run the App

```bash
npm run dev
```

### 3. Test Auth Flow

- Navigate to `/signup` - Create an account
- This will trigger socket connection after auth
- Navigate to `/game` - Protected route

## Usage Examples

### In Your Components

#### Auth Example

```javascript
import { useAuth } from "@/context/AuthContext";

function Profile() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

#### Socket Communication Example

```javascript
import { useGameEvents } from "@/hooks/useGameEvents";

function GameComponent() {
  const { movePlayer, onPlayerUpdate, isConnected } = useGameEvents();

  useEffect(() => {
    const unsubscribe = onPlayerUpdate((playerData) => {
      console.log("Player updated:", playerData);
    });

    return unsubscribe;
  }, [onPlayerUpdate]);

  const handleMove = (direction) => {
    movePlayer(direction, { x: 100, y: 200 });
  };

  return (
    <div>
      <p>Connected: {isConnected ? "✓" : "✗"}</p>
      <button onClick={() => handleMove("up")}>Move Up</button>
    </div>
  );
}
```

#### Custom Socket Events

```javascript
import { useSocket } from "@/context/SocketContext";

function CustomEvents() {
  const { emit, on, off } = useSocket();

  useEffect(() => {
    const handler = (data) => {
      console.log("Received:", data);
    };

    on("custom:event", handler);

    return () => off("custom:event", handler);
  }, [on, off]);

  const send = () => {
    emit("custom:event", { message: "Hello" });
  };

  return <button onClick={send}>Send Event</button>;
}
```

## Backend Requirements

### Authentication Endpoints

Your backend must implement these endpoints:

#### POST `/api/auth/signup`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

Response:

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "jwt-token-here",
  "expiresIn": 86400000
}
```

#### POST `/api/auth/signin`

Request:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response: (same as signup)

#### POST `/api/auth/signout`

Headers: `Authorization: Bearer {token}`

Response:

```json
{ "success": true }
```

#### POST `/api/auth/refresh`

Headers: `Authorization: Bearer {token}`

Response:

```json
{
  "token": "new-jwt-token",
  "expiresIn": 86400000
}
```

#### GET `/api/auth/user`

Headers: `Authorization: Bearer {token}`

Response:

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Socket.io Authentication

Implement middleware to verify JWT on socket connection:

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const user = verifyJWT(token);
    socket.userId = user.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});
```

### Recommended Game Events

These are pre-configured in `useGameEvents()`:

**Client → Server:**

- `game:start` - Start game
- `game:end` - End game
- `game:pause` - Pause game
- `game:resume` - Resume game
- `player:move` - Move player
- `player:action` - Generic player action
- `player:fire` - Fire weapon

**Server → Client:**

- `game:update` - Game state update
- `game:state` - Game state change
- `player:update` - Player data update
- `enemy:update` - Enemy data update
- `game:error` - Game error

## Project Structure

```
src/
├── components/
│   ├── GameCanvas.jsx
│   ├── HUD.jsx
│   ├── MobileControls.jsx
│   ├── ProtectedRoute.jsx        [NEW]
├── context/
│   ├── AuthContext.jsx           [NEW]
│   └── SocketContext.jsx         [NEW]
├── game/
│   ├── GameEngine.js
│   ├── utils.js
│   └── systems/
├── hooks/
│   └── useGameEvents.js          [NEW]
├── pages/
│   ├── Home.jsx
│   ├── GamePage.jsx
│   ├── SignIn.jsx                [NEW]
│   └── SignUp.jsx                [NEW]
├── services/
│   ├── auth.js                   [NEW]
│   └── socket.js                 [NEW]
├── styles/
│   ├── auth.css                  [NEW]
│   └── ...
├── App.jsx                       [UPDATED]
└── main.jsx                      [UPDATED]
```

## Troubleshooting

### Socket won't connect

- [ ] Check backend is running on correct port
- [ ] Verify `VITE_SOCKET_URL` in .local.env
- [ ] Check browser console for CORS errors
- [ ] Ensure auth token is being sent

### Auth redirects to signin

- [ ] Verify backend auth endpoints are working
- [ ] Check response format matches expected structure
- [ ] Look for network errors in browser dev tools

### Token refresh issues

- [ ] Backend refresh endpoint should return new token
- [ ] Verify expiration time in response

## Next Steps

1. **Implement backend** following requirements above
2. **Update game components** to use `useGameEvents()`
3. **Test full auth flow** locally
4. **Add error handling** for failed operations
5. **Implement game state sync** via socket events

## Documentation

See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for detailed backend integration guide.
