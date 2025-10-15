# TikTok OAuth Proxy for GitHub Pages

A secure serverless OAuth proxy that enables TikTok Login Kit integration for static sites hosted on GitHub Pages.

## 🎯 Purpose

GitHub Pages cannot securely handle OAuth flows that require client secrets. This Netlify Function acts as a secure proxy to handle the TikTok token exchange while keeping your credentials safe.

## 🏗️ Architecture

```
GitHub Pages (Frontend)
    ↓ (initiates OAuth)
TikTok Authorization
    ↓ (redirects with code)
Netlify Function (This Proxy)
    ↓ (exchanges code for token)
TikTok API
    ↓ (returns access token)
GitHub Pages (Frontend receives token)
```

## ✨ Features

- ✅ Secure token exchange with TikTok API
- ✅ CSRF protection using state parameter
- ✅ CORS configuration for GitHub Pages
- ✅ Comprehensive error handling
- ✅ Environment variable validation
- ✅ Production-ready logging

## 🚀 Deployment Guide

### Prerequisites

1. TikTok Developer Account: https://developers.tiktok.com/
2. Netlify Account: https://www.netlify.com/
3. GitHub Account (for both repositories)

### Step 1: Register TikTok App

1. Go to https://developers.tiktok.com/apps/
2. Click "Create an App"
3. Fill in app details:
   - **App Name**: MyTikTokAnalytics
   - **Description**: TikTok analytics dashboard
4. Add Login Kit product to your app
5. Note down your **Client Key** and **Client Secret**

### Step 2: Deploy to Netlify

#### Option A: Deploy from GitHub (Recommended)

1. Push this repository to GitHub
2. Go to Netlify Dashboard
3. Click "Add new site" > "Import an existing project"
4. Choose GitHub and select this repository
5. Click "Deploy site"

#### Option B: Deploy with Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### Step 3: Configure Environment Variables

1. In Netlify Dashboard, go to: **Site Settings > Environment Variables**
2. Add the following variables:

```
TIKTOK_CLIENT_KEY=your_actual_client_key
TIKTOK_CLIENT_SECRET=your_actual_client_secret
REDIRECT_URI=https://your-site-name.netlify.app/.netlify/functions/tiktok_auth
ALLOWED_ORIGIN=https://yourusername.github.io
```

**Important:** Replace the placeholder values with your actual values!

### Step 4: Configure TikTok Redirect URI

1. Go back to TikTok Developer Portal
2. Navigate to your app > Login Kit settings
3. Add your Netlify function URL as a redirect URI:
   ```
   https://your-site-name.netlify.app/.netlify/functions/tiktok_auth
   ```
4. Save changes

### Step 5: Update Your GitHub Pages Frontend

Your frontend should initiate the OAuth flow like this:

```javascript
// Generate random state for CSRF protection
function generateState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Start TikTok OAuth flow
function loginWithTikTok() {
  const state = generateState();
  localStorage.setItem('tiktok_oauth_state', state);
  
  const clientKey = 'YOUR_TIKTOK_CLIENT_KEY';
  const redirectUri = 'https://your-site-name.netlify.app/.netlify/functions/tiktok_auth';
  const scope = 'user.info.basic';
  
  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?` +
    `client_key=${clientKey}` +
    `&scope=${scope}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;
  
  window.location.href = authUrl;
}
```

Then handle the callback in your OAuth callback page:

```javascript
// oauth-callback.html
async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  // Verify state for CSRF protection
  const savedState = localStorage.getItem('tiktok_oauth_state');
  if (state !== savedState) {
    console.error('State mismatch - possible CSRF attack');
    return;
  }
  
  // Exchange code for token via your Netlify function
  const response = await fetch(
    `https://your-site-name.netlify.app/.netlify/functions/tiktok_auth?code=${code}&state=${state}`
  );
  
  const data = await response.json();
  
  if (data.access_token) {
    // Store token securely
    localStorage.setItem('tiktok_access_token', data.access_token);
    localStorage.setItem('tiktok_open_id', data.open_id);
    
    // Redirect to main app
    window.location.href = '/';
  } else {
    console.error('Authentication failed:', data.error);
  }
}

handleCallback();
```

## 🔒 Security Features

- **HTTPS Only**: All communications are encrypted
- **CSRF Protection**: State parameter validation prevents cross-site request forgery
- **Secret Management**: Client secret stored securely in Netlify environment variables
- **CORS Restrictions**: Only your specified domain can access the function
- **Error Sanitization**: Sensitive error details are not exposed to clients

## 🧪 Testing

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual credentials in `.env`

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run locally with Netlify Dev:
   ```bash
   npm run dev
   ```

5. Test the function:
   ```
   http://localhost:8888/.netlify/functions/tiktok_auth?code=test_code&state=test_state
   ```

### Production Testing

1. Get a real authorization code by manually going through OAuth flow
2. Test your deployed function with the real code
3. Verify you receive a valid access token

## 📝 API Response Format

### Success Response (200)
```json
{
  "access_token": "act.example123...",
  "expires_in": 86400,
  "open_id": "user_open_id_example",
  "refresh_token": "rft.example123...",
  "scope": "user.info.basic",
  "token_type": "Bearer",
  "state": "your_state_value"
}
```

### Error Response (400/500)
```json
{
  "error": "invalid_grant",
  "error_description": "Authorization code is invalid or expired"
}
```

## 🐛 Troubleshooting

### "Missing authorization code" error
- Check that TikTok is redirecting to the correct URL
- Verify redirect URI in TikTok Developer Portal matches exactly

### "CSRF protection failed" error
- Ensure you're sending the state parameter
- Check that state is generated and stored before OAuth flow

### "Server configuration error"
- Verify all environment variables are set in Netlify
- Check variable names match exactly (case-sensitive)

### CORS errors in browser
- Update `ALLOWED_ORIGIN` environment variable to match your GitHub Pages URL
- Ensure your GitHub Pages site uses HTTPS

### "TikTok API is not responding"
- Check TikTok API status
- Verify your internet connection
- Try again after a few minutes

## 📚 Resources

- [TikTok Login Kit Documentation](https://developers.tiktok.com/doc/login-kit-web/)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [TikTok API Reference](https://developers.tiktok.com/doc/web-api-reference/)

## 📄 License

ISC

## 🤝 Contributing

Issues and pull requests are welcome!

---

Made with ❤️ for static site authentication