# Better Auth "Invalid Origin" Error - SOLUTION

## The Problem

Better-auth has a **strict origin validation** that rejects requests from origins not in its `trustedOrigins` list. This is different from CORS - it's better-auth's security layer.

Error message:
```json
{"message":"Invalid origin","code":"INVALID_ORIGIN"}
```

## The Solution

### Step 1: Find Your Exact Frontend Origin

Run this in your **browser console** while your frontend is running:

```javascript
console.log(window.location.origin);
```

**Example outputs:**
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (production)
- `http://192.168.x.x:5173` (if accessing from another machine)

### Step 2: Add to Backend `trustedOrigins`

Your backend's better-auth **MUST include** this exact origin:

```typescript
import { auth } from "better-auth";

export const authServer = auth({
  database: { /* ... */ },
  
  // ✅ CRITICAL: Must include your frontend URL exactly as shown
  trustedOrigins: [
    'http://localhost:5173',    // Add YOUR frontend origin here
    'http://localhost:3000',    // Also add the API base URL
  ],
  
  emailAndPassword: { enabled: true },
});
```

### Step 3: Restart Backend

After changing `trustedOrigins`, **restart your backend server**:

```bash
npm run dev
# or
node server.js
```

## Common Origin Issues

### Issue: Vite shows port 5173, but you put 3000

**Wrong:**
```typescript
trustedOrigins: ['http://localhost:3000']  // ❌ Wrong port
```

**Correct:**
```typescript
trustedOrigins: [
  'http://localhost:5173',   // ✅ Your Vite dev server
  'http://localhost:3000',   // ✅ Also add your API URL
]
```

### Issue: Using HTTPS but added HTTP

**Wrong:**
```typescript
trustedOrigins: ['http://localhost:5173']  // ❌ HTTP vs HTTPS mismatch
```

**Correct (if HTTPS):**
```typescript
trustedOrigins: ['https://localhost:5173']  // ✅ HTTPS
```

### Issue: Accessing from another machine (IP address)

If your frontend is at `http://192.168.1.100:5173`:

```typescript
trustedOrigins: [
  'http://192.168.1.100:5173',  // ✅ Your machine's IP
  'http://localhost:5173',       // ✅ Also add localhost
]
```

### Issue: Multiple environments (dev, staging, prod)

```typescript
trustedOrigins: [
  'http://localhost:5173',           // Development
  'http://localhost:3000',           // Development API
  'https://staging.example.com',     // Staging
  'https://app.example.com',         // Production
]
```

## Complete Better Auth Configuration Example

```typescript
import { auth } from "better-auth";
import { database } from "@better-auth/db";

export const authServer = auth({
  database: database({
    type: "postgres",
    url: process.env.DATABASE_URL,
  }),
  
  // ✅ THIS IS CRITICAL - Match your frontend origin exactly
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:5173",
  ],
  
  // Optional: Allow CORS preflight
  basePath: "/auth",
  
  emailAndPassword: {
    enabled: true,
    autoSignUpEmail: true,
  },
  
  // ... rest of config
});
```

With `.env`:
```
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://...
```

## How to Debug

### 1. Check what origin is being sent

Run in browser console:
```javascript
// See exact origin
console.log('Your origin:', window.location.origin);

// Test the auth endpoint
fetch('http://localhost:3000/auth/session', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

### 2. Check backend logs

Add logging to better-auth:

```typescript
export const authServer = auth({
  database: { /* ... */ },
  trustedOrigins: ['http://localhost:5173'],
  
  // Enable debug logging
  debug: true,  // Shows validation logs
});

// Or in middleware:
app.use((req, res, next) => {
  console.log('📍 Request Origin:', req.get('origin'));
  console.log('📍 Request Host:', req.get('host'));
  next();
});
```

### 3. Verify backend is configured correctly

```bash
# Frontend terminal
npm run dev
# → Running at http://localhost:5173

# Backend terminal
node server.js
# → Check logs for trustedOrigins configuration
```

Then open browser console and run:
```javascript
console.log('My origin:', window.location.origin);
// Should print: My origin: http://localhost:5173
```

## Environment-Based Configuration

**Recommended approach:**

`.env.development`
```
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

`.env.production`
```
FRONTEND_URL=https://app.example.com
VITE_API_URL=https://api.example.com
```

Backend:
```typescript
const trustedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173'];

export const authServer = auth({
  database: { /* ... */ },
  trustedOrigins,
  // ... rest
});
```

## Socket.io + Better Auth

If using socket.io, ensure it also has CORS configured:

```typescript
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});
```

## Common Fixes Checklist

- [ ] Run `console.log(window.location.origin)` in browser
- [ ] Add that exact origin to backend `trustedOrigins`
- [ ] Restart backend server
- [ ] Clear browser cache (Ctrl+Shift+Delete)
- [ ] Check protocol (http vs https)
- [ ] Check port number matches exactly
- [ ] Test again with `/auth/session` endpoint

## Still Getting Error?

Run this comprehensive test in browser console:

```javascript
async function diagnose() {
  console.log('=== CORS Diagnosis ===');
  console.log('Frontend Origin:', window.location.origin);
  console.log('API URL:', import.meta.env.VITE_API_URL);
  
  try {
    const res = await fetch(
      (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/auth/session',
      { credentials: 'include' }
    );
    console.log('Response Status:', res.status);
    console.log('CORS Headers:');
    console.log('  Access-Control-Allow-Origin:', res.headers.get('Access-Control-Allow-Origin'));
    console.log('  Access-Control-Allow-Credentials:', res.headers.get('Access-Control-Allow-Credentials'));
    
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

diagnose();
```

Share the output and I can help further!
