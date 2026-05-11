# Backend CORS & Auth Configuration Guide

## Important: CORS Setup Required

Your frontend is now correctly configured to send credentials with requests, but your **backend must be properly configured** to accept them.

## Backend CORS Configuration

### Express + Better Auth + Socket.io Setup

```typescript
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { auth } from "better-auth";

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend URL
    credentials: true, // CRITICAL: Allow credentials (cookies)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// CORS middleware - MUST include credentials: true
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow cookies and Authorization headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);

// Middleware
app.use(express.json());

// Initialize better-auth
export const authServer = auth({
  database: database({
    type: "postgres", // or mysql, sqlite
    url: process.env.DATABASE_URL,
  }),
  // CRITICAL: Add your frontend URL to trustedOrigins
  trustedOrigins: [
    "http://localhost:5173", // Development
    "http://localhost:3000", // Your API URL
  ],
  emailAndPassword: {
    enabled: true,
  },
  // ... other config
});

// Better Auth routes
app.use("/auth/*", authServer.handler);

// Socket.io middleware for JWT validation
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    // Verify token with your JWT secret
    const decoded = await verifyToken(token);
    socket.userId = decoded.sub;
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`);

  socket.on("game:start", (data) => {
    // Handle game start
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

httpServer.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
```

## Critical CORS Settings

Your backend **MUST have**:

```typescript
cors({
  origin: "http://localhost:5173", // ✅ Your frontend URL
  credentials: true, // ✅ CRITICAL - Allow cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

### Why `credentials: true` is Essential

- **Frontend sends**: `credentials: 'include'` in fetch requests
- **Backend responds with**: `Access-Control-Allow-Credentials: true`
- **Result**: Cookies and authorization headers are included

Without this, you'll get CORS errors even with proper origin configuration.

## Frontend Auth Session Endpoint

Your backend **must provide**:

```
GET /auth/session
```

This endpoint is called by socket.io to get the current session token.

**Response format:**

```json
{
  "session": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

Or if not authenticated:

```json
{
  "session": null
}
```

## Environment Variables

### Frontend (.local.env)

```
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/void_walker
AUTH_SECRET=your-secret-key-here-min-32-chars
JWT_SECRET=your-jwt-secret-key-here
NODE_ENV=development
PORT=3000
```

## Common CORS Errors & Solutions

### Error: "Access to XMLHttpRequest has been blocked by CORS policy"

**Cause**: Backend not sending `Access-Control-Allow-Origin` header

**Solution**: Ensure `cors()` middleware is applied to all routes:

```typescript
app.use(cors({ ... }));
```

### Error: "Credentials mode is 'include', but 'Access-Control-Allow-Credentials' header is missing"

**Cause**: Backend CORS has `credentials: false` or missing

**Solution**: Add `credentials: true`:

```typescript
cors({
  credentials: true, // ✅ Required
});
```

### Error: "The value of the 'Access-Control-Allow-Origin' header contains the invalid value..."

**Cause**: Backend origin is different from request origin

**Solution**: Ensure URLs match exactly:

- Frontend: `http://localhost:5173`
- Backend CORS origin: `http://localhost:5173`

Or use wildcard (development only):

```typescript
cors({
  origin: "*", // ⚠️ Development only!
  credentials: false,
});
```

## Socket.io Authentication Flow

1. **Frontend connects**: Sends auth in `socket.io({ auth: {...} })`
2. **Socket.io middleware runs**: Verifies JWT token
3. **Connection accepted**: Socket can now emit/listen to events
4. **On disconnect**: Socket is cleaned up

### Socket.io Error Handling

If authentication fails:

```typescript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    // Client will receive auth_error event
    return next(new Error("No token"));
  }

  next();
});

// On frontend, listen for auth errors
socket.on("auth_error", (error) => {
  console.error("Socket auth failed:", error);
  // Redirect to login or refresh auth
});
```

## Testing CORS Configuration

```bash
# Test basic CORS
curl -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS http://localhost:3000

# Test with credentials
curl -H "Origin: http://localhost:5173" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -c cookies.txt \
  http://localhost:3000/auth/session

# Test socket connection
# Use socket.io-client in Node.js or browser console
```

## Production Checklist

- [ ] Frontend URL in CORS origin is correct
- [ ] `credentials: true` is set
- [ ] `trustedOrigins` includes frontend URL
- [ ] `/auth/session` endpoint implemented
- [ ] JWT verification working
- [ ] Socket.io middleware validates tokens
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Test sign up → login → game connection flow

## Debugging

Enable debug logging:

```typescript
// Frontend
localStorage.debug = "*";

// Backend (socket.io)
const io = new SocketIOServer(httpServer, {
  transports: ["websocket", "polling"],
  debug: true,
});
```

Check browser console for:

- CORS errors in Network tab
- WebSocket connection status
- Session data in Application > Cookies/LocalStorage
