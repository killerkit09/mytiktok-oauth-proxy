# 🔒 Local HTTPS Testing with ngrok

## The Problem
TikTok requires **HTTPS** for all redirect URIs, including development/testing. They don't allow `http://localhost`.

## Solution: Use ngrok (Free HTTPS Tunnel)

### Step 1: Install ngrok

1. Go to: https://ngrok.com/download
2. Sign up for free account
3. Download ngrok for Windows
4. Extract to a folder (e.g., `C:\ngrok\`)

### Step 2: Setup ngrok

```bash
# Open PowerShell or Command Prompt
cd C:\ngrok

# Authenticate (get your token from https://dashboard.ngrok.com/get-started/your-authtoken)
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 3: Start Your Local Server

In your project directory:
```bash
npm run dev
```

Keep this running!

### Step 4: Start ngrok Tunnel (New Terminal)

Open a **NEW** terminal/PowerShell window:

```bash
# Navigate to ngrok folder
cd C:\ngrok

# Create HTTPS tunnel to localhost:8888
ngrok http 8888
```

You'll see output like:
```
Session Status                online
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8888
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### Step 5: Update Configuration

1. **Update `.env`:**
   ```env
   TIKTOK_CLIENT_KEY=your_client_key_here
   TIKTOK_CLIENT_SECRET=your_client_secret_here
   REDIRECT_URI=https://abc123.ngrok-free.app/.netlify/functions/tiktok_auth
   ALLOWED_ORIGIN=*
   ```

2. **Update `index.html` (line 150):**
   ```javascript
   const CONFIG = {
       TIKTOK_CLIENT_KEY: 'YOUR_CLIENT_KEY',
       OAUTH_PROXY_URL: 'https://abc123.ngrok-free.app/.netlify/functions/tiktok_auth',
       REDIRECT_URI: 'https://abc123.ngrok-free.app/.netlify/functions/tiktok_auth',
       SCOPE: 'user.info.basic'
   };
   ```

3. **Restart your dev server:**
   ```bash
   # Stop npm run dev (Ctrl+C)
   # Start again
   npm run dev
   ```

### Step 6: Add to TikTok Developer Portal

1. Go to: https://developers.tiktok.com/apps/
2. Your App → Login Kit → Settings
3. Add redirect URI:
   ```
   https://abc123.ngrok-free.app/.netlify/functions/tiktok_auth
   ```
4. Save

### Step 7: Test

Open in browser:
```
https://abc123.ngrok-free.app
```

Click "Continue with TikTok" and test!

---

## ⚠️ Important Notes

- **ngrok URL changes** each time you restart (free plan)
- Update all configs when ngrok URL changes
- Keep both terminals running (npm run dev + ngrok)
- ngrok free plan works fine for testing

---

## 🔄 When ngrok URL Changes

Every time you restart ngrok, you get a new URL. You'll need to:

1. Update `.env` REDIRECT_URI
2. Update `index.html` CONFIG
3. Update TikTok Developer Portal redirect URI
4. Restart `npm run dev`

To avoid this, upgrade to ngrok paid plan for static domains ($8/month) or just deploy to Netlify!


