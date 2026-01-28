const axios = require('axios');

async function stalkTikTok(username) {
  try {
    // Step 1: Get cfToken
    const { data: solver } = await axios.post(
      'https://fathurweb.qzz.io/api/solver/turnstile-min',
      new URLSearchParams({
        url: 'https://www.anonymous-viewer.com',
        siteKey: '0x4AAAAAABNbm8zfrpvm5sRD'
      }),
      { 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 30000
      }
    );
    
    if (!solver.status || !solver.result) {
      throw new Error('Gagal mendapatkan cfToken');
    }
    
    const cfToken = solver.result;
    
    // Step 2: Get TikTok data
    const { data } = await axios.get(
      `https://www.anonymous-viewer.com/api/tiktok/display?username=${username}`,
      {
        headers: {
          "accept": "*/*",
          "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
          "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
          "x-turnstile-token": cfToken,
          "referer": `https://www.anonymous-viewer.com/tiktok/${username}`
        },
        timeout: 30000
      }
    );
    
    return data;
  } catch (error) {
    console.error('Error in stalkTikTok:', error.message);
    throw error;
  }
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Gunakan method GET'
    });
  }
  
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ 
      error: 'Username is required',
      message: 'Silakan masukkan username TikTok'
    });
  }
  
  try {
    const result = await stalkTikTok(username);
    
    // Validate response
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid response from API');
    }
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Return user-friendly error
    return res.status(500).json({ 
      error: 'Failed to fetch data',
      message: error.message || 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
