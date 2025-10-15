# 🧪 Local Testing Guide - TikTok Login Kit

## Quick Start (5 Minutes)

### Step 1: Get TikTok Credentials (2 min)

1. Go to: https://developers.tiktok.com/apps/
2. Create a new app or select existing app
3. Add **Login Kit** product
4. Copy your **Client Key** and **Client Secret**

### Step 2: Configure Local Environment (1 min)

1. Open `.env` file in this project
2. Replace the placeholder values:
   ```env
   TIKTOK_CLIENT_KEY=awxxxxxxxxx  # Your actual client key
   TIKTOK_CLIENT_SECRET=xxxxxxxxx  # Your actual client secret
   REDIRECT_URI=http://localhost:8888/.netlify/functions/tiktok_auth
   ALLOWED_ORIGIN=*
   ```

### Step 3: Add Local Redirect URI to TikTok (1 min)

⚠️ **IMPORTANT**: TikTok requires you to whitelist redirect URIs

1. Go to: https://developers.tiktok.com/apps/
2. Select your app → **Login Kit** → **Settings**
3. Under "Redirect URIs", click **"Add redirect URI"**
4. Add this URL:
   ```
   http://localhost:8888/.netlify/functions/tiktok_auth
   ```
5. Click **"Save"**

**Note**: TikTok normally requires HTTPS, but localhost HTTP is allowed for development.

### Step 4: Update Client Key in HTML (1 min)

1. Open `index.html`
2. Find line **~150** (search for `TIKTOK_CLIENT_KEY`)
3. Replace `YOUR_TIKTOK_CLIENT_KEY_HERE` with your actual client key:
   ```javascript
   const CONFIG = {
       TIKTOK_CLIENT_KEY: 'awxxxxxxxxx', // Your actual client key
       // ... rest of config
   };
   ```

### Step 5: Start Local Server (30 sec)

```bash
npm run dev
```

You should see:
```
◈ Netlify Dev ◈
◈ Starting Netlify Dev with netlify.toml
◈ Functions server is listening on 8888
```

### Step 6: Test! (30 sec)

1. Open browser to: **http://localhost:8888**
2. Click **"Continue with TikTok"** button
3. Login with your TikTok account
4. After authorization, you'll be redirected back
5. You should see your access token! ✅

---

## 🔍 Troubleshooting

### ❌ "404 Not Found" at localhost:8888

**Solution**: There IS a page now! Make sure `index.html` exists in your project root.

```bash
# Check if index.html exists
dir index.html   # Windows
ls index.html    # Mac/Linux
```

### ❌ "Please update TIKTOK_CLIENT_KEY" message

**Solution**: Update the `TIKTOK_CLIENT_KEY` in `index.html` around line 150:

```javascript
TIKTOK_CLIENT_KEY: 'awxxxxxxxxx', // Your actual key, not the placeholder
```

### ❌ "Invalid redirect_uri" from TikTok

**Solution**: 
1. Make sure you added `http://localhost:8888/.netlify/functions/tiktok_auth` to TikTok Developer Portal
2. The URI must match EXACTLY (no trailing slash, correct port)
3. Wait a few seconds after saving in TikTok portal

### ❌ "Server configuration error"

**Solution**: Check your `.env` file:
- Make sure all 4 variables are filled in
- No extra spaces around the `=` sign
- No quotes around the values
- Restart `npm run dev` after changing `.env`

### ❌ CORS errors in browser console

**Solution**: 
- Make sure `ALLOWED_ORIGIN=*` in your `.env` file
- Restart `npm run dev` after changes

### ❌ "State mismatch - possible CSRF attack"

**Solution**: 
- Clear your browser's localStorage
- Try again with fresh OAuth flow
- Don't bookmark or reuse OAuth callback URLs

### ❌ Function not found

**Solution**:
```bash
# Stop the dev server (Ctrl+C)
# Verify netlify.toml has correct directory
# Restart
npm run dev
```

---

## 📋 File Structure for Local Testing

```
mytiktok-oauth-proxy/
├── index.html                    ← Test page (NEW!)
├── .env                          ← Your credentials (NEW!)
├── netlify/
│   └── functions/
│       └── tiktok_auth.js        ← OAuth proxy function
├── netlify.toml                  ← Config
├── package.json                  ← Dependencies
└── LOCAL_TESTING_GUIDE.md        ← This file
```

---

## 🎯 What Happens During OAuth Flow

1. **User clicks "Continue with TikTok"**
   - JavaScript generates random `state` for CSRF protection
   - User is redirected to `https://www.tiktok.com/v2/auth/authorize/`

2. **TikTok prompts login/authorization**
   - User logs in (if not already)
   - User grants permissions

3. **TikTok redirects back to your function**
   - URL: `http://localhost:8888/.netlify/functions/tiktok_auth?code=xxx&state=xxx`
   - Your function receives the authorization code

4. **Your function exchanges code for token**
   - Function calls TikTok API: `https://open-api.tiktok.com/oauth/access_token/`
   - Sends: client_key, client_secret, code
   - Receives: access_token, open_id, refresh_token

5. **JavaScript handles the response**
   - Verifies state parameter matches
   - Stores tokens in localStorage
   - Shows success message with token details

---

## 🧪 Testing Checklist

Before deploying to production, verify locally:

- [ ] `.env` file created with your TikTok credentials
- [ ] Local redirect URI added to TikTok Developer Portal
- [ ] `TIKTOK_CLIENT_KEY` updated in `index.html`
- [ ] `npm run dev` starts without errors
- [ ] Can access `http://localhost:8888`
- [ ] "Continue with TikTok" button redirects to TikTok
- [ ] After TikTok login, redirected back to localhost
- [ ] Access token displayed on success page
- [ ] No errors in browser console
- [ ] No errors in terminal (Netlify Dev logs)

---

## 🔐 Security Notes for Local Testing

**Safe for local testing:**
- ✅ `ALLOWED_ORIGIN=*` in `.env`
- ✅ `http://` redirect URI for localhost
- ✅ Storing tokens in localStorage

**NOT safe for production:**
- ❌ Never use `ALLOWED_ORIGIN=*` in production
- ❌ Never use `http://` in production (HTTPS only)
- ❌ Never commit `.env` to git

---

## 🚀 After Local Testing Works

Once everything works locally:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add local testing page"
   git push origin main
   ```

2. **Deploy to Netlify** (see `QUICK_START.md`)

3. **Update TikTok redirect URIs** to include production URL:
   ```
   https://your-site.netlify.app/.netlify/functions/tiktok_auth
   ```

4. **Update environment variables** in Netlify Dashboard

5. **Update `index.html`** CONFIG for production:
   ```javascript
   const CONFIG = {
       TIKTOK_CLIENT_KEY: 'awxxxxxxxxx',
       OAUTH_PROXY_URL: 'https://your-site.netlify.app/.netlify/functions/tiktok_auth',
       REDIRECT_URI: 'https://your-site.netlify.app/.netlify/functions/tiktok_auth',
       SCOPE: 'user.info.basic'
   };
   ```

---

## 📞 Need Help?

Check the logs:

**Browser Console** (F12):
- See JavaScript errors
- Check network requests
- View localStorage values

**Terminal** (where `npm run dev` is running):
- See Netlify function logs
- Check for environment variable errors
- View TikTok API responses

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Click button → redirects to TikTok
2. ✅ Login with TikTok account
3. ✅ Redirects back to localhost
4. ✅ See "Authentication successful!" message
5. ✅ See your access_token and open_id displayed
6. ✅ No errors in console or terminal

---

**Happy Testing! 🎉**

Once local testing works, you're ready to deploy to production!

