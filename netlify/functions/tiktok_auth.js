const axios = require('axios');

/**
 * TikTok OAuth Proxy - Netlify Function
 * Handles secure token exchange for TikTok Login Kit
 * Implements CSRF protection, CORS, and proper error handling
 */

exports.handler = async function(event, context) {
  // CORS Headers - Allow requests from your GitHub Pages site
  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Extract query parameters
  const { code, state } = event.queryStringParameters || {};

  // Validate required parameters
  if (!code) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing authorization code' })
    };
  }

  // CSRF Protection: Validate state parameter
  if (!state) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing state parameter - CSRF protection failed' })
    };
  }

  // Validate environment variables
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;

  if (!clientKey || !clientSecret || !redirectUri) {
    console.error('Missing required environment variables');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  // Prepare token exchange request
  // TikTok accepts both JSON and form-urlencoded, using JSON for clarity
  const tokenData = {
    client_key: clientKey,
    client_secret: clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri
  };

  try {
    // Exchange authorization code for access token
    const response = await axios.post(
      'https://open-api.tiktok.com/oauth/access_token/',
      tokenData,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    // Check if TikTok returned an error
    if (response.data.error || response.data.error_description) {
      console.error('TikTok API Error:', response.data);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: response.data.error || 'token_exchange_failed',
          error_description: response.data.error_description || 'Failed to exchange token'
        })
      };
    }

    // Return the token data along with the state for verification
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...response.data,
        state: state // Return state for frontend validation
      })
    };

  } catch (error) {
    console.error('Token exchange error:', error.message);
    
    // Handle different error types
    if (error.response) {
      // TikTok API returned an error response
      return {
        statusCode: error.response.status,
        headers,
        body: JSON.stringify({
          error: 'tiktok_api_error',
          error_description: error.response.data?.error_description || error.response.data?.message || 'TikTok API request failed',
          details: error.response.data
        })
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          error: 'service_unavailable',
          error_description: 'TikTok API is not responding'
        })
      };
    } else {
      // Something else went wrong
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'internal_error',
          error_description: 'An unexpected error occurred'
        })
      };
    }
  }
};
