# Backend Integration Setup

This frontend has been configured with:

- **Socket.io Client** for real-time WebSocket communication
- **Better Auth** for authentication management
- **React Context** for state management

## Environment Variables

Copy `.env.example` to `.local.env` and configure:

```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## Services

### Auth Service (`src/services/auth.js`)

Handles all authentication operations:

- Sign up
- Sign in
- Sign out
- Token refresh
- User session management

**Usage:**

```javascript
import { authService } from "@/services/auth";

await authService.signIn(email, password);
await authService.signOut();
const user = authService.user;
```

### Socket Service (`src/services/socket.js`)

WebSocket client using socket.io:

- Auto-reconnection
- Token-based authentication
- Event management
- Connection status tracking

**Usage:**

```javascript
import { socketService } from "@/services/socket";

socketService.emit("game:start", gameData);
socketService.on("game:update", (data) => {
  // Handle update
});
```

## Context Providers

### AuthContext (`src/context/AuthContext.jsx`)

Provides authentication state and methods:

- `user` - Current authenticated user
- `isAuthenticated` - Auth status
- `isLoading` - Loading state
- `error` - Error message
- `signUp()`, `signIn()`, `signOut()` - Auth methods

### SocketContext (`src/context/SocketContext.jsx`)

Provides socket connection and methods:

- `isConnected` - Connection status
- `error` - Connection error
- `emit()` - Send events
- `on()` - Listen to events
- `once()` - Listen once
- `off()` - Stop listening

## Hooks

### useAuth()

```javascript
import { useAuth } from "@/context/AuthContext";

export function MyComponent() {
  const { user, isAuthenticated, signIn } = useAuth();
  // ...
}
```

### useSocket()

```javascript
import { useSocket } from "@/context/SocketContext";

export function MyComponent() {
  const { isConnected, emit, on } = useSocket();
  // ...
}
```

## Protected Routes

Use `<ProtectedRoute>` to protect pages that require authentication:

```javascript
<Route path="/game" element={<ProtectedRoute element={<GamePage />} />} />
```

## Backend Requirements

Your backend must implement:

### Auth Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/user` - Get current user

### Socket Events

- `connect` - Initial connection (handled by socket.io)
- `auth_error` - Authentication error on socket
- Custom game events as needed

### Response Format

Auth responses should return:

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "jwt-token",
  "expiresIn": 86400000
}
```

## Example Backend Implementation

### Auth Route Handler (Node.js/Express)

```javascript
app.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;
  // Validate credentials
  const user = await User.findByEmail(email);
  if (!user || !user.validatePassword(password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateJWT(user);
  res.json({
    user: user.toJSON(),
    token,
    expiresIn: 86400000,
  });
});
```

### Socket.io Authentication (Node.js)

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

## Common Patterns

### Game Update via Socket

```javascript
const GamePage = () => {
  const { emit, on } = useSocket();

  useEffect(() => {
    on("game:update", (gameState) => {
      // Update game
    });

    return () => off("game:update");
  }, [on]);

  const startGame = () => {
    emit("game:start", { level: 1 });
  };
};
```

### Protected Component

```javascript
const Dashboard = () => {
  const { user, signOut } = useAuth();

  if (!user) return <Navigate to="/signin" />;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};
```

## Troubleshooting

### Socket not connecting

- Check `VITE_SOCKET_URL` environment variable
- Verify backend is running on the correct port
- Check browser console for CORS errors

### Auth token not persisting

- Clear browser local storage
- Check that backend returns `token` in response
- Verify token is being saved in localStorage

### Infinite loading

- Check `isLoading` state in console
- Verify auth endpoint returns correct response
- Check network tab for failed requests
