# 🚀 Quick Start Guide - Deploy in 10 Minutes

This guide will get your TikTok OAuth proxy up and running on Netlify ASAP.

## ✅ Pre-Launch Checklist

Before deploying, make sure you have:

- [ ] TikTok Developer account created at https://developers.tiktok.com/
- [ ] Netlify account created at https://www.netlify.com/
- [ ] GitHub account (you already have this!)
- [ ] Your TikTok app created and Client Key/Secret ready

## 📋 Step-by-Step Deployment

### 1️⃣ Register TikTok App (5 minutes)

1. Go to https://developers.tiktok.com/apps/
2. Click **"Create an App"**
3. Fill in:
   - App Name: `MyTikTokAnalytics`
   - Description: `TikTok analytics dashboard for creators`
4. Click **"Add Products"** → Select **"Login Kit"**
5. **IMPORTANT**: Save your Client Key and Client Secret (you'll need these!)

### 2️⃣ Deploy to Netlify (3 minutes)

#### Option A: Deploy via Netlify Dashboard (Easiest)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial TikTok OAuth proxy setup"
   git push origin main
   ```

2. **Deploy on Netlify**:
   - Go to https://app.netlify.com/
   - Click **"Add new site"** → **"Import an existing project"**
   - Choose **GitHub** and authorize
   - Select this repository: `mytiktok-oauth-proxy`
   - Click **"Deploy site"**
   - Wait ~30 seconds for deployment to complete

3. **Note your Netlify URL**:
   - It will be something like: `https://YOUR-SITE-NAME.netlify.app`
   - You can customize this in Site Settings if you want

#### Option B: Deploy via CLI (For Advanced Users)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify init
netlify deploy --prod
```

### 3️⃣ Configure Environment Variables (2 minutes)

1. In Netlify Dashboard, go to: **Site Settings** → **Environment variables**

2. Click **"Add a variable"** and add these 4 variables:

| Key | Value | Example |
|-----|-------|---------|
| `TIKTOK_CLIENT_KEY` | Your TikTok Client Key | `awxxxxxxxxxxxxxxxx` |
| `TIKTOK_CLIENT_SECRET` | Your TikTok Client Secret | `xxxxxxxxxxxxxxxx` |
| `REDIRECT_URI` | Your Netlify function URL | `https://your-site.netlify.app/.netlify/functions/tiktok_auth` |
| `ALLOWED_ORIGIN` | Your GitHub Pages URL | `https://yourusername.github.io` |

3. Click **"Save"**

4. **Trigger a new deployment**:
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

### 4️⃣ Configure TikTok Redirect URI (1 minute)

1. Go back to https://developers.tiktok.com/apps/
2. Click on your app → **Login Kit** → **Settings**
3. Under **"Redirect URIs"**, click **"Add redirect URI"**
4. Enter your Netlify function URL:
   ```
   https://your-site-name.netlify.app/.netlify/functions/tiktok_auth
   ```
5. Click **"Save"**

## 🧪 Test Your Deployment

### Quick Test (No Code Required)

1. Open this URL in your browser (replace with your values):
   ```
   https://www.tiktok.com/v2/auth/authorize/?client_key=YOUR_CLIENT_KEY&scope=user.info.basic&response_type=code&redirect_uri=https://your-site.netlify.app/.netlify/functions/tiktok_auth&state=test123
   ```

2. You should be redirected to TikTok login

3. After logging in, you should see a JSON response with your access token!

### Common Issues

**"Invalid redirect_uri" error**:
- Make sure the redirect URI in TikTok Developer Portal matches EXACTLY (including https://)
- Check there are no extra spaces or characters

**"Server configuration error"**:
- Verify all 4 environment variables are set in Netlify
- Make sure you triggered a new deployment after adding env vars

**CORS errors**:
- Update `ALLOWED_ORIGIN` to match your GitHub Pages URL exactly
- Make sure your GitHub Pages uses HTTPS

## 🎨 Next Steps: Frontend Integration

Now that your OAuth proxy is working, integrate it with your GitHub Pages site:

### 1. Create Login Button

Add to your `index.html`:

```html
<button onclick="loginWithTikTok()">Login with TikTok</button>
```

### 2. Add JavaScript

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
  
  const clientKey = 'YOUR_TIKTOK_CLIENT_KEY'; // Your actual client key
  const redirectUri = 'https://your-site.netlify.app/.netlify/functions/tiktok_auth';
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

### 3. Handle OAuth Callback

After authentication, TikTok redirects to your Netlify function, which returns the token. You'll need to:

1. Read the token from the URL or response
2. Store it in localStorage
3. Redirect back to your main app

See the full README.md for complete frontend integration examples!

## 📊 Verify Everything Works

✅ Checklist:

- [ ] TikTok app created and Login Kit added
- [ ] Netlify site deployed successfully
- [ ] All 4 environment variables configured
- [ ] Redirect URI added to TikTok Developer Portal
- [ ] Test URL redirects to TikTok login
- [ ] After login, receive JSON with access_token

## 🆘 Need Help?

- Check `README.md` for detailed troubleshooting
- Review Netlify function logs: **Netlify Dashboard → Functions → tiktok_auth**
- Check TikTok Developer Portal for API status

## 🎉 Success!

Your TikTok OAuth proxy is now live! You can now:
- Authenticate users via TikTok
- Access TikTok user data
- Build analytics features
- Scale without server costs

---

**Deployed URL**: `https://your-site-name.netlify.app/.netlify/functions/tiktok_auth`

Keep this URL handy - you'll use it in your frontend code!

