const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Enable CORS for your GitHub Pages domain
  const headers = {
    'Access-Control-Allow-Origin': 'https://blue-tuna-tiktok.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  const path = event.path || '';
  
  // Route 1: Initiate OAuth flow
  if (event.httpMethod === 'GET' && path.includes('/oauth')) {
    try {
      // Generate CSRF state token
      const csrfState = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // TikTok OAuth URL with required parameters
      const params = new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY,
        scope: 'user.info.basic',
        response_type: 'code',
        redirect_uri: `${process.env.URL}/.netlify/functions/tiktok_auth`,
        state: csrfState,
      });

      const authUrl = `https://www.tiktok.com/v2/auth/authorize?${params.toString()}`;
      
      return {
        statusCode: 302,
        headers: {
          ...headers,
          'Location': authUrl,
          'Set-Cookie': `csrfState=${csrfState}; HttpOnly; Secure; SameSite=Strict; Max-Age=300`
        }
      };
      
    } catch (error) {
      console.error('OAuth initiation error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to initiate OAuth flow' })
      };
    }
  }

  // Route 2: Handle OAuth callback
  if (event.httpMethod === 'GET' && path.includes('/callback')) {
    const { code, state, error, error_description } = event.queryStringParameters || {};
    
    // Handle OAuth errors from TikTok
    if (error) {
      console.error('TikTok OAuth error:', error, error_description);
      const redirectUrl = new URL('https://blue-tuna-tiktok.netlify.app/');
      redirectUrl.searchParams.set('error', error);
      redirectUrl.searchParams.set('error_description', error_description || 'OAuth authorization failed');
      
      return {
        statusCode: 302,
        headers: { ...headers, 'Location': redirectUrl.toString() }
      };
    }

    if (!code || !state) {
      const redirectUrl = new URL('https://blue-tuna-tiktok.netlify.app/');
      redirectUrl.searchParams.set('error', 'missing_params');
      redirectUrl.searchParams.set('error_description', 'Missing authorization code or state parameter');
      
      return {
        statusCode: 302,
        headers: { ...headers, 'Location': redirectUrl.toString() }
      };
    }

    try {
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: process.env.TIKTOK_CLIENT_KEY,
          client_secret: process.env.TIKTOK_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.URL}/.netlify/functions/tiktok_auth`,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error('Token exchange failed:', tokenData);
        throw new Error(tokenData.error_description || `Token exchange failed: ${tokenResponse.status}`);
      }

      // Successful token exchange - redirect back to GitHub Pages
      const redirectUrl = new URL('https://blue-tuna-tiktok.netlify.app/');
      redirectUrl.searchParams.set('access_token', tokenData.access_token);
      redirectUrl.searchParams.set('open_id', tokenData.open_id);
      redirectUrl.searchParams.set('scope', tokenData.scope);
      redirectUrl.searchParams.set('expires_in', tokenData.expires_in.toString());
      
      // Include refresh token if provided
      if (tokenData.refresh_token) {
        redirectUrl.searchParams.set('refresh_token', tokenData.refresh_token);
      }

      return {
        statusCode: 302,
        headers: { ...headers, 'Location': redirectUrl.toString() }
      };

    } catch (error) {
      console.error('Token exchange error:', error);
      const redirectUrl = new URL('https://blue-tuna-tiktok.netlify.app/');
      redirectUrl.searchParams.set('error', 'token_exchange_failed');
      redirectUrl.searchParams.set('error_description', error.message);
      
      return {
        statusCode: 302,
        headers: { ...headers, 'Location': redirectUrl.toString() }
      };
    }
  }

  // Route not found
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Not found', path: event.path })
  };
};
