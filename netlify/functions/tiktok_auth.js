const axios = require('axios');

exports.handler = async function(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const code = event.queryStringParameters.code;
  if (!code) {
    return { statusCode: 400, body: 'Missing code' };
  }
  const data = {
    client_key: process.env.TIKTOK_CLIENT_KEY, // ENV
    client_secret: process.env.TIKTOK_CLIENT_SECRET, // ENV
    code,
    grant_type: 'authorization_code',
    redirect_uri: process.env.REDIRECT_URI, // ENV
  };
  try {
    const resp = await axios.post(
      'https://open-api.tiktok.com/oauth/access_token',
      data,
      { headers: { 'Content-Type': 'application/json' }, }
    );
    return {
      statusCode: 200,
      body: JSON.stringify(resp.data)
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err.response && err.response.data ? err.response.data : err.message)
    }
  }
};
