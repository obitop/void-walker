# Better Auth + Socket.io Setup Complete ✅

Your project is now configured with **better-auth** for enterprise-grade authentication and **socket.io** for real-time communication.

## What is Better Auth?

**Better Auth** is a comprehensive, framework-agnostic authentication framework for TypeScript. It eliminates the need to build custom authentication from scratch.

### Key Features:

- ✅ Email & Password authentication
- ✅ OAuth 2.0 / Social login
- ✅ Session management
- ✅ Multi-device/session support
- ✅ Automatic token refresh
- ✅ TypeScript support
- ✅ Pluggable database adapters
- ✅ Enterprise features (2FA, SSO, Organizations)

## Project Structure

```
src/
├── services/
│   ├── auth-client.js        [NEW - Better Auth client]
│   └── socket.js             [UPDATED - Uses better-auth]
├── context/
│   ├── AuthContext.jsx       [UPDATED - Better Auth integration]
│   └── SocketContext.jsx     [UPDATED - Uses better-auth session]
├── hooks/
│   ├── useAuth.js            [NEW - Auth hook from better-auth]
│   ├── useSocket.js          [NEW - Socket hook]
│   └── useGameEvents.js      [Works with both]
├── pages/
│   ├── SignIn.jsx            [UPDATED - Uses better-auth]
│   └── SignUp.jsx            [UPDATED - Uses better-auth]
└── components/
    ├── ProtectedRoute.jsx    [UPDATED - Uses better-auth]
    └── GameEventExample.jsx  [UPDATED]
```

## Setup Instructions

### 1. Environment Configuration

```bash
cp .env.example .local.env
```

Update `.local.env`:

```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Backend Implementation

Your backend needs to:

1. **Initialize better-auth server**
2. **Implement authentication endpoints**
3. **Setup socket.io with JWT validation**

## Usage Examples

### Authentication

```javascript
import { useAuth } from "@/hooks/useAuth";

function LoginComponent() {
  const { data: session, isPending, signIn, signOut } = useAuth();

  const handleLogin = async (email, password) => {
    const { data, error } = await signIn.email({ email, password });

    if (error) {
      console.error("Login failed:", error);
      return;
    }

    // User logged in! session.user is available
  };

  if (!session) {
    return (
      <button onClick={() => handleLogin("user@example.com", "password")}>
        Login
      </button>
    );
  }

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
}
```

### Real-time Communication

```javascript
import { useGameEvents } from "@/hooks/useGameEvents";

function GameComponent() {
  const { isConnected, startGame, movePlayer, onGameUpdate } = useGameEvents();

  useEffect(() => {
    if (isConnected) {
      startGame({ level: 1 });
    }
  }, [isConnected, startGame]);

  useEffect(() => {
    const unsubscribe = onGameUpdate((state) => {
      // Handle game state updates
    });
    return unsubscribe;
  }, [onGameUpdate]);

  return (
    <div>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <button onClick={() => movePlayer("up", { x: 100, y: 200 })}>Move</button>
    </div>
  );
}
```

## Backend Requirements

### Basic Setup Example (Node.js + Express)

```typescript
import { auth } from "better-auth";
import { database } from "@better-auth/db";

export const authServer = auth({
  database: database({
    type: "postgres",
    url: process.env.DATABASE_URL,
  }),
  trustedOrigins: ["http://localhost:5173"],
  emailAndPassword: {
    enabled: true,
  },
});
```

### Authentication Endpoints

Better Auth automatically provides these endpoints:

- `POST /auth/sign-up/email` - Sign up
- `POST /auth/sign-in/email` - Sign in
- `POST /auth/sign-out` - Sign out
- `POST /auth/refresh` - Refresh token
- `GET /auth/session` - Get current session

### Socket.io Authentication

```typescript
import { jwtVerify } from "jose";

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    socket.userId = payload.sub;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});
```

## How Session Management Works

1. **User signs in** → Better Auth generates JWT
2. **Frontend stores session** → In cookies or local storage
3. **Socket.io connects** → Token automatically sent in auth handshake
4. **Backend validates token** → Accepts connection if valid
5. **Token expires** → Better Auth auto-refreshes before expiration
6. **Reconnect happens** → Socket gets new token automatically

## Available Hooks

### useAuth()

```javascript
const {
  data: session, // Current user session
  isPending, // Loading state
  error, // Error object
  signIn, // Sign in methods
  signUp, // Sign up methods
  signOut, // Sign out method
  changePassword, // Change password
  updateProfile, // Update profile
} = useAuth();
```

### useSocket()

```javascript
const {
  isConnected, // Connection status
  error, // Connection error
  emit, // Send event
  on, // Listen to event
  once, // Listen once
  off, // Stop listening
  socket, // Raw socket instance
} = useSocket();
```

### useGameEvents()

Pre-configured game-specific events:

- `startGame()`, `endGame()`, `pauseGame()`, `resumeGame()`
- `movePlayer()`, `playerAction()`, `fireWeapon()`
- `onGameUpdate()`, `onPlayerUpdate()`, `onEnemyUpdate()`, `onGameError()`

## Protected Routes

```javascript
<Route path="/game" element={<ProtectedRoute element={<GamePage />} />} />
```

Routes redirect to `/signin` if not authenticated.

## Common Patterns

### Check Authentication

```javascript
const { data: session } = useAuth();

if (!session) {
  return <Navigate to="/signin" />;
}
```

### Handle Loading

```javascript
const { data: session, isPending } = useAuth();

if (isPending) {
  return <LoadingSpinner />;
}
```

### Error Handling

```javascript
const { data: session, error } = useAuth();

if (error) {
  return <div className="error">{error.message}</div>;
}
```

## Key Differences from Previous Setup

| Aspect           | Before                | After                 |
| ---------------- | --------------------- | --------------------- |
| Auth Service     | Custom implementation | Better Auth framework |
| Token Management | Manual refresh logic  | Automatic             |
| Session Handling | Custom state          | Better Auth sessions  |
| Database         | Manual setup          | Auto migrations       |
| Security         | Basic                 | Enterprise-grade      |
| OAuth Support    | Not included          | Built-in              |
| Type Safety      | Partial               | Full TypeScript       |

## Next Steps

1. **Setup Backend**: Initialize better-auth server in your backend
2. **Database**: Configure PostgreSQL, MySQL, or SQLite
3. **Environment Variables**: Set `DATABASE_URL` on backend
4. **Test Auth Flow**: Sign up → Sign in → Check game page
5. **Implement Game Logic**: Use `useGameEvents()` hook

## Resources

- **Better Auth Docs**: https://better-auth.com/docs
- **Socket.io Docs**: https://socket.io/docs/
- **Project Files**: See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)

## Support

For issues or questions:

- Check better-auth docs at https://better-auth.com
- Review socket.io examples at https://socket.io/docs/examples/
- See QUICK_REFERENCE.md for common patterns
