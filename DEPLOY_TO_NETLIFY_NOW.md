# 🚀 Deploy to Netlify Now (Easier Option!)

Since TikTok requires HTTPS and local HTTPS setup is complex, **deploying to Netlify** is actually easier for testing!

Netlify provides **automatic HTTPS** and you can test in a real environment.

## Quick Deploy (10 Minutes)

### Step 1: Commit Your Code (1 min)

```bash
git add .
git commit -m "Add TikTok Login Kit implementation"
git push origin main
```

### Step 2: Deploy to Netlify (3 min)

**Option A: Netlify Dashboard (Recommended)**

1. Go to: https://app.netlify.com/
2. Click: **"Add new site"** → **"Import an existing project"**
3. Choose: **GitHub**
4. Select repository: **mytiktok-oauth-proxy**
5. Click: **"Deploy site"**
6. Wait ~1 minute for deployment

**Option B: Netlify CLI**

```bash
# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### Step 3: Note Your Netlify URL (30 sec)

After deployment, you'll get a URL like:
```
https://YOUR-SITE-NAME.netlify.app
```

**Copy this URL!**

### Step 4: Configure Environment Variables in Netlify (2 min)

1. In Netlify Dashboard → Your Site
2. Go to: **Site configuration** → **Environment variables**
3. Click: **Add a variable**

Add these 4 variables:

| Key | Value |
|-----|-------|
| `TIKTOK_CLIENT_KEY` | Your TikTok Client Key |
| `TIKTOK_CLIENT_SECRET` | Your TikTok Client Secret |
| `REDIRECT_URI` | `https://YOUR-SITE-NAME.netlify.app/.netlify/functions/tiktok_auth` |
| `ALLOWED_ORIGIN` | `https://YOUR-SITE-NAME.netlify.app` |

4. Click **Save**

### Step 5: Trigger Redeploy (1 min)

**Important!** Environment variables only take effect after redeployment.

1. Go to: **Deploys** tab
2. Click: **Trigger deploy** → **Deploy site**
3. Wait ~30 seconds

### Step 6: Update index.html for Production (2 min)

Edit `index.html` around line 150:

```javascript
const CONFIG = {
    TIKTOK_CLIENT_KEY: 'YOUR_TIKTOK_CLIENT_KEY', // Your actual client key
    OAUTH_PROXY_URL: 'https://YOUR-SITE-NAME.netlify.app/.netlify/functions/tiktok_auth',
    REDIRECT_URI: 'https://YOUR-SITE-NAME.netlify.app/.netlify/functions/tiktok_auth',
    SCOPE: 'user.info.basic'
};
```

**Commit and push:**
```bash
git add index.html
git commit -m "Update config for production"
git push origin main
```

Netlify auto-deploys on push!

### Step 7: Add to TikTok Developer Portal (1 min)

1. Go to: https://developers.tiktok.com/apps/
2. Your App → **Login Kit** → **Settings**
3. Add redirect URI (this will work now! ✅):
   ```
   https://YOUR-SITE-NAME.netlify.app/.netlify/functions/tiktok_auth
   ```
4. Click **Save**

### Step 8: Test! (30 sec)

Visit your Netlify site:
```
https://YOUR-SITE-NAME.netlify.app
```

Click **"Continue with TikTok"** and test the full OAuth flow!

---

## ✅ This is MUCH Easier Because:

- ✅ Automatic HTTPS (no ngrok needed)
- ✅ Static URL (doesn't change)
- ✅ Real production environment
- ✅ Auto-deploys on git push
- ✅ Free forever (Netlify free tier)
- ✅ Can test from any device

---

## 🐛 Troubleshooting

### "Invalid redirect_uri"
- Wait 30 seconds after saving in TikTok portal
- Ensure URL in portal matches EXACTLY (no trailing slash)
- Check you triggered a redeploy after adding env vars

### "Server configuration error"
- Verify all 4 environment variables are set in Netlify
- Check variable names match exactly (case-sensitive)
- Trigger a new deployment

### Still getting errors?
- Check Netlify function logs: Site → Functions → tiktok_auth
- Check browser console (F12) for errors

---

## 🎉 Recommended Approach

**Deploy to Netlify first**, test there, then if you really need local development, set up ngrok.

Most developers find it easier to just test on Netlify since it's:
- Faster to set up
- More reliable
- Real production environment
- Free!


